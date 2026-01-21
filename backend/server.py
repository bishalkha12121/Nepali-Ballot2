from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import httpx
import xml.etree.ElementTree as ET
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============== MODELS ==============

class Candidate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    party: str
    party_symbol: str  # Icon name from lucide-react
    party_color: str
    party_flag_url: Optional[str] = None
    image_url: str
    bio: str
    slogan: str

class CandidateCreate(BaseModel):
    name: str
    party: str
    party_symbol: str
    party_color: str
    image_url: str
    bio: str
    slogan: str

class Vote(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    candidate_id: str
    voter_token: str  # Anonymous token to prevent duplicate votes
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VoteCreate(BaseModel):
    candidate_id: str
    voter_token: str

class VoteResult(BaseModel):
    candidate_id: str
    candidate_name: str
    party: str
    party_color: str
    vote_count: int
    percentage: float

class HistoricalElection(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    year: int
    election_type: str
    results: List[dict]  # [{party, seats, vote_share}]
    total_voters: int
    turnout_percentage: float

# ============== SEED DATA ==============

CANDIDATES_DATA = [
    {
        "id": "balen-shah",
        "name": "Balen Shah",
        "party": "Independent / RSP Alliance",
        "party_symbol": "Bell",
        "party_color": "#48CAE4",
        "party_flag_url": "/flags/rsp-logo.svg",
        "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
        "bio": "Engineer, rapper, and the Mayor of Kathmandu Metropolitan City since 2022. Known for his anti-corruption stance and urban development initiatives.",
        "slogan": "Build Nepal, Build Future"
    },
    {
        "id": "kp-sharma-oli",
        "name": "KP Sharma Oli",
        "party": "CPN-UML",
        "party_symbol": "Sun",
        "party_color": "#EF233C",
        "party_flag_url": "/flags/cpn-uml.svg",
        "image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
        "bio": "Chairman of CPN-UML and former Prime Minister of Nepal. A veteran communist leader with decades of political experience.",
        "slogan": "Prosperous Nepal, Happy Nepali"
    },
    {
        "id": "sher-bahadur-deuba",
        "name": "Sher Bahadur Deuba",
        "party": "Nepali Congress",
        "party_symbol": "TreeDeciduous",
        "party_color": "#2A9D8F",
        "party_flag_url": "/flags/nepali-congress.svg",
        "image_url": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
        "bio": "President of Nepali Congress and five-time Prime Minister. A key figure in Nepal's democratic movement and constitutional development.",
        "slogan": "Democracy for All"
    },
    {
        "id": "pushpa-kamal-dahal",
        "name": "Pushpa Kamal Dahal (Prachanda)",
        "party": "CPN-Maoist Centre",
        "party_symbol": "Hammer",
        "party_color": "#B91C1C",
        "party_flag_url": "/flags/cpn-maoist.svg",
        "image_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face",
        "bio": "Chairman of CPN-Maoist Centre and current Prime Minister. Former guerrilla leader who led the Maoist insurgency and joined mainstream politics.",
        "slogan": "People's Power, People's Government"
    },
    {
        "id": "rabi-lamichhane",
        "name": "Rabi Lamichhane",
        "party": "Rastriya Swatantra Party (RSP)",
        "party_symbol": "Bell",
        "party_color": "#48CAE4",
        "party_flag_url": "/flags/rsp-logo.svg",
        "image_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
        "bio": "Founder of Rastriya Swatantra Party and former journalist. Known for his investigative journalism show 'Sidha Kura Janata Sanga'.",
        "slogan": "New Politics, New Nepal"
    }
]

# Nepal's 7 Provinces
PROVINCES = [
    {"id": "koshi", "name": "Koshi Province", "capital": "Biratnagar", "federal_seats": 28, "provincial_seats": 56},
    {"id": "madhesh", "name": "Madhesh Province", "capital": "Janakpur", "federal_seats": 32, "provincial_seats": 64},
    {"id": "bagmati", "name": "Bagmati Province", "capital": "Hetauda", "federal_seats": 55, "provincial_seats": 110},
    {"id": "gandaki", "name": "Gandaki Province", "capital": "Pokhara", "federal_seats": 30, "provincial_seats": 60},
    {"id": "lumbini", "name": "Lumbini Province", "capital": "Deukhuri", "federal_seats": 43, "provincial_seats": 87},
    {"id": "karnali", "name": "Karnali Province", "capital": "Birendranagar", "federal_seats": 20, "provincial_seats": 40},
    {"id": "sudurpashchim", "name": "Sudurpashchim Province", "capital": "Godawari", "federal_seats": 26, "provincial_seats": 52}
]

HISTORICAL_DATA = [
    {
        "id": "federal-2017",
        "year": 2017,
        "election_type": "Federal Parliament Election (House of Representatives)",
        "description": "First federal election after 2015 Constitution. Left alliance (UML + Maoist) won majority.",
        "results": [
            {"party": "CPN-UML", "seats": 121, "vote_share": 33.2, "color": "#EF233C", "symbol": "Sun"},
            {"party": "Nepali Congress", "seats": 63, "vote_share": 26.9, "color": "#2A9D8F", "symbol": "Tree"},
            {"party": "CPN-Maoist Centre", "seats": 53, "vote_share": 13.7, "color": "#B91C1C", "symbol": "Hammer"},
            {"party": "Rastriya Janata Party", "seats": 17, "vote_share": 6.1, "color": "#F59E0B", "symbol": "Chair"},
            {"party": "Sanghiya Samajbadi Forum", "seats": 16, "vote_share": 4.2, "color": "#8B5CF6", "symbol": "Flag"},
            {"party": "Others", "seats": 5, "vote_share": 15.9, "color": "#6B7280", "symbol": "Circle"}
        ],
        "total_seats": 275,
        "total_voters": 15427730,
        "votes_cast": 10413519,
        "turnout_percentage": 67.5,
        "by_province": [
            {"province": "Koshi", "winner": "CPN-UML", "seats_uml": 16, "seats_congress": 5, "seats_maoist": 6, "seats_others": 1},
            {"province": "Madhesh", "winner": "RJP/SSF", "seats_uml": 2, "seats_congress": 6, "seats_maoist": 2, "seats_others": 22},
            {"province": "Bagmati", "winner": "CPN-UML", "seats_uml": 28, "seats_congress": 12, "seats_maoist": 10, "seats_others": 5},
            {"province": "Gandaki", "winner": "CPN-UML", "seats_uml": 18, "seats_congress": 5, "seats_maoist": 5, "seats_others": 2},
            {"province": "Lumbini", "winner": "CPN-UML", "seats_uml": 22, "seats_congress": 10, "seats_maoist": 8, "seats_others": 3},
            {"province": "Karnali", "winner": "CPN-UML", "seats_uml": 11, "seats_congress": 3, "seats_maoist": 5, "seats_others": 1},
            {"province": "Sudurpashchim", "winner": "CPN-UML", "seats_uml": 14, "seats_congress": 8, "seats_maoist": 3, "seats_others": 1}
        ]
    },
    {
        "id": "federal-2022",
        "year": 2022,
        "election_type": "Federal Parliament Election (House of Representatives)",
        "description": "Second federal election. Hung parliament with no clear majority. Rise of RSP as new political force.",
        "results": [
            {"party": "Nepali Congress", "seats": 89, "vote_share": 26.2, "color": "#2A9D8F", "symbol": "Tree"},
            {"party": "CPN-UML", "seats": 78, "vote_share": 24.8, "color": "#EF233C", "symbol": "Sun"},
            {"party": "CPN-Maoist Centre", "seats": 32, "vote_share": 11.1, "color": "#B91C1C", "symbol": "Hammer"},
            {"party": "Rastriya Swatantra Party (RSP)", "seats": 20, "vote_share": 10.5, "color": "#48CAE4", "symbol": "Bell"},
            {"party": "Rastriya Prajatantra Party", "seats": 14, "vote_share": 5.3, "color": "#FFB703", "symbol": "Crown"},
            {"party": "Janata Samajbadi Party", "seats": 12, "vote_share": 4.8, "color": "#8B5CF6", "symbol": "Chair"},
            {"party": "Loktantrik Samajbadi Party", "seats": 4, "vote_share": 2.1, "color": "#10B981", "symbol": "Cycle"},
            {"party": "Janamat Party", "seats": 6, "vote_share": 3.2, "color": "#F97316", "symbol": "Globe"},
            {"party": "Nagarik Unmukti Party", "seats": 3, "vote_share": 1.4, "color": "#EC4899", "symbol": "Key"},
            {"party": "Others/Independents", "seats": 17, "vote_share": 10.6, "color": "#6B7280", "symbol": "Circle"}
        ],
        "total_seats": 275,
        "total_voters": 17988570,
        "votes_cast": 10973028,
        "turnout_percentage": 61.0,
        "by_province": [
            {"province": "Koshi", "winner": "CPN-UML", "seats_uml": 14, "seats_congress": 8, "seats_rsp": 2, "seats_others": 4},
            {"province": "Madhesh", "winner": "JSP/Others", "seats_congress": 8, "seats_uml": 4, "seats_jsp": 10, "seats_others": 10},
            {"province": "Bagmati", "winner": "Nepali Congress", "seats_congress": 22, "seats_uml": 18, "seats_rsp": 8, "seats_others": 7},
            {"province": "Gandaki", "winner": "Nepali Congress", "seats_congress": 13, "seats_uml": 10, "seats_rsp": 4, "seats_others": 3},
            {"province": "Lumbini", "winner": "Nepali Congress", "seats_congress": 18, "seats_uml": 14, "seats_maoist": 6, "seats_others": 5},
            {"province": "Karnali", "winner": "Nepali Congress", "seats_congress": 9, "seats_uml": 6, "seats_maoist": 3, "seats_others": 2},
            {"province": "Sudurpashchim", "winner": "Nepali Congress", "seats_congress": 11, "seats_uml": 8, "seats_rpp": 4, "seats_others": 3}
        ]
    },
    {
        "id": "provincial-2017",
        "year": 2017,
        "election_type": "Provincial Assembly Election",
        "description": "First provincial elections held concurrently with federal elections.",
        "results": [
            {"party": "CPN-UML", "seats": 209, "vote_share": 32.8, "color": "#EF233C", "symbol": "Sun"},
            {"party": "Nepali Congress", "seats": 106, "vote_share": 25.4, "color": "#2A9D8F", "symbol": "Tree"},
            {"party": "CPN-Maoist Centre", "seats": 97, "vote_share": 13.5, "color": "#B91C1C", "symbol": "Hammer"},
            {"party": "Rastriya Janata Party", "seats": 34, "vote_share": 6.8, "color": "#F59E0B", "symbol": "Chair"},
            {"party": "Sanghiya Samajbadi Forum", "seats": 27, "vote_share": 4.5, "color": "#8B5CF6", "symbol": "Flag"},
            {"party": "Others", "seats": 77, "vote_share": 17.0, "color": "#6B7280", "symbol": "Circle"}
        ],
        "total_seats": 550,
        "total_voters": 15427730,
        "votes_cast": 10413519,
        "turnout_percentage": 67.5
    },
    {
        "id": "provincial-2022",
        "year": 2022,
        "election_type": "Provincial Assembly Election",
        "description": "Second provincial elections. RSP emerged as a significant new force.",
        "results": [
            {"party": "Nepali Congress", "seats": 151, "vote_share": 25.8, "color": "#2A9D8F", "symbol": "Tree"},
            {"party": "CPN-UML", "seats": 138, "vote_share": 24.2, "color": "#EF233C", "symbol": "Sun"},
            {"party": "CPN-Maoist Centre", "seats": 58, "vote_share": 10.8, "color": "#B91C1C", "symbol": "Hammer"},
            {"party": "Rastriya Swatantra Party (RSP)", "seats": 37, "vote_share": 9.8, "color": "#48CAE4", "symbol": "Bell"},
            {"party": "Rastriya Prajatantra Party", "seats": 25, "vote_share": 5.1, "color": "#FFB703", "symbol": "Crown"},
            {"party": "Janata Samajbadi Party", "seats": 22, "vote_share": 4.6, "color": "#8B5CF6", "symbol": "Chair"},
            {"party": "Others/Independents", "seats": 119, "vote_share": 19.7, "color": "#6B7280", "symbol": "Circle"}
        ],
        "total_seats": 550,
        "total_voters": 17988570,
        "votes_cast": 10973028,
        "turnout_percentage": 61.0
    },
    {
        "id": "local-2022",
        "year": 2022,
        "election_type": "Local Level Election",
        "description": "Local body elections for mayors, deputy mayors, ward chairs across 753 local units.",
        "results": [
            {"party": "Nepali Congress", "seats": 332, "vote_share": 28.5, "color": "#2A9D8F", "symbol": "Tree"},
            {"party": "CPN-UML", "seats": 310, "vote_share": 27.1, "color": "#EF233C", "symbol": "Sun"},
            {"party": "CPN-Maoist Centre", "seats": 98, "vote_share": 12.3, "color": "#B91C1C", "symbol": "Hammer"},
            {"party": "Independent", "seats": 85, "vote_share": 15.8, "color": "#48CAE4", "symbol": "Person"},
            {"party": "Others", "seats": 78, "vote_share": 16.3, "color": "#6B7280", "symbol": "Circle"}
        ],
        "total_seats": 903,
        "total_voters": 17733723,
        "votes_cast": 11527121,
        "turnout_percentage": 65.0,
        "notable": "Balen Shah (Independent) won Kathmandu Metropolitan City Mayor with 61,767 votes, defeating NC and UML candidates."
    }
]

# ============== ENDPOINTS ==============

@api_router.get("/")
async def root():
    return {"message": "Nepal Election Simulation API"}

@api_router.delete("/refresh-candidates")
async def refresh_candidates():
    """Delete and reseed candidates with updated data"""
    await db.candidates.delete_many({})
    await db.candidates.insert_many(CANDIDATES_DATA)
    return {"message": "Candidates refreshed", "count": len(CANDIDATES_DATA)}

@api_router.get("/candidates", response_model=List[Candidate])
async def get_candidates():
    """Get all candidates"""
    # Check if candidates exist in DB, if not seed them
    count = await db.candidates.count_documents({})
    if count == 0:
        await db.candidates.insert_many(CANDIDATES_DATA)
    
    candidates = await db.candidates.find({}, {"_id": 0}).to_list(100)
    return candidates

@api_router.get("/candidates/{candidate_id}", response_model=Candidate)
async def get_candidate(candidate_id: str):
    """Get single candidate by ID"""
    candidate = await db.candidates.find_one({"id": candidate_id}, {"_id": 0})
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate

@api_router.post("/vote")
async def cast_vote(vote: VoteCreate):
    """Cast a vote (anonymous, one vote per browser token)"""
    # Check if voter already voted
    existing_vote = await db.votes.find_one({"voter_token": vote.voter_token})
    if existing_vote:
        raise HTTPException(status_code=400, detail="You have already voted in this election")
    
    # Check if candidate exists
    candidate = await db.candidates.find_one({"id": vote.candidate_id})
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Create vote
    vote_obj = Vote(
        candidate_id=vote.candidate_id,
        voter_token=vote.voter_token
    )
    doc = vote_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.votes.insert_one(doc)
    
    return {"success": True, "message": "Vote cast successfully!"}

@api_router.get("/results")
async def get_results():
    """Get current election results"""
    # Ensure candidates are seeded
    count = await db.candidates.count_documents({})
    if count == 0:
        await db.candidates.insert_many(CANDIDATES_DATA)
    
    # Get all candidates
    candidates = await db.candidates.find({}, {"_id": 0}).to_list(100)
    
    # Get vote counts using aggregation
    pipeline = [
        {"$group": {"_id": "$candidate_id", "count": {"$sum": 1}}}
    ]
    vote_counts_cursor = db.votes.aggregate(pipeline)
    vote_counts = {item["_id"]: item["count"] async for item in vote_counts_cursor}
    
    # Calculate total votes
    total_votes = sum(vote_counts.values()) if vote_counts else 0
    
    # Build results
    results = []
    for candidate in candidates:
        vote_count = vote_counts.get(candidate["id"], 0)
        percentage = (vote_count / total_votes * 100) if total_votes > 0 else 0
        results.append({
            "candidate_id": candidate["id"],
            "candidate_name": candidate["name"],
            "party": candidate["party"],
            "party_color": candidate["party_color"],
            "party_symbol": candidate["party_symbol"],
            "vote_count": vote_count,
            "percentage": round(percentage, 1)
        })
    
    # Sort by vote count descending
    results.sort(key=lambda x: x["vote_count"], reverse=True)
    
    return {
        "total_votes": total_votes,
        "results": results,
        "last_updated": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/check-vote/{voter_token}")
async def check_vote(voter_token: str):
    """Check if a voter token has already voted"""
    existing_vote = await db.votes.find_one({"voter_token": voter_token}, {"_id": 0})
    if existing_vote:
        return {"has_voted": True, "candidate_id": existing_vote.get("candidate_id")}
    return {"has_voted": False, "candidate_id": None}

@api_router.get("/provinces")
async def get_provinces():
    """Get all provinces of Nepal"""
    return PROVINCES

@api_router.get("/historical")
async def get_historical_data():
    """Get historical election data"""
    # Always return fresh data from code to ensure accuracy
    # Sort by year descending, then by election type
    sorted_data = sorted(HISTORICAL_DATA, key=lambda x: (x["year"], x["election_type"]), reverse=True)
    return sorted_data

@api_router.get("/historical/{election_id}")
async def get_historical_election(election_id: str):
    """Get specific historical election by ID"""
    for election in HISTORICAL_DATA:
        if election["id"] == election_id:
            return election
    raise HTTPException(status_code=404, detail="Election not found")

@api_router.get("/stats")
async def get_stats():
    """Get overall statistics"""
    total_votes = await db.votes.count_documents({})
    total_candidates = await db.candidates.count_documents({})
    
    return {
        "total_votes": total_votes,
        "total_candidates": total_candidates,
        "election_status": "active"
    }

# ============== GAME ENDPOINTS ==============

@api_router.get("/games/quiz-questions")
async def get_quiz_questions():
    """Get quiz questions with real Nepal politics data"""
    # Ensure candidates are loaded
    count = await db.candidates.count_documents({})
    if count == 0:
        await db.candidates.insert_many(CANDIDATES_DATA)
    
    candidates = await db.candidates.find({}, {"_id": 0}).to_list(100)
    
    questions = [
        {"id": 1, "question": "When did Nepal become a Federal Democratic Republic?", "options": ["2006", "2007", "2008", "2010"], "correct": 2, "fact": "Nepal abolished monarchy on May 28, 2008"},
        {"id": 2, "question": "How many provinces does Nepal have?", "options": ["5", "6", "7", "8"], "correct": 2, "fact": "Nepal has 7 federal provinces since 2015 constitution"},
        {"id": 3, "question": f"Which party does {candidates[1]['name']} belong to?", "options": ["Nepali Congress", candidates[1]['party'], "RSP", "Maoist Centre"], "correct": 1, "fact": f"{candidates[1]['name']} is the chairman of {candidates[1]['party']}"},
        {"id": 4, "question": "What is the symbol of Nepali Congress party?", "options": ["Sun", "Tree", "Bell", "Hammer"], "correct": 1, "fact": "Nepali Congress uses the Tree symbol since 1947"},
        {"id": 5, "question": "Which year was Jana Andolan II (People's Movement)?", "options": ["2004", "2005", "2006", "2007"], "correct": 2, "fact": "Jana Andolan II in April 2006 ended King Gyanendra's rule"},
        {"id": 6, "question": f"What is {candidates[0]['name']}'s profession before politics?", "options": ["Journalist", "Doctor", "Engineer", "Lawyer"], "correct": 2, "fact": f"{candidates[0]['name']} is a civil engineer and rapper"},
        {"id": 7, "question": "How many seats are in Nepal's Federal Parliament?", "options": ["225", "250", "275", "300"], "correct": 2, "fact": "House of Representatives has 275 seats (165 FPTP + 110 PR)"},
        {"id": 8, "question": f"Who founded {candidates[4]['party']}?", "options": ["Balen Shah", "KP Oli", candidates[4]['name'], "Prachanda"], "correct": 2, "fact": f"{candidates[4]['name']} founded RSP in 2022"},
        {"id": 9, "question": "Which is the capital of Koshi Province?", "options": ["Pokhara", "Biratnagar", "Janakpur", "Hetauda"], "correct": 1, "fact": "Biratnagar is the capital and largest city of Koshi Province"},
        {"id": 10, "question": "What year was Nepal's new constitution adopted?", "options": ["2013", "2014", "2015", "2016"], "correct": 2, "fact": "Constitution of Nepal was promulgated on September 20, 2015"},
        {"id": 11, "question": f"What is {candidates[3]['name']}'s political alias?", "options": ["Comrade", "Prachanda", "Chairman", "Leader"], "correct": 1, "fact": "Pushpa Kamal Dahal is known as Prachanda (The Fierce One)"},
        {"id": 12, "question": "Which province has the most federal seats?", "options": ["Koshi", "Madhesh", "Bagmati", "Lumbini"], "correct": 2, "fact": "Bagmati Province has 55 federal seats, the most among all provinces"},
    ]
    
    import random
    random.shuffle(questions)
    return questions[:10]

@api_router.get("/games/candidate-cards")
async def get_candidate_cards():
    """Get candidate cards with stats for card game"""
    count = await db.candidates.count_documents({})
    if count == 0:
        await db.candidates.insert_many(CANDIDATES_DATA)
    
    candidates = await db.candidates.find({}, {"_id": 0}).to_list(100)
    
    # Get vote counts
    pipeline = [{"$group": {"_id": "$candidate_id", "count": {"$sum": 1}}}]
    vote_counts = {item["_id"]: item["count"] async for item in db.votes.aggregate(pipeline)}
    
    cards = []
    for c in candidates:
        votes = vote_counts.get(c["id"], 0)
        cards.append({
            "id": c["id"],
            "name": c["name"],
            "party": c["party"],
            "party_color": c["party_color"],
            "image_url": c["image_url"],
            "slogan": c["slogan"],
            "stats": {
                "popularity": min(100, 40 + votes * 5 + hash(c["name"]) % 30),
                "experience": 50 + hash(c["party"]) % 40,
                "charisma": 45 + hash(c["slogan"]) % 45,
                "vision": 55 + hash(c["id"]) % 35,
                "votes": votes
            }
        })
    return cards

@api_router.get("/games/prediction-data")
async def get_prediction_data():
    """Get data for election prediction game"""
    results_response = await get_results()
    historical = HISTORICAL_DATA[:2]  # Get federal elections
    
    return {
        "current_results": results_response,
        "historical": historical,
        "provinces": PROVINCES
    }

@api_router.post("/games/save-score")
async def save_game_score(data: dict):
    """Save player's game score"""
    score_doc = {
        "player_id": data.get("player_id", "anonymous"),
        "game": data.get("game"),
        "score": data.get("score"),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.game_scores.insert_one(score_doc)
    return {"success": True}

@api_router.get("/games/leaderboard")
async def get_leaderboard():
    """Get top scores leaderboard"""
    pipeline = [
        {"$group": {"_id": "$player_id", "total_score": {"$sum": "$score"}, "games_played": {"$sum": 1}}},
        {"$sort": {"total_score": -1}},
        {"$limit": 10}
    ]
    leaderboard = []
    async for item in db.game_scores.aggregate(pipeline):
        leaderboard.append({
            "player_id": item["_id"],
            "total_score": item["total_score"],
            "games_played": item["games_played"]
        })
    return leaderboard

# ============== NEWS ENDPOINTS ==============

RSS_FEEDS = [
    {"id": "bbc", "name": "BBC Nepali", "url": "https://feeds.bbci.co.uk/nepali/rss.xml", "color": "#BB1919"},
    {"id": "ekantipur", "name": "Ekantipur", "url": "https://ekantipur.com/rss", "color": "#1E40AF"},
    {"id": "kathmandu", "name": "Kathmandu Post", "url": "https://kathmandupost.com/rss", "color": "#DC2626"},
]

async def fetch_rss_feed(feed: dict) -> List[dict]:
    """Fetch and parse RSS feed"""
    articles = []
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(feed["url"], follow_redirects=True)
            if response.status_code == 200:
                root = ET.fromstring(response.content)
                # Handle both RSS and Atom feeds
                items = root.findall('.//item') or root.findall('.//{http://www.w3.org/2005/Atom}entry')
                
                for item in items[:10]:  # Limit to 10 items per feed
                    title = item.findtext('title') or item.findtext('{http://www.w3.org/2005/Atom}title') or ''
                    link = item.findtext('link') or ''
                    if not link:
                        link_elem = item.find('{http://www.w3.org/2005/Atom}link')
                        if link_elem is not None:
                            link = link_elem.get('href', '')
                    
                    description = item.findtext('description') or item.findtext('{http://www.w3.org/2005/Atom}summary') or ''
                    pub_date = item.findtext('pubDate') or item.findtext('{http://www.w3.org/2005/Atom}published') or ''
                    
                    # Try to get image
                    image = None
                    media_content = item.find('{http://search.yahoo.com/mrss/}content')
                    if media_content is not None:
                        image = media_content.get('url')
                    enclosure = item.find('enclosure')
                    if enclosure is not None and not image:
                        image = enclosure.get('url')
                    
                    # Clean description (remove HTML)
                    import re
                    clean_desc = re.sub('<[^<]+?>', '', description)[:200] if description else ''
                    
                    articles.append({
                        "id": f"{feed['id']}_{hash(title) % 10000}",
                        "title": title.strip(),
                        "link": link.strip(),
                        "description": clean_desc.strip(),
                        "time": pub_date[:25] if pub_date else "Recent",
                        "source": feed["name"],
                        "sourceId": feed["id"],
                        "sourceColor": feed["color"],
                        "image": image
                    })
    except Exception as e:
        logging.error(f"Failed to fetch RSS from {feed['name']}: {e}")
    return articles

@api_router.get("/news")
async def get_news():
    """Get news from all RSS sources"""
    all_articles = []
    
    # Fetch all feeds concurrently
    tasks = [fetch_rss_feed(feed) for feed in RSS_FEEDS]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    for result in results:
        if isinstance(result, list):
            all_articles.extend(result)
    
    # Sort by time (most recent first) - simple string sort works for RSS dates
    all_articles.sort(key=lambda x: x.get('time', ''), reverse=True)
    
    return {
        "articles": all_articles,
        "sources": RSS_FEEDS,
        "last_updated": datetime.now(timezone.utc).isoformat()
    }

# ============== CONSTITUENCY ENDPOINTS ==============

# Import constituency data from separate file
from constituencies_data import ALL_CONSTITUENCIES, CONSTITUENCY_CANDIDATES, FEDERAL_CONSTITUENCIES

@api_router.get("/constituencies")
async def get_constituencies():
    """Get all constituencies - 165 federal + provincial + local"""
    return ALL_CONSTITUENCIES

@api_router.get("/constituency-candidates")
async def get_constituency_candidates():
    """Get all constituency candidates"""
    return CONSTITUENCY_CANDIDATES

@api_router.get("/constituencies/stats")
async def get_constituency_stats():
    """Get constituency statistics"""
    federal = len([c for c in ALL_CONSTITUENCIES if c["type"] == "federal"])
    provincial = len([c for c in ALL_CONSTITUENCIES if c["type"] == "provincial"])
    local = len([c for c in ALL_CONSTITUENCIES if c["type"] == "local"])
    
    return {
        "total": len(ALL_CONSTITUENCIES),
        "federal": federal,
        "provincial": provincial,
        "local": local,
        "total_candidates": len(CONSTITUENCY_CANDIDATES)
    }

@api_router.get("/constituencies/{constituency_id}")
async def get_constituency(constituency_id: str):
    """Get specific constituency details"""
    for c in ALL_CONSTITUENCIES:
        if c["id"] == constituency_id:
            candidates = [cand for cand in CONSTITUENCY_CANDIDATES if cand.get("constituency_id") == constituency_id]
            return {**c, "candidates": candidates}
    raise HTTPException(status_code=404, detail="Constituency not found")

@api_router.post("/constituencies")
async def add_constituency(data: dict):
    """Add a new constituency"""
    new_constituency = {
        "id": data.get("id") or f"custom-{uuid.uuid4().hex[:8]}",
        "name": data.get("name"),
        "province_id": data.get("province_id"),
        "province": data.get("province"),
        "district": data.get("district"),
        "type": data.get("type", "federal"),
        "candidates_count": 0
    }
    ALL_CONSTITUENCIES.append(new_constituency)
    return new_constituency

@api_router.post("/constituency-candidates")
async def add_constituency_candidate(data: dict):
    """Add a new candidate to a constituency"""
    new_candidate = {
        "id": data.get("id") or f"cand-{uuid.uuid4().hex[:8]}",
        "name": data.get("name"),
        "party": data.get("party"),
        "party_color": data.get("party_color", "#6B7280"),
        "constituency": data.get("constituency"),
        "constituency_id": data.get("constituency_id"),
        "district": data.get("district"),
        "province_id": data.get("province_id"),
        "image_url": data.get("image_url"),
        "bio": data.get("bio"),
        "age": data.get("age"),
        "is_incumbent": data.get("is_incumbent", False),
        "elections_contested": data.get("elections_contested", 0),
        "wins": data.get("wins", 0),
        "election_history": data.get("election_history", [])
    }
    CONSTITUENCY_CANDIDATES.append(new_candidate)
    return new_candidate

# ============== FOOTBALL API ENDPOINTS ==============

# Football-Data.org API (free tier - 10 requests/minute)
FOOTBALL_API_KEY = os.environ.get("FOOTBALL_API_KEY", "")
FOOTBALL_API_BASE = "https://api.football-data.org/v4"

LEAGUE_CODES = {
    "PL": "Premier League",
    "PD": "La Liga",
    "BL1": "Bundesliga",
    "SA": "Serie A",
    "FL1": "Ligue 1",
    "CL": "Champions League"
}

# Sample football data (fallback when API unavailable)
SAMPLE_MATCHES = {
    "PL": [
        {"homeTeam": "Manchester City", "awayTeam": "Arsenal", "homeScore": 2, "awayScore": 1, "status": "FINISHED", "date": "Jan 19", "time": "FT"},
        {"homeTeam": "Liverpool", "awayTeam": "Chelsea", "homeScore": 3, "awayScore": 0, "status": "FINISHED", "date": "Jan 18", "time": "FT"},
        {"homeTeam": "Manchester United", "awayTeam": "Tottenham", "homeScore": None, "awayScore": None, "status": "SCHEDULED", "date": "Jan 22", "time": "20:00"},
        {"homeTeam": "Newcastle", "awayTeam": "Brighton", "homeScore": None, "awayScore": None, "status": "SCHEDULED", "date": "Jan 23", "time": "19:30"},
    ],
    "PD": [
        {"homeTeam": "Real Madrid", "awayTeam": "Barcelona", "homeScore": 2, "awayScore": 2, "status": "FINISHED", "date": "Jan 18", "time": "FT"},
        {"homeTeam": "Atletico Madrid", "awayTeam": "Sevilla", "homeScore": 1, "awayScore": 0, "status": "FINISHED", "date": "Jan 19", "time": "FT"},
        {"homeTeam": "Real Sociedad", "awayTeam": "Valencia", "homeScore": None, "awayScore": None, "status": "SCHEDULED", "date": "Jan 22", "time": "21:00"},
    ],
    "BL1": [
        {"homeTeam": "Bayern Munich", "awayTeam": "Borussia Dortmund", "homeScore": 3, "awayScore": 2, "status": "FINISHED", "date": "Jan 17", "time": "FT"},
        {"homeTeam": "RB Leipzig", "awayTeam": "Bayer Leverkusen", "homeScore": 1, "awayScore": 1, "status": "FINISHED", "date": "Jan 18", "time": "FT"},
    ],
    "SA": [
        {"homeTeam": "Inter Milan", "awayTeam": "AC Milan", "homeScore": 2, "awayScore": 0, "status": "FINISHED", "date": "Jan 19", "time": "FT"},
        {"homeTeam": "Juventus", "awayTeam": "Napoli", "homeScore": 1, "awayScore": 1, "status": "FINISHED", "date": "Jan 18", "time": "FT"},
    ],
    "FL1": [
        {"homeTeam": "PSG", "awayTeam": "Marseille", "homeScore": 2, "awayScore": 1, "status": "FINISHED", "date": "Jan 17", "time": "FT"},
        {"homeTeam": "Monaco", "awayTeam": "Lyon", "homeScore": 3, "awayScore": 2, "status": "FINISHED", "date": "Jan 18", "time": "FT"},
    ],
    "CL": [
        {"homeTeam": "Real Madrid", "awayTeam": "Manchester City", "homeScore": 3, "awayScore": 3, "status": "FINISHED", "date": "Jan 22", "time": "FT"},
        {"homeTeam": "Bayern Munich", "awayTeam": "Arsenal", "homeScore": None, "awayScore": None, "status": "SCHEDULED", "date": "Feb 20", "time": "21:00"},
        {"homeTeam": "PSG", "awayTeam": "Barcelona", "homeScore": None, "awayScore": None, "status": "SCHEDULED", "date": "Feb 21", "time": "21:00"},
    ],
}

SAMPLE_STANDINGS = {
    "PL": [
        {"position": 1, "team": "Liverpool", "played": 21, "won": 15, "draw": 5, "lost": 1, "points": 50},
        {"position": 2, "team": "Arsenal", "played": 21, "won": 13, "draw": 6, "lost": 2, "points": 45},
        {"position": 3, "team": "Nottingham Forest", "played": 21, "won": 12, "draw": 5, "lost": 4, "points": 41},
        {"position": 4, "team": "Chelsea", "played": 21, "won": 11, "draw": 5, "lost": 5, "points": 38},
        {"position": 5, "team": "Newcastle", "played": 21, "won": 10, "draw": 6, "lost": 5, "points": 36},
        {"position": 6, "team": "Manchester City", "played": 21, "won": 10, "draw": 5, "lost": 6, "points": 35},
        {"position": 7, "team": "Bournemouth", "played": 21, "won": 9, "draw": 6, "lost": 6, "points": 33},
        {"position": 8, "team": "Aston Villa", "played": 21, "won": 9, "draw": 5, "lost": 7, "points": 32},
        {"position": 9, "team": "Fulham", "played": 21, "won": 8, "draw": 6, "lost": 7, "points": 30},
        {"position": 10, "team": "Brighton", "played": 21, "won": 7, "draw": 9, "lost": 5, "points": 30},
    ],
    "PD": [
        {"position": 1, "team": "Barcelona", "played": 20, "won": 14, "draw": 4, "lost": 2, "points": 46},
        {"position": 2, "team": "Real Madrid", "played": 20, "won": 13, "draw": 4, "lost": 3, "points": 43},
        {"position": 3, "team": "Atletico Madrid", "played": 20, "won": 12, "draw": 5, "lost": 3, "points": 41},
        {"position": 4, "team": "Athletic Bilbao", "played": 20, "won": 10, "draw": 7, "lost": 3, "points": 37},
        {"position": 5, "team": "Villarreal", "played": 20, "won": 10, "draw": 4, "lost": 6, "points": 34},
    ],
    "BL1": [
        {"position": 1, "team": "Bayern Munich", "played": 18, "won": 12, "draw": 4, "lost": 2, "points": 40},
        {"position": 2, "team": "Bayer Leverkusen", "played": 18, "won": 11, "draw": 5, "lost": 2, "points": 38},
        {"position": 3, "team": "Eintracht Frankfurt", "played": 18, "won": 9, "draw": 6, "lost": 3, "points": 33},
        {"position": 4, "team": "RB Leipzig", "played": 18, "won": 9, "draw": 4, "lost": 5, "points": 31},
        {"position": 5, "team": "Borussia Dortmund", "played": 18, "won": 8, "draw": 6, "lost": 4, "points": 30},
    ],
    "SA": [
        {"position": 1, "team": "Napoli", "played": 20, "won": 14, "draw": 3, "lost": 3, "points": 45},
        {"position": 2, "team": "Inter Milan", "played": 20, "won": 13, "draw": 4, "lost": 3, "points": 43},
        {"position": 3, "team": "Atalanta", "played": 20, "won": 12, "draw": 3, "lost": 5, "points": 39},
        {"position": 4, "team": "Lazio", "played": 20, "won": 11, "draw": 5, "lost": 4, "points": 38},
        {"position": 5, "team": "Juventus", "played": 20, "won": 9, "draw": 9, "lost": 2, "points": 36},
    ],
    "FL1": [
        {"position": 1, "team": "PSG", "played": 18, "won": 14, "draw": 2, "lost": 2, "points": 44},
        {"position": 2, "team": "Monaco", "played": 18, "won": 11, "draw": 5, "lost": 2, "points": 38},
        {"position": 3, "team": "Marseille", "played": 18, "won": 10, "draw": 4, "lost": 4, "points": 34},
        {"position": 4, "team": "Lille", "played": 18, "won": 9, "draw": 5, "lost": 4, "points": 32},
        {"position": 5, "team": "Lyon", "played": 18, "won": 8, "draw": 5, "lost": 5, "points": 29},
    ],
    "CL": [
        {"position": 1, "team": "Liverpool", "played": 7, "won": 7, "draw": 0, "lost": 0, "points": 21},
        {"position": 2, "team": "Barcelona", "played": 7, "won": 6, "draw": 0, "lost": 1, "points": 18},
        {"position": 3, "team": "Arsenal", "played": 7, "won": 5, "draw": 1, "lost": 1, "points": 16},
        {"position": 4, "team": "Inter Milan", "played": 7, "won": 5, "draw": 1, "lost": 1, "points": 16},
        {"position": 5, "team": "Atletico Madrid", "played": 7, "won": 5, "draw": 0, "lost": 2, "points": 15},
    ],
}

@api_router.get("/football/matches")
async def get_football_matches(league: str = "PL"):
    """Get football matches for a league"""
    # Try to fetch from API first
    if FOOTBALL_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                headers = {"X-Auth-Token": FOOTBALL_API_KEY}
                response = await client.get(
                    f"{FOOTBALL_API_BASE}/competitions/{league}/matches?status=SCHEDULED,LIVE,IN_PLAY,FINISHED&limit=10",
                    headers=headers
                )
                if response.status_code == 200:
                    data = response.json()
                    matches = []
                    for match in data.get("matches", [])[:10]:
                        matches.append({
                            "homeTeam": match["homeTeam"]["shortName"] or match["homeTeam"]["name"],
                            "awayTeam": match["awayTeam"]["shortName"] or match["awayTeam"]["name"],
                            "homeScore": match["score"]["fullTime"]["home"],
                            "awayScore": match["score"]["fullTime"]["away"],
                            "status": match["status"],
                            "date": match["utcDate"][:10],
                            "time": match["utcDate"][11:16] if match["status"] == "SCHEDULED" else "FT" if match["status"] == "FINISHED" else "LIVE",
                            "minute": match.get("minute")
                        })
                    return {"matches": matches, "league": LEAGUE_CODES.get(league, league)}
        except Exception as e:
            logging.error(f"Football API error: {e}")
    
    # Fallback to sample data
    return {"matches": SAMPLE_MATCHES.get(league, []), "league": LEAGUE_CODES.get(league, league)}

@api_router.get("/football/standings")
async def get_football_standings(league: str = "PL"):
    """Get league standings"""
    # Try to fetch from API first
    if FOOTBALL_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                headers = {"X-Auth-Token": FOOTBALL_API_KEY}
                response = await client.get(
                    f"{FOOTBALL_API_BASE}/competitions/{league}/standings",
                    headers=headers
                )
                if response.status_code == 200:
                    data = response.json()
                    standings = []
                    for standing in data.get("standings", [{}])[0].get("table", [])[:10]:
                        standings.append({
                            "position": standing["position"],
                            "team": standing["team"]["shortName"] or standing["team"]["name"],
                            "played": standing["playedGames"],
                            "won": standing["won"],
                            "draw": standing["draw"],
                            "lost": standing["lost"],
                            "points": standing["points"]
                        })
                    return {"standings": standings, "league": LEAGUE_CODES.get(league, league)}
        except Exception as e:
            logging.error(f"Football standings API error: {e}")
    
    # Fallback to sample data
    return {"standings": SAMPLE_STANDINGS.get(league, []), "league": LEAGUE_CODES.get(league, league)}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
