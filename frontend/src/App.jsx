import { useState } from "react";
import SafetyGuidance from "./SafetyGuidance.jsx";
const navItems = [
  ["Home", "⌂"],
  ["Find Tutors", "⌕"],
  ["Find Learners", "♧"],
  ["My Sessions", "▣"],
  ["Resources", "▤"],
  ["Messages", "✉"],
  ["Notifications", "♢"],
  ["Profile", "♙"],
];

const tutors = [
  { name: "Blessing Okafor", subject: "Mathematics", courses: "MTH101, MTH201, MTH401", rating: "4.8", reviews: 12, initials: "BO", color: "brown" },
  { name: "Tunde Adebayo", subject: "Computer Science", courses: "CSC201, CSC301, CSC401", rating: "4.5", reviews: 9, initials: "TA", color: "blue" },
  { name: "Chinedu Okafor", subject: "Computer Science", courses: "CSC201, CSC301, CSC401", rating: "4.8", reviews: 15, initials: "CO", color: "gold" },
];

const sessions = [
  { course: "MTH201 - Calculus II", type: "One-to-One Session", time: "Today, 2:00 PM - 4:00 PM", place: "Library", initials: "BO" },
  { course: "CSC301 - Data Structures", type: "One-to-One Session", time: "Thu, 10:00 AM - 12:00 PM", place: "Engineering Block", initials: "TA" },
];

function App() {
  const [activeView, setActiveView] = useState("Home");
  const [showRequest, setShowRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(tutors[0]);
  const [selectedSession, setSelectedSession] = useState(sessions[0]);

  const openRequest = () => {
    setRequestSent(false);
    setShowRequest(true);
  };

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} onNavigate={setActiveView} onLogout={() => setActiveView("Auth")} />
      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">◆</span> StudyConnect</div>
          <div className="top-search"><span>⌕</span><input placeholder="Search courses, tutors, or resources..." aria-label="Search" /></div>
          <button className="top-icon" aria-label="Search">⌕</button>
          <div className="user-chip"><div className="photo-avatar photo-chinedu">CO</div><span><strong>Chinedu Okafor</strong><small>Learner</small></span><b>⌄</b></div>
        </header>
        <div className="page">
          {activeView === "Home" && <Dashboard onRequest={openRequest} onNavigate={setActiveView} />}
          {activeView === "Find Tutors" && <TutorDirectory onRequest={openRequest} onTutor={(tutor) => { setSelectedTutor(tutor); setActiveView("Tutor Profile"); }} />}
          {activeView === "My Sessions" && <SessionsView onRequest={openRequest} onSession={(session) => { setSelectedSession(session); setActiveView("Session Details"); }} />}
          {activeView === "Session Details" && <SessionDetails session={selectedSession} onBack={() => setActiveView("My Sessions")} onChat={() => setActiveView("Chat Session")} />}
          {activeView === "Chat Session" && <ChatSession session={selectedSession} onBack={() => setActiveView("Session Details")} />}
          {activeView === "Tutor Profile" && <TutorProfile tutor={selectedTutor} onBack={() => setActiveView("Find Tutors")} onRequest={openRequest} />}
          {activeView === "Resources" && <ResourcesView />}
          {activeView === "Profile" && <ProfileView />}
          {activeView === "Auth" && <AuthView onLogin={() => setActiveView("Home")} />}
          {["Find Learners", "Messages", "Notifications"].includes(activeView) && <EmptyView title={activeView} />}
        </div>
    <footer className="app-footer">
      <p>© 2026 StudyConnect - Peer Tutoring Platform</p>
      <small>Built by cyberactivelabz Team | QA: Hammed Abdulhamid</small>
    </footer>
    </main>
    {showRequest && <RequestModal sent={requestSent}
    onClose={() => setShowRequest(false)} onSubmit={(event) =>
    { event.preventDefault(); setRequestSent(true); }} />}
    </div>
  );
}
      </main>
function Sidebar({ activeView, onNavigate, onLogout }) {
  return (
    <aside className="sidebar">
      <a className="brand" href="/" onClick={(event) => { event.preventDefault(); onNavigate("Home"); }}><span className="brand-mark">◆</span><span>StudyConnect</span></a>
      <nav aria-label="Main navigation">
        {navItems.map(([name, icon]) => <button key={name} className={`nav-item ${activeView === name ? "active" : ""}`} onClick={() => onNavigate(name)}><span className="nav-icon">{icon}</span>{name}{["Messages", "Notifications"].includes(name) && <span className="nav-badge">1</span>}</button>)}
      </nav>
      <button className="nav-item logout" onClick={onLogout}><span className="nav-icon">↪</span>Logout</button>
    </aside>
  );
}

