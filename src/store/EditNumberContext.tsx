import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define the context type
interface EditNumberContextType {
    currentStep: number;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    selectedNumberType: string;
    setSelectedNumberType: React.Dispatch<React.SetStateAction<string>>;
    selectedTrafficSource: string[];
    setSelectedTrafficSource: React.Dispatch<React.SetStateAction<string[]>>;
    phoneNumber: string;
    setPhoneNumber: React.Dispatch<React.SetStateAction<string>>;
    numberSpecification: string;
    setNumberSpecification: React.Dispatch<React.SetStateAction<string>>;
    areaCode: string;
    setAreaCode: React.Dispatch<React.SetStateAction<string>>;
    selectedGeneratedNumber: string;
    setSelectedGeneratedNumber: React.Dispatch<React.SetStateAction<string>>;
    numberName: string;
    setNumberName: React.Dispatch<React.SetStateAction<string>>;
    callRecordingEnabled: boolean;
    setCallRecordingEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    callRecordingMessage: string;
    setCallRecordingMessage: React.Dispatch<React.SetStateAction<string>>;
    callGreetingEnabled: boolean;
    setCallGreetingEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    callGreetingMessage: string;
    setCallGreetingMessage: React.Dispatch<React.SetStateAction<string>>;
    whisperMessageEnabled: boolean;
    setWhisperMessageEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    whisperMessage: string;
    setWhisperMessage: React.Dispatch<React.SetStateAction<string>>;
    excludedTrafficTypes: string[];
    setExcludedTrafficTypes: React.Dispatch<React.SetStateAction<string[]>>;
    dailyVisitors: number;
    setDailyVisitors: React.Dispatch<React.SetStateAction<number>>;
    trackingNumbers: number;
    setTrackingNumbers: React.Dispatch<React.SetStateAction<number>>;
    areaCodeError: boolean;
    setAreaCodeError: React.Dispatch<React.SetStateAction<boolean>>;
    areaCodeAlternatives: string[];
    setAreaCodeAlternatives: React.Dispatch<React.SetStateAction<string[]>>;
    selectedNumbers: string[];
    setSelectedNumbers: React.Dispatch<React.SetStateAction<string[]>>;
    swapNumber: string;
    setSwapNumber: React.Dispatch<React.SetStateAction<string>>;
    isLoading: boolean;
    selectedNumberId: string | null;
    setSelectedNumberId: React.Dispatch<React.SetStateAction<string | null>>;
}

const EditNumberContext = createContext<EditNumberContextType | undefined>(undefined);

export const EditNumberProvider = ({ children, initialType, initialNumberId }: { children: ReactNode, initialType?: string, initialNumberId?: string }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedNumberType, setSelectedNumberType] = useState(initialType || '');
    const [selectedTrafficSource, setSelectedTrafficSource] = useState<string[]>([]);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [numberSpecification, setNumberSpecification] = useState('area-code');
    const [areaCode, setAreaCode] = useState('');
    const [selectedGeneratedNumber, setSelectedGeneratedNumber] = useState('');
    const [numberName, setNumberName] = useState('');
    const [callRecordingEnabled, setCallRecordingEnabled] = useState(false);
    const [callRecordingMessage, setCallRecordingMessage] = useState('This call will be recorded for quality assurance.');
    const [callGreetingEnabled, setCallGreetingEnabled] = useState(false);
    const [callGreetingMessage, setCallGreetingMessage] = useState('Hello, my name is Andrea');
    const [whisperMessageEnabled, setWhisperMessageEnabled] = useState(false);
    const [whisperMessage, setWhisperMessage] = useState('Message');
    const [excludedTrafficTypes, setExcludedTrafficTypes] = useState<string[]>([]);
    const [dailyVisitors, setDailyVisitors] = useState(0);
    const [trackingNumbers, setTrackingNumbers] = useState(0);
    const [areaCodeError, setAreaCodeError] = useState(false);
    const [areaCodeAlternatives, setAreaCodeAlternatives] = useState(["800", "320", "908"]);
    const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
    const [swapNumber, setSwapNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedNumberId, setSelectedNumberId] = useState<string | null>(initialNumberId || null);

    useEffect(() => {
        if (initialType) setSelectedNumberType(initialType);
        if (initialNumberId) setSelectedNumberId(initialNumberId);
    }, [initialType, initialNumberId]);

    return (
        <EditNumberContext.Provider
            value={{
                currentStep,
                setCurrentStep,
                selectedNumberType,
                setSelectedNumberType,
                selectedTrafficSource,
                setSelectedTrafficSource,
                phoneNumber,
                setPhoneNumber,
                numberSpecification,
                setNumberSpecification,
                areaCode,
                setAreaCode,
                selectedGeneratedNumber,
                setSelectedGeneratedNumber,
                numberName,
                setNumberName,
                callRecordingEnabled,
                setCallRecordingEnabled,
                callRecordingMessage,
                setCallRecordingMessage,
                callGreetingEnabled,
                setCallGreetingEnabled,
                callGreetingMessage,
                setCallGreetingMessage,
                whisperMessageEnabled,
                setWhisperMessageEnabled,
                whisperMessage,
                setWhisperMessage,
                excludedTrafficTypes,
                setExcludedTrafficTypes,
                dailyVisitors,
                setDailyVisitors,
                trackingNumbers,
                setTrackingNumbers,
                areaCodeError,
                setAreaCodeError,
                areaCodeAlternatives,
                setAreaCodeAlternatives,
                selectedNumbers,
                setSelectedNumbers,
                swapNumber,
                setSwapNumber,
                isLoading,
                selectedNumberId,
                setSelectedNumberId,
            }}
        >
            {children}
        </EditNumberContext.Provider>
    );
};

export const useEditNumberContext = () => {
    const context = useContext(EditNumberContext);
    if (!context) {
        throw new Error('useEditNumberContext must be used within an EditNumberProvider');
    }
    return context;
}; 