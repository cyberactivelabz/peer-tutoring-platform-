import { useEffect, useState } from "react";
import { api } from "../api.js";
import { saveToken } from "../Auth.js";
import Brand from "./Brand.jsx";

const departments = [
  "Accounting","Business Administration","International Relations","Local Government and Development Studies","Public Administration","Agricultural Economics","Agricultural Extension and Rural Development","Animal Sciences","Crop Production and Protection","Family Nutrition and Consumer Sciences","Plant Science","Soil Science","Dramatic Arts","English","Foreign Languages","History","Linguistics and African Languages","Music","Philosophy","Religious Studies","Anatomy and Cell Biology","Haematology and Immunology","Medical Biochemistry","Medical Microbiology and Parasitology","Medical Pharmacology and Therapeutics","Medical Rehabilitation","Morbid Anatomy and Forensic Medicine","Nursing Sciences","Physiological Sciences","Community Health and Nutrition","Dermatology and Venerology","Medicine","Mental Health","Obstetrics, Gynaecology and Perinatology","Ophthalmology","Orthopaedics and Traumatology","Paediatrics and Child Health","Radiology","Surgery","Child Dental Health","Oral and Maxillofacial Surgery and Oral Pathology","Preventive and Community Dentistry","Restorative Dentistry","Architecture","Building","Estate Management","Fine and Applied Arts","Quantity Surveying","Surveying and Geoinformatics","Urban and Regional Planning","Adult Education and Lifelong Learning","Arts and Social Sciences Education","Counselling and Human Development","Educational Foundation and Counseling","Educational Management","Institute of Education","Physical and Health Education","Science and Technology Education","Business Law","International Law","Jurisprudence and Private Law","Public Law","Clinical Pharmacy and Pharmacy Administration","Drug Research and Production Unit","Pharmaceutical Chemistry","Pharmaceutics and Industrial Pharmacy","Pharmacognosy","Pharmacology","Biochemistry","Botany","Chemistry","Geology","Mathematics","Microbiology","Physics","Statistics","Zoology","Demography and Social Statistics","Economics","Geography","Political Science","Psychology","Sociology and Anthropology","African Institute for Science Policy and Innovation","Agricultural and Environmental Engineering","Aerospace Engineering","Chemical Engineering","Civil Engineering","Computer Science and Engineering","Electronic and Electrical Engineering","Food Science and Technology","Materials Science and Engineering","Mechanical Engineering",
].sort((a, b) => a.localeCompare(b));

export default function AuthView({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [gender, setGender] = useState("");
  const [role, setRole] = useState("");
  const [resetStep, setResetStep] = useState("email");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  const resend = async (passwordReset) => {
    setResending(true);
    setMessage("");
    try {
      if (passwordReset) await api.resendPasswordOtp({ email: resetEmail.trim().toLowerCase() });
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
        const result = await api.login({ email: values.email.trim().toLowerCase(), password: values.password });
        if (!result.accessToken) throw new Error("The server did not return a session token. Please try again.");
        saveToken(result.accessToken);
        await onLogin(result.user || (await api.me()));
      } else if (registrationStep === "verify") {
        const result = await api.verifyRegistration({ email: registrationEmail, code: values.code });
        if (!result.accessToken) throw new Error("The server did not return a session token. Please try again.");
        saveToken(result.accessToken);
        await onLogin(result.user || (await api.me()));
      } else {
        if (!values.firstName.trim() || !values.lastName.trim()) throw new Error("Enter your first and last names.");
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
          coursesToTeach: values.coursesToTeach ? values.coursesToTeach.split(",").map((course) => course.trim()).filter(Boolean) : [],
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
        const result = await api.verifyPasswordOtp({ email: resetEmail.trim().toLowerCase(), code: resetCode });
        setResetToken(result.resetToken);
        setResetStep("reset");
      } else {
        if (values.newPassword !== values.confirmPassword) throw new Error("Passwords do not match.");
        await api.resetPassword({ resetToken, newPassword: values.newPassword });
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

  const eyeButtonStyle = {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };

  const eyeIcon = (visible) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {visible ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.53 9.53a3 3 0 104.24 4.24" />
          <path d="M1 1l22 22" />
        </>
      )}
    </svg>
  );

  return (
   