import { Check, CircleDashed, X } from "lucide-react";
import { cn } from "../../utils";

interface StatusBadgeProps {
  status: "succeeded" | "failed" | "refunded" | "disputed" | "uncaptured";
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig: Record<
    string,
    { label: string; className: string; icon?: React.ReactNode }
  > = {
    succeeded: {
      label: "Succeeded",
      className: "bg-[#eafcdd] text-[#217005] border-[#a8f170]",
      icon: <Check className="size-3 stroke-3 text-[#217005]" />,
    },
    failed: {
      label: "Failed",
      className: "bg-[#ffebee] text-[#c62828] border-[#ef9a9a]",
      icon: <X className="size-3 stroke-3 text-[#c62828]" />,
    },
    refunded: {
      label: "Refunded",
      className: "bg-[#fff3e0] text-[#ffa726] border-[#ffc94d]",
    },
    disputed: {
      label: "Disputed",
      className: "bg-[#fff3e0] text-[#ffa726] border-[#ffc94d]",
    },
    uncaptured: {
      label: "Uncaptured",
      className: "bg-[#f5f5f5] text-[#616161] border-[#e0e0e0]",
      icon: <CircleDashed className="size-3 stroke-3 text-[#616161]" />,
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded-sm text-xs font-medium border gap-1",
        config.className
      )}
    >
      {config.label}
      {config?.icon && <div className="icon">{config?.icon}</div>}
    </span>
  );
};

export default StatusBadge;
