                                        GigShield - AI-Powered Parametric Income Insurance for Gig Workers
                                                Guidewire DEVTrails 2026 | Phase 1 Submission

Greetings to the Judges and the Guidewire DEVTrails 2026 Team,

We are Team CodeSmart, a group of engineering students who believe technology should serve the people who need it most. This is our solution to one of the most ignored problems in India's gig economy — the complete lack of income protection for delivery workers.

We are proud to introduce GigShield.

Team Members

    Team Lead  :  Kusmitha Salveru
    Member 2   :  Sravanthi Pindiganti
    Member 3   :  Ruthvika Sri Gayathri Vollu
    Member 4   :  Mohan Degala

University   :  KL UNIVERSITY
Phase        :  Phase 1 - Ideation and Foundation
Submission   :  March 20, 2026

    TABLE OF CONTENTS

    1.  Problem Statement
    2.  Our Idea
    3.  Why Current Solutions Fail
    4.  Target Persona
    5.  Solution Overview
    6.  Core Innovations
    7.  Product Workflow
    8.  UX Design for Gig Workers
    9.  Dynamic Pricing Model
    10. Parametric Trigger System
    11. Claiming Process
    12. Fraud Detection System
    12A. AI Model Explanation
    13. Conflict Resolution Mechanism
    14. Tech Stack
    14A. Frontend Structure
    15. System Architecture
    16. Future Scope
    17. Why This Will Win
    18. Conclusion
    18A. Repository Structure
    19. GitHub Repository


---


SECTION 1: PROBLEM STATEMENT


Imagine you wake up at 6 in the morning. You have 400 rupees worth of deliveries lined up. You get on your bike, open Swiggy, and then it starts pouring. Not light rain. The kind that makes roads invisible and orders disappear. You wait at the restaurant parking lot for two hours.

You go home. You earned zero rupees today.

This is the daily reality of over 12 million delivery partners in India. They deliver our food and groceries every single day, but when weather turns against them, or a strike shuts their zone, or pollution spikes make outdoor work dangerous, they have nothing to fall back on. No fixed salary. No paid leave. No safety net.

India's delivery workers lose an estimated 3,000 to 8,000 rupees every monsoon season from uncontrollable disruptions. Nobody is solving this.

GigShield is our answer. We are building the simplest, most automated income protection platform a delivery worker has ever seen — one that works in their language, on their phone, and pays them before they even have to ask.


---
SECTION 2: OUR IDEA


GigShield is a weekly parametric income insurance platform for platform-based delivery partners working with Swiggy, Zomato, Amazon, Zepto, and similar services.

The core idea in one sentence:

Every week, a delivery rider pays a small premium of 20 to 55 rupees. If a measurable external event — heavy rain, dangerous pollution, or a local strike — hits their zone and reduces working hours, GigShield automatically detects it and credits compensation to their account. No claim form. No phone call. No waiting.

Think of it like a smart friend who watches the weather for you and just sends you money when things go wrong.

Why it matters:

    Workers stop living in financial fear during monsoon season
    They stay on delivery platforms longer, which benefits Zomato and Swiggy too
    The entire cost is less than the earnings from one skipped delivery



SECTION 3: WHY CURRENT SOLUTIONS FAIL


    Traditional health and life insurance  : Does not cover income loss at all
    PMFBY (crop insurance)                 : Built for farmers, not urban gig workers
    ESIC (employee insurance)             : Requires employer enrollment — gig workers are contractors
    Platform accident cover (Swiggy/Zomato): Covers physical injuries only, not weather-related income loss
    Manual claim insurance                 : Requires forms, documents, and 30+ days of waiting

The biggest gap is this: every existing solution makes the worker prove their loss manually, using apps and processes built for educated, English-speaking users. Most delivery workers completed schooling in a regional language up to Class 10. The system was never designed for them.

GigShield is built from scratch with these gaps in mind.


---


SECTION 4: TARGET PERSONA


