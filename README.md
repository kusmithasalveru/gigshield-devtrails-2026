# GigShield – AI-Powered Parametric Income Insurance for Gig Workers

### Guidewire DEVTrails 2026 | Final Submission

---

## 👋 Greetings

Greetings to the Judges and the Guidewire DEVTrails 2026 Team,

We are **Team CodeSmart**, a group of engineering students who believe technology should serve the people who need it most.

This is our solution to one of the most ignored problems in India's gig economy — the complete lack of income protection for delivery workers.

We are proud to introduce **GigShield**.

---

## 👥 Team Details

**Team Name:** CodeSmart

**Team Members:**

* **Team Lead:** Kusmitha Salveru
* **Member 2:** Sravanthi Pindiganti
* **Member 3:** Ruthvika Sri Gayathri Vollu
* **Member 4:** Mohan Degala

**University:** KL University

---

# 📌 SECTION 1: PROBLEM STATEMENT

Imagine you wake up at 6 in the morning. You have deliveries lined up. You start your day… and suddenly heavy rain hits.

You wait. Orders stop. Roads become unsafe.

You go home with **zero income**.

This is not a one-time issue. This is the daily reality of millions of gig workers across India.

* No fixed salary
* No paid leave
* No income protection

During monsoon alone, workers lose thousands of rupees due to factors completely out of their control.

Nobody is solving this properly.

---

# 💡 SECTION 2: OUR INITIAL SOLUTION & ASSUMPTION

We started with a simple thought:

> **If disruption is measurable, income loss can be automated.**

### Initial Idea:

* Weekly low-cost insurance
* Trigger-based payouts (no manual claims)
* Simple mobile-first interface
* Basic fraud validation

### Assumptions:

* Workers prefer simple weekly payments
* Automation reduces cost
* Real-time APIs can detect disruptions
* Fraud can be handled with layered checks

This became the foundation of GigShield.

---

# 📅 SECTION 3: 45-DAY EXECUTION PLAN

We divided our work into 3 phases:

### 🔹 Phase 1 – Ideation & Foundation

Understanding the problem and designing the system

### 🔹 Phase 2 – Automation & Protection

Building backend + integrating APIs

### 🔹 Phase 3 – Scale & Optimization

Improving performance, fraud detection, and deployment

---

# ⚙️ SECTION 4: PHASE-WISE EXECUTION

## 🔹 Phase 1 – Ideation

**What we did:**

* Defined user persona (Ravi – delivery worker)
* Designed full system workflow
* Built pricing model
* Designed trigger-based system
* Planned fraud detection

**Outcome:**
Strong system design and documentation

---

## 🔹 Phase 2 – Automation

**What we improved:**

* Converted idea into a working system
* Built frontend (React PWA)
* Built backend APIs (Node + Express)

**Integrated APIs:**

* Weather
* Pollution

**Implemented:**

* Policy system
* Trigger detection
* Automated payout simulation

👉 **From concept → working product**

---

## 🔹 Phase 3 – Scaling & Optimization

**What we improved:**

* ML-based fraud detection (Isolation Forest)
* Dynamic pricing (XGBoost)
* Trust Score system
* Conflict resolution module
* Backend optimization using Redis

**Deployment:**

* Frontend (Live)
* Backend (Live APIs)

👉 **From working system → scalable system**

---

# 📊 SECTION 5: FINAL OUTCOME VS INITIAL EXPECTATION

| Aspect          | Initial     | Final                 |
| --------------- | ----------- | --------------------- |
| System          | Idea        | Working + Deployed    |
| Pricing         | Static      | AI-based dynamic      |
| Fraud Detection | Basic       | ML-based              |
| Claims          | Manual idea | Fully automated       |
| Scale           | Not defined | Scalable architecture |

---

# 🔄 SECTION 6: HOW THE APPLICATION WORKS

1. Worker registers
2. Selects weekly plan
3. Pays premium
4. System monitors disruptions every 15 minutes
5. Event detected
6. Fraud checks run
7. Payout automatically processed

**No forms. No waiting.**

---

# 💰 SECTION 7: WHY OUR PRICING MODEL IS COST-EFFECTIVE

* Weekly premium: ₹20 – ₹55
* Based on:

  * Location risk
  * Season
  * Worker behavior

### Why it is cheaper:

* No manual claim processing
* Fully automated system
* AI reduces fraud losses

👉 Affordable for workers + sustainable system

---

