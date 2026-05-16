import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { showToast } from '@/components/Toast';
import { ActionDialog } from '../ActionDialog';
import { Button } from '@/components/ui/button';
import dayjs from 'dayjs';
import { useDeleteDraftConcierge } from '@/services/chatbot.api';
import { AiOutlineDelete } from 'react-icons/ai';

interface DraftCardProps {
  id: string;
  index?: number;
  avatar: string;
  message: string;
  creationDate: string;
  flowName?: string;
  currentStep: number;
  totalSteps?: number;
  onDelete?: () => void;
  onContinue?: () => void;
}

const DraftCard: React.FC<DraftCardProps> = ({
  id,
  avatar,
  message,
  creationDate,
  currentStep,
  totalSteps = 4,
  onDelete,
  onContinue,
  flowName,
  index
}) => {
  const deleteDraftConciergeMutation = useDeleteDraftConcierge();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const extractBotName = () => {
    const match = message.match(/I'm\\s+([A-Za-z]+)/i);
    return match ? `${match[1]}-Bot` : 'Bot';
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    await deleteDraftConciergeMutation.mutateAsync(id);
    if (onDelete) {
      onDelete();

      // Show success toast for deletion
      const botName = extractBotName();
      showToast({
        title: `${botName} was deleted`,
        description: "Meaning it has been permanently removed and will no longer be available for use.",
        type: 'success',
      });
    }
    setDeleteDialogOpen(false);
  };

  // Calculate progress percentage
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md p-4" data-tour={`${index === 0 ? 'bot-cards' : ''}`}>
      {/* Avatar and Message */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-[#4474F3]">
          <Image
            src={avatar || '/message-icon.svg'}
            alt="Bot avatar"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 border border-gray-200 rounded-3xl rounded-bl-sm p-2">
          <p className="text-base text-gray-800">{message || 'Greeting message goes here...'}</p>
        </div>
      </div>


      {/* Creation Date */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center">
          <img src="/CalendarIcon.svg" alt="Calendar icon" className="w-4 h-4" />
        </div>
        <span className="text-gray-500">Creation date</span>
        <span className="font-medium">{dayjs(creationDate).format('DD.MM.YYYY')}</span>
      </div>

      {/* Bottom Row with Progress and Actions */}
      <div className="flex justify-between items-center ">
        {/* Progress Indicator */}
        <div className="flex items-center gap-2 bg-gray-100 p-0.5 rounded-lg">
          <div className="relative w-4 h-4 ">
            <svg viewBox="0 0 36 36" className="w-4 h-4 -rotate-90">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                className={progressPercentage > 50 ? 'text-green-500' : 'text-black'}
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${progressPercentage}, 100`}
              />
            </svg>
          </div>
          <span className="text-sm text-gray-500">{flowName} {currentStep}/{totalSteps}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            className="rounded-full bg-gray-900 hover:bg-gray-800 text-white px-3"
            onClick={onContinue}
          >
            Continue set up
          </Button>
          <button
            onClick={handleDeleteClick}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
          >
            <AiOutlineDelete size={18} color='black' />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ActionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        type="alert"
        title={`Are you sure you want to delete ${extractBotName()}?`}
        description={`This action will permanently remove the ${extractBotName()}, and it cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        loading={deleteDraftConciergeMutation.isPending}
      />
    </div>
  );
};

const DraftCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm p-4">
      {/* Avatar and Message Skeleton */}
      <div className="flex items-start gap-3 mb-6">
        <Skeleton className="w-14 h-14 rounded-full" />
        <Skeleton className="flex-1 h-24 rounded-3xl" />
      </div>

      {/* Creation Date Skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="w-6 h-6 rounded-full" />
        <Skeleton className="w-24 h-5" />
        <Skeleton className="w-20 h-5" />
      </div>

      {/* Bottom Row Skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="w-32 h-6 rounded-full" />
        <div className="flex items-center gap-3">
          <Skeleton className="w-32 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default DraftCard;
