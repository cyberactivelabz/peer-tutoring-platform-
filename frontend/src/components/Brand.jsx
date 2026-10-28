// The white logo (for dark backgrounds)
const LOGO_WHITE = "/brand/studyconnect-logo.png";
// The black logo (for light backgrounds)
const LOGO_BLACK = "/brand/studyconnect-logo-black.png";

// "inverse" means the logo sits on a dark background.
// "motion" is not used now, but I kept it so your other files do not break.
export default function Brand({ inverse = false, motion = false }) {
  return (
    <span className={`brand ${inverse ? "brand-inverse" : ""}`}>
      <img
        src={inverse ? LOGO_WHITE : LOGO_BLACK}
        alt="StudyConnect"
        style={{ height: "44px", width: "auto", display: "block" }}
      />
    </span>
  );
}