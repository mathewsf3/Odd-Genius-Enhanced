import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
// Temporarily import components directly to bypass TypeScript module issues
import LiveMatches from "./pages/LiveMatches";
import SpecialMatch from "./pages/SpecialMatch";
import SpecialMatchFooty from "./pages/SpecialMatchFooty";
import PremiumTipsPage from "./pages/PremiumTipsPage";
import LeagueAnalysis from "./pages/LeagueAnalysis";
import Performance from "./pages/Performance";
import Profile from "./pages/Profile";
import Leagues from "./pages/Leagues";
import OddGeniusAI from "./pages/OddGeniusAI";
// AI Team import removed
import { useDisclosure, IconButton } from "@chakra-ui/react";
import { FiMenu } from "react-icons/fi";
import Sidebar from "./components/layout/Sidebar";
import MobileSidebar from "./components/layout/MobileSidebar";


const App: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Router>
      <div style={{ minHeight: '100vh' }}>
        <div style={{ display: 'flex' }}>
          {/* Desktop sidebar - only visible on desktop */}
          <div style={{
            display: window.innerWidth >= 768 ? 'block' : 'none',
            position: 'fixed',
            left: 0,
            width: '240px',
            height: '100vh',
            zIndex: 5
          }}>
            <Sidebar />
          </div>

          {/* Mobile sidebar */}
          <MobileSidebar isOpen={isOpen} onClose={onClose} />

          {/* Mobile menu button */}
          <IconButton
            aria-label="Open menu"
            icon={<FiMenu />}
            onClick={onOpen}
            style={{
              position: 'fixed',
              top: '16px',
              left: '16px',
              zIndex: 4,
              display: window.innerWidth < 768 ? 'flex' : 'none'
            }}
            variant="ghost"
            size="lg"
          />

          {/* Main content area */}
          <div style={{
            marginLeft: window.innerWidth >= 768 ? '240px' : '0',
            padding: window.innerWidth >= 768 ? '32px' : '24px',
            paddingTop: window.innerWidth >= 768 ? '32px' : '56px',
            width: '100%'
          }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/live" element={<LiveMatches key="live" />} />
              <Route path="/upcoming" element={<LiveMatches key="upcoming" isUpcoming={true} />} />
              <Route path="/leagues" element={<Leagues />} />
              <Route path="/match/:id" element={<SpecialMatch />} />
              <Route path="/match-footy/:matchId" element={<SpecialMatchFooty />} />
              <Route path="/premium-tips" element={<PremiumTipsPage />} />
              <Route path="/league-analysis/:leagueName" element={<LeagueAnalysis />} />
              <Route path="/performance" element={<Performance />} />
              <Route path="/odd-genius-ai" element={<OddGeniusAI />} />
              {/* AI Team route removed */}
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
