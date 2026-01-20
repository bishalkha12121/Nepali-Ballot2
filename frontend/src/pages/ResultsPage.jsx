import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { RefreshCw, Trophy, Users, TrendingUp, Clock, Zap, Activity, Crown, Vote, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const IMAGES = {
  hero: "https://images.unsplash.com/photo-1661966772663-98498d0a30df?w=1920&q=80",
};

const AdBanner = ({ type = "rectangle", id }) => {
  const sizes = { horizontal: { w: "728px", h: "90px", label: "728x90" }, rectangle: { w: "300px", h: "250px", label: "300x250" } };
  const size = sizes[type];
  return (
    <div className="bg-white/5 border border-white/10 flex items-center justify-center rounded-sm" style={{ width: "100%", maxWidth: size.w, height: size.h }}>
      <div className="text-center"><p className="text-gray-500 text-xs">ADVERTISEMENT</p><p className="text-gray-400 text-sm font-bebas">{size.label}</p></div>
    </div>
  );
};

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    const start = 0, end = value, duration = 1000, startTime = Date.now();
    const animate = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      setDisplayValue(Math.floor(start + (end - start) * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);
  return <span>{displayValue.toLocaleString()}</span>;
};

const LiveTicker = ({ totalVotes }) => (
  <div className="bg-gradient-to-r from-gorkhali-red via-peace-blue to-gorkhali-red py-3 overflow-hidden">
    <motion.div className="flex whitespace-nowrap" animate={{ x: [0, -1500] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
      {[...Array(4)].map((_, i) => (
        <span key={i} className="mx-8 text-white font-bebas tracking-wider text-sm">
          🔴 LIVE • {totalVotes} VOTES CAST • AUTO-REFRESH EVERY 10s • REAL-TIME RESULTS • <span className="text-marigold">★</span>
        </span>
      ))}
    </motion.div>
  </div>
);

const Footer = () => (
  <footer className="bg-black py-16 relative overflow-hidden">
    <div className="absolute inset-0"><div className="absolute top-0 left-1/4 w-96 h-96 bg-gorkhali-red/5 rounded-full blur-3xl" /><div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rsp-blue/5 rounded-full blur-3xl" /></div>
    <div className="max-w-6xl mx-auto px-4 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <motion.div className="w-12 h-12" animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
              <svg viewBox="0 0 40 48" className="w-full h-full"><polygon points="0,0 40,16 0,32" fill="#D90429" /><polygon points="0,16 40,32 0,48" fill="#003049" /><circle cx="12" cy="12" r="4" fill="white" /><circle cx="12" cy="28" r="4" fill="white" /></svg>
            </motion.div>
            <div><h3 className="font-bebas text-2xl text-white tracking-wider">NEPALI BALLOT</h3><p className="text-gray-500 text-xs">Election Simulation</p></div>
          </div>
          <p className="font-inter text-gray-400 text-sm mb-4">Experience Nepal's democracy through this fun election simulation.</p>
          <motion.div className="inline-flex items-center gap-2 bg-gradient-to-r from-gorkhali-red/20 to-rsp-blue/20 px-4 py-2 rounded-full border border-white/10" animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <Sparkles className="text-marigold" size={16} /><span className="text-white font-bebas tracking-wider text-sm">BUILT BY TWO GEN Zs 🔥</span><Zap className="text-rsp-blue" size={16} />
          </motion.div>
        </div>
        <div><h4 className="font-bebas text-lg text-white tracking-wider mb-4">EXPLORE</h4><ul className="space-y-2 font-inter text-sm text-gray-400">{["Vote Now", "Live Results", "History"].map(l => <li key={l}><a href="#" className="hover:text-marigold flex items-center gap-2"><Star size={12} className="text-marigold" />{l}</a></li>)}</ul></div>
        <div><h4 className="font-bebas text-lg text-white tracking-wider mb-4">SPONSORED</h4><div className="bg-gray-900 border border-gray-800 p-4 text-center rounded-sm"><p className="text-gray-600 text-xs">AD SPACE</p><p className="text-gray-500 font-bebas">Your Brand</p></div></div>
      </div>
      <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-inter text-gray-500 text-sm">© 2026 Nepali Ballot 🇳🇵</p>
        <div className="flex items-center gap-4"><motion.span className="text-2xl" animate={{ rotate: [0, 20, -20, 0] }} transition={{ duration: 2, repeat: Infinity }}>🇳🇵</motion.span><span className="text-gray-600 text-xs">Entertainment Only</span></div>
      </div>
    </div>
  </footer>
);

const ResultsPage = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchResults();
    const interval = setInterval(() => fetchResults(false, true), 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchResults = async (showToast = false, isAuto = false) => {
    try {
      if (!isAuto) setRefreshing(true);
      const response = await axios.get(`${API}/results`);
      setResults(response.data);
      setLastUpdated(new Date());
      if (showToast) toast.success("Refreshed!");
    } catch (e) { toast.error("Failed to load"); }
    finally { setLoading(false); setRefreshing(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-night-count">
      <motion.div className="text-center"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-20 h-20 border-4 border-gorkhali-red border-t-transparent rounded-full mx-auto mb-4" /><p className="font-bebas text-2xl text-white">LOADING RESULTS</p></motion.div>
    </div>
  );

  const winner = results?.results?.[0];
  const chartData = results?.results?.map(r => ({ name: r.candidate_name.split(" ")[0], fullName: r.candidate_name, votes: r.vote_count, percentage: r.percentage, fill: r.party_color })) || [];

  return (
    <div className="min-h-screen bg-night-count">
      <LiveTicker totalVotes={results?.total_votes || 0} />
      
      {/* Hero */}
      <div className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0"><img src={IMAGES.hero} alt="Nepal" className="w-full h-full object-cover opacity-20" /><div className="absolute inset-0 bg-gradient-to-b from-night-count via-night-count/90 to-night-count" /></div>
        <div className="absolute inset-0"><div className="absolute top-10 right-10 w-72 h-72 bg-gorkhali-red/20 rounded-full blur-3xl animate-pulse" /><div className="absolute bottom-10 left-10 w-72 h-72 bg-rsp-blue/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} /></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <motion.div className="flex items-center gap-2 bg-gorkhali-red/20 px-4 py-2 rounded-full mb-4 inline-flex" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <span className="w-3 h-3 bg-gorkhali-red rounded-full animate-pulse" /><span className="text-gorkhali-red font-bebas tracking-wider">LIVE</span>
              </motion.div>
              <h1 className="font-bebas text-6xl sm:text-7xl text-white tracking-wider" style={{ textShadow: "0 0 60px rgba(217,4,41,0.5)" }}>LIVE RESULTS</h1>
              <p className="font-playfair text-xl text-gray-300 italic mt-2">"Democracy in action"</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-6">
              <div className="text-right"><p className="text-gray-500 text-xs">Updated</p><p className="font-bebas text-xl text-white flex items-center gap-2"><Clock size={16} className="text-marigold" />{lastUpdated?.toLocaleTimeString()}</p></div>
              <Button onClick={() => fetchResults(true)} disabled={refreshing} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bebas">
                <RefreshCw className={`mr-2 ${refreshing ? "animate-spin" : ""}`} size={18} />REFRESH
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[{ icon: Users, label: "TOTAL", value: results?.total_votes || 0, color: "gorkhali-red", isNum: true },
            { icon: Trophy, label: "LEADING", value: winner?.candidate_name?.split(" ")[0] || "—", color: "marigold" },
            { icon: TrendingUp, label: "LEAD %", value: `${winner?.percentage || 0}%`, color: "rsp-blue" },
            { icon: Activity, label: "STATUS", value: "ACTIVE", color: "congress-green" }
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white/5 backdrop-blur border border-white/10 p-5 rounded-sm hover:bg-white/10 transition-all">
              <div className="flex items-center gap-4">
                <motion.div className={`w-12 h-12 bg-${s.color}/20 rounded-full flex items-center justify-center`} animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}><s.icon className={`text-${s.color}`} size={24} /></motion.div>
                <div><p className="text-gray-500 text-xs uppercase">{s.label}</p><p className="font-bebas text-2xl text-white">{s.isNum ? <AnimatedNumber value={s.value} /> : s.value}</p></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Winner */}
        {results?.total_votes > 0 && winner && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 bg-gradient-to-r from-marigold/20 via-marigold/10 to-transparent border border-marigold/30 p-6 rounded-sm relative overflow-hidden">
            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 3, repeat: Infinity }} />
            <div className="flex items-center gap-6 relative z-10">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}><Crown className="text-marigold" size={48} /></motion.div>
              <div><p className="text-gray-400 text-sm uppercase">Leading</p><p className="font-bebas text-4xl text-white">{winner.candidate_name}</p><p className="text-marigold">{winner.party} • {winner.vote_count} votes ({winner.percentage}%)</p></div>
              <motion.div className="ml-auto" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}><Sparkles className="text-marigold" size={32} /></motion.div>
            </div>
          </motion.div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {/* Distribution */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-sm p-6 shadow-xl">
              <h2 className="font-bebas text-2xl text-peace-blue tracking-wider mb-6 flex items-center gap-2"><Activity className="text-gorkhali-red" size={24} />VOTE DISTRIBUTION</h2>
              <div className="space-y-5">
                {results?.results?.map((r, i) => (
                  <motion.div key={r.candidate_id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="cursor-pointer" whileHover={{ x: 5 }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {i === 0 && results.total_votes > 0 && <motion.span className="bg-gradient-to-r from-marigold to-rpp-gold text-white text-xs font-bebas px-3 py-1 rounded-sm" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>LEADING</motion.span>}
                        <span className="font-bebas text-lg text-peace-blue">{r.candidate_name}</span>
                      </div>
                      <div><span className="font-bebas text-2xl text-peace-blue">{r.percentage}%</span><span className="text-gray-500 text-sm ml-2">({r.vote_count})</span></div>
                    </div>
                    <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ backgroundColor: r.party_color }} initial={{ width: 0 }} animate={{ width: `${r.percentage}%` }} transition={{ duration: 1, delay: i * 0.1 }} />
                    </div>
                    <p className="text-gray-500 text-xs mt-1">{r.party}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-sm p-6 shadow-xl">
                <h3 className="font-bebas text-xl text-peace-blue mb-4 flex items-center gap-2"><BarChart className="text-rsp-blue" size={20} />VOTES</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis type="number" tick={{ fontFamily: "Inter", fontSize: 11 }} /><YAxis type="category" dataKey="name" tick={{ fontFamily: "Bebas Neue", fontSize: 13 }} width={70} /><Tooltip /><Bar dataKey="votes" radius={[0, 8, 8, 0]}>{chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar></BarChart>
                </ResponsiveContainer>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-sm p-6 shadow-xl">
                <h3 className="font-bebas text-xl text-peace-blue mb-4 flex items-center gap-2"><Zap className="text-marigold" size={20} />SHARE</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart><Pie data={chartData} cx="50%" cy="50%" outerRadius={90} innerRadius={45} dataKey="votes" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>{chartData.map((e, i) => <Cell key={i} fill={e.fill} stroke="#fff" strokeWidth={2} />)}</Pie><Tooltip /></PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <AdBanner type="rectangle" id="results-1" />
            <div className="bg-white/5 border border-white/10 p-4 rounded-sm">
              <h3 className="font-bebas text-lg text-white mb-3">ACTIONS</h3>
              <div className="space-y-3">
                <Button className="w-full bg-gorkhali-red hover:bg-communist-red text-white font-bebas" onClick={() => window.location.href = "/vote"}><Vote className="mr-2" size={18} />VOTE NOW</Button>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 font-bebas" onClick={() => window.location.href = "/history"}>HISTORY</Button>
              </div>
            </div>
            <AdBanner type="rectangle" id="results-2" />
          </div>
        </div>

        {results?.total_votes === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}><Vote className="mx-auto text-gray-600 mb-4" size={64} /></motion.div>
            <p className="font-bebas text-3xl text-white mb-6">NO VOTES YET</p>
            <Button className="bg-gorkhali-red text-white font-bebas text-lg px-8 py-6" onClick={() => window.location.href = "/vote"}>CAST YOUR VOTE →</Button>
          </motion.div>
        )}

        <div className="mt-12 flex justify-center"><AdBanner type="horizontal" id="results-bottom" /></div>
      </div>
      <Footer />
    </div>
  );
};

export default ResultsPage;
