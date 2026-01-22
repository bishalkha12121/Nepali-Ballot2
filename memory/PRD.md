# Nepal Election Simulation Platform - PRD

## Original Problem Statement
Build an efficient online voting platform for national election with great graphics about NEPALESE POLITICS. Write what happened in Nepal as our mission statement. Running election simulation in hopes of ads revenue from this website. This is just for fun.

## User Requirements
- Anonymous voting (no accounts needed)
- Single vote for directly elected Prime Minister
- Include real Nepalese political parties and candidates including Balen Shah
- Vote analytics from past election data
- Modern Nepalese theme design
- Set up for each province in the country and accurate historical data

## Architecture
- **Frontend**: React with Tailwind CSS, Shadcn UI components, Framer Motion animations, Recharts
- **Backend**: FastAPI with MongoDB
- **Auth**: Anonymous (browser-based voter token)

## User Personas
1. **Nepali Politics Enthusiast**: Wants to simulate elections and see how candidates would perform
2. **Young Voter**: Learning about Nepal's political landscape through interactive simulation
3. **Expat Nepali**: Engaging with homeland politics from abroad
4. **Political Analyst**: Comparing historical data and current trends

## Core Features (Implemented)
### ✅ Phase 1 - MVP (Completed Dec 2024)
- [x] Home page with mission statement about Nepal's democratic journey
- [x] Voting page with 5 candidates (Balen Shah, KP Sharma Oli, Sher Bahadur Deuba, Prachanda, Rabi Lamichhane)
- [x] Anonymous voting with browser-based duplicate prevention
- [x] Live results dashboard with bar charts and pie charts
- [x] Historical election data page with accurate 2017 & 2022 elections
- [x] All 7 Nepal provinces displayed (Koshi, Madhesh, Bagmati, Gandaki, Lumbini, Karnali, Sudurpashchim)
- [x] Province-wise election breakdown for federal elections
- [x] Nepal's democratic timeline (1951-2022)
- [x] Major political parties info section

### Candidates
1. Balen Shah - Independent/RSP Alliance (Mayor of Kathmandu)
2. KP Sharma Oli - CPN-UML
3. Sher Bahadur Deuba - Nepali Congress
4. Pushpa Kamal Dahal (Prachanda) - CPN-Maoist Centre
5. Rabi Lamichhane - Rastriya Swatantra Party

### Historical Elections Included
1. 2017 Federal Parliament Election (275 seats)
2. 2017 Provincial Assembly Election (550 seats)
3. 2022 Federal Parliament Election (275 seats)
4. 2022 Provincial Assembly Election (550 seats)
5. 2022 Local Level Election (903 positions)

## API Endpoints
- GET /api/candidates - List all candidates
- GET /api/provinces - List all 7 provinces
- POST /api/vote - Cast a vote
- GET /api/results - Get live results
- GET /api/check-vote/{token} - Check if voted
- GET /api/historical - Get all historical data
- GET /api/historical/{id} - Get specific election

## Prioritized Backlog
### P1 - High Priority
- [ ] Add real candidate photos (currently using placeholders)
- [ ] Regional/province-wise voting results breakdown
- [ ] Social sharing of voting results

### P2 - Medium Priority
- [ ] Real-time vote count animations
- [ ] Voter demographics simulation
- [ ] Multiple election simulations (not just PM)
- [ ] Compare candidates page

### P3 - Low Priority
- [ ] Dark mode toggle
- [ ] Multi-language support (Nepali/English)
- [ ] Vote prediction based on historical data
- [ ] Ad integration for revenue

## Completed Work (Jan 2026)
- [x] Favicon and PWA icons created (Nepal-themed ballot box design in red/blue)
- [x] News page with RSS feeds from BBC Nepali, Ekantipur, Kathmandu Post
- [x] Constituencies page with 167 federal constituencies and 69 real candidates from 2022
- [x] Nepal Map section with interactive SVG provinces
- [x] Sports page for football scores
- [x] Games page with Political Quiz and Guess the Leader

## Pending Issues
- [ ] Party flags/logos - BLOCKED (waiting for user to provide images)
- [ ] Football scores API - BLOCKED (user paused task)
- [ ] Testing agent reliability - Known issue, using manual testing

## Next Tasks
1. Test Games Page functionality (Political Quiz & Guess the Leader)
2. Complete PWA/TWA setup for Play Store
3. Implement affiliate/ad code management system
4. Migrate hardcoded data to database/JSON files
