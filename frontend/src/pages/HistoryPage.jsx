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
} from "recharts";
import { Calendar, Users, TrendingUp, ChevronDown } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState(null);

  useEffect(() => {
    fetchHistoricalData();
  }, []);

  const fetchHistoricalData = async () => {
    try {
      const response = await axios.get(`${API}/historical`);
      setHistoricalData(response.data);
      if (response.data.length > 0) {
        setSelectedElection(response.data[0]);
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

      {/* Nepal Political Timeline */}
      <section className="py-16 px-4 bg-white" data-testid="timeline-section">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bebas text-3xl text-peace-blue tracking-wider mb-8 text-center">
            NEPAL'S DEMOCRATIC JOURNEY
          </h2>
          
          <div className="space-y-8">
            {[
              {
                year: "1951",
                title: "End of Rana Rule",
                description: "The autocratic Rana regime ends, marking the beginning of democracy in Nepal.",
              },
              {
                year: "1990",
                title: "Jana Andolan I",
                description: "The People's Movement restores multiparty democracy after 30 years of Panchayat system.",
              },
              {
                year: "1996-2006",
                title: "Maoist Insurgency",
                description: "A decade-long civil war that claimed over 17,000 lives and reshaped Nepal's politics.",
              },
              {
                year: "2006",
                title: "Jana Andolan II",
                description: "The second People's Movement ends the direct rule of King Gyanendra.",
              },
              {
                year: "2008",
                title: "Republic Declared",
                description: "Nepal becomes a Federal Democratic Republic, ending 240 years of monarchy.",
              },
              {
                year: "2015",
                title: "New Constitution",
                description: "Nepal adopts a new constitution establishing a federal system with 7 provinces.",
              },
              {
                year: "2022",
                title: "New Political Wave",
                description: "Rise of independent candidates like Balen Shah signals a shift in Nepali politics.",
              },
            ].map((event, index) => (
              <motion.div
                key={event.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex gap-6"
              >
                <div className="flex-shrink-0 w-20">
                  <span className="font-bebas text-2xl text-gorkhali-red">
                    {event.year}
                  </span>
                </div>
                <div className="flex-1 border-l-4 border-gorkhali-red pl-6 pb-4">
                  <h3 className="font-bebas text-xl text-peace-blue tracking-wider mb-2">
                    {event.title}
                  </h3>
                  <p className="font-inter text-gray-600">{event.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Historical Election Data */}
      <section className="py-16 px-4" data-testid="election-data-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bebas text-3xl text-peace-blue tracking-wider mb-8 text-center">
            PAST ELECTION RESULTS
          </h2>

          {/* Election Selector */}
          <div className="mb-8 max-w-xs mx-auto">
            <Select
              value={selectedElection?.id}
              onValueChange={(value) => {
                const election = historicalData.find((e) => e.id === value);
                setSelectedElection(election);
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
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white border border-gray-200 p-6 rounded-sm" data-testid="election-year-card">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-gorkhali-red" size={24} />
                    <div>
                      <p className="font-inter text-sm text-gray-500">Election Year</p>
                      <p className="font-bebas text-2xl text-peace-blue">
                        {selectedElection.year}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 p-6 rounded-sm" data-testid="total-voters-card">
                  <div className="flex items-center gap-3">
                    <Users className="text-congress-green" size={24} />
                    <div>
                      <p className="font-inter text-sm text-gray-500">Total Voters</p>
                      <p className="font-bebas text-2xl text-peace-blue">
                        {selectedElection.total_voters.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 p-6 rounded-sm" data-testid="turnout-card">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="text-rsp-blue" size={24} />
                    <div>
                      <p className="font-inter text-sm text-gray-500">Voter Turnout</p>
                      <p className="font-bebas text-2xl text-peace-blue">
                        {selectedElection.turnout_percentage}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white border border-gray-200 p-6 rounded-sm" data-testid="historical-chart">
                <h3 className="font-bebas text-xl text-peace-blue tracking-wider mb-6">
                  {selectedElection.election_type} - SEATS WON
                </h3>
                
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={selectedElection.results}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      tick={{ fontFamily: "Inter", fontSize: 12 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="party"
                      tick={{ fontFamily: "Inter", fontSize: 12 }}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        fontFamily: "Inter",
                        borderRadius: "4px",
                        border: "1px solid #e2e8f0",
                      }}
                      formatter={(value, name) => [
                        name === "seats" ? `${value} seats` : `${value}%`,
                        name === "seats" ? "Seats" : "Vote Share",
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey="seats"
                      name="Seats"
                      fill="#D90429"
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="vote_share"
                      name="Vote Share %"
                      fill="#003049"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Results Table */}
              <div className="mt-8 bg-white border border-gray-200 rounded-sm overflow-hidden" data-testid="results-table">
                <table className="w-full">
                  <thead className="bg-peace-blue text-white">
                    <tr>
                      <th className="font-bebas tracking-wider text-left px-6 py-4">
                        PARTY
                      </th>
                      <th className="font-bebas tracking-wider text-center px-6 py-4">
                        SEATS
                      </th>
                      <th className="font-bebas tracking-wider text-center px-6 py-4">
                        VOTE SHARE
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedElection.results.map((result, index) => (
                      <tr
                        key={result.party}
                        className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: result.color }}
                            />
                            <span className="font-inter">{result.party}</span>
                          </div>
                        </td>
                        <td className="font-bebas text-xl text-center px-6 py-4">
                          {result.seats}
                        </td>
                        <td className="font-inter text-center px-6 py-4">
                          {result.vote_share}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Context Section */}
      <section className="py-16 px-4 bg-peace-blue" data-testid="context-section">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-bebas text-3xl text-white tracking-wider mb-6">
            UNDERSTANDING NEPAL'S POLITICAL LANDSCAPE
          </h2>
          <p className="font-playfair text-lg text-gray-300 mb-8">
            Nepal's politics is characterized by coalition governments, frequent power shifts,
            and a multi-party system where no single party has dominated consistently.
            The rise of new parties like RSP (Rastriya Swatantra Party) in 2022 signals
            a growing demand for change and anti-corruption governance.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            <div className="bg-white/10 backdrop-blur p-6 rounded-sm">
              <h3 className="font-bebas text-xl text-marigold tracking-wider mb-3">
                MAJOR PARTIES
              </h3>
              <ul className="font-inter text-gray-300 space-y-2 text-sm">
                <li>• <strong>Nepali Congress (NC)</strong> - Center-left, democratic socialism</li>
                <li>• <strong>CPN-UML</strong> - Communist, Marxist-Leninist</li>
                <li>• <strong>CPN-Maoist Centre</strong> - Communist, former rebel party</li>
                <li>• <strong>RSP</strong> - New populist party, anti-corruption focus</li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur p-6 rounded-sm">
              <h3 className="font-bebas text-xl text-marigold tracking-wider mb-3">
                ELECTORAL SYSTEM
              </h3>
              <ul className="font-inter text-gray-300 space-y-2 text-sm">
                <li>• Mixed electoral system (FPTP + PR)</li>
                <li>• 275 seats in Federal Parliament</li>
                <li>• 165 FPTP + 110 Proportional</li>
                <li>• President elected by electoral college</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HistoryPage;
