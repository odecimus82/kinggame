import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Play, RotateCcw, Volume2, Trophy, Flame, ChevronRight, XCircle, CheckCircle, Lock, Star, ChevronLeft, Shield, Sword, Book, User, Mic, ChevronDown, Eye, EyeOff, Clock, Calendar, Zap, Target, TrendingUp, Map, Layers, LayoutGrid, X, AlertTriangle, GraduationCap, RefreshCw, Wand2, Headphones, Keyboard, Award, ChevronUp, ShoppingBag, Plus, Trash2, Gift, History, Settings, LogOut, ArrowRight, Crown, Quote, CalendarCheck } from 'lucide-react';
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

// --- Rank System Logic (Honor of Kings Style) ---
// UPDATED: 1 Star = 5000 EXP.
const EXP_PER_STAR = 5000;

const RANK_CONFIG = [
    // Bronze: 3 sub-tiers * 3 stars = 9 stars. Max Exp before Silver = 9 * 5000 = 45000
    { name: Rank.BRONZE,  starsPerSub: 3, subTiers: 3, baseExp: 0, color: 'from-emerald-700 to-emerald-900', iconColor: 'text-emerald-400' },
    // Silver: 3 sub-tiers * 3 stars = 9 stars. Starts at 45000. Max before Gold = 45000 + 45000 = 90000
    { name: Rank.SILVER,  starsPerSub: 3, subTiers: 3, baseExp: 45000, color: 'from-slate-500 to-slate-700', iconColor: 'text-blue-200' },
    // Gold: 4 sub-tiers * 4 stars = 16 stars. Starts at 90000. Max before Plat = 90000 + (16*5000) = 170000
    { name: Rank.GOLD,    starsPerSub: 4, subTiers: 4, baseExp: 90000, color: 'from-yellow-600 to-yellow-800', iconColor: 'text-yellow-400' },
    // Platinum: 4 sub-tiers * 4 stars = 16 stars. Starts at 170000. Max before Diamond = 170000 + 80000 = 250000
    { name: Rank.PLATINUM, starsPerSub: 4, subTiers: 4, baseExp: 170000, color: 'from-cyan-600 to-cyan-800', iconColor: 'text-cyan-300' },
    // Diamond: 5 sub-tiers * 5 stars = 25 stars. Starts at 250000. Max before Star = 250000 + 125000 = 375000
    { name: Rank.DIAMOND, starsPerSub: 5, subTiers: 5, baseExp: 250000, color: 'from-purple-600 to-purple-900', iconColor: 'text-purple-300' },
    // Star: 5 sub-tiers * 5 stars = 25 stars. Starts at 375000. Max before King = 375000 + 125000 = 500000
    { name: Rank.STAR,    starsPerSub: 5, subTiers: 5, baseExp: 375000, color: 'from-orange-600 to-red-800', iconColor: 'text-orange-400' },
    // King: Starts at 500000.
    { name: Rank.KING,    starsPerSub: 9999, subTiers: 1, baseExp: 500000, color: 'from-yellow-500 via-red-500 to-purple-600', iconColor: 'text-yellow-200' }
];

