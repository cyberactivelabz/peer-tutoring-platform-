import { useEffect, useRef, useState } from "react";

const MARK = "/brand/studyconnect-mark.webp";
const POSTER = "/brand/studyconnect-motion-poster.webp";
const MOTION = "/brand/studyconnect-motion.mp4";

function LogoMark({ motion }) {
  const videoRef = useRef(null);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!motion) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = navigator.connection;
    const update = () =>
      setMotionAllowed(!preference.matches && !connection?.saveData);
    update();
    preference.addEventListener("change", update);
    connection?.addEventListener?.("change", update);
    return () => {
      preference.removeEventListener("change", update);
      connection?.removeEventListener?.("change", update);
    };
  }, [motion]);

  const playing = motion && motionAllowed && !finished;
  useEffect(() => {
    const video = videoRef.current;
    if (!playing || !video) return;
    let visible = true;
    let active = true;
    const update = () => {
      if (visible && document.visibilityState === "visible") {
        video.play().catch(() => {
          if (active) setFinished(true);
        });
      } else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(video);
    document.addEventListener("visibilitychange", update);
    return () => {
      active = false;
      video.pause();
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [playing]);

  return (
    <>
      <span
        className={`logo-symbol ${motion ? "logo-symbol-motion" : ""}`}
        aria-hidden="true"
      >
        <img
          src={motion ? POSTER : MARK}
          alt=""
          width="48"
          height="48"
          decoding="async"
        />
        {playing && (
          <video
            ref={videoRef}
            src={MOTION}
            poster={POSTER}
            muted
            playsInline
            preload="metadata"
            tabIndex={-1}
            disablePictureInPicture
            onEnded={() => setFinished(true)}
            onError={() => setMotionAllowed(false)}
          />
        )}
      </span>
    </>
  );
}

export default function Brand({ inverse = false, motion = false }) {
  return (
    <span
      className={`brand ${inverse ? "brand-inverse" : ""} ${motion ? "brand-motion" : ""}`}
    >
      <LogoMark motion={motion} />
      <span className="brand-wordmark">
        <strong>Study</strong>
        <span>Connect</span>
      </span>
    </span>
  );
}