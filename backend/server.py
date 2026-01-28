from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any, Tuple
import uuid
from datetime import datetime, timezone
import httpx
import xml.etree.ElementTree as ET
import asyncio
import time
from html.parser import HTMLParser
import re

ROOT_DIR = Path(__file__).parent

# Load .env file if it exists (for local development)
env_file = ROOT_DIR / '.env'
if env_file.exists():
    load_dotenv(env_file)

# MongoDB connection - use environment variables (Railway sets these directly)
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'nepali_ballot')
# Keep connection timeouts short so UI doesn't hang when Mongo is down
client = AsyncIOMotorClient(
    mongo_url,
    serverSelectionTimeoutMS=2000,
    connectTimeoutMS=2000,
)
db = client[db_name]

# In-memory vote fallback (used when DB is unavailable)
IN_MEMORY_VOTES: Dict[str, Dict[str, Any]] = {
    "by_voter": {},  # voter_token -> candidate_id
    "counts": {},    # candidate_id -> count
}

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

class WikiBatchRequest(BaseModel):
    queries: List[str]

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
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Balen_Shah.jpg/220px-Balen_Shah.jpg",
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
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/K.P._Sharma_Oli.jpg/220px-K.P._Sharma_Oli.jpg",
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
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Sher_Bahadur_Deuba_2021.jpg/220px-Sher_Bahadur_Deuba_2021.jpg",
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
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Pushpa_Kamal_Dahal.jpg/220px-Pushpa_Kamal_Dahal.jpg",
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
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Rabi_Lamichhane.jpg/220px-Rabi_Lamichhane.jpg",
        "bio": "Founder of Rastriya Swatantra Party and former journalist. Known for his investigative journalism show 'Sidha Kura Janata Sanga'. Current Home Minister.",
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

async def _get_candidates_safe() -> List[Dict[str, Any]]:
    """Return candidates from DB, fall back to static data if DB is unavailable."""
    try:
        count = await db.candidates.count_documents({})
        if count == 0:
            await db.candidates.insert_many(CANDIDATES_DATA)
        candidates = await db.candidates.find({}, {"_id": 0}).to_list(100)
        return candidates or CANDIDATES_DATA
    except Exception as exc:
        logger.warning("Candidates DB unavailable, using fallback data", exc_info=exc)
        return CANDIDATES_DATA

@api_router.get("/candidates", response_model=List[Candidate])
async def get_candidates():
    """Get all candidates"""
    return await _get_candidates_safe()

@api_router.get("/candidates/{candidate_id}", response_model=Candidate)
async def get_candidate(candidate_id: str):
    """Get single candidate by ID"""
    try:
        candidate = await db.candidates.find_one({"id": candidate_id}, {"_id": 0})
    except Exception as exc:
        logger.warning("Candidates DB unavailable, using fallback data", exc_info=exc)
        candidate = None
    if not candidate:
        candidate = next((c for c in CANDIDATES_DATA if c.get("id") == candidate_id), None)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate

@api_router.post("/vote")
async def cast_vote(vote: VoteCreate):
    """Cast a vote (anonymous, one vote per browser token)"""
    # Try DB-backed voting first
    try:
        existing_vote = await db.votes.find_one({"voter_token": vote.voter_token})
        if existing_vote:
            raise HTTPException(status_code=400, detail="You have already voted in this election")

        candidate = await db.candidates.find_one({"id": vote.candidate_id})
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")

        vote_obj = Vote(
            candidate_id=vote.candidate_id,
            voter_token=vote.voter_token
        )
        doc = vote_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()

        await db.votes.insert_one(doc)
        return {"success": True, "message": "Vote cast successfully!"}
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("Votes DB unavailable, using in-memory fallback", exc_info=exc)

    # In-memory fallback
    if IN_MEMORY_VOTES["by_voter"].get(vote.voter_token):
        raise HTTPException(status_code=400, detail="You have already voted in this election")

    IN_MEMORY_VOTES["by_voter"][vote.voter_token] = vote.candidate_id
    IN_MEMORY_VOTES["counts"][vote.candidate_id] = IN_MEMORY_VOTES["counts"].get(vote.candidate_id, 0) + 1

    return {"success": True, "message": "Vote cast successfully (fallback)"}