Meet Ravi Shankar. He is 26 years old and works as a food delivery partner in Hyderabad.

    Works for Swiggy primarily, Zomato as backup
    Earns 18,000 to 22,000 rupees per month in good months, 12,000 to 14,000 during monsoon
    Works 10 to 12 hours a day, six days a week
    Uses a Redmi 9 phone with 2 GB RAM, often on a slow connection
    Preferred language is Telugu. Has a PhonePe UPI account.
    Has never filed an insurance claim and does not trust the process
    Lost 4,200 rupees last July due to a three-day flood in his delivery zone

Ravi once said: "Insurance is for rich people. For us, it just takes money and gives nothing back."

His weekly schedule:

    Mon to Fri: Peak hours 12 to 2 PM and 7 to 10 PM
    Saturday: His highest earning day
    Rainy days: Zero to minimal orders, sometimes unsafe roads

What Ravi needs:

    Something in Telugu that does not require reading long terms
    Something that just works when things go wrong
    Something affordable — he cannot spend 500 rupees a month

Every design decision in GigShield was made thinking about Ravi. We also spoke to Arjun, a 28-year-old Zomato rider in Delhi with two children and elderly parents depending on his income. On bad weather days he barely breaks even. On strike days he earns nothing. Both represent the 20 million workers this platform exists to protect.


---


SECTION 5: SOLUTION OVERVIEW


How GigShield works from start to finish:

    Step 1:  Worker registers in under 3 minutes
    Step 2:  AI engine calculates a zone-based weekly risk score
    Step 3:  Worker picks a coverage tier and pays via UPI
    Step 4:  Coverage begins immediately
    Step 5:  System monitors weather, pollution, and disruption data every 15 minutes
    Step 6:  A qualifying disruption is detected in the worker's zone
    Step 7:  Fraud checks and location validation run automatically
    Step 8:  Payout is credited to the worker's UPI account within 15 minutes
    Step 9:  Worker receives a WhatsApp alert in their language

For Ravi, that message reads: "GigShield ne 280 rupees credit chesinamu. Meeru safe ga undandi!" — GigShield has credited 280 rupees. Stay safe.


---


SECTION 6: CORE INNOVATIONS


Innovation 1: Zone-Based Micro-Risk Scoring

We divide cities into 500m x 500m grid cells and give each cell its own risk score based on historical flood frequency, disruption days per month, AQI levels, and local strike history. A rider in flood-prone Kukatpally pays a different premium than one in lower-risk Madhapur. No competitor does this at hyperlocal level for gig workers.


Innovation 2: Zero-Touch Claim Architecture (The Invisible Claim)

The worker never files anything. When a qualifying event is detected, the system cross-verifies the worker's zone activity, calculates the payout, and initiates the UPI transfer — all within 15 minutes. The worker's only action is receiving the money.


Innovation 3: Trust Score and Conflict Resolution

Every worker has a Trust Score that builds over time. High-trust workers receive instant payouts and small premium discounts. If a payout is ever flagged incorrectly, workers can raise a dispute in two taps. The system auto-resolves if corroborating event data exists, or escalates to a human reviewer within 24 hours. Full detail in Section 13.


Innovation 4: Voice-First Interface (Phase 2)

Workers can say "Buy policy" or "Dispute claim" in their regional language. For workers uncomfortable with typing, this gives full access without barriers.


Innovation 5: Embedded Platform Intelligence (Phase 2)

We plan to integrate simulated Swiggy and Zomato order log data to cross-check whether orders were actually halted during a disruption window — giving us ground truth instead of relying only on weather readings.


---


SECTION 7: PRODUCT WORKFLOW


Step 1: Registration

    Open GigShield web app, enter mobile number, verify with OTP
    Select preferred language (8 options)
    Enter name, delivery platform, primary zone, average weekly earnings
    Link UPI account for payouts
    Done in under 3 minutes. No Aadhaar or KYC required in Phase 1.


Step 2: Weekly Policy Selection

    Worker sees their zone's risk forecast for the week and three coverage options:

    Basic tier    : 20 rupees per week, covers up to 200 rupees per event
    Standard tier : 35 rupees per week, covers up to 350 rupees per event
    Pro tier      : 55 rupees per week, covers up to 600 rupees per event

    The app shows which tier most workers in the same zone chose that week.
    Coverage begins the moment payment is confirmed.


