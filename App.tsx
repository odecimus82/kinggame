import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Play, RotateCcw, Volume2, Trophy, Flame, ChevronRight, XCircle, CheckCircle, Lock, Star, ChevronLeft, Shield, Sword, Book, User, Mic, ChevronDown, Eye, EyeOff, Clock, Calendar, Zap, Target, TrendingUp, Map, Layers, LayoutGrid, X, AlertTriangle, GraduationCap, RefreshCw, Wand2, Headphones, Keyboard, Award, ChevronUp, ShoppingBag, Plus, Trash2, Gift, History, Settings, LogOut, ArrowRight, Crown, Quote, CalendarCheck, Edit2, Save, XSquare, Info, Percent, CircleDollarSign, Wrench } from 'lucide-react';
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
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
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
                  <span className="text-[10px] font-bold bg-white/10 px-1.5 py-0.5 rounded text-white/80 tracking-wider">SEASON RANK</span>
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
    dailyRepairCount: 0, // Reset daily
    totalRepairs: 0 // Lifetime repairs
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

  // Modals & UI
  const [repairModalOpen, setRepairModalOpen] = useState(false);
  const [activeRepairQuestion, setActiveRepairQuestion] = useState<ExamQuestion | null>(null);
  const [vocabRepairModalOpen, setVocabRepairModalOpen] = useState(false);
  const [activeRepairVocab, setActiveRepairVocab] = useState<Word | null>(null);
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
      const today = new Date().toISOString().split('T')[0];
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
          setConfirmModal({
              isOpen: true,
              title: '签到成功',
              message: '今日签到完成！获得 50 金币和 20 经验值。各项每日数据已重置。',
              onConfirm: () => setConfirmModal(prev => ({...prev, isOpen: false}))
          });
      }
  };

  const isCheckedInToday = () => {
      const today = new Date().toISOString().split('T')[0];
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
      const today = new Date().toISOString().split('T')[0];
      const claimed = userStats.dailyQuestsClaimed[today] || [];
      if (claimed.includes(questId)) return;

      setUserStats(prev => {
          const newClaims = { ...prev.dailyQuestsClaimed };
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
          setVocabRepairModalOpen(true);
          setUserTypedAnswer('');
      }
  };

  const handleVocabRepairSubmit = () => {
      if (!activeRepairVocab) return;
      const correct = activeRepairVocab.english.toLowerCase().trim() === userTypedAnswer.toLowerCase().trim();
      
      if (correct) {
          setMistakes(prev => prev.filter(m => m.targetId !== activeRepairVocab.id));
          
          // Reward logic for repair
          const bonusExp = 1;
          const currentTotalRepairs = (userStats.totalRepairs || 0) + 1;
          const bonusGold = currentTotalRepairs % 10 === 0 ? 1 : 0;
          const rewardText = bonusGold > 0 ? `拼写正确! +${bonusExp} 经验 & +${bonusGold} 金币` : `拼写正确! +${bonusExp} 经验`;

          setUserStats(prev => ({ 
              ...prev, 
              exp: prev.exp + bonusExp,
              gold: prev.gold + bonusGold,
              totalGoldEarned: (prev.totalGoldEarned || prev.gold) + bonusGold,
              dailyRepairCount: (prev.dailyRepairCount || 0) + 1,
              totalRepairs: currentTotalRepairs
          })); 

          setFloatingReward({ id: Date.now(), text: rewardText });
          setTimeout(() => setFloatingReward(null), 2000);

          setVocabRepairModalOpen(false);
      } else {
          alert("拼写错误，请重试！");
      }
  };

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
    const today = new Date().toISOString().split('T')[0];
    const claimedToday = userStats.dailyQuestsClaimed[today] || [];
    
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
                      const today = new Date().toISOString().split('T')[0];
                      const claimed = userStats.dailyQuestsClaimed[today] || [];
                      if (claimed.includes('quest_repair_5')) return;

                      setUserStats(prev => {
                          const newClaims = { ...prev.dailyQuestsClaimed };
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

  const renderDatabase = () => (
    <div className="flex flex-col h-full bg-slate-900">
        <div className="p-4 bg-slate-800 border-b border-slate-700">
             <div className="flex overflow-x-auto gap-2 mb-3 pb-2 scrollbar-hide">
                 {LIBRARY_STRUCTURE.map(cat => (
                     <button key={cat.id} onClick={() => handleCategoryChange(cat.id)} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>{cat.name}</button>
                 ))}
             </div>
             <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                 {LIBRARY_STRUCTURE.find(c => c.id === selectedCategory)?.units.map(u => (
                     <button key={u} onClick={() => setSelectedUnit(u)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border ${selectedUnit === u ? 'bg-slate-700 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-600 text-slate-500 hover:border-slate-500'}`}>{u}</button>
                 ))}
             </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 pb-24">
             <div className="flex justify-between items-center mb-4">
                 <h2 className="text-white font-bold text-lg">{selectedUnit} <span className="text-slate-500 text-xs font-normal">({getWordsByUnit(selectedUnit).length} words)</span></h2>
                 <button onClick={() => setFlashcardMode(!flashcardMode)} className={`p-2 rounded-lg border ${flashcardMode ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'bg-slate-700 border-slate-600 text-slate-400'}`}><Layers size={18}/></button>
             </div>
             {getWordsByUnit(selectedUnit).map(word => (
                 <WordCard key={word.id} word={word} isMastered={masteredWords.has(word.id)} onToggleMaster={toggleMasterWord} flashcardMode={flashcardMode} />
             ))}
             {getWordsByUnit(selectedUnit).length === 0 && <div className="text-center text-slate-500 py-10">暂无数据</div>}
        </div>
    </div>
  );

  const renderBattlePrep = () => (
    <div className="h-full overflow-y-auto p-4 pb-24 space-y-4">
        <h2 className="text-2xl font-black text-white italic tracking-tighter mb-6 flex items-center gap-2"><Sword className="text-yellow-500" /> BATTLE FIELD</h2>
        {UNITS.map(unit => {
            const progress = userStats.unlockedAchievements.includes(`complete_${unit}`) ? 100 : 0; 
            return (
                <div key={unit} onClick={() => handleUnitClick(unit)} className="bg-slate-800 group hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 transition-all p-5 rounded-xl cursor-pointer relative overflow-hidden">
                    <div className="flex justify-between items-center relative z-10">
                        <div>
                            <h3 className="text-lg font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{unit}</h3>
                            <p className="text-xs text-slate-500 mt-1">Recommend Lv.{unit.includes('Welcome') ? 1 : 2}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-600 group-hover:border-cyan-400 group-hover:bg-cyan-900/20 transition-all">
                             <Play size={18} className="text-slate-400 group-hover:text-cyan-400 fill-current" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 h-1 bg-cyan-500 transition-all duration-1000" style={{width: `${progress}%`}}></div>
                </div>
            );
        })}
    </div>
  );

  const renderBattle = () => {
      if (quizFinished) {
          return (
             <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-indigo-900/50"></div>
                <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
                    <div className="mb-6 p-6 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full shadow-[0_0_50px_rgba(234,179,8,0.4)] animate-bounce">
                        <Trophy size={64} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2 italic">VICTORY</h2>
                    <p className="text-slate-400 mb-8 font-mono">BATTLE FINISHED</p>
                    
                    <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8">
                        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col items-center">
                            <span className="text-xs text-slate-500 uppercase font-bold">Score</span>
                            <span className="text-2xl font-black text-white">{quizScore}</span>
                        </div>
                        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col items-center">
                            <span className="text-xs text-slate-500 uppercase font-bold">Accuracy</span>
                            <span className="text-2xl font-black text-white">{Math.round((quizScore / (quizQuestions.length * 10)) * 100)}%</span>
                        </div>
                    </div>

                    {rewardSummary.message && (
                        <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                            <p className="text-sm text-slate-300 mb-2">{rewardSummary.message}</p>
                            <div className="flex justify-center gap-4">
                                {rewardSummary.exp > 0 && <span className="text-yellow-400 font-bold flex items-center gap-1">+{rewardSummary.exp} EXP</span>}
                                {rewardSummary.gold > 0 && <span className="text-yellow-400 font-bold flex items-center gap-1">+{rewardSummary.gold} Gold</span>}
                            </div>
                        </div>
                    )}

                    <button onClick={() => setCurrentView(AppView.LOBBY)} className="px-10 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-lg active:scale-95 transition-all">
                        RETURN TO LOBBY
                    </button>
                </div>
             </div>
          );
      }

      const currentQ = quizQuestions[currentQuestionIndex];
      if (!currentQ) return <div className="p-10 text-center">Loading...</div>;

      return (
          <div className="h-full flex flex-col bg-slate-900 relative">
              {/* Top Bar */}
              <div className="p-4 flex justify-between items-center bg-slate-800/50 backdrop-blur-md z-10">
                  <button onClick={handleExitBattle} className="text-slate-400 hover:text-white"><XCircle /></button>
                  <div className="flex-1 mx-6">
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}></div>
                      </div>
                  </div>
                  <div className={`font-mono font-bold text-lg ${countdown <= 3 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>00:0{countdown}</div>
              </div>

              {/* Main Stage */}
              <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                  {answerStatus !== 'IDLE' && (
                      <div className={`absolute inset-0 flex items-center justify-center z-20 bg-black/50 backdrop-blur-sm animate-fade-in`}>
                          {answerStatus === 'CORRECT' ? (
                              <div className="text-green-500 flex flex-col items-center animate-bounce">
                                  <CheckCircle size={80} className="mb-4 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]" />
                                  <span className="text-4xl font-black italic">PERFECT</span>
                              </div>
                          ) : (
                              <div className="text-red-500 flex flex-col items-center animate-shake">
                                  <XCircle size={80} className="mb-4 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
                                  <span className="text-4xl font-black italic">MISS</span>
                              </div>
                          )}
                      </div>
                  )}

                  <div className="w-full max-w-md">
                      {battleMode === 'VOCAB' && 'english' in currentQ && (
                          <>
                            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl mb-8 text-center min-h-[200px] flex flex-col items-center justify-center">
                                <h2 className="text-4xl font-black text-white mb-4 tracking-wide">{(currentQ as Word).english}</h2>
                                <div className="flex gap-2 text-slate-500 text-sm font-mono">
                                    <span>{(currentQ as Word).phonetic}</span>
                                    <span>•</span>
                                    <span>{(currentQ as Word).partOfSpeech}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {currentVocabOptions.map((opt, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => handleAnswer(opt.id === currentQ.id, currentQ.id)}
                                        disabled={answerStatus !== 'IDLE'}
                                        className="p-4 bg-slate-800/50 hover:bg-slate-700 border border-slate-600 hover:border-cyan-500/50 rounded-xl text-left text-slate-200 font-bold transition-all active:scale-[0.98]"
                                    >
                                        {opt.chinese}
                                    </button>
                                ))}
                            </div>
                          </>
                      )}

                      {battleMode === 'EXAM' && 'options' in currentQ && (
                          <>
                             <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl mb-6 min-h-[160px] flex items-center">
                                <h2 className="text-lg font-bold text-white leading-relaxed">
                                    {(currentQ as ExamQuestion).question.split('______').map((part, i, arr) => (
                                        <React.Fragment key={i}>
                                            {part}
                                            {i < arr.length - 1 && <span className="inline-block w-16 border-b-2 border-white/30 mx-1"></span>}
                                        </React.Fragment>
                                    ))}
                                </h2>
                             </div>
                             <div className="grid grid-cols-1 gap-3">
                                {(currentQ as ExamQuestion).options.map((opt, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => handleAnswer(idx === (currentQ as ExamQuestion).correctAnswer, currentQ.id)}
                                        disabled={answerStatus !== 'IDLE'}
                                        className="p-4 bg-slate-800/50 hover:bg-slate-700 border border-slate-600 hover:border-cyan-500/50 rounded-xl text-left text-slate-200 font-bold transition-all active:scale-[0.98] flex items-center gap-3"
                                    >
                                        <div className="w-6 h-6 rounded-full border border-slate-500 flex items-center justify-center text-xs text-slate-500 font-mono">{String.fromCharCode(65 + idx)}</div>
                                        {opt}
                                    </button>
                                ))}
                             </div>
                          </>
                      )}

                      {battleMode === 'DICTATION' && 'english' in currentQ && (
                          <div className="flex flex-col items-center">
                               <div className="mb-8 p-6 bg-slate-800 rounded-full cursor-pointer hover:bg-slate-700 transition-colors shadow-lg group" onClick={() => speak((currentQ as Word).english)}>
                                    <Volume2 size={48} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                               </div>
                               <div className="text-slate-500 font-mono text-2xl tracking-[0.5em] mb-8 h-8">
                                   {currentWordMask}
                               </div>
                               <input 
                                    type="text" 
                                    autoFocus
                                    value={userTypedAnswer}
                                    onChange={(e) => setUserTypedAnswer(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleDictationSubmit(currentQ as Word)}
                                    className="w-full bg-slate-800 border-b-2 border-slate-600 focus:border-cyan-500 outline-none text-center text-3xl font-bold text-white py-4 mb-4 bg-transparent placeholder:text-slate-700"
                                    placeholder="Type here..."
                                    autoComplete="off"
                                    disabled={answerStatus !== 'IDLE'}
                               />
                               <div className="text-slate-500 text-sm">{(currentQ as Word).chinese}</div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      );
  };

  const renderArmory = () => (
      <div className="h-full bg-slate-900 p-4 overflow-y-auto pb-24">
          <h2 className="text-2xl font-black text-white italic tracking-tighter mb-2 flex items-center gap-2"><Shield className="text-red-500" /> ARMORY</h2>
          <p className="text-slate-400 text-xs mb-6">Repair your mistakes to upgrade your rank.</p>
          
          {mistakes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 opacity-50">
                  <Shield size={64} className="mb-4" />
                  <p>No damaged equipment found.</p>
              </div>
          ) : (
              <div className="space-y-3">
                  {mistakes.map(m => {
                      const vocab = VOCABULARY_DATA.find(w => w.id === m.targetId);
                      const question = EXAM_DATA.find(q => q.id === m.targetId) || getExamQuestionsByUnit(m.unit).find(q => q.id === m.targetId);
                      const title = vocab ? vocab.english : (question ? 'Grammar Question' : 'Unknown Item');
                      const sub = vocab ? vocab.chinese : (question ? question.question.substring(0, 30) + '...' : '');

                      return (
                          <div key={m.id} className="bg-slate-800 p-4 rounded-xl border border-red-500/20 flex justify-between items-center">
                              <div>
                                  <div className="flex items-center gap-2">
                                      <span className="text-[10px] bg-red-900/30 text-red-400 px-1.5 py-0.5 rounded border border-red-900/50">{m.type}</span>
                                      <h3 className="text-slate-200 font-bold">{title}</h3>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-1">{sub}</p>
                                  <div className="text-[10px] text-slate-600 mt-2">Missed {m.count} times • {new Date(m.timestamp).toLocaleDateString()}</div>
                              </div>
                              <button 
                                onClick={() => m.type === 'EXAM' ? startExamRepair(m.targetId) : startVocabRepair(m.targetId)}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                              >
                                  <Wrench size={14} /> 修复
                              </button>
                          </div>
                      );
                  })}
              </div>
          )}
      </div>
  );

  const renderProfile = () => (
      <div className="h-full overflow-y-auto bg-slate-900 pb-24">
           {/* Header Cover */}
           <div className="h-40 bg-gradient-to-r from-slate-800 to-slate-900 relative">
               <div className="absolute -bottom-12 left-6">
                   <div className="w-24 h-24 rounded-full border-4 border-slate-900 bg-slate-800 overflow-hidden relative group cursor-pointer" onClick={() => setAvatarModalOpen(true)}>
                       <img src={userStats.avatar} alt="User" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 className="text-white" size={20}/></div>
                   </div>
               </div>
           </div>
           
           <div className="mt-14 px-6">
               <div className="flex justify-between items-start mb-6">
                   <div>
                       <h1 className="text-2xl font-black text-white">{userStats.username}</h1>
                       <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mt-1">
                           <span>UID: {Math.abs(userStats.username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)).toString().padStart(8, '0')}</span>
                           <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                           <span>Joined {new Date().getFullYear()}</span>
                       </div>
                   </div>
                   <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-400 transition-colors"><LogOut size={20} /></button>
               </div>

               {/* Stats Grid */}
               <div className="grid grid-cols-3 gap-3 mb-8">
                   <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 text-center">
                       <div className="text-xs text-slate-500 uppercase font-bold mb-1">Matches</div>
                       <div className="text-xl font-black text-white">{userStats.matchesPlayed}</div>
                   </div>
                   <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 text-center">
                       <div className="text-xs text-slate-500 uppercase font-bold mb-1">Win Rate</div>
                       <div className="text-xl font-black text-white">{userStats.matchesPlayed > 0 ? Math.round((battleHistory.filter(h => h.rank === 'S' || h.rank === 'A').length / userStats.matchesPlayed) * 100) : 0}%</div>
                   </div>
                   <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 text-center">
                       <div className="text-xs text-slate-500 uppercase font-bold mb-1">Study Hrs</div>
                       <div className="text-xl font-black text-white">{(userStats.studyMinutes / 60).toFixed(1)}</div>
                   </div>
               </div>
               
               {/* Menu List */}
               <div className="space-y-2">
                   <button onClick={() => setAdminLoginOpen(true)} className="w-full bg-slate-800 p-4 rounded-xl flex items-center justify-between hover:bg-slate-700 transition-colors">
                       <div className="flex items-center gap-3">
                           <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500"><ShoppingBag size={20} /></div>
                           <span className="font-bold text-slate-200">奖励兑换商城</span>
                       </div>
                       <ChevronRight size={18} className="text-slate-500" />
                   </button>
                   <button onClick={() => setHistoryModalOpen(true)} className="w-full bg-slate-800 p-4 rounded-xl flex items-center justify-between hover:bg-slate-700 transition-colors">
                       <div className="flex items-center gap-3">
                           <div className="bg-blue-500/20 p-2 rounded-lg text-blue-500"><History size={20} /></div>
                           <span className="font-bold text-slate-200">历史战绩</span>
                       </div>
                       <ChevronRight size={18} className="text-slate-500" />
                   </button>
                   <button className="w-full bg-slate-800 p-4 rounded-xl flex items-center justify-between hover:bg-slate-700 transition-colors opacity-50 cursor-not-allowed">
                       <div className="flex items-center gap-3">
                           <div className="bg-purple-500/20 p-2 rounded-lg text-purple-500"><Award size={20} /></div>
                           <span className="font-bold text-slate-200">成就 (Coming Soon)</span>
                       </div>
                       <Lock size={16} className="text-slate-500" />
                   </button>
               </div>
           </div>
      </div>
  );

  return (
    <Layout currentView={currentView} onChangeView={setCurrentView}>
      {currentView === AppView.LOGIN && renderLogin()}
      {currentView === AppView.LOBBY && renderLobby()}
      {currentView === AppView.DATABASE && renderDatabase()}
      {currentView === AppView.BATTLE_PREP && renderBattlePrep()}
      {currentView === AppView.BATTLE && renderBattle()}
      {currentView === AppView.ARMORY && renderArmory()}
      {currentView === AppView.PROFILE && renderProfile()}

      {/* Modals */}
      
      {/* 1. Mission Start Modal */}
      {missionModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 w-full max-w-sm rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
            <div className="h-32 bg-slate-800 relative flex items-center justify-center">
                 <Sword size={64} className="text-slate-700" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                 <h2 className="absolute bottom-4 left-6 text-2xl font-black text-white italic">{pendingUnitStart}</h2>
            </div>
            <div className="p-6 space-y-3">
               <button onClick={() => startQuiz('VOCAB')} className="w-full py-4 bg-slate-800 hover:bg-cyan-900/30 border border-slate-600 hover:border-cyan-500/50 rounded-xl flex items-center gap-4 px-4 transition-all group">
                   <div className="bg-cyan-500/20 p-2 rounded-lg text-cyan-400"><Book size={20}/></div>
                   <div className="text-left flex-1">
                       <div className="font-bold text-slate-200 group-hover:text-cyan-400">词汇特训</div>
                       <div className="text-[10px] text-slate-500">Vocabulary Training • 30 Qs</div>
                   </div>
                   <ChevronRight className="text-slate-600" />
               </button>
               <button onClick={() => startQuiz('EXAM')} className="w-full py-4 bg-slate-800 hover:bg-purple-900/30 border border-slate-600 hover:border-purple-500/50 rounded-xl flex items-center gap-4 px-4 transition-all group">
                   <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400"><LayoutGrid size={20}/></div>
                   <div className="text-left flex-1">
                       <div className="font-bold text-slate-200 group-hover:text-purple-400">语法填空</div>
                       <div className="text-[10px] text-slate-500">Grammar & Structure • 8 Qs</div>
                   </div>
                   <ChevronRight className="text-slate-600" />
               </button>
               <button onClick={() => startQuiz('DICTATION')} className="w-full py-4 bg-slate-800 hover:bg-yellow-900/30 border border-slate-600 hover:border-yellow-500/50 rounded-xl flex items-center gap-4 px-4 transition-all group">
                   <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-400"><Headphones size={20}/></div>
                   <div className="text-left flex-1">
                       <div className="font-bold text-slate-200 group-hover:text-yellow-400">听音拼写</div>
                       <div className="text-[10px] text-slate-500">Dictation Mode • 15 Qs</div>
                   </div>
                   <ChevronRight className="text-slate-600" />
               </button>
            </div>
            <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-center">
                <button onClick={() => setMissionModalOpen(false)} className="text-slate-500 text-sm hover:text-white">CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Rank Info Modal */}
      {rankModalOpen && (
          <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur flex items-center justify-center p-6 animate-fade-in" onClick={() => setRankModalOpen(false)}>
              <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Trophy className="text-yellow-500"/> 段位规则</h2>
                  <div className="space-y-2 overflow-y-auto max-h-[60vh] pr-2">
                      {RANK_CONFIG.map((conf, idx) => {
                           const isCurrent = userStats.rankTitle.includes(conf.name);
                           return (
                               <div key={idx} className={`flex items-center p-3 rounded-lg border ${isCurrent ? 'bg-slate-800 border-yellow-500/50' : 'bg-transparent border-slate-800'}`}>
                                   <RankEmblem rankName={conf.name} className="w-10 h-10 mr-4 scale-75" />
                                   <div className="flex-1">
                                       <h4 className={`font-bold text-sm ${conf.iconColor}`}>{conf.name}</h4>
                                       <p className="text-[10px] text-slate-500">{conf.name === Rank.KING ? 'Infinite Stars' : `${conf.starsPerSub * conf.subTiers} Stars to advance`}</p>
                                   </div>
                               </div>
                           )
                      })}
                  </div>
              </div>
          </div>
      )}

      {/* 3. Repair Modal (Exam) */}
      {repairModalOpen && activeRepairQuestion && (
          <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur flex items-center justify-center p-4">
              <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-red-500/30 shadow-2xl overflow-hidden animate-fade-in-up">
                  <div className="bg-red-900/20 p-4 border-b border-red-900/30 flex items-center gap-2">
                      <Wrench className="text-red-400" size={20} />
                      <h3 className="font-bold text-red-100">装备修复 (Varied Practice)</h3>
                  </div>
                  <div className="p-6">
                      <p className="text-slate-300 mb-6 text-lg font-medium">{activeRepairQuestion.question}</p>
                      <div className="grid gap-3">
                          {activeRepairQuestion.options.map((opt, i) => (
                              <button key={i} onClick={() => handleRepairAnswer(i === activeRepairQuestion?.correctAnswer)} className="p-4 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl text-left text-slate-200 transition-colors">
                                  {opt}
                              </button>
                          ))}
                      </div>
                  </div>
                  <div className="p-4 bg-slate-950 flex justify-center">
                      <button onClick={() => setRepairModalOpen(false)} className="text-slate-500 text-sm">GIVE UP</button>
                  </div>
              </div>
          </div>
      )}

      {/* 4. Vocab Repair Modal */}
      {vocabRepairModalOpen && activeRepairVocab && (
          <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur flex items-center justify-center p-4">
              <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-blue-500/30 shadow-2xl overflow-hidden animate-fade-in-up">
                  <div className="bg-blue-900/20 p-4 border-b border-blue-900/30 flex items-center gap-2">
                      <Wrench className="text-blue-400" size={20} />
                      <h3 className="font-bold text-blue-100">词汇修复 (Spelling)</h3>
                  </div>
                  <div className="p-6 flex flex-col items-center">
                      <div className="text-slate-400 mb-2">{activeRepairVocab.chinese}</div>
                      <div className="text-slate-500 text-sm mb-6">{activeRepairVocab.partOfSpeech}</div>
                      
                      <input 
                          autoFocus
                          value={userTypedAnswer}
                          onChange={(e) => setUserTypedAnswer(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleVocabRepairSubmit()}
                          className="w-full bg-slate-800 border-b-2 border-slate-600 focus:border-blue-500 outline-none text-center text-2xl font-bold text-white py-3 mb-6"
                          placeholder="Type English..."
                      />
                      
                      <button onClick={handleVocabRepairSubmit} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl">CHECK</button>
                  </div>
                  <div className="p-4 bg-slate-950 flex justify-center">
                      <button onClick={() => setVocabRepairModalOpen(false)} className="text-slate-500 text-sm">CANCEL</button>
                  </div>
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
                  <h2 className="text-white font-bold">Battle History</h2>
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
                              <div className="text-[10px] text-slate-500">Score</div>
                          </div>
                      </div>
                  ))}
                  {battleHistory.length === 0 && <div className="text-center text-slate-500 mt-10">No records yet. Go fight!</div>}
              </div>
          </div>
      )}

      {/* 8. Avatar Selection Modal */}
      {avatarModalOpen && (
          <div className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center p-4">
              <div className="bg-slate-900 w-full max-w-sm rounded-2xl border border-slate-700 p-6">
                  <h3 className="text-white font-bold mb-6 text-center">Select Avatar</h3>
                  <div className="grid grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto p-2 scrollbar-hide">
                      {HERO_AVATARS.map((hero) => (
                          <button key={hero.name} onClick={() => handleAvatarSelect(hero.name)} className="flex flex-col items-center gap-1 group">
                              <img 
                                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${hero.name}`} 
                                className={`w-12 h-12 rounded-full border-2 bg-slate-800 transition-all ${userStats.avatar.includes(hero.name) ? 'border-cyan-400 scale-110' : 'border-slate-700 group-hover:border-slate-500'}`} 
                                alt={hero.label}
                              />
                              <span className="text-[10px] text-slate-500">{hero.label}</span>
                          </button>
                      ))}
                  </div>
                  <button onClick={() => setAvatarModalOpen(false)} className="w-full mt-6 py-3 bg-slate-800 text-white font-bold rounded-xl border border-slate-700">Close</button>
              </div>
          </div>
      )}

      {/* 9. Confirm Modal */}
      {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
              <div className="bg-slate-900 w-full max-w-xs rounded-2xl border border-slate-600 shadow-2xl p-6 text-center">
                  <h3 className="text-lg font-bold text-white mb-2">{confirmModal.title}</h3>
                  <p className="text-sm text-slate-400 mb-6">{confirmModal.message}</p>
                  <div className="flex gap-3">
                      <button onClick={() => setConfirmModal(prev => ({...prev, isOpen: false}))} className="flex-1 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 font-bold text-sm">取消</button>
                      <button onClick={confirmModal.onConfirm} className="flex-1 py-2.5 bg-cyan-600 rounded-lg text-white font-bold text-sm hover:bg-cyan-500">确定</button>
                  </div>
              </div>
          </div>
      )}

      {/* Floating Reward Animation */}
      {floatingReward && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] pointer-events-none animate-float-up">
              <div className="bg-yellow-500 text-black font-black px-4 py-2 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.6)] flex items-center gap-2 text-sm border-2 border-yellow-200">
                  <Gift size={16}/> {floatingReward.text}
              </div>
          </div>
      )}
    </Layout>
  );
};

export default App;