@api_router.get("/results")
async def get_results():
    """Get current election results"""
    try:
        # Ensure candidates are seeded
        count = await db.candidates.count_documents({})
        if count == 0:
            await db.candidates.insert_many(CANDIDATES_DATA)

        candidates = await db.candidates.find({}, {"_id": 0}).to_list(100)

        pipeline = [
            {"$group": {"_id": "$candidate_id", "count": {"$sum": 1}}}
        ]
        vote_counts_cursor = db.votes.aggregate(pipeline)
        vote_counts = {item["_id"]: item["count"] async for item in vote_counts_cursor}
    except Exception as exc:
        logger.warning("Votes DB unavailable, using in-memory results", exc_info=exc)
        candidates = await _get_candidates_safe()
        vote_counts = IN_MEMORY_VOTES["counts"].copy()

    total_votes = sum(vote_counts.values()) if vote_counts else 0

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
    try:
        existing_vote = await db.votes.find_one({"voter_token": voter_token}, {"_id": 0})
    except Exception as exc:
        logger.warning("Votes DB unavailable, returning not voted", exc_info=exc)
        candidate_id = IN_MEMORY_VOTES["by_voter"].get(voter_token)
        return {"has_voted": bool(candidate_id), "candidate_id": candidate_id}
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

#
# ============== OFFICIAL ELECTION COMMISSION (EC) ENDPOINTS ==============
#

EC_SOURCES: Dict[str, Dict[str, str]] = {
    # Top-level landing page (useful for users to verify)
    "home": {"label": "EC Results Home", "url": "https://result.election.gov.np/ElectionResult.aspx"},
    # Common result views used for past elections (2074/2079 and related pages on the site)
    "hor_fptp_detail": {"label": "House of Representatives (FPTP) - Detailed Results", "url": "https://result.election.gov.np/ElectionResultCentral.aspx"},
    "hor_pr_detail": {"label": "House of Representatives (PR) - Detailed Results", "url": "https://result.election.gov.np/ElectionResultCentralPR.aspx"},
    "hor_pr_elected": {"label": "House of Representatives (PR) - Elected Candidates", "url": "https://result.election.gov.np/ElectedCandidateListCentralPR.aspx"},
    "gender_summary": {"label": "Gender-wise Elected Summary", "url": "https://result.election.gov.np/GenderWiseElectedSummary.aspx"},
    "fptp_party_status": {"label": "FPTP Party Status (Win/Lead)", "url": "https://result.election.gov.np/FPTPWLChartResult.aspx"},
    "pr_party_votes": {"label": "PR Party Vote Status", "url": "https://result.election.gov.np/PRVoteChartResult.aspx"},
}

# Simple in-memory cache to avoid hammering EC site
EC_CACHE: Dict[str, Tuple[float, Dict[str, Any]]] = {}
EC_CACHE_TTL_SECONDS = 300  # 5 minutes


class _HTMLTableParser(HTMLParser):
    """
    Minimal HTML table extractor using the stdlib.
    Collects all <table> contents into a list of tables: [[row1cells], [row2cells], ...]
    """

    def __init__(self):
        super().__init__()
        self._in_table = False
        self._in_tr = False
        self._in_cell = False
        self._cell_text_parts: List[str] = []

        self.tables: List[List[List[str]]] = []
        self._current_table: List[List[str]] = []
        self._current_row: List[str] = []

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if tag == "table":
            self._in_table = True
            self._current_table = []
        elif self._in_table and tag == "tr":
            self._in_tr = True
            self._current_row = []
        elif self._in_table and self._in_tr and tag in ("td", "th"):
            self._in_cell = True
            self._cell_text_parts = []

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag == "table" and self._in_table:
            self._in_table = False
            if any(any(cell.strip() for cell in row) for row in self._current_table):
                self.tables.append(self._current_table)
            self._current_table = []
        elif tag == "tr" and self._in_tr:
            self._in_tr = False
            if self._current_row and any(c.strip() for c in self._current_row):
                self._current_table.append(self._current_row)
            self._current_row = []
        elif tag in ("td", "th") and self._in_cell:
            self._in_cell = False
            text = " ".join(self._cell_text_parts).strip()
            # Normalize whitespace
            text = " ".join(text.split())
            self._current_row.append(text)
            self._cell_text_parts = []

    def handle_data(self, data):
        if self._in_cell and data:
            self._cell_text_parts.append(data)


class _HTMLTextExtractor(HTMLParser):
    """Extract visible text from HTML (fallback when structured tables aren't available)."""

    def __init__(self):
        super().__init__()
        self._skip_depth = 0  # script/style/head/noscript
        self.parts: List[str] = []

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if tag in ("script", "style", "head", "noscript"):
            self._skip_depth += 1

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in ("script", "style", "head", "noscript") and self._skip_depth > 0:
            self._skip_depth -= 1

    def handle_data(self, data):
        if self._skip_depth > 0:
            return
        if not data:
            return
        txt = " ".join(data.split())
        if txt:
            self.parts.append(txt)


def _tables_to_structured(tables: List[List[List[str]]]) -> List[Dict[str, Any]]:
    structured: List[Dict[str, Any]] = []
    for t in tables:
        if not t:
            continue
        # Heuristic: treat first row as headers if it has more than one cell and looks header-like
        headers = t[0]
        rows = t[1:] if len(t) > 1 else []
        structured.append({"headers": headers, "rows": rows})
    return structured


async def _fetch_ec_html(url: str) -> str:
    # Use a browser-like UA to reduce blocks
    headers = {"User-Agent": "Mozilla/5.0 (NepaliBallot; +https://github.com/)"}  # harmless UA
    timeout = httpx.Timeout(30.0)
    async with httpx.AsyncClient(timeout=timeout, follow_redirects=True, headers=headers) as client:
        # Basic retry for transient TLS/handshake slowness
        for attempt in (1, 2):
            try:
                resp = await client.get(url)
                resp.raise_for_status()
                content_type = (resp.headers.get("content-type") or "").lower()
                charset = "utf-8"
                if "charset=" in content_type:
                    charset = content_type.split("charset=", 1)[1].split(";", 1)[0].strip() or "utf-8"
                try:
                    return resp.content.decode(charset, errors="replace")
                except Exception:
                    # Fallback for odd/misleading charset headers
                    return resp.content.decode("utf-8", errors="replace")
            except Exception:
                if attempt == 2:
                    raise
                await asyncio.sleep(0.4)
    raise RuntimeError("Unreachable")


def _extract_tables(html: str) -> List[Dict[str, Any]]:
    parser = _HTMLTableParser()
    parser.feed(html)
    return _tables_to_structured(parser.tables)


def _extract_text_lines(html: str, max_lines: int = 120) -> List[str]:
    extractor = _HTMLTextExtractor()
    extractor.feed(html)
    lines: List[str] = []
    seen = set()
    for part in extractor.parts:
        if part in seen:
            continue
        seen.add(part)
        lines.append(part)
        if len(lines) >= max_lines:
            break
    return lines


@api_router.get("/ec/sources")
async def ec_sources():
    """List supported Election Commission result views."""
    return {
        "source": "Election Commission of Nepal (ERIS)",
        "sources": [{"id": k, "label": v["label"], "url": v["url"]} for k, v in EC_SOURCES.items()],
        "base_url": "https://result.election.gov.np/",
    }


@api_router.get("/ec/tables/{source_id}")
async def ec_tables(source_id: str, refresh: bool = False):
    """
    Fetch and parse tables from an Election Commission results page.
    Returns normalized tables for frontend display.
    """
    if source_id not in EC_SOURCES:
        raise HTTPException(status_code=404, detail="Unknown EC source_id")

    now = time.time()
    if not refresh:
        cached = EC_CACHE.get(source_id)
        if cached:
            ts, data = cached
            if now - ts < EC_CACHE_TTL_SECONDS:
                return data

    url = EC_SOURCES[source_id]["url"]
    try:
        html = await _fetch_ec_html(url)
    except Exception as e:
        logger.exception("EC fetch failed: %s", e)
        raise HTTPException(status_code=502, detail="Failed to fetch official EC data")

    tables = _extract_tables(html)
    content_type = "tables" if tables else "text"
    text_lines: List[str] = _extract_text_lines(html) if not tables else []

    payload = {
        "source_id": source_id,
        "source_label": EC_SOURCES[source_id]["label"],
        "source_url": url,
        "content_type": content_type,
        "tables": tables,
        "text_lines": text_lines,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "cache_ttl_seconds": EC_CACHE_TTL_SECONDS,
    }
    EC_CACHE[source_id] = (now, payload)
    return payload


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

# Remote constituency source (legacy backend)
REMOTE_BACKEND_URL = os.environ.get(
    "REMOTE_BACKEND_URL",
    "https://nepali-ballot2-production.up.railway.app"
).rstrip("/")

CONSTITUENCY_CACHE: Dict[str, Any] = {"timestamp": 0, "data": None}
CONSTITUENCY_CACHE_TTL_SECONDS = 60 * 10

WIKI_CACHE: Dict[str, Tuple[float, Dict[str, Any]]] = {}
WIKI_CACHE_TTL_SECONDS = 7 * 24 * 60 * 60
WIKI_SEMAPHORE = asyncio.Semaphore(5)
WIKI_FALLBACK_IMAGE_URL = (
    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
)

def _normalize_name(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip().lower()

def _truncate_text(value: Optional[str], max_len: int = 280) -> Optional[str]:
    if not value:
        return None
    cleaned = " ".join(str(value).split())
    if len(cleaned) <= max_len:
        return cleaned
    return f"{cleaned[: max_len - 1].rstrip()}…"

def _merge_election_history(candidate: Dict[str, Any], fallback: Dict[str, Any]) -> Dict[str, Any]:
    history = candidate.get("election_history") or fallback.get("election_history") or []
    wins = sum(1 for h in history if str(h.get("result", "")).lower() == "won")
    candidate["election_history"] = history
    candidate["wins"] = candidate.get("wins", wins)
    candidate["elections_contested"] = candidate.get("elections_contested", len(history))
    return candidate

async def _fetch_remote_json(path: str) -> Any:
    url = f"{REMOTE_BACKEND_URL}{path}"
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        return resp.json()

async def _get_remote_constituency_data(refresh: bool = False) -> Dict[str, Any]:
    now = time.time()
    if (
        CONSTITUENCY_CACHE["data"]
        and not refresh
        and now - CONSTITUENCY_CACHE["timestamp"] < CONSTITUENCY_CACHE_TTL_SECONDS
    ):
        return CONSTITUENCY_CACHE["data"]
    try:
        constituencies = await _fetch_remote_json("/api/constituencies")
        candidates = await _fetch_remote_json("/api/constituency-candidates")
        data = {"constituencies": constituencies, "candidates": candidates, "source": "remote-backend"}
        CONSTITUENCY_CACHE["data"] = data
        CONSTITUENCY_CACHE["timestamp"] = now
        return data
    except Exception as exc:
        logger.warning("Remote constituency fetch failed, using local data", exc_info=exc)
        data = {
            "constituencies": ALL_CONSTITUENCIES,
            "candidates": CONSTITUENCY_CANDIDATES,
            "source": "local-fallback",
        }
        CONSTITUENCY_CACHE["data"] = data
        CONSTITUENCY_CACHE["timestamp"] = now
        return data

async def _get_wiki_summary(query: str) -> Dict[str, Any]:
    now = time.time()
    cache_key = _normalize_name(query)
    cached = WIKI_CACHE.get(cache_key)
    if cached and now - cached[0] < WIKI_CACHE_TTL_SECONDS:
        return cached[1]

    async with WIKI_SEMAPHORE:
        async with httpx.AsyncClient(timeout=20.0) as client:
            try:
                search_url = "https://en.wikipedia.org/w/api.php"
                search_params = {
                    "action": "opensearch",
                    "search": query,
                    "limit": 1,
                    "namespace": 0,
                    "format": "json",
                }
                search_resp = await client.get(search_url, params=search_params)
                search_resp.raise_for_status()
                search_data = search_resp.json()
                title = search_data[1][0] if len(search_data) > 1 and search_data[1] else None

                if not title:
                    data = {
                        "query": query,
                        "title": None,
                        "page_url": None,
                        "image_url": WIKI_FALLBACK_IMAGE_URL,
                        "summary": None,
                        "description": None,
                    }
                    WIKI_CACHE[cache_key] = (now, data)
                    return data

                summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{title}"
                summary_resp = await client.get(summary_url)
                summary_resp.raise_for_status()
                summary = summary_resp.json()
                image_url = None
                if isinstance(summary.get("originalimage"), dict):
                    image_url = summary["originalimage"].get("source")
                if not image_url and isinstance(summary.get("thumbnail"), dict):
                    image_url = summary["thumbnail"].get("source")
                if not image_url:
                    image_url = WIKI_FALLBACK_IMAGE_URL

                data = {
                    "query": query,
                    "title": summary.get("title"),
                    "page_url": summary.get("content_urls", {}).get("desktop", {}).get("page"),
                    "image_url": image_url,
                    "summary": _truncate_text(summary.get("extract")),
                    "description": _truncate_text(summary.get("description"), max_len=140),
                }
                WIKI_CACHE[cache_key] = (now, data)
                return data
            except Exception as exc:
                logger.warning("Wikipedia lookup failed for %s", query, exc_info=exc)
                data = {
                    "query": query,
                    "title": None,
                    "page_url": None,
                    "image_url": WIKI_FALLBACK_IMAGE_URL,
                    "summary": None,
                    "description": None,
                }
                WIKI_CACHE[cache_key] = (now, data)
                return data

def _build_candidate_merits(candidate: Dict[str, Any], wiki_summary: Optional[str]) -> List[str]:
    merits: List[str] = []
    wins = candidate.get("wins") or 0
    elections = candidate.get("elections_contested") or 0
    if wins:
        merits.append(f"Won {wins} election{'s' if wins != 1 else ''}")
    if elections:
        merits.append(f"Contested {elections} election{'s' if elections != 1 else ''}")
    if wiki_summary:
        merits.append(wiki_summary)
    return merits

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

@api_router.get("/constituencies/{constituency_id}/candidates")
async def get_constituency_candidates_enriched(constituency_id: str, refresh: bool = False):
    """Get constituency candidates with Wikipedia images and election history."""
    remote_data = await _get_remote_constituency_data(refresh=refresh)
    remote_constituencies = remote_data.get("constituencies") or []
    remote_candidates = remote_data.get("candidates") or []

    constituency = next(
        (c for c in remote_constituencies if c.get("id") == constituency_id), None
    )
    if not constituency:
        constituency = next((c for c in ALL_CONSTITUENCIES if c.get("id") == constituency_id), None)

    if not constituency:
        raise HTTPException(status_code=404, detail="Constituency not found")

    name_match = _normalize_name(constituency.get("name", ""))
    candidates = [
        c for c in remote_candidates
        if c.get("constituency_id") == constituency_id
        or _normalize_name(c.get("constituency", "")) == name_match
    ]

    if not candidates:
        candidates = [
            c for c in CONSTITUENCY_CANDIDATES
            if c.get("constituency_id") == constituency_id
            or _normalize_name(c.get("constituency", "")) == name_match
        ]

    fallback_map = {
        _normalize_name(c.get("name", "")): c for c in CONSTITUENCY_CANDIDATES
    }

    enriched = []
    for candidate in candidates:
        normalized = _normalize_name(candidate.get("name", ""))
        fallback = fallback_map.get(normalized, {})
        merged = {**fallback, **candidate}
        merged = _merge_election_history(merged, fallback)

        wiki = await _get_wiki_summary(candidate.get("name", "")) if candidate.get("name") else {}
        if wiki.get("image_url") and not merged.get("image_url"):
            merged["image_url"] = wiki["image_url"]
        merged["wiki"] = wiki
        merged["merits"] = _build_candidate_merits(merged, wiki.get("summary"))
        enriched.append(merged)

    return {
        "constituency": constituency,
        "candidates": enriched,
        "total_candidates": len(enriched),
        "source": remote_data.get("source", "remote-backend"),
    }

@api_router.post("/wiki/batch")
async def wiki_batch_lookup(payload: WikiBatchRequest):
    """Resolve Wikipedia summaries/images for many queries with caching."""
    queries = [q.strip() for q in payload.queries if q and q.strip()]
    if not queries:
        return {"results": []}

    tasks = [_get_wiki_summary(q) for q in queries]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    output = []
    for query, result in zip(queries, results):
        if isinstance(result, Exception):
            output.append({
                "query": query,
                "title": None,
                "page_url": None,
                "image_url": WIKI_FALLBACK_IMAGE_URL,
            })
        else:
            output.append(result)

    return {"results": output}

@api_router.get("/constituencies/{constituency_id}/summary")
async def get_constituency_summary(constituency_id: str, refresh: bool = False):
    """Get party/independent counts for a constituency."""
    data = await get_constituency_candidates_enriched(constituency_id, refresh=refresh)
    counts: Dict[str, int] = {}
    for candidate in data["candidates"]:
        party = candidate.get("party") or "Independent"
        counts[party] = counts.get(party, 0) + 1
    summary = [{"party": party, "count": count} for party, count in counts.items()]
    summary.sort(key=lambda x: (-x["count"], x["party"].lower()))
    return {
        "constituency": data["constituency"],
        "total_candidates": data["total_candidates"],
        "by_party": summary,
        "source": data["source"],
    }

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

# API-Football (api-sports.io) - Free tier: 100 requests/day
# League IDs: PL=39, La Liga=140, Bundesliga=78, Serie A=135, Ligue 1=61, Champions League=2
API_FOOTBALL_KEY = os.environ.get("API_FOOTBALL_KEY", "")
API_FOOTBALL_BASE = "https://v3.football.api-sports.io"

LEAGUE_IDS = {
    "PL": 39,      # Premier League
    "PD": 140,     # La Liga
    "BL1": 78,     # Bundesliga
    "SA": 135,     # Serie A
    "FL1": 61,     # Ligue 1
    "CL": 2,       # Champions League
}

LEAGUE_CODES = {
    "PL": "Premier League",
    "PD": "La Liga",
    "BL1": "Bundesliga",
    "SA": "Serie A",
    "FL1": "Ligue 1",
    "CL": "Champions League"
}

async def fetch_live_football_data(league_id: int):
    """Fetch live/recent matches from API-Football"""
    if not API_FOOTBALL_KEY:
        return None
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            headers = {
                "x-rapidapi-key": API_FOOTBALL_KEY,
                "x-rapidapi-host": "v3.football.api-sports.io"
            }
            
            # Get today's and recent fixtures
            from datetime import date, timedelta
            today = date.today()
            week_ago = today - timedelta(days=7)
            week_ahead = today + timedelta(days=7)
            
            response = await client.get(
                f"{API_FOOTBALL_BASE}/fixtures",
                headers=headers,
                params={
                    "league": league_id,
                    "season": 2024,
                    "from": week_ago.isoformat(),
                    "to": week_ahead.isoformat()
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                matches = []
                for fixture in data.get("response", [])[:15]:
                    fx = fixture.get("fixture", {})
                    teams = fixture.get("teams", {})
                    goals = fixture.get("goals", {})
                    
                    status = fx.get("status", {}).get("short", "NS")
                    status_map = {
                        "NS": "SCHEDULED", "TBD": "SCHEDULED",
                        "1H": "LIVE", "2H": "LIVE", "HT": "LIVE", "ET": "LIVE", "P": "LIVE", "LIVE": "LIVE",
                        "FT": "FINISHED", "AET": "FINISHED", "PEN": "FINISHED"
                    }
                    
                    match_date = fx.get("date", "")[:10]
                    match_time = fx.get("date", "")[11:16] if fx.get("date") else ""
                    
                    matches.append({
                        "homeTeam": teams.get("home", {}).get("name", "Unknown"),
                        "awayTeam": teams.get("away", {}).get("name", "Unknown"),
                        "homeScore": goals.get("home"),
                        "awayScore": goals.get("away"),
                        "status": status_map.get(status, "SCHEDULED"),
                        "date": match_date,
                        "time": match_time if status_map.get(status) == "SCHEDULED" else ("LIVE" if status_map.get(status) == "LIVE" else "FT"),
                        "minute": fx.get("status", {}).get("elapsed")
                    })
                
                return matches
    except Exception as e:
        logging.error(f"API-Football error: {e}")
    
    return None

async def fetch_standings_data(league_id: int):
    """Fetch league standings from API-Football"""
    if not API_FOOTBALL_KEY:
        return None
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            headers = {
                "x-rapidapi-key": API_FOOTBALL_KEY,
                "x-rapidapi-host": "v3.football.api-sports.io"
            }
            
            response = await client.get(
                f"{API_FOOTBALL_BASE}/standings",
                headers=headers,
                params={"league": league_id, "season": 2024}
            )
            
            if response.status_code == 200:
                data = response.json()
                standings = []
                league_data = data.get("response", [])
                if league_data and league_data[0].get("league", {}).get("standings"):
                    for team in league_data[0]["league"]["standings"][0][:10]:
                        standings.append({
                            "position": team.get("rank", 0),
                            "team": team.get("team", {}).get("name", "Unknown"),
                            "played": team.get("all", {}).get("played", 0),
                            "won": team.get("all", {}).get("win", 0),
                            "draw": team.get("all", {}).get("draw", 0),
                            "lost": team.get("all", {}).get("lose", 0),
                            "points": team.get("points", 0)
                        })
                return standings
    except Exception as e:
        logging.error(f"API-Football standings error: {e}")
    
    return None

# Updated sample data with more recent realistic scores
SAMPLE_MATCHES = {
    "PL": [
        {"homeTeam": "Liverpool", "awayTeam": "Ipswich Town", "homeScore": 4, "awayScore": 1, "status": "FINISHED", "date": "2025-01-25", "time": "FT"},
        {"homeTeam": "Arsenal", "awayTeam": "Aston Villa", "homeScore": 2, "awayScore": 2, "status": "FINISHED", "date": "2025-01-18", "time": "FT"},
        {"homeTeam": "Manchester City", "awayTeam": "Chelsea", "homeScore": 3, "awayScore": 1, "status": "FINISHED", "date": "2025-01-25", "time": "FT"},
        {"homeTeam": "Newcastle", "awayTeam": "Southampton", "homeScore": 3, "awayScore": 1, "status": "FINISHED", "date": "2025-01-25", "time": "FT"},
        {"homeTeam": "Tottenham", "awayTeam": "Leicester", "homeScore": None, "awayScore": None, "status": "SCHEDULED", "date": "2025-01-26", "time": "16:30"},
        {"homeTeam": "Manchester United", "awayTeam": "Fulham", "homeScore": None, "awayScore": None, "status": "SCHEDULED", "date": "2025-01-26", "time": "14:00"},
    ],
    "PD": [
        {"homeTeam": "Real Madrid", "awayTeam": "Valladolid", "homeScore": 3, "awayScore": 0, "status": "FINISHED", "date": "2025-01-25", "time": "FT"},
        {"homeTeam": "Barcelona", "awayTeam": "Valencia", "homeScore": 7, "awayScore": 1, "status": "FINISHED", "date": "2025-01-26", "time": "FT"},
        {"homeTeam": "Atletico Madrid", "awayTeam": "Villarreal", "homeScore": 1, "awayScore": 0, "status": "FINISHED", "date": "2025-01-19", "time": "FT"},
        {"homeTeam": "Athletic Bilbao", "awayTeam": "Sevilla", "homeScore": None, "awayScore": None, "status": "SCHEDULED", "date": "2025-01-27", "time": "21:00"},
    ],
    "BL1": [
        {"homeTeam": "Bayern Munich", "awayTeam": "Freiburg", "homeScore": 2, "awayScore": 1, "status": "FINISHED", "date": "2025-01-25", "time": "FT"},
        {"homeTeam": "Bayer Leverkusen", "awayTeam": "RB Leipzig", "homeScore": 2, "awayScore": 2, "status": "FINISHED", "date": "2025-01-25", "time": "FT"},
        {"homeTeam": "Borussia Dortmund", "awayTeam": "Werder Bremen", "homeScore": 2, "awayScore": 1, "status": "FINISHED", "date": "2025-01-25", "time": "FT"},
        {"homeTeam": "Eintracht Frankfurt", "awayTeam": "Hoffenheim", "homeScore": None, "awayScore": None, "status": "SCHEDULED", "date": "2025-01-26", "time": "17:30"},
    ],
    "SA": [
        {"homeTeam": "Inter Milan", "awayTeam": "Lecce", "homeScore": 4, "awayScore": 0, "status": "FINISHED", "date": "2025-01-26", "time": "FT"},
        {"homeTeam": "Napoli", "awayTeam": "Juventus", "homeScore": 2, "awayScore": 1, "status": "FINISHED", "date": "2025-01-25", "time": "FT"},
        {"homeTeam": "AC Milan", "awayTeam": "Parma", "homeScore": 3, "awayScore": 2, "status": "FINISHED", "date": "2025-01-26", "time": "FT"},
        {"homeTeam": "Lazio", "awayTeam": "Fiorentina", "homeScore": None, "awayScore": None, "status": "SCHEDULED", "date": "2025-01-27", "time": "20:45"},
    ],
    "FL1": [
        {"homeTeam": "PSG", "awayTeam": "Reims", "homeScore": 1, "awayScore": 1, "status": "FINISHED", "date": "2025-01-25", "time": "FT"},
        {"homeTeam": "Monaco", "awayTeam": "Rennes", "homeScore": 3, "awayScore": 2, "status": "FINISHED", "date": "2025-01-26", "time": "FT"},
        {"homeTeam": "Marseille", "awayTeam": "Nice", "homeScore": 2, "awayScore": 0, "status": "FINISHED", "date": "2025-01-25", "time": "FT"},
        {"homeTeam": "Lille", "awayTeam": "Lyon", "homeScore": None, "awayScore": None, "status": "SCHEDULED", "date": "2025-01-27", "time": "20:45"},
    ],
    "CL": [
        {"homeTeam": "Barcelona", "awayTeam": "Atalanta", "homeScore": 2, "awayScore": 2, "status": "FINISHED", "date": "2025-01-29", "time": "FT"},
        {"homeTeam": "Manchester City", "awayTeam": "Club Brugge", "homeScore": 3, "awayScore": 1, "status": "FINISHED", "date": "2025-01-29", "time": "FT"},
        {"homeTeam": "Real Madrid", "awayTeam": "Brest", "homeScore": 3, "awayScore": 0, "status": "FINISHED", "date": "2025-01-29", "time": "FT"},
        {"homeTeam": "Liverpool", "awayTeam": "PSV", "homeScore": None, "awayScore": None, "status": "SCHEDULED", "date": "2025-01-29", "time": "21:00"},
        {"homeTeam": "Arsenal", "awayTeam": "Girona", "homeScore": None, "awayScore": None, "status": "SCHEDULED", "date": "2025-01-29", "time": "21:00"},
    ],
}

SAMPLE_STANDINGS = {
    "PL": [
        {"position": 1, "team": "Liverpool", "played": 22, "won": 16, "draw": 5, "lost": 1, "points": 53},
        {"position": 2, "team": "Arsenal", "played": 22, "won": 13, "draw": 7, "lost": 2, "points": 46},
        {"position": 3, "team": "Nottingham Forest", "played": 22, "won": 13, "draw": 5, "lost": 4, "points": 44},
        {"position": 4, "team": "Chelsea", "played": 22, "won": 12, "draw": 5, "lost": 5, "points": 41},
        {"position": 5, "team": "Newcastle", "played": 22, "won": 11, "draw": 6, "lost": 5, "points": 39},
        {"position": 6, "team": "Bournemouth", "played": 22, "won": 10, "draw": 7, "lost": 5, "points": 37},
        {"position": 7, "team": "Manchester City", "played": 22, "won": 11, "draw": 5, "lost": 6, "points": 38},
        {"position": 8, "team": "Aston Villa", "played": 22, "won": 10, "draw": 6, "lost": 6, "points": 36},
        {"position": 9, "team": "Fulham", "played": 22, "won": 9, "draw": 6, "lost": 7, "points": 33},
        {"position": 10, "team": "Brighton", "played": 22, "won": 7, "draw": 10, "lost": 5, "points": 31},
    ],
    "PD": [
        {"position": 1, "team": "Barcelona", "played": 21, "won": 15, "draw": 4, "lost": 2, "points": 49},
        {"position": 2, "team": "Real Madrid", "played": 21, "won": 14, "draw": 4, "lost": 3, "points": 46},
        {"position": 3, "team": "Atletico Madrid", "played": 21, "won": 13, "draw": 5, "lost": 3, "points": 44},
        {"position": 4, "team": "Athletic Bilbao", "played": 21, "won": 11, "draw": 7, "lost": 3, "points": 40},
        {"position": 5, "team": "Villarreal", "played": 21, "won": 11, "draw": 4, "lost": 6, "points": 37},
    ],
    "BL1": [
        {"position": 1, "team": "Bayern Munich", "played": 19, "won": 13, "draw": 4, "lost": 2, "points": 43},
        {"position": 2, "team": "Bayer Leverkusen", "played": 19, "won": 12, "draw": 5, "lost": 2, "points": 41},
        {"position": 3, "team": "Eintracht Frankfurt", "played": 19, "won": 10, "draw": 6, "lost": 3, "points": 36},
        {"position": 4, "team": "RB Leipzig", "played": 19, "won": 10, "draw": 4, "lost": 5, "points": 34},
        {"position": 5, "team": "Borussia Dortmund", "played": 19, "won": 9, "draw": 6, "lost": 4, "points": 33},
    ],
    "SA": [
        {"position": 1, "team": "Napoli", "played": 22, "won": 15, "draw": 4, "lost": 3, "points": 49},
        {"position": 2, "team": "Inter Milan", "played": 21, "won": 14, "draw": 5, "lost": 2, "points": 47},
        {"position": 3, "team": "Atalanta", "played": 22, "won": 13, "draw": 4, "lost": 5, "points": 43},
        {"position": 4, "team": "Lazio", "played": 22, "won": 13, "draw": 4, "lost": 5, "points": 43},
        {"position": 5, "team": "Juventus", "played": 22, "won": 10, "draw": 10, "lost": 2, "points": 40},
    ],
    "FL1": [
        {"position": 1, "team": "PSG", "played": 19, "won": 15, "draw": 2, "lost": 2, "points": 47},
        {"position": 2, "team": "Monaco", "played": 19, "won": 12, "draw": 5, "lost": 2, "points": 41},
        {"position": 3, "team": "Marseille", "played": 19, "won": 11, "draw": 4, "lost": 4, "points": 37},
        {"position": 4, "team": "Lille", "played": 19, "won": 10, "draw": 5, "lost": 4, "points": 35},
        {"position": 5, "team": "Lyon", "played": 19, "won": 9, "draw": 5, "lost": 5, "points": 32},
    ],
    "CL": [
        {"position": 1, "team": "Liverpool", "played": 8, "won": 8, "draw": 0, "lost": 0, "points": 24},
        {"position": 2, "team": "Barcelona", "played": 8, "won": 7, "draw": 0, "lost": 1, "points": 21},
        {"position": 3, "team": "Arsenal", "played": 8, "won": 6, "draw": 1, "lost": 1, "points": 19},
        {"position": 4, "team": "Inter Milan", "played": 8, "won": 6, "draw": 1, "lost": 1, "points": 19},
        {"position": 5, "team": "Atletico Madrid", "played": 8, "won": 6, "draw": 0, "lost": 2, "points": 18},
    ],
}

@api_router.get("/football/matches")
async def get_football_matches(league: str = "PL"):
    """Get football matches for a league - tries live API first, falls back to sample data"""
    league_id = LEAGUE_IDS.get(league)
    
    # Try to fetch from live API
    if league_id:
        live_matches = await fetch_live_football_data(league_id)
        if live_matches:
            return {"matches": live_matches, "league": LEAGUE_CODES.get(league, league), "source": "live"}
    
    # Fallback to sample data
    return {"matches": SAMPLE_MATCHES.get(league, []), "league": LEAGUE_CODES.get(league, league), "source": "sample"}

@api_router.get("/football/standings")
async def get_football_standings(league: str = "PL"):
    """Get league standings - tries live API first, falls back to sample data"""
    league_id = LEAGUE_IDS.get(league)
    
    # Try to fetch from live API
    if league_id:
        live_standings = await fetch_standings_data(league_id)
        if live_standings:
            return {"standings": live_standings, "league": LEAGUE_CODES.get(league, league), "source": "live"}
    
    # Fallback to sample data
    return {"standings": SAMPLE_STANDINGS.get(league, []), "league": LEAGUE_CODES.get(league, league), "source": "sample"}

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
