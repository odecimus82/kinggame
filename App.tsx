import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Play, RotateCcw, Volume2, Trophy, Flame, ChevronRight, XCircle, CheckCircle, Lock, Star, ChevronLeft, Shield, Sword, Book, User, Mic, ChevronDown, Eye, EyeOff, Clock, Calendar, Zap, Target, TrendingUp, Map, Layers, LayoutGrid, X, AlertTriangle, GraduationCap, RefreshCw, Wand2, Headphones, Keyboard, Award, ChevronUp, ShoppingBag, Plus, Trash2, Gift, History, Settings, LogOut, ArrowRight, Crown, Quote, CalendarCheck, Edit2, Save, XSquare, Info, Percent, CircleDollarSign, Wrench, Activity, BarChart3, PieChart } from 'lucide-react';
import Layout from './components/Layout';
import { AppView, Rank, UserStats, Word, WrongAnswer, BattleRecord, ExamQuestion, ShopItem, RedemptionRecord } from './types';
import { VOCABULARY_DATA, EXAM_DATA, UNITS, getWordsByUnit, getExamQuestionsByUnit, LIBRARY_STRUCTURE } from './services/vocabData';

// --- Daily Quotes Data ---
const DAILY_QUOTES = [
    { en: "The journey of a thousand miles begins with a single step.", ch: "千里之行，始于足下。" },
    { en: "Knowledge is power.", ch: "知识就是力量。" },
    { en: "Believe you can and you're halfway there.", ch: "相信自己，你已经成功了一半。" },
    { en: "Practice makes perfect.", ch: "熟能生巧。" },
    { en: "Learning never exhausts the mind.", ch: "学而不厌。" },
    { en: "No pain, no gain.", ch: "没有付出就没有收获。" },
    { en: "Time is money.", ch: "一寸光阴一寸金。" },
    { en: "Stay hungry, stay foolish.", ch: "求知若饥，虚心若愚。" },
];

// --- Achievements Data ---
const ACHIEVEMENTS = [
  { id: 'first_blood', name: '初露锋芒', desc: '完成 1 场实战', icon: <Sword size={18}/>, condition: (s: UserStats) => s.matchesPlayed >= 1 },
  { id: 'battle_hardened', name: '身经百战', desc: '完成 10 场实战', icon: <Target size={18}/>, condition: (s: UserStats) => s.matchesPlayed >= 10 },
  { id: 'scholar', name: '勤奋学员', desc: '学习时长达 30 分钟', icon: <Clock size={18}/>, condition: (s: UserStats) => s.studyMinutes >= 30 },
  { id: 'master', name: '博学多才', desc: '学习时长达 2 小时', icon: <Book size={18}/>, condition: (s: UserStats) => s.studyMinutes >= 120 },
  { id: 'wealthy', name: '腰缠万贯', desc: '拥有 500 金币', icon: <Zap size={18}/>, condition: (s: UserStats) => s.gold >= 500 },
];

const DEFAULT_SHOP_ITEMS: ShopItem[] = [
    { id: 'item_1', name: '免做作业卡', price: 500, icon: '🎫', description: '一次免做英语作业的机会' },
    { id: 'item_2', name: '游戏时间 1h', price: 300, icon: '🎮', description: '兑换 1 小时手机游戏时间' },
    { id: 'item_3', name: '美味零食', price: 100, icon: '🍟', description: '兑换任意 10 元内零食' },
    { id: 'item_4', name: '奶茶一杯', price: 200, icon: '🥤', description: '兑换下午茶奶茶一杯' },
];

// --- Shop Icon Presets ---
const SHOP_ICONS = [
    '🎫', '🎮', '🍟', '🥤', '🎁', 
    '🍦', '🍔', '🍕', '🎟️', '⚽', 
    '🏀', '🎨', '📱', '💻', '🎧', 
    '📚', '🏖️', '🚲', '🎸', '⏰'
];

// --- Hero Avatars (HoK Inspired Seeds) ---
const HERO_AVATARS = [
    { name: 'Arthur', label: '亚瑟' },
    { name: 'Angela', label: '安琪拉' },
    { name: 'HouYi', label: '后羿' },
    { name: 'Daji', label: '妲己' },
    { name: 'Libai', label: '李白' },
    { name: 'HanXin', label: '韩信' },
    { name: 'Mulan', label: '花木兰' },
    { name: 'LuBu', label: '吕布' },
    { name: 'DiaoChan', label: '貂蝉' },
    { name: 'ZhugeLiang', label: '诸葛亮' },
    { name: 'SunWukong', label: '孙悟空' },
    { name: 'Yao', label: '瑶' },
    { name: 'MarcoPolo', label: '马可波罗' },
    { name: 'Kai', label: '铠' },
    { name: 'Luna', label: '露娜' },
    { name: 'Shouyue', label: '百里守约' },
    { name: 'GongsunLi', label: '公孙离' },
    { name: 'DaQiao', label: '大乔' },
    { name: 'XiaoQiao', label: '小乔' },
    { name: 'ChengYaojin', label: '程咬金' },
];

// --- Rank System Logic (Honor of Kings Style) ---
const EXP_PER_STAR = 5000;
const GOLD_PER_LEVEL = 5000;

const RANK_CONFIG = [
    { name: Rank.BRONZE,  starsPerSub: 3, subTiers: 3, baseExp: 0, color: 'from-emerald-700 to-emerald-900', iconColor: 'text-emerald-400' },
    { name: Rank.SILVER,  starsPerSub: 3, subTiers: 3, baseExp: 45000, color: 'from-slate-500 to-slate-700', iconColor: 'text-blue-200' },
    { name: Rank.GOLD,    starsPerSub: 4, subTiers: 4, baseExp: 90000, color: 'from-yellow-600 to-yellow-800', iconColor: 'text-yellow-400' },
    { name: Rank.PLATINUM, starsPerSub: 4, subTiers: 4, baseExp: 170000, color: 'from-cyan-600 to-cyan-800', iconColor: 'text-cyan-300' },
    { name: Rank.DIAMOND, starsPerSub: 5, subTiers: 5, baseExp: 250000, color: 'from-purple-600 to-purple-900', iconColor: 'text-purple-300' },
    { name: Rank.STAR,    starsPerSub: 5, subTiers: 5, baseExp: 375000, color: 'from-orange-600 to-red-800', iconColor: 'text-orange-400' },
    { name: Rank.KING,    starsPerSub: 9999, subTiers: 1, baseExp: 500000, color: 'from-yellow-500 via-red-500 to-purple-600', iconColor: 'text-yellow-200' }
];

const getRankInfo = (exp: number) => {
    const totalStars = Math.floor(exp / EXP_PER_STAR);
    const expForNextStar = EXP_PER_STAR - (exp % EXP_PER_STAR);
    const currentStarExp = exp % EXP_PER_STAR;
    
    let currentConfig = RANK_CONFIG[0];
    let starsRemaining = totalStars;

    for (const config of RANK_CONFIG) {
        if (config.name === Rank.KING) {
            currentConfig = config;
            break;
        }
        const starsInThisRank = config.starsPerSub * config.subTiers;
        if (starsRemaining < starsInThisRank) {
            currentConfig = config;
            break;
        }
        starsRemaining -= starsInThisRank;
    }

    if (currentConfig.name === Rank.KING) {
        return {
            title: `${Rank.KING} ${starsRemaining}星`,
            displayTitle: Rank.KING,
            subRank: `${starsRemaining} Stars`,
            progress: 100,
            nextExp: null,
            needed: 0,
            currentStars: starsRemaining,
            maxStars: Infinity,
            config: currentConfig,
            currentStarExp: currentStarExp
        };
    }

    const subTierIndex = Math.floor(starsRemaining / currentConfig.starsPerSub); 
    const romanNumerals = ["I", "II", "III", "IV", "V"].slice(0, currentConfig.subTiers).reverse();
    const currentSubTier = romanNumerals[subTierIndex] || "I";
    
    const starsInCurrentSub = starsRemaining % currentConfig.starsPerSub;
    const progress = (starsInCurrentSub / currentConfig.starsPerSub) * 100;
    
    return {
        title: `${currentConfig.name} ${currentSubTier}`,
        displayTitle: currentConfig.name,
        subRank: currentSubTier,
        progress: progress,
        nextExp: (totalStars + 1) * EXP_PER_STAR,
        needed: ((totalStars + 1) * EXP_PER_STAR) - exp,
        currentStars: starsInCurrentSub,
        maxStars: currentConfig.starsPerSub,
        config: currentConfig,
        currentStarExp: currentStarExp
    };
};

const getLevelInfo = (totalGold: number) => {
    const level = Math.floor(totalGold / GOLD_PER_LEVEL) + 1;
    const discountPercent = Math.min(Math.max(level - 1, 0), 20);
    const nextLevelGold = level * GOLD_PER_LEVEL;
    const progress = ((totalGold % GOLD_PER_LEVEL) / GOLD_PER_LEVEL) * 100;
    
    return {
        level,
        discountPercent,
        discountMultiplier: 1 - (discountPercent / 100),
        nextLevelGold,
        progress
    };
};

// --- Helper Functions ---
const getLocalTodayDate = () => {
    // Returns date string in YYYY-MM-DD format based on local time
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const generateSimilarQuestion = (original: ExamQuestion): ExamQuestion => {
    let newQ = { ...original, id: original.id + '-variant-' + Date.now() };
    if (newQ.question.includes('He ')) newQ.question = newQ.question.replace('He ', 'She ');
    else if (newQ.question.includes('She ')) newQ.question = newQ.question.replace('She ', 'He ');
    else if (newQ.question.includes('I ')) newQ.question = newQ.question.replace('I ', 'They ');
    
    if (newQ.question.includes('yesterday')) newQ.question = newQ.question.replace('yesterday', 'last week');
    else if (newQ.question.includes('last year')) newQ.question = newQ.question.replace('last year', 'in 2010');

    newQ.explanation = `(变式训练) ${newQ.explanation}`;
    return newQ;
};

const createWordMask = (word: string) => {
    if (!word) return '';
    const chars = word.split('');
    return chars.map((c) => {
        if (!/[a-zA-Z]/.test(c)) return c;
        return Math.random() < 0.5 ? '_' : c;
    }).join(' ');
};

const speak = (text: string) => {
    if (!window.speechSynthesis) {
        console.warn("Browser does not support TTS");
        return;
    }
    
    // Always cancel previous speech to prevent queue buildup
    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.9; // Slightly slower for clarity
    u.volume = 1.0;

    // WeChat/Mobile Webview Compatibility:
    // Do NOT rely on intricate voice filtering logic as getVoices() is async and often empty initially.
    // Just setting lang is often safer. 
    // If voices are available, we try to pick a good one, but fallback gracefully.
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
        // Try to find a good English voice but don't force it if it breaks
        const preferredVoice = voices.find(v => v.lang === 'en-US' && !v.name.includes('Google')) || 
                               voices.find(v => v.lang === 'en-US');
        if (preferredVoice) {
            u.voice = preferredVoice;
        }
    }
    
    window.speechSynthesis.speak(u);
};

// --- Visual Effect Component ---
const RewardFlyer: React.FC<{ items: { id: number, type: 'GOLD' | 'EXP', amount: number }[] }> = ({ items }) => {
    if (items.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {items.map((item) => (
                <div 
                    key={item.id}
                    className="absolute left-1/2 top-1/2 flex items-center justify-center animate-fly-reward"
                >
                    <div className={`text-4xl drop-shadow-lg ${item.type === 'GOLD' ? 'text-yellow-400' : 'text-purple-400'}`}>
                        {item.type === 'GOLD' ? <CircleDollarSign size={40} fill="currentColor"/> : <Zap size={40} fill="currentColor"/>}
                    </div>
                    <span className={`ml-2 text-3xl font-black ${item.type === 'GOLD' ? 'text-yellow-100' : 'text-purple-100'} text-shadow-md`}>
                        +{item.amount}
                    </span>
                </div>
            ))}
            <style>{`
                @keyframes flyReward {
                    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                    10% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
                    80% { transform: translate(150px, -400px) scale(0.8); opacity: 0.8; }
                    100% { transform: translate(200px, -600px) scale(0); opacity: 0; }
                }
                .animate-fly-reward {
                    animation: flyReward 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }
                .text-shadow-md {
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                }
            `}</style>
        </div>
    );
};

// --- Helper Components ---

