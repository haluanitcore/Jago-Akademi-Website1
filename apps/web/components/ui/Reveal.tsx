"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  children: ReactNode;
  /** Stagger delay in seconds. */
  delay?: number;
  /** Initial rise distance in px. */
  y?: number;
  className?: string;
};

/**
 * Subtle reveal-on-scroll (fade + short rise), fired once. Compositor-friendly
 * (opacity/transform only) and disabled entirely under prefers-reduced-motion.
 */
export function Reveal({ children, delay = 0, y = 16, className }: Props) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