function Dashboard({ onRequest, onNavigate }) {
  return (
    <>
      <section className="dashboard-heading"><div><h1>Good morning, Chinedu!</h1><p>Find a tutor, join a session, or access study resources.</p></div><button className="primary-button" onClick={onRequest}>+ Request a session</button></section>
      <SafetyGuidance />
      <section className="quick-grid">
        <QuickCard icon="♙" title="Find Tutors" text="Get matched with verified peer tutors" onClick={() => onNavigate("Find Tutors")} />
        <QuickCard icon="♧" title="Find Learners" text="Join or create a study group" onClick={() => onNavigate("Find Learners")} />
        <QuickCard icon="▣" title="My Sessions" text="View upcoming and past sessions" onClick={() => onNavigate("My Sessions")} />
        <QuickCard icon="▤" title="Resources" text="Access shared academic materials" onClick={() => onNavigate("Resources")} />
      </section>
      <div className="content-columns">
        <section className="panel upcoming-panel"><PanelHeading title="Upcoming Sessions" action="View all" onClick={() => onNavigate("My Sessions")} />{sessions.map((session) => <SessionCard key={session.course} session={session} onOpen={() => onNavigate("Session Details")} />)}</section>
        <section className="panel activity-panel"><PanelHeading title="Recent Activity" action="View all" /><Activity icon="♙" text="You completed a session with Blessing Okafor" time="2 hours ago" /><Activity icon="✦" text="New message from Tunde Adebayo" time="3 hours ago" /><Activity icon="✓" text="You received a 5-star rating" time="Yesterday" /></section>
      </div>
    </>
  );
}

function QuickCard({ icon, title, text, onClick }) {
  return <button className="quick-card" onClick={onClick}><span className="quick-icon">{icon}</span><strong>{title}</strong><small>{text}</small></button>;
}

function PanelHeading({ title, action, onClick }) {
  return <div className="panel-heading"><h2>{title}</h2><button className="link-button" onClick={onClick}>{action} →</button></div>;
}

function SessionCard({ session, onOpen }) {
  return <article className="session-card"><div className="session-course"><div className="mini-avatar avatar-blue">{session.initials}</div><div><strong>{session.course}</strong><small>{session.type}</small></div></div><div className="session-detail"><span>◷ {session.time}</span><span>⌖ {session.place}</span></div><button className="small-button" onClick={onOpen}>View Details</button></article>;
}

function Activity({ icon, text, time }) {
  return <div className="activity"><span className="activity-icon">{icon}</span><div><p>{text}</p><small>{time}</small></div></div>;
}

function TutorDirectory({ onRequest, onTutor }) {
  return <><section className="view-heading"><div><h1>Find a Tutor</h1><p>Search and connect with the right tutor for your course.</p></div></section><section className="filter-panel"><div className="directory-search">⌕<input placeholder="Search by course code or topic..." /></div><div className="filter-row"><select aria-label="Department"><option>All Departments</option></select><select aria-label="Level"><option>All Levels</option></select><select aria-label="Availability"><option>Any Time</option></select><button className="primary-button">Search</button></div></section><div className="directory-title"><h2>Recommended Tutors</h2><span>Sort by: <b>Rating⌄</b></span></div><section className="tutor-list">{tutors.map((tutor) => <TutorRow key={tutor.name} tutor={tutor} onRequest={onRequest} onTutor={() => onTutor(tutor)} />)}</section></>;
}

function TutorRow({ tutor, onRequest, onTutor }) {
  return <article className="tutor-row"><div className={`photo-avatar photo-${tutor.color}`}>{tutor.initials}</div><div className="tutor-main"><h3>{tutor.name} <em>Verified Tutor</em></h3><p>{tutor.subject} · {tutor.courses}</p><small>⌖ Available Today · ◷ Flexible</small></div><div className="rating"><strong>★ {tutor.rating}</strong><small>({tutor.reviews} reviews)</small></div><button className="small-button" onClick={onTutor}>View Profile</button></article>;
}

