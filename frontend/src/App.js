import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import VotingPage from "@/pages/VotingPage";
import ResultsPage from "@/pages/ResultsPage";
import HistoryPage from "@/pages/HistoryPage";
import GamesPage from "@/pages/GamesPage";
import NewsPage from "@/pages/NewsPage";
import ConstituenciesPage from "@/pages/ConstituenciesPage";
import SportsPage from "@/pages/SportsPage";

// Initialize Firebase
import "@/firebase";

function App() {
  // Register Service Worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered:', registration);
          })
          .catch((error) => {
            console.log('SW registration failed:', error);
          });
      });
    }
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/vote" element={<VotingPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/constituencies" element={<ConstituenciesPage />} />
            <Route path="/sports" element={<SportsPage />} />
          </Routes>
        </Layout>
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
