import { useEffect, useState } from "react";
import { api } from "../api.js";
import { saveToken } from "../Auth.js";
import Brand from "./Brand.jsx";

const departments = [
  "Accounting",
  "Business Administration",
  "International Relations",
  "Local Government and Development Studies",
  "Public Administration",
  "Agricultural Economics",
  "Agricultural Extension and Rural Development",
  "Animal Sciences",
  "Crop Production and Protection",
  "Family Nutrition and Consumer Sciences",
  "Plant Science",
  "Soil Science",
  "Dramatic Arts",
  "English",
  "Foreign Languages",
  "History",
  "Linguistics and African Languages",
  "Music",
  "Philosophy",
  "Religious Studies",
  "Anatomy and Cell Biology",
  "Haematology and Immunology",
  "Medical Biochemistry",
  "Medical Microbiology and Parasitology",
  "Medical Pharmacology and Therapeutics",
  "Medical Rehabilitation",
  "Morbid Anatomy and Forensic Medicine",
  "Nursing Sciences",
  "Physiological Sciences",
  "Community Health and Nutrition",
  "Dermatology and Venerology",
  "Medicine",
  "Mental Health",
  "Obstetrics, Gynaecology and Perinatology",
  "Ophthalmology",
  "Orthopaedics and Traumatology",
  "Paediatrics and Child Health",
  "Radiology",
  "Surgery",
  "Child Dental Health",
  "Oral and Maxillofacial Surgery and Oral Pathology",
  "Preventive and Community Dentistry",
  "Restorative Dentistry",
  "Architecture",
  "Building",
  "Estate Management",
  "Fine and Applied Arts",
  "Quantity Surveying",
  "Surveying and Geoinformatics",
  "Urban and Regional Planning",
  "Adult Education and Lifelong Learning",
  "Arts and Social Sciences Education",
  "Counselling and Human Development",
  "Educational Foundation and Counseling",
  "Educational Management",
  "Institute of Education",
  "Physical and Health Education",
  "Science and Technology Education",
  "Business Law",
  "International Law",
  "Jurisprudence and Private Law",
  "Public Law",
  "Clinical Pharmacy and Pharmacy Administration",
  "Drug Research and Production Unit",
  "Pharmaceutical Chemistry",
  "Pharmaceutics and Industrial Pharmacy",
  "Pharmacognosy",
  "Pharmacology",
  "Biochemistry",
  "Botany",
  "Chemistry",
  "Geology",
  "Mathematics",
  "Microbiology",
  "Physics",
  "Statistics",
  "Zoology",
  "Demography and Social Statistics",
  "Economics",
  "Geography",
  "Political Science",
  "Psychology",
  "Sociology and Anthropology",
  "African Institute for Science Policy and Innovation",
  "Agricultural and Environmental Engineering",
  "Aerospace Engineering",
  "Chemical Engineering",
  "Civil Engineering",
  "Computer Science and Engineering",
  "Electronic and Electrical Engineering",
  "Food Science and Technology",
  "Materials Science and Engineering",
  "Mechanical Engineering",
].sort((a, b) => a.localeCompare(b));

