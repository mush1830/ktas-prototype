import React, { useState, useEffect, useRef } from 'react';
import { 
  Ambulance, Plus, Map as MapIcon,
  Activity, Send, Globe, FileText, 
  ClipboardCheck, AlertTriangle, CheckCircle, X, 
  CornerDownRight, Bot, Mic, UserPlus, Users, Lock, ChevronRight, Trash2, Save
} from 'lucide-react';
import { STATIONS, KTAS_LABELS, SYMPTOM_KEYWORDS, BODY_PART_KEYWORDS } from './constants';
import { ViewState, User, VitalSigns, KtasResult, ActivityLogEntry, TranslationItem, CrewMember } from './types';
import * as GeminiService from './services/geminiService';
import MapOverlay from './components/MapOverlay';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LOGIN');
  const [user, setUser] = useState<User>({ stationName: '', isAuthenticated: false });
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);

  const handleLogin = (station: string) => {
    setUser({ stationName: station, isAuthenticated: true });
    setView('HISTORY');
  };

  const startMission = (crew: CrewMember[]) => {
    const date = new Date();
    const newId = `MAPO_${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}_${Math.floor(Math.random() * 100).toString().padStart(3,'0')}`;
    setActiveMissionId(newId);
    // Crew info passed but simplified for this demo
    setView('DASHBOARD');
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 break-keep selection:bg-red-100">
      {view === 'LOGIN' && <LoginView onLogin={handleLogin} />}
      {view === 'HISTORY' && <HistoryView user={user} onStartMission={startMission} />}
      {view === 'DASHBOARD' && activeMissionId && (
        <DashboardView 
          user={user} 
          missionId={activeMissionId} 
          onEndMission={() => setView('HISTORY')} 
        />
      )}
    </div>
  );
};

