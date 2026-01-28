import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { Newspaper, ExternalLink, Clock, RefreshCw, Globe, Filter, Search, TrendingUp, Rss, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API_BASE =
  process.env.REACT_APP_BACKEND_URL || "https://nepali-ballot2-production.up.railway.app";
const API = `${API_BASE}/api`;

const FALLBACK_NEWS = [
  {
    id: "fallback-1",
    title: "Election coverage will appear here once sources are reachable.",
    link: "https://nepali-ballot.web.app/",
    description:
      "If official RSS feeds are temporarily unavailable, the app will retry automatically.",
    time: "Recent",
    source: "Nepali Ballot",
    sourceId: "system",
    sourceColor: "#F77F00",
    image: null,
  },
];

const NEWS_SOURCES = [
  { id: "bbc", name: "BBC Nepali", url: "https://www.bbc.com/nepali", color: "#BB1919", logo: "🅱️" },
  { id: "kathmandu", name: "Kathmandu Post", url: "https://kathmandupost.com/", color: "#DC2626", logo: "📄" },
];

const AUTO_REFRESH_MS = 5 * 60 * 1000;

const LiveTicker = () => (
  <div className="bg-gradient-to-r from-gorkhali-red via-peace-blue to-gorkhali-red py-3 overflow-hidden">
    <motion.div className="flex whitespace-nowrap" animate={{ x: [0, -2000] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}>
      {[...Array(4)].map((_, i) => (
        <span key={i} className="mx-8 text-white font-bebas tracking-wider text-sm">
          📰 NEPAL ELECTION NEWS • BBC NEPALI • EKANTIPUR • KATHMANDU POST • LATEST UPDATES • <span className="text-marigold">★</span>
        </span>
      ))}
    </motion.div>
  </div>
);

const NewsCard = ({ article, index }) => (
  <motion.a
    href={article.link}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    whileHover={{ y: -5, scale: 1.01 }}
    className="block bg-white/5 backdrop-blur border border-white/10 rounded-lg overflow-hidden hover:border-marigold/50 transition-all group"
    data-testid={`news-card-${index}`}
  >
    {article.image && (
      <div className="relative h-40 overflow-hidden">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
    )}
    <div className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs px-2 py-1 rounded-full font-bebas tracking-wider" style={{ backgroundColor: `${article.sourceColor}30`, color: article.sourceColor }}>
          {article.source}
        </span>
        <span className="text-gray-500 text-xs flex items-center gap-1">
          <Clock size={12} /> {article.time}
        </span>
      </div>
      <h3 className="font-inter font-semibold text-white text-sm mb-2 line-clamp-2 group-hover:text-marigold transition-colors">
        {article.title}
      </h3>
      {article.description && (
        <p className="text-gray-400 text-xs line-clamp-2">{article.description}</p>
      )}
      <div className="mt-3 flex items-center gap-1 text-marigold text-xs font-bebas tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
        READ MORE <ExternalLink size={12} />
      </div>
    </div>
  </motion.a>
);

const SourceCard = ({ source, isActive, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`p-4 rounded-lg border-2 transition-all text-left ${
      isActive 
        ? "border-marigold bg-marigold/10" 
        : "border-white/10 bg-white/5 hover:border-white/30"
    }`}
  >
    <div className="flex items-center gap-3">
      <span className="text-2xl">{source.logo}</span>
      <div>
        <h3 className="font-bebas text-lg text-white tracking-wider">{source.name}</h3>
        <p className="text-xs text-gray-400">Nepal News</p>
      </div>
    </div>
  </motion.button>
);

const Footer = () => (
  <footer className="bg-black py-12">
    <div className="max-w-6xl mx-auto px-4 text-center">
      <p className="text-gray-500 text-sm">© 2026 Nepali Ballot • Entertainment Only 🇳🇵</p>
    </div>
  </footer>
);

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSource, setActiveSource] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => fetchNews(false), AUTO_REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  const fetchNews = async (showToast = false) => {
    try {
      setRefreshing(true);
      const response = await axios.get(`${API}/news`);
      setNews(response.data.articles || []);
      setLastUpdated(new Date());
      if (showToast) toast.success("News refreshed!");
    } catch (error) {
      console.error("Failed to fetch news:", error);
      setNews(FALLBACK_NEWS);
      setLastUpdated(new Date());
      toast.error("Failed to load news from sources. Showing fallback.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredNews = news.filter(article => {
    const matchesSource = activeSource === "all" || article.sourceId === activeSource;
    const matchesSearch = !searchQuery || 
      article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSource && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-night-count">
        <motion.div className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-20 h-20 border-4 border-gorkhali-red border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-bebas text-2xl text-white">LOADING NEWS</p>
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
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-rsp-blue/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              <Newspaper className="mx-auto mb-6 text-marigold" size={64} />
            </motion.div>
            <h1 className="font-bebas text-6xl sm:text-7xl text-white tracking-wider mb-4" style={{ textShadow: "0 0 60px rgba(247,127,0,0.5)" }}>
              ELECTION NEWS
            </h1>
            <p className="font-playfair text-xl text-gray-300 italic mb-6">"Stay informed, vote wisely"</p>
            
            {/* Last Updated & Refresh */}
            <div className="flex items-center justify-center gap-4">
              {lastUpdated && (
                <span className="text-gray-400 text-sm flex items-center gap-2">
                  <Clock size={14} /> Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <Button 
                onClick={() => fetchNews(true)} 
                disabled={refreshing}
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className={`mr-2 ${refreshing ? "animate-spin" : ""}`} size={16} />
                Refresh
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Source Filter */}
        <div className="mb-8">
          <h2 className="font-bebas text-xl text-white tracking-wider mb-4 flex items-center gap-2">
            <Rss className="text-marigold" size={20} /> NEWS SOURCES
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SourceCard 
              source={{ id: "all", name: "All Sources", logo: "📊", color: "#F77F00" }}
              isActive={activeSource === "all"}
              onClick={() => setActiveSource("all")}
            />
            {NEWS_SOURCES.map(source => (
              <SourceCard 
                key={source.id}
                source={source}
                isActive={activeSource === source.id}
                onClick={() => setActiveSource(source.id)}
              />
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* News Grid */}
        {filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((article, index) => (
              <NewsCard key={article.id || index} article={article} index={index} />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <AlertCircle className="mx-auto text-gray-500 mb-4" size={48} />
            <h3 className="font-bebas text-2xl text-white mb-2">NO NEWS FOUND</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery ? "Try a different search term" : "News will appear here once fetched from sources"}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {NEWS_SOURCES.map(source => (
                <a
                  key={source.id}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:border-marigold/50 transition-colors"
                >
                  <span>{source.logo}</span>
                  <span className="text-white font-inter text-sm">{source.name}</span>
                  <ExternalLink size={14} className="text-gray-400" />
                </a>
              ))}
            </div>
          </motion.div>
        )}

        {/* Direct Links Section */}
        <div className="mt-12 bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 className="font-bebas text-xl text-white tracking-wider mb-4 flex items-center gap-2">
            <Globe className="text-rsp-blue" size={20} /> VISIT NEWS SOURCES DIRECTLY
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {NEWS_SOURCES.map(source => (
              <a
                key={source.id}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:border-marigold hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{source.logo}</span>
                  <div>
                    <h4 className="font-bebas text-lg text-white tracking-wider">{source.name}</h4>
                    <p className="text-xs text-gray-400 truncate max-w-[150px]">{source.url}</p>
                  </div>
                </div>
                <ExternalLink className="text-gray-400 group-hover:text-marigold transition-colors" size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NewsPage;
