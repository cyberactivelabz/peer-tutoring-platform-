import React from "react";

export default function SafetyGuidance() {
  return (
    <section className="safety-card" aria-labelledby="safety-title">
      <style>{`
        .safety-card {
          margin: 24px 0;
          padding: 24px;
          border: 1px solid #d7e8df;
          border-radius: 16px;
          background: #f4faf6;
          color: #20382b;
          font-family: inherit;
        }

        .safety-card .safety-label {
          display: inline-block;
          margin-bottom: 10px;
          color: #28734b;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .safety-card h2 {
          margin: 0 0 8px;
          font-size: 21px;
        }

        .safety-card p {
          line-height: 1.6;
        }

        .safety-card details {
          margin-top: 16px;
          border-top: 1px solid #d7e8df;
          padding-top: 14px;
        }

        .safety-card summary {
          cursor: pointer;
          font-weight: 700;
          color: #216b43;
        }

        .safety-card li {
          margin: 10px 0;
          line-height: 1.6;
        }

        .safety-card .safety-note {
          margin-bottom: 0;
          font-size: 13px;
          color: #52665a;
        }
      `}</style>

      <span className="safety-label">CampusConnect · Student wellbeing</span>

      <h2 id="safety-title">
        Study safely, learn confidently.
      </h2>

      <p>
        Good learning starts with mutual respect. Take a few
        simple precautions when meeting a study partner or tutor.
      </p>

      <details>
        <summary>View your study-session safety checklist</summary>

        <ul>
          <li>
            <strong>Choose a suitable place.</strong>{" "}
            Meet in a familiar, public campus location where
            other people are around.
          </li>
          <li>
            <strong>Let someone know.</strong>{" "}
            Tell a trusted friend where you are meeting and
            when you expect to finish.
          </li>
          <li>
            <strong>Protect your privacy.</strong>{" "}
            Share only the personal information necessary
            to arrange your study session.
          </li>
          <li>
            <strong>Respect boundaries.</strong>{" "}
            Either person can decline a meeting or leave
            if they feel uncomfortable.
          </li>
          <li>
            <strong>Speak up when necessary.</strong>{" "}
            If you experience harassment or feel unsafe,
            end the meeting and contact an appropriate
            campus support service or security office.
          </li>
        </ul>

        <p className="safety-note">
          These are general safety recommendations. This card
          does not submit reports or verify another student's identity.
        </p>
      </details>
    </section>
  );
}
