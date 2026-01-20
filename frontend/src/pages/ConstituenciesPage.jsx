import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { MapPin, Users, Search, Filter, ChevronRight, Award, Calendar, TrendingUp, Building, Vote, Star, History, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LiveTicker = () => (
  <div className="bg-gradient-to-r from-gorkhali-red via-peace-blue to-gorkhali-red py-3 overflow-hidden">
    <motion.div className="flex whitespace-nowrap" animate={{ x: [0, -2000] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}>
      {[...Array(4)].map((_, i) => (
        <span key={i} className="mx-8 text-white font-bebas tracking-wider text-sm">
          🗳️ CONSTITUENCIES • ALL 7 PROVINCES • 165 FEDERAL SEATS • 330 PROVINCIAL SEATS • FIND YOUR CANDIDATE • <span className="text-marigold">★</span>
        </span>
      ))}
    </motion.div>
  </div>
);

const CandidateCard = ({ candidate, onClick }) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    onClick={onClick}
    className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4 cursor-pointer hover:border-marigold/50 transition-all"
  >
    <div className="flex items-start gap-4">
      {candidate.image_url ? (
        <img src={candidate.image_url} alt={candidate.name} className="w-16 h-16 rounded-full object-cover border-2" style={{ borderColor: candidate.party_color }} />
      ) : (
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
          <Users className="text-gray-400" size={24} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-bebas text-lg text-white tracking-wider truncate">{candidate.name}</h3>
        <p className="text-sm truncate" style={{ color: candidate.party_color }}>{candidate.party}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">{candidate.constituency}</span>
          {candidate.is_incumbent && (
            <span className="text-xs bg-marigold/20 text-marigold px-2 py-1 rounded flex items-center gap-1">
              <Award size={10} /> Incumbent
            </span>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

const ConstituencyCard = ({ constituency, onClick }) => (
  <motion.div
    whileHover={{ y: -3 }}
    onClick={onClick}
    className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4 cursor-pointer hover:border-marigold/50 transition-all"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gorkhali-red/20 rounded-full flex items-center justify-center">
          <MapPin className="text-gorkhali-red" size={20} />
        </div>
        <div>
          <h3 className="font-bebas text-lg text-white tracking-wider">{constituency.name}</h3>
          <p className="text-xs text-gray-400">{constituency.district}, {constituency.province}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bebas text-lg text-marigold">{constituency.candidates_count || 0}</p>
        <p className="text-xs text-gray-500">Candidates</p>
      </div>
    </div>
  </motion.div>
);

const CandidateDetailModal = ({ candidate, onClose }) => {
  if (!candidate) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-night-count border border-white/20 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-white/10">
          <div className="flex items-start gap-6">
            {candidate.image_url ? (
              <img src={candidate.image_url} alt={candidate.name} className="w-24 h-24 rounded-full object-cover border-4" style={{ borderColor: candidate.party_color }} />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
                <Users className="text-gray-400" size={40} />
              </div>
            )}
            <div className="flex-1">
              <h2 className="font-bebas text-3xl text-white tracking-wider">{candidate.name}</h2>
              <p className="text-lg" style={{ color: candidate.party_color }}>{candidate.party}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-gray-300 flex items-center gap-1">
                  <MapPin size={12} /> {candidate.constituency}
                </span>
                <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-gray-300 flex items-center gap-1">
                  <Building size={12} /> {candidate.district}
                </span>
                {candidate.is_incumbent && (
                  <span className="text-xs bg-marigold/20 text-marigold px-3 py-1 rounded-full flex items-center gap-1">
                    <Award size={12} /> Incumbent
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Bio */}
          {candidate.bio && (
            <div>
              <h3 className="font-bebas text-lg text-white tracking-wider mb-2 flex items-center gap-2">
                <Users size={18} className="text-marigold" /> BIOGRAPHY
              </h3>
              <p className="text-gray-300 font-inter text-sm leading-relaxed">{candidate.bio}</p>
            </div>
          )}

          {/* Election History */}
          {candidate.election_history && candidate.election_history.length > 0 && (
            <div>
              <h3 className="font-bebas text-lg text-white tracking-wider mb-3 flex items-center gap-2">
                <History size={18} className="text-rsp-blue" /> ELECTION HISTORY
              </h3>
              <div className="space-y-3">
                {candidate.election_history.map((election, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bebas text-white">{election.year} - {election.election_type}</p>
                        <p className="text-xs text-gray-400">{election.constituency}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bebas ${
                        election.result === "Won" ? "bg-congress-green/20 text-congress-green" : "bg-gorkhali-red/20 text-gorkhali-red"
                      }`}>
                        {election.result}
                      </span>
                    </div>
                    {election.votes && (
                      <p className="text-xs text-gray-500 mt-2">Votes: {election.votes.toLocaleString()}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
              <Calendar className="mx-auto text-marigold mb-2" size={24} />
              <p className="font-bebas text-xl text-white">{candidate.age || "N/A"}</p>
              <p className="text-xs text-gray-500">Age</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
              <TrendingUp className="mx-auto text-rsp-blue mb-2" size={24} />
              <p className="font-bebas text-xl text-white">{candidate.elections_contested || 0}</p>
              <p className="text-xs text-gray-500">Elections</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
              <Award className="mx-auto text-congress-green mb-2" size={24} />
              <p className="font-bebas text-xl text-white">{candidate.wins || 0}</p>
              <p className="text-xs text-gray-500">Wins</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Footer = () => (
  <footer className="bg-black py-12">
    <div className="max-w-6xl mx-auto px-4 text-center">
      <p className="text-gray-500 text-sm">© 2026 Nepali Ballot • Entertainment Only 🇳🇵</p>
    </div>
  </footer>
);

const ConstituenciesPage = () => {
  const [provinces, setProvinces] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [electionType, setElectionType] = useState("federal");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [provRes, constRes, candRes] = await Promise.all([
        axios.get(`${API}/provinces`),
        axios.get(`${API}/constituencies`),
        axios.get(`${API}/constituency-candidates`)
      ]);
      setProvinces(provRes.data);
      setConstituencies(constRes.data);
      setCandidates(candRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Get unique districts based on selected province
  const districts = [...new Set(
    constituencies
      .filter(c => selectedProvince === "all" || c.province_id === selectedProvince)
      .map(c => c.district)
  )].sort();

  // Filter constituencies
  const filteredConstituencies = constituencies.filter(c => {
    const matchesProvince = selectedProvince === "all" || c.province_id === selectedProvince;
    const matchesDistrict = selectedDistrict === "all" || c.district === selectedDistrict;
    const matchesType = c.type === electionType;
    const matchesSearch = !searchQuery || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProvince && matchesDistrict && matchesType && matchesSearch;
  });

  // Filter candidates
  const filteredCandidates = candidates.filter(c => {
    const matchesProvince = selectedProvince === "all" || c.province_id === selectedProvince;
    const matchesDistrict = selectedDistrict === "all" || c.district === selectedDistrict;
    const matchesSearch = !searchQuery || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.party.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProvince && matchesDistrict && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-night-count">
        <motion.div className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-20 h-20 border-4 border-gorkhali-red border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-bebas text-2xl text-white">LOADING CONSTITUENCIES</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night-count">
      <LiveTicker />

      {/* Hero */}
      <div className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gorkhali-red/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-congress-green/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}>
              <MapPin className="mx-auto mb-6 text-marigold" size={64} />
            </motion.div>
            <h1 className="font-bebas text-6xl sm:text-7xl text-white tracking-wider mb-4" style={{ textShadow: "0 0 60px rgba(247,127,0,0.5)" }}>
              CONSTITUENCIES
            </h1>
            <p className="font-playfair text-xl text-gray-300 italic">"Find candidates in your area"</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Filters */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-6 mb-8">
          <h2 className="font-bebas text-xl text-white tracking-wider mb-4 flex items-center gap-2">
            <Filter className="text-marigold" size={20} /> FILTERS
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Election Type */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Election Type</label>
              <Select value={electionType} onValueChange={setElectionType}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="federal">Federal (HoR)</SelectItem>
                  <SelectItem value="provincial">Provincial Assembly</SelectItem>
                  <SelectItem value="local">Local Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Province */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Province</label>
              <Select value={selectedProvince} onValueChange={(v) => { setSelectedProvince(v); setSelectedDistrict("all"); }}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="All Provinces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Provinces</SelectItem>
                  {provinces.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* District */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">District</label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {districts.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
            <span className="text-sm text-gray-400">
              <span className="text-white font-bebas">{filteredConstituencies.length}</span> constituencies
            </span>
            <span className="text-sm text-gray-400">
              <span className="text-white font-bebas">{filteredCandidates.length}</span> candidates
            </span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="constituencies" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="constituencies" className="font-bebas tracking-wider data-[state=active]:bg-gorkhali-red data-[state=active]:text-white">
              <MapPin className="mr-2" size={16} /> CONSTITUENCIES
            </TabsTrigger>
            <TabsTrigger value="candidates" className="font-bebas tracking-wider data-[state=active]:bg-gorkhali-red data-[state=active]:text-white">
              <Users className="mr-2" size={16} /> CANDIDATES
            </TabsTrigger>
          </TabsList>

          <TabsContent value="constituencies">
            {filteredConstituencies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredConstituencies.map((constituency, index) => (
                  <motion.div
                    key={constituency.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <ConstituencyCard constituency={constituency} onClick={() => {}} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <MapPin className="mx-auto text-gray-500 mb-4" size={48} />
                <p className="text-gray-400">No constituencies found. Try adjusting your filters.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="candidates">
            {filteredCandidates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCandidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <CandidateCard candidate={candidate} onClick={() => setSelectedCandidate(candidate)} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="mx-auto text-gray-500 mb-4" size={48} />
                <p className="text-gray-400">No candidates found. Try adjusting your filters.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Info Box */}
        <div className="mt-12 bg-marigold/10 border border-marigold/30 rounded-lg p-6">
          <h3 className="font-bebas text-xl text-marigold tracking-wider mb-2">📊 ABOUT NEPAL'S ELECTORAL SYSTEM</h3>
          <ul className="text-gray-300 text-sm space-y-2 font-inter">
            <li>• <strong>Federal (HoR):</strong> 275 seats (165 FPTP + 110 PR)</li>
            <li>• <strong>Provincial:</strong> 550 seats across 7 provinces</li>
            <li>• <strong>Local:</strong> 753 local units (municipalities & rural municipalities)</li>
          </ul>
        </div>
      </div>

      {/* Candidate Detail Modal */}
      <AnimatePresence>
        {selectedCandidate && (
          <CandidateDetailModal 
            candidate={selectedCandidate} 
            onClose={() => setSelectedCandidate(null)} 
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default ConstituenciesPage;