const RankEmblem: React.FC<{ rankName: string, className?: string }> = ({ rankName, className }) => {
    const isKing = rankName === Rank.KING;
    const isStar = rankName === Rank.STAR;
    const isDiamond = rankName === Rank.DIAMOND;
    const isPlat = rankName === Rank.PLATINUM;
    const isGold = rankName === Rank.GOLD;
    const isSilver = rankName === Rank.SILVER;
    // const isBronze = rankName === Rank.BRONZE;

    return (
        <div className={`relative flex items-center justify-center w-16 h-16 ${className}`}>
             <div className="absolute inset-0 flex items-center justify-center opacity-80">
                 <Shield size={60} className={`fill-slate-900 ${isKing ? 'text-red-500' : isStar ? 'text-orange-500' : isDiamond ? 'text-purple-500' : isPlat ? 'text-cyan-500' : isGold ? 'text-yellow-500' : isSilver ? 'text-blue-300' : 'text-emerald-600'}`} strokeWidth={1} />
             </div>
             <div className="absolute inset-0 flex items-center justify-center">
                 {isKing ? <Crown size={32} className="text-yellow-300 fill-yellow-500/50 mb-1 drop-shadow-lg" /> : 
                  isStar ? <Star size={32} className="text-orange-200 fill-orange-500/50" /> :
                  <Sword size={32} className={`${isDiamond ? 'text-purple-200' : isPlat ? 'text-cyan-200' : isGold ? 'text-yellow-200' : 'text-slate-300'} drop-shadow-md`} />}
             </div>
             {(isKing || isStar || isDiamond) && (
                 <div className="absolute top-1 w-full flex justify-center">
                     <div className="w-10 h-0.5 bg-white/50 rounded-full blur-[1px]"></div>
                 </div>
             )}
             <div className="absolute bottom-2">
                 {isKing ? <div className="text-[8px] font-bold text-yellow-500 bg-black/50 px-1 rounded-full border border-yellow-500">KING</div> : 
                  <div className={`w-1.5 h-1.5 rounded-full ${isDiamond ? 'bg-purple-400' : isGold ? 'bg-yellow-400' : 'bg-slate-500'}`}></div>}
             </div>
        </div>
    );
};

const RankDisplay: React.FC<{ stats: UserStats, onClick?: () => void }> = ({ stats, onClick }) => {
  const { title, displayTitle, subRank, progress, currentStars, maxStars, config, currentStarExp } = getRankInfo(stats.exp);
  
  return (
    <div onClick={onClick} className={`bg-gradient-to-br ${config.color} rounded-xl p-0.5 shadow-lg relative overflow-hidden cursor-pointer group transform active:scale-95 transition-all`}>
      <div className="bg-slate-900/40 w-full rounded-[10px] backdrop-blur-sm p-3 flex items-center relative z-10">
          <div className="flex-1 z-10">
              <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold bg-white/10 px-1.5 py-0.5 rounded text-white/80 tracking-wider">当前段位</span>
              </div>
              <h1 className={`text-xl font-black italic tracking-wide ${config.iconColor} drop-shadow-md flex items-center gap-2`}>
                  {displayTitle} <span className="text-sm font-bold text-white not-italic">{subRank}</span>
              </h1>
              <div className="flex items-center gap-0.5 mt-1">
                  {displayTitle !== Rank.KING && Array.from({length: maxStars}).map((_, i) => (
                      <Star key={i} size={12} className={`${i < currentStars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600 fill-slate-800'}`} />
                  ))}
                  {displayTitle === Rank.KING && <div className="text-yellow-400 font-bold flex items-center gap-1 text-xs"><Star size={12} fill="currentColor"/> x {currentStars}</div>}
              </div>
              <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500" style={{ width: `${(currentStarExp / EXP_PER_STAR) * 100}%` }}></div>
                  </div>
                  <span>{currentStarExp}/{EXP_PER_STAR} EXP</span>
              </div>
          </div>
          <div className="relative z-10">
              <RankEmblem rankName={displayTitle} className="drop-shadow-xl" />
          </div>
          <div className={`absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-tl ${config.color} rounded-full blur-[30px] opacity-40`}></div>
      </div>
    </div>
  );
};