Step 3: AI Risk Calculation

    The engine computes a Weekly Risk Score and adjusts the premium accordingly.
    See Section 9 for the full pricing formula and a worked example with Ravi's numbers.


Step 4: Trigger Detection

    Monitoring runs every 15 minutes from 6 AM to 11 PM.

    Heavy Rain        : Precipitation above 15 mm per hour
    Moderate Rain     : Precipitation between 7 and 15 mm per hour
    Severe Pollution  : PM2.5 AQI above 300
    Extreme Heat      : Feels-like temperature above 44 degrees Celsius
    Flash Flood       : Any active IMD flood warning
    Curfew or Strike  : Confirmed from Google News API

    A disruption event is logged when a trigger holds above its threshold for 30 or more continuous minutes.


Step 5: Claim Processing and Payout

    For each active policyholder in the affected zone, four checks run:

        Was last app activity recorded within the zone in the past 2 hours?
        Is the worker in an active coverage week?
        Is this a duplicate Event ID?
        Does the fraud anomaly score pass?

    If all pass, payout is calculated and UPI transfer initiated (under 5 seconds).
    Worker receives WhatsApp and in-app notification in their language.
    If fraud score is elevated, payout is held and reviewed within 24 hours.


---


SECTION 8: UX DESIGN FOR GIG WORKERS


How we design for Ravi matters as much as what we build.

Onboarding:
    3-minute maximum. OTP login only. No passwords, no email.
    Progressive profiling — we collect more data over time, not all upfront.

Language Support:
    Telugu, Hindi, Tamil, Kannada, Malayalam, Bengali, Marathi, English
    Auto-detected from phone settings with manual override available
    All notifications and alerts delivered in the worker's language

Low-Literacy Interface:
    Icon-first design — every action has a visual alongside text
    Colour coding: Green = covered, Yellow = expiring, Red = action needed
    Minimum 48-pixel touch zones on all buttons
    No free-text fields. Everything is taps, toggles, and selections.

Offline and Low Internet:
    Core screens (policy status, payout history) load from local cache
    Payouts process server-side — worker does not need internet to receive money
    SMS fallback for 2G zones
    App size kept under 8 MB for entry-level Android phones


---


SECTION 9: DYNAMIC PRICING MODEL


We price for each individual worker's actual risk, not a national average that treats every rider the same.

Pricing Formula:

    Weekly Premium = Base Premium x Zone Risk Score x Season Factor x Loyalty Discount x Tier Multiplier

    Base Premium     : 25 rupees (the minimum floor)

    Zone Risk Score  : 0.5 to 1.5 based on historical disruption data for the worker's 500m grid cell

    Season Factor    : Monsoon (June to September) = 1.30
                       Post-monsoon (October, November) = 1.10
                       Winter and Spring = 0.85

    Loyalty Discount : Under 6 weeks = 1.0 (no discount)
                       6 or more weeks = 0.95 (5 percent off)
                       20 or more weeks = 0.90 (10 percent off)

    Tier Multiplier  : Basic = 1.0,  Standard = 1.4,  Pro = 2.2

Worked Example for Ravi (August, Kukatpally, Standard tier, 8 weeks active):

    Premium = 25 x 0.68 x 1.30 x 0.95 x 1.4 = approximately 30 rupees per week

    For 30 rupees, Ravi is covered for up to 350 rupees per event. Two events in a week = 700 rupees back.

Why the Business is Sustainable:

    Monsoon season sees roughly 25 percent trigger rate. Off-season drops to 5 to 8 percent.
    The annual pool balances itself. Off-season surplus cross-subsidizes peak-season payouts.
    Target loss ratio: 65 percent or below (industry standard is 60 to 70 percent)
    Operating costs: approximately 20 percent. Gross margin: approximately 15 percent.

Why it is cheaper than traditional insurance:
    No claims agents or field investigators
    AI automation cuts processing costs by around 80 percent
    Fraud is prevented upfront, not discovered after payouts are made


