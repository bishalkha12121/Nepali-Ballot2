import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Calendar, Users, TrendingUp, MapPin, Vote, Award, Star, Sparkles, Zap, Globe, History, Crown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UMLSunIcon, CongressTreeIcon, MaoistHammerIcon, RSPBellIcon } from "../components/PartyIcons";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const IMAGES = {
  hero: "https://images.unsplash.com/photo-1764140608148-80e010804af8?w=1920&q=80",
  temple: "https://images.unsplash.com/photo-1665394183024-7a95b156d427?w=800&q=80",
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

const LiveTicker = () => (
  <div className="bg-gradient-to-r from-gorkhali-red via-peace-blue to-gorkhali-red py-3 overflow-hidden">
    <motion.div className="flex whitespace-nowrap" animate={{ x: [0, -1500] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
      {[...Array(4)].map((_, i) => (
        <span key={i} className="mx-8 text-white font-bebas tracking-wider text-sm">
          📊 ELECTION HISTORY • 2017 & 2022 DATA • ALL 7 PROVINCES • FEDERAL & LOCAL ELECTIONS • <span className="text-marigold">★</span>
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

const HistoryPage = () => {
  const [historicalData, setHistoricalData] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [histRes, provRes] = await Promise.all([axios.get(`${API}/historical`), axios.get(`${API}/provinces`)]);
        setHistoricalData(histRes.data);
        setProvinces(provRes.data);
        if (histRes.data.length > 0) setSelectedElection(histRes.data[0]);
      } catch (e) { toast.error("Failed to load data"); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-night-count">
      <motion.div className="text-center"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-20 h-20 border-4 border-gorkhali-red border-t-transparent rounded-full mx-auto mb-4" /><p className="font-bebas text-2xl text-white">LOADING HISTORY</p></motion.div>
    </div>
  );

  const pieData = selectedElection?.results?.map(r => ({ name: r.party, value: r.seats, fill: r.color })) || [];

  return (
    <div className="min-h-screen bg-night-count">
      <LiveTicker />
      
      {/* Hero */}
      <div className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0"><img src={IMAGES.hero} alt="Nepal" className="w-full h-full object-cover opacity-30" /><div className="absolute inset-0 bg-gradient-to-b from-night-count via-night-count/90 to-night-count" /></div>
        <div className="absolute inset-0"><div className="absolute top-10 left-10 w-72 h-72 bg-marigold/20 rounded-full blur-3xl animate-pulse" /><div className="absolute bottom-10 right-10 w-72 h-72 bg-rsp-blue/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} /></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}><History className="mx-auto mb-6 text-marigold" size={64} /></motion.div>
            <h1 className="font-bebas text-6xl sm:text-7xl text-white tracking-wider mb-4" style={{ textShadow: "0 0 60px rgba(247,127,0,0.5)" }}>ELECTION HISTORY</h1>
            <p className="font-playfair text-xl text-gray-300 italic">"Those who cannot remember the past are condemned to repeat it"</p>
          </motion.div>
        </div>
      </div>

      {/* Provinces */}
      <section className="py-16 px-4 bg-rice-paper relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23003049'/%3E%3C/svg%3E")`, backgroundSize: "30px 30px" }} />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-10">
            <span className="text-gorkhali-red font-bebas tracking-widest text-sm">🏔️ NEPAL'S FEDERAL STRUCTURE</span>
            <h2 className="font-bebas text-4xl text-peace-blue tracking-wider mt-2">7 PROVINCES</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gorkhali-red to-marigold mx-auto mt-4" />
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {provinces.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -5, scale: 1.02 }} className="bg-white border border-gray-200 p-4 rounded-sm shadow-sm hover:shadow-lg transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <MapPin className="text-gorkhali-red flex-shrink-0 mt-1" size={18} />
                  <div>
                    <h3 className="font-bebas text-lg text-peace-blue tracking-wider">{p.name}</h3>
                    <p className="font-inter text-xs text-gray-500">Capital: {p.capital}</p>
                    <div className="flex gap-3 mt-2 text-xs text-gray-400"><span>{p.federal_seats} Fed</span><span>{p.provincial_seats} Prov</span></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ad */}
      <div className="bg-peace-blue py-8 flex justify-center"><AdBanner type="horizontal" id="history-mid" /></div>

      {/* Timeline */}
      <section className="py-16 px-4 bg-night-count">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-10">
            <span className="text-marigold font-bebas tracking-widest text-sm">★ DEMOCRATIC JOURNEY ★</span>
            <h2 className="font-bebas text-4xl text-white tracking-wider mt-2">NEPAL'S PATH TO DEMOCRACY</h2>
          </motion.div>
          <div className="space-y-6">
            {[{ year: "1951", title: "End of Rana Rule", desc: "Beginning of democracy" },
              { year: "1990", title: "Jana Andolan I", desc: "Multiparty democracy restored" },
              { year: "2006", title: "Jana Andolan II", desc: "End of monarchy" },
              { year: "2008", title: "Republic Declared", desc: "World's newest republic" },
              { year: "2015", title: "New Constitution", desc: "Federal system with 7 provinces" },
              { year: "2022", title: "New Wave Politics", desc: "Rise of Balen Shah & RSP" }
            ].map((e, i) => (
              <motion.div key={e.year} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} className="flex gap-6">
                <div className="flex-shrink-0 w-20"><span className="font-bebas text-2xl text-marigold">{e.year}</span></div>
                <div className="flex-1 border-l-4 border-marigold pl-6 pb-4">
                  <h3 className="font-bebas text-xl text-white tracking-wider mb-1">{e.title}</h3>
                  <p className="font-inter text-gray-400 text-sm">{e.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Election Data */}
      <section className="py-16 px-4 bg-rice-paper">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-8">
                <h2 className="font-bebas text-4xl text-peace-blue tracking-wider">PAST ELECTION RESULTS</h2>
              </motion.div>

              <div className="mb-8 max-w-md mx-auto">
                <Select value={selectedElection?.id} onValueChange={(v) => { setSelectedElection(historicalData.find(e => e.id === v)); setActiveTab("overview"); }}>
                  <SelectTrigger className="font-inter bg-white"><SelectValue placeholder="Select election" /></SelectTrigger>
                  <SelectContent>{historicalData.map(e => <SelectItem key={e.id} value={e.id}>{e.year} - {e.election_type}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {selectedElection && (
                <motion.div key={selectedElection.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  {selectedElection.description && <p className="font-playfair text-lg text-gray-600 italic text-center mb-6">"{selectedElection.description}"</p>}
                  {selectedElection.notable && <p className="text-center text-sm text-marigold mb-6"><Award className="inline mr-1" size={16} />{selectedElection.notable}</p>}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[{ icon: Calendar, label: "Year", value: selectedElection.year, color: "gorkhali-red" },
                      { icon: Vote, label: "Seats", value: selectedElection.total_seats, color: "congress-green" },
                      { icon: Users, label: "Voters", value: `${(selectedElection.total_voters / 1000000).toFixed(1)}M`, color: "rsp-blue" },
                      { icon: TrendingUp, label: "Turnout", value: `${selectedElection.turnout_percentage}%`, color: "marigold" }
                    ].map((s, i) => (
                      <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white border border-gray-200 p-4 rounded-sm shadow-sm">
                        <div className="flex items-center gap-3"><s.icon className={`text-${s.color}`} size={20} /><div><p className="text-xs text-gray-500">{s.label}</p><p className="font-bebas text-xl text-peace-blue">{s.value}</p></div></div>
                      </motion.div>
                    ))}
                  </div>

                  <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                    <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                      <TabsTrigger value="overview" className="font-bebas tracking-wider">RESULTS</TabsTrigger>
                      <TabsTrigger value="chart" className="font-bebas tracking-wider">CHARTS</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-lg">
                        <table className="w-full">
                          <thead className="bg-peace-blue text-white"><tr><th className="font-bebas tracking-wider text-left px-4 py-3">PARTY</th><th className="font-bebas tracking-wider text-center px-4 py-3">SEATS</th><th className="font-bebas tracking-wider text-center px-4 py-3">VOTE %</th></tr></thead>
                          <tbody>
                            {selectedElection.results.map((r, i) => (
                              <tr key={r.party} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} /><span className="font-inter text-sm">{r.party}</span>{i === 0 && <Crown className="text-marigold" size={14} />}</div></td>
                                <td className="font-bebas text-lg text-center px-4 py-3">{r.seats}</td>
                                <td className="font-inter text-center px-4 py-3">{r.vote_share}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>

                    <TabsContent value="chart" className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-gray-200 p-4 rounded-sm shadow-lg">
                          <h3 className="font-bebas text-lg text-peace-blue mb-4">SEATS WON</h3>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={selectedElection.results} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis type="category" dataKey="party" tick={{ fontSize: 10 }} width={100} /><Tooltip /><Bar dataKey="seats" radius={[0, 4, 4, 0]}>{selectedElection.results.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar></BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="bg-white border border-gray-200 p-4 rounded-sm shadow-lg">
                          <h3 className="font-bebas text-lg text-peace-blue mb-4">SEAT SHARE</h3>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value" label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`} labelLine={false}>{pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Pie><Tooltip /></PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <AdBanner type="rectangle" id="history-1" />
              <div className="bg-white border border-gray-200 p-4 rounded-sm shadow-sm">
                <h3 className="font-bebas text-lg text-peace-blue mb-3 flex items-center gap-2"><Globe className="text-rsp-blue" size={18} />MAJOR PARTIES</h3>
                <ul className="space-y-3 text-sm text-gray-600 font-inter">
                  <li className="flex items-center gap-3"><UMLSunIcon size={20} className="text-communist-red" /><span>CPN-UML</span></li>
                  <li className="flex items-center gap-3"><CongressTreeIcon size={20} className="text-congress-green" /><span>Nepali Congress</span></li>
                  <li className="flex items-center gap-3"><MaoistHammerIcon size={20} className="text-[#B91C1C]" /><span>Maoist Centre</span></li>
                  <li className="flex items-center gap-3"><RSPBellIcon size={20} className="text-rsp-blue" /><span>RSP (New)</span></li>
                </ul>
              </div>
              <AdBanner type="rectangle" id="history-2" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HistoryPage;
