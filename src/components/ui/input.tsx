import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-sm border border-border bg-bg px-3 text-base text-fg",
        "placeholder:text-subtle",
        "disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}