---


SECTION 10: PARAMETRIC TRIGGER SYSTEM


Parametric insurance in plain language:

    Normal insurance  : "Prove your loss. Fill this form. Wait 30 days."
    Parametric        : "If X happens, you get paid. No proof needed from you."

The moment a trigger crosses its threshold and stays there for the required duration, payouts activate automatically.

Trigger Summary:

    Trigger                 | Source           | Threshold                          | Duration  | Payout
    Heavy Rain              | Open-Meteo       | Precipitation >= 15 mm per hour    | 30 min    | Full
    Moderate Rain           | Open-Meteo       | Precipitation 7 to 15 mm per hour  | 45 min    | 50 percent
    Severe Pollution (AQI)  | OpenAQ / CPCB    | PM2.5 AQI above 300 (Hazardous)   | 2 hours   | Full
    Extreme Heat            | Open-Meteo       | Feels-like temp >= 44 degrees C    | 3 hours   | 40 percent
    Flash Flood / Curfew    | IMD + News API   | Official alert or confirmed event  | Full alert| Full

Payout Calculation:

    Disrupted Hours = Active trigger duration within 6 AM to 10 PM window (capped at 4 hours per event)

    Payout = (Daily Earnings / 10 hours) x Disrupted Hours x Severity Factor

    Severity Factor: HIGH events (Heavy Rain, Flood, Strike) = 1.0 | MEDIUM events = 0.6

    Example: Ravi earns 700 rupees per day. Heavy rain for 2 hours.
    Payout = (700 / 10) x 2 x 1.0 = 140 rupees. For 4 hours: 280 rupees.


---


SECTION 11: CLAIMING PROCESS


The entire process is automatic. The worker does nothing.

When a trigger fires:

    Step 1: Disruption Event is logged with a unique Event ID (zone + timestamp + type)
    Step 2: All active policyholders in the zone are fetched
    Step 3: Four automatic checks per worker:
                Last app activity within zone in past 2 hours?
                Active coverage week confirmed?
                Event ID not already processed (deduplication)?
                Fraud anomaly score within limits?
    Step 4: If all pass, payout calculated and UPI transfer initiated (under 5 seconds)
    Step 5: WhatsApp and in-app notification sent in worker's language
    Step 6: Payout recorded with full event details for transparency

If fraud score is elevated: payout is held (not cancelled), worker is notified, human reviewer responds within 24 hours.


---


SECTION 12: FRAUD DETECTION SYSTEM


Fraud is the biggest risk for any parametric insurance platform. Because everything is automated, strong detection is non-negotiable. We built five layers.

Layer 1: Location Validation
    Last app activity must be within 2 km of the trigger zone
    Activity older than 3 hours before the trigger = flagged for review

Layer 2: Activity Cross-Validation
    Was the delivery app open or recently used during the disruption window?
    Workers with 6 or more hours of zero activity before a trigger go to review, not automatic payout

Layer 3: Behavioral Anomaly Detection (ML)
    Isolation Forest model compares the worker's claim patterns against their own history and zone peers
    Anomaly score above 0.75 = human review. Above 0.90 = automatic payout hold.
    See Section 12A for the full model explanation.

Layer 4: Duplicate Event Prevention
    Each disruption event gets a unique hash ID. One payout per Event ID per worker. No double-dipping.

Layer 5: Network-Level Detection
    20 or more registrations from the same device cluster in one day = flagged
    Multiple accounts sharing one UPI ID = blocked immediately
    New workers in Week 1 are not eligible for large automatic payouts


SECTION 12A: AI MODEL EXPLANATION


We use two ML models — one for fraud detection and one for dynamic pricing.

Fraud Detection Model

    Algorithm: Isolation Forest (scikit-learn)

    Why chosen: It learns what normal claim behaviour looks like and flags deviations. Works well when we do not have labelled fraud cases upfront. Fast enough to run on each claim without slowing the payout pipeline.

    Inputs:
        Claims made in the past 30 days
        Ratio of claims to active coverage weeks
        Distance between last GPS location and trigger zone centre
        Time gap between trigger event and last app activity
        Whether self-reported earnings match estimated platform earnings for the zone

    Output: Anomaly score from 0 to 1
        Below 0.75 = auto-approve
        0.75 to 0.90 = human review
        Above 0.90 = payout hold

    Explainability: SHAP values generate a short plain-language reason for each flag, shown to reviewers and (in simplified form) to workers during disputes.

