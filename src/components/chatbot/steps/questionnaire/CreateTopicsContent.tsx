import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash } from 'lucide-react';
import { GripVertical } from 'lucide-react';
import { useChatbotBuilder, Topic } from '@/store/ChatbotBuilderContext';
import { StatusTag } from '@/components/StatusTag';
import { defaultTopics } from '@/services/chatbot.api';

export const CreateTopicsStatusTag: React.FC = () => {
    const { state } = useChatbotBuilder();
    const sortedTopics = [...state.topics].sort((a, b) => a.position - b.position);

    if (sortedTopics.length === 0 || !sortedTopics[0].name) {
        return null;
    }

    const topicNames = sortedTopics
        .filter(topic => topic.name.trim() !== '')
        .map(topic => topic.name);

    return (
        <>
            {topicNames.map((topicName) => (
                <StatusTag key={topicName} type="default" className="mr-1 last:mr-0">
                    {topicName}
                </StatusTag>
            ))}
        </>
    );
};

interface CreateTopicsContentProps {
    setIsDefaultTemplate: React.Dispatch<React.SetStateAction<boolean>>;
    isDefaultTemplate: boolean;
}

const CreateTopicsContent: React.FC<CreateTopicsContentProps> = ({ setIsDefaultTemplate, isDefaultTemplate }) => {
    const { state, setTopics, setQuestions } = useChatbotBuilder();
    const [localTopics, setLocalTopics] = useState<Topic[]>(state.topics.length > 0 ? state.topics : [{
        id: '1',
        name: '',
        position: 0
    }]);
    const [draggedTopic, setDraggedTopic] = useState<string | null>(null);
    const nodeRef = React.useRef<HTMLDivElement>(null);
    const hasInitializedRef = React.useRef<boolean>(false);

    // Update global state when local state changes
    useEffect(() => {
        setTopics(localTopics);
    }, [localTopics, setTopics]);

    const addTopic = () => {
        const newTopic: Topic = {
            id: Date.now().toString(),
            name: '',
            position: localTopics.length
        };
        setLocalTopics([...localTopics, newTopic]);
    };

    const updateTopic = (id: string, name: string) => {
        const updatedTopics = localTopics.map(topic => {
            if (topic.id === id) {
                return { ...topic, name };
            }
            return topic;
        });
        setLocalTopics(updatedTopics);
    };

    const removeTopic = (id: string) => {
        const newTopics = localTopics.filter(topic => topic.id !== id);
        // Reorder positions after removal
        const reorderedTopics = newTopics.map((topic, index) => ({
            ...topic,
            position: index
        }));
        setLocalTopics(reorderedTopics);
        setQuestions(state.questions.filter(question => question.topicId !== id));
    };

    const handleDragStart = (id: string) => {
        setDraggedTopic(id);
    };

    const handleDragEnd = () => {
        setDraggedTopic(null);
    };

    const moveTopic = (fromIndex: number, toIndex: number) => {
        const reorderedTopics = [...localTopics];
        const [movedTopic] = reorderedTopics.splice(fromIndex, 1);
        reorderedTopics.splice(toIndex, 0, movedTopic);

        // Update positions after reordering
        const updatedTopics = reorderedTopics.map((topic, index) => ({
            ...topic,
            position: index
        }));

        setLocalTopics(updatedTopics);
    };

    // Sort topics by position
    const sortedTopics = [...localTopics].sort((a, b) => a.position - b.position);

    // Initialize localTopics from state.topics on mount
    useEffect(() => {
        if (state.topics.length > 0 && localTopics.length === 1 && !localTopics[0].name) {
            // Only sync if localTopics is in initial empty state
            setLocalTopics(state.topics);
            hasInitializedRef.current = true;
        }
    }, []); // Run only on mount
    useEffect(() => {
        if (isDefaultTemplate) {
            // Only initialize with default topics if:
            // 1. No topics exist (empty or just one empty topic), OR
            // 2. Current topics don't contain any default topic IDs (user hasn't used template yet)
            const defaultTopicIds = defaultTopics.map(t => t.id);
            const hasDefaultTopics = state.topics.some(topic => defaultTopicIds.includes(topic.id));
            const hasNoTopics = state.topics.length === 0 || (state.topics.length === 1 && !state.topics[0].name);

            if (hasNoTopics || !hasDefaultTopics) {
                setLocalTopics(defaultTopics);
                setTopics(defaultTopics);
                hasInitializedRef.current = true;
            } else {
                // If default topics already exist (even if some were deleted), preserve current state
                // Only sync if we haven't initialized yet or if there's a mismatch
                if (!hasInitializedRef.current) {
                    setLocalTopics(state.topics);
                    hasInitializedRef.current = true;
                } else {
                    // Sync localTopics with state.topics to ensure consistency when accordion reopens
                    const currentTopicIds = new Set(localTopics.map(t => t.id));
                    const stateTopicIds = new Set(state.topics.map(t => t.id));
                    const idsMatch = currentTopicIds.size === stateTopicIds.size &&
                        [...currentTopicIds].every(id => stateTopicIds.has(id));

                    if (!idsMatch) {
                        setLocalTopics(state.topics);
                    }
                }
            }
        } else {
            // When template is turned off, remove template topics and their related questions
            const defaultTopicIds = defaultTopics.map(t => t.id);
            const nonTemplateTopics = state.topics.filter(topic => !defaultTopicIds.includes(topic.id));

            // Remove questions related to template topics
            const templateTopicIds = state.topics
                .filter(topic => defaultTopicIds.includes(topic.id))
                .map(topic => topic.id);
            const remainingQuestions = state.questions.filter(question => !templateTopicIds.includes(question.topicId));

            // Update questions state
            setQuestions(remainingQuestions);

            // Update topics - either keep non-template topics or reset to empty topic
            if (nonTemplateTopics.length > 0) {
                // Reorder positions for remaining topics
                const reorderedTopics = nonTemplateTopics.map((topic, index) => ({
                    ...topic,
                    position: index
                }));
                setLocalTopics(reorderedTopics);
                setTopics(reorderedTopics);
            } else {
                // Reset to empty topic if no non-template topics exist
                const emptyTopic = [{
                    id: '1',
                    name: '',
                    position: 0
                }];
                setLocalTopics(emptyTopic);
                setTopics(emptyTopic);
            }
        }
    }, [isDefaultTemplate]);

    return (
        <div className="space-y-4 p-4">
            {/* Template Topics Container */}
            <div className="rounded-lg overflow-hidden mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 md:p-6 bg-gradient-to-r from-[#071F5F] to-[#4678FB] text-white">
                    <div className='flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-[60%]'>
                        <div className="flex-shrink-0 mr-0 sm:mr-4 mb-4 sm:mb-0">
                            <img src='/templete.svg' />
                        </div>
                        <div className="flex-grow mb-4 sm:mb-0">
                            <h3 className="text-lg font-medium">Set up your topics quickly</h3>
                            <p className="text-sm text-white/80 mt-1">We provide a predefined topics template tailored to your specialisation.</p>
                        </div>

                    </div>
                    <div className="ml-0 sm:ml-4  bg-white/15 rounded-2xl px-3 py-4 w-[40%]">
                        <label className="relative w-full inline-flex items-center justify-between cursor-pointer">
                            <div className="ml-3 text-md font-medium text-white">Use Template</div>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={isDefaultTemplate}
                                    onChange={() => setIsDefaultTemplate(!isDefaultTemplate)}
                                    className="sr-only peer"
                                />
                                <div className="relative w-11 h-6 bg-white/30 rounded-full peer-checked:bg-white/50 transition-colors">
                                    <div className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full border border-white transition-transform ${isDefaultTemplate ? 'translate-x-full' : 'translate-x-0'}`}></div>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
            {sortedTopics.map((topic, index) => (
                <div
                    key={topic.id}
                    className="group relative flex items-center mb-2 cursor-grab active:cursor-grabbing"
                    ref={nodeRef}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                        moveTopic(fromIndex, index);
                    }}
                >
                    <div
                        className={`relative flex-1 ${draggedTopic === topic.id ? 'border-2 rounded-lg' : ''}`}
                        style={draggedTopic === topic.id ? { borderColor: '#D8F990' } : {}}
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', index.toString());
                        }}
                        onMouseDown={() => handleDragStart(topic.id)}
                        onMouseUp={handleDragEnd}
                    >
                        <div
                            className="absolute left-2 bottom-1 -translate-y-1/2 cursor-grab active:cursor-grabbing z-10"
                        >
                            <GripVertical className="h-5 w-5 text-neutral-400" />
                        </div>
                        <Input
                            placeholder="Name the topic"
                            value={topic.name}
                            onChange={(e) => updateTopic(topic.id, e.target.value)}
                            className="w-full rounded-sm border-neutral-200 bg-transparent pl-8 pr-16 "
                            onFocus={(e) => e.target.select()}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTopic(topic.id)}
                            className="absolute bottom-[-10px] -translate-y-1/2 right-[16px] opacity-0 transition-opacity group-hover:opacity-100 text-neutral-400 hover:text-red-500"
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                        <span className="absolute right-2 bottom-1 -translate-y-1/2 text-neutral-400 text-sm">
                            {index + 1}
                        </span>
                    </div>
                </div>
            ))}

            <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 rounded-full border border-neutral-200 py-6 text-black"
                onClick={addTopic}
            >
                <Plus className="h-4 w-4" />
                Add Topic
            </Button>
        </div>
    );
};

export default CreateTopicsContent;