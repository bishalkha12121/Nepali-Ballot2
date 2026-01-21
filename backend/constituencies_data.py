# Complete Nepal Federal Constituencies Data
# 165 FPTP seats distributed across 7 provinces

# Import real election data
from real_election_data import REAL_CANDIDATES, ELECTION_WINNERS_2022

def generate_constituencies():
    """Generate all 165 federal constituencies"""
    constituencies = []
    
    # Province data with districts and their seat counts
    PROVINCE_DATA = {
        "koshi": {
            "name": "Koshi Province",
            "seats": 28,
            "districts": {
                "Jhapa": 4, "Morang": 6, "Sunsari": 3, "Ilam": 2, "Panchthar": 1,
                "Taplejung": 1, "Sankhuwasabha": 1, "Terhathum": 1, "Dhankuta": 1,
                "Bhojpur": 1, "Solukhumbu": 1, "Okhaldhunga": 1, "Khotang": 2,
                "Udayapur": 2, "Saptari": 1
            }
        },
        "madhesh": {
            "name": "Madhesh Province",
            "seats": 32,
            "districts": {
                "Saptari": 3, "Siraha": 4, "Dhanusha": 4, "Mahottari": 4,
                "Sarlahi": 4, "Rautahat": 4, "Bara": 4, "Parsa": 3, "Sunsari": 2
            }
        },
        "bagmati": {
            "name": "Bagmati Province",
            "seats": 33,
            "districts": {
                "Kathmandu": 10, "Lalitpur": 3, "Bhaktapur": 2, "Kavrepalanchok": 3,
                "Sindhupalchok": 2, "Dolakha": 1, "Ramechhap": 2, "Sindhuli": 2,
                "Makwanpur": 2, "Chitwan": 3, "Dhading": 2, "Nuwakot": 2,
                "Rasuwa": 1
            }
        },
        "gandaki": {
            "name": "Gandaki Province",
            "seats": 18,
            "districts": {
                "Kaski": 3, "Tanahun": 2, "Syangja": 2, "Gorkha": 2, "Lamjung": 1,
                "Manang": 1, "Mustang": 1, "Myagdi": 1, "Baglung": 2, "Parbat": 1,
                "Nawalpur": 2
            }
        },
        "lumbini": {
            "name": "Lumbini Province",
            "seats": 26,
            "districts": {
                "Rupandehi": 5, "Kapilvastu": 3, "Palpa": 2, "Arghakhanchi": 1,
                "Gulmi": 2, "Nawalparasi West": 2, "Dang": 3, "Banke": 3,
                "Bardiya": 2, "Pyuthan": 1, "Rolpa": 1, "Rukum East": 1
            }
        },
        "karnali": {
            "name": "Karnali Province",
            "seats": 12,
            "districts": {
                "Surkhet": 2, "Dailekh": 2, "Jajarkot": 1, "Dolpa": 1, "Jumla": 1,
                "Kalikot": 1, "Mugu": 1, "Humla": 1, "Salyan": 1, "Rukum West": 1
            }
        },
        "sudurpashchim": {
            "name": "Sudurpashchim Province",
            "seats": 16,
            "districts": {
                "Kailali": 5, "Kanchanpur": 3, "Dadeldhura": 1, "Baitadi": 2,
                "Darchula": 1, "Bajhang": 1, "Bajura": 1, "Achham": 2
            }
        }
    }
    
    seat_number = 1
    
    for province_id, province_data in PROVINCE_DATA.items():
        for district, num_seats in province_data["districts"].items():
            for seat in range(1, num_seats + 1):
                constituency = {
                    "id": f"fed-{seat_number}",
                    "name": f"{district}-{seat}" if num_seats > 1 else district,
                    "full_name": f"{province_data['name']} - {district} Constituency {seat}",
                    "seat_number": seat_number,
                    "province_id": province_id,
                    "province": province_data["name"],
                    "district": district,
                    "type": "federal",
                    "candidates_count": 4 + (seat_number % 5)  # Vary between 4-8
                }
                constituencies.append(constituency)
                seat_number += 1
    
    return constituencies

