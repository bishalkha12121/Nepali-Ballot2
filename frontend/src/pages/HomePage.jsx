import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Vote, BarChart3, History, ChevronRight, Users, Shield, Globe, Zap, TrendingUp, Award } from "lucide-react";

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    const incrementTime = duration / end;
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return <span className="counter-value">{count.toLocaleString()}</span>;
};

// Particle Component
const Particles = () => {
  return (
    <div className="particles">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${10 + Math.random() * 20}s`,
          }}
        />
      ))}
    </div>
  );
};

// Ticker Component
const NewsTicker = () => {
  const headlines = [
    "🗳️ ELECTION SIMULATION LIVE - Cast your vote now!",
    "📊 Watch real-time results as they come in",
    "🇳🇵 Experience Nepal's democratic spirit",
    "🏔️ From Himalaya to Terai - Every vote counts",
    "⚡ Balen Shah leads the new wave of politics",
    "🎯 Historic data from 2017 & 2022 elections available",
    "🔥 5 Candidates competing for Prime Minister",
  ];
  
  return (
    <div className="ticker-wrapper">
      <div className="ticker-content">
        {[...headlines, ...headlines].map((headline, i) => (
          <span key={i} className="ticker-item">{headline}</span>
        ))}
      </div>
    </div>
  );
};

const HomePage = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* News Ticker */}
      <NewsTicker />
      
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
        data-testid="hero-section"
      >
        {/* Animated Background */}
        <motion.div 
          className="absolute inset-0 hero-section"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/15686668/pexels-photo-15686668.jpeg')`,
            scale: heroScale,
            y: heroY,
          }}
        />
        <div className="absolute inset-0 hero-overlay" />
        
        {/* Particles */}
        <Particles />
        
        <motion.div 
          className="relative z-10 max-w-5xl mx-auto px-4 text-center"
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Live Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="live-dot" />
              <span className="text-white font-inter text-sm">SIMULATION LIVE</span>
            </motion.div>
            
            <h1 className="font-bebas text-5xl sm:text-7xl lg:text-8xl text-white tracking-wider mb-6 glow-text">
              THE HIMALAYAN BALLOT
            </h1>
            
            <motion.p
              className="font-playfair text-xl sm:text-2xl lg:text-3xl text-gray-200 mb-4 italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              "Where every vote echoes through the mountains"
            </motion.p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="font-inter text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-10"
          >
            Experience Nepal's democratic journey through this election simulation.
            Cast your vote, watch live results, and explore the history of a nation
            that transformed from monarchy to federal republic.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/vote">
              <Button
                className="btn-primary text-lg px-10 py-7 group"
                data-testid="vote-now-btn"
              >
                <Vote className="mr-2 group-hover:animate-bounce" size={24} />
                VOTE NOW
                <motion.span
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Button>
            </Link>
            <Link to="/results">
              <Button
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-peace-blue font-bebas tracking-wider text-lg px-10 py-7 shimmer"
                data-testid="view-results-btn"
              >
                <BarChart3 className="mr-2" size={24} />
                VIEW LIVE RESULTS
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <div className="flex flex-col items-center text-white/60">
            <span className="font-inter text-xs mb-2">SCROLL</span>
            <ChevronRight className="rotate-90" size={28} />
          </div>
        </motion.div>
      </section>

      {/* Mission Statement */}
      <section className="py-24 bg-rice-paper noise-overlay relative overflow-hidden" data-testid="mission-section">
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.span 
              className="inline-block text-gorkhali-red font-bebas tracking-widest text-sm mb-4"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ★ OUR PURPOSE ★
            </motion.span>
            <h2 className="font-bebas text-4xl sm:text-5xl text-gradient-nepal tracking-wider mb-4">
              OUR MISSION
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gorkhali-red to-peace-blue mx-auto" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 1 }}
            className="space-y-8"
          >
            {[
              "Nepal's journey to democracy is a story written in the blood and sweat of its people. From the overthrow of the Rana regime in 1951 to the People's Movement of 1990, from the Maoist insurgency to the historic 2006 revolution that ended 240 years of monarchy— every chapter speaks of resilience.",
              "In 2008, Nepal declared itself a Federal Democratic Republic, becoming the world's newest republic. The 2015 constitution established a federal system with seven provinces, marking a new era in Nepali politics where voices from Terai to Himalaya finally found representation.",
              "This simulation honors that spirit. Here, you can explore what a direct Prime Ministerial election might look like—featuring leaders from across the political spectrum, from veteran politicians to the new wave represented by figures like Balen Shah."
            ].map((text, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                className="font-playfair text-xl text-peace-blue leading-relaxed"
              >
                {text}
              </motion.p>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white relative overflow-hidden" data-testid="features-section">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23003049' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-bebas text-4xl sm:text-5xl text-peace-blue tracking-wider mb-4">
              EXPLORE THE PLATFORM
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gorkhali-red to-peace-blue mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Vote,
                title: "CAST YOUR VOTE",
                desc: "Choose your preferred candidate for Prime Minister in this simulation. Anonymous voting ensures privacy.",
                color: "gorkhali-red",
                link: "/vote",
                btnClass: "btn-primary"
              },
              {
                icon: BarChart3,
                title: "LIVE RESULTS",
                desc: "Watch the results update in real-time with beautiful charts and detailed vote analytics.",
                color: "rsp-blue",
                link: "/results",
                btnClass: "btn-secondary"
              },
              {
                icon: History,
                title: "ELECTION HISTORY",
                desc: "Explore data from past elections, compare party performances, and understand Nepal's political evolution.",
                color: "marigold",
                link: "/history",
                btnClass: "btn-secondary"
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                whileHover={{ y: -10 }}
                className="candidate-card bg-white border border-gray-200 p-8 text-center group"
                data-testid={`feature-${feature.title.toLowerCase().replace(' ', '-')}`}
              >
                <motion.div 
                  className={`w-20 h-20 bg-${feature.color}/10 rounded-full flex items-center justify-center mx-auto mb-6`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className={`text-${feature.color}`} size={36} />
                </motion.div>
                <h3 className="font-bebas text-2xl text-peace-blue tracking-wider mb-3">
                  {feature.title}
                </h3>
                <p className="font-inter text-gray-600 mb-6">
                  {feature.desc}
                </p>
                <Link to={feature.link}>
                  <Button className={`${feature.btnClass} group-hover:scale-105 transition-transform`}>
                    {feature.title === "CAST YOUR VOTE" ? "VOTE NOW" : feature.title === "LIVE RESULTS" ? "VIEW RESULTS" : "EXPLORE"} 
                    <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="py-20 animated-gradient relative overflow-hidden" data-testid="stats-section">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { icon: Users, value: 30, suffix: "M+", label: "Population" },
              { icon: Globe, value: 7, suffix: "", label: "Provinces" },
              { icon: Shield, value: 2008, suffix: "", label: "Republic Year" },
              { icon: Award, value: 275, suffix: "", label: "Parliament Seats" }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, type: "spring" }}
                className="text-white"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                >
                  <stat.icon className="mx-auto mb-3" size={40} />
                </motion.div>
                <p className="font-bebas text-4xl sm:text-5xl tracking-wider">
                  <AnimatedCounter value={stat.value} />
                  {stat.suffix}
                </p>
                <p className="font-inter text-gray-200 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-rice-paper relative overflow-hidden" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <Zap className="text-marigold mx-auto" size={48} />
            </motion.div>
            
            <h2 className="font-bebas text-4xl sm:text-5xl text-peace-blue tracking-wider mb-6">
              READY TO MAKE YOUR VOICE HEARD?
            </h2>
            <p className="font-inter text-gray-600 mb-10 max-w-2xl mx-auto text-lg">
              Join thousands of others in this election simulation. Your vote matters—
              even in a simulation, it represents the democratic spirit of Nepal.
            </p>
            <Link to="/vote">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="btn-primary text-xl px-14 py-8" data-testid="cta-vote-btn">
                  <Vote className="mr-3" size={28} />
                  CAST YOUR VOTE NOW
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
