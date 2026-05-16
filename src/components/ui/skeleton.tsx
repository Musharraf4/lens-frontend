import { cn } from "@/lib/utils";

const skeletonAnimation = `
  @keyframes shimmer {
    0% { background-position: -100% 0; }
    100% { background-position: 100% 0; }
  }
  .skeleton-default {
    background: linear-gradient(90deg, #F7F9FB 0%, #E6E9EE 50%, #F7F9FB 100%);
    background-size: 200% 100%;
    animation: shimmer 1.5s linear infinite;
  }
  .skeleton-lime {
    background: linear-gradient(90deg, #9ccf09 0%, #d3fa63 50%, #9ccf09 100%);
    background-size: 200% 100%;
    animation: shimmer 1.5s linear infinite;
  }
`;

interface SkeletonProps extends React.ComponentProps<"div"> {
  variant?: "lime";
}

function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return (
    <>
      <style>{skeletonAnimation}</style>
      <div
        data-slot="skeleton"
        className={cn(
          variant === "lime" ? "skeleton-lime" : "skeleton-default",
          "rounded-md",
          className
        )}
        {...props}
      />
    </>
  );
}

export { Skeleton };
