import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, Vote, Sun, TreeDeciduous, Bell, Gavel, Shield, Loader2 } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Map party symbols to icons
const partyIcons = {
  Sun: Sun,
  TreeDeciduous: TreeDeciduous,
  Bell: Bell,
  Gavel: Gavel,
};

// Generate or get voter token from localStorage
const getVoterToken = () => {
  let token = localStorage.getItem("voter_token");
  if (!token) {
    token = `voter_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem("voter_token", token);
  }
  return token;
};

const VotingPage = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedFor, setVotedFor] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    fetchCandidates();
    checkVoteStatus();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get(`${API}/candidates`);
      setCandidates(response.data);
    } catch (error) {
      toast.error("Failed to load candidates");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkVoteStatus = async () => {
    try {
      const voterToken = getVoterToken();
      const response = await axios.get(`${API}/check-vote/${voterToken}`);
      if (response.data.has_voted) {
        setHasVoted(true);
        setVotedFor(response.data.candidate_id);
      }
    } catch (error) {
      console.error("Error checking vote status:", error);
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate) {
      toast.error("Please select a candidate first");
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmVote = async () => {
    setSubmitting(true);
    setShowConfirmDialog(false);
    
    try {
      const voterToken = getVoterToken();
      await axios.post(`${API}/vote`, {
        candidate_id: selectedCandidate.id,
        voter_token: voterToken,
      });
      
      toast.success("Your vote has been cast successfully!");
      setHasVoted(true);
      setVotedFor(selectedCandidate.id);
      
      // Navigate to results after a short delay
      setTimeout(() => {
        navigate("/results");
      }, 2000);
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error("You have already voted in this election");
        setHasVoted(true);
      } else {
        toast.error("Failed to cast vote. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getVotedCandidate = () => {
    return candidates.find((c) => c.id === votedFor);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rice-paper">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="font-inter text-peace-blue">Loading candidates...</p>
        </div>
      </div>
    );
  }

  // Already voted view
  if (hasVoted) {
    const votedCandidate = getVotedCandidate();
    return (
      <div className="min-h-screen bg-rice-paper py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-congress-green rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="text-white" size={48} />
          </motion.div>
          
          <h1 className="font-bebas text-4xl text-peace-blue tracking-wider mb-4" data-testid="voted-heading">
            THANK YOU FOR VOTING!
          </h1>
          
          <p className="font-inter text-gray-600 mb-8">
            Your voice has been heard. You voted for:
          </p>
          
          {votedCandidate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-2 border-congress-green p-6 rounded-sm inline-block"
              data-testid="voted-candidate-card"
            >
              <img
                src={votedCandidate.image_url}
                alt={votedCandidate.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              <h2 className="font-bebas text-2xl text-peace-blue">{votedCandidate.name}</h2>
              <p className="font-inter text-sm text-gray-500">{votedCandidate.party}</p>
            </motion.div>
          )}
          
          <div className="mt-8">
            <Button
              onClick={() => navigate("/results")}
              className="btn-primary"
              data-testid="view-results-btn"
            >
              VIEW LIVE RESULTS
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rice-paper">
      {/* Header */}
      <div className="bg-peace-blue py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-bebas text-4xl sm:text-5xl text-white tracking-wider mb-4" data-testid="voting-heading">
              CAST YOUR VOTE
            </h1>
            <p className="font-inter text-gray-300">
              Select your preferred candidate for Prime Minister
            </p>
          </motion.div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 p-4 flex items-center gap-3 shadow-sm"
          data-testid="privacy-notice"
        >
          <Shield className="text-congress-green flex-shrink-0" size={24} />
          <p className="font-inter text-sm text-gray-600">
            <strong>Anonymous Voting:</strong> Your vote is private and cannot be traced back to you.
            Each browser can only vote once.
          </p>
        </motion.div>
      </div>

      {/* Candidates Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="candidates-grid">
          {candidates.map((candidate, index) => {
            const IconComponent = partyIcons[candidate.party_symbol] || Bell;
            const isSelected = selectedCandidate?.id === candidate.id;
            
            return (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedCandidate(candidate)}
                className={`candidate-card bg-white border-2 p-6 cursor-pointer ${
                  isSelected
                    ? "border-gorkhali-red selected"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                data-testid={`candidate-card-${candidate.id}`}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-gorkhali-red rounded-full flex items-center justify-center">
                    <Check className="text-white" size={16} />
                  </div>
                )}
                
                {/* Party Symbol */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${candidate.party_color}20` }}
                >
                  <IconComponent
                    size={32}
                    style={{ color: candidate.party_color }}
                  />
                </div>
                
                {/* Candidate Image */}
                <img
                  src={candidate.image_url}
                  alt={candidate.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-gray-100"
                />
                
                {/* Candidate Info */}
                <h3 className="font-bebas text-xl text-peace-blue tracking-wider text-center">
                  {candidate.name}
                </h3>
                <p
                  className="font-inter text-sm text-center mb-2"
                  style={{ color: candidate.party_color }}
                >
                  {candidate.party}
                </p>
                <p className="font-playfair text-sm text-gray-500 text-center italic">
                  "{candidate.slogan}"
                </p>
                
                {/* Bio (truncated) */}
                <p className="font-inter text-xs text-gray-400 text-center mt-3 line-clamp-2">
                  {candidate.bio}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Vote Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Button
            onClick={handleVote}
            disabled={!selectedCandidate || submitting}
            className="btn-primary text-lg px-12 py-6 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="submit-vote-btn"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={20} />
                SUBMITTING...
              </>
            ) : (
              <>
                <Vote className="mr-2" size={20} />
                SUBMIT VOTE
              </>
            )}
          </Button>
          
          {!selectedCandidate && (
            <p className="font-inter text-sm text-gray-500 mt-4">
              Click on a candidate card to select
            </p>
          )}
        </motion.div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent data-testid="confirm-vote-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bebas text-2xl tracking-wider">
              CONFIRM YOUR VOTE
            </AlertDialogTitle>
            <AlertDialogDescription className="font-inter">
              You are about to vote for{" "}
              <strong>{selectedCandidate?.name}</strong> ({selectedCandidate?.party}).
              <br /><br />
              This action cannot be undone. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bebas tracking-wider" data-testid="cancel-vote-btn">
              CANCEL
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmVote}
              className="btn-primary"
              data-testid="confirm-vote-btn"
            >
              CONFIRM VOTE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VotingPage;