// --- Helper Components ---

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label?: string }> = ({ checked, onChange, label }) => (
  <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onChange(!checked)}>
    <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out relative ${checked ? 'bg-green-500' : 'bg-slate-300'}`}>
      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </div>
    {label && <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 select-none">{label}</span>}
  </div>
);

// --- 1. Login View ---
const LoginView: React.FC<{ onLogin: (station: string) => void }> = ({ onLogin }) => {
  const [stationInput, setStationInput] = useState('');
  const [password, setPassword] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (stationInput.length > 0) {
      setSuggestions(STATIONS.filter(s => s.includes(stationInput)));
    } else {
      setSuggestions([]);
    }
  }, [stationInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stationInput) {
      setError('관할 소방서를 입력해주세요.');
      return;
    }
    if (password !== '119') {
      setError('비밀번호가 일치하지 않습니다. (초기값: 119)');
      return;
    }
    onLogin(stationInput);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-red-600 p-8 text-center">
          <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm shadow-inner">
            <Ambulance className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Smart Ambulance AI</h1>
          <p className="text-red-100 text-sm mt-1">지능형 구급활동 지원 시스템</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="relative">
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">관할 소방서 (Jurisdiction)</label>
            <input 
              type="text" 
              value={stationInput}
              onChange={(e) => { setStationInput(e.target.value); setError(''); }}
              className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-medium"
              placeholder="관할서 입력..."
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-xl mt-1 shadow-xl max-h-40 overflow-y-auto">
                {suggestions.map(s => (
                  <li key={s} onClick={() => { setStationInput(s); setSuggestions([]); }} className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm font-medium border-b border-slate-50 last:border-none">
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">비밀번호 (Password)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-medium"
                placeholder="비밀번호 최초: 119"
              />
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

          <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-transform active:scale-[0.98] shadow-lg">
            접속하기
          </button>
        </form>
      </div>
    </div>
  );
};

// --- 2. History View & Crew Input (Spec A2) ---
const HistoryView: React.FC<{ user: User, onStartMission: (crew: CrewMember[]) => void }> = ({ user, onStartMission }) => {
  const [showCrewModal, setShowCrewModal] = useState(false);
  // Default 3 members with Rank and Role
  const [crew, setCrew] = useState<CrewMember[]>([
    { name: '', role: '1급 응급구조사', rank: '소방교', id: '1' },
    { name: '', role: '2급 응급구조사', rank: '소방사', id: '2' },
    { name: '', role: '기관원(운전)', rank: '소방장', id: '3' }
  ]);

  const addCrewMember = () => setCrew([...crew, { name: '', role: '구급대원', rank: '소방사', id: Date.now().toString() }]);
  const removeCrewMember = (idx: number) => setCrew(crew.filter((_, i) => i !== idx));
  const updateCrew = (idx: number, field: keyof CrewMember, val: string) => {
    const newCrew = [...crew];
    // @ts-ignore
    newCrew[idx] = { ...newCrew[idx], [field]: val };
    setCrew(newCrew);
  };
  
  const handleStart = () => {
    if (crew.some(c => !c.name)) {
      alert("대원 이름을 모두 입력해주세요.");
      return;
    }
    onStartMission(crew);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-lg shadow-sm"><Ambulance className="w-5 h-5 text-white" /></div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">{user.stationName}</h1>
            <p className="text-xs text-slate-500">인증됨 • 세션 활성</p>
          </div>
        </div>
        <button onClick={() => window.location.reload()} className="text-xs font-bold text-slate-400 hover:text-slate-600">로그아웃</button>
      </header>
      
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">출동 이력</h2>
          <button onClick={() => setShowCrewModal(true)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95">
            <Plus className="w-5 h-5" /> 새 출동 시작
          </button>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm min-h-[400px] flex items-center justify-center flex-col gap-4">
           <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
             <ClipboardCheck className="w-8 h-8 text-slate-300" />
           </div>
           <p className="text-slate-500 font-medium">최근 출동 기록이 없습니다.</p>
        </div>
      </main>

      {/* Crew Input Modal (Updated for visibility and inputs) */}
      {showCrewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2"><Users className="w-5 h-5" /> 출동 대원 정보 입력</h3>
              <button onClick={() => setShowCrewModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-500 mb-1 px-4">
                 <div className="col-span-1">No.</div>
                 <div className="col-span-3">계급</div>
                 <div className="col-span-3">성명</div>
                 <div className="col-span-4">자격(임무)</div>
                 <div className="col-span-1"></div>
              </div>

              {crew.map((member, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className="w-6 text-center font-bold text-slate-400">{idx + 1}</div>
                  
                  {/* Rank Input */}
                  <select 
                     className="flex-1 p-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                     value={member.rank}
                     onChange={(e) => updateCrew(idx, 'rank', e.target.value)}
                  >
                     <option>소방사</option>
                     <option>소방교</option>
                     <option>소방장</option>
                     <option>소방위</option>
                     <option>소방경</option>
                  </select>

                  {/* Name Input */}
                  <input 
                    placeholder="성명 입력" 
                    className="flex-1 p-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={member.name}
                    onChange={(e) => updateCrew(idx, 'name', e.target.value)}
                  />

                  {/* Role Input */}
                  <select 
                    className="flex-[1.5] p-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={member.role}
                    onChange={(e) => updateCrew(idx, 'role', e.target.value)}
                  >
                    <option>1급 응급구조사</option>
                    <option>2급 응급구조사</option>
                    <option>간호사</option>
                    <option>구급교육 수료</option>
                    <option>기관원(운전)</option>
                    <option>기타</option>
                  </select>

                  {/* Delete Button */}
                  {crew.length > 1 && (
                    <button onClick={() => removeCrewMember(idx)} className="text-slate-400 hover:text-red-500 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addCrewMember} className="w-full py-3 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 flex items-center justify-center gap-2 border border-slate-200">
                <UserPlus className="w-4 h-4" /> 대원 추가
              </button>
            </div>
            <div className="p-4 border-t bg-slate-50">
              <button onClick={handleStart} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-red-700">
                출동 시작 (Start Mission)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 3. Dashboard View (Main Core) ---
const DashboardView: React.FC<{ user: User, missionId: string, onEndMission: () => void }> = ({ user, missionId, onEndMission }) => {
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [vitals, setVitals] = useState<VitalSigns>({ bpSystolic: '', bpDiastolic: '', pulse: '', resp: '', temp: '', spo2: '' });
  const [ktas, setKtas] = useState<KtasResult | null>(null);
  
  const [aiQuestion, setAiQuestion] = useState<string>('');
  
  const [input, setInput] = useState('');
  const [isSttOn, setIsSttOn] = useState(false);
  const [showTranslate, setShowTranslate] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [reportContent, setReportContent] = useState('');
  
  const [transHistory, setTransHistory] = useState<TranslationItem[]>([]);
  const [isTransListening, setIsTransListening] = useState(false);
  const [transInput, setTransInput] = useState('');
  
  const logsEndRef = useRef<HTMLDivElement>(null);
  const transEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const vitalsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevVitalsRef = useRef<string>('');
  const prevKtasLevelRef = useRef<number | null>(null);

  useEffect(() => {
    addLog('INFO', `출동 세션 시작 [${missionId}]`);
    addLog('CREW', `이송자 정보 등록 완료 (3명 탑승)`);
    addLog('INFO', `GPS 위치 추적 시작...`);
  }, []);

  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activityLogs]);
  useEffect(() => { transEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [transHistory, showTranslate]);

  // KTAS Auto-Log Logic (Logs ONLY when level changes)
  useEffect(() => {
    if (ktas && ktas.level !== prevKtasLevelRef.current) {
        if (prevKtasLevelRef.current !== null) {
            addLog('KTAS_CHANGE', `KTAS 등급 변경: LV.${prevKtasLevelRef.current} → LV.${ktas.level} (${ktas.reasoning.substring(0, 30)}...)`);
        } else {
            addLog('KTAS_CHANGE', `초기 KTAS 평가: LV.${ktas.level} (${ktas.reasoning.substring(0, 30)}...)`);
        }
        prevKtasLevelRef.current = ktas.level;
    }
  }, [ktas]);

  // Vitals Auto-Log Logic
  useEffect(() => {
    const currentVitalsStr = JSON.stringify(vitals);
    // Don't log empty init state or if nothing changed
    if (Object.values(vitals).every(v => v === '')) return;
    if (prevVitalsRef.current === currentVitalsStr) return;

    if (vitalsTimeoutRef.current) clearTimeout(vitalsTimeoutRef.current);

    vitalsTimeoutRef.current = setTimeout(() => {
      // Log if any field has value
      const hasValue = Object.values(vitals).some(v => v !== '');
      if (hasValue) {
        logVitalsToHistory();
      }
    }, 1500); // 1.5s debounce
    
    return () => {
        if (vitalsTimeoutRef.current) clearTimeout(vitalsTimeoutRef.current);
    };
  }, [vitals]);

  const logVitalsToHistory = () => {
    const bp = vitals.bpSystolic ? `BP:${vitals.bpSystolic}/${vitals.bpDiastolic}` : '';
    const hr = vitals.pulse ? `HR:${vitals.pulse}` : '';
    const spo2 = vitals.spo2 ? `SpO2:${vitals.spo2}%` : '';
    const rr = vitals.resp ? `RR:${vitals.resp}` : '';
    const bt = vitals.temp ? `BT:${vitals.temp}` : '';
    
    const content = [bp, hr, spo2, rr, bt].filter(Boolean).join(', ');
    if (content) {
        addLog('VITALS', `활력징후 기록: ${content}`);
        prevVitalsRef.current = JSON.stringify(vitals);
    }
  };

  // MAIN AI LOGIC: INSTANT RESPONSE
  useEffect(() => {
    if (activityLogs.length === 0) return;
    
    const runAnalysis = async () => {
      // KTAS - Instant
      const newKtas = await GeminiService.analyzeKtas(activityLogs, vitals);
      setKtas(prev => {
        if (!prev || prev.level !== newKtas.level || prev.reasoning !== newKtas.reasoning) {
          return newKtas;
        }
        return prev;
      });
      
      // Question generation - Instant
      const q = await GeminiService.generateAiQuestion(activityLogs);
      setAiQuestion(q);
    };

    runAnalysis();
    
  }, [activityLogs.length]); 

  const formatContentWithKeywords = (text: string): React.ReactNode => {
    const parts = text.split(/(\s+)/);
    return (
      <span>
        {parts.map((part, i) => {
          if (SYMPTOM_KEYWORDS.some(k => part.includes(k))) {
            return <span key={i} className="text-red-600 font-bold bg-red-50 rounded px-0.5">{part}</span>;
          }
          if (BODY_PART_KEYWORDS.some(k => part.includes(k))) {
            return <span key={i} className="text-blue-600 font-bold bg-blue-50 rounded px-0.5">{part}</span>;
          }
          return part;
        })}
      </span>
    );
  };

  const addLog = (type: ActivityLogEntry['type'], content: string) => {
    setActivityLogs(prev => [...prev, {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      content,
      highlightedContent: formatContentWithKeywords(content)
    }]);
  };

  const handleSend = (text: string = input) => {
    if (!text.trim()) return;
    addLog('STT', text); 
    setInput('');
  };

  const handleAutoDetectVoice = () => {
    setIsTransListening(true);
    
    setTimeout(() => {
      const medicText = "어디가 가장 아프신가요?";
      const newItem1: TranslationItem = {
        id: Date.now().toString(),
        sender: 'PARAMEDIC',
        original: medicText,
        translated: "Where does it hurt the most?",
        timestamp: new Date(),
        isApplied: false
      };
      setTransHistory(prev => [...prev, newItem1]);

      setTimeout(() => {
        const patientText = "My chest feels like it's being squeezed.";
        const newItem2: TranslationItem = {
          id: (Date.now() + 1).toString(),
          sender: 'PATIENT',
          original: patientText,
          translated: "[통역] 가슴이 쥐어짜는 듯한 느낌입니다.",
          timestamp: new Date(),
          isApplied: false
        };
        setTransHistory(prev => [...prev, newItem2]);
        setIsTransListening(false);
      }, 1000);

    }, 500);
  };

  const handleTransTextSend = async () => {
    if (!transInput.trim()) return;
    
    const newItem: TranslationItem = {
      id: Date.now().toString(),
      sender: 'PARAMEDIC',
      original: transInput,
      translated: "Translating...",
      timestamp: new Date(),
      isApplied: false
    };
    setTransHistory(prev => [...prev, newItem]);
    setTransInput('');

    const translated = await GeminiService.translateText(transInput, 'English');
    setTransHistory(prev => prev.map(item => item.id === newItem.id ? { ...item, translated } : item));
  };

  const handleTransApply = async (item: TranslationItem) => {
    if (item.isApplied) return;
    
    const sourceText = item.sender === 'PATIENT' ? item.translated : item.original;
    
    addLog('INFO', '번역 데이터 기록 중...');
    const extractedInfo = await GeminiService.extractMedicalInfo(sourceText);
    
    addLog('TRANSLATION_DATA', extractedInfo);
    setTransHistory(prev => prev.map(t => t.id === item.id ? { ...t, isApplied: true } : t));
  };

  const generateReport = async () => {
    setShowReport(true);
    setReportContent("AI가 로그 데이터를 분석하여 일지를 작성 중입니다...");
    const result = await GeminiService.generateMissionReport(
      activityLogs, 
      vitals, 
      ktas || { level: 0, reasoning: '미평가', recommendedAction: '', color: '', textColor: '' }, 
      missionId
    );
    setReportContent(result);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-200 overflow-hidden relative">
      
      {/* Header */}
      <div className="bg-slate-900 text-white h-14 flex items-center justify-between px-4 shadow-md z-30 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-mono leading-none tracking-widest">{missionId}</span>
            <span className="font-bold text-base flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              LIVE MISSION
            </span>
          </div>
          <div className="h-6 w-px bg-slate-700 mx-2"></div>
          <button onClick={() => setShowMap(true)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded text-xs font-bold transition-colors">
            <MapIcon className="w-4 h-4 text-blue-400" /> 병원 현황 지도
          </button>
        </div>
        <button onClick={onEndMission} className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded font-bold text-xs shadow-lg transition-transform active:scale-95">
          출동 종료
        </button>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Activity Log */}
        <div className="w-1/2 flex flex-col bg-white border-r border-slate-300 relative z-0">
          <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
              <ClipboardCheck className="w-4 h-4 text-slate-500" /> 활동 로그 (Activity Log)
            </h2>
            <div className="flex items-center gap-1">
               <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
               <span className="text-[10px] font-bold text-red-500">REC</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {activityLogs.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Activity className="w-10 h-10 mb-2 opacity-20" />
                <span className="text-xs">활동 기록 대기 중...</span>
              </div>
            )}
            {activityLogs.map((log) => (
              <div key={log.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="font-mono text-[10px] text-slate-400 mt-1.5 min-w-[50px] text-right">
                  {log.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                </span>
                <div className="flex-1 group">
                   <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        log.type === 'STT' ? 'bg-indigo-100 text-indigo-700' :
                        log.type === 'KTAS_CHANGE' ? 'bg-red-100 text-red-700' :
                        log.type === 'TRANSLATION_DATA' ? 'bg-blue-100 text-blue-700' :
                        log.type === 'VITALS' ? 'bg-orange-100 text-orange-700' :
                        log.type === 'CREW' ? 'bg-purple-100 text-purple-700' :
                        log.type === 'INFO' ? 'bg-slate-200 text-slate-600' :
                        'bg-green-100 text-green-700'
                      }`}>{log.type}</span>
                   </div>
                   <div className="bg-white p-3 rounded-lg rounded-tl-none border border-slate-200 shadow-sm text-sm text-slate-800 leading-relaxed break-all group-hover:border-blue-200 transition-colors">
                     {log.highlightedContent || log.content}
                   </div>
                </div>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* Right: Dashboard */}
        <div className="w-1/2 flex flex-col bg-slate-100 overflow-y-auto">
          
          {/* KTAS Status - EXPANDED HEIGHT & SCROLL */}
          <div className={`p-6 transition-all duration-500 shadow-md relative overflow-hidden ${ktas ? ktas.color : 'bg-slate-700'} ${ktas ? ktas.textColor : 'text-slate-300'}`}>
            <div className="absolute top-0 right-0 p-4 opacity-10"><AlertTriangle className="w-32 h-32" /></div>
            <div className="relative z-10">
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <span className="text-xs font-bold opacity-75 uppercase tracking-wider block mb-1">Pre-KTAS Assessment</span>
                   <div className="text-6xl font-black flex items-baseline gap-3 tracking-tighter">
                      {ktas ? `LV.${ktas.level}` : '-'}
                      <span className="text-3xl font-bold opacity-80">{ktas && KTAS_LABELS[ktas.level] ? KTAS_LABELS[ktas.level].split('(')[0] : '평가 대기'}</span>
                   </div>
                 </div>
                 {ktas && <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border border-white/10">AI Confidence: High</div>}
               </div>
               
               {/* Reasoning & Action - Scrollable Containers with MORE HEIGHT */}
               <div className="grid gap-2">
                  <div className="bg-black/10 rounded-xl p-3 backdrop-blur-sm border border-white/5 flex flex-col min-h-[140px] max-h-[300px]">
                     <span className="text-[10px] font-bold opacity-70 block mb-1 uppercase shrink-0">판정 근거 (Reasoning)</span>
                     <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 pr-2 flex-1">
                        <p className="text-sm font-medium leading-relaxed">
                            {ktas?.reasoning || "데이터 수집 및 분석 중..."}
                        </p>
                     </div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm flex flex-col min-h-[120px] max-h-[300px]">
                     <div className="flex items-center gap-2 mb-1 shrink-0">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-[10px] font-bold opacity-70 uppercase">권장 조치 (Action)</span>
                     </div>
                     <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 pr-2 flex-1">
                         <p className="text-sm font-bold leading-relaxed whitespace-pre-line">
                            {ktas?.recommendedAction || "활력징후 측정 및 환자 평가를 진행하세요."}
                         </p>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Vitals Input */}
          <div className="p-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                   <Activity className="w-4 h-4 text-red-500" /> 활력 징후 (Vital Signs)
                 </h3>
                 <div className="flex items-center gap-2">
                    <button 
                       onClick={() => logVitalsToHistory()} 
                       className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-800 transition-colors"
                    >
                       <Save className="w-3 h-3" /> 기록 (Log)
                    </button>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1.5 rounded font-bold flex items-center gap-1">
                       <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> DEVICE
                    </span>
                 </div>
               </div>
               
               <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <label className="text-xs text-slate-500 block mb-1 font-bold">혈압 (mmHg)</label>
                    <div className="flex gap-1 items-center">
                       <input type="number" placeholder="120" value={vitals.bpSystolic} onChange={(e) => setVitals({...vitals, bpSystolic: e.target.value})} className="w-full bg-white border-b-2 border-slate-200 focus:border-red-500 outline-none text-center font-mono font-bold text-lg text-slate-900" />
                       <span className="text-slate-300">/</span>
                       <input type="number" placeholder="80" value={vitals.bpDiastolic} onChange={(e) => setVitals({...vitals, bpDiastolic: e.target.value})} className="w-full bg-white border-b-2 border-slate-200 focus:border-red-500 outline-none text-center font-mono font-bold text-lg text-slate-900" />
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <label className="text-xs text-slate-500 block mb-1 font-bold">맥박 (BPM)</label>
                    <input type="number" placeholder="72" value={vitals.pulse} onChange={(e) => setVitals({...vitals, pulse: e.target.value})} className="w-full bg-white border-b-2 border-slate-200 focus:border-red-500 outline-none text-center font-mono font-bold text-lg text-slate-900" />
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <label className="text-xs text-slate-500 block mb-1 font-bold">SpO2 (%)</label>
                    <input type="number" placeholder="98" value={vitals.spo2} onChange={(e) => setVitals({...vitals, spo2: e.target.value})} className="w-full bg-white border-b-2 border-slate-200 focus:border-red-500 outline-none text-center font-mono font-bold text-lg text-slate-900" />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <label className="text-xs text-slate-500 block mb-1 font-bold">체온 (°C)</label>
                    <input type="number" placeholder="36.5" value={vitals.temp} onChange={(e) => setVitals({...vitals, temp: e.target.value})} className="w-full bg-white border-b-2 border-slate-200 focus:border-red-500 outline-none text-center font-mono font-bold text-lg text-slate-900" />
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <label className="text-xs text-slate-500 block mb-1 font-bold">호흡 (회/분)</label>
                    <input type="number" placeholder="18" value={vitals.resp} onChange={(e) => setVitals({...vitals, resp: e.target.value})} className="w-full bg-white border-b-2 border-slate-200 focus:border-red-500 outline-none text-center font-mono font-bold text-lg text-slate-900" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Area */}
      <div className="bg-white border-t border-slate-300 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-20 relative px-4 pb-4 pt-4">
        
        {/* AI Chatbot Bubble */}
        {(aiQuestion) && (
           <div className="absolute bottom-full left-4 mb-4 z-40 animate-in zoom-in-95 slide-in-from-bottom-5">
              <div className="flex items-end gap-3">
                 <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-lg border-2 border-white z-10 shrink-0">
                    <Bot className="w-6 h-6 text-white" />
                 </div>
                 <div className="bg-white rounded-2xl rounded-bl-none shadow-xl border border-blue-100 p-4 max-w-md relative">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-1.5 py-0.5 rounded">AI Medic</span>
                    </div>
                    
                    {/* INSTANT QUESTION DISPLAY (No typing animation) */}
                    <div className="animate-in fade-in">
                        <p className="font-bold text-slate-800 text-sm leading-relaxed mb-3">
                          "{aiQuestion}"
                        </p>
                        <div className="flex gap-2">
                           <button onClick={() => { inputRef.current?.focus(); }} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-lg font-bold transition-colors flex-1">
                              답변하기
                           </button>
                           <button onClick={() => setAiQuestion('')} className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs px-3 py-2 rounded-lg font-bold transition-colors">
                              숨기기
                           </button>
                        </div>
                    </div>

                    <div className="absolute bottom-0 -left-2 w-4 h-4 bg-white border-b border-l border-blue-100 transform rotate-45 skew-y-12"></div>
                 </div>
              </div>
           </div>
        )}

        <div className="max-w-7xl mx-auto flex items-end gap-4">
          
          {/* Left Controls */}
          <div className="flex items-center gap-6 mr-4 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 shadow-sm shrink-0">
             {/* STT Toggle */}
             <div className="flex flex-col items-center gap-1 px-2">
               <ToggleSwitch checked={isSttOn} onChange={setIsSttOn} />
               <span className={`text-[10px] font-bold ${isSttOn ? 'text-green-600' : 'text-slate-400'}`}>{isSttOn ? 'STT ON' : 'STT OFF'}</span>
             </div>
             <div className="h-8 w-px bg-slate-300"></div>
             
             {/* Translation Button */}
             <button onClick={() => setShowTranslate(true)} className="flex flex-col items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors px-2">
               <div className="bg-white p-2 rounded-full shadow-sm border border-slate-200">
                  <Globe className="w-5 h-5" />
               </div>
               <span className="text-[10px] font-bold">의료 통역</span>
             </button>
             
             <div className="h-8 w-px bg-slate-300"></div>
             
             {/* Report Button */}
             <button onClick={generateReport} className="flex flex-col items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors px-2">
               <div className="bg-white p-2 rounded-full shadow-sm border border-slate-200">
                  <FileText className="w-5 h-5" />
               </div>
               <span className="text-[10px] font-bold">일지 작성</span>
             </button>
          </div>

          {/* Main Input */}
          <div className="flex-1 flex gap-2 h-14">
            <input 
              ref={inputRef}
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isSttOn ? "음성 인식 중... (수동 입력 가능)" : "환자 상태, 증상, 처치 내역 입력..."}
              className={`flex-1 px-6 rounded-2xl border-2 outline-none font-bold text-lg transition-all shadow-sm ${isSttOn ? 'border-green-400 bg-green-50 text-slate-900 placeholder:text-green-700' : 'border-slate-300 bg-white text-slate-900 focus:border-blue-500'}`}
            />
            <button onClick={() => handleSend()} className="bg-slate-900 text-white w-14 rounded-2xl hover:bg-slate-800 transition-transform active:scale-95 shadow-lg flex items-center justify-center">
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* --- Overlays --- */}
      
      <MapOverlay isOpen={showMap} onClose={() => setShowMap(false)} userLocation={null} ktasLevel={ktas?.level || 5} />
      
      {/* Translation Modal */}
      {showTranslate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-3xl h-[85vh] rounded-t-3xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10">
              
              <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0">
                 <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg"><Globe className="w-6 h-6 text-white" /></div>
                    <div>
                       <h3 className="font-bold text-lg leading-none">의료 통역 모드</h3>
                       <p className="text-xs text-slate-400 mt-1">Medical Translation Mode (Auto-Detect)</p>
                    </div>
                 </div>
                 <button onClick={() => setShowTranslate(false)} className="bg-slate-800 p-2 rounded-full hover:bg-slate-700"><X className="w-6 h-6 text-white" /></button>
              </div>

              <div className="flex-1 bg-slate-100 overflow-y-auto p-6 space-y-6">
                 {transHistory.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                       <Globe className="w-16 h-16 mb-4" />
                       <p className="text-center">버튼을 눌러 대화를 시작하세요.<br/>(자동으로 화자를 구분합니다)</p>
                    </div>
                 )}
                 {transHistory.map(item => (
                    <div key={item.id} className={`flex flex-col max-w-[85%] ${item.sender === 'PARAMEDIC' ? 'self-end items-end' : 'self-start items-start'}`}>
                       
                       <div className="text-xs font-bold text-slate-500 mb-1 ml-1">
                          {item.sender === 'PARAMEDIC' ? '구급대원 (Paramedic)' : '환자 (Patient)'}
                       </div>

                       <div className={`px-5 py-4 rounded-3xl text-base shadow-sm leading-relaxed ${
                          item.sender === 'PARAMEDIC' 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
                       }`}>
                          <div className="font-medium mb-2 opacity-90">{item.original}</div>
                          <div className={`text-sm font-bold flex items-start gap-2 pt-2 border-t ${item.sender === 'PARAMEDIC' ? 'border-white/20' : 'border-slate-100'}`}>
                             <CornerDownRight className="w-4 h-4 mt-0.5 shrink-0 opacity-70" />
                             <span className={item.sender === 'PARAMEDIC' ? 'text-yellow-300' : 'text-blue-600'}>{item.translated}</span>
                          </div>
                       </div>
                       
                       {item.sender === 'PATIENT' && (
                          <button 
                             onClick={() => handleTransApply(item)}
                             disabled={item.isApplied}
                             className={`mt-2 ml-1 text-xs flex items-center gap-1.5 px-4 py-2 rounded-full font-bold transition-all ${
                                item.isApplied 
                                ? 'bg-green-100 text-green-700 cursor-default' 
                                : 'bg-slate-200 text-slate-700 hover:bg-green-600 hover:text-white shadow-sm'
                             }`}
                          >
                             {item.isApplied ? <CheckCircle className="w-3 h-3" /> : <ClipboardCheck className="w-3 h-3" />}
                             {item.isApplied ? '반영 완료' : '구급활동 반영'}
                          </button>
                       )}
                    </div>
                 ))}
                 <div ref={transEndRef} />
              </div>

              <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                 <button 
                    onClick={handleAutoDetectVoice}
                    disabled={isTransListening}
                    className={`w-full py-6 rounded-2xl flex items-center justify-center gap-3 shadow-lg mb-4 transition-all active:scale-[0.98] ${
                       isTransListening 
                       ? 'bg-red-50 border-2 border-red-500 text-red-600' 
                       : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                 >
                    {isTransListening ? (
                       <>
                          <span className="relative flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                          </span>
                          <span className="font-bold text-lg">듣는 중... (Listening...)</span>
                       </>
                    ) : (
                       <>
                          <Mic className="w-6 h-6" />
                          <span className="font-bold text-lg">자동 언어 감지 및 통역 (Tap to Speak)</span>
                       </>
                    )}
                 </button>

                 <div className="flex gap-2">
                    <input 
                       type="text" 
                       value={transInput}
                       onChange={(e) => setTransInput(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleTransTextSend()}
                       placeholder="텍스트 직접 입력 (구급대원)..."
                       className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                    />
                    <button 
                       onClick={handleTransTextSend}
                       className="bg-slate-900 text-white px-4 rounded-xl hover:bg-slate-800"
                    >
                       <Send className="w-5 h-5" />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden">
             <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                   <div className="bg-slate-900 p-2 rounded-lg"><FileText className="w-5 h-5 text-white" /></div>
                   <h3 className="font-bold text-xl text-slate-900">구급활동일지 초안 (AI Draft)</h3>
                </div>
                <button onClick={() => setShowReport(false)} className="bg-white p-2 rounded-full shadow-sm hover:bg-slate-100"><X className="w-5 h-5 text-slate-500" /></button>
             </div>
             <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 min-h-[600px]">
                   <div className="prose prose-slate max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-800">{reportContent}</pre>
                   </div>
                </div>
             </div>
             <div className="p-5 border-t border-slate-200 flex gap-4 justify-end bg-white">
                <button onClick={() => setShowReport(false)} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">닫기</button>
                <button className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg flex items-center gap-2">
                   <CheckCircle className="w-5 h-5" /> PDF 변환 및 전송
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;