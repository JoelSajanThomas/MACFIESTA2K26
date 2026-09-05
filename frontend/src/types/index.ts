/* ============================================
   MacFiesta 2K25 — TypeScript Type Definitions
   ============================================ */

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  gender?: "male" | "female" | "others" | "other" | string;
  year: string;
  role: "student" | "admin" | "volunteer";
  profilePhoto?: string;
  badges: Badge[];
  xpPoints: number;
  createdAt: string;
}

export interface Event {
  _id: string;
  title: string;
  slug: string;
  description: string;
  rules: string[];
  coverImage: string;
  videoUrl?: string;
  photos?: string[];
  date: string;
  time: string;
  venue: string;
  coordinator: {
    name: string;
    phone: string;
    email?: string;
    department?: string;
    team?: { name: string; detail?: string; role?: string; phone: string }[];
  };
  category: "general" | "technical" | "cultural" | "gaming" | "sports" | "management" | "media";
  type: "solo" | "duo" | "trio" | "squad" | "group";
  prizePool: number | null;
  difficulty: "easy" | "medium" | "hard" | "expert";
  maxSeats: number;
  registeredCount: number;
  isLive: boolean;
  status: "upcoming" | "ongoing" | "completed";
  externalRegistrationUrl?: string;
  createdAt: string;
}

export interface Registration {
  _id: string;
  userId: string;
  eventId: string;
  teamName?: string;
  gender?: "male" | "female" | "others" | "other" | string;
  teamMembers?: TeamMember[];
  paymentStatus: "pending" | "completed" | "failed" | "refunded" | "cancelled_no_refund";
  status?: "active" | "cancelled";
  cancelledAt?: string;
  cancellationPolicyNotice?: string;
  paymentId?: string;
  qrCode: string;
  entryPass: string;
  registrationDate?: string;
}

export interface TeamMember {
  name: string;
  email: string;
  phone: string;
  college: string;
  gender?: "male" | "female" | "others" | "other" | string;
}

export interface Score {
  _id: string;
  eventId: string;
  teams: ScoreTeam[];
  isLive: boolean;
  lastUpdated: string;
}

export interface ScoreTeam {
  name: string;
  score: number;
  rank: number;
  college: string;
  members?: string[];
}

export interface Result {
  _id: string;
  eventId: string;
  eventTitle: string;
  winner: ResultEntry;
  runnerUp: ResultEntry;
  secondRunnerUp?: ResultEntry;
  certificates: Certificate[];
  publishedAt: string;
}

export interface ResultEntry {
  name: string;
  college: string;
  team?: string;
  score?: number;
}

export interface Certificate {
  _id: string;
  userId: string;
  eventId: string;
  certificateUrl: string;
  qrVerificationCode: string;
  issuedAt: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "event" | "score" | "result";
  targetUsers: string[] | "all";
  isRead: boolean;
  createdAt: string;
}

export interface GalleryItem {
  _id: string;
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  caption?: string;
  category: string;
  eventId?: string;
  uploadedBy: string;
  createdAt: string;
}

export interface Sponsor {
  _id: string;
  name: string;
  logo: string;
  tier: "platinum" | "gold" | "silver" | "community";
  website?: string;
  description?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface ScheduleSlot {
  _id: string;
  eventId: string;
  eventTitle: string;
  stage: string;
  day: 1 | 2;
  startTime: string;
  endTime: string;
  status: "upcoming" | "ongoing" | "completed";
}

/** API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/** Auth tokens */
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}
