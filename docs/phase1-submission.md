# GigShield Phase 1 Submission Checklist

**Team:** CodeSmart | **University:** KL University | **Submitted:** March 20, 2026

## Deliverables

### Problem & Research
- [x] Problem statement with market sizing (12M+ gig workers, ₹4,000-10,000 Cr unprotected income)
- [x] Gap analysis of existing solutions (traditional insurance, PMFBY, ESIC, platform covers)
- [x] Target persona research (Ravi Shankar - Hyderabad Swiggy rider, Arjun - Delhi Zomato rider)
- [x] User interviews and pain point documentation

### Solution Design
- [x] Parametric insurance concept with zero-touch claims
- [x] Three-tier coverage model (Basic ₹20/Standard ₹35/Pro ₹55 per week)
- [x] Product workflow (9-step end-to-end flow)
- [x] UX design principles for low-literacy, low-internet users

### Technical Architecture
- [x] System architecture diagram (React PWA → Express → PostgreSQL → Celery → FastAPI)
- [x] Dynamic pricing formula with worked example
- [x] Parametric trigger system with 5 trigger types and thresholds
- [x] 5-layer fraud detection system design
- [x] AI model selection rationale (Isolation Forest + XGBoost)
- [x] Tech stack decisions with justifications

### Business Viability
- [x] Revenue model (worker premiums + B2B fees + risk data)
- [x] Break-even analysis (10,000 workers at ₹32 avg = ₹1.66 Cr/year)
- [x] Loss ratio target (65%) and margin analysis
- [x] Scalability plan (zone-based model, API-first)

### Repository
- [x] README with complete documentation
- [x] Repository structure defined
- [x] Phase 2 roadmap planned

## Phase 2 Scope (Weeks 3-4)
- Complete registration and policy management with language support
- Live dynamic premium calculation using real API data
- 3-5 automated trigger integrations (Open-Meteo, OpenAQ, NewsData.io)
- Claims management and simulated payout flow via Razorpay sandbox
- Basic fraud detection with location validation and duplicate prevention

## Phase 3 Scope (Weeks 5-6)
- Advanced fraud detection with GPS spoofing patterns
- Instant payout via Razorpay test mode
- Worker and insurer dashboards
- Full conflict resolution portal
- Voice notifications in Telugu and Hindi
