"use client";

import { Copy } from "lucide-react";
import React from "react";
import { showToast } from "../Toast";

export const CopyToClipboard = ({ text = "" }: { text?: string }) => {
  return (
    <Copy
      className="w-4 h-4 cursor-pointer text-gray-400 hover:text-gray-600 flex-shrink-0"
      onClick={() => {
        navigator.clipboard.writeText(text);
        showToast({
          title: "The link has been copied to your clipboard",
          description: "You can paste it wherever needed.",
          type: "success",
        });
      }}
    />
  );
};
