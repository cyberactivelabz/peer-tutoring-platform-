import { useState } from "react";
import { api } from "../api.js";
import { displayName } from "../Auth.js";
import SafetyGuidance from "../SafetyGuidance.jsx";
import {
  Avatar,
  CourseSelect,
  Empty,
  Heading,
  LoadState,
  Notice,
  Status,
  Tags,
  courseName,
  dateTime,
  useResource,
} from "./ui.jsx";

export function Partners({ user }) {
  const resource = useResource(() => api.partners());
  const courses = useResource(() => api.courses());
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const match = async (e) => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.match(v);
      setMessage(
        "A study partner has been matched. Review their profile below and agree on a safe meeting plan.",
      );
      resource.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const [reshuffleId, setReshuffleId] = useState(null);
  return (
    <>
      <Heading
        eyebrow="GROW TOGETHER"
        title="Find your study rhythm"
        description="Build momentum with a fellow student, one course at a time."
      />
      <div className="detail-grid">
        <section className="panel">
          <h2>Match with a study partner</h2>
          <p>
            Choose a course and preferred format. Matching creates a connection
            immediately; there is no invitation approval step.
          </p>
          <LoadState resource={courses}>
            {courses.data?.length ? (
              <form onSubmit={match}>
                <fieldset className="form-fields" disabled={busy}>
                  <CourseSelect courses={courses.data} />
                  <label>
                    Preferred format
                    <select name="preferredFormat">
                      <option value="PHYSICAL">On campus</option>
                      <option value="ONLINE">Online</option>
                      <option value="BOTH">Either format</option>
                    </select>
                  </label>
                  <label>
                    Your goals and availability
                    <textarea
                      name="notes"
                      placeholder="e.g. Review past papers on weekday afternoons"
                      maxLength={2000}
                    />
                  </label>
                  <Notice error>{error}</Notice>
                  <Notice>{message}</Notice>
                  <button className="button primary">
                    {busy ? "Finding a partner…" : "Find a study partner"}
                  </button>
                </fieldset>
              </form>
            ) : (
              <Empty title="No courses in the catalog">
                Partner matching needs a course to get started.
              </Empty>
            )}
          </LoadState>
        </section>
        <aside className="panel lavender-panel">
          <p className="eyebrow">A GOOD MATCH STARTS WITH A CONVERSATION</p>
          <h2>Shared goals. Mutual respect.</h2>
          <p>
            Matches use the requested course and your peer’s listed courses.
            Schedules and meeting formats are not checked yet. Discuss
            availability before meeting.
          </p>
          <SafetyGuidance />
        </aside>
      </div>
      <div className="section-heading">
        <h2>Your study partners</h2>
        <span>From your matching history</span>
      </div>
      <LoadState resource={resource}>
        <div className="card-grid">
          {(resource.data || []).map((m) => {
            const p = m.studentAId === user.id ? m.studentB : m.studentA;
            const overlap = (p?.coursesNeedingHelp || []).filter(
              (c) =>
                user.coursesNeedingHelp?.includes(c) ||
                user.coursesToTeach?.includes(c),
            );
            return (
              <article className="person-card" key={m.id}>
                <div className="person-card-top">
                  <Avatar user={p} />
                  <Status value={m.status} />
                </div>
                <h3>{displayName(p)}</h3>
                <p>{courseName(m.course)}</p>
                <Tags values={overlap} />
                <p>
                  {overlap.length
                    ? "Shared courses from your profiles"
                    : "Course overlap not established"}
                </p>
                <p className="subtle">
                  {m.preferredFormat === "PHYSICAL"
                    ? "On-campus preference"
                    : m.preferredFormat === "ONLINE"
                      ? "Online preference"
                      : "Flexible format"}{" "}
                  · Availability to be agreed
                </p>
                {m.notes && <p>{m.notes}</p>}
                {m.status === "ACTIVE" &&
                  (reshuffleId === m.id ? (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const reason = new FormData(e.currentTarget).get(
                          "reason",
                        );
                        setBusy(true);
                        setError("");
                        try {
                          const r = await api.reshuffle(m.id, reason);
                          setMessage(
                            r.newMatch
                              ? "A new partner has been matched."
                              : "Previous match ended. No new partner is available yet.",
                          );
                          setReshuffleId(null);
                          resource.reload();
                        } catch (e) {
                          setError(e.message);
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      <label>
                        Reason for a new match
                        <input name="reason" required maxLength={500} />
                      </label>
                      <p className="subtle">
                        This ends your current match even if no new partner is
                        available.
                      </p>
                      <div className="button-row">
                        <button disabled={busy} className="button secondary">
                          {busy ? "Updating…" : "Confirm reshuffle"}
                        </button>
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => setReshuffleId(null)}
                        >
                          Keep match
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      className="button secondary"
                      onClick={() => setReshuffleId(m.id)}
                    >
                      Request a different match
                    </button>
                  ))}
              </article>
            );
          })}
        </div>
        {!resource.data?.length && (
          <Empty title="Your next study partner is out there">
            Choose a course above to look for a peer. We’ll show only matches
            returned by the service.
          </Empty>
        )}
      </LoadState>
    </>
  );
}
export function Notifications({ onChanged }) {
  const resource = useResource(() => api.notifications());
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(null);
  const read = async (id) => {
    setBusy(id || "all");
    setError("");
    try {
      if (id) await api.readNotification(id);
      else await api.readAllNotifications();
      resource.reload();
      onChanged();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };
  return (
    <>
      <Heading
        eyebrow="COMMUNICATION"
        title="Your notifications"
        description="Stay in the loop with your learning community."
        action={
          <button
            className="button secondary"
            disabled={!!busy || !resource.data?.some((n) => !n.isRead)}
            onClick={() => read()}
          >
            Mark all as read
          </button>
        }
      />
      <Notice error>{error}</Notice>
      <LoadState resource={resource}>
        <div className="stack">
          {resource.data?.map((n) => (
            <article
              key={n.id}
              className={`panel notification ${n.isRead ? "" : "unread"}`}
            >
              <div>
                <span className="eyebrow">
                  {n.type}
                  {!n.isRead ? " · UNREAD" : ""}
                </span>
                <h2>{n.title}</h2>
                <p>{n.message}</p>
                <span className="subtle">{dateTime(n.createdAt)}</span>
              </div>
              {!n.isRead && (
                <button
                  className="button secondary"
                  disabled={!!busy}
                  onClick={() => read(n.id)}
                >
                  Mark as read
                </button>
              )}
            </article>
          ))}
        </div>
        {!resource.data?.length && (
          <Empty title="You’re all caught up">
            New notifications will appear here when the service sends them.
          </Empty>
        )}
      </LoadState>
    </>
  );
}
export function Messages({ onBack, session = false }) {
  return (
    <>
      <Heading
        eyebrow="COMMUNICATION"
        title={session ? "Session communication" : "Messages"}
        description="Keep your learning connections in one place."
      />
      <section className="panel">
        <Empty
          title="In-app messaging isn’t available yet"
          action={
            <button className="button secondary" onClick={onBack}>
              Back to {session ? "session" : "dashboard"}
            </button>
          }
        >
          The current service does not support chat or attachments. No messages
          have been sent. Use your session’s agreed meeting location or online
          link to connect.
        </Empty>
      </section>
      <SafetyGuidance />
    </>
  );
}
