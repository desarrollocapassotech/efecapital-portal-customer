import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type SpinnerSize = "sm" | "md" | "lg";

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-8 w-8",
};

export const Spinner = ({ size = "md", className }: { size?: SpinnerSize; className?: string }) => (
  <Loader2
    aria-hidden="true"
    className={cn("animate-spin text-primary", sizeClasses[size], className)}
  />
);

interface LoadingStateProps {
  label?: string;
  spinnerSize?: SpinnerSize;
  className?: string;
  labelClassName?: string;
}

export const LoadingState = ({
  label = "Cargando...",
  spinnerSize = "md",
  className,
  labelClassName,
}: LoadingStateProps) => (
  <div
    role="status"
    aria-live="polite"
    className={cn("flex items-center gap-2 text-muted-foreground", className)}
  >
    <Spinner size={spinnerSize} />
    {label ? <span className={labelClassName}>{label}</span> : null}
  </div>
);

export default LoadingState;
