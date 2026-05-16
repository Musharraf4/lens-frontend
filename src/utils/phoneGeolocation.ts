import { parsePhoneNumber, parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';

// Country code to country name mapping
const COUNTRY_NAMES: Record<string, string> = {
  'US': 'United States',
  'GB': 'United Kingdom',
  'CA': 'Canada',
  'PK': 'Pakistan',
  'DE': 'Germany',
  'FR': 'France',
  'IT': 'Italy',
  'ES': 'Spain',
  'NL': 'Netherlands',
  'BE': 'Belgium',
  'AT': 'Austria',
  'CH': 'Switzerland',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'PL': 'Poland',
  'IE': 'Ireland',
  'PT': 'Portugal',
  'GR': 'Greece',
  'CZ': 'Czech Republic',
  'HU': 'Hungary',
  'RO': 'Romania',
};

// Country center coordinates (approximate)
const COUNTRY_CENTERS: Record<string, [number, number]> = {
  'US': [39.8283, -98.5795], // Geographic center of USA
  'GB': [54.7024, -3.2766], // Geographic center of UK
  'CA': [56.1304, -106.3468], // Geographic center of Canada
  'PK': [30.3753, 69.3451], // Geographic center of Pakistan
  'DE': [51.1657, 10.4515], // Geographic center of Germany
  'FR': [46.2276, 2.2137], // Geographic center of France
  'IT': [41.8719, 12.5674], // Geographic center of Italy
  'ES': [40.4637, -3.7492], // Geographic center of Spain
  'NL': [52.1326, 5.2913], // Geographic center of Netherlands
  'BE': [50.5039, 4.4699], // Geographic center of Belgium
  'AT': [47.5162, 14.5501], // Geographic center of Austria
  'CH': [46.8182, 8.2275], // Geographic center of Switzerland
  'SE': [60.1282, 18.6435], // Geographic center of Sweden
  'NO': [60.4720, 8.4689], // Geographic center of Norway
  'DK': [56.2639, 9.5018], // Geographic center of Denmark
  'FI': [61.9241, 25.7482], // Geographic center of Finland
  'PL': [51.9194, 19.1451], // Geographic center of Poland
  'IE': [53.4129, -8.2439], // Geographic center of Ireland
  'PT': [39.3999, -8.2245], // Geographic center of Portugal
  'GR': [39.0742, 21.8243], // Geographic center of Greece
  'CZ': [49.8175, 15.4730], // Geographic center of Czech Republic
  'HU': [47.1625, 19.5033], // Geographic center of Hungary
  'RO': [45.9432, 24.9668], // Geographic center of Romania
};

export interface PhoneLocationResult {
  latitude: number;
  longitude: number;
  city: string | null;
  region: string | null;
  country: string;
  displayText: string;
}

/**
 * Fetch location from US/Canada area code using AreaGeode API (free)
 */
async function fetchAreaCodeLocation(areaCode: string): Promise<PhoneLocationResult | null> {
  try {
    const response = await fetch(`https://areageode.sancsoft.net/api/v1/areacode/${areaCode}`);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.latitude && data.longitude) {
      const city = data.city || null;
      const region = data.state || data.province || null;
      const country = data.country || 'United States';
      
      return {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        city,
        region,
        country,
        displayText: city && region 
          ? `${city}, ${region}, ${country}`
          : region 
          ? `${region}, ${country}`
          : country,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Area code geolocation failed:', error);
    return null;
  }
}

/**
 * Get country-level location for international numbers
 */
function getCountryLocation(countryCode: string): PhoneLocationResult | null {
  const countryName = COUNTRY_NAMES[countryCode];
  const coordinates = COUNTRY_CENTERS[countryCode];
  
  if (!countryName || !coordinates) {
    return null;
  }
  
  return {
    latitude: coordinates[0],
    longitude: coordinates[1],
    city: null,
    region: null,
    country: countryName,
    displayText: countryName,
  };
}

/**
 * Fetch location from phone number
 * Returns null if phone number cannot be parsed or location cannot be determined
 */
export async function fetchLocationFromPhone(phoneNumber: string): Promise<PhoneLocationResult | null> {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return null;
  }

  try {
    // Parse phone number - try multiple approaches
    let phone;
    
    // First, try parsing as-is
    try {
      phone = parsePhoneNumber(phoneNumber);
    } catch (error: any) {
      // If parsing fails with INVALID_COUNTRY, try parsing with common default countries
      if (error?.message?.includes('INVALID_COUNTRY') || error?.name === 'ParseError') {
        // Try common countries as defaults
        const defaultCountries: CountryCode[] = ['US', 'GB', 'CA', 'PK', 'DE', 'FR'];
        
        for (const defaultCountry of defaultCountries) {
          try {
            phone = parsePhoneNumberFromString(phoneNumber, defaultCountry);
            if (phone && phone.isValid()) {
              break;
            }
          } catch {
            // Continue to next country
            continue;
          }
        }
        
        // If still no valid phone, return null
        if (!phone || !phone.isValid()) {
          return null;
        }
      } else {
        // Re-throw unexpected errors
        throw error;
      }
    }
    
    if (!phone || !phone.isValid()) {
      return null;
    }

    const countryCode = phone.country as string;
    
    if (!countryCode) {
      return null;
    }
    
    // For US and Canada, try to get area code location
    if (countryCode === 'US' || countryCode === 'CA') {
      const nationalNumber = phone.nationalNumber;
      // Extract area code (first 3 digits for US/CA)
      const areaCode = nationalNumber.substring(0, 3);
      
      if (areaCode && areaCode.length === 3) {
        const areaCodeLocation = await fetchAreaCodeLocation(areaCode);
        if (areaCodeLocation) {
          return areaCodeLocation;
        }
      }
      
      // Fallback to country center if area code lookup fails
      return getCountryLocation(countryCode);
    }
    
    // For other supported countries, return country-level location
    const supportedCountries = ['GB', 'PK', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'PL', 'IE', 'PT', 'GR', 'CZ', 'HU', 'RO'];
    
    if (supportedCountries.includes(countryCode)) {
      return getCountryLocation(countryCode);
    }
    
    // Country not supported
    return null;
  } catch (error: any) {
    // Silently handle parsing errors - don't log to console for invalid numbers
    // Only log unexpected errors
    if (error?.name !== 'ParseError' && !error?.message?.includes('INVALID_COUNTRY')) {
      console.error('Phone number parsing failed:', error);
    }
    return null;
  }
}

