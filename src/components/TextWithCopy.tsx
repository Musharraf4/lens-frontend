
import React from 'react'
import { IoCopyOutline } from "react-icons/io5";
import { showToast } from "@/components/Toast";

interface TextWithCopyProps {
  text?: string;
  showText?: boolean;
  toastTitle?: string;
  toastDescription?: string;
}

const TextWithCopy = ({ text, showText = true, toastTitle, toastDescription }: TextWithCopyProps) => {


  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text || '');
      showToast({
        title: toastTitle || "Text Copied",
        description: toastDescription || "You can paste it wherever needed.",
        type: 'success',
      });
    } catch {
      console.error('Failed to copy text');
      showToast({
        title: 'Failed to copy text',
        description: 'Failed to copy text',
        type: 'error',
      });
    }
  };

  return (
    <div>
      {showText && <span className="text-sm text-neutral-500">{text}</span>}
      <button onClick={handleCopy} className='ml-2 text-neutral-500 hover:text-neutral-700 cursor-pointer'><IoCopyOutline /></button>
    </div>
  )
}

export default TextWithCopy