Premium Risk Scoring Model

    Algorithm: XGBoost regression (scikit-learn / xgboost library)

    Why chosen: Handles mixed tabular features well, trains quickly on small datasets, and is a proven standard for risk scoring in insurance.

    Inputs:
        Zone Risk Score from historical flood and disruption data
        Month of year (seasonal patterns)
        Delivery platform type
        Worker account age and Trust Score
        Rolling 4-week disruption frequency for the zone

    Output: Weekly Risk Score (0.5 to 1.5) fed directly into the pricing formula in Section 9.

Both models are trained on synthetic data for Phase 1. Training notebooks are in the ml-model folder of the repository.



SECTION 13: CONFLICT RESOLUTION MECHANISM


The difference between a platform workers trust and one they fear comes down to how conflicts are handled.

The Core Problem:

Ravi gets flagged for fraud through no fault of his own — maybe a GPS error, maybe the app crashed before the storm. He tells ten friends GigShield is a scam. We lose eleven users and break trust with one loyal worker.

We designed this system to prevent that exact outcome.

The Dispute Flow:

    Step 1: Worker sees "Your claim is under review"
    Step 2: Worker taps dispute option (two taps, available in all languages)
    Step 3: Worker records a voice note or types what happened — no English needed

    Step 4: System auto-checks:
        Does confirmed weather data show the event occurred?
        Did other workers in the same zone receive payouts for the same event?
        Does this worker have prior fraud flags?

    Step 5 outcomes:
        Evidence supports worker  : Payout released within 2 hours. Trust Score +2.
        Evidence is unclear       : Escalated to human reviewer, 24-hour turnaround, worker updated at each stage.
        Clear fraud pattern       : Declined with written explanation in worker's language. One final appeal allowed.

Trust Score System (Range 0 to 100, starting at 50):

    Action                                    | Score Change
    Successful validated claim                | +2
    Four weeks continuous coverage, no issues | +3
    Dispute resolved in worker's favour       | +2
    Peer worker vouches                       | +1
    Anomaly flagged (not confirmed fraud)     | minus 3
    Confirmed fraud attempt                   | minus 25

    Score above 60 : Instant payouts, no fraud hold
    Score above 75 : 5 percent premium discount
    Score above 90 : GigShield Ambassador status and referral bonuses
    Score below 30 : All claims go to manual review
    Score below 15 : Account suspended, formal appeal required


SECTION 14: TECH STACK


Frontend:
    React.js (Progressive Web App)    - Works on any browser, no app store needed, offline-capable
    Tailwind CSS                       - Fast responsive styling for small screens
    i18next                            - 8 regional languages via JSON translation files
    PWA Service Workers                - Offline caching, app size under 8 MB

Backend:
    Node.js + Express.js               - API gateway, authentication, routing
    Python + FastAPI                   - AI/ML inference endpoints
    Celery + Redis                     - Background jobs and payout queue management
    WebSockets                         - Real-time payout status updates

Database:
    PostgreSQL + PostGIS               - Financial records with ACID guarantees and geospatial queries
    Redis                              - Caching zone scores and job queues

External APIs (all free or low cost):
    Open-Meteo                         - Weather and precipitation, no key required
    OpenAQ                             - AQI data by city
    Google Maps Geocoding              - Address to coordinates (free tier)
    Razorpay (sandbox)                 - Simulated UPI payouts
    Twilio                             - WhatsApp and SMS in regional languages
    Firebase Cloud Messaging           - Push notifications
    NewsData.io                        - Strike and curfew monitoring from news

AI and ML:
    scikit-learn                       - Isolation Forest for fraud detection
    XGBoost                            - Premium risk scoring model
    SHAP                               - Explainability for fraud flags
    pandas, NumPy                      - Data processing and feature engineering
    Jupyter Notebooks                  - Model development and validation

