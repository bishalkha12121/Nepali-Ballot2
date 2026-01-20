import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import { Gamepad2, Brain, Swords, Trophy, Star, Zap, RotateCcw, CheckCircle, XCircle, Clock, Sparkles, Crown, Target, TrendingUp, Users, ChevronRight, Volume2, VolumeX } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Sound effects (Web Audio API)
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'correct') { osc.frequency.value = 800; gain.gain.value = 0.1; }
    else if (type === 'wrong') { osc.frequency.value = 200; gain.gain.value = 0.1; }
    else if (type === 'win') { osc.frequency.value = 1000; gain.gain.value = 0.15; }
    else { osc.frequency.value = 400; gain.gain.value = 0.05; }
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch(e) {}
};

// Ticker
const LiveTicker = () => (
  <div className="bg-gradient-to-r from-[#D90429] via-[#003049] to-[#D90429] py-3 overflow-hidden">
    <motion.div className="flex whitespace-nowrap" animate={{ x: [0, -2000] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}>
      {[...Array(4)].map((_, i) => <span key={i} className="mx-8 text-white font-bebas tracking-wider text-sm">🎮 PLAY & WIN • NEPAL POLITICS QUIZ • CANDIDATE BATTLE • ELECTION PREDICTOR • EARN POINTS • <span className="text-[#F77F00]">★</span></span>)}
    </motion.div>
  </div>
);

// Footer
const Footer = () => (
  <footer className="bg-black py-12">
    <div className="max-w-6xl mx-auto px-4 text-center">
      <motion.div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D90429]/20 to-[#48CAE4]/20 px-4 py-2 rounded-full border border-white/10 mb-4" animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 2, repeat: Infinity }}>
        <Sparkles className="text-[#F77F00]" size={16} /><span className="text-white font-bebas tracking-wider text-sm">BUILT BY TWO GEN Zs 🔥</span><Zap className="text-[#48CAE4]" size={16} />
      </motion.div>
      <p className="text-gray-500 text-sm">© 2026 Nepali Ballot • Entertainment Only 🇳🇵</p>
    </div>
  </footer>
);

// Ad Banner
const AdBanner = ({ size = "300x250" }) => (
  <div className="bg-white/5 border border-white/10 flex items-center justify-center rounded-lg" style={{ height: size === "300x250" ? "250px" : "90px", width: "100%" }}>
    <div className="text-center"><p className="text-gray-600 text-xs">ADVERTISEMENT</p><p className="text-gray-500 font-bebas">{size}</p></div>
  </div>
);

// ==================== QUIZ GAME ====================
const QuizGame = ({ onBack, onScore, soundOn }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/games/quiz-questions`).then(res => { setQuestions(res.data); setLoading(false); }).catch(() => toast.error("Failed to load quiz"));
  }, []);

  useEffect(() => {
    if (loading || gameOver || showResult || questions.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { handleAnswer(-1); return 20; } return t - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentQ, gameOver, showResult, loading, questions.length]);

  const handleAnswer = (idx) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    const isCorrect = idx === questions[currentQ]?.correct;
    
    if (isCorrect) {
      const points = 10 + streak * 5 + Math.floor(timeLeft / 2);
      setScore(s => s + points);
      setStreak(s => s + 1);
      if (soundOn) playSound('correct');
      toast.success(`+${points} Points! 🔥 Streak: ${streak + 1}`);
    } else {
      setStreak(0);
      if (soundOn) playSound('wrong');
    }
    
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(c => c + 1);
        setSelected(null);
        setShowResult(false);
        setTimeLeft(20);
      } else {
        setGameOver(true);
        if (soundOn) playSound('win');
        onScore(score + (isCorrect ? 10 + streak * 5 : 0));
      }
    }, 2000);
  };

  if (loading) return <div className="text-center py-20"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-16 h-16 border-4 border-[#D90429] border-t-transparent rounded-full mx-auto mb-4" /><p className="text-white font-bebas text-xl">LOADING QUIZ...</p></div>;

  if (gameOver) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
        <motion.div className="relative inline-block mb-6" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <Trophy className="text-[#F77F00]" size={100} />
          <motion.div className="absolute -top-2 -right-2" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.5, repeat: Infinity }}><Star className="text-yellow-400 fill-yellow-400" size={30} /></motion.div>
        </motion.div>
        <h2 className="font-bebas text-5xl text-white tracking-wider mb-2">QUIZ COMPLETE!</h2>
        <motion.p className="font-bebas text-7xl bg-gradient-to-r from-[#F77F00] to-[#FFB703] bg-clip-text text-transparent mb-4" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1, repeat: Infinity }}>{score} POINTS</motion.p>
        <p className="text-gray-400 text-lg mb-2">{score >= 80 ? "🏆 Nepal Politics Expert!" : score >= 50 ? "⭐ Great Knowledge!" : "📚 Keep Learning!"}</p>
        <p className="text-gray-500 mb-8">Best streak: {streak} correct answers</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => { setCurrentQ(0); setScore(0); setGameOver(false); setTimeLeft(20); setStreak(0); setLoading(true); axios.get(`${API}/games/quiz-questions`).then(res => { setQuestions(res.data); setLoading(false); }); }} className="bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white font-bebas text-lg px-8 py-6"><RotateCcw className="mr-2" size={20} />PLAY AGAIN</Button>
          <Button onClick={onBack} variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bebas text-lg px-8 py-6">BACK</Button>
        </div>
      </motion.div>
    );
  }

  const q = questions[currentQ];
  if (!q) return null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 bg-white/5 p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <span className="font-bebas text-2xl text-white">Q{currentQ + 1}/{questions.length}</span>
          {streak > 0 && <motion.span className="bg-[#F77F00] px-3 py-1 rounded-full font-bebas text-sm" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5 }}>🔥 {streak} STREAK</motion.span>}
        </div>
        <span className="font-bebas text-2xl text-[#F77F00]">{score} PTS</span>
        <div className="flex items-center gap-2">
          <motion.div animate={timeLeft <= 5 ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.5, repeat: Infinity }}>
            <Clock className={timeLeft <= 5 ? "text-[#D90429]" : "text-white"} size={24} />
          </motion.div>
          <span className={`font-bebas text-2xl ${timeLeft <= 5 ? "text-[#D90429]" : "text-white"}`}>{timeLeft}s</span>
        </div>
      </div>

      {/* Question Card */}
      <motion.div key={currentQ} initial={{ opacity: 0, x: 100, rotateY: 90 }} animate={{ opacity: 1, x: 0, rotateY: 0 }} transition={{ duration: 0.5 }} className="bg-gradient-to-br from-[#003049] to-[#00263a] border border-white/20 p-8 rounded-2xl mb-8 shadow-2xl">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-[#D90429] rounded-full flex items-center justify-center flex-shrink-0">
            <Brain className="text-white" size={24} />
          </div>
          <h3 className="font-playfair text-2xl text-white leading-relaxed">{q.question}</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {q.options.map((opt, idx) => (
            <motion.button
              key={idx}
              whileHover={!showResult ? { scale: 1.03, x: 5 } : {}}
              whileTap={!showResult ? { scale: 0.97 } : {}}
              onClick={() => !showResult && handleAnswer(idx)}
              disabled={showResult}
              className={`p-5 rounded-xl font-inter text-left transition-all relative overflow-hidden ${
                showResult
                  ? idx === q.correct
                    ? "bg-gradient-to-r from-[#2A9D8F] to-[#21867a] text-white shadow-lg shadow-[#2A9D8F]/30"
                    : idx === selected
                    ? "bg-gradient-to-r from-[#D90429] to-[#b80322] text-white"
                    : "bg-white/5 text-gray-500"
                  : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
              }`}
            >
              <span className="font-bebas text-xl mr-3 opacity-60">{["A", "B", "C", "D"][idx]}</span>
              {opt}
              {showResult && idx === q.correct && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2" size={24} /></motion.div>}
              {showResult && idx === selected && idx !== q.correct && <XCircle className="absolute right-4 top-1/2 -translate-y-1/2" size={24} />}
            </motion.button>
          ))}
        </div>
        
        {/* Fact Display */}
        <AnimatePresence>
          {showResult && q.fact && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-[#F77F00]/20 rounded-lg border border-[#F77F00]/30">
              <p className="text-[#F77F00] font-inter text-sm">💡 <strong>Did you know?</strong> {q.fact}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Progress */}
      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-[#D90429] via-[#F77F00] to-[#FFB703]" initial={{ width: 0 }} animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} transition={{ duration: 0.5 }} />
      </div>
    </div>
  );
};

// ==================== CARD BATTLE GAME ====================
const CardBattle = ({ onBack, onScore, soundOn }) => {
  const [cards, setCards] = useState([]);
  const [playerCard, setPlayerCard] = useState(null);
  const [cpuCard, setCpuCard] = useState(null);
  const [selectedStat, setSelectedStat] = useState(null);
  const [round, setRound] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [cpuScore, setCpuScore] = useState(0);
  const [phase, setPhase] = useState('select'); // select, battle, result
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/games/candidate-cards`).then(res => {
      const shuffled = [...res.data].sort(() => Math.random() - 0.5);
      setCards(shuffled);
      setPlayerCard(shuffled[0]);
      setCpuCard(shuffled[1]);
      setLoading(false);
    }).catch(() => toast.error("Failed to load cards"));
  }, []);

  const selectStat = (stat) => {
    if (phase !== 'select') return;
    setSelectedStat(stat);
    setPhase('battle');
    
    setTimeout(() => {
      const playerVal = playerCard.stats[stat];
      const cpuVal = cpuCard.stats[stat];
      
      if (playerVal > cpuVal) {
        setPlayerScore(s => s + 1);
        if (soundOn) playSound('correct');
        toast.success("You win this round! 🎉");
      } else if (cpuVal > playerVal) {
        setCpuScore(s => s + 1);
        if (soundOn) playSound('wrong');
        toast.error("CPU wins this round!");
      } else {
        toast("It's a tie!");
      }
      
      setPhase('result');
      
      setTimeout(() => {
        if (round >= 5) {
          setGameOver(true);
          if (soundOn) playSound('win');
          onScore(playerScore * 20);
        } else {
          // Next round - rotate cards
          const newCards = [...cards];
          newCards.push(newCards.shift());
          newCards.push(newCards.shift());
          setCards(newCards);
          setPlayerCard(newCards[0]);
          setCpuCard(newCards[1]);
          setRound(r => r + 1);
          setPhase('select');
          setSelectedStat(null);
        }
      }, 2000);
    }, 1500);
  };

  if (loading) return <div className="text-center py-20"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-16 h-16 border-4 border-[#D90429] border-t-transparent rounded-full mx-auto mb-4" /><p className="text-white font-bebas text-xl">LOADING CARDS...</p></div>;

  if (gameOver) {
    const won = playerScore > cpuScore;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
        <motion.div animate={{ rotate: won ? [0, 10, -10, 0] : 0, scale: won ? [1, 1.1, 1] : 1 }} transition={{ duration: 2, repeat: Infinity }}>
          {won ? <Crown className="mx-auto text-[#F77F00] mb-4" size={100} /> : <Target className="mx-auto text-gray-500 mb-4" size={100} />}
        </motion.div>
        <h2 className="font-bebas text-5xl text-white mb-4">{won ? "VICTORY!" : playerScore === cpuScore ? "DRAW!" : "DEFEAT!"}</h2>
        <p className="font-bebas text-3xl text-[#F77F00] mb-2">You: {playerScore} - CPU: {cpuScore}</p>
        <p className="text-gray-400 mb-8">Points earned: {playerScore * 20}</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => { setRound(1); setPlayerScore(0); setCpuScore(0); setGameOver(false); setPhase('select'); setLoading(true); axios.get(`${API}/games/candidate-cards`).then(res => { const s = [...res.data].sort(() => Math.random() - 0.5); setCards(s); setPlayerCard(s[0]); setCpuCard(s[1]); setLoading(false); }); }} className="bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white font-bebas text-lg px-8 py-6"><RotateCcw className="mr-2" size={20} />REMATCH</Button>
          <Button onClick={onBack} variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bebas text-lg px-8 py-6">BACK</Button>
        </div>
      </motion.div>
    );
  }

  const stats = ['popularity', 'experience', 'charisma', 'vision'];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 bg-white/5 p-4 rounded-lg">
        <span className="font-bebas text-2xl text-white">ROUND {round}/5</span>
        <div className="flex items-center gap-8">
          <span className="font-bebas text-xl text-[#2A9D8F]">YOU: {playerScore}</span>
          <span className="font-bebas text-xl text-[#D90429]">CPU: {cpuScore}</span>
        </div>
      </div>

      {/* Battle Arena */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Player Card */}
        <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-gradient-to-br from-[#003049] to-[#00263a] p-6 rounded-2xl border-2 border-[#2A9D8F] shadow-xl">
          <div className="text-center mb-4">
            <span className="bg-[#2A9D8F] px-3 py-1 rounded-full font-bebas text-sm text-white">YOUR CARD</span>
          </div>
          <img src={playerCard?.image_url} alt={playerCard?.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4" style={{ borderColor: playerCard?.party_color }} />
          <h3 className="font-bebas text-2xl text-white text-center mb-1">{playerCard?.name}</h3>
          <p className="text-center text-sm mb-4" style={{ color: playerCard?.party_color }}>{playerCard?.party}</p>
          
          <div className="space-y-3">
            {stats.map(stat => (
              <motion.button
                key={stat}
                whileHover={phase === 'select' ? { scale: 1.02, x: 5 } : {}}
                onClick={() => selectStat(stat)}
                disabled={phase !== 'select'}
                className={`w-full p-3 rounded-lg flex justify-between items-center transition-all ${
                  selectedStat === stat ? "bg-[#F77F00] text-white" : phase === 'select' ? "bg-white/10 hover:bg-white/20 text-white cursor-pointer" : "bg-white/5 text-gray-400"
                }`}
              >
                <span className="font-bebas tracking-wider capitalize">{stat}</span>
                <span className="font-bebas text-xl">{playerCard?.stats[stat]}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* VS */}
        <div className="text-center">
          <motion.div animate={phase === 'battle' ? { scale: [1, 1.3, 1], rotate: [0, 360] } : {}} transition={{ duration: 1 }}>
            <Swords className="mx-auto text-[#F77F00]" size={80} />
          </motion.div>
          <p className="font-bebas text-3xl text-white mt-4">VS</p>
          {phase === 'select' && <p className="text-gray-400 text-sm mt-2">Select a stat to battle!</p>}
        </div>

        {/* CPU Card */}
        <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className={`bg-gradient-to-br from-[#003049] to-[#00263a] p-6 rounded-2xl border-2 shadow-xl ${phase === 'select' ? 'border-gray-700' : 'border-[#D90429]'}`}>
          <div className="text-center mb-4">
            <span className="bg-[#D90429] px-3 py-1 rounded-full font-bebas text-sm text-white">CPU CARD</span>
          </div>
          <img src={cpuCard?.image_url} alt={cpuCard?.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4" style={{ borderColor: phase === 'select' ? '#374151' : cpuCard?.party_color }} />
          <h3 className="font-bebas text-2xl text-white text-center mb-1">{phase === 'select' ? '???' : cpuCard?.name}</h3>
          <p className="text-center text-sm mb-4" style={{ color: phase === 'select' ? '#6b7280' : cpuCard?.party_color }}>{phase === 'select' ? 'Hidden' : cpuCard?.party}</p>
          
          <div className="space-y-3">
            {stats.map(stat => (
              <div key={stat} className={`w-full p-3 rounded-lg flex justify-between items-center ${selectedStat === stat && phase !== 'select' ? "bg-[#D90429]/30" : "bg-white/5"}`}>
                <span className="font-bebas tracking-wider capitalize text-gray-400">{stat}</span>
                <span className="font-bebas text-xl text-white">{phase === 'select' ? '?' : cpuCard?.stats[stat]}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ==================== MAIN GAMES PAGE ====================
const GamesPage = () => {
  const [activeGame, setActiveGame] = useState(null);
  const [soundOn, setSoundOn] = useState(true);
  const [totalScore, setTotalScore] = useState(() => parseInt(localStorage.getItem("game_score") || "0"));
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    axios.get(`${API}/games/leaderboard`).then(res => setLeaderboard(res.data)).catch(() => {});
  }, [totalScore]);

  const addScore = (points) => {
    const newScore = totalScore + points;
    setTotalScore(newScore);
    localStorage.setItem("game_score", newScore.toString());
    axios.post(`${API}/games/save-score`, { player_id: localStorage.getItem("voter_token") || "anonymous", game: activeGame, score: points }).catch(() => {});
  };

  const games = [
    { id: "quiz", name: "NEPAL POLITICS QUIZ", desc: "10 questions, real facts, time-limited!", icon: Brain, color: "#D90429", gradient: "from-[#D90429] to-[#EF233C]" },
    { id: "battle", name: "CANDIDATE CARD BATTLE", desc: "Compare stats, beat the CPU!", icon: Swords, color: "#48CAE4", gradient: "from-[#48CAE4] to-[#2A9D8F]" },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <LiveTicker />
      
      {/* Hero */}
      <div className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-96 h-96 bg-[#D90429]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#48CAE4]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F77F00]/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}>
              <Gamepad2 className="mx-auto mb-6 text-[#F77F00]" size={80} />
            </motion.div>
            <h1 className="font-bebas text-6xl sm:text-8xl text-white tracking-wider mb-4" style={{ textShadow: "0 0 60px rgba(247,127,0,0.5)" }}>MINI GAMES</h1>
            <p className="font-playfair text-xl text-gray-300 italic mb-6">"Learn Nepal Politics While Having Fun!"</p>
            
            {/* Score & Sound */}
            <div className="flex items-center justify-center gap-6">
              <motion.div className="flex items-center gap-3 bg-gradient-to-r from-[#F77F00]/20 to-[#FFB703]/20 px-6 py-3 rounded-full border border-[#F77F00]/30" animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Crown className="text-[#F77F00]" size={28} />
                <span className="font-bebas text-3xl text-white">{totalScore}</span>
                <span className="text-gray-400 font-inter text-sm">POINTS</span>
              </motion.div>
              <button onClick={() => setSoundOn(!soundOn)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                {soundOn ? <Volume2 className="text-white" size={24} /> : <VolumeX className="text-gray-500" size={24} />}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <AnimatePresence mode="wait">
          {activeGame ? (
            <motion.div key={activeGame} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}>
              {activeGame === "quiz" && <QuizGame onBack={() => setActiveGame(null)} onScore={addScore} soundOn={soundOn} />}
              {activeGame === "battle" && <CardBattle onBack={() => setActiveGame(null)} onScore={addScore} soundOn={soundOn} />}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-8">
                  {/* Games Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {games.map((game, i) => (
                      <motion.div
                        key={game.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.15 }}
                        whileHover={{ y: -10, scale: 1.02 }}
                        onClick={() => setActiveGame(game.id)}
                        className="relative bg-gradient-to-br from-white/5 to-white/0 backdrop-blur border border-white/10 p-8 rounded-2xl cursor-pointer group overflow-hidden"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                        
                        <motion.div className={`w-20 h-20 bg-gradient-to-br ${game.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`} whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.5 }}>
                          <game.icon className="text-white" size={40} />
                        </motion.div>
                        <h3 className="font-bebas text-3xl text-white tracking-wider mb-2">{game.name}</h3>
                        <p className="font-inter text-gray-400 mb-6">{game.desc}</p>
                        <div className="flex items-center gap-2 text-[#F77F00] font-bebas tracking-wider group-hover:gap-4 transition-all">
                          PLAY NOW <ChevronRight size={20} />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <h3 className="font-bebas text-2xl text-white mb-6 flex items-center gap-3"><TrendingUp className="text-[#F77F00]" />YOUR PROGRESS</h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center"><p className="font-bebas text-4xl text-[#F77F00]">{totalScore}</p><p className="text-gray-500 text-sm">Total Points</p></div>
                      <div className="text-center"><p className="font-bebas text-4xl text-[#48CAE4]">{Math.floor(totalScore / 100)}</p><p className="text-gray-500 text-sm">Level</p></div>
                      <div className="text-center"><p className="font-bebas text-4xl">{totalScore >= 500 ? "🏆" : totalScore >= 200 ? "⭐" : "🎯"}</p><p className="text-gray-500 text-sm">Rank</p></div>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <AdBanner />
                  
                  {/* Leaderboard */}
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <h3 className="font-bebas text-xl text-white mb-4 flex items-center gap-2"><Users className="text-[#F77F00]" />TOP PLAYERS</h3>
                    <div className="space-y-3">
                      {leaderboard.slice(0, 5).map((p, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">{i + 1}. {p.player_id?.slice(0, 8) || "Anon"}...</span>
                          <span className="font-bebas text-[#F77F00]">{p.total_score}</span>
                        </div>
                      ))}
                      {leaderboard.length === 0 && <p className="text-gray-500 text-sm">Play to get on the board!</p>}
                    </div>
                  </div>
                  
                  <AdBanner />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
};

export default GamesPage;
