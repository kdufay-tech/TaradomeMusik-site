import { cn } from "@/lib/utils";
import Link from "next/link";
import * as React from "react";

type Props = React.ComponentProps<"button"> & {
  href?: string;
  variant?: "primary" | "ghost";
  size?: "sm" | "md";
};

export function Button({ href, variant = "primary", size = "md", className, ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-2xl font-medium transition focus:outline-none focus:ring-2 focus:ring-ember-500/60 focus:ring-offset-0 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-ember-500 hover:bg-ember-400 text-black shadow-[0_16px_60px_rgba(255,77,45,.20)]",
    ghost: "bg-white/5 hover:bg-white/10 text-white border border-white/10",
  } as const;
  const sizes = {
    sm: "h-10 px-4 text-sm",
    md: "h-12 px-5 text-sm",
  } as const;

  const cls = cn(base, variants[variant], sizes[size], className);

  if (href) {
    return (
      <Link href={href} className={cls} prefetch={false}>
        {props.children}
      </Link>
    );
  }

  return <button className={cls} {...props} />;
}
