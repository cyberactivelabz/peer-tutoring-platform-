import { useEffect, useRef, useState } from "react";
import {
  BookOpen01Icon,
  Calendar03Icon,
  GraduationCapIcon,
  Home01Icon,
  Logout01Icon,
  Menu01Icon,
  Mail01Icon,
  Notification01Icon,
  Search01Icon,
  Settings01Icon,
  UserCircleIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { api } from "./api.js";
import { clearToken, displayName, getToken, roleLabel } from "./Auth.js";
import AuthView from "./components/AuthView.jsx";
import Brand from "./components/Brand.jsx";
import Dashboard from "./components/Dashboard.jsx";
import { Directory, TutorProfile } from "./components/Discover.jsx";
import { Booking, Sessions, SessionDetail } from "./components/Learning.jsx";
import { Partners, Notifications, Messages } from "./components/Community.jsx";
import Materials from "./components/Materials.jsx";
import { Profile, Settings } from "./components/Account.jsx";
import {
  Avatar,
  Dialog,
  Empty,
  Icon,
  Notice,
  useResource,
} from "./components/ui.jsx";

const groups = [
  ["Overview", [["Home", "Dashboard", Home01Icon]]],
  [
    "Discover",
    [
      ["Find Tutor", "Peer tutors", Search01Icon],
      ["Find Learner", "Learners", UserCircleIcon],
      ["Find Study Partner", "Study partners", UserGroupIcon],
    ],
  ],
  [
    "Learning",
    [
      ["My Sessions", "My sessions", Calendar03Icon],
      ["Course Materials", "Resource library", BookOpen01Icon],
    ],
  ],
  [
    "Communication",
    [
      ["Messages", "Messages", Mail01Icon],
      ["Notifications", "Notifications", Notification01Icon],
    ],
  ],
  [
    "Account",
    [
      ["Profile", "My profile", UserCircleIcon],
      ["Settings", "Settings", Settings01Icon],
    ],
  ],
];
const aliases = {
  "Find Tutors": "Find Tutor",
  "Find Learners": "Find Learner",
  "Upcoming Sessions": "My Sessions",
  Resources: "Course Materials",
  "Study Partner": "Find Study Partner",
  Learner: "Home",
  Tutor: "Profile",
  Auth: "Home",
};
const valid = new Set([
  ...groups.flatMap(([, items]) => items.map(([key]) => key)),
  "Tutor Profile",
  "Session Details",
  "Chat Session",
]);
function currentRoute() {
  try {
    const [raw = "Home", id] = decodeURIComponent(
      window.location.hash.slice(1),
    ).split("/");
    const view = aliases[raw] || raw;
    return { view: valid.has(view) ? view : "Home", id };
  } catch {
    return { view: "Home" };
  }
}
function Navigation({ view, navigate, count, onLogout }) {
  return (
    <>
      <a
        className="brand-link"
        href="#Home"
        onClick={(e) => {
          e.preventDefault();
          navigate("Home");
        }}
        aria-label="StudyConnect dashboard"
      >
        <Brand />
      </a>
      <nav aria-label="Main navigation">
        {groups.map(([label, items]) => (
          <div className="nav-group" key={label}>
            <p>{label}</p>
            {items.map(([key, name, icon]) => (
              <a
                key={key}
                href={`#${encodeURIComponent(key)}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(key);
                }}
                className={`nav-item ${view === key || (key === "Find Tutor" && view === "Tutor Profile") || (key === "My Sessions" && ["Session Details", "Chat Session"].includes(view)) ? "active" : ""}`}
                aria-current={view === key ? "page" : undefined}
              >
                <Icon icon={icon} />
                <span>{name}</span>
                {key === "Notifications" && count > 0 && (
                  <span className="nav-badge" aria-label={`${count} unread`}>
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </a>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-note">
          <Icon icon={GraduationCapIcon} />
          <strong>A little help goes a long way.</strong>
          <p>Your campus. Your community.</p>
        </div>
        <button className="nav-item" onClick={onLogout}>
          <Icon icon={Logout01Icon} />
          Sign out
        </button>
      </div>
    </>
  );
}
function Workspace({ user, onUser, onLogout }) {
  const [route, setRoute] = useState(currentRoute),
    [menu, setMenu] = useState(false),
    [booking, setBooking] = useState(null),
    [notice, setNotice] = useState("");
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("studyconnect-theme") === "dark" ? "dark" : "light",
  );
  const main = useRef(null),
    menuButton = useRef(null);
  const unread = useResource(() => api.unread());
  useEffect(() => {
    const hash = () => {
      setRoute(currentRoute());
      setMenu(false);
    };
    window.addEventListener("hashchange", hash);
    return () => window.removeEventListener("hashchange", hash);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("studyconnect-theme", theme);
    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, [theme]);
  useEffect(() => {
    document.title = `${route.view === "Home" ? "Dashboard" : route.view} · StudyConnect`;
    main.current?.focus();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [route.view, route.id]);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const change = () => {
      if (media.matches) setMenu(false);
    };
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  const navigate = (view, id) => {
    setMenu(false);
    const next = { view: aliases[view] || view, id };
    setRoute(next);
    const hash = `#${encodeURIComponent(next.view)}${id ? `/${encodeURIComponent(id)}` : ""}`;
    if (window.location.hash !== hash) window.location.hash = hash;
  };
  const onSession = (id) => navigate("Session Details", id),
    onProfile = (id) => navigate("Tutor Profile", id);
  const view = route.view;
  let content;
  if (view === "Home")
    content = (
      <Dashboard user={user} navigate={navigate} onSession={onSession} />
    );
  else if (["Find Tutor", "Find Learner"].includes(view))
    content = (
      <Directory
        key={view}
        user={user}
        learners={view === "Find Learner"}
        onProfile={onProfile}
        onBook={setBooking}
      />
    );
  else if (view === "Find Study Partner") content = <Partners user={user} />;
  else if (view === "My Sessions")
    content = (
      <Sessions
        user={user}
        onOpen={onSession}
        onDiscover={() => navigate("Find Tutor")}
      />
    );
  else if (view === "Session Details" && route.id)
    content = (
      <SessionDetail
        key={route.id}
        id={route.id}
        user={user}
        onBack={() => navigate("My Sessions")}
        onChat={() => navigate("Chat Session", route.id)}
      />
    );
  else if (view === "Tutor Profile" && route.id)
    content = (
      <TutorProfile
        key={route.id}
        id={route.id}
        user={user}
        onBack={() => navigate("Find Tutor")}
        onBook={setBooking}
      />
    );
  else if (view === "Chat Session" || view === "Messages")
    content = (
      <Messages
        session={view === "Chat Session"}
        onBack={() =>
          view === "Chat Session" && route.id
            ? onSession(route.id)
            : navigate("Home")
        }
      />
    );
  else if (view === "Course Materials") content = <Materials />;
  else if (view === "Profile")
    content = <Profile user={user} onSaved={onUser} />;
  else if (view === "Settings")
    content = (
      <Settings
        theme={theme}
        onThemeChange={setTheme}
        onProfile={() => navigate("Profile")}
      />
    );
  else if (view === "Notifications")
    content = <Notifications onChanged={unread.reload} />;
  else
    content = (
      <Empty
        title="Choose a session or profile"
        action={
          <button className="button primary" onClick={() => navigate("Home")}>
            Go to dashboard
          </button>
        }
      >
        Open a specific item to see its details.
      </Empty>
    );
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#workspace"
        onClick={(event) => {
          event.preventDefault();
          main.current?.focus();
        }}
      >
        Skip to content
      </a>
      <aside className="sidebar">
        <Navigation
          view={view}
          navigate={navigate}
          count={unread.data?.unreadCount || 0}
          onLogout={onLogout}
        />
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="topbar-start">
            <button
              ref={menuButton}
              className="icon-button menu-toggle"
              aria-label="Open navigation"
              aria-expanded={menu}
              aria-controls="mobile-navigation"
              onClick={() => setMenu(true)}
            >
              <Icon icon={Menu01Icon} />
            </button>
            <span className="desktop-breadcrumb">
              Your campus workspace <span>/</span>{" "}
              <strong>{view === "Home" ? "Overview" : view}</strong>
            </span>
            <span className="mobile-brand">
              <Brand />
            </span>
          </div>
          <div className="topbar-actions">
            <button
              className="icon-button notification-button"
              aria-label={
                unread.data?.unreadCount
                  ? `Notifications, ${unread.data.unreadCount} unread`
                  : "Notifications"
              }
              onClick={() => navigate("Notifications")}
            >
              <Icon icon={Notification01Icon} />
              {unread.data?.unreadCount > 0 && (
                <span className="notification-dot" />
              )}
            </button>
            <button
              className="user-chip"
              onClick={() => navigate("Profile")}
              aria-label={`Open profile for ${displayName(user)}`}
            >
              <Avatar user={user} />
              <span>
                <strong>{displayName(user)}</strong>
                <small>{roleLabel(user.role)}</small>
              </span>
            </button>
          </div>
        </header>
        <main ref={main} tabIndex={-1} id="workspace" className="page">
          <Notice>{notice}</Notice>
          {content}
        </main>
        <footer className="app-footer">
          <span>StudyConnect · Built for learning, together.</span>
          <span>Free for your campus community</span>
        </footer>
      </div>
      {menu && (
        <Dialog
          className="navigation-dialog"
          title="Navigation"
          onClose={() => {
            setMenu(false);
            menuButton.current?.focus();
          }}
        >
          <div id="mobile-navigation">
            <Navigation
              view={view}
              navigate={navigate}
              count={unread.data?.unreadCount || 0}
              onLogout={onLogout}
            />
          </div>
        </Dialog>
      )}
      {booking && (
        <Booking
          tutor={booking}
          onClose={() => setBooking(null)}
          onBooked={(s) => {
            setBooking(null);
            setNotice(
              "Session booked. Review your plan and coordinate with your tutor.",
            );
            onSession(s.id);
            unread.reload();
          }}
        />
      )}
    </div>
  );
}
export default function App() {
  const [user, setUser] = useState(null),
    [checked, setChecked] = useState(false),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0),
    [expired, setExpired] = useState(false);
  useEffect(() => {
    let alive = true;
    setError("");
    if (!getToken()) {
      setChecked(true);
      return;
    }
    setChecked(false);
    api
      .me()
      .then((data) => {
        if (alive) setUser(data.user || data);
      })
      .catch((e) => {
        if (!alive) return;
        if (e.status === 401) {
          clearToken();
          setUser(null);
        } else setError(e.message);
      })
      .finally(() => {
        if (alive) setChecked(true);
      });
    return () => {
      alive = false;
    };
  }, [version]);
  useEffect(() => {
    const expire = () => {
      clearToken();
      setUser(null);
      setExpired(true);
      setChecked(true);
      setError("");
    };
    const storage = (e) => {
      if (e.key === "studyconnect-token") {
        setUser(null);
        setVersion((v) => v + 1);
      }
    };
    window.addEventListener("studyconnect:expired", expire);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener("studyconnect:expired", expire);
      window.removeEventListener("storage", storage);
    };
  }, []);
  if (!checked)
    return (
      <div className="startup" role="status">
        <Brand />
        <span className="spinner" />
        <p>Getting your learning space ready…</p>
      </div>
    );
  if (error)
    return (
      <div className="startup">
        <Brand />
        <Notice error>{error}</Notice>
        <button
          className="button primary"
          onClick={() => setVersion((v) => v + 1)}
        >
          Retry session check
        </button>
        <button
          className="button secondary"
          onClick={() => {
            clearToken();
            setError("");
            setUser(null);
          }}
        >
          Back to sign in
        </button>
      </div>
    );
  if (!user)
    return (
      <>
        {expired && (
          <div className="session-expired" role="status">
            Your session expired. Please sign in again.
          </div>
        )}
        <AuthView
          onLogin={async (loggedIn) => {
            setUser(loggedIn);
            setExpired(false);
            window.location.hash = "#Home";
          }}
        />
      </>
    );
  return (
    <Workspace
      user={user}
      onUser={setUser}
      onLogout={() => {
        clearToken();
        setUser(null);
        setExpired(false);
        window.location.hash = "";
      }}
    />
  );
}