Hosting:
    Render.com                         - Backend hosting (free tier)
    Supabase                           - Managed PostgreSQL with auth (free tier)
    Cloudflare Pages                   - Frontend PWA hosting (free)
    GitHub Actions                     - CI/CD on every push to main


SECTION 14A: FRONTEND STRUCTURE


Folder Structure:

    src/
        pages/
            Onboarding.jsx        - Language selection, OTP login, basic profile setup
            Dashboard.jsx         - Policy status, live disruption alerts, recent payouts
            PolicySelection.jsx   - Weekly tier picker with peer-choice indicator
            ClaimStatus.jsx       - Real-time view of active triggers and payout progress
            PayoutHistory.jsx     - Full payout record with event details
            DisputePortal.jsx     - Two-tap dispute flow with voice note and text input
            Profile.jsx           - Language, UPI account, and preference settings

        components/
            StatusCard.jsx        - Coverage status card with colour coding
            TierSelector.jsx      - Interactive tier selection with social proof
            AlertBanner.jsx       - Live disruption warning at top of screen
            PayoutBadge.jsx       - Shareable payout receipt component
            LanguagePicker.jsx    - Language selection used at onboarding and settings
            VoiceButton.jsx       - Microphone button for voice input

        hooks/
            useGeoLocation.js     - Location permission and coordinate lookup
            useTriggerFeed.js     - WebSocket hook for live disruption events
            usePremiumCalc.js     - Fetches personalised premium quote from pricing API

        locales/
            te.json, hi.json, ta.json, kn.json, ml.json, bn.json, mr.json, en.json

        App.jsx                   - Root component with React Router
        index.js                  - Entry point with PWA service worker registration

The app is mobile-first, tested on 6-inch screens. All interactive elements use minimum 48-pixel touch targets. The Dashboard, PolicySelection, and PayoutHistory screens are cached by the service worker for offline access.



SECTION 15: SYSTEM ARCHITECTURE


System Flow (End to End):

    Worker pays weekly premium via UPI
            |
    React PWA sends policy data to Express API Gateway
            |
    Policy stored in PostgreSQL. Worker's zone registered for monitoring.
            |
    Trigger Monitor Engine (Python + Celery) polls weather and pollution APIs every 15 minutes
            |
    Threshold breached and sustained. Disruption Event written to database and queued in Redis.
            |
    Fraud and Payout Engine picks up job. Runs location check, Isolation Forest model, duplicate check.
            |
    All checks pass. Razorpay UPI transfer initiated (under 5 seconds).
            |
    Twilio sends WhatsApp notification in worker's language.

This entire flow is automatic. The worker pays their weekly premium and the next time they interact with GigShield is when the money arrives.

Component Details:

    React PWA              : Loads core screens from cache when offline. Syncs on reconnect. Connects via HTTPS and WebSocket.

    API Gateway            : Express.js. Handles JWT auth, rate limiting, and routes to Worker Service, Policy Service, and Payout Service.

    PostgreSQL + PostGIS   : Stores all financial records. ACID-compliant — failed payout transactions auto-rollback.

    Trigger Monitor Engine : Python + Celery. Polls Open-Meteo, OpenAQ, and NewsData.io. Writes Disruption Events to database and Redis queue.

    Fraud and Payout Engine: FastAPI. Runs per-worker checks, ML inference, Razorpay API call, and Twilio notification.

    Redis Queue            : When 500 workers in the same zone trigger payouts simultaneously, Redis queues them for orderly processing instead of hitting the database all at once.

SECTION 16: FUTURE SCOPE


Phase 2 (Weeks 3 to 4): Automation and Protection

    Complete registration and policy management interface with language support
    Live dynamic premium calculation using real API data
    Three to five automated trigger integrations (Open-Meteo, OpenAQ, NewsData.io)
    Claims management screen and simulated payout flow via Razorpay sandbox
    Basic fraud detection with location validation and duplicate prevention active