function SessionsView({ onRequest, onSession }) {
  return <><section className="view-heading"><div><h1>My Sessions</h1><p>Manage your one-to-one and group study sessions.</p></div><button className="primary-button" onClick={onRequest}>+ Create a session</button></section><section className="panel sessions-full">{sessions.map((session) => <SessionCard key={session.course} session={session} onOpen={() => onSession(session)} />)}</section></>;
}

function SessionDetails({ session, onBack, onChat }) {
  return <><div className="back-link" onClick={onBack}>← Back to My Sessions</div><section className="details-header panel"><div><p className="eyebrow">SESSION DETAILS</p><h1>{session.course}</h1><p>{session.type} · 1 tutor + up to 6 learners</p><div className="session-detail"><span>◷ {session.time}</span><span>⌖ {session.place}</span></div></div><span className="status-pill">● Upcoming</span></section><section className="panel participants-panel"><div className="panel-heading"><h2>Participants (5/6)</h2><button className="invite-button">＋ Invite More</button></div><div className="participants">{["You", "T1", "T2", "T3", "T4"].map((person, index) => <div className="participant" key={person}><div className={`photo-avatar participant-avatar photo-${index % 2 ? "blue" : "brown"}`}>{index ? person : "CO"}</div><small>{person}</small><span>{index === 0 ? "Learner" : index === 1 ? "Tutor" : "Learner"}</span></div>)}</div></section><section className="panel session-status"><div><h2>Session Status <span className="status-pill">● Confirmed</span></h2><p>Everything is ready for your study session.</p></div><div className="detail-actions"><button className="outline-button" onClick={onChat}>◉ View Chat</button><button className="outline-button">▤ View Materials</button><button className="cancel-button">Cancel Session</button></div></section></>;
}

function ChatSession({ session, onBack }) {
  return <><div className="back-link" onClick={onBack}>← Back to Session Details</div><div className="chat-layout"><section className="panel chat-panel"><div className="chat-header"><div><h1>Session Chat</h1><p>{session.course}</p></div><span>ⓘ</span></div><div className="chat-messages"><div className="chat-message received"><b>Blessing Okafor</b><p>Hi everyone! I&apos;ve uploaded some past questions for today&apos;s session. Please take a look.</p><small>1:35 PM</small></div><div className="chat-message sent"><p>Great, thank you! I&apos;ll review them before we begin.</p><small>1:38 PM</small></div><div className="chat-file"><span className="file-icon">PDF</span><div><b>Past Questions - MTH201.pdf</b><small>2.4 MB</small></div><span>↓</span></div></div><div className="chat-input"><input placeholder="Type a message..." /><button>➤</button></div></section><aside className="panel files-panel"><h2>Session Files</h2>{["Past Questions - MTH201.pdf", "Lecture Notes - Calculus.pdf", "Study Guide.pdf"].map((file) => <div className="file-row" key={file}><span className="file-icon">PDF</span><div><b>{file}</b><small>Shared file</small></div></div>)}</aside></div></>;
}

function TutorProfile({ tutor, onBack, onRequest }) {
  return <><div className="back-link" onClick={onBack}>← Back to Find Tutors</div><section className="panel tutor-profile-header"><div className={`photo-avatar profile-photo photo-${tutor.color}`}>{tutor.initials}</div><div className="tutor-profile-name"><h1>{tutor.name} <em>Verified Tutor</em></h1><p>{tutor.subject} · {tutor.courses}</p><button className="primary-button" onClick={onRequest}>Request Session</button></div><div className="profile-rating"><strong>{tutor.rating}</strong><span>★★★★★</span><small>{tutor.reviews} reviews</small></div></section><div className="profile-detail-grid"><section className="panel"><PanelHeading title="Course Ratings" action="" />{["MTH201 - Calculus II", "MTH101 - Algebra", "MTH301 - Linear Algebra"].map((course, index) => <div className="course-rating" key={course}><span>{course}</span><b>★★★★★ <small>{(4.8 - index / 10).toFixed(1)}</small></b><i style={{ width: `${82 - index * 10}%` }} /></div>)}</section><section className="panel feedback-panel"><h2>Rate Your Session</h2><p>How would you rate your experience?</p><div className="rating-criteria">{["Teaching", "Punctuality", "Friendliness", "Helpful"].map((label) => <label key={label}>{label}<span>★★★★★</span></label>)}</div><textarea placeholder="Write a review (optional)" /><button className="primary-button">Submit Review</button></section></div></>;
}

