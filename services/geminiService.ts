import { GoogleGenAI } from "@google/genai";
import { VitalSigns, KtasResult, ActivityLogEntry } from "../types";
import { KTAS_COLORS, KTAS_TEXT_COLORS } from "../constants";

// For this MVP demo, we bypass the API completely to ensure instant, hardcoded responses as requested.
// The user explicitly requested to NOT use the API and force hardcoded responses.

export const analyzeKtas = async (
  logs: ActivityLogEntry[],
  vitals: VitalSigns
): Promise<KtasResult> => {
  // Combine all logs into a single string for keyword matching
  const logContent = logs.map(l => l.content).join(" ");
  const vitalStr = JSON.stringify(vitals);

  // --- HARDCODED LOGIC 1: Lv.1 Resuscitation (심정지/무의식) ---
  if (logContent.includes("심정지") || logContent.includes("CPR") || logContent.includes("의식 없음") || logContent.includes("무의식") || logContent.includes("호흡 없음")) {
    return {
      level: 1,
      reasoning: "[긴급 판정] 환자는 현재 자발 호흡이 없거나 의식이 소실된 상태입니다. 심정지(Cardiac Arrest)가 강력히 의심되므로 즉각적인 소생술이 필요한 최상위 응급 단계(Level 1)입니다.",
      recommendedAction: "1. 즉시 CPR을 지속하며 AED 리듬 분석을 시행하십시오.\n2. 기도 유지(I-gel/LMA) 및 고농도 산소(15L/min)를 투여하십시오.\n3. 정맥로(IV) 확보 후 에피네프린 투여를 준비하십시오.",
      color: KTAS_COLORS[1],
      textColor: KTAS_TEXT_COLORS[1]
    };
  }
  
  // --- HARDCODED LOGIC 2: Lv.2 Emergency (흉통/호흡곤란/마비) ---
  if (logContent.includes("흉통") || logContent.includes("가슴") || logContent.includes("호흡곤란") || logContent.includes("숨") || logContent.includes("마비") || logContent.includes("식은땀")) {
    return {
      level: 2,
      reasoning: "[중증 판정] 흉통, 호흡곤란, 또는 식은땀은 급성 심근경색(STEMI)이나 대동맥 박리, 뇌졸중 등 치명적 질환의 전조 증상일 확률이 매우 높습니다.",
      recommendedAction: "1. 12유도 심전도(ECG)를 즉시 촬영하여 의료지도를 요청하십시오.\n2. SpO2 94% 미만 시 산소를 투여하고, 니트로글리세린(NTG) 투여를 고려하십시오.\n3. 뇌졸중 의심 시 FAST 평가를 수행하고 발병 시간을 확인하십시오.",
      color: KTAS_COLORS[2],
      textColor: KTAS_TEXT_COLORS[2]
    };
  }

  // --- HARDCODED LOGIC 3: Lv.3 Urgent (출혈/골절/복통/두통) ---
  if (logContent.includes("출혈") || logContent.includes("골절") || logContent.includes("복통") || logContent.includes("어지러움") || logContent.includes("두통") || logContent.includes("통증")) {
    return {
      level: 3,
      reasoning: "[응급 판정] 출혈, 골절 의심, 또는 심한 통증(NRS 7점 이상)이 확인됩니다. 활력징후가 변할 가능성이 있어 응급 처치 및 빠른 이송이 필요합니다.",
      recommendedAction: "1. 출혈 부위를 직접 압박하여 지혈하고, 골절 부위는 부목으로 고정하십시오.\n2. 쇼크 징후(빈맥, 저혈압)를 지속적으로 감시하십시오.\n3. 환자를 안심시키고 통증 양상을 구체적으로 파악하십시오.",
      color: KTAS_COLORS[3],
      textColor: KTAS_TEXT_COLORS[3]
    };
  }

  // --- HARDCODED LOGIC 4: Lv.4 Less Urgent (열상/발열/소화기) ---
  if (logContent.includes("열상") || logContent.includes("설사") || logContent.includes("구토") || logContent.includes("발열") || logContent.includes("오한")) {
     return {
      level: 4,
      reasoning: "[준응급 판정] 활력징후가 안정적이며, 증상이 단시간 내에 생명을 위협할 가능성이 낮습니다. (단순 열상, 소화기 증상 등)",
      recommendedAction: "1. 상처 부위를 소독하고 드레싱 하십시오.\n2. 체온을 측정하고 보온 조치를 취하십시오.\n3. 탈수 징후가 있는지 확인하십시오.",
      color: KTAS_COLORS[4],
      textColor: KTAS_TEXT_COLORS[4]
    };
  }

  // --- DEFAULT LOGIC: Lv.5 or Initial Assessment ---
  return {
    level: 5,
    reasoning: "[비응급/초기 판정] 현재까지 수집된 정보로는 즉각적인 처치가 필요한 응급 증상이 발견되지 않았습니다. 지속적인 관찰이 필요합니다.",
    recommendedAction: "1. 활력징후(BP, HR, BT)를 주기적으로 측정하십시오.\n2. 환자의 주호소를 명확히 파악하고 과거 병력을 청취하십시오.\n3. 보호자 연락 및 이송 가능한 병원을 확인하십시오.",
    color: KTAS_COLORS[5],
    textColor: KTAS_TEXT_COLORS[5]
  };
};