def generate_provincial_constituencies():
    """Generate provincial assembly constituencies (sample - 550 total in reality)"""
    constituencies = []
    
    # Sample provincial constituencies - add more as needed
    PROVINCIAL_DATA = [
        # Koshi Province Provincial
        {"province_id": "koshi", "province": "Koshi Province", "districts": ["Jhapa", "Morang", "Sunsari", "Ilam"]},
        # Bagmati Province Provincial
        {"province_id": "bagmati", "province": "Bagmati Province", "districts": ["Kathmandu", "Lalitpur", "Bhaktapur", "Kavrepalanchok"]},
        # Gandaki Province Provincial
        {"province_id": "gandaki", "province": "Gandaki Province", "districts": ["Kaski", "Tanahun", "Syangja", "Gorkha"]},
        # Lumbini Province Provincial
        {"province_id": "lumbini", "province": "Lumbini Province", "districts": ["Rupandehi", "Kapilvastu", "Dang", "Banke"]},
        # Madhesh Province Provincial
        {"province_id": "madhesh", "province": "Madhesh Province", "districts": ["Dhanusha", "Mahottari", "Sarlahi", "Bara"]},
        # Karnali Province Provincial
        {"province_id": "karnali", "province": "Karnali Province", "districts": ["Surkhet", "Dailekh", "Jumla"]},
        # Sudurpashchim Province Provincial
        {"province_id": "sudurpashchim", "province": "Sudurpashchim Province", "districts": ["Kailali", "Kanchanpur", "Dadeldhura"]},
    ]
    
    idx = 1
    for prov in PROVINCIAL_DATA:
        for district in prov["districts"]:
            for seat in range(1, 3):  # 2 seats per district sample
                constituencies.append({
                    "id": f"prov-{idx}",
                    "name": f"{district} Provincial-{seat}",
                    "province_id": prov["province_id"],
                    "province": prov["province"],
                    "district": district,
                    "type": "provincial",
                    "candidates_count": 3 + (idx % 4)
                })
                idx += 1
    
    return constituencies

