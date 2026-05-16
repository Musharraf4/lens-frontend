import React, { useState } from 'react';
import ChatBotHeader, { Step } from './ChatBotHeader';
import { Button } from '../ui/button';

const ChatBotHeaderDemo: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  // Define all steps
  const allSteps: Step[] = [
    { id: 1, name: 'General Setup' },
    { id: 2, name: 'Questionnaire' },
    { id: 3, name: 'Responses' },
    { id: 4, name: 'Finish' }
  ];

  // State to track current active step
  const [currentStep, setCurrentStep] = useState(1);

  // Update steps with active and completed states
  const stepsWithState = allSteps.map(step => ({
    ...step,
    isActive: step.id === currentStep,
    isCompleted: step.id < currentStep
  }));

  // Handle next step
  const handleNextStep = () => {
    if (currentStep < allSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle close
  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="border rounded-md shadow-sm">
      <ChatBotHeader
        title="Create New Bot"
        steps={stepsWithState}
        onClose={handleClose}
        currentStep={currentStep}
      />

      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Current Step: {allSteps[currentStep - 1].name}</h2>
        <p className="mb-4">This is a demo of the ChatBotHeader component showing different step states.</p>

        <div className="flex gap-4 mt-6">
          <Button
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            variant="outline"
          >
            Previous Step
          </Button>

          <Button
            onClick={handleNextStep}
            disabled={currentStep === allSteps.length}
          >
            Next Step
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBotHeaderDemo;
