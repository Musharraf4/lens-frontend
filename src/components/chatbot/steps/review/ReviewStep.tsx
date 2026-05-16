import React from 'react';
import { useChatbotBuilder } from '@/store/ChatbotBuilderContext';
import { StatusTag } from '@/components/StatusTag';
import QuestionDisplay from '../questionnaire/QuestionDisplay';
import { CiAt, CiPhone, CiUser } from 'react-icons/ci';

const ReviewStep: React.FC = () => {
    const { state } = useChatbotBuilder();
    const { userInfoInputs, topics, questions, followUpMessages } = state;

    return (
        <div className="flex flex-col h-full overflow-auto">
            <div className="p-4 sm:p-6">
                <h2 className="text-xl font-semibold">Review & Publish</h2>
                <p className="text-gray-600 mt-2">Verify your settings before publishing</p>

                {/* 1. General Section */}
                <div className="mt-8 bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                    <h3 className="text-lg font-medium mb-4">1. General</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Link to site */}
                        <div className="space-y-2">
                            <h4 className="text-sm text-gray-500">Link to site</h4>
                            {state.publishInfo.mainDomain && (
                                <StatusTag type="default">
                                    {state.publishInfo.mainDomain}
                                </StatusTag>
                            )}
                        </div>

                        {/* User Info Inputs */}
                        <div className="space-y-2">
                            <h4 className="text-sm text-gray-500">User Info Inputs</h4>
                            <div className="flex flex-wrap gap-3">
                                {userInfoInputs.collectEmail && (
                                    <StatusTag type="default">
                                        <CiAt className='h-5 w-5 text-blue-400' />     Email {userInfoInputs.emailRequired ? '- Required' : ''}
                                    </StatusTag>
                                )}
                                {userInfoInputs.collectName && (
                                    <StatusTag type="default">
                                        <CiUser className='h-5 w-5 text-blue-400' />    First & Last name
                                    </StatusTag>
                                )}
                                {userInfoInputs.collectPhone && (
                                    <StatusTag type="default">
                                        <CiPhone className='h-5 w-5 text-blue-400' />    Phone number
                                    </StatusTag>
                                )}
                                {userInfoInputs.collectCompany && (
                                    <StatusTag type="default">
                                        Company
                                    </StatusTag>
                                )}
                                {userInfoInputs.askPermission && (
                                    <StatusTag type="default">
                                        Ask permission
                                    </StatusTag>
                                )}
                                {!userInfoInputs.collectEmail && !userInfoInputs.collectName &&
                                    !userInfoInputs.collectPhone && !userInfoInputs.collectCompany && (
                                        <StatusTag type="default">
                                            No user info inputs selected
                                        </StatusTag>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Questionnaire Section */}
                <div className="mt-8 bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                    <h3 className="text-lg font-medium mb-4">2. Questionnaire</h3>

                    <QuestionDisplay topics={topics} questions={questions} />
                </div>

                {/* 3. Detailed Settings Section */}
                <div className="mt-8 bg-white rounded-lg p-4 sm:p-6 shadow-sm mb-6">
                    <h3 className="text-lg font-medium mb-4">3. Detailed Settings</h3>

                    <div className="">
                        {/* Follow-up Email */}
                        <div>
                            <h4 className="text-sm text-gray-500 mb-2">Follow-up Email</h4>
                            {followUpMessages.enableEmailFollowUp ? (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <p className="text-sm whitespace-pre-line">{followUpMessages.emailFollowUpMessage || 'No email message configured'}</p>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-500">Email follow-up is disabled</p>
                                </div>
                            )}
                        </div>

                        {/* Follow-up SMS */}
                        <div>
                            <h4 className="text-sm text-gray-500 mb-2">Follow-up SMS</h4>
                            {followUpMessages.enableSMSFollowUp ? (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <p className="text-sm whitespace-pre-line">{followUpMessages.smsFollowUpMessage || 'No SMS message configured'}</p>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-500">SMS follow-up is disabled</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewStep;