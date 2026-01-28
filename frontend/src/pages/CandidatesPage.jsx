import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Users, MapPin, Search, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Featured national leaders (static for now – backed by public info)
const FEATURED_LEADERS = [
  {
    id: "balen-shah",
    name: "Balendra Shah (Balen)",
    party: "Rastriya Swatantra Party / Independent",
    role: "Prime Ministerial Candidate (2082)",
    constituency: "Kathmandu Metropolitan City",
    image_url:
      "https://upload.wikimedia.org/wikipedia/commons/4/4a/Balen_Shah.jpg",
  },
  {
    id: "sher-bahadur-deuba",
    name: "Sher Bahadur Deuba",
    party: "Nepali Congress",
    role: "Former Prime Minister",
    constituency: "Dadeldhura (Federal)",
    image_url:
      "https://upload.wikimedia.org/wikipedia/commons/8/82/Sher_Bahadur_Deuba_2021.jpg",
  },
  {
    id: "kp-sharma-oli",
    name: "K.P. Sharma Oli",
    party: "CPN-UML",
    role: "Former Prime Minister",
    constituency: "Jhapa (Federal)",
    image_url:
      "https://upload.wikimedia.org/wikipedia/commons/e/e2/K.P._Sharma_Oli.jpg",
  },
  {
    id: "prachanda",
    name: "Pushpa Kamal Dahal (Prachanda)",
    party: "CPN (Maoist Centre)",
    role: "Former Prime Minister",
    constituency: "Gorkha / Kathmandu (Federal, past elections)",
    image_url:
      "https://upload.wikimedia.org/wikipedia/commons/3/3a/Pushpa_Kamal_Dahal_2015-01-06.jpg",
  },
  {
    id: "rabi-lamichhane",
    name: "Rabi Lamichhane",
    party: "Rastriya Swatantra Party",
    role: "Party President",
    constituency: "Chitwan-2 (Federal, 2079)",
    image_url:
      "https://upload.wikimedia.org/wikipedia/commons/2/2d/Rabi_Lamichhane_2019.jpg",
  },
];

const NATIONAL_PARTIES_2026 = [
  {
    id: "nepali-congress",
    name: "Nepali Congress",
    founded: "1950",
    intro:
      "Centrist to center-left democratic party with a long role in Nepal's parliamentary politics.",
    rise:
      "Maintained national-party status by winning FPTP seats and clearing the PR vote threshold; continues to hold federal representation.",
    wiki: "https://en.wikipedia.org/wiki/Nepali_Congress",
  },
  {
    id: "cpn-uml",
    name: "CPN-UML",
    founded: "1991",
    intro:
      "Left-wing party rooted in Marxist–Leninist ideology with a nationwide organization.",
    rise:
      "Sustained national-party status through strong PR vote share and FPTP wins; remains a major force in the federal parliament.",
    wiki:
      "https://en.wikipedia.org/wiki/Communist_Party_of_Nepal_(Unified_Marxist%E2%80%93Leninist)",
  },
  {
    id: "ncp",
    name: "Nepali Communist Party",
    founded: "2025",
    intro:
      "Left-wing party formed through regrouping on the communist spectrum.",
    rise:
      "Recognized as a national party after meeting Election Commission thresholds in recent elections.",
    wiki: "https://en.wikipedia.org/wiki/Nepali_Communist_Party",
  },
  {
    id: "rsp",
    name: "Rastriya Swatantra Party",
    founded: "2022",
    intro:
      "Centrist reform-oriented party emphasizing governance, anti-corruption, and service delivery.",
    rise:
      "Rapid national rise and parliamentary representation helped it secure national-party status.",
    wiki: "https://en.wikipedia.org/wiki/Rastriya_Swatantra_Party",
  },
  {
    id: "rpp",
    name: "Rastriya Prajatantra Party",
    founded: "1990",
    intro:
      "Center-right party known for monarchist and conservative platforms.",
    rise:
      "Maintained national-party status with continued parliamentary presence.",
    wiki: "https://en.wikipedia.org/wiki/Rastriya_Prajatantra_Party",
  },
  {
    id: "psp-2024",
    name: "People's Socialist Party (Nepal, 2024)",
    founded: "2024",
    intro:
      "Centre-left party focused on democratic socialism and minority rights.",
    rise:
      "Gained representation and met national-party criteria in recent elections.",
    wiki:
      "https://en.wikipedia.org/wiki/People%27s_Socialist_Party_(Nepal,_2024)",
  },
  {
    id: "janamat",
    name: "Janamat Party",
    founded: "2019",
    intro:
      "Centre-left party with a strong regional base and social-democratic messaging.",
    rise:
      "Expanded its electoral footprint to qualify for national-party recognition.",
    wiki: "https://en.wikipedia.org/wiki/Janamat_Party",
  },
  {
    id: "psp-2020",
    name: "People's Socialist Party, Nepal (2020)",
    founded: "2020",
    intro:
      "Centre-left party emphasizing democratic socialism and minority rights.",
    rise:
      "Retained parliamentary presence and crossed national-party thresholds.",
    wiki:
      "https://en.wikipedia.org/wiki/People%27s_Socialist_Party,_Nepal_(2020)",
  },
  {
    id: "pdlp",
    name: "Pragatisheel Loktantrik Party",
    founded: "2025",
    intro: "Left-wing party with democratic socialist orientation.",
    rise:
      "Recognized nationally after recent electoral performance and EC criteria.",
    wiki: "https://en.wikipedia.org/wiki/Pragatisheel_Loktantrik_Party",
  },
];

