import React from "react";
import { MemberProfileCard } from "./MemberProfileCard.tsx";

export interface MemberProfileCardSkeletonProps {
  count?: number;
}

export const MemberProfileCardSkeleton: React.FC<MemberProfileCardSkeletonProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <MemberProfileCard key={idx} loading />
      ))}
    </>
  );
};
