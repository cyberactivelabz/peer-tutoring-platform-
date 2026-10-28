import { useState } from "react";
import {
  Calendar03Icon,
  Clock01Icon,
  Location01Icon,
} from "@hugeicons/core-free-icons";
import { api } from "../api.js";
import { displayName } from "../Auth.js";
import SafetyGuidance from "../SafetyGuidance.jsx";
import {
  Avatar,
  CourseSelect,
  Dialog,
  Empty,
  Heading,
  Icon,
  LoadState,
  Notice,
  Status,
  courseName,
  dateTime,
  safeUrl,
  useResource,
} from "./ui.jsx";

export function SessionCard({ session, onOpen }) {
  return (
    <article className="session-card">
      <div className="session-symbol">
        <Icon icon={Calendar03Icon} size={24} />
      </div>
      <div className="session-copy">
        <div className="card-heading">
          <h3>{courseName(session.course)}</h3>
          <Status value={session.status} />
        </div>
        <p>
          {displayName(session.tutor)} ·{" "}
          {session.sessionType === "GROUP"
            ? "Group session"
            : "One-to-one tutoring"}
        </p>
        <div className="meta">
          <span>
            <Icon icon={Clock01Icon} size={16} />
            {dateTime(session.scheduledAt)} · {session.durationMinutes} min
          </span>
          <span>
            <Icon icon={Location01Icon} size={16} />
            {session.locationType === "ONLINE"
              ? "Online"
              : session.locationVenue || "Venue not specified"}
          </span>
        </div>
      </div>
      <button className="button secondary" onClick={() => onOpen(session.id)}>
        View details
      </button>
    </article>
  );
}
export function Booking({ tutor, onClose, onBooked }) {
  const courses = useResource(() => api.courses());
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const normalizeCode = (code) => code.replace(/\s/g, "").toUpperCase();
  const offeredCourses = (courses.data || []).filter((course) =>
    tutor.coursesToTeach?.some(
      (code) => normalizeCode(code) === normalizeCode(course.code),
    ),
  );
  const [mode, setMode] = useState("PHYSICAL");
  const [sessionType, setSessionType] = useState("ONE_ON_ONE");
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const v = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (new Date(v.scheduledAt) <= new Date())
        throw new Error("Choose a future date and time.");
      if (!v.notes.trim())
        throw new Error("Add a learning goal for your session.");
      if (mode === "PHYSICAL" && !v.locationVenue.trim())
        throw new Error("Choose a public campus venue.");
      const session = await api.book({
        tutorId: tutor.id,
        courseId: v.courseId,
        scheduledAt: new Date(v.scheduledAt).toISOString(),
        durationMinutes: Number(v.durationMinutes),
        sessionType: v.sessionType,
        maxLearners: v.sessionType === "GROUP" ? Number(v.maxLearners) : 1,
        locationType: mode,
        ...(mode === "ONLINE"
          ? { meetingUrl: v.meetingUrl }
          : { locationVenue: v.locationVenue.trim() }),
        notes: v.notes.trim(),
      });
      onBooked(session);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog title="Plan a study session" onClose={onClose}>
      <div className="person-summary">
        <Avatar user={tutor} />
        <div>
          <strong>{displayName(tutor)}</strong>
          <p>Your tutor will see this booking.</p>
        </div>
      </div>
      <LoadState resource={courses}>
        {offeredCourses.length ? (
          <form onSubmit={submit}>
            <Notice error>{error}</Notice>
            <fieldset disabled={busy} className="form-fields">
              <CourseSelect courses={offeredCourses} />
              <label>
                Learning goal
                <textarea
                  name="notes"
                  required
                  maxLength={2000}
                  placeholder="What would you like to work on?"
                />
              </label>
              <div className="form-row">
                <label>
                  Date and time
                  <input name="scheduledAt" type="datetime-local" required />
                </label>
                <label>
                  Duration (minutes)
                  <input
                    name="durationMinutes"
                    type="number"
                    min="15"
                    max="240"
                    defaultValue="60"
                    required
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Session type
                  <select
                    name="sessionType"
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value)}
                  >
                    <option value="ONE_ON_ONE">One to one</option>
                    <option value="GROUP">Group session</option>
                  </select>
                </label>
                {sessionType === "GROUP" && (
                  <label>
                    Group capacity
                    <input
                      name="maxLearners"
                      type="number"
                      min="1"
                      max="20"
                      defaultValue="6"
                      required
                    />
                  </label>
                )}
              </div>
              <label>
                Meeting format
                <select value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="PHYSICAL">On campus</option>
                  <option value="ONLINE">Online</option>
                </select>
              </label>
              {mode === "PHYSICAL" ? (
                <label>
                  Public campus venue
                  <input
                    name="locationVenue"
                    required
                    placeholder="e.g. Main library, ground floor"
                  />
                </label>
              ) : (
                <label>
                  Meeting link
                  <input
                    type="url"
                    name="meetingUrl"
                    required
                    pattern="https?://.*"
                    placeholder="https://meet.google.com/…"
                  />
                </label>
              )}
              <button className="button primary full-width" disabled={busy}>
                {busy ? "Booking…" : "Book session"}
              </button>
            </fieldset>
          </form>
        ) : (
          <Empty title="No matching teaching courses">
            This tutor’s listed courses do not match the current catalog. Choose
            another tutor or ask them to update their teaching profile.
          </Empty>
        )}
      </LoadState>
      <SafetyGuidance />
    </Dialog>
  );
}
export function Sessions({ onOpen, onDiscover, user }) {
  const [tab, setTab] = useState("upcoming");
  const resource = useResource(
    () => (tab === "groups" ? api.openGroups() : api.sessions()),
    tab,
  );
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(null);
  const rows = (resource.data || []).filter(
    (s) =>
      tab === "groups" ||
      (tab === "past"
        ? ["COMPLETED", "CANCELLED"].includes(s.status) ||
          new Date(s.scheduledAt) < new Date()
        : !["COMPLETED", "CANCELLED"].includes(s.status) &&
          new Date(s.scheduledAt) >= new Date()),
  );
  const join = async (id) => {
    setBusy(id);
    setError("");
    try {
      const s = await api.joinGroup(id);
      onOpen(s.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };
  return (
    <>
      <Heading
        eyebrow="LEARNING"
        title="Your study sessions"
        description="A little structure. A lot more progress."
        action={
          <button className="button primary" onClick={onDiscover}>
            Find a tutor
          </button>
        }
      />
      <div className="segmented" role="group" aria-label="Session filter">
        {[
          ["upcoming", "Upcoming"],
          ["past", "History"],
          ["groups", "Open groups"],
        ].map(([v, l]) => (
          <button key={v} aria-pressed={tab === v} onClick={() => setTab(v)}>
            {l}
          </button>
        ))}
      </div>
      <Notice error>{error}</Notice>
      <LoadState resource={resource}>
        <div className="stack">
          {rows.map((s) => (
            <div key={s.id}>
              <SessionCard session={s} onOpen={onOpen} />
              {tab === "groups" &&
                s.tutorId !== user.id &&
                !s.participants?.some((p) => p.learnerId === user.id) && (
                  <button
                    className="button secondary group-join"
                    disabled={busy === s.id}
                    onClick={() => join(s.id)}
                  >
                    {busy === s.id ? "Joining…" : "Join group session"}
                  </button>
                )}
            </div>
          ))}
        </div>
        {!rows.length && (
          <Empty
            title={
              tab === "past"
                ? "Your learning story starts here"
                : tab === "groups"
                  ? "No open groups right now"
                  : "Make room for your next breakthrough"
            }
            action={
              <button className="button primary" onClick={onDiscover}>
                Explore peer tutors
              </button>
            }
          >
            Your sessions will appear here when they are available.
          </Empty>
        )}
      </LoadState>
      <SafetyGuidance />
    </>
  );
}
export function SessionDetail({ id, user, onBack, onChat }) {
  const resource = useResource(() => api.session(id), id);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const update = async (status) => {
    setBusy(true);
    setError("");
    try {
      await api.updateSession(id, status);
      resource.reload();
      setMessage(`Session ${status.toLowerCase()}.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const s = resource.data;
  const canManage =
    s &&
    (s.tutorId === user.id ||
      s.participants?.some((p) => p.learnerId === user.id));
  return (
    <>
      <button className="back-button" onClick={onBack}>
        ← Back to sessions
      </button>
      <Notice error>{error}</Notice>
      <Notice>{message}</Notice>
      <LoadState resource={resource}>
        {s && (
          <>
            <Heading
              eyebrow="SESSION DETAILS"
              title={courseName(s.course)}
              description={
                s.sessionType === "GROUP"
                  ? "Learning is better together."
                  : "Focused support, at your pace."
              }
              action={<Status value={s.status} />}
            />
            <div className="detail-grid">
              <section className="panel">
                <h2>Your session plan</h2>
                <dl className="details-list">
                  <div>
                    <dt>Tutor</dt>
                    <dd>{displayName(s.tutor)}</dd>
                  </div>
                  <div>
                    <dt>When</dt>
                    <dd>{dateTime(s.scheduledAt)}</dd>
                  </div>
                  <div>
                    <dt>Duration</dt>
                    <dd>{s.durationMinutes} minutes</dd>
                  </div>
                  <div>
                    <dt>Format</dt>
                    <dd>
                      {s.locationType === "ONLINE" ? "Online" : "On campus"}
                    </dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd>
                      {s.locationType === "ONLINE" ? (
                        safeUrl(s.meetingUrl) ? (
                          <a
                            href={safeUrl(s.meetingUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open meeting link ↗
                          </a>
                        ) : (
                          "Link not provided"
                        )
                      ) : (
                        s.locationVenue || "Venue not specified"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Learning goal</dt>
                    <dd>{s.notes || "No notes added."}</dd>
                  </div>
                </dl>
                <div className="button-row">
                  {canManage &&
                    !["COMPLETED", "CANCELLED"].includes(s.status) && (
                      <>
                        {s.tutorId === user.id && s.status === "SCHEDULED" && (
                          <button
                            className="button primary"
                            disabled={busy}
                            onClick={() => update("CONFIRMED")}
                          >
                            Confirm session
                          </button>
                        )}
                        {s.tutorId === user.id && s.status === "CONFIRMED" && (
                          <button
                            className="button primary"
                            disabled={busy}
                            onClick={() => update("COMPLETED")}
                          >
                            Mark completed
                          </button>
                        )}
                        <button
                          className="button danger"
                          disabled={busy}
                          onClick={() => update("CANCELLED")}
                        >
                          Cancel session
                        </button>
                      </>
                    )}
                  <button className="button secondary" onClick={onChat}>
                    Session communication
                  </button>
                </div>
              </section>
              <section className="panel">
                <h2>Learning together</h2>
                <p>
                  {s.participants?.length || 0} participant(s) · {s.maxLearners}{" "}
                  maximum
                </p>
                {s.participants?.map((p) => (
                  <div key={p.id || p.learnerId} className="person-summary">
                    <Avatar user={p.learner} />
                    <strong>{displayName(p.learner)}</strong>
                  </div>
                ))}
                <SafetyGuidance />
              </section>
            </div>
            {s.status === "COMPLETED" &&
              s.tutorId !== user.id &&
              s.participants?.some((p) => p.learnerId === user.id) && (
                <ReviewForm session={s} />
              )}
          </>
        )}
      </LoadState>
    </>
  );
}
function ReviewForm({ session }) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  return (
    <section className="panel review-panel">
      <h2>How was your session?</h2>
      <p>Help fellow students find the support they need.</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const v = Object.fromEntries(new FormData(e.currentTarget));
          setBusy(true);
          setError("");
          try {
            await api.review({
              sessionId: session.id,
              rating: Number(v.rating),
              comment: v.comment,
            });
            setMessage("Thank you. Your review has been submitted.");
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Notice error>{error}</Notice>
        <Notice>{message}</Notice>
        {!message && (
          <fieldset disabled={busy} className="form-fields">
            <label>
              Rating
              <select name="rating">
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} out of 5
                  </option>
                ))}
              </select>
            </label>
            <label>
              Review (optional)
              <textarea name="comment" maxLength={2000} />
            </label>
            <button className="button primary">
              {busy ? "Submitting…" : "Submit review"}
            </button>
          </fieldset>
        )}
      </form>
    </section>
  );
}