export const generateAiQuestion = async (logs: ActivityLogEntry[]): Promise<string> => {
  // Combine logs to find keywords
  const logContent = logs.map(l => l.content).join(" ");
  
  // --- INSTANT HARDCODED QUESTIONS ---
  if (logContent.includes("흉통") || logContent.includes("가슴")) {
    return "통증이 쥐어짜는 듯한 느낌(압박감)인가요, 아니면 찌르는 듯한 느낌인가요?";
  }
  if (logContent.includes("호흡") || logContent.includes("숨")) {
    return "숨이 차서 눕기가 힘드신가요? (앉아있어야 편한가요?)";
  }
  if (logContent.includes("의식") || logContent.includes("어지러움") || logContent.includes("쓰러") || logContent.includes("마비")) {
    return "당뇨나 고혈압 약을 드시고 계신가요? 마지막으로 약을 드신 게 언제인가요?";
  }
  if (logContent.includes("출혈") || logContent.includes("피") || logContent.includes("베임")) {
    return "피가 잘 멈추지 않나요? 아스피린 같은 혈전 용해제를 드시나요?";
  }
  if (logContent.includes("머리") || logContent.includes("두통")) {
    return "속이 메스껍거나 토할 것 같지는 않으신가요?";
  }
  if (logContent.includes("배") || logContent.includes("복통")) {
    return "배가 전체적으로 아픈가요, 아니면 특정 부위(오른쪽 아래 등)가 더 아픈가요?";
  }
  if (logContent.includes("교통사고") || logContent.includes("사고")) {
    return "사고 당시 상황이 기억나시나요? 머리를 부딪히셨나요?";
  }

  // Default rotating questions if no specific keyword matches
  const defaultQuestions = [
    "환자분, 제 말이 잘 들리시나요? 성함이 어떻게 되세요?",
    "평소에 앓고 있는 지병(당뇨, 고혈압 등)이 있으신가요?",
    "현재 가장 불편하거나 아픈 곳이 어디인지 정확히 말씀해 주세요."
  ];
  
  // Deterministic rotation based on log count to avoid randomness feeling
  return defaultQuestions[logs.length % defaultQuestions.length];
};

// --- Translation & Extraction Helpers (Keep as simple mock strings for now) ---

export const translateText = async (text: string, targetLang: string): Promise<string> => {
    if (targetLang === "Korean") return `[번역 완료] ${text}`;
    return `[Translated] ${text}`;
};

export const extractMedicalInfo = async (translatedText: string): Promise<string> => {
  return `[자동 추출] ${translatedText}`;
};

export const generateMissionReport = async (
  logs: ActivityLogEntry[],
  vitals: VitalSigns,
  ktas: KtasResult,
  missionId: string
): Promise<string> => {
    // Basic Mock Report Generation
    const logStr = logs.map(l => `- [${l.timestamp.toLocaleTimeString()}] ${l.content}`).join("\n");
    return `# 구급활동일지 (자동 생성)\n\n**출동 ID**: ${missionId}\n**작성 일시**: ${new Date().toLocaleString()}\n\n## 1. 환자 평가 (Pre-KTAS)\n- **등급**: Level ${ktas.level}\n- **근거**: ${ktas.reasoning}\n\n## 2. 활력 징후\n- BP: ${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg\n- HR: ${vitals.pulse} /min\n- SpO2: ${vitals.spo2} %\n\n## 3. 현장 활동 기록\n${logStr}\n\n## 4. 종합 소견\n환자의 상태는 ${ktas.level}급으로 판단되며, ${ktas.recommendedAction.split('\n')[0]} 등의 조치를 취함.`;
};