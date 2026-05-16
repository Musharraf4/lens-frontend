import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';

export interface Step {
  id: number;
  name: string;
  isActive?: boolean;
  isCompleted?: boolean;
}

export interface ChatBotHeaderProps {
  title: string;
  steps: Step[];
  currentStep: number;
  onClose?: () => void;
  className?: string;
}

const ChatBotHeader: React.FC<ChatBotHeaderProps> = ({
  title,
  steps,
  currentStep,
  onClose,
  className = '',
}) => {
  const getIconForStep = (title: string) => {
    if (title === 'Chatbot Appearance') {
      return '/preview-icon.svg';
    } else {
      return 'message-icon.svg';
    }
  }
  const getIconTitle = (title: string) => {
    if (title === 'Chatbot Appearance') {
      return 'Appearance Set up';
    } else {
      return 'Chat Set up';
    }
  }
  return (
    <header className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 gap-3 sm:gap-0 ${className}`}>
      <div className="flex items-center gap-2">
        {/* Title */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-neutral-500 flex-shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        )}
        <h1 className="text-lg font-medium text-black truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
        {/* Step Tracker */}
        <div className="flex items-center bg-white p-2 sm:p-3 rounded-md">
          <div className='flex items-center font-medium text-sm text-gray-700 mr-4 flex-shrink-0'>
            <img src={getIconForStep(title)} />
            {getIconTitle(title)}
          </div>
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Step Item */}
              <div
                className={`flex items-center flex-shrink-0 ${index === 0 ? 'ml-0' : 'ml-1 sm:ml-2'}`}
              >
                {/* Step Number with Circle */}
                <div
                  className={`
                    flex items-center justify-center ${step.isCompleted ? 'w-6 sm:w-8' : ''} h-6 sm:h-8 rounded-full 
                    ${currentStep === step.id ? 'bg-navy-700 text-white' :
                      step.isCompleted ? 'bg-green-500 text-white' : 'text-black'}
                    font-medium text-xs sm:text-sm
                  `}
                >
                  {step.isCompleted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="sm:w-4 sm:h-4"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>

                {/* Step Name */}
                {currentStep === step.id && (
                  <Button variant="default" className="rounded-full text-xs sm:text-sm px-2 sm:px-3 py-1 h-auto sm:h-8 whitespace-nowrap">
                    <span className="hidden sm:inline">{step.id}. </span>{step.name}
                  </Button>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Close Button */}

      </div>
    </header>
  );
};

export default ChatBotHeader;
