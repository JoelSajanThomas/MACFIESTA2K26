"use client";

import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: any;
  accentColor?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon: Icon,
  accentColor = "#EAB308",
}: MetricCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="glass p-5 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col justify-between shadow-lg group hover:border-festival-gold/40"
    >
      {/* Background Subtle Accent Glow */}
      <div
        className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-15 pointer-events-none group-hover:opacity-30 transition-opacity"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-heading)" }}>
          {title}
        </span>
        <div
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-xl shrink-0 group-hover:scale-110 transition-transform"
          style={{ color: accentColor }}
        >
          <Icon />
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          {value}
        </h3>
        <div className="flex items-center justify-between text-xs pt-1">
          {subtitle && <span className="text-white/40 text-[10px] uppercase tracking-wider font-medium">{subtitle}</span>}
          {change && (
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                isPositive
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}
            >
              {change}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
