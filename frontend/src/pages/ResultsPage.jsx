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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { RefreshCw, Trophy, Users, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ResultsPage = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchResults();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchResults, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchResults = async (showToast = false) => {
    try {
      setRefreshing(true);
      const response = await axios.get(`${API}/results`);
      setResults(response.data);
      setLastUpdated(new Date());
      if (showToast) {
        toast.success("Results refreshed!");
      }
    } catch (error) {
      toast.error("Failed to load results");
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatTime = (date) => {
    return date?.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rice-paper">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="font-inter text-peace-blue">Loading results...</p>
        </div>
      </div>
    );
  }

  const winner = results?.results?.[0];
  const chartData = results?.results?.map((r) => ({
    name: r.candidate_name.split(" ")[0],
    votes: r.vote_count,
    percentage: r.percentage,
    fill: r.party_color,
  })) || [];

  return (
    <div className="min-h-screen bg-night-count">
      {/* Header */}
      <div className="bg-peace-blue py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="font-bebas text-4xl text-white tracking-wider" data-testid="results-heading">
                LIVE ELECTION RESULTS
              </h1>
              <p className="font-inter text-gray-300 text-sm mt-1">
                Prime Minister Election Simulation
              </p>
            </motion.div>
            
            <div className="flex items-center gap-4">
              <div className="text-right text-white">
                <p className="font-inter text-xs text-gray-400">Last updated</p>
                <p className="font-bebas tracking-wider flex items-center gap-2">
                  <Clock size={14} />
                  {formatTime(lastUpdated)}
                </p>
              </div>
              <Button
                onClick={() => fetchResults(true)}
                disabled={refreshing}
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-peace-blue"
                data-testid="refresh-btn"
              >
                <RefreshCw className={`mr-2 ${refreshing ? "animate-spin" : ""}`} size={16} />
                REFRESH
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur border border-white/10 p-6 rounded-sm"
            data-testid="total-votes-card"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gorkhali-red/20 rounded-full flex items-center justify-center">
                <Users className="text-gorkhali-red" size={24} />
              </div>
              <div>
                <p className="font-inter text-gray-400 text-sm">Total Votes</p>
                <p className="font-bebas text-3xl text-white tracking-wider">
                  {results?.total_votes?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur border border-white/10 p-6 rounded-sm"
            data-testid="leading-candidate-card"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-marigold/20 rounded-full flex items-center justify-center">
                <Trophy className="text-marigold" size={24} />
              </div>
              <div>
                <p className="font-inter text-gray-400 text-sm">Leading Candidate</p>
                <p className="font-bebas text-xl text-white tracking-wider">
                  {winner?.candidate_name || "No votes yet"}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur border border-white/10 p-6 rounded-sm"
            data-testid="lead-percentage-card"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rsp-blue/20 rounded-full flex items-center justify-center">
                <TrendingUp className="text-rsp-blue" size={24} />
              </div>
              <div>
                <p className="font-inter text-gray-400 text-sm">Lead Percentage</p>
                <p className="font-bebas text-3xl text-white tracking-wider">
                  {winner?.percentage || 0}%
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vote Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-sm p-6"
            data-testid="vote-distribution-section"
          >
            <h2 className="font-bebas text-2xl text-peace-blue tracking-wider mb-6">
              VOTE DISTRIBUTION
            </h2>
            
            <div className="space-y-4">
              {results?.results?.map((result, index) => (
                <motion.div
                  key={result.candidate_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                  data-testid={`result-${result.candidate_id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {index === 0 && results.total_votes > 0 && (
                        <span className="winner-badge">LEADING</span>
                      )}
                      <span className="font-bebas text-lg text-peace-blue">
                        {result.candidate_name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bebas text-lg text-peace-blue">
                        {result.percentage}%
                      </span>
                      <span className="font-inter text-sm text-gray-500 ml-2">
                        ({result.vote_count} votes)
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={result.percentage}
                    className="h-3"
                    style={{
                      "--progress-background": result.party_color,
                    }}
                  />
                  <p className="font-inter text-xs text-gray-500 mt-1">
                    {result.party}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-sm p-6"
            data-testid="bar-chart-section"
          >
            <h2 className="font-bebas text-2xl text-peace-blue tracking-wider mb-6">
              VOTES BY CANDIDATE
            </h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontFamily: "Inter", fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontFamily: "Bebas Neue", fontSize: 14 }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    fontFamily: "Inter",
                    borderRadius: "4px",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-sm p-6 lg:col-span-2"
            data-testid="pie-chart-section"
          >
            <h2 className="font-bebas text-2xl text-peace-blue tracking-wider mb-6">
              VOTE SHARE
            </h2>
            
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  innerRadius={60}
                  dataKey="votes"
                  nameKey="name"
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    fontFamily: "Inter",
                    borderRadius: "4px",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ fontFamily: "Inter", color: "#003049" }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* No Votes Message */}
        {results?.total_votes === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="font-playfair text-xl text-gray-400 italic">
              No votes have been cast yet. Be the first to vote!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
