import React from 'react';

function ContactEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center text-center bg-white mt-30 overflow-hidden" >
            {/* Background circular pattern (optional if applicable) */}
            <img src="/rectangles.svg" alt="" className="absolute object-cover z-0 ml-4 pointer-events-none" />

            {/* Content on top of background */}
            <div className="relative z-10 flex flex-col items-center">
                <img src="/Clock-arrow.svg" alt="No Contacts Found" className="h-10 mb-4" />
                <p className="font-semibold text-lg text-gray-900 mb-1">
                    There’s nothing here yet
                </p>
                <p className="text-sm text-gray-500">
                    Contact haven’t had any interactions yet.
                </p>
            </div>
        </div>
    );
}

export default ContactEmptyState;