Phase 3 (Weeks 5 to 6): Scale and Optimize

    Advanced fraud detection with GPS spoofing patterns, instant payout via Razorpay test mode, and intelligent dashboards for both workers (protected earnings, claim history) and insurers (loss ratios, zone risk heatmaps, weekly disruption forecasts). Full conflict resolution portal and voice notifications in Telugu and Hindi.



SECTION 17: WHY THIS WILL WIN


Impact

Over 12 million gig delivery workers in India have zero income protection. The monsoon season alone causes 3,000 to 8,000 rupees in lost income per worker per season. That is approximately 4,000 to 10,000 crore rupees in unprotected income loss annually — a real, documented, unsolved problem.

Scalability

    Zone-based model expands to any city with updated geographic data
    API-first design means one integration connects Swiggy or Zomato partner data
    ML models improve accuracy as more workers join and real data accumulates

Business Viability

    Revenue: Worker premiums (20 to 55 rupees per week), B2B white-label fees, aggregated risk data
    Break-even: 10,000 workers at 32 rupees average = 1.66 crore rupees per year gross premium
    At 65 percent loss ratio and 20 percent operating costs, net contribution is approximately 75 lakh rupees for a single city

Technical Differentiation

Most teams will build a policy form, a weather API call, and a claim button. GigShield builds a hyperlocal trigger monitoring engine, a zero-touch claim pipeline, an ML pricing model with SHAP explainability, a Trust Score and Conflict Resolution system, and a PWA that genuinely works on Ravi's phone in his language on his internet connection.

That is not a different feature set. That is a different level of thinking about who the user actually is.

SECTION 18: CONCLUSION


We started this project thinking about one number. Two hundred and eighty rupees. That is what a Zomato rider loses on a bad monsoon afternoon in Hyderabad.

For Ravi, it is dinner for his family. A day's bike EMI. Nearly half of what he sends home to his parents this week.

For years we built great technology for the people who order the food. But the people who deliver it? We gave them nothing when the weather turned against them.

GigShield is our answer. We are still in Phase 1 and there is a lot left to build. But what we have put down here is honest, technically grounded, and built around a genuine understanding of who Ravi is.

We are not building this to impress judges. We are building it because the problem is real, the technology is ready, and someone should have done this five years ago.

We are doing it now.


SECTION 18A: REPOSITORY STRUCTURE


    gigshield-devtrails-2026/
        |
        frontend/
        |   React PWA codebase (pages, components, hooks, locales)
        |
        backend/
        |   api-gateway/       - Express.js gateway, auth, routing
        |   worker-service/    - Worker profiles, onboarding, trust scores
        |   policy-service/    - Weekly enrollment and premium payments
        |   payout-service/    - Payout records and transaction history
        |   trigger-engine/    - Python + Celery scheduler, polls external APIs
        |   fraud-engine/      - FastAPI ML inference and payout initiation
        |
        ml-model/
        |   fraud_model.ipynb       - Isolation Forest training notebook
        |   pricing_model.ipynb     - XGBoost premium scoring notebook
        |   feature_engineering.py  - Shared data preparation utilities
        |   models/                 - Saved model files (.pkl)
        |
        docs/
            architecture-diagram.png   - System architecture diagram
            api-reference.md           - All API endpoints with request and response formats
            db-schema.sql              - Full PostgreSQL schema
            phase1-submission.md       - Phase 1 deliverable checklist

Each folder contains its own README with component-specific notes.

SECTION 19: GITHUB REPOSITORY


This repository contains our complete Phase 1 submission including this README, all planned source code, ML model notebooks, database schema, and documentation.

Note: This is a Phase 1 ideation submission. Code development begins in Phase 2. The repository structure and notebooks above represent our planned architecture and are being populated progressively across phases.

Team Contact:

    Team Name   :  CodeSmart
    Team Lead   :  Kusmitha Salveru
    Team Email  :  2300032520cseh1@gmail.com
    Repository  :  https://github.com/kusmithasalveru/gigshield-devtrails-2026

End of Document
GigShield Phase 1 Submission
Team CodeSmart | Guidewire DEVTrails 2026

