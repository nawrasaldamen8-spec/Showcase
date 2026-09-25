import { Plus } from "lucide-react";
import React from "react";
import { EmptyState } from "@shared/components/EmptyState.tsx";

export interface CareerEmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const CareerEmptyState: React.FC<CareerEmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <EmptyState
      icon={icon}
      eyebrow="Catalog Vacant"
      title={title}
      description={description}
      actionLabel={actionLabel}
      actionIcon={<Plus className="w-4 h-4" />}
      onAction={onAction}
    />
  );
};