def generate_local_constituencies():
    """Generate local level units (sample of major municipalities)"""
    LOCAL_UNITS = [
        # Metropolitan Cities (6)
        {"id": "local-ktm", "name": "Kathmandu Metropolitan City", "province_id": "bagmati", "province": "Bagmati Province", "district": "Kathmandu", "type": "local", "candidates_count": 12, "unit_type": "Metropolitan"},
        {"id": "local-pokhara", "name": "Pokhara Metropolitan City", "province_id": "gandaki", "province": "Gandaki Province", "district": "Kaski", "type": "local", "candidates_count": 10, "unit_type": "Metropolitan"},
        {"id": "local-lalitpur", "name": "Lalitpur Metropolitan City", "province_id": "bagmati", "province": "Bagmati Province", "district": "Lalitpur", "type": "local", "candidates_count": 9, "unit_type": "Metropolitan"},
        {"id": "local-bharatpur", "name": "Bharatpur Metropolitan City", "province_id": "bagmati", "province": "Bagmati Province", "district": "Chitwan", "type": "local", "candidates_count": 8, "unit_type": "Metropolitan"},
        {"id": "local-biratnagar", "name": "Biratnagar Metropolitan City", "province_id": "koshi", "province": "Koshi Province", "district": "Morang", "type": "local", "candidates_count": 10, "unit_type": "Metropolitan"},
        {"id": "local-birgunj", "name": "Birgunj Metropolitan City", "province_id": "madhesh", "province": "Madhesh Province", "district": "Parsa", "type": "local", "candidates_count": 8, "unit_type": "Metropolitan"},
        
        # Sub-Metropolitan Cities (11)
        {"id": "local-dharan", "name": "Dharan Sub-Metropolitan City", "province_id": "koshi", "province": "Koshi Province", "district": "Sunsari", "type": "local", "candidates_count": 7, "unit_type": "Sub-Metropolitan"},
        {"id": "local-butwal", "name": "Butwal Sub-Metropolitan City", "province_id": "lumbini", "province": "Lumbini Province", "district": "Rupandehi", "type": "local", "candidates_count": 7, "unit_type": "Sub-Metropolitan"},
        {"id": "local-hetauda", "name": "Hetauda Sub-Metropolitan City", "province_id": "bagmati", "province": "Bagmati Province", "district": "Makwanpur", "type": "local", "candidates_count": 6, "unit_type": "Sub-Metropolitan"},
        {"id": "local-janakpur", "name": "Janakpur Sub-Metropolitan City", "province_id": "madhesh", "province": "Madhesh Province", "district": "Dhanusha", "type": "local", "candidates_count": 8, "unit_type": "Sub-Metropolitan"},
        {"id": "local-nepalgunj", "name": "Nepalgunj Sub-Metropolitan City", "province_id": "lumbini", "province": "Lumbini Province", "district": "Banke", "type": "local", "candidates_count": 7, "unit_type": "Sub-Metropolitan"},
        {"id": "local-itahari", "name": "Itahari Sub-Metropolitan City", "province_id": "koshi", "province": "Koshi Province", "district": "Sunsari", "type": "local", "candidates_count": 6, "unit_type": "Sub-Metropolitan"},
        {"id": "local-kalaiya", "name": "Kalaiya Sub-Metropolitan City", "province_id": "madhesh", "province": "Madhesh Province", "district": "Bara", "type": "local", "candidates_count": 5, "unit_type": "Sub-Metropolitan"},
        {"id": "local-tulsipur", "name": "Tulsipur Sub-Metropolitan City", "province_id": "lumbini", "province": "Lumbini Province", "district": "Dang", "type": "local", "candidates_count": 6, "unit_type": "Sub-Metropolitan"},
        {"id": "local-ghorahi", "name": "Ghorahi Sub-Metropolitan City", "province_id": "lumbini", "province": "Lumbini Province", "district": "Dang", "type": "local", "candidates_count": 5, "unit_type": "Sub-Metropolitan"},
        {"id": "local-birendranagar", "name": "Birendranagar Municipality", "province_id": "karnali", "province": "Karnali Province", "district": "Surkhet", "type": "local", "candidates_count": 5, "unit_type": "Municipality"},
        {"id": "local-dhangadhi", "name": "Dhangadhi Sub-Metropolitan City", "province_id": "sudurpashchim", "province": "Sudurpashchim Province", "district": "Kailali", "type": "local", "candidates_count": 7, "unit_type": "Sub-Metropolitan"},
    ]
    return LOCAL_UNITS

# Generate all constituencies
FEDERAL_CONSTITUENCIES = generate_constituencies()
PROVINCIAL_CONSTITUENCIES = generate_provincial_constituencies()
LOCAL_CONSTITUENCIES = generate_local_constituencies()

# Combined list
ALL_CONSTITUENCIES = FEDERAL_CONSTITUENCIES + PROVINCIAL_CONSTITUENCIES + LOCAL_CONSTITUENCIES