export default function AuthView({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [gender, setGender] = useState("Female");
  const [role, setRole] = useState("LEARNER");
  const [resetStep, setResetStep] = useState("email");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  const resend = async (passwordReset) => {
    setResending(true);
    setMessage("");
    try {
      if (passwordReset)
        await api.resendPasswordOtp({ email: resetEmail.trim().toLowerCase() });
      else await api.resendRegistrationOtp({ email: registrationEmail });
      setCooldown(60);
      setMessage("A new code was sent. Check your email.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setResending(false);
    }
  };
  const [registrationEmail, setRegistrationEmail] = useState("");
  const [registrationStep, setRegistrationStep] = useState("form");

  const submitAuth = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (mode === "login") {
        const result = await api.login({
          email: values.email.trim().toLowerCase(),
          password: values.password,
        });
        if (!result.accessToken)
          throw new Error(
            "The server did not return a session token. Please try again.",
          );
        saveToken(result.accessToken);
        await onLogin(result.user || (await api.me()));
      } else if (registrationStep === "verify") {
        const result = await api.verifyRegistration({
          email: registrationEmail,
          code: values.code,
        });
        if (!result.accessToken)
          throw new Error(
            "The server did not return a session token. Please try again.",
          );
        saveToken(result.accessToken);
        await onLogin(result.user || (await api.me()));
      } else {
        if (!values.firstName.trim() || !values.lastName.trim())
          throw new Error("Enter your first and last names.");
        await api.register({
          email: values.email.trim().toLowerCase(),
          password: values.password,
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          matricNumber: values.matricNumber,
          department: values.department,
          level: values.level,
          gender,
          role,
          coursesToTeach: values.coursesToTeach
            ? values.coursesToTeach
                .split(",")
                .map((course) => course.trim())
                .filter(Boolean)
            : [],
        });
        setRegistrationEmail(values.email.trim().toLowerCase());
        setRegistrationStep("verify");
        setMessage("A verification code was sent to your email.");
      }
    } catch (error) {
      setMessage(error.message);
      if (mode === "login" && error.message.includes("not verified")) {
        setRegistrationEmail(values.email.trim().toLowerCase());
        setRegistrationStep("verify");
        setMode("signup");
      }
    } finally {
      setBusy(false);
    }
  };

  const submitReset = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (resetStep === "email") {
        await api.forgotPassword({ email: resetEmail.trim().toLowerCase() });
        setResetStep("code");
      } else if (resetStep === "code") {
        const result = await api.verifyPasswordOtp({
          email: resetEmail.trim().toLowerCase(),
          code: resetCode,
        });
        setResetToken(result.resetToken);
        setResetStep("reset");
      } else {
        if (values.newPassword !== values.confirmPassword)
          throw new Error("Passwords do not match.");
        await api.resetPassword({
          resetToken,
          newPassword: values.newPassword,
        });
        setMessage("Your password was successfully reset.");
        setMode("login");
        setResetStep("email");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-hero" aria-label="About StudyConnect">
        <div className="auth-brand">
          <Brand inverse motion />
        </div>
        <p className="eyebrow">YOUR CAMPUS. YOUR COMMUNITY.</p>
        <h1>
          Big goals.
          <br />
          Better together.
        </h1>
        <p className="auth-tagline">
          Learn <span>·</span> Support <span>·</span> Grow
        </p>
        <p className="auth-description">
          Find your people. Build your confidence. Learn together with peer
          tutors and study partners on your campus.
        </p>
        <footer>
          OAU Campus <span>|</span> Built by Students, For Students
        </footer>
      </section>

      <section
        className="auth-form-side"
        aria-label={mode === "signup" ? "Create an account" : "Log in"}
      >
        <div className="auth-card">
          <div className="auth-tabs" role="group" aria-label="Account access">
            <button
              type="button"

              aria-pressed={mode === "login"}
              className={mode === "login" ? "selected" : ""}
              disabled={busy}
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
            >
              Log In
            </button>
            <button
              type="button"

              aria-pressed={mode === "signup"}
              className={mode === "signup" ? "selected" : ""}
              disabled={busy}
              onClick={() => {
                setMode("signup");
                setMessage("");
              }}
            >
              Sign Up
            </button>
          </div>

          <p className="eyebrow">LET’S MAKE PROGRESS</p>
          <h2>
            {mode === "login"
              ? "Welcome Back"
              : mode === "signup"
                ? registrationStep === "verify"
                  ? "Verify Your Email"
                  : "Create Your Account"
                : resetStep === "email"
                  ? "Forgot Password?"
                  : resetStep === "code"
                    ? "Enter Reset Code"
                    : "Reset Password"}
          </h2>
          {message && (
            <p className="auth-help" role="status">
              {message}
            </p>
          )}
          {mode === "forgot" ? (
            <form onSubmit={submitReset} aria-busy={busy}>
              <fieldset disabled={busy} className="form-fields">
                {resetStep === "email" && (
                  <>
                    <p className="auth-help">
                      Enter your registered email and we&apos;ll send a password
                      reset code.
                    </p>
                    <label>
                      Email Address
                      <input
                        required
                        type="email"
                        name="email"
                        value={resetEmail}
                        onChange={(event) => setResetEmail(event.target.value)}
                        placeholder="Enter your email address"
                      />
                    </label>
                  </>
                )}
                {resetStep === "code" && (
                  <>
                    <p className="auth-help">
                      We sent a 6-digit code to <strong>{resetEmail}</strong>.
                    </p>
                    <label>
                      Verification code
                      <input
                        required
                        name="code"
                        value={resetCode}
                        onChange={(event) => setResetCode(event.target.value)}
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength="6"
                        placeholder="000000"
                      />
                    </label>
                    <button
                      className="text-button"
                      type="button"
                      disabled={resending || cooldown > 0}
                      onClick={() => resend(true)}
                    >
                      {resending
                        ? "Sending…"
                        : cooldown
                          ? `Resend in ${cooldown}s`
                          : "Resend code"}
                    </button>
                  </>
                )}
                {resetStep === "reset" && (
                  <>
                    <label>
                      New password
                      <input
                        required
                        name="newPassword"
                        type="password"
                        minLength="6"
                        placeholder="Enter a new password"
                      />
                    </label>
                    <label>
                      Confirm password
                      <input
                        required
                        name="confirmPassword"
                        type="password"
                        minLength="6"
                        placeholder="Confirm your new password"
                      />
                    </label>
                  </>
                )}
                <button
                  className="primary-button auth-submit"
                  disabled={busy}
                  type="submit"
                >
                  {busy
                    ? "Please wait..."
                    : resetStep === "email"
                      ? "Send reset code"
                      : resetStep === "code"
                        ? "Verify code"
                        : "Reset password"}
                </button>
                <p className="auth-switch">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setResetStep("email");
                    }}
                  >
                    Back to Log In
                  </button>
                </p>
              </fieldset>
            </form>
          ) : (
            <form onSubmit={submitAuth} aria-busy={busy}>
              <fieldset disabled={busy} className="form-fields">
                {mode === "signup" && registrationStep === "form" && (
                  <>
                    <div className="role-toggle">
                      <label>
                        Gender
                        <select
                          value={gender}
                          onChange={(event) => setGender(event.target.value)}
                        >
                          <option>Female</option>
                          <option>Male</option>
                        </select>
                      </label>
                    </div>
                    <div className="role-toggle">
                      <label>
                        Account type
                        <select
                          value={role}
                          onChange={(event) => setRole(event.target.value)}
                        >
                          <option value="LEARNER">Learner</option>
                          <option value="TUTOR">Tutor</option>
                          <option value="BOTH">Learner and tutor</option>
                          <option value="STUDY_PARTNER">Study Partner</option>
                        </select>
                      </label>
                    </div>
                    <label>
                      First Name
                      <input
                        required
                        name="firstName"
                        autoComplete="given-name"
                        placeholder="First name"
                      />
                    </label>
                    <label>
                      Last Name
                      <input
                        required
                        name="lastName"
                        autoComplete="family-name"
                        placeholder="Last name"
                      />
                    </label>
                    <label>
                      Student ID
                      <input
                        required
                        name="matricNumber"
                        placeholder="Enter your student ID"
                      />
                    </label>
                    <label>
                      Department
                      <select required name="department" defaultValue="">
                        <option value="" disabled>
                          Select your department
                        </option>
                        {departments.map((department) => (
                          <option key={department}>{department}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Level
                      <select required name="level" defaultValue="">
                        <option value="" disabled>
                          Select your level
                        </option>
                        <option>100 Level</option>
                        <option>200 Level</option>
                        <option>300 Level</option>
                        <option>400 Level</option>
                        <option>500 Level</option>
                      </select>
                    </label>
                    {["TUTOR", "BOTH"].includes(role) && (
                      <fieldset className="course-picker">
                        <legend>Courses you teach</legend>
                        <label>
                          <input
                            type="text"
                            name="coursesToTeach"
                            placeholder="CSC201, MTH201"
                          />{" "}
                          Enter course codes separated by commas
                        </label>
                      </fieldset>
                    )}
                  </>
                )}
                {mode === "signup" && registrationStep === "verify" ? (
                  <>
                    <p className="auth-help">
                      Enter the 6-digit code sent to {registrationEmail}.
                    </p>
                    <label>
                      Verification code
                      <input
                        required
                        name="code"
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength="6"
                        placeholder="000000"
                      />
                    </label>
                    <button
                      className="text-button"
                      type="button"
                      disabled={resending || cooldown > 0}
                      onClick={() => resend(false)}
                    >
                      {resending
                        ? "Sending…"
                        : cooldown
                          ? `Resend in ${cooldown}s`
                          : "Resend code"}
                    </button>
                  </>
                ) : (
                  <>
                    <label>
                      Email Address
                      <input
                        required
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="Enter your email address"
                      />
                    </label>
                    <label>
                      Password
                      <input
                        required
                        name="password"
                        type="password"
                        minLength="6"
                        autoComplete={
                          mode === "login" ? "current-password" : "new-password"
                        }
                        placeholder="Enter your password"
                      />
                    </label>
                  </>
                )}
                {mode === "login" && (
                  <button
                    className="text-button forgot-link"
                    type="button"
                    onClick={() => setMode("forgot")}
                  >
                    Forgot Password?
                  </button>
                )}
                <button
                  className="primary-button auth-submit"
                  disabled={busy}
                  type="submit"
                >
                  {busy
                    ? "Please wait..."
                    : mode === "login"
                      ? "Log In"
                      : registrationStep === "verify"
                        ? "Verify email"
                        : "Sign Up"}
                </button>
                <p className="auth-switch">
                  {mode === "login"
                    ? "Don’t have an account? "
                    : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() =>
                      setMode(mode === "login" ? "signup" : "login")
                    }
                  >
                    {mode === "login" ? "Sign Up" : "Log In"}
                  </button>
                </p>
              </fieldset>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
