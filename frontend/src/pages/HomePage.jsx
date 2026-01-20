import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Vote, BarChart3, History, ChevronRight, Users, Shield, Globe } from "lucide-react";

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center hero-section"
        style={{
          backgroundImage: `url('https://images.pexels.com/photos/15686668/pexels-photo-15686668.jpeg')`,
        }}
        data-testid="hero-section"
      >
        <div className="absolute inset-0 hero-overlay" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-bebas text-5xl sm:text-6xl lg:text-7xl text-white tracking-wider mb-6">
              THE HIMALAYAN BALLOT
            </h1>
            <p className="font-playfair text-xl sm:text-2xl text-gray-200 mb-4 italic">
              "Where every vote echoes through the mountains"
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-inter text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-8"
          >
            Experience Nepal's democratic journey through this election simulation.
            Cast your vote, watch live results, and explore the history of a nation
            that transformed from monarchy to federal republic.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/vote">
              <Button
                className="btn-primary text-lg px-8 py-6"
                data-testid="vote-now-btn"
              >
                <Vote className="mr-2" size={20} />
                VOTE NOW
              </Button>
            </Link>
            <Link to="/results">
              <Button
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-peace-blue font-bebas tracking-wider text-lg px-8 py-6"
                data-testid="view-results-btn"
              >
                <BarChart3 className="mr-2" size={20} />
                VIEW RESULTS
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronRight className="rotate-90 text-white/60" size={32} />
        </motion.div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-rice-paper noise-overlay" data-testid="mission-section">
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-bebas text-3xl sm:text-4xl text-peace-blue tracking-wider mb-4">
              OUR MISSION
            </h2>
            <div className="w-20 h-1 bg-gorkhali-red mx-auto" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="prose prose-lg max-w-none"
          >
            <p className="font-playfair text-xl text-peace-blue leading-relaxed mb-6">
              Nepal's journey to democracy is a story written in the blood and sweat of its people.
              From the overthrow of the Rana regime in 1951 to the People's Movement of 1990,
              from the Maoist insurgency to the historic 2006 revolution that ended 240 years of monarchy—
              every chapter speaks of resilience.
            </p>
            <p className="font-playfair text-xl text-peace-blue leading-relaxed mb-6">
              In 2008, Nepal declared itself a Federal Democratic Republic, becoming the world's
              newest republic. The 2015 constitution established a federal system with seven provinces,
              marking a new era in Nepali politics where voices from Terai to Himalaya finally found representation.
            </p>
            <p className="font-playfair text-xl text-peace-blue leading-relaxed">
              This simulation honors that spirit. Here, you can explore what a direct Prime Ministerial
              election might look like—featuring leaders from across the political spectrum,
              from veteran politicians to the new wave represented by figures like Balen Shah.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white" data-testid="features-section">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-bebas text-3xl sm:text-4xl text-peace-blue tracking-wider mb-4">
              EXPLORE THE PLATFORM
            </h2>
            <div className="w-20 h-1 bg-gorkhali-red mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Vote Feature */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="candidate-card bg-white border border-gray-200 p-8 text-center"
              data-testid="feature-vote"
            >
              <div className="w-16 h-16 bg-gorkhali-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Vote className="text-gorkhali-red" size={32} />
              </div>
              <h3 className="font-bebas text-2xl text-peace-blue tracking-wider mb-3">
                CAST YOUR VOTE
              </h3>
              <p className="font-inter text-gray-600 mb-6">
                Choose your preferred candidate for Prime Minister in this simulation.
                Anonymous voting ensures privacy.
              </p>
              <Link to="/vote">
                <Button className="btn-primary">
                  VOTE NOW <ChevronRight size={16} className="ml-1" />
                </Button>
              </Link>
            </motion.div>

            {/* Results Feature */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="candidate-card bg-white border border-gray-200 p-8 text-center"
              data-testid="feature-results"
            >
              <div className="w-16 h-16 bg-rsp-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="text-rsp-blue" size={32} />
              </div>
              <h3 className="font-bebas text-2xl text-peace-blue tracking-wider mb-3">
                LIVE RESULTS
              </h3>
              <p className="font-inter text-gray-600 mb-6">
                Watch the results update in real-time with beautiful charts
                and detailed vote analytics.
              </p>
              <Link to="/results">
                <Button className="btn-secondary">
                  VIEW RESULTS <ChevronRight size={16} className="ml-1" />
                </Button>
              </Link>
            </motion.div>

            {/* History Feature */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="candidate-card bg-white border border-gray-200 p-8 text-center"
              data-testid="feature-history"
            >
              <div className="w-16 h-16 bg-marigold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <History className="text-marigold" size={32} />
              </div>
              <h3 className="font-bebas text-2xl text-peace-blue tracking-wider mb-3">
                ELECTION HISTORY
              </h3>
              <p className="font-inter text-gray-600 mb-6">
                Explore data from past elections, compare party performances,
                and understand Nepal's political evolution.
              </p>
              <Link to="/history">
                <Button className="btn-secondary">
                  EXPLORE <ChevronRight size={16} className="ml-1" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-peace-blue" data-testid="stats-section">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-white"
            >
              <Users className="mx-auto mb-3" size={40} />
              <p className="font-bebas text-4xl tracking-wider">30M+</p>
              <p className="font-inter text-gray-300">Population of Nepal</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-white"
            >
              <Shield className="mx-auto mb-3" size={40} />
              <p className="font-bebas text-4xl tracking-wider">2008</p>
              <p className="font-inter text-gray-300">Republic Declared</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-white"
            >
              <Globe className="mx-auto mb-3" size={40} />
              <p className="font-bebas text-4xl tracking-wider">7</p>
              <p className="font-inter text-gray-300">Federal Provinces</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-rice-paper" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-bebas text-3xl sm:text-4xl text-peace-blue tracking-wider mb-6">
              READY TO MAKE YOUR VOICE HEARD?
            </h2>
            <p className="font-inter text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of others in this election simulation. Your vote matters—
              even in a simulation, it represents the democratic spirit of Nepal.
            </p>
            <Link to="/vote">
              <Button className="btn-primary text-lg px-12 py-6" data-testid="cta-vote-btn">
                <Vote className="mr-2" size={24} />
                CAST YOUR VOTE
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
