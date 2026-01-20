import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Vote, BarChart3, History, ChevronRight, Users, Shield, Globe, Zap, TrendingUp, Award, Star, MapPin, Calendar, Play, ExternalLink } from "lucide-react";

// Stunning Nepal Images
const IMAGES = {
  hero: "https://images.unsplash.com/photo-1764140608148-80e010804af8?w=1920&q=80",
  temple: "https://images.unsplash.com/photo-1661966772663-98498d0a30df?w=800&q=80",
  mountain: "https://images.unsplash.com/photo-1761926041609-10ea291c463e?w=800&q=80",
  stupa: "https://images.unsplash.com/photo-1751953460151-a27fe39e5fad?w=800&q=80",
  festival: "https://images.unsplash.com/photo-1763733594402-051a9721ff14?w=800&q=80",
  aerial: "https://images.unsplash.com/photo-1764140608148-80e010804af8?w=800&q=80",
  boudha: "https://images.unsplash.com/photo-1686316431445-50f078a2de0f?w=800&q=80",
};

// Ad Banner Component
const AdBanner = ({ type = "horizontal", id, className = "" }) => {
  const sizes = {
    horizontal: { w: "728px", h: "90px", label: "728x90 Leaderboard" },
    rectangle: { w: "300px", h: "250px", label: "300x250 Medium Rectangle" },
    skyscraper: { w: "160px", h: "600px", label: "160x600 Skyscraper" },
    mobile: { w: "320px", h: "100px", label: "320x100 Mobile Banner" },
    large: { w: "970px", h: "250px", label: "970x250 Billboard" },
  };
  
  const size = sizes[type];
  
  return (
    <div 
      className={`ad-container ${className}`}
      data-testid={`ad-${id}`}
      style={{ maxWidth: size.w }}
    >
      <div 
        className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center relative overflow-hidden group cursor-pointer transition-all hover:border-marigold"
        style={{ width: "100%", height: size.h, maxWidth: size.w }}
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-gorkhali-red/10 via-transparent to-rsp-blue/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Content */}
        <div className="text-center z-10">
          <p className="text-gray-500 text-xs font-inter mb-1">ADVERTISEMENT</p>
          <p className="text-gray-400 text-sm font-bebas tracking-wider">{size.label}</p>
          <p className="text-gray-600 text-xs mt-1">Your Ad Here</p>
        </div>
        
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-marigold/30" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-marigold/30" />
      </div>
    </div>
  );
};

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = parseInt(value);
    const incrementTime = duration / end;
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, Math.max(incrementTime, 10));
    return () => clearInterval(timer);
  }, [value, duration, inView]);
  
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// News Ticker
const NewsTicker = () => {
  const headlines = [
    "🗳️ ELECTION SIMULATION LIVE",
    "📊 REAL-TIME RESULTS",
    "🇳🇵 NEPAL'S DEMOCRACY",
    "🏔️ FROM HIMALAYA TO TERAI",
    "⚡ BALEN SHAH • KP OLI • DEUBA • PRACHANDA • RABI",
    "🔥 CAST YOUR VOTE NOW",
    "📈 HISTORICAL DATA FROM 2017 & 2022",
  ];
  
  return (
    <div className="bg-gradient-to-r from-gorkhali-red via-peace-blue to-gorkhali-red py-3 overflow-hidden">
      <motion.div 
        className="flex whitespace-nowrap"
        animate={{ x: [0, -2000] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {[...headlines, ...headlines, ...headlines].map((headline, i) => (
          <span key={i} className="mx-8 text-white font-bebas tracking-wider text-sm flex items-center gap-2">
            {headline}
            <span className="text-marigold">•</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
};

// Photo Gallery Card
const GalleryCard = ({ image, title, subtitle }) => (
  <motion.div 
    className="relative overflow-hidden rounded-sm group cursor-pointer"
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.3 }}
  >
    <img src={image} alt={title} className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 p-4">
      <h3 className="font-bebas text-xl text-white tracking-wider">{title}</h3>
      <p className="font-inter text-sm text-gray-300">{subtitle}</p>
    </div>
    <div className="absolute top-3 right-3 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
      <ExternalLink className="text-white" size={18} />
    </div>
  </motion.div>
);

const HomePage = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  return (
    <div className="min-h-screen overflow-hidden bg-night-count">
      {/* News Ticker */}
      <NewsTicker />
      
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        data-testid="hero-section"
      >
        {/* Parallax Background */}
        <motion.div 
          className="absolute inset-0"
          style={{ scale: heroScale }}
        >
          <img 
            src={IMAGES.hero} 
            alt="Nepal Mountains"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-night-count" />
        </motion.div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        <motion.div 
          className="relative z-10 max-w-6xl mx-auto px-4 text-center"
          style={{ opacity: heroOpacity }}
        >
          {/* Live Badge */}
          <motion.div 
            className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full mb-8"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="w-3 h-3 bg-gorkhali-red rounded-full animate-pulse" />
            <span className="text-white font-bebas tracking-widest text-sm">SIMULATION LIVE NOW</span>
            <span className="text-marigold font-inter text-xs">5 Candidates</span>
          </motion.div>
          
          <motion.h1 
            className="font-bebas text-6xl sm:text-7xl lg:text-9xl text-white tracking-wider mb-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            style={{
              textShadow: "0 0 60px rgba(217,4,41,0.5), 0 0 120px rgba(217,4,41,0.3)",
            }}
          >
            THE HIMALAYAN
            <br />
            <span className="text-gradient-nepal">BALLOT</span>
          </motion.h1>
          
          <motion.p
            className="font-playfair text-2xl sm:text-3xl text-gray-200 mb-4 italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            "Where every vote echoes through the mountains"
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="font-inter text-gray-400 max-w-2xl mx-auto mb-10"
          >
            Nepal's premier election simulation • Experience democracy in action
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link to="/vote">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-gradient-to-r from-gorkhali-red to-communist-red text-white font-bebas tracking-wider text-xl px-12 py-8 rounded-sm shadow-lg shadow-gorkhali-red/30">
                  <Vote className="mr-3" size={24} />
                  VOTE NOW
                  <motion.span className="ml-2" animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }}>→</motion.span>
                </Button>
              </motion.div>
            </Link>
            <Link to="/results">
              <Button variant="outline" className="bg-white/5 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white hover:text-peace-blue font-bebas tracking-wider text-xl px-12 py-8 rounded-sm">
                <BarChart3 className="mr-3" size={24} />
                LIVE RESULTS
              </Button>
            </Link>
          </motion.div>
          
          {/* Quick Stats */}
          <motion.div 
            className="flex justify-center gap-8 flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            {[
              { label: "Candidates", value: "5" },
              { label: "Provinces", value: "7" },
              { label: "Elections", value: "5" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-bebas text-3xl text-white">{stat.value}</p>
                <p className="font-inter text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span className="text-white/50 text-xs font-inter mb-2">SCROLL TO EXPLORE</span>
          <ChevronRight className="rotate-90 text-white/50" size={24} />
        </motion.div>
      </section>

      {/* Ad Banner - Top */}
      <div className="bg-night-count py-6 flex justify-center">
        <AdBanner type="horizontal" id="top-leaderboard" />
      </div>

      {/* Photo Gallery Section */}
      <section className="py-20 bg-gradient-to-b from-night-count to-peace-blue/20 relative">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-marigold font-bebas tracking-widest text-sm">DISCOVER NEPAL</span>
            <h2 className="font-bebas text-4xl sm:text-5xl text-white tracking-wider mt-2">
              LAND OF THE HIMALAYAS
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gorkhali-red to-marigold mx-auto mt-4" />
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GalleryCard image={IMAGES.stupa} title="SWAYAMBHUNATH" subtitle="The Monkey Temple, Kathmandu" />
            <GalleryCard image={IMAGES.mountain} title="MACHAPUCHARE" subtitle="The Sacred Fishtail Mountain" />
            <GalleryCard image={IMAGES.boudha} title="BOUDHANATH" subtitle="One of the largest stupas in the world" />
          </div>
        </div>
      </section>

      {/* Mission Statement with Side Ad */}
      <section className="py-20 bg-rice-paper relative overflow-hidden" data-testid="mission-section">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0L100 50L50 100L0 50z' fill='%23003049' fill-opacity='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: "50px 50px",
          }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <span className="text-gorkhali-red font-bebas tracking-widest text-sm">★ OUR PURPOSE ★</span>
                <h2 className="font-bebas text-4xl sm:text-5xl text-peace-blue tracking-wider mt-2 mb-4">
                  NEPAL'S DEMOCRATIC JOURNEY
                </h2>
                <div className="w-32 h-1 bg-gradient-to-r from-gorkhali-red to-peace-blue" />
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 border-l-4 border-gorkhali-red shadow-lg"
                >
                  <Calendar className="text-gorkhali-red mb-3" size={32} />
                  <h3 className="font-bebas text-2xl text-peace-blue tracking-wider mb-2">1951 - 2006</h3>
                  <p className="font-playfair text-gray-600 leading-relaxed">
                    From the overthrow of the Rana regime to the People's Movement—Nepal fought for democracy through blood and resilience.
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 border-l-4 border-rsp-blue shadow-lg"
                >
                  <Shield className="text-rsp-blue mb-3" size={32} />
                  <h3 className="font-bebas text-2xl text-peace-blue tracking-wider mb-2">2008 - PRESENT</h3>
                  <p className="font-playfair text-gray-600 leading-relaxed">
                    Nepal declared itself a Federal Democratic Republic, ending 240 years of monarchy. The 2015 constitution established 7 provinces.
                  </p>
                </motion.div>
              </div>
              
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="font-playfair text-xl text-peace-blue leading-relaxed bg-white p-8 border border-gray-200 shadow-sm"
              >
                This simulation honors that spirit. Here, you can explore what a direct Prime Ministerial election might look like—featuring leaders from across the political spectrum, from veteran politicians to the new wave represented by figures like <strong className="text-gorkhali-red">Balen Shah</strong>.
              </motion.p>
            </div>
            
            {/* Side Ad */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <AdBanner type="rectangle" id="mission-sidebar-1" />
              <AdBanner type="rectangle" id="mission-sidebar-2" />
            </div>
          </div>
        </div>
      </section>

      {/* Mid-Section Ad Banner */}
      <div className="bg-peace-blue py-8 flex justify-center">
        <AdBanner type="large" id="mid-billboard" />
      </div>

      {/* Features with Unique Styling */}
      <section className="py-24 bg-night-count relative" data-testid="features-section">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gorkhali-red/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-rsp-blue/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-marigold font-bebas tracking-widest text-sm">EXPLORE</span>
            <h2 className="font-bebas text-4xl sm:text-5xl text-white tracking-wider mt-2">
              PLATFORM FEATURES
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Vote,
                title: "CAST YOUR VOTE",
                desc: "Anonymous voting for Prime Minister. Your privacy is protected.",
                gradient: "from-gorkhali-red to-communist-red",
                link: "/vote",
              },
              {
                icon: BarChart3,
                title: "LIVE RESULTS",
                desc: "Real-time vote counting with beautiful interactive charts.",
                gradient: "from-rsp-blue to-congress-green",
                link: "/results",
              },
              {
                icon: History,
                title: "ELECTION HISTORY",
                desc: "Explore 2017 & 2022 elections. All 7 provinces covered.",
                gradient: "from-marigold to-rpp-gold",
                link: "/history",
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={feature.link}>
                  <motion.div 
                    className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-sm hover:border-marigold/50 transition-all group relative overflow-hidden h-full"
                    whileHover={{ y: -10, scale: 1.02 }}
                  >
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                    
                    <motion.div 
                      className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-full flex items-center justify-center mb-6 shadow-lg`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="text-white" size={28} />
                    </motion.div>
                    
                    <h3 className="font-bebas text-2xl text-white tracking-wider mb-3">
                      {feature.title}
                    </h3>
                    <p className="font-inter text-gray-400 mb-6">
                      {feature.desc}
                    </p>
                    <span className="font-bebas text-marigold tracking-wider text-sm flex items-center gap-2 group-hover:gap-4 transition-all">
                      EXPLORE <ChevronRight size={16} />
                    </span>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Unique Bento Grid */}
      <section className="py-20 bg-gradient-to-r from-peace-blue via-night-count to-peace-blue relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, value: 30, suffix: "M+", label: "POPULATION", color: "gorkhali-red" },
              { icon: Globe, value: 7, suffix: "", label: "PROVINCES", color: "rsp-blue" },
              { icon: Shield, value: 2008, suffix: "", label: "REPUBLIC", color: "marigold" },
              { icon: Award, value: 275, suffix: "", label: "SEATS", color: "congress-green" }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 text-center rounded-sm hover:bg-white/10 transition-colors"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                >
                  <stat.icon className={`mx-auto mb-3 text-${stat.color}`} size={36} />
                </motion.div>
                <p className="font-bebas text-4xl text-white tracking-wider">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="font-inter text-xs text-gray-400 uppercase tracking-wider mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden" data-testid="cta-section">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${IMAGES.festival})` }}
        />
        <div className="absolute inset-0 bg-peace-blue/90" />
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <Zap className="text-marigold" size={56} />
            </motion.div>
            
            <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-wider mb-6">
              READY TO VOTE?
            </h2>
            <p className="font-inter text-gray-300 mb-10 max-w-2xl mx-auto text-lg">
              Join the simulation. Every vote represents the democratic spirit of Nepal.
            </p>
            <Link to="/vote">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-marigold hover:bg-rpp-gold text-peace-blue font-bebas tracking-wider text-2xl px-16 py-10 rounded-sm shadow-xl shadow-marigold/30">
                  <Vote className="mr-3" size={32} />
                  CAST YOUR VOTE NOW
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Bottom Ad Section */}
      <div className="bg-night-count py-8 flex justify-center">
        <AdBanner type="horizontal" id="bottom-leaderboard" />
      </div>

      {/* Footer with Ad Space */}
      <footer className="bg-black py-16" data-testid="footer">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12">
                  <svg viewBox="0 0 40 48" className="w-full h-full">
                    <polygon points="0,0 40,16 0,32" fill="#D90429" />
                    <polygon points="0,16 40,32 0,48" fill="#003049" />
                    <circle cx="12" cy="12" r="4" fill="white" />
                    <circle cx="12" cy="28" r="4" fill="white" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bebas text-2xl text-white tracking-wider">NEPALI BALLOT</h3>
                  <p className="text-gray-500 text-xs">Election Simulation Platform</p>
                </div>
              </div>
              <p className="font-inter text-gray-400 text-sm max-w-md">
                Experience Nepal's democracy through this fun election simulation. Not affiliated with any political party or government body.
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-bebas text-lg text-white tracking-wider mb-4">QUICK LINKS</h4>
              <ul className="space-y-2">
                {[
                  { label: "Vote Now", path: "/vote" },
                  { label: "Live Results", path: "/results" },
                  { label: "Election History", path: "/history" },
                ].map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="font-inter text-sm text-gray-400 hover:text-marigold transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Ad Space */}
            <div>
              <h4 className="font-bebas text-lg text-white tracking-wider mb-4">SPONSORED</h4>
              <div className="bg-gray-900 border border-gray-800 p-4 text-center">
                <p className="text-gray-600 text-xs mb-2">ADVERTISEMENT</p>
                <p className="text-gray-500 text-sm font-bebas">Your Ad Here</p>
                <p className="text-gray-700 text-xs mt-1">120x240</p>
              </div>
            </div>
          </div>
          
          {/* Footer Ad */}
          <div className="border-t border-gray-800 pt-8 mb-8 flex justify-center">
            <AdBanner type="horizontal" id="footer-leaderboard" />
          </div>
          
          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="font-inter text-gray-500 text-sm">
              © 2024 Nepali Ballot Simulation. Built with ❤️ for Nepal.
            </p>
            <p className="font-inter text-gray-600 text-xs mt-2">
              This is a simulation for entertainment purposes only. Not a real election platform.
            </p>
            
            {/* Custom Code Section */}
            <div className="mt-6 p-4 bg-gray-900 border border-gray-800 rounded-sm max-w-2xl mx-auto">
              <p className="text-gray-500 text-xs font-inter mb-2">CUSTOM TRACKING CODE AREA</p>
              <code className="text-gray-600 text-xs font-mono">
                {'<!-- Your Google Analytics, Facebook Pixel, or custom tracking code here -->'}
              </code>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
