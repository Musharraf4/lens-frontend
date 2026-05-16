// QuestionnaireStep.tsx
"use client";

import React, { useEffect, useState } from "react";
import FirstLastMessageContent, {
    FirstLastMessageStatusTag,
} from "./FirstLastMessageContent";
import CreateTopicsContent, {
    CreateTopicsStatusTag,
} from "./CreateTopicsContent";
import AddQuestionsContent from "./AddQuestionsContent";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useChatbotBuilder } from "@/store/ChatbotBuilderContext";
import { defaultQuestions } from "@/services/chatbot.api";
import { IoCheckmarkCircle } from "react-icons/io5";

export interface QuestionnaireStepProps {
    onNext?: () => void;
    onClose?: () => void;
    isEditMode?: boolean;
}

const QuestionnaireStep: React.FC<QuestionnaireStepProps> = ({
    onNext,
    onClose,
    isEditMode,
}) => {
    const [accordionStates, setAccordionStates] = useState<
        Record<string, boolean>
    >({
        "first-last-message": true,
        "create-topics": false,
        "add-questions": false,
    });
    const [openAccordionId, setOpenAccordionId] = useState<string | undefined>(
        "first-last-message"
    );
    const { state, setQuestions, isDefaultTemplate, setIsDefaultTemplate } = useChatbotBuilder();

    // Ensure default questions are populated immediately when template is enabled,
    // even if the Add Questions accordion hasn't been opened/mounted yet.
    useEffect(() => {
        if (isDefaultTemplate && state.questions.length === 0) {
            setQuestions(
                defaultQuestions.map((q) => ({
                    ...q,
                    // cast to the union type expected by Question in builder context
                    answerType: q.answerType as any,
                }))
            );
        } else if (!isDefaultTemplate && state.questions.length === 0) {
            setQuestions([]);
        }
    }, [isDefaultTemplate, state.questions.length, setQuestions]);

    const handleValueChange = (value: string | undefined) => {
        setOpenAccordionId(value);
        setAccordionStates((prev) => {
            const newState = { ...prev };
            Object.keys(newState).forEach((key) => {
                newState[key] = key === value;
            });
            return newState;
        });
    };
    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 p-6 overflow-auto">
                <div className="mx-auto space-y-6">
                    <Accordion
                        type="single"
                        collapsible
                        value={openAccordionId}
                        onValueChange={handleValueChange}
                        className="w-full"
                    >
                        <AccordionItem
                            value="first-last-message"
                            className="border-0 bg-white rounded-lg shadow-sm mb-4"
                        >
                            <AccordionTrigger className="px-4 py-3 text-base font-medium">
                                <div className="flex items-center gap-2.5 flex-1">
                                    {!accordionStates["first-last-message"] &&
                                        (state.firstLastMessages.firstMessage ||
                                            state.firstLastMessages.lastMessage) ? (
                                        <IoCheckmarkCircle className="w-6 h-6" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full items-center bg-gray-100 text-gray-500">
                                            1
                                        </div>
                                    )}
                                    <span>First & Last Message</span>
                                    {!accordionStates["first-last-message"] && (
                                        <div>
                                            <FirstLastMessageStatusTag />
                                        </div>
                                    )}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4">
                                <FirstLastMessageContent />
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem
                            value="create-topics"
                            className="border-0 bg-white rounded-lg shadow-sm mb-4"
                        >
                            <AccordionTrigger className="px-4 py-3 text-base font-medium">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2.5">
                                        {!accordionStates["create-topics"] && state.topics.length > 0 ? (
                                            <IoCheckmarkCircle className="w-6 h-6" />
                                        ) : (

                                            <div className="w-6 h-6 rounded-full items-center bg-gray-100 text-gray-500">
                                                2
                                            </div>
                                        )}
                                        <span>Create Topics</span>
                                    </div>
                                    {!accordionStates["create-topics"] && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <CreateTopicsStatusTag />
                                        </div>
                                    )}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4">
                                <CreateTopicsContent
                                    setIsDefaultTemplate={setIsDefaultTemplate}
                                    isDefaultTemplate={isDefaultTemplate}
                                />
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem
                            value="add-questions"
                            className="border-0 bg-white rounded-lg shadow-sm mb-4"
                        >
                            <AccordionTrigger className="px-4 py-3 text-base font-medium">
                                <div className="flex items-center gap-2.5 flex-1">
                                    {!accordionStates["add-questions"] && state.questions?.length > 0 ? (
                                        <IoCheckmarkCircle className="w-6 h-6" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full items-center bg-gray-100 text-gray-500">
                                            3
                                        </div>
                                    )}
                                    <span>Add Questions</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4">
                                <AddQuestionsContent isDefaultTemplate={isDefaultTemplate} isEditMode={isEditMode} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </div>
    );
};

export default QuestionnaireStep;
