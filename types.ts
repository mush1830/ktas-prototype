import React from 'react';

export type ViewState = 'LOGIN' | 'HISTORY' | 'DASHBOARD';

export interface User {
  stationName: string;
  isAuthenticated: boolean;
}

export interface CrewMember {
  name: string;
  role: string; // 1급, 2급, 간호사, 구급교육, 기타
  rank: string; // 소방교, 소방장 등
  id: string;
}

export interface VitalSigns {
  bpSystolic: string;
  bpDiastolic: string;
  pulse: string;
  resp: string;
  temp: string;
  spo2: string;
}

export interface KtasResult {
  level: number; // 1-5
  reasoning: string;
  recommendedAction: string;
  color: string;
  textColor: string;
}

export interface Hospital {
  id: string;
  name: string;
  category: '권역' | '지역' | '기관'; // Added for Spec E3.3
  distance: number; // km
  availableBeds: {
    emergency: number;
    icu: number;
    ward: number;
  };
  specialties: string[];
  lat: number;
  lng: number;
  phone: string;
}

export interface MissionLog {
  id: string;
  date: string;
  startTime: string;
  location: string;
  chiefComplaint: string;
  ktasLevel?: number;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  type: 'INFO' | 'KTAS_CHANGE' | 'VITALS' | 'TRANSLATION_DATA' | 'ALERT' | 'STT' | 'CREW';
  content: string; // Raw text
  highlightedContent?: React.ReactNode; // Content with JSX spans for colors (Spec B1.1)
}

export interface TranslationItem {
  id: string;
  sender: 'PARAMEDIC' | 'PATIENT';
  original: string;
  translated: string;
  timestamp: Date;
  isApplied: boolean;
}