const OTHER_FEDERAL_PARTIES_2026 = [
  {
    id: "nmkp",
    name: "Nepal Majdoor Kisan Party",
    founded: "1975",
    intro: "Far-left party with a long-standing base in local politics.",
    rise:
      "Holds FPTP representation, keeping a presence in the federal parliament.",
    wiki: "https://en.wikipedia.org/wiki/Nepal_Workers_and_Peasants_Party",
  },
  {
    id: "janamorcha",
    name: "Rastriya Janamorcha",
    founded: "2006",
    intro:
      "Far-left party with an anti-federalist and Marxist–Leninist orientation.",
    rise:
      "Maintains representation through direct seats despite lower PR share.",
    wiki: "https://en.wikipedia.org/wiki/Rastriya_Janamorcha",
  },
  {
    id: "ajp",
    name: "Aam Janata Party",
    founded: "2022",
    intro: "Left-leaning party with a regional base and populist platform.",
    rise: "Secured parliamentary presence via FPTP seats.",
    wiki: "https://en.wikipedia.org/wiki/Aam_Janata_Party",
  },
];

const CandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [prData, setPrData] = useState(null);
  const [prLoading, setPrLoading] = useState(true);
  const [wikiMap, setWikiMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // #region agent log
        fetch("http://127.0.0.1:7242/ingest/6647134a-5b06-4207-b778-8ca496e9a849", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "CandidatesPage.jsx:204",
            message: "Fetching simulation candidates",
            data: { url: `${API}/candidates` },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "pre-fix",
            hypothesisId: "H2",
          }),
        }).catch(() => {});
        // #endregion agent log
        const res = await axios.get(`${API}/candidates`);
        setCandidates(res.data || []);
      } catch (e) {
        // #region agent log
        fetch("http://127.0.0.1:7242/ingest/6647134a-5b06-4207-b778-8ca496e9a849", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "CandidatesPage.jsx:216",
            message: "Candidates fetch error",
            data: {
              message: e?.message,
              status: e?.response?.status ?? null,
              url: e?.config?.url ?? null,
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "pre-fix",
            hypothesisId: "H2",
          }),
        }).catch(() => {});
        // #endregion agent log
        toast.error("Failed to load simulation candidates");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchPrCandidates = async () => {
      try {
        const res = await axios.get(`${API}/ec/pr-candidates`);
        setPrData(res.data || null);
      } catch (e) {
        toast.error("Failed to load official PR candidates");
      } finally {
        setPrLoading(false);
      }
    };
    fetchPrCandidates();
  }, []);

  useEffect(() => {
    const loadWikiImages = async () => {
      if (!prData?.parties?.length) return;
      const names = prData.parties.flatMap((p) =>
        (p.candidates || []).map((c) => c.name)
      );
      const chunkSize = 25;
      for (let i = 0; i < names.length; i += chunkSize) {
        const chunk = names.slice(i, i + chunkSize);
        try {
          const res = await axios.post(`${API}/wiki/batch`, { queries: chunk });
          const results = res.data?.results || {};
          setWikiMap((prev) => ({ ...prev, ...results }));
        } catch (e) {
          console.warn("Wiki batch failed", e);
        }
      }
    };
    loadWikiImages();
  }, [prData]);

  const filteredFeatured = FEATURED_LEADERS.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.party.toLowerCase().includes(search.toLowerCase()) ||
      c.constituency.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSimCandidates = (candidates || []).filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.party || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-night-count">
      {/* Ticker */}
      <div className="bg-gradient-to-r from-gorkhali-red via-peace-blue to-gorkhali-red py-3 overflow-hidden">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: [0, -1800] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(4)].map((_, i) => (
            <span
              key={i}
              className="mx-8 text-white font-bebas tracking-wider text-sm"
            >
              🧑‍💼 CANDIDATES • DEUBA • OLI • PRACHANDA • BALEN • RABI • ALL MAJOR PARTIES •{" "}
              <span className="text-marigold">★</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* Hero */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gorkhali-red/20 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-10 right-10 w-72 h-72 bg-rsp-blue/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <Users className="mx-auto text-marigold" size={64} />
            </motion.div>
            <h1
              className="font-bebas text-5xl sm:text-6xl text-white tracking-wider mb-4"
              style={{ textShadow: "0 0 60px rgba(247,127,0,0.5)" }}
            >
              CANDIDATES
            </h1>
            <p className="font-playfair text-xl text-gray-300 italic mb-2">
              "From veteran leaders to a new generation of reformers"
            </p>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto">
              Top national leaders at the top, plus the five simulated candidates used
              in this Prime Minister election game. For the full official list of PR
              candidates, see the Election Commission link below.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Search + tabs */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <Input
                placeholder="Search by name, party, or constituency..."
                className="pl-9 bg-white/5 border-white/10 text-sm text-white placeholder:text-gray-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full md:w-auto"
            >
              <TabsList className="grid grid-cols-3 w-full md:w-[28rem]">
                <TabsTrigger value="featured" className="font-bebas tracking-wider">
                  MAJOR LEADERS
                </TabsTrigger>
                <TabsTrigger value="simulation" className="font-bebas tracking-wider">
                  GAME PLAYERS
                </TabsTrigger>
                <TabsTrigger value="official" className="font-bebas tracking-wider">
                  PR 2082
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="featured" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFeatured.map((c) => (
                  <motion.div
                    key={c.id}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4 flex gap-4"
                  >
                    {c.image_url ? (
                      <img
                        src={c.image_url}
                        alt={c.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-marigold"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                        <Users className="text-gray-400" size={24} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <h3 className="font-bebas text-lg text-white tracking-wider truncate">
                        {c.name}
                      </h3>
                      <p className="text-sm text-marigold truncate">{c.party}</p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{c.role}</p>
                      <p className="text-xs text-gray-300 mt-2 flex items-center gap-1">
                        <MapPin size={12} className="text-gorkhali-red" />
                        {c.constituency}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="simulation" className="mt-4">
              {loading ? (
                <div className="flex justify-center py-16">
                  <motion.div
                    className="w-10 h-10 border-4 border-marigold border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                </div>
              ) : filteredSimCandidates.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSimCandidates.map((c) => (
                    <motion.div
                      key={c.id}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4 flex gap-4"
                    >
                      {c.image_url ? (
                        <img
                          src={c.image_url}
                          alt={c.name}
                          className="w-16 h-16 rounded-full object-cover border-2"
                          style={{ borderColor: c.party_color || "#F77F00" }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                          <Users className="text-gray-400" size={24} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 text-left">
                        <h3 className="font-bebas text-lg text-white tracking-wider truncate">
                          {c.name}
                        </h3>
                        <p
                          className="text-sm truncate"
                          style={{ color: c.party_color || "#F77F00" }}
                        >
                          {c.party}
                        </p>
                        {c.slogan && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                            “{c.slogan}”
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-gray-400 text-sm font-inter">
                  No simulation candidates loaded.
                </div>
              )}
            </TabsContent>

            <TabsContent value="official" className="mt-4">
              {prLoading ? (
                <div className="flex justify-center py-16">
                  <motion.div
                    className="w-10 h-10 border-4 border-marigold border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                </div>
              ) : prData?.parties?.length ? (
                <div className="space-y-8">
                  {prData.parties.map((party) => (
                    <div key={party.party}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bebas text-xl text-white tracking-wider">
                          {party.party}
                        </h4>
                        <span className="text-xs text-gray-400">
                          {(party.candidates || []).length} candidates
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(party.candidates || []).map((candidate) => {
                          const wiki = wikiMap[candidate.name];
                          return (
                            <div
                              key={`${party.party}-${candidate.name}`}
                              className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-4"
                            >
                              {wiki?.image_url ? (
                                <img
                                  src={wiki.image_url}
                                  alt={candidate.name}
                                  className="w-14 h-14 rounded-full object-cover border-2 border-marigold"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                                  <Users className="text-gray-400" size={20} />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm text-white font-inter truncate">
                                  {candidate.name}
                                </p>
                                {wiki?.page_url ? (
                                  <a
                                    href={wiki.page_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-marigold hover:text-white"
                                  >
                                    Wikipedia profile →
                                  </a>
                                ) : (
                                  <span className="text-xs text-gray-500">
                                    Wikipedia profile not found
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {prData.unassigned?.length ? (
                    <div>
                      <h4 className="font-bebas text-xl text-white tracking-wider mb-3">
                        Unassigned / Unparsed
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {prData.unassigned.map((name) => (
                          <div
                            key={`unassigned-${name}`}
                            className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-gray-300"
                          >
                            {name}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="py-10 text-center text-gray-400 text-sm font-inter">
                  No official PR candidates parsed yet.
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Official PR list callout */}
          <div className="mt-10 max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-lg p-5">
            <h3 className="font-bebas text-lg text-white tracking-wider mb-2 flex items-center gap-2">
              <Globe size={18} className="text-marigold" />
              OFFICIAL PR CANDIDATE LIST (2082)
            </h3>
            <p className="font-inter text-xs text-gray-300 mb-2">
              For the full proportional‑representation (PR) candidate list published by
              the Election Commission of Nepal, open the official PDF below. This
              document contains all approved PR candidates for the 2082 House of
              Representatives election.
            </p>
            <a
              href="https://election.gov.np/admin/public//storage/HOR%202082/PR/PreliminaryCandidateListPR.pdf"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs text-marigold hover:text-white font-inter mt-1"
            >
              View official PR candidate PDF
            </a>
            <p className="font-inter text-[11px] text-gray-500 mt-1">
              Note: this is a preliminary PR list; FPTP constituency‑wise candidate
              details will be integrated in a later update.
            </p>
          </div>

          {/* Political parties 2026 */}
          <div className="mt-12">
            <h3 className="font-bebas text-2xl text-white tracking-wider mb-2">
              POLITICAL PARTIES IN NEPAL (2026)
            </h3>
            <p className="text-sm text-gray-400 max-w-3xl">
              Brief introductions and recent rise/standing for parties currently
              recognized in national or federal parliamentary representation. Each
              card links to the full Wikipedia entry for reference.
            </p>

            <div className="mt-6">
              <h4 className="font-bebas text-lg text-marigold tracking-wider mb-3">
                National Parties
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {NATIONAL_PARTIES_2026.map((party) => (
                  <div
                    key={party.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="font-bebas text-lg text-white tracking-wider">
                        {party.name}
                      </h5>
                      <span className="text-xs text-gray-400">{party.founded}</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-2">{party.intro}</p>
                    <p className="text-xs text-gray-400 mt-2">{party.rise}</p>
                    <a
                      href={party.wiki}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-marigold hover:text-white mt-3"
                    >
                      Wikipedia reference →
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h4 className="font-bebas text-lg text-marigold tracking-wider mb-3">
                Other Parties in Federal Parliament
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {OTHER_FEDERAL_PARTIES_2026.map((party) => (
                  <div
                    key={party.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="font-bebas text-lg text-white tracking-wider">
                        {party.name}
                      </h5>
                      <span className="text-xs text-gray-400">{party.founded}</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-2">{party.intro}</p>
                    <p className="text-xs text-gray-400 mt-2">{party.rise}</p>
                    <a
                      href={party.wiki}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-marigold hover:text-white mt-3"
                    >
                      Wikipedia reference →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple footer */}
      <footer className="bg-black py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            © 2026 Nepali Ballot • Candidates View 🇳🇵
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CandidatesPage;

