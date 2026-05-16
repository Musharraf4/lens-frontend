import React from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';

interface DeviceSelectorProps {
    selectedDevice: 'web' | 'tablet' | 'mobile';
    onDeviceChange: (device: 'web' | 'tablet' | 'mobile') => void;
}

const DeviceSelector: React.FC<DeviceSelectorProps> = ({ selectedDevice, onDeviceChange }) => {
    const devices = [
        { id: 'web', label: 'Web', icon: Monitor },
        { id: 'tablet', label: 'Tablet', icon: Tablet },
        { id: 'mobile', label: 'Mobile', icon: Smartphone },
    ] as const;

    return (
        <div className="flex items-center bg-white rounded-4xl border border-gray-200 p-1 shadow-sm">
            {devices.map((device) => {
                const Icon = device.icon;
                const isSelected = selectedDevice === device.id;

                return (
                    <button
                        key={device.id}
                        onClick={() => onDeviceChange(device.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-4xl text-sm font-medium transition-all duration-200 ${isSelected
                            ? 'bg-gray-100 text-gray-800 border border-gray-300 rounded-4xl'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <Icon size={16} />
                        <span>{device.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default DeviceSelector;
