Here is the complete user flow in one diagram. From the landing page to the review step, and includes settings, the safety checklist, resources and reporting.

<img width="1366" height="1893" alt="image" src="https://github.com/user-attachments/assets/0ea5d1f5-6b5f-4bf7-899b-0f9691ee8654" />

Here's how to read it:

- **Dashed arrows:** these are optional paths. Settings is reachable from the dashboard, resources can be opened during a session, a problem can be reported when a session ends, and ratings feed into future pairing.
- **Resources library:** the sidebar also links to it from anywhere in the app, not only during a session.
- **Pairing and reviews:** these steps are shown as designed. I couldn't see them in your screenshots, so confirm with your teammates that they're built.

- # 📋User Flow Specification

This document outlines the step-by-step onboarding screen flow required for the frontend implementation.

## 📌 Architectural Flow Overview

```text
[Visitor Landing] 
       │
       ▼
[Screen 1: Institutional Verification] ──► (Generates OTP to .edu.ng Email)
       │
       ▼
[Screen 2: Academic Identity Selection] ──► (Matric or Registration number, Department, Level Entry)
       │
       ▼
[Screen 3: Intent & Goals Toggles] ──► (Match Search vs. Peer-Tutor Switch)
       │
       ▼
[Screen 4: Availability & Match Matrix] ──► (Saves Free Slots & Prefs to Database)
       │
       ▼
[Main Dashboard / Match Feed]
```

---

## 🖥️ Screen-by-Screen Viewport Breakdown

### Screen 1: Academic Authentication
* **Objective:** Establish instant platform trust and filter out non-student profiles.
* **UI Components:**
  * Single input field optimized for custom text.
  * Secure Submit button.
* **Input Field:** `Institutional Email Address` 
  * *Validation Rule:* Must terminate strictly with a verified domain (e.g., `*@oauife.edu.ng`, `*@unilag.gmail.com`).
* **Trigger Event:** Automated issuance of a 6-digit confirmation one-time password (OTP) sent to the student's email inbox.

### Screen 2: Academic Profile Setup
* **Objective:** Establish the user's explicit academic context.
* **UI Components:**
  * String text input box for name.
  * Native search-and-select dropdown elements.
* **Input Fields:**
  * `Full Name` (Text input)
  * `Department` (Dropdown menu)
  * `Current Level of Study` (Select field: `100 Level`, `200 Level`, `300 Level`, `400 Level`, `500 Level`, `Graduate`)

### Screen 3: Strategic Match Persona Selection
* **Objective:** Capture the user's intent to route them effectively through the match engine.
* **Question Prompt:** *"What are your primary goals for using PeerLink this semester? (Select all that apply)"*
  * [ ] Find a long-term, reliable study partner to stay disciplined.
  * [ ] Learn difficult topics from a peer tutor.
* **Functional Toggle:** *"Would you like to register yourself as an available peer tutor for courses you excel in?"* 
  * `[ Yes / No ]` *(Toggling Yes triggers an input box for listing preferred courses)*

### Screen 4: Compatibility Filters (The Matching Matrix)
* **Objective:** Solve coordination and timing failures before generating matches.
* **UI Components:**
  * 7x3 grid multi-select matrix.
  * Explicit radio choice selectors.
* **Interactive Grid:** *"When are you typically free for structured study sessions?"*
  * Rows: `Monday` through `Sunday`
  * Columns: `Morning`, `Afternoon`, `Evening`
* **Radio Options:** *"What is your preferred interaction method?"*
  * ( ) Completely In-Person (On-campus libraries/classrooms)
  * ( ) Completely Online (In-app audio-video channels)
  * ( ) A combination of both modes

---

## 🖥️ Screen-by-Screen Viewport Breakdown (Core Application Layout)

### Screen 5: The Match Feed Dashboard (Main Landing View)
* **Objective:** Present optimized peer and tutor recommendations immediately upon app launch.
* **UI Components:**
  * **Global Intent Selector:** High-level tab controls toggling between `[ Find a Study Partner ]` and `[ Find a Student Tutor ]`.
  * **Match Discovery Feed:** A vertically scrolling list of responsive summary cards.
  * **Card Attributes:** Displays individual Candidate Name, Department/Level, Shared Course Badges (e.g., `CSC 301`), and a compatibility indicator (e.g., `85% Schedule Overlap`).
  * **Core Interactions:** Dedicated action triggers for `[ Connect / Message ]` and `[ Pass / Hide ]`.

### Screen 6: Connection Requests Manager
* **Objective:** Manage inbound match invitations securely before provisioning chat access.
* **UI Components:**
  * **Segmented Lists:** Two clear, separate directory streams tracking `Inbound Requests` and `Outbound Pending Approvals`.
  * **Dynamic Context String:** Explanatory subheading text clearly outlining matching intent (e.g., *"Sarah requested you as a Peer Tutor for CSC 305"*).
  * **Confirmation Controls:** Prominent, high-contrast action elements for `[ Accept Connection ]` and `[ Decline Request ]`.

### Screen 7: Active Chat Workspace
* **Objective:** Provide a sandboxed, low-bandwidth communication space without requiring external platform handles.
* **UI Components:**
  * **Fixed Context Header:** Persistent top navigation banner locking down the specific shared academic focus (e.g., *"Collaboration Chat: EEE 202"*).
  * **Inline Scheduling Trigger:** Floating shortcut button targeting an interaction sub-modal to confirm physical/online meetups.
  * **Safety Moderation Anchor:** Quick-access ellipsis menu containing a `[ Report Profile / Block Account ]` option to mitigate behavioral anomalies or inappropriate interactions.

### Screen 8: Post-Session Verification Prompt (Accountability Modal)
* **Objective:** Capture structural behavior logs to filter out unreliable or uncommitted study matches.
* **UI Components:**
  * **Automated Overlay Framework:** Restrictive modal view triggered programmatically 30 minutes following a scheduled meeting time.
  * **Binary Verification Checklist:** Simple radio check prompt: *"Did your matched partner attend the scheduled session today?"* `[ Yes / No ]`.
  * **Tutor Score Interface (Conditional):** Displays a 5-star metric scale evaluating content delivery, visible only if the counter-party was acting as an active Peer Tutor.
  * **Submit Control:** `[ Confirm Feedback ]` button that records data points to update backend pairing weight algorithms.

---

## 🛠️ Error Handling & Guardrails
1. **Invalid Domain Error:** Display message *"Registration is strictly limited to verified institutional student accounts. Please check your domain."*
2. **Missing Matrix Selections:** Prevent submission on Screen 4 if a user fails to select at least 1 time slot block or interaction preference.


