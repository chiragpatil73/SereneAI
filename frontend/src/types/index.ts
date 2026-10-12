export type Emotion = "calm" | "neutral" | "stressed" | "anxious" | "overwhelmed" | "sad" | "frustrated";
export type StressLevel = "Low" | "Moderate" | "High";
export type RiskLevel = "normal" | "elevated" | "emergency";
export type Mood = "great" | "good" | "okay" | "low" | "stressed";
export type Feedback = "helped" | "somewhat_helped" | "didnt_help" | "stopped";

export interface User {
  id: number;
  name: string;
  email: string;
  country: string;
  trusted_contact_name?: string | null;
  trusted_contact_phone?: string | null;
  created_at: string;
}

export interface AiEstimate {
  emotion: Emotion;
  confidence: number;
  stress_score: number;
  stress_level: StressLevel;
  anxiety_level: "Low" | "Moderate" | "High";
  mood_label?: string;
  timestamp?: string;
}

export interface UserReported {
  mood: Mood;
  stress_level?: string | null;
  anxiety_level?: string | null;
  timestamp?: string;
}

export interface Intervention {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  categories: string[];
  icon: string;
}

export interface EmergencyServices {
  country: string;
  name: string;
  emergency_number: string;
  emergency_label: string;
  note?: string | null;
  helplines: { name: string; number: string }[];
}

export interface EmergencyPayload {
  title: string;
  body: string;
  category_line: string;
  medical_notice: string;
  disclaimer: string;
  category: string | null;
  services: EmergencyServices;
}

export interface ChatMessage {
  id: number | null;
  sender: "user" | "sereneai" | "system";
  content: string;
  timestamp?: string;
}

export interface AnalyzeResult {
  type: "response" | "emergency";
  session_id: number;
  user_message: ChatMessage;
  message: ChatMessage;
  safety: { risk_level: RiskLevel; triggered: boolean; category: string | null };
  ai_estimated: AiEstimate | null;
  recommendation: Intervention | null;
  emergency: EmergencyPayload | null;
  support: EmergencyServices | null;
}

export interface DashboardState {
  user_reported: UserReported | null;
  ai_estimated: AiEstimate | null;
  suggestion: (Intervention & { source: string }) | null;
  stats: { weekly_checkins: number; grounding_completed: number };
}

export interface AnalyticsDay {
  date: string;
  label: string;
  mood_score: number | null;
  reported_stress: number | null;
  ai_stress: number | null;
  checkins: number;
}

export interface Analytics {
  days: AnalyticsDay[];
  grounding_completed: number;
  weekly_checkins: number;
}

export interface HistoryItem {
  id: number;
  timestamp: string;
  type: string;
  title: string;
  duration_seconds: number;
  completed: boolean;
  feedback: Feedback | null;
  mood: string | null;
  stress_level: string | null;
}

export interface MoodEntry {
  id: number;
  mood: Mood;
  stress_level?: string | null;
  anxiety_level?: string | null;
  note?: string | null;
  timestamp: string;
}

export interface AdaptationOutcome {
  action: string;
  recommendation: Intervention | null;
  options: string[];
  message: ChatMessage;
}
