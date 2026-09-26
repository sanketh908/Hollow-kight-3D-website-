"use client";

import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * The ornamental pointer Hollow Knight draws either side of the selected menu
 * item. Points right by default; `flip` mirrors it for the right-hand side.
 */
export function Fleur({ flip, className }: { flip?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 24"
      aria-hidden
      className={cn("h-[1em] w-auto overflow-visible", flip && "-scale-x-100", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
    >
      {/* leaf blade pointing at the text */}
      <path d="M62 12C56 7.5 49 5.5 42 6.5c2.4 3.3 2.4 7.7 0 11 7 1 14-1 20-5.5Z" fill="currentColor" stroke="none" />
      <path d="M44 12H16" />
      {/* open spiral tendrils */}
      <path d="M40 12c-3-6.5-10-9-14.5-6.5-3 1.7-2.2 5.6.9 5.4" />
      <path d="M40 12c-3 6.5-10 9-14.5 6.5-3-1.7-2.2-5.6.9-5.4" />
      <path d="M24 12c-3.5-.4-6.5-3-8-6-.9-1.8-3.4-2-4.4-.3" />
      <path d="M24 12c-3.5.4-6.5 3-8 6-.9 1.8-3.4 2-4.4.3" />
      <circle cx="5" cy="12" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

const fleurBase =
  "pointer-events-none absolute top-1/2 -translate-y-1/2 opacity-0 transition-[opacity,transform] duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-hover:opacity-100 group-focus-visible:opacity-100";

/**
 * A main-menu style link: glowing small-caps text with fleurs that unfurl in
 * from the sides on hover/focus.
 */
export function MenuLink({
  href,
  children,
  size = "md",
  external,
  className,
}: {
  href: string;
  children: React.ReactNode;
  size?: "sm" | "md";
  external?: boolean;
  className?: string;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={cn(
        "group relative inline-flex min-h-11 items-center justify-center font-heading whitespace-nowrap text-foreground/80 outline-none transition-[color,text-shadow] duration-300",
        "hover:text-white hover:[text-shadow:0_0_14px_rgba(255,236,200,.75)] focus-visible:text-white focus-visible:[text-shadow:0_0_14px_rgba(255,236,200,.75)]",
        size === "md" ? "px-14 text-lg sm:px-20 sm:text-2xl max-sm:[&_svg]:h-[0.8em]" : "px-12 text-base [&_svg]:h-[0.8em]",
        className,
      )}
    >
      <span
        className={cn(
          fleurBase,
          "left-2 origin-right -translate-x-2 scale-x-50 group-hover:translate-x-0 group-hover:scale-x-100 group-focus-visible:translate-x-0 group-focus-visible:scale-x-100",
        )}
      >
        <Fleur />
      </span>
      {children}
      <span
        className={cn(
          fleurBase,
          "right-2 origin-left translate-x-2 scale-x-50 group-hover:translate-x-0 group-hover:scale-x-100 group-focus-visible:translate-x-0 group-focus-visible:scale-x-100",
        )}
      >
        <Fleur flip />
      </span>
    </a>
  );
}

/** Warm god-rays and a glow from above, like the title screen. */
export function LightRays() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-x-0 -top-1/3 h-[120%] bg-[radial-gradient(ellipse_55%_60%_at_50%_0%,rgba(255,214,150,.34),transparent_70%)]" />
      {[
        { left: "22%", w: "7rem", rot: 12, delay: "0s" },
        { left: "36%", w: "4rem", rot: 6, delay: "-3s" },
        { left: "48%", w: "9rem", rot: 0, delay: "-1.5s" },
        { left: "61%", w: "5rem", rot: -7, delay: "-4.5s" },
        { left: "73%", w: "8rem", rot: -13, delay: "-2s" },
      ].map((r) => (
        <span
          key={r.left}
          className="hk-ray absolute -top-10 h-[95%] origin-top bg-gradient-to-b from-[rgba(255,222,170,.42)] via-[rgba(255,222,170,.08)] to-transparent blur-2xl"
          style={{ left: r.left, width: r.w, rotate: `${r.rot}deg`, animationDelay: r.delay }}
        />
      ))}
    </div>
  );
}

/**
 * Section heading revealed like an area title card: the text sharpens out of a
 * blur while its letter-spacing settles and the ornament lines draw outward.
 */
export function AreaTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const line = "h-px flex-1 bg-gradient-to-r from-transparent to-current";
  return (
    <div className={cn("text-center", className)}>
      <motion.h2
        initial={reduce ? false : { opacity: 0, filter: "blur(10px)", letterSpacing: "0.25em" }}
        whileInView={{ opacity: 1, filter: "blur(0px)", letterSpacing: "0.02em" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="font-heading text-3xl text-white [text-shadow:0_0_24px_rgba(255,236,200,.25)] sm:text-5xl"
      >
        {children}
      </motion.h2>
      <motion.div
        aria-hidden
        initial={reduce ? false : { scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1.2, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-5 flex max-w-sm items-center gap-2 text-foreground/50"
      >
        <span className={line} />
        <Fleur flip className="h-3" />
        <span className="size-1.5 rotate-45 bg-current" />
        <Fleur className="h-3" />
        <span className={cn(line, "bg-gradient-to-l")} />
      </motion.div>
    </div>
  );
}

/** "130+" → counts up from 0 when scrolled into view, keeping the suffix. */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!inView || reduce || !el) return;
    const target = parseInt(value, 10);
    const suffix = value.replace(/^\d+/, "");
    const c = animate(0, target, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => (el.textContent = Math.round(v) + suffix),
    });
    return () => c.stop();
  }, [inView, reduce, value]);

  // Server/no-JS render shows the real number.
  return <span ref={ref}>{value}</span>;
}

/** Fade in from black on load, like the game booting. */
export function FadeFromBlack() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1.6, ease: "easeOut", delay: 0.2 }}
      className="pointer-events-none fixed inset-0 z-[100] bg-black"
    />
  );
}
