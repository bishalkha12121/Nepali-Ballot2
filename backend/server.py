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
        "image_url": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
        "bio": "President of Nepali Congress and five-time Prime Minister. A key figure in Nepal's democratic movement and constitutional development.",
        "slogan": "Democracy for All"
    },
    {
        "id": "pushpa-kamal-dahal",
        "name": "Pushpa Kamal Dahal (Prachanda)",
        "party": "CPN-Maoist Centre",
        "party_symbol": "Gavel",
        "party_color": "#EF233C",
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

@api_router.get("/historical")
async def get_historical_data():
    """Get historical election data"""
    # Check if historical data exists, if not seed it
    count = await db.historical_elections.count_documents({})
    if count == 0:
        await db.historical_elections.insert_many(HISTORICAL_DATA)
    
    elections = await db.historical_elections.find({}, {"_id": 0}).to_list(100)
    # Sort by year descending
    elections.sort(key=lambda x: x["year"], reverse=True)
    return elections

@api_router.get("/stats")
async def get_stats():
    """Get overall statistics"""
    total_votes = await db.votes.count_documents({})
    total_candidates = await db.candidates.count_documents({})
    
    # Get votes over time (last 7 days aggregation would go here in production)
    return {
        "total_votes": total_votes,
        "total_candidates": total_candidates,
        "election_status": "active"
    }

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
