import React, { useEffect, useState } from 'react';
import { Check, ChevronDown, MessageSquare, Calendar, GripVertical } from 'lucide-react';
import { StatusTag } from '@/components/StatusTag';
import { Topic, Question, useChatbotBuilder } from '@/store/ChatbotBuilderContext';
import { PiRadioButtonLight } from 'react-icons/pi';
import { IoIosCheckboxOutline } from 'react-icons/io';

interface QuestionDisplayProps {
  topics: Topic[];
  questions: Question[];
  showTopicsList?: boolean;
}

const getAnswerTypeDisplay = (answerType: string): string => {
  switch (answerType) {
    case 'radio':
      return 'Radio button';
    case 'checkbox':
      return 'Checkbox';
    case 'text':
      return 'Text field';
    case 'dropdown':
      return 'Dropdown';
    case 'date':
      return 'Date';
    default:
      return answerType;
  }
};

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  topics,
  questions,
  showTopicsList = true
}) => {
  const { state, setQuestions } = useChatbotBuilder();
  const sortedTopics = [...topics].sort((a, b) => a.position - b.position);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [draggedQuestion, setDraggedQuestion] = useState<string | null>(null);

  // Default-select the first topic when available
  useEffect(() => {
    if (sortedTopics.length > 0 && !selectedTopicId) {
      setSelectedTopicId(sortedTopics[0].id);
    }
  }, [sortedTopics, selectedTopicId]);

  // Drag and drop handlers
  const handleDragStart = (id: string) => {
    setDraggedQuestion(id);
  };

  const handleDragEnd = () => {
    setDraggedQuestion(null);
  };

  const moveQuestion = (topicId: string, fromIndex: number, toIndex: number) => {
    const topicQuestions = state.questions
      .filter(q => q.topicId === topicId)
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
    const otherQuestions = state.questions.filter(q => q.topicId !== topicId);
    setQuestions([...otherQuestions, ...updatedTopicQuestions]);
  };

  // When showing topics list, only render the selected topic's questions
  const topicsToRender = showTopicsList
    ? sortedTopics.filter(t => t.id === selectedTopicId)
    : sortedTopics;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Topics List - Only shown if showTopicsList is true */}
      {showTopicsList && (
        <div className="w-full lg:w-1/3 bg-neutral-25 p-4 rounded-lg overflow-auto">
          <h3 className="font-medium mb-4">Topics</h3>
          <div className="space-y-2">
            {sortedTopics.map((topic, index) => (
              <div
                key={topic.id}
                onClick={() => setSelectedTopicId(topic.id)}
                className={`p-3 cursor-pointer rounded-full ${selectedTopicId === topic.id
                  ? 'border border-neutral-100 rounded-full'
                  : 'hover:bg-gray-100'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{index + 1}. {topic.name || 'Unnamed Topic'}</span>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">{questions.filter(q => q.topicId === topic.id).length}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions Preview */}
      <div className={`w-full ${showTopicsList ? 'lg:w-2/3' : ''} space-y-6`}>
        {topicsToRender.map((topic) => {
          const topicQuestions = questions
            .filter(q => q.topicId === topic.id)
            .sort((a, b) => a.position - b.position);

          return topicQuestions.length > 0 && (
            <div key={topic.id} className="space-y-4">
              {!showTopicsList && (
                <h4 className="font-medium text-gray-700">{topic.name}</h4>
              )}

              {topicQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className="group relative flex items-center mb-2 cursor-grab active:cursor-grabbing"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                    moveQuestion(topic.id, fromIndex, index);
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

                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {question.answerType === 'radio' && <PiRadioButtonLight className="h-5 w-5 text-gray-400" />}
                        {question.answerType === 'checkbox' && <IoIosCheckboxOutline />}
                        {question.answerType === 'dropdown' && <img src="/Dropdown.svg" alt="Dropdown" className="h-5 w-5 text-gray-400" />}
                        {question.answerType === 'text' && <img src="/textfeild.svg" alt="Text field" className="h-5 w-5 text-gray-400" />}
                        {question.answerType === 'date' && <img src="/CalendarIcon.svg" alt="Date" className="h-5 w-5 text-gray-400" />}
                        <span className="text-sm text-gray-500">{getAnswerTypeDisplay(question.answerType)}</span>
                      </div>
                      <span className="text-gray-400">{index + 1}</span>
                    </div>

                    <div
                      className="absolute left-2 top-[52px] cursor-grab active:cursor-grabbing z-10"
                    >
                      <GripVertical className="h-5 w-5 text-neutral-400" />
                    </div>   <h4 className="text-lg font-medium mt-4 mb-2 pl-8">{question.text}</h4>

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

                    {question.answerType === 'text' && (
                      <StatusTag type="default" className="text-xs pl-8">
                        Text input
                      </StatusTag>
                    )}

                    {question.answerType === 'date' && (
                      <StatusTag type="default" className="text-xs pl-8">
                        Date input
                      </StatusTag>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionDisplay;
