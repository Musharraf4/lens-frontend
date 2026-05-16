import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MessageSquare, Plus, PencilLine, Trash, GripVertical } from 'lucide-react';
import { useChatbotBuilder, Question, AnswerType } from '@/store/ChatbotBuilderContext';
import { StatusTag } from '@/components/StatusTag';
import { defaultQuestions } from '@/services/chatbot.api';
import { PiRadioButtonLight } from 'react-icons/pi';
import { IoIosCheckboxOutline } from 'react-icons/io';

interface AnswerOption {
    id: string;
    text: string;
}
interface AddQuestionsContentProps {
    isDefaultTemplate: boolean;
    isEditMode?: boolean;
}

const AddQuestionsContent: React.FC<AddQuestionsContentProps> = ({ isDefaultTemplate, isEditMode }) => {
    const { state, setQuestions } = useChatbotBuilder();
    console.log("state.questions", state.questions)
    const [selectedTopicId, setSelectedTopicId] = useState<string>('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingQuestionId, setEditingQuestionId] = useState<string>('');
    const [draggedQuestion, setDraggedQuestion] = useState<string | null>(null);

    // Form state
    const [questionText, setQuestionText] = useState('');
    const [answerType, setAnswerType] = useState<AnswerType>('radio');
    const [answerOptions, setAnswerOptions] = useState<AnswerOption[]>([{ id: '1', text: '' }]);

    // Set the first topic as selected by default
    useEffect(() => {
        if (state.topics.length > 0 && !selectedTopicId) {
            setSelectedTopicId(state.topics[0].id);
        }
    }, [state.topics, selectedTopicId]);
    useEffect(() => {
        if (isDefaultTemplate) {
            // Only seed defaults if questions are currently empty to avoid overriding
            if (!isEditMode && state.questions.length === 0) {
                // Ensure defaultQuestions' answerType matches the AnswerType union expected by Question
                setQuestions(defaultQuestions.map(q => ({
                    ...q,
                    answerType: q.answerType as AnswerType
                })));
            }
            if (isEditMode) {
                setQuestions(defaultQuestions.map(q => ({
                    ...q,
                    answerType: q.answerType as AnswerType
                })));
            }
        } else {
            // Only clear questions if there are no existing questions (preserve in edit mode)
            if (!isEditMode && state.questions.length === 0) {
                setQuestions([]);
            }
            // Otherwise, preserve existing questions in edit mode
        }
    }, [isDefaultTemplate, state.questions.length, setQuestions]);

    // Get questions for the selected topic
    const topicQuestions = state.questions
        .filter(q => q.topicId === selectedTopicId)
        .sort((a, b) => a.position - b.position);

    // Get the selected topic
    const selectedTopic = state.topics.find(t => t.id === selectedTopicId);

    // Handle adding a new question
    const handleAddQuestion = () => {
        setQuestionText('');
        setAnswerType('radio');
        setAnswerOptions([{ id: '1', text: '' }]);
        setIsAddModalOpen(true);
    };

    // Handle editing a question
    const handleEditQuestion = (questionId: string) => {
        const question = state.questions.find(q => q.id === questionId);
        if (question) {
            setQuestionText(question.text);
            setAnswerType(question.answerType);
            setAnswerOptions(question.answers.length > 0 ? question.answers : [{ id: '1', text: '' }]);
            setEditingQuestionId(questionId);
            setIsEditModalOpen(true);
        }
    };

    // Handle saving a question
    const handleSaveQuestion = () => {
        if (!questionText.trim()) return;

        const newQuestion: Question = {
            id: Date.now().toString(),
            topicId: selectedTopicId,
            text: questionText,
            answerType,
            position: topicQuestions.length,
            answers: answerType === 'text' || answerType === 'date'
                ? []
                : answerOptions.filter(a => a.text.trim() !== '')
        };

        setQuestions([...state.questions, newQuestion]);
        setIsAddModalOpen(false);
    };

    // Handle updating a question
    const handleUpdateQuestion = () => {
        if (!questionText.trim()) return;

        const updatedQuestions = state.questions.map(q => {
            if (q.id === editingQuestionId) {
                return {
                    ...q,
                    text: questionText,
                    answerType,
                    answers: answerType === 'text' || answerType === 'date'
                        ? []
                        : answerOptions.filter(a => a.text.trim() !== '')
                };
            }
            return q;
        });

        setQuestions(updatedQuestions);
        setIsEditModalOpen(false);
    };

    // Handle deleting a question
    const handleDeleteQuestion = (questionId: string) => {
        const newQuestions = state.questions.filter(q => q.id !== questionId);
        // Update positions
        const updatedQuestions = newQuestions.map((q, index) => {
            if (q.topicId === selectedTopicId) {
                return { ...q, position: index };
            }
            return q;
        });

        setQuestions(updatedQuestions);
    };

    // Drag and drop handlers
    const handleDragStart = (id: string) => {
        setDraggedQuestion(id);
    };

    const handleDragEnd = () => {
        setDraggedQuestion(null);
    };

    const moveQuestion = (fromIndex: number, toIndex: number) => {
        const topicQuestions = state.questions
            .filter(q => q.topicId === selectedTopicId)
            .sort((a, b) => a.position - b.position);

        const reorderedQuestions = [...topicQuestions];
        const [movedQuestion] = reorderedQuestions.splice(fromIndex, 1);
        reorderedQuestions.splice(toIndex, 0, movedQuestion);

        // Update positions for reordered questions
        const updatedTopicQuestions = reorderedQuestions.map((q, index) => ({
            ...q,
            position: index
        }));

        // Update all questions: keep questions from other topics, update reordered ones
        const otherQuestions = state.questions.filter(q => q.topicId !== selectedTopicId);
        setQuestions([...otherQuestions, ...updatedTopicQuestions]);
    };

    // Handle adding an answer option
    const handleAddAnswerOption = () => {
        setAnswerOptions([...answerOptions, { id: Date.now().toString(), text: '' }]);
    };

    // Handle updating an answer option
    const handleUpdateAnswerOption = (id: string, text: string) => {
        const updatedOptions = answerOptions.map(option => {
            if (option.id === id) {
                return { ...option, text };
            }
            return option;
        });
        setAnswerOptions(updatedOptions);
    };

    // Handle removing an answer option
    const handleRemoveAnswerOption = (id: string) => {
        if (answerOptions.length <= 1) return;
        setAnswerOptions(answerOptions.filter(option => option.id !== id));
    };

    // Get answer type display name
    const getAnswerTypeDisplay = (type: AnswerType): string => {
        switch (type) {
            case 'radio': return 'Radio button';
            case 'checkbox': return 'Checkbox';
            case 'text': return 'Text field';
            case 'dropdown': return 'Dropdown';
            case 'date': return 'Date';
            default: return type;
        }
    };

    // Render answer options based on type
    const renderAnswerOptions = () => {
        if (answerType === 'text' || answerType === 'date') {
            return null;
        }

        return (
            <div className="space-y-4 mt-4">
                <Label>Answers</Label>
                {answerOptions.map((option, index) => (
                    <div key={option.id} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {answerType === 'radio' && <div className="w-4 h-4 rounded-full border border-gray-300"></div>}
                            {answerType === 'checkbox' && <div className="w-4 h-4 rounded-sm border border-gray-300"></div>}
                            {answerType === 'dropdown' && <div className="text-xs text-gray-500">{index + 1}.</div>}
                        </div>
                        <div className="flex-1 w-full sm:w-auto">
                            <Input
                                value={option.text}
                                onChange={(e) => handleUpdateAnswerOption(option.id, e.target.value)}
                                placeholder={`Enter answer`}
                                className="w-full"
                            />
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveAnswerOption(option.id)}
                            disabled={answerOptions.length <= 1}
                            className="flex-shrink-0"
                        >
                            <Trash className="h-4 w-4 text-gray-500" />
                        </Button>
                    </div>
                ))}
                <Button
                    variant="outline"
                    className="border-none shadow-none px-3 py-1 text-[16px] font-medium text-neutral-500"
                    onClick={handleAddAnswerOption}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Answer
                </Button>
            </div>
        );
    };

    return (
        <div className="flex flex-col md:flex-row h-full gap-4">
            {/* Left sidebar - Topics */}
            <div className="w-full md:w-1/3 bg-neutral-25 p-4 rounded-lg overflow-auto mb-4 md:mb-0">
                <h3 className="font-medium mb-4">Topics</h3>
                <div className="space-y-2">
                    {state.topics.map((topic, index) => (
                        <div
                            key={topic.id}
                            className={`p-3 cursor-pointer ${selectedTopicId === topic.id ? 'border border-neutral-100 rounded-full' : 'hover:bg-gray-100'}`}
                            onClick={() => setSelectedTopicId(topic.id)}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium truncate mr-2">{index + 1}. {topic.name || 'Unnamed Topic'}</span>
                                <span className="text-xs bg-gray-200 px-2 py-1 rounded-full flex-shrink-0">{state.questions.filter(q => q.topicId === topic.id).length}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right content - Questions */}
            <div className="flex-1 p-4 overflow-auto border border-gray-100 rounded-lg">

                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-medium">Questions</h3>
                </div>

                {topicQuestions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No questions yet. Click "Add Question" to create your first question.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {topicQuestions.map((question, index) => (
                            <div
                                key={question.id}
                                className="group relative flex items-center mb-2 cursor-grab active:cursor-grabbing"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                                    moveQuestion(fromIndex, index);
                                }}
                            >
                                <div
                                    className={`relative flex-1 border rounded-lg p-2 bg-white shadow-sm ${draggedQuestion === question.id
                                        ? 'border-2'
                                        : 'border border-gray-200'
                                        }`}
                                    style={draggedQuestion === question.id ? { borderColor: '#D8F990' } : {}}
                                    draggable
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData('text/plain', index.toString());
                                    }}
                                    onMouseDown={() => handleDragStart(question.id)}
                                    onMouseUp={handleDragEnd}
                                >
                                    <div
                                        className="absolute left-2 top-[54px] cursor-grab active:cursor-grabbing z-10"
                                    >
                                        <GripVertical className="h-5 w-5 text-neutral-400" />
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            {question.answerType === 'radio' && <PiRadioButtonLight className="h-5 w-5 text-gray-400" />}
                                            {question.answerType === 'checkbox' && <IoIosCheckboxOutline />}
                                            {question.answerType === 'dropdown' && <img src="/Dropdown.svg" alt="Dropdown" className="h-5 w-5 text-gray-400" />}
                                            {question.answerType === 'text' && <img src="/textfeild.svg" alt="Text field" className="h-5 w-5 text-gray-400" />}
                                            {question.answerType === 'date' && <img src="/CalendarIcon.svg" alt="Date" className="h-5 w-5 text-gray-400" />}
                                            <span className="text-sm text-gray-500">{getAnswerTypeDisplay(question.answerType)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditQuestion(question.id)}
                                                className="opacity-0 transition-opacity group-hover:opacity-100 text-neutral-400 hover:text-blue-500"
                                            >
                                                <PencilLine className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteQuestion(question.id)}
                                                className="opacity-0 transition-opacity group-hover:opacity-100 text-neutral-400 hover:text-red-500"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                            <span className="text-gray-400">{index + 1}</span>
                                        </div>
                                    </div>

                                    <h4 className="text-lg font-medium mt-1 mb-1 pl-8">{question.text}</h4>

                                    {/* Display answer options if applicable */}
                                    {(question.answerType === 'radio' || question.answerType === 'checkbox' || question.answerType === 'dropdown') && question.answers.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2 pl-8">
                                            {question.answers.map((answer) => (
                                                <StatusTag key={answer.id} type="default">
                                                    {answer.text}
                                                </StatusTag>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <Button
                    variant="outline"
                    className="w-full mt-2 flex items-center justify-center gap-2 rounded-full border border-neutral-200 py-6 text-black"
                    onClick={handleAddQuestion}
                >
                    <Plus className="h-4 w-4" />
                    Add Question
                </Button>
            </div>

            {/* Add Question Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="w-[95%] sm:w-[90%] md:w-[80%] lg:w-[70%] h-[90%] sm:h-[85%] max-w-none p-4 sm:p-6 overflow-auto">
                    <DialogHeader>
                        <DialogTitle>Add Question</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="question-text">Text</Label>
                            <Textarea
                                id="question-text"
                                value={questionText}
                                onChange={(e) => setQuestionText(e.target.value)}
                                placeholder="Type question"
                                className="mt-1 w-full"
                            />
                        </div>

                        <div>
                            <Label>Select Answer Type</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4 mt-2">
                                <div
                                    className={`flex gap-2 items-center justify-center p-3 border rounded-md cursor-pointer ${answerType === 'radio' ? 'border-black bg-transparent' : ''}`}
                                    onClick={() => setAnswerType('radio')}
                                >
                                    <PiRadioButtonLight className="h-5 w-5 text-gray-400" />
                                    <p className="text-sm">Radio button</p>
                                </div>
                                <div
                                    className={`flex gap-2 justify-center items-center p-3 border rounded-md cursor-pointer ${answerType === 'checkbox' ? 'border-black bg-transparent' : ''}`}
                                    onClick={() => setAnswerType('checkbox')}
                                >
                                    <IoIosCheckboxOutline className="h-5 w-5 text-gray-400" />
                                    <p className="text-sm">Checkbox</p>
                                </div>
                                <div
                                    className={`flex gap-2 items-center justify-center p-3 border rounded-md cursor-pointer ${answerType === 'text' ? 'border-black bg-transparent' : ''}`}
                                    onClick={() => setAnswerType('text')}
                                >
                                    <img src="/textfeild.svg" alt="Text field" className="h-5 w-5 text-gray-400" />
                                    <p className="text-sm">Text field</p>
                                </div>
                                <div
                                    className={`flex gap-2 items-center justify-center p-3 border rounded-md cursor-pointer ${answerType === 'dropdown' ? 'border-black bg-transparent' : ''}`}
                                    onClick={() => setAnswerType('dropdown')}
                                >
                                    <img src="/Dropdown.svg" alt="Dropdown" className="h-5 w-5 text-gray-400" />
                                    <p className="text-sm">Dropdown</p>
                                </div>
                                <div
                                    className={`flex gap-2 items-center justify-center p-3 border rounded-md cursor-pointer ${answerType === 'date' ? 'border-blue-500 bg-blue-50' : ''}`}
                                    onClick={() => setAnswerType('date')}
                                >
                                    <img src="/CalendarIcon.svg" alt="Date" className="h-5 w-5 text-gray-400" />
                                    <p className="text-sm">Date</p>
                                </div>
                            </div>
                        </div>

                        {renderAnswerOptions()}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveQuestion}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Question Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="w-[95%] sm:w-[90%] md:w-[80%] lg:w-[70%] h-[90%] sm:h-[85%] max-w-none p-4 sm:p-6 overflow-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Question</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="edit-question-text">Text</Label>
                            <Textarea
                                id="edit-question-text"
                                value={questionText}
                                onChange={(e) => setQuestionText(e.target.value)}
                                placeholder="Type question"
                                className="mt-1 w-full"
                            />
                        </div>

                        <div>
                            <Label>Select Answer Type</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4 mt-2">
                                <div
                                    className={`flex flex-col items-center p-3 border rounded-md cursor-pointer ${answerType === 'radio' ? 'border-blue-500 bg-blue-50' : ''}`}
                                    onClick={() => setAnswerType('radio')}
                                >
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-400 mb-2"></div>
                                    <span className="text-xs">Radio button</span>
                                </div>
                                <div
                                    className={`flex flex-col items-center p-3 border rounded-md cursor-pointer ${answerType === 'checkbox' ? 'border-blue-500 bg-blue-50' : ''}`}
                                    onClick={() => setAnswerType('checkbox')}
                                >
                                    <div className="w-5 h-5 rounded-sm border-2 border-gray-400 mb-2"></div>
                                    <span className="text-xs">Checkbox</span>
                                </div>
                                <div
                                    className={`flex flex-col items-center p-3 border rounded-md cursor-pointer ${answerType === 'text' ? 'border-blue-500 bg-blue-50' : ''}`}
                                    onClick={() => setAnswerType('text')}
                                >
                                    <div className="w-10 h-5 border-b-2 border-gray-400 mb-2"></div>
                                    <span className="text-xs">Text field</span>
                                </div>
                                <div
                                    className={`flex flex-col items-center p-3 border rounded-md cursor-pointer ${answerType === 'dropdown' ? 'border-blue-500 bg-blue-50' : ''}`}
                                    onClick={() => setAnswerType('dropdown')}
                                >
                                    <div className="w-5 h-5 flex items-center justify-center border border-gray-400 rounded mb-2">▼</div>
                                    <span className="text-xs">Dropdown</span>
                                </div>
                                <div
                                    className={`flex flex-col items-center p-3 border rounded-md cursor-pointer ${answerType === 'date' ? 'border-blue-500 bg-blue-50' : ''}`}
                                    onClick={() => setAnswerType('date')}
                                >
                                    <div className="w-5 h-5 flex items-center justify-center border border-gray-400 rounded mb-2">📅</div>
                                    <span className="text-xs">Date</span>
                                </div>
                            </div>
                        </div>

                        {renderAnswerOptions()}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateQuestion}>Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AddQuestionsContent;