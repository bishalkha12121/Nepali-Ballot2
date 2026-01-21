import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { Trophy, Clock, Calendar, Tv, Star, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// League configurations with colors
const LEAGUES = [
  { id: "PL", name: "Premier League", country: "England", color: "#3D195B", logo: "⚽" },
  { id: "PD", name: "La Liga", country: "Spain", color: "#EE8707", logo: "🇪🇸" },
  { id: "BL1", name: "Bundesliga", country: "Germany", color: "#D20515", logo: "🇩🇪" },
  { id: "SA", name: "Serie A", country: "Italy", color: "#024494", logo: "🇮🇹" },
  { id: "FL1", name: "Ligue 1", country: "France", color: "#091C3E", logo: "🇫🇷" },
  { id: "CL", name: "Champions League", country: "Europe", color: "#0E1E5B", logo: "🏆" },
];

const MatchCard = ({ match }) => {
  const isLive = match.status === "LIVE" || match.status === "IN_PLAY";
  const isFinished = match.status === "FINISHED";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/5 backdrop-blur border rounded-lg p-4 ${
        isLive ? "border-gorkhali-red animate-pulse" : "border-white/10"
      }`}
    >
      {/* Match Status */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-bebas tracking-wider px-2 py-1 rounded ${
          isLive ? "bg-gorkhali-red text-white" : isFinished ? "bg-white/10 text-gray-400" : "bg-rsp-blue/20 text-rsp-blue"
        }`}>
          {isLive ? "🔴 LIVE" : isFinished ? "FT" : match.time || "Upcoming"}
        </span>
        <span className="text-xs text-gray-500">{match.date}</span>
      </div>
      
      {/* Teams */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{match.homeTeamCrest || "⚽"}</span>
            <span className="text-white font-inter text-sm">{match.homeTeam}</span>
          </div>
          <span className={`font-bebas text-xl ${isLive ? "text-marigold" : "text-white"}`}>
            {match.homeScore ?? "-"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{match.awayTeamCrest || "⚽"}</span>
            <span className="text-white font-inter text-sm">{match.awayTeam}</span>
          </div>
          <span className={`font-bebas text-xl ${isLive ? "text-marigold" : "text-white"}`}>
            {match.awayScore ?? "-"}
          </span>
        </div>
      </div>
      
      {/* Minute indicator for live matches */}
      {isLive && match.minute && (
        <div className="mt-3 text-center">
          <span className="text-gorkhali-red font-bebas text-sm animate-pulse">
            {match.minute}'
          </span>
        </div>
      )}
    </motion.div>
  );
};

const LeagueStandings = ({ standings }) => (
  <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg overflow-hidden">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-white/5 text-gray-400 font-bebas tracking-wider">
          <th className="p-2 text-left">#</th>
          <th className="p-2 text-left">Team</th>
          <th className="p-2 text-center">P</th>
          <th className="p-2 text-center">W</th>
          <th className="p-2 text-center">D</th>
          <th className="p-2 text-center">L</th>
          <th className="p-2 text-center">Pts</th>
        </tr>
      </thead>
      <tbody>
        {standings.slice(0, 10).map((team, idx) => (
          <tr key={idx} className="border-t border-white/5 hover:bg-white/5">
            <td className="p-2 text-gray-400">{team.position}</td>
            <td className="p-2 text-white font-inter">{team.team}</td>
            <td className="p-2 text-center text-gray-400">{team.played}</td>
            <td className="p-2 text-center text-congress-green">{team.won}</td>
            <td className="p-2 text-center text-gray-400">{team.draw}</td>
            <td className="p-2 text-center text-gorkhali-red">{team.lost}</td>
            <td className="p-2 text-center text-marigold font-bebas">{team.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const FootballWidget = () => {
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLeague, setActiveLeague] = useState("PL");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dataSource, setDataSource] = useState("sample");

  useEffect(() => {
    fetchFootballData();
    // Auto-refresh every 60 seconds for live scores
    const interval = setInterval(fetchFootballData, 60000);
    return () => clearInterval(interval);
  }, [activeLeague]);

  const fetchFootballData = async () => {
    try {
      const [matchesRes, standingsRes] = await Promise.all([
        axios.get(`${API}/football/matches?league=${activeLeague}`),
        axios.get(`${API}/football/standings?league=${activeLeague}`)
      ]);
      setMatches(matchesRes.data.matches || []);
      setStandings(standingsRes.data.standings || []);
      setDataSource(matchesRes.data.source || "sample");
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch football data:", error);
    } finally {
      setLoading(false);
    }
  };

  const liveMatches = matches.filter(m => m.status === "LIVE" || m.status === "IN_PLAY");
  const upcomingMatches = matches.filter(m => m.status === "SCHEDULED" || m.status === "TIMED");
  const finishedMatches = matches.filter(m => m.status === "FINISHED");

  return (
    <div className="bg-night-count/50 backdrop-blur border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="text-marigold" size={28} />
          <div>
            <h2 className="font-bebas text-2xl text-white tracking-wider">FOOTBALL LIVE</h2>
            <p className="text-xs text-gray-400">Top 5 Leagues + Champions League</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={fetchFootballData}
          className="text-gray-400 hover:text-white"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      {/* League Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {LEAGUES.map(league => (
          <button
            key={league.id}
            onClick={() => setActiveLeague(league.id)}
            className={`px-3 py-2 rounded-lg text-xs font-bebas tracking-wider transition-all ${
              activeLeague === league.id 
                ? "bg-marigold text-black" 
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            {league.logo} {league.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-marigold" size={32} />
        </div>
      ) : (
        <Tabs defaultValue="matches" className="space-y-4">
          <TabsList className="bg-white/5">
            <TabsTrigger value="matches" className="font-bebas data-[state=active]:bg-gorkhali-red">
              <Tv className="mr-2" size={14} /> MATCHES
            </TabsTrigger>
            <TabsTrigger value="standings" className="font-bebas data-[state=active]:bg-gorkhali-red">
              <Star className="mr-2" size={14} /> STANDINGS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="space-y-4">
            {/* Live Matches */}
            {liveMatches.length > 0 && (
              <div>
                <h3 className="font-bebas text-lg text-gorkhali-red tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-gorkhali-red rounded-full animate-pulse" />
                  LIVE NOW
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {liveMatches.map((match, idx) => (
                    <MatchCard key={idx} match={match} />
                  ))}
                </div>
              </div>
            )}

            {/* Recent/Finished */}
            {finishedMatches.length > 0 && (
              <div>
                <h3 className="font-bebas text-lg text-gray-400 tracking-wider mb-3">RECENT RESULTS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {finishedMatches.slice(0, 4).map((match, idx) => (
                    <MatchCard key={idx} match={match} />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {upcomingMatches.length > 0 && (
              <div>
                <h3 className="font-bebas text-lg text-rsp-blue tracking-wider mb-3 flex items-center gap-2">
                  <Calendar size={16} /> UPCOMING
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingMatches.slice(0, 4).map((match, idx) => (
                    <MatchCard key={idx} match={match} />
                  ))}
                </div>
              </div>
            )}

            {matches.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Trophy className="mx-auto mb-2 opacity-50" size={40} />
                <p>No matches available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="standings">
            {standings.length > 0 ? (
              <LeagueStandings standings={standings} />
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Star className="mx-auto mb-2 opacity-50" size={40} />
                <p>Standings not available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {lastUpdated && (
        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
          <span className={`px-2 py-1 rounded ${dataSource === "live" ? "bg-congress-green/20 text-congress-green" : "bg-white/10 text-gray-400"}`}>
            {dataSource === "live" ? "🔴 Live Data" : "📊 Sample Data"}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} /> Updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      )}
      
      {dataSource === "sample" && (
        <p className="text-xs text-gray-600 mt-2 text-center italic">
          Showing representative data. Add API_FOOTBALL_KEY for live scores from api-football.com
        </p>
      )}
    </div>
  );
};

export default FootballWidget;
