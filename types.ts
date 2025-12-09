
export type Tab = 'main' | 'chatbot' | 'settings';
export type ViewState = 'onboarding' | 'app' | 'admin-login' | 'admin-dashboard';

export interface LocationPoint {
  x: number;
  y: number;
  floor: number;
}

export interface POI {
  id: string;
  name: string;
  type: 'medical' | 'service' | 'emergency' | 'transport';
  building: string;
  floor: number;
  location: LocationPoint;
  icon?: string;
}

export interface RouteStep {
  instruction: string;
  distance: number; // meters
  action: 'straight' | 'left' | 'right' | 'elevator' | 'stairs' | 'arrive';
}

export interface RouteData {
  steps: RouteStep[];
  path: LocationPoint[];
  destination: POI;
  totalDistance: number;
  estimatedTime: number; // minutes
}

export interface FloorPlan {
  floor: number;
  walls: string; // SVG path data
  rooms: { name: string; x: number; y: number }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
}
