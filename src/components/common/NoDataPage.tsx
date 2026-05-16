import { FC } from "react";

type NoDataPageProps = {
  heading: string;
  subHeading: string;
};
export const NoDataPage: FC<NoDataPageProps> = ({ heading, subHeading }) => (
  <div className="my-8 flex justify-center flex-col items-center max-w-4xl mx-auto" data-tour="no-data-page">
    <img
      src="/activities-empty-img.jpg"
      className="bg-cover"
    />

    <div className="text-center max-w-sm">
      <h3 className="text-2xl text-black font-semibold">{heading}</h3>
      <span className="text-black/60 ">{subHeading}</span>
    </div>
  </div>
);
