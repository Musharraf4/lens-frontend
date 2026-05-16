"use client";

import { useEffect } from "react";

export default function EmailVerifiedPage() {
    useEffect(() => {
        const timer = setTimeout(() => {
            //  Clear cookie here
            document.cookie = "access_token=; Max-Age=0; path=/;";

            //  Then redirect to login
            window.location.href = "/login";
        }, 3000); // wait 3s before redirect

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB] p-4">
            <div className="bg-white shadow-md rounded-lg px-6 py-10 text-center max-w-md w-full">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">
                    Email Verified
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-3">
                    Your email has been successfully verified. <br />
                    Redirecting you to login...
                </p>
            </div>
        </div>
    );
}