const getRankInfo = (exp: number) => {
    // 1 Star = 5000 EXP
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

    // Calculate Sub-tier (e.g., Gold IV, III, II, I)
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
        nextExp: (totalStars + 1) * EXP_PER_STAR, // EXP needed for next star
        needed: ((totalStars + 1) * EXP_PER_STAR) - exp,
        currentStars: starsInCurrentSub,
        maxStars: currentConfig.starsPerSub,
        config: currentConfig,
        currentStarExp: currentStarExp
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

// --- Helper Components ---

const RankEmblem: React.FC<{ rankName: string, className?: string }> = ({ rankName, className }) => {
    // Composite component to simulate a game badge
    const isKing = rankName === Rank.KING;
    const isStar = rankName === Rank.STAR;
    const isDiamond = rankName === Rank.DIAMOND;
    const isPlat = rankName === Rank.PLATINUM;
    const isGold = rankName === Rank.GOLD;
    const isSilver = rankName === Rank.SILVER;
    const isBronze = rankName === Rank.BRONZE;

    return (
        <div className={`relative flex items-center justify-center w-16 h-16 ${className}`}>
             {/* Base Shape */}
             <div className="absolute inset-0 flex items-center justify-center opacity-80">
                 <Shield size={60} className={`fill-slate-900 ${isKing ? 'text-red-500' : isStar ? 'text-orange-500' : isDiamond ? 'text-purple-500' : isPlat ? 'text-cyan-500' : isGold ? 'text-yellow-500' : isSilver ? 'text-blue-300' : 'text-emerald-600'}`} strokeWidth={1} />
             </div>
             
             {/* Middle Layer */}
             <div className="absolute inset-0 flex items-center justify-center">
                 {isKing ? <Crown size={32} className="text-yellow-300 fill-yellow-500/50 mb-1 drop-shadow-lg" /> : 
                  isStar ? <Star size={32} className="text-orange-200 fill-orange-500/50" /> :
                  <Sword size={32} className={`${isDiamond ? 'text-purple-200' : isPlat ? 'text-cyan-200' : isGold ? 'text-yellow-200' : 'text-slate-300'} drop-shadow-md`} />}
             </div>

             {/* Accents */}
             {(isKing || isStar || isDiamond) && (
                 <div className="absolute top-1 w-full flex justify-center">
                     <div className="w-10 h-0.5 bg-white/50 rounded-full blur-[1px]"></div>
                 </div>
             )}
             
             {/* Bottom Ribbon visual via icon */}
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
          
          {/* Left Side: Info */}
          <div className="flex-1 z-10">
              <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold bg-white/10 px-1.5 py-0.5 rounded text-white/80 tracking-wider">SEASON RANK</span>
              </div>
              
              <h1 className={`text-xl font-black italic tracking-wide ${config.iconColor} drop-shadow-md flex items-center gap-2`}>
                  {displayTitle} <span className="text-sm font-bold text-white not-italic">{subRank}</span>
              </h1>

              {/* Stars Row */}
              <div className="flex items-center gap-0.5 mt-1">
                  {displayTitle !== Rank.KING && Array.from({length: maxStars}).map((_, i) => (
                      <Star key={i} size={12} className={`${i < currentStars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600 fill-slate-800'}`} />
                  ))}
                  {displayTitle === Rank.KING && <div className="text-yellow-400 font-bold flex items-center gap-1 text-xs"><Star size={12} fill="currentColor"/> x {currentStars}</div>}
              </div>
              
              {/* Exp Progress Text - To clarify it doesn't take 10000 exp for one star */}
              <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500" style={{ width: `${(currentStarExp / EXP_PER_STAR) * 100}%` }}></div>
                  </div>
                  <span>{currentStarExp}/{EXP_PER_STAR} EXP</span>
              </div>
          </div>

          {/* Right Side: Emblem */}
          <div className="relative z-10">
              <RankEmblem rankName={displayTitle} className="drop-shadow-xl" />
          </div>

          {/* Background Glow */}
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

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

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
        <button onClick={(e) => { e.stopPropagation(); playAudio(word.english); }} className="p-2 bg-slate-700/50 rounded-full text-cyan-400 hover:bg-slate-600 hover:text-cyan-300 transition-colors ml-2 flex-shrink-0">
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
    level: 1, exp: 0, gold: 100, rankTitle: Rank.BRONZE, matchesPlayed: 0, correctCount: 0, loginStreak: 1, studyMinutes: 0, unlockedAchievements: [], inventory: [], redemptionHistory: []
  });
  const [mistakes, setMistakes] = useState<WrongAnswer[]>([]);
  const [battleHistory, setBattleHistory] = useState<BattleRecord[]>([]);
  
  // Login State
  const [loginInput, setLoginInput] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false); // New flag to prevent overwrite

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
  // New state to hold shuffled options for current question, preventing re-render shuffle loop
  const [currentVocabOptions, setCurrentVocabOptions] = useState<Word[]>([]);
  
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
  
  // Global Confirm Modal State (Replaces window.confirm)
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({
      isOpen: false, title: '', message: '', onConfirm: () => {}
  });
  
  const [isAdminMode, setIsAdminMode] = useState(false); 
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null);
  const [shopItems, setShopItems] = useState<ShopItem[]>(DEFAULT_SHOP_ITEMS);
  const [newShopItem, setNewShopItem] = useState({ name: '', price: 100, icon: '🎁' });
  
  // Daily Quote State
  const [currentQuote, setCurrentQuote] = useState(DAILY_QUOTES[0]);

  // --- Persistence & Stats Logic ---
  
  const saveProgress = (stats: UserStats, history: BattleRecord[], mistakesList: WrongAnswer[], mastered: Set<string>) => {
      // CRITICAL FIX: Only save if we are not Guest and Data IS LOADED
      if (stats.username === 'Guest') return;
      
      const data = {
          stats,
          history,
          mistakes: mistakesList,
          mastered: Array.from(mastered)
      };
      localStorage.setItem(`kg_user_${stats.username}`, JSON.stringify(data));
      // console.log("Saved progress for", stats.username);
  };

  useEffect(() => {
      // CRITICAL FIX: Add isDataLoaded check
      if (currentView !== AppView.LOGIN && isDataLoaded) {
        saveProgress(userStats, battleHistory, mistakes, masteredWords);
      }
  }, [userStats, battleHistory, mistakes, masteredWords, currentView, isDataLoaded]);

  // Update Daily Quote
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
            setUserStats(parsed.stats);
            setBattleHistory(parsed.history);
            setMistakes(parsed.mistakes);
            setMasteredWords(new Set(parsed.mastered));
            alert(`欢迎回来，${username}！档案读取成功。`);
          } catch (e) {
            console.error("Save file corrupted", e);
            setUserStats(prev => ({ ...prev, username }));
          }
      } else {
          setUserStats(prev => ({ ...prev, username }));
          alert(`新兵报到！欢迎加入知识荣耀，${username}。`);
      }
      setIsDataLoaded(true); // CRITICAL FIX: Mark data as loaded to enable saving
      setCurrentView(AppView.LOBBY);
  };

  // Check-In Function
  const handleCheckIn = () => {
      const today = new Date().toISOString().split('T')[0];
      if (userStats.lastSignInDate !== today) {
          setUserStats(prev => ({
              ...prev,
              lastSignInDate: today,
              gold: prev.gold + 50,
              exp: prev.exp + 20,
              loginStreak: prev.loginStreak + 1
          }));
          setConfirmModal({
              isOpen: true,
              title: '签到成功',
              message: '今日签到完成！获得 50 金币和 20 经验值。',
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
    if (title !== userStats.rankTitle) {
        setUserStats(prev => ({...prev, rankTitle: title}));
    }
    
    ACHIEVEMENTS.forEach(ach => {
        if (!userStats.unlockedAchievements.includes(ach.id) && ach.condition(userStats)) {
            setUserStats(prev => ({...prev, unlockedAchievements: [...prev.unlockedAchievements, ach.id]}));
        }
    });
  }, [userStats.exp, userStats.matchesPlayed, userStats.studyMinutes, userStats.gold]);

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
             const u = new SpeechSynthesisUtterance(word.english);
             u.lang = 'en-US';
             window.speechSynthesis.speak(u);
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

  // NEW Helper to safely generate options
  const generateVocabOptions = (targetWord: Word) => {
     if (!targetWord) return;
     const otherWords = VOCABULARY_DATA.filter(w => w.id !== targetWord.id);
     // If not enough words, just take what we have
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

    if (mode === 'VOCAB') {
        const words = getWordsByUnit(unit);
        if (words.length === 0) { alert("该单元暂无词汇数据"); return; }
        questions = [...words].sort(() => 0.5 - Math.random());
        // Generate options for the FIRST question immediately to avoid null state in render
        if (questions.length > 0) {
            generateVocabOptions(questions[0] as Word);
        }
    } else if (mode === 'DICTATION') {
        const words = getWordsByUnit(unit);
        if (words.length === 0) { alert("该单元暂无词汇数据"); return; }
        questions = [...words].sort(() => 0.5 - Math.random()).slice(0, 10);
    } else {
        const exams = getExamQuestionsByUnit(unit);
        if (exams.length === 0) {
             questions = [];
             if (mode === 'EXAM') {
                 questions = [{
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
            questions = [...exams].sort(() => 0.5 - Math.random()).slice(0, 5);
        }
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

  // --- Unified Confirm Modal Handler ---
  const handleExitBattle = () => {
      setConfirmModal({
          isOpen: true,
          title: '撤退确认',
          message: '正在进行实战训练，现在退出将无法获得任何奖励。确定要撤退吗？',
          onConfirm: () => {
              setConfirmModal(prev => ({ ...prev, isOpen: false }));
              setCurrentView(AppView.BATTLE_PREP);
          }
      });
  };

  const handleAnswer = (correct: boolean, targetId: string) => {
    if (answerStatus !== 'IDLE') return; 
    
    if (correct) {
      setAnswerStatus('CORRECT');
      setQuizScore(prev => prev + 10);
    } else {
      setAnswerStatus('WRONG');
      setMistakes(prev => {
          const existing = prev.find(m => m.targetId === targetId);
          if (existing) return prev.map(m => m.targetId === targetId ? { ...m, count: m.count + 1, timestamp: Date.now() } : m);
          return [...prev, { id: Date.now().toString(), targetId, type: battleMode, unit: selectedUnit, count: 1, timestamp: Date.now(), repairProgress: 0 }];
      });
    }

    setTimeout(nextQuestion, 1500);
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
        
        // Prepare options for the NEXT question if in vocab mode
        if (battleMode === 'VOCAB') {
            generateVocabOptions(quizQuestions[nextIdx] as Word);
        }
      } else {
        finishQuiz(quizScore); 
      }
  };

  const finishQuiz = (finalScore: number) => {
    setQuizFinished(true);
    const maxScore = quizQuestions.length * 10;
    let rank = 'B';
    const percentage = maxScore > 0 ? finalScore / maxScore : 0;
    if (percentage >= 0.9) rank = 'S';
    else if (percentage >= 0.8) rank = 'A';
    else if (percentage < 0.6) rank = 'C';

    const newRecord: BattleRecord = {
        id: Date.now().toString(),
        unit: selectedUnit,
        mode: battleMode,
        score: finalScore,
        maxScore: maxScore,
        timestamp: Date.now(),
        rank: rank
    };
    setBattleHistory(prev => [newRecord, ...prev].slice(0, 20));

    const expGained = finalScore;
    
    // Level Logic: 500 EXP per level
    setUserStats(prev => {
        const newExp = prev.exp + expGained;
        const newLevel = Math.floor(newExp / 500) + 1;
        return {
            ...prev,
            exp: newExp,
            level: newLevel,
            gold: prev.gold + Math.floor(finalScore / 2),
            matchesPlayed: prev.matchesPlayed + 1,
            correctCount: prev.correctCount + (finalScore / 10)
        };
    });
  };
  
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
          alert("变式训练通过！错题已清除。");
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
          alert("拼写特训通过！错题已清除。");
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
      if (userStats.gold >= item.price) {
          setConfirmModal({
              isOpen: true,
              title: '确认兑换',
              message: `确定花费 ${item.price} 金币兑换 "${item.name}" 吗?`,
              onConfirm: () => {
                  const newRecord: RedemptionRecord = {
                      id: Date.now().toString(),
                      itemName: item.name,
                      cost: item.price,
                      timestamp: Date.now()
                  };
                  setUserStats(prev => ({
                      ...prev,
                      gold: prev.gold - item.price,
                      inventory: [...prev.inventory, item.id],
                      redemptionHistory: [newRecord, ...prev.redemptionHistory]
                  }));
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  // Optional: Show success toast instead of alert, but alert is reliable for now
                  alert("兑换成功！已保存至兑换记录。");
              }
          });
      } else {
          alert("金币不足！");
      }
  };

  const addShopItem = () => {
      if (newShopItem.name && newShopItem.price > 0) {
          setShopItems(prev => [...prev, { ...newShopItem, id: `custom_${Date.now()}`, description: '自定义奖励' }]);
          setNewShopItem({ name: '', price: 100, icon: '🎁' });
      }
  };

  const deleteShopItem = (id: string) => {
      setConfirmModal({
          isOpen: true,
          title: '删除商品',
          message: '确定要下架此商品吗？',
          onConfirm: () => {
              setShopItems(prev => prev.filter(item => item.id !== id));
              setConfirmModal(prev => ({ ...prev, isOpen: false }));
          }
      });
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
              setIsDataLoaded(false); // Reset loaded flag
              setConfirmModal(prev => ({ ...prev, isOpen: false }));
          }
      });
  };

  // --- Render Functions ---

  const renderLogin = () => (
      <div className="h-screen w-full flex flex-col items-center justify-center p-6 relative bg-slate-900 overflow-hidden">
          {/* Background effects */}
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

  const renderLobby = () => (
    <div className="p-4 space-y-6 animate-fade-in pb-24 h-full overflow-y-auto">
      <header className="flex justify-between items-center">
        <div><h2 className="text-xl font-bold text-white">Hello, {userStats.username}</h2><p className="text-slate-400 text-xs">广州高中英语</p></div>
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
      
      {/* Daily Quote Section - Separated */}
      <div className="bg-gradient-to-r from-indigo-900/80 to-purple-900/80 p-4 rounded-xl border border-indigo-500/30 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
              <Quote size={60} className="text-white"/>
          </div>
          <div className="flex items-start gap-3 relative z-10">
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm"><Quote size={18} className="text-yellow-400"/></div>
              <div>
                  <p className="text-xs text-indigo-200 italic mb-1.5 leading-relaxed font-serif">"{currentQuote.en}"</p>
                  <p className="text-sm font-bold text-white">{currentQuote.ch}</p>
              </div>
          </div>
      </div>

      {/* Daily Quest Section - Separated */}
      <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/50 shadow-md">
        <div className="flex items-center gap-2 mb-3 border-b border-slate-700 pb-2"><Star size={16} className="text-yellow-400" /><h3 className="text-sm font-bold text-slate-300">每日悬赏 (Daily Quest)</h3></div>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span><span className="text-slate-300">完成 3 场对局</span></div><span className="text-yellow-500 font-mono text-xs">+50 金币</span></div>
          <div className="flex justify-between items-center text-sm"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500"></span><span className="text-slate-300">达成 5 连胜</span></div><span className="text-yellow-500 font-mono text-xs">+100 经验</span></div>
          <div className="flex justify-between items-center text-sm"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span><span className="text-slate-300">达成 15 连胜</span></div><span className="text-yellow-500 font-mono text-xs">+200 经验</span></div>
        </div>
      </div>
    </div>
  );

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
      <div className="text-center space-y-2 mt-4"><Sword size={48} className="text-yellow-400 mx-auto" /><h2 className="text-2xl font-bold text-white">选择作战地图</h2><p className="text-slate-400">选择一个关卡开始挑战</p></div>
      <div className="w-full max-w-sm space-y-6 pb-20">
        {LIBRARY_STRUCTURE.map((category) => (
          <div key={category.id} className="animate-fade-in">
             <div className="flex items-center gap-2 mb-3 text-slate-300 border-b border-slate-800 pb-1"><Layers size={14} className="text-blue-400"/><span className="font-bold text-sm">{category.name}</span></div>
             {category.units.length === 0 ? <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-dashed border-slate-700 text-slate-500 text-xs">即将开放区域...</div> : (
               <div className="space-y-2">{category.units.map((unit, idx) => (<button key={unit} onClick={() => handleUnitClick(unit)} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 p-3 rounded-xl flex justify-between items-center group transition-all"><div className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 font-mono text-[10px] border border-slate-700 group-hover:border-yellow-500 group-hover:text-yellow-500">{idx + 1}</span><span className="font-semibold text-sm">{unit}</span></div><ChevronRight size={16} className="text-slate-500 group-hover:text-white"/></button>))}</div>
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
                      <button onClick={() => startQuiz('VOCAB')} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 p-4 rounded-xl flex items-center justify-between group border border-blue-400/30"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-blue-800/50 flex items-center justify-center"><Zap size={20} className="text-blue-200" /></div><div className="text-left"><div className="font-bold text-white">词汇突袭</div><div className="text-[10px] text-blue-200">Rapid Vocabulary Raid</div></div></div><ChevronRight className="text-blue-200" /></button>
                      <button onClick={() => startQuiz('DICTATION')} className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 p-4 rounded-xl flex items-center justify-between group border border-emerald-400/30"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-emerald-800/50 flex items-center justify-center"><Headphones size={20} className="text-emerald-200" /></div><div className="text-left"><div className="font-bold text-white">通信破译 (听写)</div><div className="text-[10px] text-emerald-200">Signal Decryption Ops</div></div></div><ChevronRight className="text-emerald-200" /></button>
                      <button onClick={() => startQuiz('EXAM')} className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 p-4 rounded-xl flex items-center justify-between group border border-purple-400/30"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-purple-800/50 flex items-center justify-center"><GraduationCap size={20} className="text-purple-200" /></div><div className="text-left"><div className="font-bold text-white">语法特训</div><div className="text-[10px] text-purple-200">Grammar & Exams</div></div></div><ChevronRight className="text-purple-200" /></button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );

  const renderBattle = () => {
    if (quizFinished) return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-full flex items-center justify-center shadow-xl shadow-yellow-900/50 mb-6"><Trophy size={48} className="text-white" /></div>
            <h2 className="text-3xl font-bold text-white mb-2">VICTORY!</h2>
            <p className="text-slate-400 mb-8">{battleMode === 'VOCAB' ? '词汇突袭' : battleMode === 'DICTATION' ? '通信破译' : '语法特训'} 完成</p>
            <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700"><p className="text-xs text-slate-400">总得分</p><p className="text-2xl font-bold text-yellow-400">{quizScore}</p></div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700"><p className="text-xs text-slate-400">正确率</p><p className="text-2xl font-bold text-cyan-400">{Math.round((quizScore / (quizQuestions.length * 10)) * 100)}%</p></div>
            </div>
            <div className="flex gap-4 w-full max-w-xs">
                <button onClick={() => setCurrentView(AppView.LOBBY)} className="flex-1 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800">返回大厅</button>
                <button onClick={() => startQuiz(battleMode)} className="flex-1 py-3 rounded-lg bg-yellow-500 text-black font-bold hover:bg-yellow-400">再战一局</button>
            </div>
        </div>
      );
    if (quizQuestions.length === 0) return <div>Loading...</div>;

    const currentItem = quizQuestions[currentQuestionIndex];
    const isVocab = battleMode === 'VOCAB';
    const isDictation = battleMode === 'DICTATION';
    const showHint = answerStatus === 'WRONG';

    return (
      <div className="h-full bg-slate-900 relative">
        {/* Floating Back Button - Fixed Position & High Z-Index to Guarantee Clickability */}
        <button 
            onClick={handleExitBattle} 
            className="fixed top-4 left-4 z-[100] w-12 h-12 rounded-full bg-slate-800/90 backdrop-blur border border-slate-600 text-slate-400 flex items-center justify-center shadow-2xl active:scale-95 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
        >
            <ChevronLeft size={28} />
        </button>

        {/* Progress Bar Header - Positioned Below/Separate */}
        <div className="absolute top-20 left-0 w-full px-8 z-40">
             <div className="flex justify-between items-center text-[10px] text-slate-500 mb-2 font-mono uppercase tracking-widest">
                 <span className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${isVocab ? 'bg-blue-500' : isDictation ? 'bg-emerald-500' : 'bg-purple-500'}`}></span> MISSION PROGRESS</span>
                 <span className="text-white font-bold">{currentQuestionIndex + 1} <span className="text-slate-600">/</span> {quizQuestions.length}</span>
             </div>
             <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                  <div className={`h-full rounded-full transition-all duration-500 ease-out ${isVocab ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : isDictation ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]'}`} style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}></div>
             </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="h-full overflow-y-auto pt-32 px-6 pb-6">
            <div className="flex-1 flex flex-col items-center justify-center mb-6 w-full min-h-[40vh]">
                <span className="text-slate-500 text-[10px] font-bold tracking-[0.2em] mb-6 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
                    {isVocab ? 'VOCABULARY OPS' : isDictation ? 'SIGNAL DECRYPTION' : 'TACTICAL GRAMMAR'}
                </span>
                
                {isVocab && (
                    <div className="animate-fade-in flex flex-col items-center">
                        <h2 className="text-4xl font-black text-center text-white mb-4 tracking-tight drop-shadow-2xl">{(currentItem as Word).english}</h2>
                        <div className="flex items-center gap-3 text-slate-400 bg-slate-800/80 px-4 py-2 rounded-full text-sm border border-slate-700 shadow-lg cursor-pointer hover:bg-slate-700 hover:text-white transition-colors" onClick={() => { const u = new SpeechSynthesisUtterance((currentItem as Word).english); window.speechSynthesis.speak(u); }}>
                            <span className="font-mono">{(currentItem as Word).phonetic}</span>
                            <Volume2 size={16} />
                        </div>
                    </div>
                )}

                {isDictation && (
                    <div className="w-full flex flex-col items-center justify-center space-y-8 animate-fade-in">
                        <div className="relative">
                            <button onClick={() => { const u = new SpeechSynthesisUtterance((currentItem as Word).english); window.speechSynthesis.speak(u); }} className="w-24 h-24 rounded-full bg-slate-800 border-4 border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)] active:scale-95 transition-all hover:bg-slate-700 mb-6 mx-auto group">
                                <Volume2 size={40} className="text-emerald-400 ml-1 group-hover:scale-110 transition-transform" />
                            </button>
                            <div className="text-center mb-4"><p className="text-3xl font-mono font-bold text-emerald-300 tracking-[0.2em] uppercase drop-shadow-lg">{answerStatus === 'WRONG' || answerStatus === 'CORRECT' ? (currentItem as Word).english : currentWordMask}</p><p className="text-xs text-emerald-500/60 mt-2 font-mono">DECRYPT THE SIGNAL</p></div>
                        </div>
                        <div className="bg-slate-800/50 border border-emerald-500/20 px-6 py-3 rounded-xl text-center w-full"><p className="text-emerald-100 font-bold text-lg">{(currentItem as Word).chinese}</p><p className="text-slate-500 text-xs mt-1">{(currentItem as Word).partOfSpeech}</p></div>
                        <div className="w-full max-w-xs relative">
                            {answerStatus === 'WRONG' ? (<div className="w-full p-4 bg-red-500/10 border border-red-500 rounded-xl text-center animate-pulse"><p className="text-xs text-red-400 mb-1">DECRYPTION FAILED</p><p className="text-xl font-mono font-bold text-white tracking-widest">{(currentItem as Word).english}</p></div>) : answerStatus === 'CORRECT' ? (<div className="w-full p-4 bg-green-500/10 border border-green-500 rounded-xl text-center"><p className="text-xs text-green-400 mb-1">SIGNAL DECRYPTED</p><p className="text-xl font-mono font-bold text-white tracking-widest">{(currentItem as Word).english}</p></div>) : (<input type="text" autoFocus value={userTypedAnswer} onChange={(e) => setUserTypedAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleDictationSubmit(currentItem as Word)} placeholder="Type the full word..." className="w-full bg-slate-800 border-b-2 border-emerald-500/50 text-center text-xl py-3 focus:outline-none focus:border-emerald-400 text-white font-mono tracking-widest rounded-t-lg" autoComplete="off" />)}
                        </div>
                    </div>
                )}

                {!isVocab && !isDictation && (
                    <div className="w-full bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 relative shadow-lg">
                        <p className="text-lg text-slate-100 font-medium leading-relaxed">{(currentItem as ExamQuestion).question}</p>
                        {showHint && (<div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-2 animate-fade-in"><div className="bg-yellow-500/20 p-1 rounded-full"><AlertTriangle size={14} className="text-yellow-400"/></div><div><p className="text-xs font-bold text-yellow-400 mb-0.5">Tactical Hint / 战术提示</p><p className="text-xs text-yellow-200/80">{(currentItem as ExamQuestion).hint}</p></div></div>)}
                    </div>
                )}
            </div>

            <div className="space-y-3 mb-4 w-full">
                {isVocab && (
                    currentVocabOptions.map((opt) => (
                        <button key={opt.id} onClick={() => handleAnswer(opt.id === (currentItem as Word).id, (currentItem as Word).id)} disabled={answerStatus !== 'IDLE'} className={`w-full p-4 rounded-xl text-left border transition-all active:scale-[0.98] ${answerStatus === 'IDLE' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200' : opt.id === (currentItem as Word).id ? 'bg-green-500/20 border-green-500 text-green-100' : 'bg-slate-800 border-slate-700 opacity-50'}`}>
                            <span className="font-bold mr-2 text-sm opacity-50">{opt.partOfSpeech}</span>{opt.chinese}
                            {answerStatus !== 'IDLE' && opt.id === (currentItem as Word).id && <CheckCircle size={20} className="float-right text-green-400" />}
                        </button>
                    ))
                )}

                {isDictation && (answerStatus === 'IDLE' ? (<button onClick={() => handleDictationSubmit(currentItem as Word)} disabled={!userTypedAnswer} className={`w-full py-4 rounded-xl font-bold tracking-widest transition-all ${userTypedAnswer ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>DEPLOY ANSWER</button>) : (<button onClick={nextQuestion} className="w-full py-4 rounded-xl font-bold tracking-widest bg-slate-700 hover:bg-slate-600 text-white animate-pulse">CONTINUE &gt;&gt;</button>))}

                {!isVocab && !isDictation && ((currentItem as ExamQuestion).options.map((optText, idx) => {
                        const q = currentItem as ExamQuestion;
                        const isCorrect = idx === q.correctAnswer;
                        return (
                            <button key={idx} onClick={() => handleAnswer(isCorrect, q.id)} disabled={answerStatus === 'CORRECT'} className={`w-full p-4 rounded-xl text-left border transition-all active:scale-[0.98] flex items-center gap-3 ${answerStatus === 'IDLE' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200' : answerStatus === 'CORRECT' ? (isCorrect ? 'bg-green-500/20 border-green-500 text-green-100' : 'bg-slate-800 border-slate-700 opacity-50') : (showHint ? 'bg-slate-800 border-slate-700 text-slate-200' : '')}`}>
                                <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold ${answerStatus === 'WRONG' && !isCorrect ? 'border-slate-700 bg-slate-900 text-slate-500' : 'border-slate-600 bg-slate-900 text-slate-500'}`}>{String.fromCharCode(65 + idx)}</span><span className="flex-1">{optText}</span>{answerStatus === 'CORRECT' && isCorrect && <CheckCircle size={20} className="text-green-400" />}
                            </button>
                        );
                }))}
            </div>
            <div className="h-20 flex flex-col items-center justify-center">{answerStatus === 'CORRECT' && <span className="text-green-400 font-bold tracking-widest animate-bounce">PERFECT! +10 EXP</span>}{answerStatus === 'WRONG' && <span className="text-red-400 font-bold tracking-widest animate-pulse">装备受损! 已存入军械库</span>}</div>
        </div>
      </div>
    );
  };

  const renderArmory = () => (
    <div className="p-4 h-full overflow-y-auto pb-24">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="text-red-400" size={24} />
        <h2 className="text-xl font-bold text-white">军械库 (错题集)</h2>
      </div>
      {mistakes.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-slate-500 space-y-2">
          <CheckCircle size={40} className="opacity-50" />
          <p>暂无错题记录，继续保持！</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mistakes.map((m) => {
            let content = '';
            let title = '';
            if (m.type === 'VOCAB' || m.type === 'DICTATION') {
              const w = VOCABULARY_DATA.find((w) => w.id === m.targetId);
              title = w ? w.english : 'Unknown Word';
              content = w ? w.chinese : '';
            } else {
              const q = EXAM_DATA.find((q) => q.id === m.targetId) || getExamQuestionsByUnit(m.unit).find((eq) => eq.id === m.targetId);
              title = '语法错题';
              content = q ? q.question : 'Unknown Question';
            }

            return (
              <div key={m.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center animate-fade-in">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-red-400 bg-red-900/30 px-1.5 py-0.5 rounded border border-red-900/50">{m.type}</span>
                    <span className="text-[10px] text-slate-500">{new Date(m.timestamp).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-white text-lg">{title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-1">{content}</p>
                </div>
                <button 
                  onClick={() => (m.type === 'EXAM' ? startExamRepair(m.targetId) : startVocabRepair(m.targetId))} 
                  className="bg-slate-700 hover:bg-slate-600 text-cyan-400 p-3 rounded-xl ml-3 shadow-lg transition-colors"
                >
                  <Wand2 size={20} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="p-4 h-full overflow-y-auto pb-24 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-2xl shadow-lg border border-slate-500/30">
            👤
            </div>
            <div>
            <h2 className="text-2xl font-bold text-white">{userStats.username}</h2>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">Level {userStats.level}</span>
                <span className="text-xs text-slate-500">UID: {Date.now().toString().slice(-6)}</span>
            </div>
            </div>
        </div>
        <button onClick={handleLogout} className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors">
            <LogOut size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-center shadow-sm">
          <p className="text-xs text-slate-500 mb-1">学习时长</p>
          <p className="text-xl font-black text-white">
            {userStats.studyMinutes} <span className="text-xs font-normal text-slate-400">min</span>
          </p>
        </div>
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-center shadow-sm">
          <p className="text-xs text-slate-500 mb-1">对战局数</p>
          <p className="text-xl font-black text-white">{userStats.matchesPlayed}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-center shadow-sm">
          <p className="text-xs text-slate-500 mb-1">金币</p>
          <p className="text-xl font-black text-yellow-400 flex justify-center gap-1">
             {userStats.gold}
          </p>
        </div>
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-center shadow-sm">
          <p className="text-xs text-slate-500 mb-1">当前段位</p>
          <p className="text-sm font-black text-cyan-400 truncate px-1">{userStats.rankTitle}</p>
        </div>
      </div>

      <div className="space-y-3">
        <button onClick={() => setHistoryModalOpen(true)} className="w-full bg-slate-800 p-4 rounded-xl flex justify-between items-center text-slate-300 border border-slate-700 hover:bg-slate-750 transition-colors">
          <div className="flex items-center gap-3">
            <div className="bg-slate-700 p-2 rounded-lg"><History size={18}/></div>
            <span className="font-bold text-sm">对战历史</span>
          </div>
          <ChevronRight size={16} />
        </button>
        
        <button onClick={() => setShopAdminOpen(true)} className="w-full bg-slate-800 p-4 rounded-xl flex justify-between items-center text-yellow-500 border border-slate-700 hover:bg-slate-750 transition-colors">
           <div className="flex items-center gap-3">
             <div className="bg-yellow-500/10 p-2 rounded-lg"><ShoppingBag size={18}/></div>
             <span className="font-bold text-sm">积分商城 (兑换)</span>
           </div>
           <ChevronRight size={16} />
        </button>

        <button onClick={handleLogout} className="w-full bg-slate-800 p-4 rounded-xl flex justify-between items-center text-red-400 border border-slate-700 hover:bg-slate-750 transition-colors mt-6">
           <div className="flex items-center gap-3">
             <div className="bg-red-500/10 p-2 rounded-lg"><LogOut size={18}/></div>
             <span className="font-bold text-sm">退出登录</span>
           </div>
        </button>
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

      {/* Global Confirmation Modal (Replaces window.confirm) */}
      {confirmModal.isOpen && (
         <div className="absolute inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6 animate-fade-in" onClick={() => setConfirmModal(prev => ({...prev, isOpen: false}))}>
            <div className="bg-slate-800 w-full max-w-xs p-6 rounded-2xl border border-slate-700 shadow-2xl relative" onClick={e => e.stopPropagation()}>
               <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><AlertTriangle className="text-yellow-500"/> {confirmModal.title}</h3>
               <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  {confirmModal.message}
               </p>
               <div className="flex gap-3">
                  <button onClick={() => setConfirmModal(prev => ({...prev, isOpen: false}))} className="flex-1 py-3 rounded-xl bg-slate-700 text-slate-300 font-bold text-sm hover:bg-slate-600 transition-all">
                     取消
                  </button>
                  <button onClick={confirmModal.onConfirm} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm shadow-lg shadow-blue-900/30 transition-all">
                     确认
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Rank Detail Modal */}
      {rankModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-6 animate-fade-in" onClick={() => setRankModalOpen(false)}>
           <div className="w-full max-w-sm" onClick={e => e.stopPropagation()}>
             <RankDisplay stats={userStats} />
             <div className="mt-6 bg-slate-800/90 border border-slate-700 p-5 rounded-2xl">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2"><Trophy size={16} className="text-yellow-500"/> 排位规则</h4>
                <p className="text-xs text-slate-400 leading-relaxed space-y-2">
                   • 每次对战胜利获得经验值 (EXP)。<br/>
                   • {EXP_PER_STAR} EXP = 1 颗星。<br/>
                   • 积累星星提升段位，从倔强青铜到最强王者。<br/>
                   • 连胜可获得额外 EXP 加成。
                </p>
             </div>
           </div>
        </div>
      )}

      {/* History Modal */}
      {historyModalOpen && (
        <div className="absolute inset-0 z-50 bg-slate-900 overflow-y-auto animate-slide-up">
           <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-4 flex items-center gap-3 z-10">
              <button onClick={() => setHistoryModalOpen(false)} className="p-2 rounded-full hover:bg-slate-800 text-white"><ChevronLeft size={24}/></button>
              <h2 className="text-lg font-bold text-white">历史战绩</h2>
           </div>
           <div className="p-4 space-y-3 pb-20">
              {battleHistory.length === 0 ? <div className="text-center text-slate-500 mt-20">暂无对战记录</div> : battleHistory.map(record => (
                  <div key={record.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-bold text-sm">{record.unit}</span>
                            <span className="text-[10px] bg-slate-700 px-1.5 rounded text-slate-400">{record.mode}</span>
                        </div>
                        <div className="text-xs text-slate-500">{new Date(record.timestamp).toLocaleString()}</div>
                     </div>
                     <div className="flex flex-col items-end">
                        <span className={`text-xl font-black italic ${record.rank === 'S' ? 'text-yellow-400' : record.rank === 'A' ? 'text-cyan-400' : 'text-slate-400'}`}>{record.rank}</span>
                        <span className="text-xs text-slate-400">{record.score} pts</span>
                     </div>
                  </div>
              ))}
           </div>
        </div>
      )}

      {/* Admin Auth Modal */}
      {adminLoginOpen && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-fade-in">
           <div className="bg-slate-800 w-full max-w-xs p-6 rounded-2xl border border-slate-700 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4 text-center">管理员验证</h3>
              <input type="password" value={adminPasswordInput} onChange={e => setAdminPasswordInput(e.target.value)} placeholder="请输入管理员密码" className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white mb-4 outline-none focus:border-cyan-500"/>
              <div className="flex gap-3">
                 <button onClick={() => setAdminLoginOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-700 text-slate-300 font-bold text-sm">取消</button>
                 <button onClick={handleAdminLoginSubmit} className="flex-1 py-2.5 rounded-xl bg-cyan-600 text-white font-bold text-sm shadow-lg shadow-cyan-900/30">验证</button>
              </div>
           </div>
        </div>
      )}

      {/* Shop Admin & User View Modal */}
      {shopAdminOpen && (
         <div className="absolute inset-0 z-50 bg-slate-900 overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-4 flex items-center justify-between z-10">
               <div className="flex items-center gap-3">
                  <button onClick={() => setShopAdminOpen(false)} className="p-2 rounded-full hover:bg-slate-800 text-white"><ChevronLeft size={24}/></button>
                  <h2 className="text-lg font-bold text-white">积分商城</h2>
               </div>
               <div className="flex items-center gap-3">
                   <div className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700 text-yellow-400 font-bold text-sm">
                      🪙 {userStats.gold}
                   </div>
                   {!isAdminMode && (
                       <button onClick={() => setAdminLoginOpen(true)} className="p-2 rounded-full text-slate-500 hover:text-white transition-colors">
                           <Settings size={18} />
                       </button>
                   )}
               </div>
            </div>
            
            <div className="p-4 space-y-6 pb-20">
               {/* Add Item Section (Admin Only) */}
               {isAdminMode && (
                   <div className="bg-slate-800/50 p-4 rounded-xl border border-dashed border-slate-700">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Admin: Add Reward</h4>
                      <div className="flex gap-2 mb-2">
                         <input value={newShopItem.name} onChange={e => setNewShopItem({...newShopItem, name: e.target.value})} placeholder="奖励名称" className="flex-[2] bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"/>
                         <input type="number" value={newShopItem.price} onChange={e => setNewShopItem({...newShopItem, price: parseInt(e.target.value) || 0})} placeholder="价格" className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"/>
                      </div>
                      <button onClick={addShopItem} className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"><Plus size={14}/> 上架奖励</button>
                   </div>
               )}

               {/* Shop Items Grid */}
               <div className="grid grid-cols-2 gap-3">
                  {shopItems.map(item => (
                     <div key={item.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 relative group overflow-hidden">
                        {isAdminMode && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => deleteShopItem(item.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16}/></button>
                            </div>
                        )}
                        <div className="flex flex-col items-center text-center mb-3">
                           <div className="text-4xl mb-2">{item.icon}</div>
                           <h4 className="font-bold text-white text-sm line-clamp-1">{item.name}</h4>
                           <p className="text-[10px] text-slate-400 line-clamp-1">{item.description}</p>
                        </div>
                        <button onClick={() => buyItem(item)} className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-slate-900 font-bold py-2 rounded-lg text-xs shadow-lg shadow-yellow-900/20 active:scale-95 transition-all">
                           {item.price} G 兑换
                        </button>
                     </div>
                  ))}
               </div>

               {/* Redemption History */}
               <div className="mt-8">
                  <h3 className="text-sm font-bold text-slate-300 mb-3 ml-1">最近兑换记录</h3>
                  <div className="space-y-2">
                     {userStats.redemptionHistory.length === 0 ? <p className="text-xs text-slate-600 italic ml-1">暂无记录</p> : userStats.redemptionHistory.slice(0, 5).map(r => (
                        <div key={r.id} className="flex justify-between items-center text-xs text-slate-400 bg-slate-800/30 p-2 rounded-lg">
                           <span>{r.itemName}</span>
                           <span>-{r.cost} G</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Repair Question Modal */}
      {repairModalOpen && activeRepairQuestion && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-800 w-full max-w-sm rounded-2xl p-6 border border-slate-700 shadow-2xl">
               <div className="flex items-center gap-2 mb-4">
                  <Wand2 size={20} className="text-cyan-400"/>
                  <h3 className="text-lg font-bold text-white">错题变式训练</h3>
               </div>
               <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 mb-6">
                  <p className="text-slate-200 text-sm leading-relaxed font-medium">{activeRepairQuestion.question}</p>
               </div>
               <div className="space-y-2.5">
                  {activeRepairQuestion.options.map((opt, idx) => (
                     <button key={idx} onClick={() => handleRepairAnswer(idx === activeRepairQuestion.correctAnswer)} className="w-full p-3.5 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 rounded-xl text-left text-slate-200 text-sm transition-colors flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full border border-slate-500 flex items-center justify-center text-[10px] text-slate-400">{String.fromCharCode(65 + idx)}</span>
                        {opt}
                     </button>
                  ))}
               </div>
               <button onClick={() => setRepairModalOpen(false)} className="mt-6 w-full py-3 text-slate-500 text-sm font-medium hover:text-slate-300 transition-colors">暂时放弃</button>
            </div>
         </div>
      )}

      {/* Vocab Repair Modal */}
      {vocabRepairModalOpen && activeRepairVocab && (
         <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-6 animate-fade-in">
             <div className="w-full max-w-xs text-center">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(6,182,212,0.3)] border border-cyan-500/30">
                   <Keyboard size={32} className="text-cyan-400"/>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">拼写特训</h3>
                <p className="text-slate-400 text-xs mb-8">Correct the spelling mistake</p>
                
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-6">
                   <p className="text-xl font-bold text-cyan-400 mb-2">{activeRepairVocab.chinese}</p>
                   <p className="text-slate-500 text-xs font-mono">{activeRepairVocab.partOfSpeech}</p>
                </div>

                <input autoFocus value={userTypedAnswer} onChange={e => setUserTypedAnswer(e.target.value)} placeholder="Type word here..." className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-4 text-center text-white text-lg font-bold outline-none focus:border-cyan-500 transition-colors mb-4 placeholder:font-normal placeholder:text-slate-700"/>
                
                <button onClick={handleVocabRepairSubmit} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-900/40 active:scale-95 transition-all">
                   VERIFY
                </button>
                <button onClick={() => setVocabRepairModalOpen(false)} className="mt-4 text-slate-500 text-sm hover:text-slate-300">Close</button>
             </div>
         </div>
      )}

    </Layout>
  );
};

export default App;