type DiagnosticMarker = {
  id: string;
  label: string;
  title: string;
  note: string;
  x: number;
  y: number;
};

type DiagnosticScore = {
  label: string;
  value: string;
  note: string;
};

type DiagnosticEvidenceBoardProps = {
  brandName: string;
  websiteLabel: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  cta: string;
  frameLabels?: {
    offer: string;
    proof: string;
    cta: string;
    decision: string;
  };
  markers: DiagnosticMarker[];
  scores: DiagnosticScore[];
  verdicts?: string[];
  compact?: boolean;
  className?: string;
};

export default function DiagnosticEvidenceBoard({
  brandName,
  websiteLabel,
  eyebrow,
  headline,
  subheadline,
  cta,
  frameLabels = {
    offer: "Offer",
    proof: "Proof",
    cta: "CTA",
    decision: "Decision",
  },
  markers,
  scores,
  verdicts = [],
  compact = false,
  className = "",
}: DiagnosticEvidenceBoardProps) {
  return (
    <div
      className={`diagnostic-board ${compact ? "diagnostic-board-compact" : ""} ${className}`.trim()}
    >
      <div className="diagnostic-board-chrome">
        <div className="flex items-center gap-2">
          <span className="diagnostic-dot" />
          <span className="diagnostic-dot" />
          <span className="diagnostic-dot" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-[rgba(22,18,14,0.48)]">
          {websiteLabel}
        </p>
      </div>

      <div className="diagnostic-board-canvas">
        <div className="diagnostic-board-grid" />
        <div className="diagnostic-site-frame">
          <div className="diagnostic-site-top">
            <p className="text-[11px] uppercase tracking-[0.26em] text-[rgba(248,242,233,0.6)]">
              {brandName}
            </p>
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[rgba(248,242,233,0.5)]">
              <span>{frameLabels.offer}</span>
              <span>{frameLabels.proof}</span>
              <span>{frameLabels.cta}</span>
            </div>
          </div>
          <div className="diagnostic-site-body">
            <div className="max-w-[18rem]">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[rgba(248,242,233,0.52)]">
                {eyebrow}
              </p>
              <h3 className="mt-3 font-serif text-[clamp(2.2rem,5vw,4rem)] leading-[0.92] tracking-[-0.05em] text-[#f8f2e9]">
                {headline}
              </h3>
              <p className="mt-4 max-w-[15rem] text-sm leading-6 text-[rgba(248,242,233,0.7)]">
                {subheadline}
              </p>
              <span className="mt-5 inline-flex rounded-full border border-[rgba(248,242,233,0.14)] bg-[rgba(248,242,233,0.08)] px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-[#f8f2e9]">
                {cta}
              </span>
            </div>

            <div className="diagnostic-proof-zone">
              <div className="diagnostic-proof-card">
                <p className="text-[9px] uppercase tracking-[0.18em] text-[rgba(248,242,233,0.48)]">
                  {frameLabels.proof}
                </p>
                <div className="mt-3 space-y-2">
                  <div className="h-2 rounded-full bg-[rgba(248,242,233,0.18)]" />
                  <div className="h-2 w-4/5 rounded-full bg-[rgba(248,242,233,0.1)]" />
                  <div className="h-2 w-3/5 rounded-full bg-[rgba(248,242,233,0.08)]" />
                </div>
              </div>
              <div className="diagnostic-proof-card">
                <p className="text-[9px] uppercase tracking-[0.18em] text-[rgba(248,242,233,0.48)]">
                  {frameLabels.decision}
                </p>
                <div className="mt-3 h-20 rounded-[1rem] border border-[rgba(248,242,233,0.08)] bg-[rgba(248,242,233,0.04)]" />
              </div>
            </div>
          </div>
        </div>

        {markers.slice(0, compact ? 2 : 3).map((marker, index) => (
          <div
            key={marker.id}
            className="diagnostic-marker"
            style={{
              left: `${marker.x}%`,
              top: `${marker.y}%`,
              transform: index === 1 ? "translate(-100%, -12%)" : "translate(0, -12%)",
            }}
          >
            <div className={`flex gap-3 ${index === 1 ? "flex-row-reverse text-right" : ""}`}>
              <span className="diagnostic-marker-index">0{index + 1}</span>
              <div className={`flex flex-col gap-2 ${index === 1 ? "items-end" : "items-start"}`}>
                <span className="h-8 w-px bg-[linear-gradient(180deg,rgba(248,242,233,0.7),rgba(248,242,233,0.08))]" />
                <div className="diagnostic-marker-card">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-[rgba(248,242,233,0.52)]">
                    {marker.label}
                  </p>
                  <h4
                    className="mt-1.5 font-serif text-lg leading-[0.98] tracking-[-0.04em] text-[#f8f2e9]"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {marker.title}
                  </h4>
                  <p
                    className="mt-1.5 text-[11px] leading-5 text-[rgba(248,242,233,0.72)]"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {marker.note}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="diagnostic-board-footer">
        <div className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
          {scores.slice(0, compact ? 2 : 3).map((score) => (
            <div key={score.label} className="diagnostic-score-row">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[rgba(22,18,14,0.46)]">
                {score.label}
              </p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <p className="font-serif text-4xl leading-none tracking-[-0.06em] text-[color:var(--foreground)]">
                  {score.value}
                </p>
                <p className="max-w-[10rem] text-right text-xs leading-5 text-[color:var(--foreground-soft)]">
                  {score.note}
                </p>
              </div>
            </div>
          ))}
        </div>

        {verdicts.length > 0 ? (
          <div className="editorial-rule mt-4 grid gap-3 pt-4 sm:grid-cols-3">
            {verdicts.slice(0, 3).map((item) => (
              <p
                key={item}
                className="text-xs uppercase tracking-[0.18em] text-[color:var(--foreground-soft)]"
              >
                {item}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
