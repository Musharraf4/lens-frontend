import React from 'react';

interface LoadingOverlayProps {
    isLoading: boolean;
    message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    isLoading,
    message = "Creating your chatbot..."
}) => {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-8 shadow-xl max-w-sm w-full mx-4">
                <div className="flex flex-col items-center space-y-4">
                    {/* Spinner */}
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin"></div>
                        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>

                    {/* Message */}
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Please wait</h3>
                        <p className="text-sm text-gray-600">{message}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingOverlay;
