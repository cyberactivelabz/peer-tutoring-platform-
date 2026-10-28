// The round S logo (it will spin)
const MARK = "/brand/studyconnect-mark-white.png";
// The words "StudyConnect" (they stay still)
const WORDS = "/brand/studyconnect-words-white.png";

// This tells the browser how to spin the logo.
// It turns one full circle, again and again, forever.
const spinStyles = `
  @keyframes studyconnect-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .sc-mark {
    animation: studyconnect-spin 6s linear infinite;
  }
  /* If the phone asks for less motion, do not spin */
  @media (prefers-reduced-motion: reduce) {
    .sc-mark { animation: none; }
  }
`;

// "inverse" means the logo sits on a dark background.
// "motion" is not used now, but I kept it so your other files do not break.
export default function Brand({ inverse = false, motion = false }) {
  // White logo on dark background. Black logo on light background.
  const colorStyle = inverse ? {} : { filter: "brightness(0)" };

  return (
    <span
      className={`brand ${inverse ? "brand-inverse" : ""}`}
      style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}
    >
      <style>{spinStyles}</style>

      <img
        className="sc-mark"
        src={MARK}
        alt=""
        aria-hidden="true"
        style={{ height: "40px", width: "40px", ...colorStyle }}
      />

      <img
        src={WORDS}
        alt="StudyConnect"
        style={{ height: "22px", width: "auto", ...colorStyle }}
      />
    </span>
  );
}