import { Hospital, MissionLog } from './types';

export const STATIONS = [
  "마포소방서",
  "용산소방서",
  "서대문소방서",
  "은평소방서",
  "종로소방서",
  "강남소방서"
];

export const MOCK_HISTORY: MissionLog[] = [
  { id: "MAPO_20240520_003", date: "2024-05-20", startTime: "14:20", location: "마포구 상암동", chiefComplaint: "흉통 호소", ktasLevel: 2 },
  { id: "MAPO_20240520_002", date: "2024-05-20", startTime: "10:15", location: "마포구 합정동", chiefComplaint: "이마 열상", ktasLevel: 4 },
  { id: "MAPO_20240519_011", date: "2024-05-19", startTime: "22:40", location: "마포구 연남동", chiefComplaint: "주취 / 의식상실", ktasLevel: 3 },
];

export const MOCK_HOSPITALS: Hospital[] = [
  {
    id: "h1",
    name: "신촌세브란스병원",
    category: "권역",
    distance: 2.4,
    availableBeds: { emergency: 2, icu: 0, ward: 15 },
    specialties: ["중증외상", "심혈관", "뇌졸중"],
    lat: 37.562,
    lng: 126.935,
    phone: "02-1234-5678"
  },
  {
    id: "h2",
    name: "이대목동병원",
    category: "권역",
    distance: 4.1,
    availableBeds: { emergency: 5, icu: 2, ward: 8 },
    specialties: ["소아응급", "산부인과"],
    lat: 37.535,
    lng: 126.885,
    phone: "02-9876-5432"
  },
  {
    id: "h3",
    name: "강북삼성병원",
    category: "지역",
    distance: 5.8,
    availableBeds: { emergency: 0, icu: 1, ward: 5 },
    specialties: ["종합", "심혈관"],
    lat: 37.571,
    lng: 126.968,
    phone: "02-5555-5555"
  },
  {
    id: "h4",
    name: "홍익병원",
    category: "지역",
    distance: 6.2,
    availableBeds: { emergency: 8, icu: 0, ward: 20 },
    specialties: ["일반"],
    lat: 37.528,
    lng: 126.863,
    phone: "02-2600-2000"
  },
  {
    id: "h5",
    name: "연세365의원",
    category: "기관",
    distance: 1.1,
    availableBeds: { emergency: 1, icu: 0, ward: 0 },
    specialties: ["경증"],
    lat: 37.556,
    lng: 126.923,
    phone: "02-111-2222"
  }
];

// Tailwind classes for Backgrounds
export const KTAS_COLORS: Record<number, string> = {
  0: "bg-slate-500",
  1: "bg-red-600",
  2: "bg-orange-500",
  3: "bg-yellow-400",
  4: "bg-green-500",
  5: "bg-blue-500"
};

// Tailwind classes for Text Contrast
export const KTAS_TEXT_COLORS: Record<number, string> = {
  0: "text-white",
  1: "text-white",
  2: "text-white",
  3: "text-black", // Yellow needs black text
  4: "text-white",
  5: "text-white"
};

export const KTAS_LABELS: Record<number, string> = {
  0: "판정불가 (오류)",
  1: "소생 (1급)",
  2: "긴급 (2급)",
  3: "응급 (3급)",
  4: "준응급 (4급)",
  5: "비응급 (5급)"
};

// Simple keyword dictionary for highlighting simulation (Mocking the Keyword Extractor)
export const SYMPTOM_KEYWORDS = ["흉통", "호흡곤란", "출혈", "골절", "복통", "두통", "어지러움", "구토", "설사", "마비", "경련", "의식소실", "열상", "심정지", "통증"];
export const BODY_PART_KEYWORDS = ["머리", "가슴", "복부", "배", "팔", "다리", "허리", "목", "어깨", "무릎", "발목"];