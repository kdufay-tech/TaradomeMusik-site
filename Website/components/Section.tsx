import * as React from "react";
import { cn } from "@/lib/utils";

export function Section({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("mx-auto max-w-6xl px-4 py-14 md:py-18", className)} {...props} />;
}
