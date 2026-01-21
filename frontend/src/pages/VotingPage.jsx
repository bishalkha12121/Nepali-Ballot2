import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, Vote, Lock, Loader2, Sparkles, Shield, CheckCircle2, Star, Zap } from "lucide-react";
import { getPartyIcon } from "../components/PartyIcons";
import { NepalPrideSection } from "../components/NepalMap";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const IMAGES = {
  hero: "https://images.unsplash.com/photo-1686316431445-50f078a2de0f?w=1920&q=80",
  stupa: "https://images.unsplash.com/photo-1751953460151-a27fe39e5fad?w=800&q=80",
};

const getVoterToken = () => {
  let token = localStorage.getItem("voter_token");
  if (!token) {
    token = `voter_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem("voter_token", token);
  }
  return token;
};

// Ad Banner
const AdBanner = ({ type = "rectangle", id }) => {
  const sizes = {
    horizontal: { w: "728px", h: "90px", label: "728x90" },
    rectangle: { w: "300px", h: "250px", label: "300x250" },
  };
  const size = sizes[type];
  return (
    <div className="bg-white/5 border border-white/10 flex items-center justify-center rounded-sm" style={{ width: "100%", maxWidth: size.w, height: size.h }}>
      <div className="text-center">
        <p className="text-gray-500 text-xs">ADVERTISEMENT</p>
        <p className="text-gray-400 text-sm font-bebas">{size.label}</p>
      </div>
    </div>
  );
};

// Live Ticker
const LiveTicker = () => (
  <div className="bg-gradient-to-r from-gorkhali-red via-peace-blue to-gorkhali-red py-3 overflow-hidden">
    <motion.div className="flex whitespace-nowrap" animate={{ x: [0, -1500] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
      {[...Array(4)].map((_, i) => (
        <span key={i} className="mx-8 text-white font-bebas tracking-wider text-sm">
          🗳️ VOTE NOW • BALEN SHAH • KP OLI • DEUBA • PRACHANDA • RABI LAMICHHANE • MAKE YOUR VOICE HEARD • <span className="text-marigold">★</span>
        </span>
      ))}
    </motion.div>
  </div>
);

// Confetti
const Confetti = () => (
  <div className="fixed inset-0 pointer-events-none z-50">
    {[...Array(50)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-3 h-3 rounded-full"
        style={{ background: ['#D90429', '#003049', '#F77F00', '#48CAE4'][i % 4], left: `${Math.random() * 100}%` }}
        initial={{ y: -20, opacity: 1 }}
        animate={{ y: window.innerHeight + 20, x: (Math.random() - 0.5) * 200, rotate: Math.random() * 360, opacity: 0 }}
        transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }}
      />
    ))}
  </div>
);

// Footer Component
const Footer = () => (
  <footer className="bg-black py-16 relative overflow-hidden">
    <div className="absolute inset-0">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gorkhali-red/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rsp-blue/5 rounded-full blur-3xl" />
    </div>
    <div className="max-w-6xl mx-auto px-4 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <motion.div className="w-12 h-12" animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
              <svg viewBox="0 0 40 48" className="w-full h-full">
                <polygon points="0,0 40,16 0,32" fill="#D90429" />
                <polygon points="0,16 40,32 0,48" fill="#003049" />
                <circle cx="12" cy="12" r="4" fill="white" />
                <circle cx="12" cy="28" r="4" fill="white" />
              </svg>
            </motion.div>
            <div>
              <h3 className="font-bebas text-2xl text-white tracking-wider">NEPALI BALLOT</h3>
              <p className="text-gray-500 text-xs">Election Simulation Platform</p>
            </div>
          </div>
          <p className="font-inter text-gray-400 text-sm mb-4">
            Experience Nepal's democracy through this fun election simulation. Entertainment purposes only.
          </p>
          <motion.div 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-gorkhali-red/20 to-rsp-blue/20 px-4 py-2 rounded-full border border-white/10"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="text-marigold" size={16} />
            <span className="text-white font-bebas tracking-wider text-sm">BUILT BY TWO GEN Zs 🔥</span>
            <Zap className="text-rsp-blue" size={16} />
          </motion.div>
        </div>
        <div>
          <h4 className="font-bebas text-lg text-white tracking-wider mb-4">EXPLORE</h4>
          <ul className="space-y-2 font-inter text-sm text-gray-400">
            {["Vote Now", "Live Results", "Election History", "All 7 Provinces"].map((link) => (
              <li key={link}><a href="#" className="hover:text-marigold transition-colors flex items-center gap-2"><Star size={12} className="text-marigold" />{link}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bebas text-lg text-white tracking-wider mb-4">SPONSORED</h4>
          <div className="bg-gray-900 border border-gray-800 p-4 text-center rounded-sm">
            <p className="text-gray-600 text-xs mb-2">AD SPACE</p>
            <p className="text-gray-500 text-sm font-bebas">Your Brand Here</p>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-inter text-gray-500 text-sm">© 2026 Nepali Ballot 🇳🇵</p>
        <div className="flex items-center gap-4">
          <motion.span className="text-2xl" animate={{ rotate: [0, 20, -20, 0] }} transition={{ duration: 2, repeat: Infinity }}>🇳🇵</motion.span>
          <span className="text-gray-600 font-inter text-xs">Entertainment Only • Not Real Election</span>
        </div>
      </div>
      <div className="mt-6 p-3 bg-gray-900/50 border border-gray-800 rounded-sm text-center">
        <p className="text-gray-600 text-xs font-mono">{'<!-- Custom Tracking Code Area -->'}</p>
      </div>
    </div>
  </footer>
);

const VotingPage = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedFor, setVotedFor] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetchCandidates();
    checkVoteStatus();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get(`${API}/candidates`);
      setCandidates(response.data);
    } catch (error) {
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const checkVoteStatus = async () => {
    try {
      const voterToken = getVoterToken();
      const response = await axios.get(`${API}/check-vote/${voterToken}`);
      if (response.data.has_voted) {
        setHasVoted(true);
        setVotedFor(response.data.candidate_id);
      }
    } catch (error) {}
  };

  const handleVote = () => {
    if (!selectedCandidate) {
      toast.error("Please select a candidate first");
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmVote = async () => {
    setSubmitting(true);
    setShowConfirmDialog(false);
    try {
      const voterToken = getVoterToken();
      await axios.post(`${API}/vote`, { candidate_id: selectedCandidate.id, voter_token: voterToken });
      setShowConfetti(true);
      toast.success("Vote cast successfully!", { icon: <Sparkles className="text-marigold" /> });
      setHasVoted(true);
      setVotedFor(selectedCandidate.id);
      setTimeout(() => { setShowConfetti(false); navigate("/results"); }, 3000);
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error("You have already voted");
        setHasVoted(true);
      } else {
        toast.error("Failed to cast vote");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getVotedCandidate = () => candidates.find((c) => c.id === votedFor);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-night-count">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-20 h-20 border-4 border-gorkhali-red border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-bebas text-2xl text-white tracking-wider">LOADING CANDIDATES</p>
        </motion.div>
      </div>
    );
  }

  if (hasVoted) {
    const votedCandidate = getVotedCandidate();
    return (
      <div className="min-h-screen bg-night-count">
        {showConfetti && <Confetti />}
        <LiveTicker />
        <div className="py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-32 h-32 bg-gradient-to-br from-congress-green to-rsp-blue rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <CheckCircle2 className="text-white" size={64} />
            </motion.div>
            <h1 className="font-bebas text-5xl text-white tracking-wider mb-4">THANK YOU!</h1>
            <p className="font-inter text-gray-400 mb-8 text-lg">Your voice has been heard. You voted for:</p>
            {votedCandidate && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 backdrop-blur border border-white/20 p-8 rounded-sm inline-block">
                <img src={votedCandidate.image_url} alt={votedCandidate.name} className="w-32 h-32 rounded-full mx-auto mb-4 border-4" style={{ borderColor: votedCandidate.party_color }} />
                <h2 className="font-bebas text-3xl text-white">{votedCandidate.name}</h2>
                <p className="font-inter" style={{ color: votedCandidate.party_color }}>{votedCandidate.party}</p>
              </motion.div>
            )}
            <div className="mt-10">
              <Button onClick={() => navigate("/results")} className="bg-gradient-to-r from-gorkhali-red to-communist-red text-white font-bebas tracking-wider text-lg px-10 py-6">VIEW LIVE RESULTS →</Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night-count">
      {showConfetti && <Confetti />}
      <LiveTicker />
      
      {/* Hero Header */}
      <div className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMAGES.hero} alt="Nepal" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-night-count via-night-count/90 to-night-count" />
        </div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gorkhali-red/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-rsp-blue/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              <Vote className="mx-auto mb-6 text-marigold" size={64} />
            </motion.div>
            <h1 className="font-bebas text-6xl sm:text-7xl text-white tracking-wider mb-4" style={{ textShadow: "0 0 60px rgba(217,4,41,0.5)" }}>
              CAST YOUR VOTE
            </h1>
            <p className="font-playfair text-xl text-gray-300 italic mb-2">"Every vote shapes the future"</p>
            <p className="font-inter text-gray-500">Select your preferred candidate for Prime Minister</p>
          </motion.div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 backdrop-blur-md border border-white/20 p-5 flex items-center gap-4 rounded-sm">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <Lock className="text-congress-green" size={32} />
          </motion.div>
          <div>
            <p className="font-bebas text-lg text-white tracking-wider">ANONYMOUS & SECURE</p>
            <p className="font-inter text-sm text-gray-400">Your vote is private. Each browser can only vote once.</p>
          </div>
          <Shield className="text-marigold ml-auto" size={24} />
        </motion.div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Candidates Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidates.map((candidate, index) => {
                const isSelected = selectedCandidate?.id === candidate.id;
                return (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    onClick={() => setSelectedCandidate(candidate)}
                    className={`relative bg-white/5 backdrop-blur border-2 p-6 rounded-sm cursor-pointer transition-all ${isSelected ? "border-gorkhali-red shadow-xl shadow-gorkhali-red/20" : "border-white/10 hover:border-white/30"}`}
                    data-testid={`candidate-card-${candidate.id}`}
                  >
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-3 -right-3 w-10 h-10 bg-gorkhali-red rounded-full flex items-center justify-center shadow-lg">
                        <Check className="text-white" size={20} />
                      </motion.div>
                    )}
                    {/* Party Flag */}
                    <motion.div className="w-16 h-12 mx-auto mb-4 flex items-center justify-center" whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
                      {candidate.party_flag_url ? (
                        <img src={candidate.party_flag_url} alt={`${candidate.party} flag`} className="max-w-full max-h-full object-contain" />
                      ) : (
                        getPartyIcon(candidate.party_symbol, 32, candidate.party_color)
                      )}
                    </motion.div>
                    <div className="relative mx-auto mb-4 w-24 h-24">
                      <img src={candidate.image_url} alt={candidate.name} className="w-full h-full rounded-full object-cover border-4" style={{ borderColor: isSelected ? candidate.party_color : 'rgba(255,255,255,0.1)' }} />
                      {isSelected && <motion.div className="absolute inset-0 rounded-full border-2" style={{ borderColor: candidate.party_color }} animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />}
                    </div>
                    <h3 className="font-bebas text-xl text-white tracking-wider text-center">{candidate.name}</h3>
                    <p className="font-inter text-sm text-center mb-2" style={{ color: candidate.party_color }}>{candidate.party}</p>
                    <p className="font-playfair text-sm text-gray-500 text-center italic">"{candidate.slogan}"</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Vote Button */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center mt-12">
              <motion.div whileHover={{ scale: selectedCandidate ? 1.05 : 1 }} whileTap={{ scale: selectedCandidate ? 0.95 : 1 }}>
                <Button onClick={handleVote} disabled={!selectedCandidate || submitting} className="bg-gradient-to-r from-gorkhali-red to-communist-red text-white font-bebas tracking-wider text-2xl px-16 py-8 disabled:opacity-50 shadow-xl shadow-gorkhali-red/30">
                  {submitting ? <><Loader2 className="mr-2 animate-spin" size={24} />SUBMITTING...</> : <><Vote className="mr-3" size={28} />SUBMIT VOTE {selectedCandidate && <Sparkles className="ml-2" size={20} />}</>}
                </Button>
              </motion.div>
              {selectedCandidate && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bebas text-xl tracking-wider mt-4" style={{ color: selectedCandidate.party_color }}>SELECTED: {selectedCandidate.name.toUpperCase()}</motion.p>}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <AdBanner type="rectangle" id="vote-sidebar-1" />
            <div className="bg-white/5 border border-white/10 p-4 rounded-sm">
              <h3 className="font-bebas text-lg text-white tracking-wider mb-3 flex items-center gap-2"><Star className="text-marigold" size={18} />WHY VOTE?</h3>
              <ul className="space-y-2 text-sm text-gray-400 font-inter">
                <li>• Experience democracy</li>
                <li>• Support your candidate</li>
                <li>• See live results</li>
                <li>• 100% anonymous</li>
              </ul>
            </div>
            <AdBanner type="rectangle" id="vote-sidebar-2" />
          </div>
        </div>

        {/* Nepal Pride Section */}
        <div className="mt-16">
          <NepalPrideSection />
        </div>

        {/* Football Live Scores */}
        <div className="mt-12">
          <FootballWidget />
        </div>
      </div>

      <Footer />

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-night-count border-2 border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bebas text-3xl text-white tracking-wider text-center">CONFIRM YOUR VOTE</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {selectedCandidate && (
                <div className="py-4">
                  <img src={selectedCandidate.image_url} alt={selectedCandidate.name} className="w-24 h-24 rounded-full mx-auto mb-3 border-4" style={{ borderColor: selectedCandidate.party_color }} />
                  <p className="font-bebas text-2xl text-white">{selectedCandidate.name}</p>
                  <p style={{ color: selectedCandidate.party_color }}>{selectedCandidate.party}</p>
                </div>
              )}
              <p className="text-gray-400 mt-4">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-bebas tracking-wider">CANCEL</AlertDialogCancel>
            <AlertDialogAction onClick={confirmVote} className="bg-gradient-to-r from-gorkhali-red to-communist-red text-white font-bebas tracking-wider">
              <Check className="mr-2" size={18} />CONFIRM VOTE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VotingPage;