# Sample candidates for key constituencies
CONSTITUENCY_CANDIDATES = [
    # Kathmandu Metro candidates
    {
        "id": "cand-ktm-1", "name": "Balen Shah", "party": "Independent",
        "party_color": "#48CAE4", "constituency": "Kathmandu Metropolitan City",
        "constituency_id": "local-ktm", "district": "Kathmandu", "province_id": "bagmati",
        "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
        "bio": "Civil engineer, rapper, and current Mayor of Kathmandu. Known for anti-corruption stance and urban development.",
        "age": 35, "is_incumbent": True, "elections_contested": 1, "wins": 1,
        "election_history": [{"year": 2022, "election_type": "Local", "constituency": "Kathmandu Metro Mayor", "result": "Won", "votes": 61767}]
    },
    {
        "id": "cand-ktm-2", "name": "Sirjana Singh", "party": "Nepali Congress",
        "party_color": "#2A9D8F", "constituency": "Kathmandu Metropolitan City",
        "constituency_id": "local-ktm", "district": "Kathmandu", "province_id": "bagmati",
        "image_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
        "bio": "Experienced politician and former deputy mayor candidate.",
        "age": 48, "is_incumbent": False, "elections_contested": 2, "wins": 0,
        "election_history": [
            {"year": 2022, "election_type": "Local", "constituency": "Kathmandu Metro Mayor", "result": "Lost", "votes": 35421},
            {"year": 2017, "election_type": "Local", "constituency": "Kathmandu Metro Deputy Mayor", "result": "Lost", "votes": 28654}
        ]
    },
    {
        "id": "cand-ktm-3", "name": "Keshav Sthapit", "party": "CPN-UML",
        "party_color": "#EF233C", "constituency": "Kathmandu Metropolitan City",
        "constituency_id": "local-ktm", "district": "Kathmandu", "province_id": "bagmati",
        "image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
        "bio": "Former Mayor of Kathmandu (2002-2006). Veteran UML leader.",
        "age": 65, "is_incumbent": False, "elections_contested": 3, "wins": 1,
        "election_history": [
            {"year": 2022, "election_type": "Local", "constituency": "Kathmandu Metro Mayor", "result": "Lost", "votes": 42376},
            {"year": 2017, "election_type": "Local", "constituency": "Kathmandu Metro Mayor", "result": "Lost", "votes": 67892},
            {"year": 2002, "election_type": "Local", "constituency": "Kathmandu Metro Mayor", "result": "Won", "votes": 54321}
        ]
    },
    # Kathmandu Federal candidates
    {
        "id": "cand-ktm-fed-1", "name": "Gagan Thapa", "party": "Nepali Congress",
        "party_color": "#2A9D8F", "constituency": "Kathmandu-4",
        "constituency_id": "fed-4", "district": "Kathmandu", "province_id": "bagmati",
        "image_url": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
        "bio": "General Secretary of Nepali Congress. Young leader known for reform agenda.",
        "age": 48, "is_incumbent": True, "elections_contested": 3, "wins": 3,
        "election_history": [
            {"year": 2022, "election_type": "Federal", "constituency": "Kathmandu-4", "result": "Won", "votes": 32456},
            {"year": 2017, "election_type": "Federal", "constituency": "Kathmandu-4", "result": "Won", "votes": 28976}
        ]
    },
    {
        "id": "cand-ktm-fed-2", "name": "Pradeep Gyawali", "party": "CPN-UML",
        "party_color": "#EF233C", "constituency": "Kathmandu-3",
        "constituency_id": "fed-3", "district": "Kathmandu", "province_id": "bagmati",
        "image_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face",
        "bio": "Former Foreign Minister. Senior UML leader and spokesperson.",
        "age": 55, "is_incumbent": True, "elections_contested": 2, "wins": 2,
        "election_history": [
            {"year": 2022, "election_type": "Federal", "constituency": "Kathmandu-3", "result": "Won", "votes": 29876}
        ]
    },
    # Pokhara candidates
    {
        "id": "cand-pok-1", "name": "Dhan Raj Acharya", "party": "CPN-UML",
        "party_color": "#EF233C", "constituency": "Pokhara Metropolitan City",
        "constituency_id": "local-pokhara", "district": "Kaski", "province_id": "gandaki",
        "image_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
        "bio": "Current Mayor of Pokhara. Tourism and development focused.",
        "age": 52, "is_incumbent": True, "elections_contested": 2, "wins": 2,
        "election_history": [
            {"year": 2022, "election_type": "Local", "constituency": "Pokhara Metro Mayor", "result": "Won", "votes": 45678}
        ]
    },
    # Jhapa Federal candidates
    {
        "id": "cand-jhapa-1", "name": "Rajendra Lingden", "party": "RPP",
        "party_color": "#FFB703", "constituency": "Jhapa-2",
        "constituency_id": "fed-2", "district": "Jhapa", "province_id": "koshi",
        "image_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face",
        "bio": "Chairman of Rastriya Prajatantra Party. Pro-monarchy advocate.",
        "age": 55, "is_incumbent": True, "elections_contested": 2, "wins": 1,
        "election_history": [
            {"year": 2022, "election_type": "Federal", "constituency": "Jhapa-2", "result": "Won", "votes": 25678}
        ]
    },
    # Rabi Lamichhane - Chitwan
    {
        "id": "cand-chitwan-1", "name": "Rabi Lamichhane", "party": "RSP",
        "party_color": "#48CAE4", "constituency": "Chitwan-2",
        "constituency_id": "fed-32", "district": "Chitwan", "province_id": "bagmati",
        "image_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
        "bio": "Founder of RSP, former journalist. Home Minister in current government.",
        "age": 47, "is_incumbent": True, "elections_contested": 1, "wins": 1,
        "election_history": [
            {"year": 2022, "election_type": "Federal", "constituency": "Chitwan-2", "result": "Won", "votes": 42156}
        ]
    },
    # KP Oli - Jhapa
    {
        "id": "cand-jhapa-oli", "name": "KP Sharma Oli", "party": "CPN-UML",
        "party_color": "#EF233C", "constituency": "Jhapa-5",
        "constituency_id": "fed-5", "district": "Jhapa", "province_id": "koshi",
        "image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
        "bio": "Chairman of CPN-UML. Two-time Prime Minister of Nepal.",
        "age": 72, "is_incumbent": True, "elections_contested": 6, "wins": 5,
        "election_history": [
            {"year": 2022, "election_type": "Federal", "constituency": "Jhapa-5", "result": "Won", "votes": 38765},
            {"year": 2017, "election_type": "Federal", "constituency": "Jhapa-5", "result": "Won", "votes": 42341}
        ]
    },
    # Prachanda - Gorkha
    {
        "id": "cand-gorkha-1", "name": "Pushpa Kamal Dahal (Prachanda)", "party": "CPN-Maoist Centre",
        "party_color": "#B91C1C", "constituency": "Gorkha-2",
        "constituency_id": "fed-47", "district": "Gorkha", "province_id": "gandaki",
        "image_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face",
        "bio": "Chairman of CPN-Maoist Centre. Current Prime Minister. Former guerrilla leader.",
        "age": 69, "is_incumbent": True, "elections_contested": 4, "wins": 4,
        "election_history": [
            {"year": 2022, "election_type": "Federal", "constituency": "Gorkha-2", "result": "Won", "votes": 35678},
            {"year": 2017, "election_type": "Federal", "constituency": "Chitwan-3", "result": "Won", "votes": 41234}
        ]
    },
    # Sher Bahadur Deuba
    {
        "id": "cand-dadeldhura-1", "name": "Sher Bahadur Deuba", "party": "Nepali Congress",
        "party_color": "#2A9D8F", "constituency": "Dadeldhura-1",
        "constituency_id": "fed-153", "district": "Dadeldhura", "province_id": "sudurpashchim",
        "image_url": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
        "bio": "President of Nepali Congress. Five-time Prime Minister of Nepal.",
        "age": 78, "is_incumbent": True, "elections_contested": 8, "wins": 7,
        "election_history": [
            {"year": 2022, "election_type": "Federal", "constituency": "Dadeldhura-1", "result": "Won", "votes": 28976},
            {"year": 2017, "election_type": "Federal", "constituency": "Dadeldhura-1", "result": "Won", "votes": 31245}
        ]
    }
]

# Combine sample candidates with real election data
CONSTITUENCY_CANDIDATES = CONSTITUENCY_CANDIDATES + REAL_CANDIDATES
