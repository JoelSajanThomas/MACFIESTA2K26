import { resolveIconName } from "../../utils/iconUtils";

const ICONS = {
  globe: (
    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 2c1.2 0 2.3.2 3.3.6A8 8 0 004.6 12H2.1A8 8 0 0112 4zm-7.9 8H4.6a8 8 0 0010.1 5.4A10 10 0 014.1 12zm9.9 0a10 10 0 00-1.6-5.4A8 8 0 0119.4 12h-2.5zm2.5 2h2.5a8 8 0 01-13.4 3.3A10 10 0 0116.5 14z" />
  ),
  mic: (
    <path d="M12 14a3 3 0 003-3V6a3 3 0 10-6 0v5a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zM11 18.9V22h2v-3.1A7 7 0 0018 13h-2a5 5 0 01-10 0H4a7 7 0 007 5.9z" />
  ),
  clipboard: (
    <path d="M9 2a2 2 0 00-2 2H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2-2H9zm0 2h2v2H9V4zm-2 4h8v10H7V8z" />
  ),
  laptop: (
    <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8H4V6zm14 10H6l-2 3h16l-2-3z" />
  ),
  palette: (
    <path d="M12 2a10 10 0 100 20h1.8a2.2 2.2 0 000-4.4H12a1.6 1.6 0 010-3.2h.8a2.2 2.2 0 000-4.4H12zm-4 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm8 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-4-4a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
  ),
  music: (
    <path d="M12 3v10.6A3.4 3.4 0 1110 14.6V5H7V3h5z" />
  ),
  dance: (
    <path d="M12 2l2 4 4 1-3 3 1 5-4-2-4 2 1-5-3-3 4-1 2-4z" />
  ),
  gamepad: (
    <path d="M6 8a4 4 0 004 4h4a4 4 0 004-4V6H6v2zm-2 0V6a2 2 0 012-2h12a2 2 0 012 2v2a6 6 0 01-6 6h-4a6 6 0 01-6-6zm2 2h2v2H6v-2zm8 0h2v2h-2v-2z" />
  ),
  chart: (
    <path d="M4 18h16v2H4v-2zm2-3h2V9H6v6zm4 0h2V6h-2v9zm4 0h2v-4h-2v4z" />
  ),
  book: (
    <path d="M6 4h10a2 2 0 012 2v12H8a2 2 0 00-2 2V4zm2 0v12h8V6H8zm2 14h8v2H8a2 2 0 01-2-2z" />
  ),
  camera: (
    <path d="M9 4l1.5 2H18v12H6V4h3zm3 4a3 3 0 100 6 3 3 0 000-6z" />
  ),
  trophy: (
    <path d="M8 4h8v3a4 4 0 01-8 0V4zm10 1h2a2 2 0 010 4h-2V5zM6 5H4a2 2 0 000 4h2V5zm1 8h8v2H9v3h6v2H9v-2H7v-5z" />
  ),
  calendar: (
    <path d="M7 2h2v2h6V2h2v2h3v14H4V4h3V2zm11 6H6v10h12V8z" />
  ),
  mail: (
    <path d="M4 6h16v10H4V6zm2 2l6 4 6-4H6zm-2 8V8l8 5 8-5v8H4z" />
  ),
  phone: (
    <path d="M8 3h8l2 3v12l-2 3H8l-2-3V6l2-3zm2 2v12h4V5h-4z" />
  ),
  mappin: (
    <path d="M12 2a5 5 0 00-5 5c0 3.5 5 11 5 11s5-7.5 5-11a5 5 0 00-5-5zm0 7a2 2 0 110-4 2 2 0 010 4z" />
  ),
  star: (
    <path d="M12 3l2.4 5.5L20 9.3l-4.2 3.7 1.3 5.5L12 15.8 6.9 18.5l1.3-5.5L4 9.3l5.6-.8L12 3z" />
  ),
  users: (
    <path d="M8 10a3 3 0 116 0 3 3 0 01-6 0zM4 18a4 4 0 018 0H4zm8 0a4 4 0 018 0h-8z" />
  ),
  sparkles: (
    <path d="M12 2l1 4 4 1-4 1-1 4-1-4-4-1 4-1 1-4zm6 10l.5 2 2 .5-2 .5-.5 2-.5-2-2-.5 2-.5.5-2zM5 12l.5 2 2 .5-2 .5-.5 2-.5-2-2-.5 2-.5.5-2z" />
  ),
  sports: (
    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 2a8 8 0 018 8h-4a4 4 0 00-4-4V4zm-8 8a8 8 0 018 8v-4a4 4 0 00-4-4H4z" />
  ),
  workshop: (
    <path d="M3 10l9-7 9 7v8a2 2 0 01-2 2h-4v-6H9v6H5a2 2 0 01-2-2v-8z" />
  ),
};

export default function FestIcon({ name, size = 24, className = "" }) {
  const iconName = resolveIconName(name);
  const path = ICONS[iconName] || ICONS.sparkles;

  return (
    <svg
      className={`fest-icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}