function ResourcesView() {
  return <><section className="view-heading"><div><h1>Resource Library</h1><p>Find and share academic materials with your campus community.</p></div><button className="primary-button">↑ Upload Resource</button></section><section className="filter-panel"><div className="directory-search">⌕<input placeholder="Search resources..." /></div><div className="filter-row"><select><option>All Departments</option></select><select><option>All Courses</option></select><select><option>All Types</option></select></div></section><section className="resource-grid">{["MTH201 Past Questions.pdf", "CSC301 Lecture Notes.pdf", "ENG101 Study Guide.pdf", "PHY101 Formula Sheet.pdf"].map((name) => <article className="resource-card" key={name}><div className="file-icon">PDF</div><strong>{name}</strong><small>Shared by a peer tutor · 2 days ago</small><button className="small-button">Download</button></article>)}</section></>;
}

function ProfileView() {
  return <><section className="profile-banner"><div className="photo-avatar photo-chinedu large-avatar">CO</div><div><h1>Chinedu Okafor</h1><p>300 Level · Computer Science</p><span className="verified-pill">✓ Verified Student</span></div><button className="outline-button">Edit Profile</button></section><div className="profile-grid"><section className="panel"><PanelHeading title="Overview" action="" /><div className="overview-stats"><b>18<small>Sessions</small></b><b>4.9<small>Rating</small></b><b>12<small>Resources</small></b></div></section><section className="panel"><PanelHeading title="Recent Activity" action="View all" /><Activity icon="✓" text="You joined a study session" time="Yesterday" /><Activity icon="★" text="You received a 5-star rating" time="3 days ago" /></section></div></>;
}

function AuthView({ onLogin }) {
  const [mode, setMode] = useState("login");
  return <div className="auth-screen"><div className="auth-hero"><span className="auth-logo">◆</span><h1>StudyConnect</h1><p>Learn · Support · Grow</p><small>A peer-to-peer platform for physical and departmental resource sharing.</small><footer>Our Campus &nbsp;|&nbsp; Built by Students, For Students</footer></div><div className="auth-card"><div className="auth-tabs"><button className={mode === "login" ? "selected" : ""} onClick={() => setMode("login")}>Log In</button><button className={mode === "signup" ? "selected" : ""} onClick={() => setMode("signup")}>Sign Up</button></div><h2>{mode === "login" ? "Welcome Back" : "Create Your Account"}</h2>{mode === "signup" && <div className="role-toggle"><label><input type="radio" defaultChecked name="role" /> Learner</label><label><input type="radio" name="role" /> Tutor</label></div>}<label>Username<input placeholder="Enter your username" /></label>{mode === "signup" && <><label>Student ID<input placeholder="Enter your student ID" /></label><label>Department<select><option>Select your department</option><option>Computer Science</option><option>Mathematics</option></select></label><label>Level<select><option>Select your level</option><option>100 Level</option><option>300 Level</option></select></label></>}<label>Password<input type="password" placeholder="Enter your password" /></label><button className="primary-button auth-submit" onClick={onLogin}>{mode === "login" ? "Log In" : "Sign Up"}</button><p className="auth-switch">{mode === "login" ? "Don’t have an account? " : "Already have an account? "}<button onClick={() => setMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "Sign Up" : "Log In"}</button></p></div></div>;
}

function EmptyView({ title }) {
  return <div className="empty-view"><span>♧</span><h1>{title}</h1><p>This area is ready for your campus activity.</p></div>;
}

function RequestModal({ sent, onClose, onSubmit }) {
  return <div className="modal-backdrop"><div className="modal" role="dialog" aria-modal="true"><button className="modal-close" onClick={onClose} aria-label="Close">×</button>{sent ? <div className="success-message"><div className="success-icon">✓</div><h2>Request sent!</h2><p>We&apos;ll notify you when a verified tutor responds.</p><button className="primary-button" onClick={onClose}>Done</button></div> : <><p className="eyebrow">STUDYCONNECT</p><h2>Request a study session</h2><p className="modal-subtitle">Tell us what you need help with.</p><form onSubmit={onSubmit}><label>Course or subject<input required placeholder="e.g. MTH201 - Calculus II" /></label><label>Describe your goal<textarea required rows="3" placeholder="What would you like to learn?" /></label><div className="form-row"><label>Date<input required type="date" /></label><label>Time<input required type="time" /></label></div><button className="primary-button full-width" type="submit">Send Request</button></form></>}</div></div>;
}

export default App;
