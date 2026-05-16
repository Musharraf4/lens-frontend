import React, { useEffect, useState } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    Circle,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { IoLocationOutline } from 'react-icons/io5';
import { fetchLocationFromPhone } from '@/utils/phoneGeolocation';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const DEFAULT_RADIUS = 500;

interface UserLocationMapProps {
    sessionIPAddress: string;
    phone?: string;
}

const UserLocationMap: React.FC<UserLocationMapProps> = ({ sessionIPAddress, phone }) => {
    const [location, setLocation] = useState<[number, number] | null>(null);
    const [cityState, setCityState] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Reset state when props change
        setLocation(null);
        setCityState(null);
        setIsLoading(false);

        // Priority 1: Use sessionIPAddress (IP-based location - no user permission needed)
        if (sessionIPAddress) {
            setIsLoading(true);

            const fetchIPLocation = async () => {
                try {
                    const res = await fetch(`https://ipinfo.io/${sessionIPAddress ? sessionIPAddress : ''}/json?token=`);
                    const data = await res.json();
                    if (data.loc) {
                        const [latStr, lonStr] = data.loc.split(',');
                        setLocation([parseFloat(latStr), parseFloat(lonStr)]);
                        if (data?.region) {
                            setCityState(`${data?.city}, ${data?.region}, ${data?.country}`);
                        }
                    }
                    setIsLoading(false);
                } catch (error) {
                    console.error('IP info fetch failed:', error);
                    setIsLoading(false);
                    // If IP fails, try phone as fallback
                    if (phone) {
                        fetchPhoneLocation();
                    }
                }
            };

            fetchIPLocation();
        }
        // Priority 2: Fallback to phone number if no sessionIPAddress
        else if (phone) {
            setIsLoading(true);
            fetchPhoneLocation();
        }

        async function fetchPhoneLocation() {
            try {
                const phoneLocation = await fetchLocationFromPhone(phone!);
                if (phoneLocation) {
                    setLocation([phoneLocation.latitude, phoneLocation.longitude]);
                    setCityState(phoneLocation.displayText);
                }
            } catch (error) {
                console.error('Phone geolocation failed:', error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [sessionIPAddress, phone]);

    // Don't render if no location found
    if (!location && !isLoading) {
        return null;
    }

    // Show loading state (optional - you can remove this if you prefer nothing)
    if (isLoading) {
        return (
            <div className="mb-4">
                <div className="flex items-center gap-2 text-neutral-600">
                    <IoLocationOutline className='w-5 h-5' />
                    <span>Loading location...</span>
                </div>
            </div>
        );
    }

    // Type guard: location should never be null here, but TypeScript needs assurance
    if (!location) {
        return null;
    }

    return (
        <>
            <div className='mb-4'>
                <div className="flex items-center gap-2 text-neutral-600">
                    <IoLocationOutline className='w-5 h-5' />
                    <span>{cityState || 'Location'}</span>
                </div>
            </div>
            <div style={{ height: '180px', width: '100%', borderRadius: '16px', overflow: 'hidden' }}>
                <MapContainer
                    center={location}
                    zoom={13}
                    scrollWheelZoom={false}
                    zoomControl={false}
                    attributionControl={false}
                    style={{ height: '180px', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Circle
                        center={location}
                        radius={DEFAULT_RADIUS}
                        pathOptions={{
                            fillColor: '#000',
                            color: '#000',
                            fillOpacity: 0.2,
                            opacity: 0.4,
                        }}
                    />
                </MapContainer>
            </div>
        </>
    );
};

export default UserLocationMap;
