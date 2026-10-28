import { useState } from "react";
import { api } from "../api.js";
import { displayName, roleLabel } from "../Auth.js";
import { Avatar, Heading, Notice, Tags } from "./ui.jsx";
export function Profile({ user, onSaved }) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const save = async (e) => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const values = Object.fromEntries(
        Object.entries(v).map(([k, v]) => [k, v.trim()]),
      );
      if (!values.firstName || !values.lastName)
        throw new Error("First and last names cannot be blank.");
      if (values.role === user.role) delete values.role;
      for (const key of ["coursesToTeach", "coursesNeedingHelp"])
        values[key] = [
          ...new Set(
            values[key]
              .split(",")
              .map((c) => c.trim().toUpperCase())
              .filter(Boolean),
          ),
        ];
      const updated = await api.updateProfile(values);
      onSaved(updated);
      setMessage("Your profile has been saved.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Heading
        eyebrow="YOUR ACCOUNT"
        title="A profile that feels like you"
        description="Help your peers understand what you know and what you’re learning."
      />
      <section className="profile-hero">
        <Avatar user={user} large />
        <div>
          <h2>{displayName(user)}</h2>
          <p>
            {roleLabel(user.role)} · {user.email}
          </p>
          <span className="verified">
            {user.isVerified ? "Email verified" : "Email not verified"}
          </span>
        </div>
      </section>
      <div className="detail-grid">
        <section className="panel">
          <h2>Academic profile</h2>
          <Notice error>{error}</Notice>
          <Notice>{message}</Notice>
          <form onSubmit={save}>
            <fieldset disabled={busy} className="form-fields">
              <div className="form-row">
                <label>
                  First name
                  <input
                    name="firstName"
                    required
                    defaultValue={user.firstName}
                    autoComplete="given-name"
                    maxLength={100}
                  />
                </label>
                <label>
                  Last name
                  <input
                    name="lastName"
                    required
                    defaultValue={user.lastName}
                    autoComplete="family-name"
                    maxLength={100}
                  />
                </label>
              </div>
              <label>
                Department
                <input
                  name="department"
                  defaultValue={user.department || ""}
                  maxLength={150}
                />
              </label>
              <div className="form-row">
                <label>
                  Level
                  <input
                    name="level"
                    defaultValue={user.level || ""}
                    maxLength={50}
                  />
                </label>
                <label>
                  Role
                  <select name="role" defaultValue={user.role}>
                    {[
                      ["LEARNER", "Learner"],
                      ["TUTOR", "Tutor"],
                      ["BOTH", "Learner and tutor"],
                      ["STUDY_PARTNER", "Study partner"],
                      ...(user.role === "ADMIN" ? [["ADMIN", "Admin"]] : []),
                    ].map(([v, l]) => (
                      <option value={v} key={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                About you
                <textarea
                  name="bio"
                  defaultValue={user.bio || ""}
                  maxLength={2000}
                />
              </label>
              <label>
                Courses you teach
                <input
                  name="coursesToTeach"
                  defaultValue={(user.coursesToTeach || []).join(", ")}
                  placeholder="CSC201, MTH101"
                />
                <small>Separate course codes with commas.</small>
              </label>
              <label>
                Courses you need help with
                <input
                  name="coursesNeedingHelp"
                  defaultValue={(user.coursesNeedingHelp || []).join(", ")}
                  placeholder="PHY102, MTH201"
                />
              </label>
              <button className="button primary">
                {busy ? "Saving…" : "Save profile"}
              </button>
            </fieldset>
          </form>
        </section>
        <aside className="stack">
          <section className="panel lavender-panel">
            <h2>Your learning footprint</h2>
            <dl className="details-list">
              <div>
                <dt>Sessions attended</dt>
                <dd>{user.totalSessionsAttended || 0}</dd>
              </div>
              <div>
                <dt>Sessions taught</dt>
                <dd>{user.totalSessionsGiven || 0}</dd>
              </div>
              <div>
                <dt>Reviews</dt>
                <dd>{user.reviewCount || 0}</dd>
              </div>
            </dl>
            <h3>Teaching courses</h3>
            <Tags values={user.coursesToTeach} />
            <h3>Learning interests</h3>
            <Tags values={user.coursesNeedingHelp} />
          </section>
          <section className="panel">
            <h3>A useful profile opens doors</h3>
            <p>
              Add the courses you know and a short bio. Avoid publishing
              personal contact details.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
export function Settings({ theme, onThemeChange, onProfile }) {
  return (
    <>
      <Heading
        eyebrow="YOUR ACCOUNT"
        title="Make yourself at home"
        description="A comfortable space for your best work."
      />
      <section className="panel settings-panel">
        <h2>Appearance</h2>
        <p>Your preference is saved on this device.</p>
        <div className="theme-options" role="group" aria-label="Color theme">
          {["light", "dark"].map((t) => (
            <button
              key={t}
              className={`theme-option ${theme === t ? "selected" : ""}`}
              aria-pressed={theme === t}
              onClick={() => onThemeChange(t)}
            >
              <span className={`theme-swatch swatch-${t}`}>
                <i />
                <i />
              </span>
              <strong>
                {t === "light" ? "Light & focused" : "Dark & calm"}
              </strong>
              <span>{theme === t ? "Selected" : "Choose theme"}</span>
            </button>
          ))}
        </div>
        <hr />
        <h2>Academic preferences</h2>
        <p>Update your courses, role, department, and bio in your profile.</p>
        <button className="button secondary" onClick={onProfile}>
          Edit your profile
        </button>
        <hr />
        <h2>Account security & notifications</h2>
        <p>
          Password recovery is available from the sign-in screen. Notification
          delivery and privacy preferences are not configurable through the
          current service.
        </p>
      </section>
    </>
  );
}
