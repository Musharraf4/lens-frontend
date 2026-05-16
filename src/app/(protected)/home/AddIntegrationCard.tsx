import { Button } from "@/components/ui/button";
import Link from "next/link";

export const AddIntegrationCard = () => {
  return (
    <div className="relative w-full bg-white p-6 rounded-3xl h-96">
      {/* Background Image */}
      <img
        src="/assets/add-integration-bg.jpg"
        className="w-full h-full object-cover blur-sm"
        alt="background"
      />

      {/* Overlay UI */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="p-6 flex flex-col items-center text-center max-w-sm py-6">
          {/* Integration Icons */}
          <div className="flex space-x-9 -mb-3 z-20">
            <div className="bg-white rounded-2xl border border-neutral-50 flex justify-center items-center p-3">
              <img
                src="/GoogleAdsIcon.svg"
                alt="Google Ads"
                className="h-8 w-8"
              />
            </div>
            <div className="bg-white rounded-2xl border border-neutral-50 flex justify-center items-center p-3">
              <img
                src="/GoogleIcon.svg"
                alt="Google"
                className="h-8 w-8"
              />
            </div>
            <div className="bg-white rounded-2xl border border-neutral-50 flex justify-center items-center p-3">
              <img
                src="/GoogleBusinessIcon.svg"
                alt="Google Store"
                className="h-8 w-8"
              />
            </div>
          </div>

          <div className="flex space-x-5">
            <div>
              <img
                src="/left-line.svg"
                alt="left-line"
              />
            </div>
            <div>
              <img
                src="/mid-line.svg"
                alt="mid-line"
              />
            </div>
            <div>
              <img
                src="/right-line.svg"
                alt="right-line"
              />
            </div>
          </div>

          <div className="bg-white rounded-full border border-neutral-50 p-2 absolute bottom-43">
            <img
              src="/Link.svg"
              alt="link-icon"
              className="h-8 w-8"
            />
          </div>
          <div className="absolute " style={{
            top: '40px',
            marginLeft: '18px'
          }}>
            <img src="/rectangles.svg" alt="" className="object-cover z-0 pointer-events-none" />

          </div>
          {/* Title */}
          <div className="pt-6 z-[1000]">
            <p className="font-semibold mb-1 text-black">Integrations not connected</p>
            <p className="text-black/60 text-sm mb-4">
              Connect services to unlock full analytics data
            </p>

            {/* Button */}
            <Link href={"/integrations"}>
              <Button className="rounded-full">Go to Integrations</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