# 🧠 SECTION 8: FRAUD DETECTION (HOW IT WORKS)

We built a multi-layer system:

* Location validation
* Activity verification
* ML anomaly detection
* Duplicate prevention
* Network-level checks

### Why it works:

* Detects abnormal behavior early
* Prevents fake claims
* Maintains trust

---

# 🚀 SECTION 9: WHY GIGSHIELD IS DIFFERENT

**Most solutions:**

* Require manual claims
* Are slow
* Not designed for gig workers

**GigShield:**

* Fully automated payouts
* Real-time processing
* Built for low-end devices
* Supports regional languages
* AI-powered pricing & fraud detection

---
# 🛠 SECTION 10: TECH STACK & WHY WE CHOSE IT

## Frontend

* **React.js (PWA)**
  We chose React to build a fast and responsive interface that works across devices.
  Using a Progressive Web App allows gig workers to access the platform without installing heavy apps.

* **Tailwind CSS**
  Used for quick UI development and mobile-first design, ensuring clean and responsive layouts.

* **i18next (Multi-language Support)**
  Helps us provide the platform in multiple regional languages, making it accessible for all users.

👉 Why this matters:
Gig workers often use low-end devices and slow internet. Our frontend is optimized for **speed, simplicity, and accessibility**.

---

## Backend

* **Node.js + Express.js**
  Used for building fast APIs and handling multiple user requests efficiently.

* **Python (FastAPI)**
  Used for ML models like fraud detection and risk scoring due to strong ecosystem support.

* **Redis + Celery**
  Handles background tasks like trigger detection and payout processing without slowing the system.

👉 Why this matters:
Separating backend services ensures **scalability and real-time processing capability**.

---

## Database

* **PostgreSQL (with PostGIS)**
  Used for storing transactions and handling location-based queries.

* **Redis**
  Used for caching and queue management to improve performance.

---

## External APIs

* Weather API (Open-Meteo)
* Pollution API (OpenAQ)
* Payment Gateway (Razorpay - sandbox)
* Notification Services (Twilio, Firebase)

👉 These APIs help us **detect real-world disruptions in real-time**.

---

# ⚙️ SECTION 11: FRAUD ENGINE & PRICING MODEL (BRIEF WORKING)

## 🔍 Fraud Engine (How it Works)

Our fraud detection system works in multiple layers:

1. **Location Check**
   Ensures the worker is present in the affected zone.

2. **Activity Validation**
   Confirms recent app usage during the disruption window.

3. **ML-Based Detection**
   We use an Isolation Forest model to detect unusual claim patterns.

4. **Duplicate Prevention**
   Each event has a unique ID to prevent multiple claims.

👉 Simple idea:
If behavior deviates from normal patterns → flagged for review.

---

## 💰 Pricing Model (How it Works)

We calculate premium using a dynamic formula:

Weekly Premium = Base × Risk Score × Season Factor × Tier Multiplier

Where:

* **Base Price** = Fixed starting value
* **Risk Score** = Based on location and historical disruptions
* **Season Factor** = Higher during monsoon
* **Tier Multiplier** = Based on coverage plan

👉 Example:

Premium ≈ 25 × 0.7 × 1.3 × 1.4 ≈ ₹30/week

---

## 🔁 Payout Logic (Simplified)

Payout = (Daily Income / Working Hours) × Disruption Hours × Severity Factor

👉 This ensures fair compensation based on actual income loss.

---

## ⚡ Why This System Works

* Fully automated
* Real-time trigger-based
* Scales easily
* Reduces fraud losses

👉 Result: **Fast, fair, and reliable payouts**

# 🌐 SECTION 12: LIVE DEMO

🔗 **Frontend:** https://gigshield-devtrails-2026-zxqw-ten.vercel.app/
🔗 **Backend:** https://gigshield-rl7l.onrender.com/
🎥 **Demo Video:** https://youtu.be/j0onTK6OIG4?si=xjlLoHBsy9cbYADk

---

# 🏁 SECTION 13: FINAL THOUGHTS

We started this project thinking about one thing:

How much does a worker lose in one bad day?

For many, it is not just money. It is food, rent, and survival.

GigShield is our attempt to solve that.

We moved from:
👉 Idea → System → Scalable product

And this is just the beginning.

---

## 🙏 Thank You

Thank you to Guidewire DEVTrails 2026 for giving us the opportunity to build and learn.

---

**Team CodeSmart 🚀**