const RadarChart: React.FC<{ stats: UserStats, masteredWordsCount: number, battleHistory: BattleRecord[] }> = ({ stats, masteredWordsCount, battleHistory }) => {
    // Calculate Pentagon Data
    const vocabScore = Math.min((masteredWordsCount / 50) * 100, 100); // Assume 50 words is base target
    const tenacityScore = Math.min(((stats.loginStreak * 5) + (stats.studyMinutes / 10)), 100);
    
    const examMatches = battleHistory.filter(b => b.mode === 'EXAM');
    const avgGrammar = examMatches.length > 0 ? (examMatches.reduce((acc, curr) => acc + (curr.score / curr.maxScore), 0) / examMatches.length) * 100 : 20; // Base 20
    
    const dictationMatches = battleHistory.filter(b => b.mode === 'DICTATION');
    const avgListening = dictationMatches.length > 0 ? (dictationMatches.reduce((acc, curr) => acc + (curr.score / curr.maxScore), 0) / dictationMatches.length) * 100 : 20;

    const burstScore = battleHistory.length > 0 ? Math.min(Math.max(...battleHistory.map(b => b.score / 10 * 10)), 100) : 20; // Normalize score? Assume max score usually 100-ish

    const data = [
        { label: '词汇', value: vocabScore },
        { label: '语法', value: avgGrammar },
        { label: '听力', value: avgListening },
        { label: '毅力', value: tenacityScore },
        { label: '爆发', value: burstScore }
    ];

    const size = 100;
    const center = size;
    const radius = 70;
    const angleSlice = (Math.PI * 2) / 5;

    const points = data.map((d, i) => {
        const value = Math.max(d.value, 15); // Min display value for visual
        const r = (value / 100) * radius;
        const x = center + r * Math.cos(i * angleSlice - Math.PI / 2);
        const y = center + r * Math.sin(i * angleSlice - Math.PI / 2);
        return `${x},${y}`;
    }).join(' ');

    const bgPoints = Array.from({length: 5}).map((_, i) => {
        const x = center + radius * Math.cos(i * angleSlice - Math.PI / 2);
        const y = center + radius * Math.sin(i * angleSlice - Math.PI / 2);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-[200px] h-[200px]">
                <svg width="200" height="200" viewBox="0 0 200 200">
                    {/* Background Pentagon */}
                    <polygon points={bgPoints} fill="rgba(30, 41, 59, 0.5)" stroke="#475569" strokeWidth="1" />
                    {/* Data Polygon */}
                    <polygon points={points} fill="rgba(6, 182, 212, 0.4)" stroke="#06b6d4" strokeWidth="2" />
                    {/* Labels (Approximate positions) */}
                    <text x="100" y="20" textAnchor="middle" fill="#94a3b8" fontSize="10">词汇</text>
                    <text x="190" y="85" textAnchor="middle" fill="#94a3b8" fontSize="10">语法</text>
                    <text x="160" y="190" textAnchor="middle" fill="#94a3b8" fontSize="10">听力</text>
                    <text x="40" y="190" textAnchor="middle" fill="#94a3b8" fontSize="10">毅力</text>
                    <text x="10" y="85" textAnchor="middle" fill="#94a3b8" fontSize="10">爆发</text>
                </svg>
            </div>
        </div>
    );
};

const WordCard: React.FC<{ 
  word: Word; 
  isMastered: boolean; 
  onToggleMaster: (id: string) => void; 
  flashcardMode: boolean;
}> = ({ word, isMastered, onToggleMaster, flashcardMode }) => {
  const [expanded, setExpanded] = useState(false);
  const [recording, setRecording] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const handleRecord = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecording(true);
    setScore(null);
    setTimeout(() => {
        setRecording(false);
        setScore(Math.floor(Math.random() * 21) + 80); 
    }, 1500);
  };

  return (
    <div onClick={() => setExpanded(!expanded)} className={`relative transition-all duration-300 overflow-hidden mb-3 rounded-xl border cursor-pointer select-none ${isMastered ? 'bg-slate-900/40 border-slate-800 opacity-60' : 'bg-slate-800/80 border-slate-700 backdrop-blur-sm'} ${expanded ? 'shadow-lg shadow-cyan-900/20 ring-1 ring-cyan-500/30 bg-slate-800' : 'active:scale-[0.98]'}`}>
      <div className="p-4 flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-end gap-2 flex-wrap">
            <h3 className={`text-xl font-bold ${isMastered ? 'text-slate-500' : 'text-cyan-300'}`}>{word.english}</h3>
            <span className="text-xs text-slate-500 mb-1">{word.phonetic}</span>
            {isMastered && <span className="text-[10px] bg-green-900/30 text-green-500 px-1.5 py-0.5 rounded border border-green-800/50 flex items-center gap-1"><CheckCircle size={10}/> 已掌握</span>}
          </div>
          <div className={`mt-2 transition-all duration-300 ${flashcardMode && !expanded ? 'blur-md opacity-40 hover:blur-none hover:opacity-100' : 'blur-0 opacity-100'}`}>
            <span className="bg-slate-700/50 text-[10px] px-1.5 py-0.5 rounded mr-1.5 text-slate-400 font-mono">{word.partOfSpeech}</span>
            <span className={isMastered ? 'text-slate-500' : 'text-slate-300'}>{word.chinese}</span>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); speak(word.english); }} className="p-2 bg-slate-700/50 rounded-full text-cyan-400 hover:bg-slate-600 hover:text-cyan-300 transition-colors ml-2 flex-shrink-0">
          <Volume2 size={18} />
        </button>
      </div>
      {expanded && (
        <div className="px-4 pb-4 animate-fade-in">
          <div className="h-px w-full bg-slate-700/50 mb-3"></div>
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 mb-3">
             <div className="flex items-center gap-1 mb-2 text-xs text-yellow-500/80 font-bold uppercase tracking-wider"><Book size={12} /><span>Example / 例句</span></div>
             <p className="text-sm text-slate-200 italic mb-2 leading-relaxed">"{word.example}"</p>
          </div>
          <div className="flex items-center gap-2 mt-2">
             <button onClick={handleRecord} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all border ${recording ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600'}`}>{recording ? <><Mic size={14} className="animate-pulse" /> 录音中...</> : score ? <><span className="text-green-400 font-mono text-sm">{score}</span><span className="text-slate-400">分 - 再试一次</span><RotateCcw size={12} /></> : <><Mic size={14} /> 跟读评测</>}</button>
             <button onClick={(e) => { e.stopPropagation(); onToggleMaster(word.id); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold border transition-all ${isMastered ? 'bg-green-600/20 border-green-600/50 text-green-400' : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-200'}`}>{isMastered ? <><CheckCircle size={14} /> 已掌握 (撤销)</> : <><CheckCircle size={14} /> 斩词 (标记掌握)</>}</button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App Logic ---

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [selectedCategory, setSelectedCategory] = useState<string>(LIBRARY_STRUCTURE[0].id);
  const [selectedUnit, setSelectedUnit] = useState<string>(LIBRARY_STRUCTURE[0].units[0]);
  const [masteredWords, setMasteredWords] = useState<Set<string>>(new Set());
  const [flashcardMode, setFlashcardMode] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    username: 'Guest',
    level: 1, 
    exp: 0, 
    gold: 100, 
    totalGoldEarned: 100, 
    rankTitle: Rank.BRONZE, 
    matchesPlayed: 0, 
    correctCount: 0, 
    loginStreak: 1, 
    studyMinutes: 0, 
    unlockedAchievements: [], 
    inventory: [], 
    redemptionHistory: [],
    avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=Arthur`,
    dailyQuestsClaimed: {}, // Track claimed quests per day
    dailyRepairCount: 0,
    totalRepairs: 0
  });
  const [mistakes, setMistakes] = useState<WrongAnswer[]>([]);
  const [battleHistory, setBattleHistory] = useState<BattleRecord[]>([]);
  
  // Login State
  const [loginInput, setLoginInput] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false); 

  // Battle State
  const [missionModalOpen, setMissionModalOpen] = useState(false);
  const [pendingUnitStart, setPendingUnitStart] = useState<string>('');
  const [quizQuestions, setQuizQuestions] = useState<(Word | ExamQuestion)[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [answerStatus, setAnswerStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  const [battleMode, setBattleMode] = useState<'VOCAB' | 'EXAM' | 'DICTATION'>('VOCAB');
  const [userTypedAnswer, setUserTypedAnswer] = useState('');
  const [currentWordMask, setCurrentWordMask] = useState('');
  const [currentVocabOptions, setCurrentVocabOptions] = useState<Word[]>([]);
  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef<number | null>(null);
  const nextQuestionRef = useRef<() => void>(() => {});
  
  // Expanded Categories State (Default to empty set = all collapsed)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // Profile State
  const [isSeasonExpanded, setIsSeasonExpanded] = useState(false);

  // Modals & UI
  const [repairModalOpen, setRepairModalOpen] = useState(false);
  const [activeRepairQuestion, setActiveRepairQuestion] = useState<ExamQuestion | null>(null);
  
  const [vocabRepairModalOpen, setVocabRepairModalOpen] = useState(false);
  const [activeRepairVocab, setActiveRepairVocab] = useState<Word | null>(null);
  const [repairStep, setRepairStep] = useState(1);
  const [repairOptions, setRepairOptions] = useState<Word[]>([]);
  const [maskedWord, setMaskedWord] = useState('');

  const [rankModalOpen, setRankModalOpen] = useState(false);
  const [shopAdminOpen, setShopAdminOpen] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false); 
  const [levelRulesOpen, setLevelRulesOpen] = useState(false); 
  const [rewardSummary, setRewardSummary] = useState({ exp: 0, gold: 0, message: '' });
  // Reward Rules Modal
  const [showRulesModal, setShowRulesModal] = useState(false);
  // Reward Floating Effect
  const [floatingReward, setFloatingReward] = useState<{id: number, text: string} | null>(null);
  
  // Visual Effects State
  const [visualRewards, setVisualRewards] = useState<{id: number, type: 'GOLD' | 'EXP', amount: number}[]>([]);

  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({
      isOpen: false, title: '', message: '', onConfirm: () => {}
  });
  
  const [isAdminMode, setIsAdminMode] = useState(false); 
  const [shopItems, setShopItems] = useState<ShopItem[]>(DEFAULT_SHOP_ITEMS);
  const [newShopItem, setNewShopItem] = useState({ name: '', price: 100, icon: '🎁' });
  const [editingItemId, setEditingItemId] = useState<string | null>(null); 
  
  const [currentQuote, setCurrentQuote] = useState(DAILY_QUOTES[0]);

  // --- Persistence & Stats Logic ---
  
  const saveProgress = (stats: UserStats, history: BattleRecord[], mistakesList: WrongAnswer[], mastered: Set<string>, currentShopItems: ShopItem[]) => {
      if (stats.username === 'Guest') return;
      const data = {
          stats: { ...stats, shopItems: currentShopItems },
          history,
          mistakes: mistakesList,
          mastered: Array.from(mastered)
      };
      localStorage.setItem(`kg_user_${stats.username}`, JSON.stringify(data));
  };

  useEffect(() => {
      if (currentView !== AppView.LOGIN && isDataLoaded) {
        saveProgress(userStats, battleHistory, mistakes, masteredWords, shopItems);
      }
  }, [userStats, battleHistory, mistakes, masteredWords, currentView, isDataLoaded, shopItems]);

  useEffect(() => {
      const hour = new Date().getHours();
      const index = hour % DAILY_QUOTES.length;
      setCurrentQuote(DAILY_QUOTES[index]);
  }, []);

  const triggerRewardEffect = (type: 'GOLD' | 'EXP', amount: number) => {
      const id = Date.now();
      setVisualRewards(prev => [...prev, { id, type, amount }]);
      setTimeout(() => {
          setVisualRewards(prev => prev.filter(r => r.id !== id));
      }, 1200); 
  };

  const handleLogin = () => {
      const username = loginInput.trim();
      if (!username) { alert("请输入你的代号 (学号/昵称)"); return; }
      
      const savedData = localStorage.getItem(`kg_user_${username}`);
      if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            const loadedStats = {
                ...parsed.stats,
                totalGoldEarned: parsed.stats.totalGoldEarned ?? parsed.stats.gold,
                avatar: parsed.stats.avatar ?? `https://api.dicebear.com/7.x/adventurer/svg?seed=Arthur`,
                dailyQuestsClaimed: parsed.stats.dailyQuestsClaimed ?? {},
                dailyRepairCount: parsed.stats.dailyRepairCount || 0,
                totalRepairs: parsed.stats.totalRepairs || 0
            };
            setUserStats(loadedStats);
            setBattleHistory(parsed.history);
            setMistakes(parsed.mistakes);
            setMasteredWords(new Set(parsed.mastered));
            setShopItems(parsed.stats.shopItems || DEFAULT_SHOP_ITEMS);
            alert(`欢迎回来，${username}！档案读取成功。`);
          } catch (e) {
            console.error("Save file corrupted", e);
            setUserStats(prev => ({ ...prev, username }));
            setShopItems(DEFAULT_SHOP_ITEMS);
          }
      } else {
          setUserStats(prev => ({ ...prev, username }));
          setShopItems(DEFAULT_SHOP_ITEMS);
          alert(`新兵报到！欢迎加入知识荣耀，${username}。`);
      }
      setIsDataLoaded(true); 
      setCurrentView(AppView.LOBBY);
  };

  const handleCheckIn = () => {
      const today = getLocalTodayDate();
      if (userStats.lastSignInDate !== today) {
          const goldReward = 50;
          setUserStats(prev => ({
              ...prev,
              lastSignInDate: today,
              gold: prev.gold + goldReward,
              totalGoldEarned: (prev.totalGoldEarned || prev.gold) + goldReward,
              exp: prev.exp + 20,
              loginStreak: prev.loginStreak + 1,
              dailyRepairCount: 0 // Reset daily repair count on new day check-in
          }));
          triggerRewardEffect('GOLD', 50);
          triggerRewardEffect('EXP', 20);
          setConfirmModal({
              isOpen: true,
              title: '签到成功',
              message: '今日签到完成！获得 50 金币和 20 经验值。',
              onConfirm: () => setConfirmModal(prev => ({...prev, isOpen: false}))
          });
      }
  };

  const isCheckedInToday = () => {
      const today = getLocalTodayDate();
      return userStats.lastSignInDate === today;
  };

  useEffect(() => {
    const { title } = getRankInfo(userStats.exp);
    const { level } = getLevelInfo(userStats.totalGoldEarned);

    if (title !== userStats.rankTitle || level !== userStats.level) {
        setUserStats(prev => ({
            ...prev, 
            rankTitle: title,
            level: level
        }));
    }
    
    ACHIEVEMENTS.forEach(ach => {
        if (!userStats.unlockedAchievements.includes(ach.id) && ach.condition(userStats)) {
            setUserStats(prev => ({...prev, unlockedAchievements: [...prev.unlockedAchievements, ach.id]}));
        }
    });
  }, [userStats.exp, userStats.matchesPlayed, userStats.studyMinutes, userStats.gold, userStats.totalGoldEarned]);

  useEffect(() => {
      const timer = setInterval(() => {
          if (currentView === AppView.DATABASE || currentView === AppView.BATTLE || currentView === AppView.ARMORY) {
              setUserStats(prev => ({...prev, studyMinutes: prev.studyMinutes + 1}));
          }
      }, 60000); 
      return () => clearInterval(timer);
  }, [currentView]);

  useEffect(() => {
    if (currentView === AppView.BATTLE && battleMode === 'DICTATION' && answerStatus === 'IDLE') {
        const item = quizQuestions[currentQuestionIndex];
        if (item && 'english' in item) {
             const word = item as Word;
             speak(word.english);
             setCurrentWordMask(createWordMask(word.english));
        }
    }
  }, [currentView, battleMode, answerStatus, currentQuestionIndex, quizQuestions]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    const cat = LIBRARY_STRUCTURE.find(c => c.id === catId);
    if (cat && cat.units.length > 0) setSelectedUnit(cat.units[0]);
    else setSelectedUnit('');
  };

  const toggleMasterWord = (id: string) => {
    setMasteredWords(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    });
  };

  const handleUnitClick = (unit: string) => {
      setPendingUnitStart(unit);
      setMissionModalOpen(true);
  };

  const generateVocabOptions = (targetWord: Word) => {
     if (!targetWord) return;
     const otherWords = VOCABULARY_DATA.filter(w => w.id !== targetWord.id);
     const count = Math.min(otherWords.length, 3);
     const distractors = otherWords.sort(() => 0.5 - Math.random()).slice(0, count);
     const options = [targetWord, ...distractors].sort(() => 0.5 - Math.random());
     setCurrentVocabOptions(options);
  };

  const startQuiz = (mode: 'VOCAB' | 'EXAM' | 'DICTATION') => {
    setMissionModalOpen(false);
    const unit = pendingUnitStart;
    setSelectedUnit(unit);
    setBattleMode(mode);

    let questions: (Word | ExamQuestion)[] = [];
    const book1Units = ['Welcome Unit', 'Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5'];
    const isComprehensive = unit === '全册综合测试';

    let pool: (Word | ExamQuestion)[] = [];

    if (mode === 'EXAM') {
        if (isComprehensive) {
            pool = EXAM_DATA.filter(q => book1Units.includes(q.unit));
        } else {
            pool = getExamQuestionsByUnit(unit);
        }
        
        if (pool.length === 0) {
             pool = [{
                id: 'mock-generic',
                unit: 'Generic',
                type: 'GRAMMAR',
                question: 'This unit has no questions yet.',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 0,
                explanation: "Placeholder.",
                hint: "N/A"
             } as ExamQuestion];
        }
    } else {
        if (isComprehensive) {
            pool = VOCABULARY_DATA.filter(w => book1Units.includes(w.unit));
        } else {
            pool = getWordsByUnit(unit);
        }
        if (pool.length === 0) { alert("该单元暂无词汇数据"); return; }
    }

    let questionCount = pool.length; 
    if (isComprehensive) {
        if (mode === 'VOCAB') questionCount = 30;
        if (mode === 'DICTATION') questionCount = 15;
        if (mode === 'EXAM') questionCount = 8;
    } else {
        if (mode === 'DICTATION') questionCount = 10;
        if (mode === 'EXAM') questionCount = 5;
    }

    questions = [...pool].sort(() => 0.5 - Math.random()).slice(0, questionCount);
    
    if (mode === 'VOCAB' && questions.length > 0) {
        generateVocabOptions(questions[0] as Word);
    }
    
    setQuizQuestions(questions);
    setCurrentQuestionIndex(0);
    setQuizScore(0);
    setQuizFinished(false);
    setAnswerStatus('IDLE');
    setUserTypedAnswer('');
    setCurrentWordMask(''); 
    setCurrentView(AppView.BATTLE);
  };

  const handleExitBattle = () => {
      setConfirmModal({
          isOpen: true,
          title: '撤退确认',
          message: '正在进行实战训练，现在退出将无法获得任何奖励。确定要撤退吗？',
          onConfirm: () => {
              setConfirmModal(prev => ({ ...prev, isOpen: false }));
              if (timerRef.current) {
                  clearInterval(timerRef.current);
                  timerRef.current = null;
              }
              setCurrentView(AppView.BATTLE_PREP);
          }
      });
  };

  const handleNextQuestionClick = () => {
      if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
      }
      nextQuestion();
  };

  const handleAnswer = (correct: boolean, targetId: string) => {
    if (answerStatus !== 'IDLE') return; 
    
    // Just visual score for now, real reward calculated at end
    if (correct) {
      setAnswerStatus('CORRECT');
      setQuizScore(prev => prev + 10);
      // Trigger reward effect
      setFloatingReward({ id: Date.now(), text: '+1 经验' });
      triggerRewardEffect('EXP', 1);
      setTimeout(() => setFloatingReward(null), 1000);
    } else {
      setAnswerStatus('WRONG');
      setMistakes(prev => {
          const existing = prev.find(m => m.targetId === targetId);
          if (existing) return prev.map(m => m.targetId === targetId ? { ...m, count: m.count + 1, timestamp: Date.now() } : m);
          return [...prev, { id: Date.now().toString(), targetId, type: battleMode, unit: selectedUnit, count: 1, timestamp: Date.now(), repairProgress: 0 }];
      });
    }

    setCountdown(5);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
        setCountdown((prev) => {
            if (prev <= 1) {
                if (timerRef.current) clearInterval(timerRef.current);
                timerRef.current = null;
                nextQuestionRef.current(); 
                return 0;
            }
            return prev - 1;
        });
    }, 1000);
  };

  const handleDictationSubmit = (targetWord: Word) => {
      if (answerStatus !== 'IDLE') return;
      const isCorrect = userTypedAnswer.trim().toLowerCase() === targetWord.english.toLowerCase();
      handleAnswer(isCorrect, targetWord.id);
  };

  const nextQuestion = () => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        const nextIdx = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIdx);
        setAnswerStatus('IDLE');
        setUserTypedAnswer('');
        setCurrentWordMask('');
        setCountdown(5);
        
        if (battleMode === 'VOCAB') {
            generateVocabOptions(quizQuestions[nextIdx] as Word);
        }
      } else {
        finishQuiz(); 
      }
  };

  useEffect(() => {
      nextQuestionRef.current = nextQuestion;
  });

  const finishQuiz = () => {
    setQuizFinished(true);
    if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
    }
    
    // Reward Logic
    const correctCount = quizScore / 10;
    const totalQuestions = quizQuestions.length;
    const accuracy = totalQuestions > 0 ? correctCount / totalQuestions : 0;
    
    let expGained = 0;
    let goldGained = 0;
    let message = '';

    if (accuracy >= 0.5) {
        expGained = Math.floor(correctCount); // 1 exp per correct
        goldGained = Math.floor(correctCount / 10); // 1 gold per 10 correct
        message = `正确率 ${Math.round(accuracy * 100)}% (>=50%)。奖励已发放！`;
        triggerRewardEffect('EXP', expGained);
        if (goldGained > 0) triggerRewardEffect('GOLD', goldGained);
    } else {
        message = `正确率 ${Math.round(accuracy * 100)}% (<50%)。本次无奖励。`;
    }

    setRewardSummary({ exp: expGained, gold: goldGained, message });

    // Rank Logic for History
    let rank = 'C';
    if (accuracy >= 0.9) rank = 'S';
    else if (accuracy >= 0.8) rank = 'A';
    else if (accuracy >= 0.6) rank = 'B';

    const newRecord: BattleRecord = {
        id: Date.now().toString(),
        unit: selectedUnit,
        mode: battleMode,
        score: quizScore,
        maxScore: totalQuestions * 10,
        timestamp: Date.now(),
        rank: rank
    };
    setBattleHistory(prev => [newRecord, ...prev].slice(0, 20));

    setUserStats(prev => {
        const newExp = prev.exp + expGained;
        const currentTotalGold = prev.totalGoldEarned || prev.gold;
        const newTotalGold = currentTotalGold + goldGained;
        
        return {
            ...prev,
            exp: newExp,
            gold: prev.gold + goldGained,
            totalGoldEarned: newTotalGold,
            matchesPlayed: prev.matchesPlayed + 1,
            correctCount: prev.correctCount + correctCount
        };
    });
  };

  const claimDailyReward = (questId: string, type: 'GOLD' | 'EXP', amount: number) => {
      const today = getLocalTodayDate();
      const claimed = (userStats.dailyQuestsClaimed && userStats.dailyQuestsClaimed[today]) || [];
      if (claimed.includes(questId)) return;

      setUserStats(prev => {
          const newClaims = { ...(prev.dailyQuestsClaimed || {}) };
          if (!newClaims[today]) newClaims[today] = [];
          newClaims[today].push(questId);
          
          return {
              ...prev,
              gold: type === 'GOLD' ? prev.gold + amount : prev.gold,
              exp: type === 'EXP' ? prev.exp + amount : prev.exp,
              totalGoldEarned: type === 'GOLD' ? (prev.totalGoldEarned || prev.gold) + amount : (prev.totalGoldEarned || prev.gold),
              dailyQuestsClaimed: newClaims
          };
      });
      triggerRewardEffect(type, amount);
      alert(`领取成功！获得 ${amount} ${type === 'GOLD' ? '金币' : '经验'}`);
  };
  
  // ... (Repair Logic remains same) ...
  // --- Exam Repair Logic ---
  const startExamRepair = (questionId: string) => {
      const original = getExamQuestionsByUnit(selectedUnit).find(q => q.id === questionId) || EXAM_DATA.find(q => q.id === questionId);
      if (original) {
          const variant = generateSimilarQuestion(original);
          setActiveRepairQuestion(variant);
          setRepairModalOpen(true);
      }
  };
  
  const handleRepairAnswer = (correct: boolean) => {
      if (correct) {
          const mistakeId = activeRepairQuestion?.id.split('-variant')[0];
          setMistakes(prev => prev.filter(m => m.targetId !== mistakeId && m.targetId !== activeRepairQuestion?.id));
          
          // Reward logic for repair
          const bonusExp = 1;
          const currentTotalRepairs = (userStats.totalRepairs || 0) + 1;
          const bonusGold = currentTotalRepairs % 10 === 0 ? 1 : 0;
          const rewardText = bonusGold > 0 ? `修复成功! +${bonusExp} 经验 & +${bonusGold} 金币` : `修复成功! +${bonusExp} 经验`;

          setUserStats(prev => ({ 
              ...prev, 
              exp: prev.exp + bonusExp,
              gold: prev.gold + bonusGold,
              totalGoldEarned: (prev.totalGoldEarned || prev.gold) + bonusGold,
              dailyRepairCount: (prev.dailyRepairCount || 0) + 1,
              totalRepairs: currentTotalRepairs
          })); 
          
          setFloatingReward({ id: Date.now(), text: rewardText });
          triggerRewardEffect('EXP', bonusExp);
          if (bonusGold > 0) triggerRewardEffect('GOLD', bonusGold);
          setTimeout(() => setFloatingReward(null), 2000);

          setRepairModalOpen(false);
      } else {
          alert("训练失败，请再试一次。");
      }
  };

  // --- Vocab Repair Logic ---
  const startVocabRepair = (wordId: string) => {
      const word = VOCABULARY_DATA.find(w => w.id === wordId);
      if (word) {
          setActiveRepairVocab(word);
          
          // Prepare Step 1: Mask 60%
          const len = word.english.length;
          const numToHide = Math.ceil(len * 0.6);
          const indices = Array.from({length: len}, (_, i) => i).sort(() => 0.5 - Math.random()).slice(0, numToHide);
          const chars = word.english.split('');
          indices.forEach(i => { if (chars[i] !== ' ') chars[i] = '_'; });
          setMaskedWord(chars.join(' '));

          // Prepare Step 2: Options
          const distractors = VOCABULARY_DATA.filter(w => w.id !== wordId).sort(() => 0.5 - Math.random()).slice(0, 3);
          const opts = [word, ...distractors].sort(() => 0.5 - Math.random());
          setRepairOptions(opts);

          setRepairStep(1);
          setVocabRepairModalOpen(true);
          setUserTypedAnswer('');
      }
  };

  const handleVocabRepairSubmit = () => {
      if (!activeRepairVocab) return;
      
      // Step 1 Check
      if (repairStep === 1) {
          const correct = activeRepairVocab.english.toLowerCase().trim() === userTypedAnswer.toLowerCase().trim();
          if (correct) {
              setRepairStep(2);
              setUserTypedAnswer(''); 
          } else {
              alert("拼写有误，请重试！");
          }
          return;
      }
  };

  const handleVocabRepairSelect = (selectedId: string) => {
      if (!activeRepairVocab) return;
      if (repairStep === 2) {
          if (selectedId === activeRepairVocab.id) {
              // Complete Repair
              setMistakes(prev => prev.filter(m => m.targetId !== activeRepairVocab.id));
              
              const bonusExp = 1;
              const currentTotalRepairs = (userStats.totalRepairs || 0) + 1;
              const bonusGold = currentTotalRepairs % 10 === 0 ? 1 : 0;
              const rewardText = bonusGold > 0 ? `修复成功! +${bonusExp} 经验 & +${bonusGold} 金币` : `修复成功! +${bonusExp} 经验`;

              setUserStats(prev => ({ 
                  ...prev, 
                  exp: prev.exp + bonusExp,
                  gold: prev.gold + bonusGold,
                  totalGoldEarned: (prev.totalGoldEarned || prev.gold) + bonusGold,
                  dailyRepairCount: (prev.dailyRepairCount || 0) + 1,
                  totalRepairs: currentTotalRepairs
              })); 

              setFloatingReward({ id: Date.now(), text: rewardText });
              triggerRewardEffect('EXP', bonusExp);
              if (bonusGold > 0) triggerRewardEffect('GOLD', bonusGold);
              setTimeout(() => setFloatingReward(null), 2000);

              setVocabRepairModalOpen(false);
          } else {
              alert("选择错误，请重试！");
          }
      }
  }

  // --- Shop Logic ---
  const handleAdminLoginSubmit = () => {
      if (adminPasswordInput === "98765432") {
          setIsAdminMode(true);
          setAdminLoginOpen(false);
          setAdminPasswordInput('');
          setShopAdminOpen(true); // Open shop immediately after login if not already
      } else {
          alert("密码错误");
      }
  };

  const buyItem = (item: ShopItem) => {
      const { discountMultiplier } = getLevelInfo(userStats.totalGoldEarned);
      const finalPrice = Math.floor(item.price * discountMultiplier);

      if (userStats.gold >= finalPrice) {
          setConfirmModal({
              isOpen: true,
              title: '确认兑换',
              message: `确定花费 ${finalPrice} 金币兑换 "${item.name}" 吗?`,
              onConfirm: () => {
                  const newRecord: RedemptionRecord = {
                      id: Date.now().toString(),
                      itemName: item.name,
                      cost: finalPrice,
                      timestamp: Date.now()
                  };
                  setUserStats(prev => ({
                      ...prev,
                      gold: prev.gold - finalPrice,
                      inventory: [...prev.inventory, item.id],
                      redemptionHistory: [newRecord, ...prev.redemptionHistory]
                  }));
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  alert("兑换成功！已保存至兑换记录。");
              }
          });
      } else {
          alert("金币不足！");
      }
  };

  const handleSaveShopItem = () => {
      if (!newShopItem.name || newShopItem.price <= 0) {
          alert("请输入有效的名称和价格");
          return;
      }

      if (editingItemId) {
          // Edit Mode
          setShopItems(prev => prev.map(item => 
              item.id === editingItemId 
                  ? { ...item, name: newShopItem.name, price: newShopItem.price, icon: newShopItem.icon }
                  : item
          ));
          setEditingItemId(null);
      } else {
          // Add Mode
          setShopItems(prev => [...prev, { 
              ...newShopItem, 
              id: `custom_${Date.now()}`, 
              description: '自定义奖励' 
          }]);
      }
      setNewShopItem({ name: '', price: 100, icon: '🎁' });
  };

  const startEditItem = (item: ShopItem) => {
      setNewShopItem({ name: item.name, price: item.price, icon: item.icon });
      setEditingItemId(item.id);
  };

  const cancelEdit = () => {
      setNewShopItem({ name: '', price: 100, icon: '🎁' });
      setEditingItemId(null);
  };

  const deleteShopItem = (id: string) => {
      setConfirmModal({
          isOpen: true,
          title: '删除商品',
          message: '确定要下架此商品吗？',
          onConfirm: () => {
              setShopItems(prev => prev.filter(item => item.id !== id));
              if (editingItemId === id) {
                  cancelEdit();
              }
              setConfirmModal(prev => ({ ...prev, isOpen: false }));
          }
      });
  };

  const handleAvatarSelect = (seedName: string) => {
      const newAvatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seedName}`;
      setUserStats(prev => ({
          ...prev,
          avatar: newAvatarUrl
      }));
      setAvatarModalOpen(false);
  };

  const handleLogout = () => {
      setConfirmModal({
          isOpen: true,
          title: '退出登录',
          message: '确定要退出当前账号吗？',
          onConfirm: () => {
              setCurrentView(AppView.LOGIN);
              setLoginInput('');
              setIsAdminMode(false);
              setIsDataLoaded(false); 
              setShopItems(DEFAULT_SHOP_ITEMS);
              setConfirmModal(prev => ({ ...prev, isOpen: false }));
          }
      });
  };

  const toggleCategory = (catId: string) => {
      setExpandedCategories(prev => {
          const next = new Set(prev);
          if (next.has(catId)) next.delete(catId);
          else next.add(catId);
          return next;
      });
  };

  // --- Render Functions ---

  const renderLogin = () => (
      <div className="h-screen w-full flex flex-col items-center justify-center p-6 relative bg-slate-900 overflow-hidden">
          <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/50 to-slate-900 pointer-events-none animate-pulse"></div>
          <div className="absolute top-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px]"></div>
          
          <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
              <div className="mb-8 p-6 bg-slate-800/50 rounded-full border-2 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                  <Sword size={64} className="text-cyan-400 fill-cyan-400/20" />
              </div>
              <h1 className="text-4xl font-black text-white mb-2 tracking-tighter drop-shadow-xl">
                  知识荣耀 <span className="text-cyan-400">Glory</span>
              </h1>
              <p className="text-slate-400 mb-10 text-sm font-mono tracking-widest">KNOWLEDGE IS POWER</p>
              
              <div className="w-full bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-xl">
                  <label className="text-left text-xs font-bold text-slate-400 mb-2 block ml-1">IDENTIFICATION</label>
                  <div className="flex gap-2 mb-6">
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-600 flex items-center justify-center text-slate-500"><User size={20}/></div>
                      <input 
                        value={loginInput} 
                        onChange={(e) => setLoginInput(e.target.value)} 
                        placeholder="请输入学号或昵称" 
                        className="flex-1 bg-slate-900/80 border border-slate-600 rounded-lg px-4 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600"
                      />
                  </div>
                  <button 
                    onClick={handleLogin}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-xl shadow-lg shadow-blue-900/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                  >
                      <span>START GAME</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                  </button>
              </div>
              <p className="mt-8 text-xs text-slate-600">广州高中英语 · Gamified Learning System</p>
          </div>
      </div>
  );

  const renderLobby = () => {
    // Daily Quest Check
    const today = getLocalTodayDate();
    const claimedToday = (userStats.dailyQuestsClaimed && userStats.dailyQuestsClaimed[today]) || [];
    
    // 1. Practice Volume (Matches Played)
    const matchesToday = battleHistory.filter(r => {
        const rDate = new Date(r.timestamp).toISOString().split('T')[0];
        return rDate === today;
    }).length;

    // 2. Accuracy (S-Rank) - "Winning Streak" in UI, logic is getting S Rank
    const sRanksToday = battleHistory.filter(r => {
        const rDate = new Date(r.timestamp).toISOString().split('T')[0];
        return rDate === today && r.rank === 'S';
    }).length;

    // 3. Mistake Correction
    const repairsToday = userStats.dailyRepairCount || 0;

    return (
    <div className="p-4 space-y-6 animate-fade-in pb-24 h-full overflow-y-auto">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
            <button onClick={() => setAvatarModalOpen(true)} className="relative group">
                <img src={userStats.avatar} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-slate-700 bg-slate-800 group-hover:border-cyan-400 transition-colors" />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 size={16} className="text-white"/>
                </div>
            </button>
            <div>
                <h2 className="text-xl font-bold text-white leading-tight">Hello, {userStats.username}</h2>
                <p className="text-slate-400 text-xs">Level {userStats.level} · 广州高中英语</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            {!isCheckedInToday() && (
                <button onClick={handleCheckIn} className="animate-bounce mr-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                    <CalendarCheck size={14}/> 签到
                </button>
            )}
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700"><span className="text-yellow-400 text-sm font-bold">🪙 {userStats.gold}</span></div>
        </div>
      </header>
      <RankDisplay stats={userStats} onClick={() => setRankModalOpen(true)} />
      <div onClick={() => setCurrentView(AppView.BATTLE_PREP)} className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-colors p-4 rounded-xl flex items-center justify-between shadow-lg shadow-blue-900/50 cursor-pointer">
        <div className="flex items-center gap-4"><div className="p-3 bg-white/20 rounded-full"><Sword className="text-white" size={24} /></div><div><h3 className="font-bold text-lg text-white">立即匹配</h3><p className="text-blue-200 text-sm">进入 MOBA 对战模式，赚取星星</p></div></div><ChevronRight className="text-white/50" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div onClick={() => setCurrentView(AppView.DATABASE)} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col gap-2 cursor-pointer hover:bg-slate-750 transition-colors">
          <div className="flex justify-between items-start"><Book className="text-cyan-400" /><span className="text-[10px] bg-slate-700 px-1 rounded text-slate-400">Database</span></div><span className="font-bold">核心词汇库</span><span className="text-xs text-slate-400">查看词汇档案 / 学习</span>
        </div>
        <div onClick={() => setCurrentView(AppView.ARMORY)} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col gap-2 cursor-pointer hover:bg-slate-750 transition-colors">
          <div className="flex justify-between items-start"><Shield className="text-red-400" /><span className="text-[10px] bg-slate-700 px-1 rounded text-slate-400">Inventory</span></div><span className="font-bold">军械库</span><span className="text-xs text-slate-400">强化错题装备</span>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-indigo-900/80 to-purple-900/80 p-4 rounded-xl border border-indigo-500/30 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
              <Quote size={60} className="text-white"/>
          </div>
          <div className="flex items-start gap-3 relative z-10">
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm"><Quote size={18} className="text-yellow-400"/></div>
              <div className="flex-1">
                  <p className="text-xs text-indigo-200 italic mb-1.5 leading-relaxed font-serif">"{currentQuote.en}"</p>
                  <p className="text-sm font-bold text-white">{currentQuote.ch}</p>
              </div>
              <button 
                  onClick={() => speak(currentQuote.en)}
                  className="p-2 bg-indigo-400/20 rounded-full text-indigo-200 hover:text-white hover:bg-indigo-400/40 transition-colors"
              >
                  <Volume2 size={16} />
              </button>
          </div>
      </div>

      <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/50 shadow-md">
        <div className="flex items-center gap-2 mb-3 border-b border-slate-700 pb-2"><Star size={16} className="text-yellow-400" /><h3 className="text-sm font-bold text-slate-300">每日悬赏 (Daily Quest)</h3></div>
        <div className="space-y-4">
          
          {/* Quest 1: Battle Hardened (Volume) */}
          <div className="flex justify-between items-center text-sm bg-slate-700/30 p-2 rounded-lg border border-slate-700/50">
              <div className="flex items-center gap-3">
                  <div className="bg-blue-900/50 p-1.5 rounded-md text-blue-400"><Sword size={16}/></div>
                  <div className="flex flex-col">
                      <span className="text-slate-200 font-bold text-xs">实战演练</span>
                      <span className="text-[10px] text-slate-400">完成 3 场练习 ({matchesToday}/3)</span>
                  </div>
              </div>
              {matchesToday >= 3 ? (
                  claimedToday.includes('quest_match_3') ? 
                  <span className="text-slate-500 text-[10px] font-bold border border-slate-600 px-2 py-1 rounded bg-slate-800">已领取</span> : 
                  <button onClick={() => claimDailyReward('quest_match_3', 'GOLD', 50)} className="bg-yellow-600 hover:bg-yellow-500 text-white text-[10px] px-2 py-1 rounded font-bold shadow-lg animate-pulse">领取 50G</button>
              ) : <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{width: `${Math.min(matchesToday/3 * 100, 100)}%`}}></div></div>}
          </div>

          {/* Quest 2: Perfectionist (Accuracy) */}
          <div className="flex justify-between items-center text-sm bg-slate-700/30 p-2 rounded-lg border border-slate-700/50">
              <div className="flex items-center gap-3">
                  <div className="bg-purple-900/50 p-1.5 rounded-md text-purple-400"><Target size={16}/></div>
                  <div className="flex flex-col">
                      <span className="text-slate-200 font-bold text-xs">追求卓越</span>
                      <span className="text-[10px] text-slate-400">获得 1 次 S 级评价 ({sRanksToday}/1)</span>
                  </div>
              </div>
              {sRanksToday >= 1 ? (
                  claimedToday.includes('quest_s_rank') ? 
                  <span className="text-slate-500 text-[10px] font-bold border border-slate-600 px-2 py-1 rounded bg-slate-800">已领取</span> : 
                  <button onClick={() => claimDailyReward('quest_s_rank', 'EXP', 100)} className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] px-2 py-1 rounded font-bold shadow-lg animate-pulse">领取 100XP</button>
              ) : <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-purple-500" style={{width: `${Math.min(sRanksToday/1 * 100, 100)}%`}}></div></div>}
          </div>

          {/* Quest 3: Redemption (Correction) */}
          <div className="flex justify-between items-center text-sm bg-slate-700/30 p-2 rounded-lg border border-slate-700/50">
              <div className="flex items-center gap-3">
                  <div className="bg-green-900/50 p-1.5 rounded-md text-green-400"><Wrench size={16}/></div>
                  <div className="flex flex-col">
                      <span className="text-slate-200 font-bold text-xs">亡羊补牢</span>
                      <span className="text-[10px] text-slate-400">修复 5 个错题 ({repairsToday}/5)</span>
                  </div>
              </div>
              {repairsToday >= 5 ? (
                  claimedToday.includes('quest_repair_5') ? 
                  <span className="text-slate-500 text-[10px] font-bold border border-slate-600 px-2 py-1 rounded bg-slate-800">已领取</span> : 
                  <button onClick={() => {
                      const today = getLocalTodayDate();
                      const claimed = (userStats.dailyQuestsClaimed && userStats.dailyQuestsClaimed[today]) || [];
                      if (claimed.includes('quest_repair_5')) return;

                      setUserStats(prev => {
                          const newClaims = { ...(prev.dailyQuestsClaimed || {}) };
                          if (!newClaims[today]) newClaims[today] = [];
                          newClaims[today].push('quest_repair_5');
                          
                          return {
                              ...prev,
                              gold: prev.gold + 3,
                              exp: prev.exp + 3,
                              totalGoldEarned: (prev.totalGoldEarned || prev.gold) + 3,
                              dailyQuestsClaimed: newClaims
                          };
                      });
                      alert(`领取成功！获得 3 金币 + 3 经验值`);
                  }} className="bg-green-600 hover:bg-green-500 text-white text-[10px] px-2 py-1 rounded font-bold shadow-lg animate-pulse">领取 3G 3XP</button>
              ) : <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-green-500" style={{width: `${Math.min(repairsToday/5 * 100, 100)}%`}}></div></div>}
          </div>

        </div>
      </div>
    </div>
    );
  };

  const renderDatabase = () => {
    const currentCategory = LIBRARY_STRUCTURE.find(c => c.id === selectedCategory);
    const availableUnits = currentCategory ? currentCategory.units : [];
    const safeUnit = availableUnits.includes(selectedUnit) ? selectedUnit : (availableUnits.length > 0 ? availableUnits[0] : '');
    const words = safeUnit ? getWordsByUnit(safeUnit) : [];
    const masteredCount = words.filter(w => masteredWords.has(w.id)).length;
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur z-20 border-b border-slate-800 flex-shrink-0">
          <div className="px-4 py-3 flex gap-3 overflow-x-auto no-scrollbar border-b border-slate-800/50">
            {LIBRARY_STRUCTURE.map(cat => (
              <button key={cat.id} onClick={() => handleCategoryChange(cat.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{cat.id === 'writing_skills' && <Mic size={12}/>}{cat.id === 'exam_prep' && <Layers size={12}/>}{cat.name}</button>
            ))}
          </div>
          <div className="p-4 pb-2 pt-2">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2"><Book size={14} className="text-cyan-400"/>{currentCategory?.name}</h2>
                <button onClick={() => setFlashcardMode(!flashcardMode)} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${flashcardMode ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>{flashcardMode ? <EyeOff size={12}/> : <Eye size={12}/>}{flashcardMode ? '暗记模式' : '显示中文'}</button>
            </div>
            {availableUnits.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">{availableUnits.map(unit => (<button key={unit} onClick={() => setSelectedUnit(unit)} className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${safeUnit === unit ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>{unit}</button>))}</div>
            ) : <div className="py-2 text-xs text-slate-500 italic">该分类下暂无内容，敬请期待更新...</div>}
          </div>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          {safeUnit && words.length > 0 && (
            <div className="flex justify-between items-center mb-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                <div className="flex flex-col"><span className="text-slate-300 text-sm font-bold">{safeUnit}</span><span className="text-slate-500 text-xs">共 {words.length} 词 · 已掌握 {masteredCount}</span></div>
                <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(masteredCount / words.length) * 100}%` }}></div></div>
            </div>
          )}
          <div className="space-y-1">{words.length > 0 ? words.map(word => (<WordCard key={word.id} word={word} isMastered={masteredWords.has(word.id)} onToggleMaster={toggleMasterWord} flashcardMode={flashcardMode} />)) : (<div className="flex flex-col items-center justify-center mt-20 text-slate-600"><LayoutGrid size={40} className="mb-2 opacity-50"/><p>暂无词汇数据</p></div>)}</div>
        </div>
      </div>
    );
  };

  const renderBattlePrep = () => (
    <div className="p-6 flex flex-col h-full items-center justify-start space-y-6 overflow-y-auto relative pb-24">
      <div className="flex justify-between items-center w-full max-w-sm mb-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700 shadow-lg">
          <div className="flex gap-6">
              <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">总经验 (EXP)</span>
                  <span className="font-black text-xl text-purple-400 flex items-center gap-1"><Zap size={14} className="fill-current"/> {userStats.exp}</span>
              </div>
              <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">总金币 (Gold)</span>
                  <span className="font-black text-xl text-yellow-400 flex items-center gap-1"><CircleDollarSign size={14} className="fill-current"/> {userStats.gold}</span>
              </div>
          </div>
          <button onClick={() => setShowRulesModal(true)} className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition-colors"><Info size={20} /></button>
      </div>

      <div className="text-center space-y-2 mt-2 mb-6"><Sword size={48} className="text-yellow-400 mx-auto" /><h2 className="text-2xl font-bold text-white">选择作战地图</h2><p className="text-slate-400">选择一个关卡开始挑战</p></div>
      <div className="w-full max-w-sm space-y-6 pb-20">
        {LIBRARY_STRUCTURE.map((category) => (
          <div key={category.id} className="animate-fade-in">
             <button onClick={() => toggleCategory(category.id)} className={`w-full flex items-center justify-between text-left p-3 rounded-lg transition-colors ${expandedCategories.has(category.id) ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-300'}`}>
                 <div className="flex items-center gap-3"><Layers size={18} className="text-blue-400"/><span className="font-bold text-sm">{category.name}</span></div>
                 {expandedCategories.has(category.id) ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
             </button>
             
             {expandedCategories.has(category.id) && (
                 <div className="mt-2 pl-2 border-l-2 border-slate-800 ml-4 space-y-2">
                 {category.units.length === 0 ? <div className="text-center p-3 text-slate-500 text-xs italic">即将开放区域...</div> : (
                   category.units.map((unit, idx) => (
                       <button key={unit} onClick={() => handleUnitClick(unit)} className={`w-full p-3 rounded-xl flex justify-between items-center group transition-all border ${unit === '全册综合测试' ? 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-yellow-500/50 shadow-lg shadow-yellow-900/20 hover:border-yellow-400' : 'bg-slate-800 hover:bg-slate-700 border-slate-600'}`}>
                           <div className="flex items-center gap-3">
                               <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] border ${unit === '全册综合测试' ? 'bg-yellow-500 text-slate-900 border-yellow-400 font-bold' : 'bg-slate-900 text-slate-500 border-slate-700 group-hover:border-yellow-500 group-hover:text-yellow-500'}`}>
                                   {unit === '全册综合测试' ? <Crown size={14}/> : (category.units[0] === '全册综合测试' ? idx : idx + 1)}
                               </span>
                               <span className={`font-semibold text-sm ${unit === '全册综合测试' ? 'text-yellow-400' : 'text-white'}`}>{unit}</span>
                           </div>
                           <ChevronRight size={16} className={`group-hover:text-white ${unit === '全册综合测试' ? 'text-yellow-500' : 'text-slate-500'}`}/>
                       </button>
                   ))
                 )}
                 </div>
             )}
          </div>
        ))}
      </div>
      {missionModalOpen && (
          <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-slate-800 border border-slate-700 w-full max-w-sm rounded-2xl p-5 shadow-2xl relative">
                  <button onClick={() => setMissionModalOpen(false)} className="absolute top-3 right-3 text-slate-400 hover:text-white"><X size={20} /></button>
                  <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2"><Target className="text-red-500" />行动代号: {pendingUnitStart}</h3>
                  <p className="text-slate-400 text-xs mb-6">请选择本次作战的具体任务类型</p>
                  <div className="space-y-3">
                      <button onClick={() => startQuiz('VOCAB')} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 p-4 rounded-xl flex items-center justify-between group border border-blue-400/30"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-blue-800/50 flex items-center justify-center"><Zap size={20} className="text-blue-200" /></div><div className="text-left"><div className="font-bold text-white">词汇突袭</div><div className="text-[10px] text-blue-200">快速词汇突袭</div></div></div><ChevronRight className="text-blue-200" /></button>
                      <button onClick={() => startQuiz('DICTATION')} className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 p-4 rounded-xl flex items-center justify-between group border border-emerald-400/30"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-emerald-800/50 flex items-center justify-center"><Headphones size={20} className="text-emerald-200" /></div><div className="text-left"><div className="font-bold text-white">通信破译 (听写)</div><div className="text-[10px] text-emerald-200">信号破译行动</div></div></div><ChevronRight className="text-emerald-200" /></button>
                      <button onClick={() => startQuiz('EXAM')} className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 p-4 rounded-xl flex items-center justify-between group border border-purple-400/30"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-purple-800/50 flex items-center justify-center"><GraduationCap size={20} className="text-purple-200" /></div><div className="text-left"><div className="font-bold text-white">语法特训</div><div className="text-[10px] text-purple-200">语法与考试</div></div></div><ChevronRight className="text-purple-200" /></button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );

  const renderBattle = () => {
    if (quizFinished) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in bg-slate-900">
                <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full"></div>
                    <Trophy size={80} className="text-yellow-400 relative z-10" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2">挑战成功</h2>
                <div className="text-6xl font-black text-yellow-400 mb-6 drop-shadow-glow">{quizScore}</div>
                <p className="text-slate-400 mb-6 font-mono text-xs">{rewardSummary.message}</p>
                <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8">
                    <div className="bg-slate-800 p-4 rounded-xl text-center border border-slate-700">
                        <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">金币</div>
                        <div className="text-xl font-bold text-yellow-400">+{rewardSummary.gold}</div>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-xl text-center border border-slate-700">
                        <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">经验</div>
                        <div className="text-xl font-bold text-purple-400">+{rewardSummary.exp}</div>
                    </div>
                </div>
                <button onClick={() => setCurrentView(AppView.LOBBY)} className="w-full max-w-xs bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold text-white shadow-lg transition-all">
                    返回大厅
                </button>
            </div>
        );
    }

    const currentQ = quizQuestions[currentQuestionIndex];
    if (!currentQ) return <div>加载中...</div>;
    const progress = ((currentQuestionIndex) / quizQuestions.length) * 100;

    return (
        <div className="h-full flex flex-col relative bg-slate-900 pb-20">
            <div className="p-4 flex justify-between items-center bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 z-10 relative">
                <button onClick={handleExitBattle} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400"><X size={20}/></button>
                <div className="flex-1 mx-4">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>进度 {currentQuestionIndex + 1}/{quizQuestions.length}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300" style={{width: `${progress}%`}}></div>
                    </div>
                </div>
                <div className="font-mono font-bold text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded border border-yellow-500/20">{quizScore}</div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-start pt-10 relative">
                {floatingReward && (
                    <div className="fixed top-24 right-4 z-50 animate-bounce text-yellow-400 font-bold text-xl drop-shadow-lg pointer-events-none whitespace-nowrap bg-black/50 px-3 py-1.5 rounded-full border border-yellow-500/50 backdrop-blur-md">
                        {floatingReward.text}
                    </div>
                )}

                {battleMode === 'EXAM' && (
                    <div className="w-full max-w-md animate-fade-in relative">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-6 rounded-3xl border border-slate-600/50 shadow-2xl mb-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>
                            <span className="text-[10px] font-black tracking-widest text-purple-400 uppercase mb-4 block opacity-80">语法战术</span>
                            <p className="text-xl font-medium text-white leading-relaxed">{(currentQ as ExamQuestion).question}</p>
                        </div>
                        <div className="space-y-3">
                            {(currentQ as ExamQuestion).options.map((opt, idx) => {
                                let stateClass = 'bg-slate-800/50 border-slate-700 hover:bg-slate-700 hover:border-slate-500';
                                if (answerStatus !== 'IDLE') {
                                    if (idx === (currentQ as ExamQuestion).correctAnswer) stateClass = 'bg-green-600/20 border-green-500 text-green-100 ring-1 ring-green-500/50';
                                    else if (answerStatus === 'WRONG') stateClass = 'opacity-30 border-transparent';
                                    else stateClass = 'opacity-50 border-transparent';
                                }
                                return (
                                    <button 
                                        key={idx} 
                                        onClick={() => handleAnswer(idx === (currentQ as ExamQuestion).correctAnswer, currentQ.id)}
                                        disabled={answerStatus !== 'IDLE'}
                                        className={`w-full p-5 rounded-2xl border-2 text-left font-medium text-slate-200 transition-all active:scale-[0.98] shadow-lg flex items-center ${stateClass}`}
                                    >
                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold mr-4 transition-colors ${answerStatus === 'IDLE' ? 'bg-slate-700 text-slate-400' : (idx === (currentQ as ExamQuestion).correctAnswer ? 'bg-green-500 text-black' : 'bg-slate-800 text-slate-600')}`}>
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {battleMode === 'VOCAB' && (
                     <div className="w-full max-w-md animate-fade-in flex flex-col items-center">
                        <div className="relative mb-10 mt-4">
                            <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full"></div>
                            <div className="relative text-center">
                                <h2 className="text-5xl font-black text-white mb-3 tracking-tighter drop-shadow-2xl">{(currentQ as Word).english}</h2>
                                <div className="inline-flex items-center gap-2 bg-slate-800/80 backdrop-blur px-4 py-1.5 rounded-full border border-slate-700 text-slate-400 text-sm shadow-xl">
                                    <span className="font-mono">{(currentQ as Word).phonetic}</span>
                                    <Volume2 size={14} className="cursor-pointer hover:text-white" onClick={() => speak((currentQ as Word).english)}/>
                                </div>
                            </div>
                        </div>
                        <div className="w-full space-y-3">
                            {currentVocabOptions.map((opt) => {
                                let stateClass = 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 hover:border-slate-500';
                                const isCorrect = opt.id === (currentQ as Word).id;
                                if (answerStatus !== 'IDLE') {
                                    if (isCorrect) stateClass = 'bg-green-600/20 border-green-500 text-green-100 ring-1 ring-green-500/50';
                                    else if (answerStatus === 'WRONG') stateClass = 'opacity-30 border-transparent';
                                    else stateClass = 'opacity-50 border-transparent';
                                }
                                return (
                                    <button 
                                        key={opt.id} 
                                        onClick={() => handleAnswer(isCorrect, (currentQ as Word).id)}
                                        disabled={answerStatus !== 'IDLE'}
                                        className={`w-full p-5 rounded-2xl border-2 text-center font-bold text-slate-200 transition-all active:scale-[0.98] shadow-lg text-lg ${stateClass}`}
                                    >
                                        {opt.chinese}
                                    </button>
                                );
                            })}
                        </div>
                     </div>
                )}

                {battleMode === 'DICTATION' && (
                    <div className="w-full max-w-md animate-fade-in text-center pt-6">
                        <div className="mb-10 relative inline-block group">
                             <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                             <button onClick={() => speak((currentQ as Word).english)} className="relative w-32 h-32 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-slate-700 flex items-center justify-center shadow-2xl active:scale-95 transition-all group-hover:border-emerald-500/50">
                                 <Headphones size={48} className="text-emerald-400" />
                             </button>
                             <p className="mt-4 text-slate-400 text-sm font-medium">点击图标播放读音</p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 mb-8 max-w-xs mx-auto">
                            <span className="text-xs text-slate-500 uppercase tracking-widest block mb-1">释义</span>
                            <span className="text-lg font-bold text-white">{(currentQ as Word).chinese}</span>
                        </div>
                        <div className="relative max-w-xs mx-auto">
                             <input 
                                value={userTypedAnswer}
                                onChange={(e) => setUserTypedAnswer(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleDictationSubmit(currentQ as Word)}
                                disabled={answerStatus !== 'IDLE'}
                                className="w-full bg-slate-800 border-b-2 border-slate-600 px-4 py-3 text-white text-center text-2xl tracking-[0.2em] font-mono focus:border-emerald-500 outline-none uppercase bg-transparent transition-colors placeholder:text-slate-700"
                                placeholder="在此输入"
                                autoFocus
                                autoComplete="off"
                             />
                             <button 
                                onClick={() => handleDictationSubmit(currentQ as Word)}
                                disabled={answerStatus !== 'IDLE'}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-emerald-500 opacity-50 hover:opacity-100"
                             >
                                <ArrowRight size={24} />
                             </button>
                        </div>
                    </div>
                )}
            </div>

            {answerStatus !== 'IDLE' && (
                <div className="absolute bottom-0 left-0 w-full z-[100] animate-slide-up">
                    <div className={`p-6 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/10 ${answerStatus === 'CORRECT' ? 'bg-emerald-900/95' : 'bg-red-900/95'} backdrop-blur-md`}>
                        <div className="flex items-start gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${answerStatus === 'CORRECT' ? 'bg-emerald-500 text-emerald-950' : 'bg-red-500 text-red-950'}`}>
                                {answerStatus === 'CORRECT' ? <CheckCircle size={28} /> : <XCircle size={28} />}
                            </div>
                            <div className="flex-1">
                                <h3 className={`text-2xl font-black ${answerStatus === 'CORRECT' ? 'text-emerald-100' : 'text-red-100'}`}>
                                    {answerStatus === 'CORRECT' ? '回答正确!' : '回答错误'}
                                </h3>
                                {answerStatus === 'WRONG' && (
                                    <div className="mt-2">
                                        <p className="text-red-200 text-xs font-bold uppercase mb-1">正确答案</p>
                                        <p className="text-white font-bold text-lg">
                                            {battleMode === 'VOCAB' || battleMode === 'DICTATION' ? (currentQ as Word).english : (currentQ as ExamQuestion).options[(currentQ as ExamQuestion).correctAnswer]}
                                        </p>
                                        <p className="text-red-100 text-sm mt-1 border-t border-red-500/30 pt-1">
                                            {battleMode === 'VOCAB' || battleMode === 'DICTATION' ? (currentQ as Word).chinese : (currentQ as ExamQuestion).explanation}
                                        </p>
                                        <div className="inline-flex items-center gap-1 mt-2 bg-red-950/50 px-2 py-1 rounded text-[10px] text-red-300 border border-red-500/30">
                                            <Shield size={10} /> 已加入错题库
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={handleNextQuestionClick}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${answerStatus === 'CORRECT' ? 'bg-white text-emerald-900 hover:bg-emerald-50' : 'bg-white text-red-900 hover:bg-red-50'}`}
                        >
                            下一题
                            <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center text-xs font-mono">
                                {countdown}
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
  };

  const renderArmory = () => (
      <div className="p-6 h-full overflow-y-auto pb-24">
        <header className="mb-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-2"><Shield className="text-red-500" /> 军械库 (Armory)</h2>
            <p className="text-slate-400 text-sm">错题自动收录于此，修复它们以强化装备。</p>
        </header>
        {mistakes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <CheckCircle size={60} className="text-green-500 mb-4"/>
                <p className="text-lg">暂无错题，继续保持！</p>
            </div>
        ) : (
            <div className="space-y-3">
                {mistakes.map((mistake) => (
                    <div key={mistake.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${mistake.type === 'EXAM' ? 'bg-purple-900/30 border-purple-500 text-purple-400' : 'bg-blue-900/30 border-blue-500 text-blue-400'}`}>{mistake.type}</span>
                                <span className="text-xs text-slate-500">{new Date(mistake.timestamp).toLocaleDateString()}</span>
                            </div>
                            <div className="text-slate-300 font-bold text-sm">
                                {mistake.type === 'VOCAB' || mistake.type === 'DICTATION' ? (
                                    <span>词汇修复: <span className="text-white">{(VOCABULARY_DATA.find(w => w.id === mistake.targetId)?.english) || '未知'}</span></span>
                                ) : (
                                    <span>语法修复: {mistake.unit} 题</span>
                                )}
                            </div>
                            <div className="text-xs text-red-400 mt-1">错误次数: {mistake.count}</div>
                        </div>
                        <button 
                            onClick={() => mistake.type === 'EXAM' ? startExamRepair(mistake.targetId) : startVocabRepair(mistake.targetId)}
                            className="bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                            修复
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>
  );

  const renderProfile = () => {
      // --- Data Preparation for Profile ---
      const mvpCount = battleHistory.filter(r => r.rank === 'S').length;
      
      // Radar Data Calculation
      const vocabScore = Math.min((masteredWords.size / 50) * 100, 100); 
      const examMatches = battleHistory.filter(b => b.mode === 'EXAM');
      const avgGrammar = examMatches.length > 0 ? (examMatches.reduce((acc, curr) => acc + (curr.score / curr.maxScore), 0) / examMatches.length) * 100 : 20; 
      const dictationMatches = battleHistory.filter(b => b.mode === 'DICTATION');
      const avgListening = dictationMatches.length > 0 ? (dictationMatches.reduce((acc, curr) => acc + (curr.score / curr.maxScore), 0) / dictationMatches.length) * 100 : 20;
      const tenacityScore = Math.min(((userStats.loginStreak * 5) + (userStats.studyMinutes / 10)), 100) || 20;
      const burstScore = battleHistory.length > 0 ? Math.min(Math.max(...battleHistory.map(b => (b.score / b.maxScore) * 100)), 100) : 20;

      const radarData = [
          { label: '词汇', value: vocabScore },
          { label: '语法', value: avgGrammar },
          { label: '听力', value: avgListening },
          { label: '毅力', value: tenacityScore },
          { label: '爆发', value: burstScore }
      ];

      // Radar SVG logic
      const size = 120;
      const center = size;
      const radius = 80;
      const angleSlice = (Math.PI * 2) / 5;
      const points = radarData.map((d, i) => {
          const value = Math.max(d.value, 15);
          const r = (value / 100) * radius;
          const x = center + r * Math.cos(i * angleSlice - Math.PI / 2);
          const y = center + r * Math.sin(i * angleSlice - Math.PI / 2);
          return `${x},${y}`;
      }).join(' ');
      const bgPoints = Array.from({length: 5}).map((_, i) => {
          const x = center + radius * Math.cos(i * angleSlice - Math.PI / 2);
          const y = center + radius * Math.sin(i * angleSlice - Math.PI / 2);
          return `${x},${y}`;
      }).join(' ');

      // Season Journey Data (Semester Stats)
      const allUnits = LIBRARY_STRUCTURE[0].units;
      const totalWords = VOCABULARY_DATA.length;
      const masteredCount = masteredWords.size;
      const lexicalCoverage = Math.round((masteredCount / totalWords) * 100) || 0;
      const totalBattles = battleHistory.length;
      const correctRate = userStats.matchesPlayed > 0 ? Math.round((userStats.correctCount / (battleHistory.reduce((acc, curr) => acc + curr.maxScore/10, 0) || 1)) * 100) : 0;
      const peakScore = battleHistory.length > 0 ? Math.max(...battleHistory.map(b => b.score)) : 0;

      const getUnitStatus = (unit: string) => {
          const history = battleHistory.filter(r => r.unit === unit);
          if (history.length === 0) return 'UNPLAYED';
          const maxRank = history.reduce((prev, curr) => (curr.rank === 'S' || (curr.rank === 'A' && prev !== 'S') || (curr.rank === 'B' && prev === 'C')) ? curr.rank : prev, 'C');
          return maxRank;
      };

      const rankInfo = getRankInfo(userStats.exp);

      return (
      <div className="h-full overflow-y-auto bg-slate-900 pb-24">
           {/* 1. Hero Card Area */}
           <div className="relative pt-6 px-4 mb-4">
               <div className={`absolute top-0 left-0 w-full h-48 bg-gradient-to-b ${rankInfo.config.color} opacity-20 rounded-b-[3rem]`}></div>
               
               <div className="relative z-10 flex flex-col items-center">
                   {/* Avatar with Rank Frame */}
                   <div className="relative mb-3 cursor-pointer group" onClick={() => setAvatarModalOpen(true)}>
                       <div className="w-24 h-24 rounded-full border-4 border-slate-800 bg-slate-900 overflow-hidden relative z-10">
                           <img src={userStats.avatar} alt="User" className="w-full h-full object-cover" />
                       </div>
                       {/* Decorative Frame */}
                       <div className="absolute -inset-2 rounded-full border-2 border-yellow-500/50 border-dashed animate-spin-slow pointer-events-none"></div>
                       <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black/80 px-3 py-0.5 rounded-full border border-yellow-500/50 z-20">
                           <span className="text-[10px] font-bold text-yellow-400 whitespace-nowrap">{userStats.rankTitle}</span>
                       </div>
                       <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"><Edit2 size={24} className="text-white"/></div>
                   </div>

                   <h1 className="text-2xl font-black text-white mt-2">{userStats.username}</h1>
                   <div className="text-xs text-slate-400 font-mono mb-4">UID: {Math.abs(userStats.username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)).toString().padStart(8, '0')}</div>

                   {/* KDA Stats Row */}
                   <div className="flex gap-4 w-full justify-center">
                       <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 min-w-[80px] text-center">
                           <div className="text-[10px] text-slate-500 uppercase font-bold">总场次</div>
                           <div className="text-lg font-black text-white">{userStats.matchesPlayed}</div>
                       </div>
                       <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 min-w-[80px] text-center">
                           <div className="text-[10px] text-slate-500 uppercase font-bold">胜率</div>
                           <div className="text-lg font-black text-emerald-400">{correctRate}%</div>
                       </div>
                       <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 min-w-[80px] text-center relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-8 h-8 bg-yellow-500/20 rounded-bl-full"></div>
                           <div className="text-[10px] text-slate-500 uppercase font-bold">MVP</div>
                           <div className="text-lg font-black text-yellow-400">{mvpCount}</div>
                       </div>
                   </div>
               </div>
           </div>

           {/* 2. Radar Chart Section */}
           <div className="px-4 mb-6">
               <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 flex flex-col items-center relative overflow-hidden">
                   <div className="absolute top-2 left-3 flex items-center gap-1 text-slate-400 text-xs font-bold"><Activity size={14}/> 五维能力图</div>
                   <div className="relative w-[240px] h-[240px] mt-2">
                       <svg width="240" height="240" viewBox="0 0 240 240">
                           {/* BG */}
                           <polygon points={bgPoints} fill="rgba(15, 23, 42, 0.5)" stroke="#334155" strokeWidth="1" />
                           <line x1={center} y1={center} x2={center} y2={center - radius} stroke="#334155" strokeWidth="0.5" strokeDasharray="4 2"/>
                           {/* Data */}
                           <polygon points={points} fill="rgba(56, 189, 248, 0.3)" stroke="#38bdf8" strokeWidth="2" className="drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
                           {/* Dots */}
                           {radarData.map((d, i) => {
                               const value = Math.max(d.value, 15);
                               const r = (value / 100) * radius;
                               const x = center + r * Math.cos(i * angleSlice - Math.PI / 2);
                               const y = center + r * Math.sin(i * angleSlice - Math.PI / 2);
                               return <circle key={i} cx={x} cy={y} r="3" fill="#fff" />;
                           })}
                           {/* Labels */}
                           <text x="120" y="25" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">词汇</text>
                           <text x="225" y="100" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">语法</text>
                           <text x="190" y="220" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">听力</text>
                           <text x="50" y="220" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">毅力</text>
                           <text x="15" y="100" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">爆发</text>
                       </svg>
                   </div>
               </div>
           </div>

           {/* 3. Season Journey Section (Refactored) */}
           <div className="px-4 mb-6">
               <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
                   {/* Header Toggle */}
                   <button 
                       onClick={() => setIsSeasonExpanded(!isSeasonExpanded)}
                       className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-800/50 hover:bg-slate-700/50 transition-colors"
                   >
                       <div className="flex items-center gap-2">
                           <Map size={18} className="text-blue-400"/>
                           <span className="text-white font-bold text-sm">S1 赛季：必修第一册 (2025 Fall)</span>
                       </div>
                       {isSeasonExpanded ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
                   </button>

                   {/* Collapsed State: Simple Progress */}
                   {!isSeasonExpanded && (
                       <div className="px-4 pb-4 pt-0 animate-fade-in">
                           <div className="flex justify-between text-[10px] text-slate-500 mb-1 mt-2">
                               <span>赛季进度 (Semester Progress)</span>
                               <span>{lexicalCoverage}%</span>
                           </div>
                           <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-500" style={{ width: `${lexicalCoverage}%` }}></div>
                           </div>
                       </div>
                   )}

                   {/* Expanded State: Full Dashboard */}
                   {isSeasonExpanded && (
                       <div className="p-4 border-t border-slate-700/50 bg-slate-900/30 animate-fade-in">
                           {/* Data Grid */}
                           <div className="grid grid-cols-2 gap-3 mb-6">
                               <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                                   <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-1"><PieChart size={12}/> 词汇覆盖率</div>
                                   <div className="text-xl font-black text-white">{lexicalCoverage}<span className="text-xs font-normal text-slate-500">%</span></div>
                                   <div className="text-[10px] text-slate-600">{masteredCount} / {totalWords} 词</div>
                               </div>
                               <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                                   <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-1"><Sword size={12}/> 实战活跃度</div>
                                   <div className="text-xl font-black text-blue-400">{totalBattles}</div>
                                   <div className="text-[10px] text-slate-600">Total Matches</div>
                               </div>
                               <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                                   <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-1"><Target size={12}/> 知识准确率</div>
                                   <div className="text-xl font-black text-green-400">{correctRate}<span className="text-xs font-normal text-slate-500">%</span></div>
                                   <div className="text-[10px] text-slate-600">Global Accuracy</div>
                               </div>
                               <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                                   <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-1"><TrendingUp size={12}/> 巅峰表现</div>
                                   <div className="text-xl font-black text-yellow-400">{peakScore}</div>
                                   <div className="text-[10px] text-slate-600">Highest Score</div>
                               </div>
                           </div>

                           {/* Compact Unit List */}
                           <div className="space-y-2">
                               <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">单元成就 (Unit Achievements)</div>
                               {allUnits.map((unit, idx) => {
                                   const status = getUnitStatus(unit);
                                   let badgeClass = "bg-slate-700 text-slate-500";
                                   let badgeText = "-";
                                   
                                   if (status === 'S') { badgeClass = "bg-yellow-500 text-black font-black"; badgeText = "S"; }
                                   else if (status === 'A') { badgeClass = "bg-purple-600 text-white font-bold"; badgeText = "A"; }
                                   else if (status === 'B') { badgeClass = "bg-blue-600 text-white font-bold"; badgeText = "B"; }
                                   else if (status === 'C') { badgeClass = "bg-slate-600 text-white"; badgeText = "C"; }

                                   return (
                                       <div key={unit} className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                                           <span className="text-xs font-bold text-slate-300">{unit}</span>
                                           <span className={`w-6 h-6 flex items-center justify-center rounded text-xs ${badgeClass}`}>
                                               {badgeText}
                                           </span>
                                       </div>
                                   );
                               })}
                           </div>
                       </div>
                   )}
               </div>
           </div>

           {/* 4. Menu Actions */}
           <div className="px-4 space-y-3">
               <button onClick={() => setShopAdminOpen(true)} className="w-full bg-gradient-to-r from-yellow-700/50 to-orange-700/50 hover:from-yellow-600/50 hover:to-orange-600/50 border border-yellow-500/30 p-4 rounded-xl flex items-center justify-between group transition-all">
                   <div className="flex items-center gap-4">
                       <div className="bg-black/30 p-2 rounded-lg text-yellow-400"><ShoppingBag size={20} /></div>
                       <div className="text-left">
                           <div className="font-bold text-white group-hover:text-yellow-200">补给站 (Shop)</div>
                           <div className="text-[10px] text-yellow-500/70">兑换奖励</div>
                       </div>
                   </div>
                   <ChevronRight size={18} className="text-yellow-500/50" />
               </button>
               
               <button onClick={() => setHistoryModalOpen(true)} className="w-full bg-slate-800 p-4 rounded-xl flex items-center justify-between hover:bg-slate-750 transition-colors border border-slate-700">
                   <div className="flex items-center gap-4">
                       <div className="bg-slate-900 p-2 rounded-lg text-blue-400"><History size={20} /></div>
                       <div className="text-left">
                           <div className="font-bold text-slate-200">作战记录 (History)</div>
                           <div className="text-[10px] text-slate-500">查看过往战绩</div>
                       </div>
                   </div>
                   <ChevronRight size={18} className="text-slate-500" />
               </button>

               <button onClick={handleLogout} className="w-full p-4 rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:text-red-400 hover:bg-red-950/20 transition-all text-xs font-bold mt-6">
                   <LogOut size={14}/> 退出登录
               </button>
           </div>
      </div>
      );
  };

  return (
    <Layout currentView={currentView} onChangeView={setCurrentView}>
      <RewardFlyer items={visualRewards} />
      {currentView === AppView.LOGIN && renderLogin()}
      {currentView === AppView.LOBBY && renderLobby()}
      {currentView === AppView.DATABASE && renderDatabase()}
      {currentView === AppView.BATTLE_PREP && renderBattlePrep()}
      {currentView === AppView.BATTLE && renderBattle()}
      {currentView === AppView.ARMORY && renderArmory()}
      {currentView === AppView.PROFILE && renderProfile()}

      {/* MODALS */}
      {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
              <div className="bg-slate-800 w-full max-w-xs rounded-2xl p-6 border border-slate-600 shadow-2xl">
                  <h3 className="text-lg font-bold text-white mb-2">{confirmModal.title}</h3>
                  <p className="text-sm text-slate-400 mb-6">{confirmModal.message}</p>
                  <div className="flex gap-3">
                      <button onClick={() => setConfirmModal(prev => ({...prev, isOpen: false}))} className="flex-1 py-2.5 rounded-lg bg-slate-700 text-slate-300 font-bold text-sm">取消</button>
                      <button onClick={confirmModal.onConfirm} className="flex-1 py-2.5 rounded-lg bg-cyan-600 text-white font-bold text-sm hover:bg-cyan-500">确认</button>
                  </div>
              </div>
          </div>
      )}

      {avatarModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setAvatarModalOpen(false)}>
            <div className="bg-slate-800 w-full max-w-md rounded-2xl p-6 border border-slate-700" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-4">选择英雄头像</h3>
                <div className="grid grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-1">
                    {HERO_AVATARS.map(hero => (
                        <button key={hero.name} onClick={() => handleAvatarSelect(hero.name)} className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-slate-700 transition-colors">
                            <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${hero.name}`} className="w-12 h-12 rounded-full bg-slate-900 border border-slate-600"/>
                            <span className="text-[10px] text-slate-400">{hero.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}

      {rankModalOpen && (
           <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md" onClick={() => setRankModalOpen(false)}>
               <div className="w-full max-w-sm" onClick={e => e.stopPropagation()}>
                    <RankDisplay stats={userStats} />
                    <div className="mt-6 text-center text-slate-400 text-xs">点击外部关闭</div>
               </div>
           </div>
      )}

      {showRulesModal && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setShowRulesModal(false)}>
              <div className="bg-slate-800 w-full max-w-md rounded-2xl p-6 border border-slate-700 relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowRulesModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20}/></button>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Info size={20} className="text-cyan-400"/> 游戏规则</h3>
                  <div className="space-y-4 text-sm text-slate-300">
                      <div className="bg-slate-700/50 p-3 rounded-lg"><strong className="text-white block mb-1">段位系统 (Rank System)</strong>每获得 5000 EXP 获得一颗星。积累星星提升段位。</div>
                      <div className="bg-slate-700/50 p-3 rounded-lg"><strong className="text-white block mb-1">实战奖励 (Battle Rewards)</strong>实战中正确率超过 50% 即可获得经验和金币。表现越好奖励越丰厚。</div>
                      <div className="bg-slate-700/50 p-3 rounded-lg"><strong className="text-white block mb-1">军械库 (Armory)</strong>错题会被自动收集。在军械库中修复错题可以消除它们，并获得额外奖励。</div>
                  </div>
              </div>
          </div>
      )}

      {repairModalOpen && activeRepairQuestion && (
           <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setRepairModalOpen(false)}>
               <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                   <div className="bg-purple-900/20 p-4 border-b border-purple-500/30 flex justify-between items-center">
                       <div className="flex items-center gap-3">
                           <button onClick={() => setRepairModalOpen(false)} className="p-1 text-purple-400 hover:text-white bg-purple-900/30 rounded-lg"><ChevronLeft size={20}/></button>
                           <h3 className="font-bold text-purple-200 flex items-center gap-2"><Wand2 size={18}/> 错题重铸</h3>
                       </div>
                       <button onClick={() => setRepairModalOpen(false)}><X className="text-purple-400 hover:text-white"/></button>
                   </div>
                   <div className="p-6">
                       <p className="text-lg text-white mb-6 font-medium leading-relaxed">{activeRepairQuestion.question}</p>
                       <div className="space-y-3">
                           {activeRepairQuestion.options.map((opt, idx) => (
                               <button 
                                key={idx}
                                onClick={() => handleRepairAnswer(idx === activeRepairQuestion.correctAnswer)}
                                className="w-full p-4 rounded-xl bg-slate-800 text-left text-slate-300 hover:bg-purple-900/40 hover:text-purple-200 hover:border-purple-500/50 border border-slate-700 transition-all active:scale-[0.98]"
                                >
                                   <span className="font-mono opacity-50 mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
                               </button>
                           ))}
                       </div>
                   </div>
               </div>
           </div>
      )}

      {vocabRepairModalOpen && activeRepairVocab && (
          <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setVocabRepairModalOpen(false)}>
              <div className="w-full max-w-sm bg-slate-900 rounded-2xl p-6 border border-slate-700 text-center shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
                  {/* Progress Bar */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                      <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: repairStep === 1 ? '50%' : '100%' }}></div>
                  </div>
                  
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6 mt-2">
                      <button onClick={() => setVocabRepairModalOpen(false)} className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-lg"><ChevronLeft size={20}/></button>
                      <h3 className="text-sm font-bold text-cyan-400 tracking-widest uppercase">
                          {repairStep === 1 ? 'PHASE 1: 拼写重构' : 'PHASE 2: 语义链接'}
                      </h3>
                      <button onClick={() => setVocabRepairModalOpen(false)} className="p-1 text-slate-400 hover:text-white"><X size={20}/></button>
                  </div>

                  {repairStep === 1 && (
                      <div className="animate-fade-in">
                          <p className="text-slate-400 text-xs mb-2 font-mono tracking-wider">SPELL THE WORD</p>
                          <div className="text-3xl font-mono font-black text-slate-600 mb-6 tracking-[0.2em]">{maskedWord}</div>
                          
                          <input 
                            className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl p-4 text-center text-white text-xl tracking-[0.1em] mb-6 outline-none focus:border-cyan-500 transition-colors font-mono"
                            autoFocus
                            value={userTypedAnswer}
                            onChange={e => setUserTypedAnswer(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleVocabRepairSubmit()}
                            placeholder="输入完整单词"
                            autoComplete="off"
                          />
                          
                          <button onClick={handleVocabRepairSubmit} className="w-full py-4 bg-cyan-600 rounded-xl text-white font-bold hover:bg-cyan-500 shadow-lg shadow-cyan-900/20 active:scale-95 transition-all">
                              下一步
                          </button>
                      </div>
                  )}

                  {repairStep === 2 && (
                      <div className="animate-fade-in">
                          <p className="text-slate-400 text-xs mb-2 font-mono tracking-wider">SELECT MEANING</p>
                          <h2 className="text-2xl font-bold text-white mb-6">{activeRepairVocab.chinese}</h2>
                          <div className="space-y-3">
                              {repairOptions.map((opt) => (
                                  <button 
                                      key={opt.id}
                                      onClick={() => handleVocabRepairSelect(opt.id)}
                                      className="w-full p-4 rounded-xl bg-slate-800 border-2 border-slate-700 hover:border-cyan-500 hover:bg-slate-700/50 text-white font-bold text-lg transition-all active:scale-95"
                                  >
                                      {opt.english}
                                  </button>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* 5. Shop Admin Auth Modal */}
      {adminLoginOpen && (
          <div className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center p-4">
              <div className="bg-slate-900 w-full max-w-xs rounded-2xl border border-slate-700 p-6 text-center">
                  <Lock className="mx-auto text-slate-500 mb-4" size={32} />
                  <h3 className="text-white font-bold mb-4">家长/管理员验证</h3>
                  <input 
                      type="password" 
                      value={adminPasswordInput}
                      onChange={e => setAdminPasswordInput(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white mb-4 outline-none focus:border-cyan-500"
                  />
                  <div className="flex gap-2">
                      <button onClick={() => setAdminLoginOpen(false)} className="flex-1 py-2 bg-slate-800 text-slate-400 rounded-lg">取消</button>
                      <button onClick={handleAdminLoginSubmit} className="flex-1 py-2 bg-cyan-600 text-white font-bold rounded-lg">确认</button>
                  </div>
              </div>
          </div>
      )}

      {/* 6. Shop Modal */}
      {shopAdminOpen && (
          <div className="fixed inset-0 z-[90] bg-slate-900 overflow-y-auto">
              <div className="max-w-md mx-auto min-h-screen bg-slate-900 pb-20 relative">
                  <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-4 flex items-center justify-between">
                      <button onClick={() => setShopAdminOpen(false)} className="p-2 bg-slate-800 rounded-full"><ChevronDown className="text-white"/></button>
                      <h2 className="text-white font-bold">奖励兑换中心</h2>
                      <div className="w-8"></div>
                  </div>

                  {/* User View: Item List */}
                  <div className="p-4 grid grid-cols-2 gap-3">
                      {shopItems.map(item => (
                          <div key={item.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-between relative group">
                              {isAdminMode && (
                                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={(e) => { e.stopPropagation(); startEditItem(item); }} className="p-1 bg-blue-500/20 text-blue-400 rounded"><Edit2 size={12}/></button>
                                      <button onClick={(e) => { e.stopPropagation(); deleteShopItem(item.id); }} className="p-1 bg-red-500/20 text-red-400 rounded"><Trash2 size={12}/></button>
                                  </div>
                              )}
                              <div className="text-3xl mb-2">{item.icon}</div>
                              <h3 className="text-slate-200 font-bold text-sm mb-1">{item.name}</h3>
                              <p className="text-[10px] text-slate-500 mb-3 leading-tight">{item.description}</p>
                              <button onClick={() => buyItem(item)} className="w-full py-2 bg-slate-700 hover:bg-yellow-600/20 hover:text-yellow-400 text-slate-300 rounded-lg text-xs font-bold border border-slate-600 hover:border-yellow-500/50 transition-all flex items-center justify-center gap-1">
                                  <span className="text-yellow-500">🪙</span> {Math.floor(item.price * getLevelInfo(userStats.totalGoldEarned).discountMultiplier)}
                              </button>
                          </div>
                      ))}
                  </div>

                  {/* Admin Toggle */}
                  {!isAdminMode && (
                      <div className="p-4">
                          <button onClick={() => setAdminLoginOpen(true)} className="w-full py-3 border border-slate-700 border-dashed rounded-xl text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors">
                              管理员登录 (添加/管理商品)
                          </button>
                      </div>
                  )}

                  {/* Admin View: Add/Edit */}
                  {isAdminMode && (
                      <div className="p-4 border-t border-slate-800 bg-slate-800/50 mt-4">
                          <h3 className="text-slate-400 text-xs font-bold mb-3 uppercase">{editingItemId ? '编辑商品' : '添加新商品 (Admin)'}</h3>
                          <div className="space-y-3">
                              <input value={newShopItem.name} onChange={e => setNewShopItem({...newShopItem, name: e.target.value})} placeholder="商品名称" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
                              <div className="flex gap-2">
                                  <input type="number" value={newShopItem.price} onChange={e => setNewShopItem({...newShopItem, price: Number(e.target.value)})} placeholder="价格" className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
                                  <select value={newShopItem.icon} onChange={e => setNewShopItem({...newShopItem, icon: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
                                      {SHOP_ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                                  </select>
                              </div>
                              <div className="flex gap-2">
                                  <button onClick={handleSaveShopItem} className="flex-1 bg-cyan-600 text-white font-bold py-2 rounded-lg text-sm">{editingItemId ? '保存修改' : '添加商品'}</button>
                                  {editingItemId && <button onClick={cancelEdit} className="px-4 bg-slate-700 text-slate-300 font-bold py-2 rounded-lg text-sm">取消</button>}
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* 7. History Modal */}
      {historyModalOpen && (
          <div className="fixed inset-0 z-[70] bg-slate-900 flex flex-col animate-slide-in-right">
              <div className="p-4 border-b border-slate-800 flex items-center gap-4">
                  <button onClick={() => setHistoryModalOpen(false)}><ChevronLeft className="text-white"/></button>
                  <h2 className="text-white font-bold">历史战绩 (Battle History)</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {battleHistory.map(record => (
                      <div key={record.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                          <div>
                              <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-xs font-black px-1.5 rounded ${record.rank === 'S' ? 'bg-yellow-500 text-black' : record.rank === 'A' ? 'bg-purple-500 text-white' : 'bg-slate-600 text-white'}`}>{record.rank}</span>
                                  <span className="text-slate-200 font-bold">{record.unit}</span>
                              </div>
                              <div className="text-[10px] text-slate-500">{new Date(record.timestamp).toLocaleString()} • {record.mode}</div>
                          </div>
                          <div className="text-right">
                              <div className="text-xl font-black text-white">{record.score}</div>
                              <div className="text-[10px] text-slate-500">得分 (Score)</div>
                          </div>
                      </div>
                  ))}
                  {battleHistory.length === 0 && <div className="text-center text-slate-500 mt-10">暂无记录，快去战斗吧！</div>}
              </div>
          </div>
      )}

    </Layout>
  );
};

export default App;