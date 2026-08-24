"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  RiInstagramFill,
  RiYoutubeFill,
  RiLinkedinBoxFill,
  RiTwitterXFill,
  RiMapPinLine,
  RiPhoneLine,
  RiMailLine,
  RiArrowUpLine,
  RiShieldCheckLine,
  RiFlashlightLine,
} from "react-icons/ri";
import { usePathname } from "next/navigation";
import { SOCIAL_LINKS } from "@/lib/constants";
import { useFestivalControl } from "@/lib/festivalStore";

const portals = [
  { label: "Participant Portal", href: "/dashboard" },
  { label: "Command Console", href: "/admin" },
  { label: "Mission Control", href: "/admin/console" },
  { label: "Volunteer HQ", href: "/volunteer/login" },
  { label: "Judge Command", href: "/judge/login" },

];


const resources = [
  { label: "Mission Brochure", href: "/brochure" },
  { label: "Jarvis FAQ", href: "/faq" },
  { label: "Protocol Rulebook", href: "/rules" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Comms Support", href: "/contact" },
];

const socialIcons: Record<string, React.ComponentType<{ size?: number }>> = {
  instagram: RiInstagramFill,
  youtube: RiYoutubeFill,
  linkedin: RiLinkedinBoxFill,
  twitter: RiTwitterXFill,
};

export function Footer() {
  const { settings } = useFestivalControl();
  const pathname = usePathname();
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/volunteer") ||
    pathname?.startsWith("/volunteers") ||
    pathname?.startsWith("/judge") ||
    pathname?.startsWith("/judges")
  )
    return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      className="relative bg-gradient-to-b from-[#05050A] via-[#0A0D1A] to-[#020205] border-t border-arc-cyan/20 overflow-hidden z-10 text-white"
      role="contentinfo"
      aria-label="Main Footer"
    >
      {/* Background Arc Reactor & Quantum Glow */}
      <div
        className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-marvel-red/10 blur-[100px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-10 w-[250px] h-[250px] rounded-full bg-arc-cyan/10 blur-[90px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-marvel-red via-arc-cyan to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-6 border-b border-white/10 items-start">

          {/* Brand & Socials (4 cols) */}
          <div className="md:col-span-4 space-y-3 text-left flex flex-col items-start">
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-none"
              aria-label="MACFIESTA Home Link"
            >
              <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                <Image
                  src={settings.logoUrl || "/logo.png"}
                  alt={`${settings.name} Logo`}
                  width={36}
                  height={36}
                  className="object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="text-left">
                <h3 className="text-lg md:text-xl tracking-wider uppercase flex items-center gap-1 font-anton leading-none">
                  <span className="shimmer-text">{settings.name.toUpperCase()}</span>
                </h3>
                <p className="text-[8px] text-arc-cyan tracking-[0.25em] uppercase font-bold font-space mt-0.5">
                  {settings.edition}
                </p>
              </div>
            </Link>

            <p className="text-xs text-white/60 leading-relaxed max-w-xs font-space">
              Earth&apos;s premier national collegiate festival at MACFAST. Every Hero Has A Mission.
            </p>

            <div className="flex gap-2 pt-1">
              {SOCIAL_LINKS.map((link) => {
                const Icon = socialIcons[link.platform];
                const targetUrl = link.platform === "instagram" ? settings.socialInstagram || link.url :
                  link.platform === "youtube" ? settings.socialYoutube || link.url :
                    link.platform === "linkedin" ? settings.socialLinkedin || link.url : link.url;
                return (
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    key={link.platform}
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/5 border border-arc-cyan/20 rounded-lg text-white/60 hover:text-arc-cyan hover:border-arc-cyan hover:bg-arc-cyan/10 hover:shadow-[0_0_12px_#00D4FF] transition-colors duration-300"
                    aria-label={`Follow ${settings.name} on ${link.label}`}
                  >
                    <Icon size={15} />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Links: Portals & Resources (5 cols) */}
          <div className="md:col-span-5 grid grid-cols-2 gap-4 text-left">
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-arc-cyan uppercase tracking-[0.18em] font-space flex items-center justify-start gap-1.5">
                <RiFlashlightLine className="text-xs shrink-0" /> Portals
              </h4>
              <ul className="space-y-1.5">
                {portals.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-white/70 hover:text-arc-cyan transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-arc-cyan uppercase tracking-[0.18em] font-space flex items-center justify-center md:justify-start gap-1.5">
                <RiShieldCheckLine className="text-xs shrink-0" /> Resources
              </h4>
              <ul className="space-y-1.5">
                {resources.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-white/70 hover:text-arc-cyan transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Comms & Security (3 cols) */}
          <div className="md:col-span-3 space-y-3 text-center md:text-left flex flex-col items-center md:items-start">
            <h4 className="text-[11px] font-bold text-marvel-red uppercase tracking-[0.18em] font-space">
              Stark Communications
            </h4>

            <div className="glass p-3 rounded-xl border border-arc-cyan/20 space-y-1.5 w-full text-left text-xs">
              <div className="flex gap-2 items-center text-white/70">
                <RiMapPinLine className="text-arc-cyan text-sm shrink-0" />
                <span className="truncate font-space">{settings.venueAddress}</span>
              </div>
              <div className="flex gap-2 items-center text-white/70">
                <RiPhoneLine className="text-marvel-red text-sm shrink-0" />
                <a href={`tel:${settings.contactPhone}`} className="hover:text-white font-mono transition-colors truncate">
                  {settings.contactPhone}
                </a>
              </div>
              <div className="flex gap-2 items-center text-white/70">
                <RiMailLine className="text-metallic-gold text-sm shrink-0" />
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-white font-mono transition-colors truncate">
                  {settings.contactEmail}
                </a>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-marvel-red/10 border border-marvel-red/30 rounded-full select-none">
              <RiShieldCheckLine className="text-marvel-red text-xs animate-pulse" />
              <span className="text-[9px] text-marvel-red font-bold tracking-widest uppercase font-mono">
                Level 10 Security Active
              </span>
            </div>
          </div>
        </div>

        {/* Compact Bottom Bar */}
        <div className="pt-4 pb-16 xl:pb-0 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/45 font-mono text-center sm:text-left">
          <div>
            © {new Date().getFullYear()} {settings.name.toUpperCase()} MARVELVERSE.
          </div>

          <div className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-arc-cyan transition-colors">Privacy</Link>
            <Link href="/terms-and-conditions" className="hover:text-arc-cyan transition-colors">Terms</Link>
            <Link href="/rules" className="hover:text-arc-cyan transition-colors">Directives</Link>
            <Link href="/contact" className="hover:text-arc-cyan transition-colors">Support</Link>
          </div>

          <div className="flex items-center gap-3">
            <span>
              Engineered by <span className="text-metallic-gold font-bold uppercase">Joel Sajan Thomas & Joel Zacharia</span>
            </span>
            <button
              onClick={scrollToTop}
              type="button"
              suppressHydrationWarning={true}
              className="p-1.5 bg-arc-cyan/10 border border-arc-cyan/40 rounded-full text-arc-cyan hover:bg-arc-cyan hover:text-black transition-all shadow-[0_0_10px_rgba(0,212,255,0.3)] cursor-pointer shrink-0"
              aria-label="Scroll back to top"
            >
              <RiArrowUpLine size={13} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

