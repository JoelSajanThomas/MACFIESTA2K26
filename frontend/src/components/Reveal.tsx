"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export type RevealDirection = "up" | "left" | "right";

export interface RevealProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
  direction?: RevealDirection;
  y?: number;
  x?: number;
  duration?: number;
  margin?: any;
  className?: string;
}

export const customEase: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const defaultEase = customEase;

export function Reveal({
  children,
  delay = 0,
  direction = "up",
  y,
  x,
  duration = 0.7,
  margin = "-100px",
  className = "",
  ...props
}: RevealProps) {
  const getInitialOffset = () => {
    if (x !== undefined || y !== undefined) {
      return { x: x ?? 0, y: y ?? 60 };
    }
    switch (direction) {
      case "left":
        return { x: -60, y: 0 };
      case "right":
        return { x: 60, y: 0 };
      case "up":
      default:
        return { x: 0, y: 60 };
    }
  };

  const offset = getInitialOffset();

  return (
    <motion.div
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin }}
      transition={{
        duration,
        delay,
        ease: customEase,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;
