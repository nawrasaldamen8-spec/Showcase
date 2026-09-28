import { Pencil, Trash2 } from "lucide-react";
import React from "react";

export interface CareerCardActionsProps {
  itemName: string;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

export const CareerCardActions: React.FC<CareerCardActionsProps> = ({
  itemName,
  onEdit,
  onDelete,
  compact = false,
}) => {
  if (!onEdit && !onDelete) return null;

  const btnClass = compact
    ? "p-1.5 rounded-lg text-cloud-dark hover:text-slate-dark hover:bg-ivory-medium transition-colors cursor-pointer"
    : "p-1.5 sm:p-2 rounded-xl text-cloud-dark hover:text-slate-dark hover:bg-ivory-medium transition-colors cursor-pointer";

  const deleteBtnClass = compact
    ? "p-1.5 rounded-lg text-cloud-dark hover:text-red-600 hover:bg-red-50/40 transition-colors cursor-pointer"
    : "p-1.5 sm:p-2 rounded-xl text-cloud-dark hover:text-red-600 hover:bg-red-50/40 transition-colors cursor-pointer";

  const iconClass = compact ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className={btnClass}
          aria-label={`Edit ${itemName}`}
        >
          <Pencil className={iconClass} />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className={deleteBtnClass}
          aria-label={`Delete ${itemName}`}
        >
          <Trash2 className={iconClass} />
        </button>
      )}
    </div>
  );
};
