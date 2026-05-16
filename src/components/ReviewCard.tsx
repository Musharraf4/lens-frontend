import React, { useState } from "react";

interface ReviewCardProps {
  title: string;
  rating: number;
  date: string;
  text: string;
  reviewer?: string;
  onSeeMore?: () => void;
  onGoToReview?: () => void;
}

const getStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  return (
    <>
      {[...Array(fullStars)].map((_, i) => (
        <span key={i} className="text-[#FF9900] text-lg">★</span>
      ))}
      {halfStar && <span className="text-[#FF9900] text-lg">☆</span>}
      {[...Array(5 - fullStars - (halfStar ? 1 : 0))].map((_, i) => (
        <span key={i + fullStars + 1} className="text-neutral-300 text-lg">★</span>
      ))}
    </>
  );
};

const ReviewCard: React.FC<ReviewCardProps> = ({
  title,
  rating,
  date,
  text,
  onSeeMore,
  onGoToReview,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // Truncate text for preview
  const previewLength = 70;
  const isLong = text.length > previewLength;
  const displayedText = isExpanded || !isLong ? text : text.slice(0, previewLength) + "...";

  return (
    <div className="rounded-2xl border border-neutral-50 bg-neutral-25 shadow p-5 w-full max-w-xs">
      <div className="text-neutral-500 font-normal text-base leading-6 mb-2">{title}</div>
      <div className="flex items-center gap-2 mb-2 flex-row lg:flex-col xl:flex-row">
        <div className="flex">{getStars(rating)}</div>
        <span className="text-xl font-semibold text-neutral-700">{rating.toFixed(1)}</span>
      </div>
      <div className="text-xs text-neutral-500 font-light leading-4 mb-2">{date}</div>
      <div className="text-base text-black font-normal leading-6 mb-2">
        {displayedText}
        {isLong && (
          <button
            className="text-neutral-500 ml-1 underline text-xs cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
            type="button"
          >
            {isExpanded ? "See less" : "See more"}
          </button>
        )}
      </div>
      <button
        className="text-sm font-normal text-neutral-500 cursor-pointer"
        onClick={onGoToReview}
        type="button"
      >
        Go to review
      </button>
    </div>
  );
};

export default ReviewCard; 