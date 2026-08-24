"use client";

import React from "react";
import { motion, HTMLMotionProps, Variants } from "framer-motion";

export interface RevealGroupProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  stagger?: number;
  margin?: any;
  className?: string;
}

export interface RevealItemProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

const customEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const parentVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (stagger: number = 0.1) => ({
    opacity: 1,
    transition: {
      staggerChildren: stagger,
    },
  }),
};

const childVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: customEase,
    },
  },
};

export function RevealGroup({
  children,
  stagger = 0.1,
  margin = "-80px",
  className = "",
  ...props
}: RevealGroupProps) {
  return (
    <motion.div
      variants={parentVariants}
      custom={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className = "",
  ...props
}: RevealItemProps) {
  return (
    <motion.div
      variants={childVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default RevealGroup;
