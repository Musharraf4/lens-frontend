import React from "react";
import { FaCheck } from "react-icons/fa";

export const BulletPoint = ({ text }: { text: string }) => (
  <div className="flex items-center">
    <span className="inline-flex items-center justify-center w-4 h-4 mr-2 mt-px bg-green-500 rounded-full flex-shrink-0">
      <FaCheck className="text-white text-[10px]" />
    </span>
    <p className="text-black">{text}</p>
  </div>
);
