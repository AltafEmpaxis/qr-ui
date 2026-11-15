import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "max-h-48 min-h-28 w-full resize-y rounded-sm border border-border bg-bg px-3 py-3 text-base text-fg",
        "placeholder:text-subtle",
        className,
      )}
      {...props}
    />
  );
}
