import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Calendar, Users, TrendingUp, MapPin, Vote, Award } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HistoryPage = () => {
  const [historicalData, setHistoricalData] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [histRes, provRes] = await Promise.all([
        axios.get(`${API}/historical`),
        axios.get(`${API}/provinces`),
      ]);
      setHistoricalData(histRes.data);
      setProvinces(provRes.data);
      if (histRes.data.length > 0) {
        setSelectedElection(histRes.data[0]);
      }
    } catch (error) {
      toast.error("Failed to load historical data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rice-paper">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="font-inter text-peace-blue">Loading historical data...</p>
        </div>
      </div>
    );
  }

  const pieData = selectedElection?.results?.map(r => ({
    name: r.party,
    value: r.seats,
    fill: r.color
  })) || [];

  return (
    <div className="min-h-screen bg-rice-paper">
      {/* Header */}
      <div
        className="relative py-20 px-4 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.pexels.com/photos/17885061/pexels-photo-17885061.jpeg')`,
        }}
      >
        <div className="absolute inset-0 bg-peace-blue/80" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-bebas text-4xl sm:text-5xl text-white tracking-wider mb-4"
            data-testid="history-heading"
          >
            ELECTION HISTORY
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-playfair text-xl text-gray-200 italic"
          >
            "Those who cannot remember the past are condemned to repeat it"
          </motion.p>
        </div>
      </div>

      {/* Nepal's 7 Provinces */}
      <section className="py-12 px-4 bg-white" data-testid="provinces-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bebas text-3xl text-peace-blue tracking-wider mb-8 text-center">
            NEPAL'S 7 FEDERAL PROVINCES
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {provinces.map((province, idx) => (
              <motion.div
                key={province.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-rice-paper border border-gray-200 p-4 rounded-sm"
                data-testid={`province-${province.id}`}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="text-gorkhali-red flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="font-bebas text-lg text-peace-blue tracking-wider">
                      {province.name}
                    </h3>
                    <p className="font-inter text-sm text-gray-600">
                      Capital: {province.capital}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>Federal: {province.federal_seats} seats</span>
                      <span>Provincial: {province.provincial_seats} seats</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nepal Political Timeline */}
      <section className="py-16 px-4 bg-rice-paper" data-testid="timeline-section">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bebas text-3xl text-peace-blue tracking-wider mb-8 text-center">
            NEPAL'S DEMOCRATIC JOURNEY
          </h2>
          
          <div className="space-y-6">
            {[
              { year: "1951", title: "End of Rana Rule", description: "The autocratic Rana regime ends, marking the beginning of democracy in Nepal." },
              { year: "1990", title: "Jana Andolan I", description: "The People's Movement restores multiparty democracy after 30 years of Panchayat system." },
              { year: "1996-2006", title: "Maoist Insurgency", description: "A decade-long civil war that claimed over 17,000 lives and reshaped Nepal's politics." },
              { year: "2006", title: "Jana Andolan II", description: "The second People's Movement ends the direct rule of King Gyanendra." },
              { year: "2008", title: "Republic Declared", description: "Nepal becomes a Federal Democratic Republic, ending 240 years of monarchy." },
              { year: "2015", title: "New Constitution", description: "Nepal adopts a new constitution establishing a federal system with 7 provinces." },
              { year: "2017", title: "First Federal Election", description: "Historic first elections under the new federal structure. Left Alliance wins majority." },
              { year: "2022", title: "Second Federal Election", description: "Rise of RSP party. Balen Shah wins Kathmandu Mayor as independent candidate." },
            ].map((event, index) => (
              <motion.div
                key={event.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex gap-6"
              >
                <div className="flex-shrink-0 w-24">
                  <span className="font-bebas text-xl text-gorkhali-red">{event.year}</span>
                </div>
                <div className="flex-1 border-l-4 border-gorkhali-red pl-6 pb-4">
                  <h3 className="font-bebas text-xl text-peace-blue tracking-wider mb-2">{event.title}</h3>
                  <p className="font-inter text-gray-600 text-sm">{event.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Historical Election Data */}
      <section className="py-16 px-4 bg-white" data-testid="election-data-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bebas text-3xl text-peace-blue tracking-wider mb-8 text-center">
            PAST ELECTION RESULTS
          </h2>

          {/* Election Selector */}
          <div className="mb-8 max-w-md mx-auto">
            <Select
              value={selectedElection?.id}
              onValueChange={(value) => {
                const election = historicalData.find((e) => e.id === value);
                setSelectedElection(election);
                setActiveTab("overview");
              }}
            >
              <SelectTrigger className="font-inter" data-testid="election-selector">
                <SelectValue placeholder="Select an election" />
              </SelectTrigger>
              <SelectContent>
                {historicalData.map((election) => (
                  <SelectItem key={election.id} value={election.id}>
                    {election.year} - {election.election_type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedElection && (
            <motion.div
              key={selectedElection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Election Description */}
              {selectedElection.description && (
                <div className="mb-6 text-center">
                  <p className="font-playfair text-lg text-gray-600 italic">
                    "{selectedElection.description}"
                  </p>
                  {selectedElection.notable && (
                    <p className="font-inter text-sm text-marigold mt-2">
                      <Award className="inline mr-1" size={16} />
                      {selectedElection.notable}
                    </p>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-rice-paper border border-gray-200 p-4 rounded-sm" data-testid="election-year-card">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-gorkhali-red" size={20} />
                    <div>
                      <p className="font-inter text-xs text-gray-500">Year</p>
                      <p className="font-bebas text-xl text-peace-blue">{selectedElection.year}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-rice-paper border border-gray-200 p-4 rounded-sm" data-testid="total-seats-card">
                  <div className="flex items-center gap-3">
                    <Vote className="text-congress-green" size={20} />
                    <div>
                      <p className="font-inter text-xs text-gray-500">Total Seats</p>
                      <p className="font-bebas text-xl text-peace-blue">{selectedElection.total_seats}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-rice-paper border border-gray-200 p-4 rounded-sm" data-testid="total-voters-card">
                  <div className="flex items-center gap-3">
                    <Users className="text-rsp-blue" size={20} />
                    <div>
                      <p className="font-inter text-xs text-gray-500">Voters</p>
                      <p className="font-bebas text-xl text-peace-blue">
                        {(selectedElection.total_voters / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-rice-paper border border-gray-200 p-4 rounded-sm" data-testid="turnout-card">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="text-marigold" size={20} />
                    <div>
                      <p className="font-inter text-xs text-gray-500">Turnout</p>
                      <p className="font-bebas text-xl text-peace-blue">{selectedElection.turnout_percentage}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs for different views */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
                  <TabsTrigger value="overview" className="font-bebas tracking-wider">OVERVIEW</TabsTrigger>
                  <TabsTrigger value="chart" className="font-bebas tracking-wider">CHARTS</TabsTrigger>
                  {selectedElection.by_province && (
                    <TabsTrigger value="province" className="font-bebas tracking-wider">BY PROVINCE</TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  {/* Results Table */}
                  <div className="bg-rice-paper border border-gray-200 rounded-sm overflow-hidden" data-testid="results-table">
                    <table className="w-full">
                      <thead className="bg-peace-blue text-white">
                        <tr>
                          <th className="font-bebas tracking-wider text-left px-4 py-3">PARTY</th>
                          <th className="font-bebas tracking-wider text-center px-4 py-3">SEATS</th>
                          <th className="font-bebas tracking-wider text-center px-4 py-3">VOTE %</th>
                          <th className="font-bebas tracking-wider text-center px-4 py-3 hidden sm:table-cell">SEAT %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedElection.results.map((result, index) => (
                          <tr
                            key={result.party}
                            className={index % 2 === 0 ? "bg-white" : "bg-rice-paper"}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: result.color }}
                                />
                                <span className="font-inter text-sm">{result.party}</span>
                              </div>
                            </td>
                            <td className="font-bebas text-lg text-center px-4 py-3">{result.seats}</td>
                            <td className="font-inter text-center px-4 py-3">{result.vote_share}%</td>
                            <td className="font-inter text-center px-4 py-3 hidden sm:table-cell">
                              {((result.seats / selectedElection.total_seats) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="chart" className="mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar Chart */}
                    <div className="bg-rice-paper border border-gray-200 p-4 rounded-sm" data-testid="bar-chart">
                      <h3 className="font-bebas text-lg text-peace-blue tracking-wider mb-4">SEATS WON</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={selectedElection.results} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis type="number" tick={{ fontFamily: "Inter", fontSize: 11 }} />
                          <YAxis
                            type="category"
                            dataKey="party"
                            tick={{ fontFamily: "Inter", fontSize: 10 }}
                            width={100}
                          />
                          <Tooltip contentStyle={{ fontFamily: "Inter", fontSize: 12 }} />
                          <Bar dataKey="seats" radius={[0, 4, 4, 0]}>
                            {selectedElection.results.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-rice-paper border border-gray-200 p-4 rounded-sm" data-testid="pie-chart">
                      <h3 className="font-bebas text-lg text-peace-blue tracking-wider mb-4">SEAT SHARE</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            innerRadius={50}
                            dataKey="value"
                            label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ fontFamily: "Inter", fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </TabsContent>

                {selectedElection.by_province && (
                  <TabsContent value="province" className="mt-6">
                    <div className="bg-rice-paper border border-gray-200 rounded-sm overflow-hidden" data-testid="province-results">
                      <table className="w-full">
                        <thead className="bg-peace-blue text-white">
                          <tr>
                            <th className="font-bebas tracking-wider text-left px-4 py-3">PROVINCE</th>
                            <th className="font-bebas tracking-wider text-center px-4 py-3">WINNER</th>
                            <th className="font-bebas tracking-wider text-center px-4 py-3 hidden sm:table-cell">UML</th>
                            <th className="font-bebas tracking-wider text-center px-4 py-3 hidden sm:table-cell">NC</th>
                            <th className="font-bebas tracking-wider text-center px-4 py-3 hidden sm:table-cell">OTHERS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedElection.by_province.map((prov, index) => (
                            <tr
                              key={prov.province}
                              className={index % 2 === 0 ? "bg-white" : "bg-rice-paper"}
                            >
                              <td className="px-4 py-3 font-inter text-sm">{prov.province}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`font-bebas text-sm px-2 py-1 rounded ${
                                  prov.winner.includes("UML") ? "bg-communist-red/10 text-communist-red" :
                                  prov.winner.includes("Congress") ? "bg-congress-green/10 text-congress-green" :
                                  "bg-marigold/10 text-marigold"
                                }`}>
                                  {prov.winner}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center font-inter text-sm hidden sm:table-cell">
                                {prov.seats_uml || "-"}
                              </td>
                              <td className="px-4 py-3 text-center font-inter text-sm hidden sm:table-cell">
                                {prov.seats_congress || "-"}
                              </td>
                              <td className="px-4 py-3 text-center font-inter text-sm hidden sm:table-cell">
                                {prov.seats_others || prov.seats_rsp || prov.seats_jsp || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </motion.div>
          )}
        </div>
      </section>

      {/* Political Parties Info */}
      <section className="py-16 px-4 bg-peace-blue" data-testid="parties-section">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-bebas text-3xl text-white tracking-wider mb-6">
            MAJOR POLITICAL PARTIES
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="bg-white/10 backdrop-blur p-5 rounded-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full bg-communist-red" />
                <h3 className="font-bebas text-lg text-white tracking-wider">CPN-UML</h3>
              </div>
              <p className="font-inter text-sm text-gray-300">
                Communist Party of Nepal (Unified Marxist-Leninist). Founded 1991. Symbol: Sun.
                Current Chairman: KP Sharma Oli.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur p-5 rounded-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full bg-congress-green" />
                <h3 className="font-bebas text-lg text-white tracking-wider">NEPALI CONGRESS</h3>
              </div>
              <p className="font-inter text-sm text-gray-300">
                Nepal's oldest democratic party. Founded 1947. Symbol: Tree.
                Current President: Sher Bahadur Deuba.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur p-5 rounded-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full bg-[#B91C1C]" />
                <h3 className="font-bebas text-lg text-white tracking-wider">CPN-MAOIST CENTRE</h3>
              </div>
              <p className="font-inter text-sm text-gray-300">
                Former rebel party, now mainstream. Founded 1994. Symbol: Hammer.
                Current Chairman: Pushpa Kamal Dahal (Prachanda).
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur p-5 rounded-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full bg-rsp-blue" />
                <h3 className="font-bebas text-lg text-white tracking-wider">RSP (SWATANTRA)</h3>
              </div>
              <p className="font-inter text-sm text-gray-300">
                Rastriya Swatantra Party. Founded 2022. Symbol: Bell.
                Founder: Rabi Lamichhane. Anti-corruption focus.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HistoryPage;
