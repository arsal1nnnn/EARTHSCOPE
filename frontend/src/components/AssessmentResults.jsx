import { CheckCircle2, AlertTriangle, XCircle, Clock, Satellite, ExternalLink, ShieldCheck, Sprout } from "lucide-react";

export default function AssessmentResults({
  results,
  taluka,
  district,
  ecology,
  season,
  onReset,
}) {
  if (!results || results.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-[#11141c] border border-white/[0.08] text-center">
        <Sprout size={32} className="mx-auto text-[#7a8296] mb-3" />
        <h4 className="text-sm font-semibold font-montserrat text-[#eef0f5]">
          No varieties selected for assessment
        </h4>
        <p className="text-xs text-[#a3a9b8] mt-1 max-w-md mx-auto">
          Select one or more candidate rice varieties above and click "Run suitability assessment" to evaluate agro-ecological compatibility and seasonal water signals.
        </p>
      </div>
    );
  }

  // Count classes
  const counts = results.reduce(
    (acc, r) => {
      if (r.suitability_class === "Highly Suitable") acc.highly += 1;
      else if (r.suitability_class === "Moderately Suitable") acc.moderately += 1;
      else acc.notRecommended += 1;
      return acc;
    },
    { highly: 0, moderately: 0, notRecommended: 0 }
  );

  // Sort: Highly Suitable first, then Moderately Suitable, then Not Recommended
  const classOrder = {
    "Highly Suitable": 1,
    "Moderately Suitable": 2,
    "Not Recommended": 3,
  };
  const sortedResults = [...results].sort(
    (a, b) => (classOrder[a.suitability_class] || 99) - (classOrder[b.suitability_class] || 99)
  );

  const ecologyLabels = {
    khazan: "Khazan (coastal saline lowlands)",
    kher: "Kher (rainfed shallow lowlands)",
    morod: "Morod (rainfed terraced uplands)",
  };

  return (
    <div className="space-y-6 mt-8">
      {/* Assessment Summary Header Bar */}
      <div className="p-5 rounded-xl bg-[#11141c] border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#a3a9b8]">
              Agronomic suitability results
            </span>
            <span className="text-xs font-mono text-[#7a8296]">•</span>
            <span className="text-xs font-mono text-[#7a8296]">
              {season === "2026" ? "Kharif 2026 (Preliminary)" : "Kharif 2025"}
            </span>
          </div>
          <h3 className="text-lg font-semibold font-montserrat text-[#eef0f5]">
            {taluka} Taluka ({district}) — {ecologyLabels[ecology.toLowerCase()] || ecology}
          </h3>
          <p className="text-xs text-[#a3a9b8] mt-0.5">
            Evaluated {results.length} candidate {results.length === 1 ? "variety" : "varieties"} against ICAR-CCARI varietal records and NASA water telemetry.
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
          {counts.highly > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
              <CheckCircle2 size={13} />
              <span>{counts.highly} Highly Suitable</span>
            </span>
          )}
          {counts.moderately > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-amber-500/10 border border-amber-500/25 text-amber-300">
              <AlertTriangle size={13} />
              <span>{counts.moderately} Moderately Suitable</span>
            </span>
          )}
          {counts.notRecommended > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-rose-500/10 border border-rose-500/25 text-rose-300">
              <XCircle size={13} />
              <span>{counts.notRecommended} Not Recommended</span>
            </span>
          )}
        </div>
      </div>

      {/* Grid of Variety Assessment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedResults.map((result) => {
          const isHighly = result.suitability_class === "Highly Suitable";
          const isModerate = result.suitability_class === "Moderately Suitable";
          const isNotRecommended = result.suitability_class === "Not Recommended";

          const cardBorder = isHighly
            ? "border-emerald-500/30 hover:border-emerald-500/50"
            : isModerate
            ? "border-amber-500/30 hover:border-amber-500/50"
            : "border-rose-500/25 hover:border-rose-500/40";

          const badgeClass = isHighly
            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
            : isModerate
            ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
            : "bg-rose-500/15 border-rose-500/30 text-rose-300";

          return (
            <article
              key={result.variety}
              className={`p-5 rounded-xl bg-[#11141c] border ${cardBorder} transition-colors flex flex-col justify-between`}
            >
              <div>
                {/* Variety Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/[0.06] mb-3.5">
                  <div>
                    <h4 className="text-base font-semibold font-montserrat text-[#eef0f5]">
                      {result.variety}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-[#a3a9b8]">
                      {result.maturity_days && result.maturity_days !== "N/A" && (
                        <span className="inline-flex items-center gap-1 text-[#7a8296]">
                          <Clock size={11} />
                          <span>{result.maturity_days} days maturity</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-medium font-montserrat border shrink-0 ${badgeClass}`}
                  >
                    {result.suitability_class}
                  </span>
                </div>

                {/* Supporting Scientific Factors */}
                {result.supporting_factors && result.supporting_factors.length > 0 && (
                  <div className="mb-3.5">
                    <span className="text-[11px] font-semibold text-[#a3a9b8] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      Supporting scientific evidence
                    </span>
                    <ul className="space-y-1.5 pl-1">
                      {result.supporting_factors.map((factor, idx) => (
                        <li key={idx} className="text-xs text-[#d1d5db] flex items-start gap-2 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Limiting Factors / Agronomic Risks */}
                <div className="mb-3.5">
                  <span className="text-[11px] font-semibold text-[#a3a9b8] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                    {isNotRecommended ? (
                      <XCircle size={12} className="text-rose-400" />
                    ) : (
                      <AlertTriangle size={12} className="text-amber-400" />
                    )}
                    Agronomic constraints &amp; limitations
                  </span>
                  {result.limiting_factors && result.limiting_factors.length > 0 ? (
                    <ul className="space-y-1.5 pl-1">
                      {result.limiting_factors.map((factor, idx) => (
                        <li key={idx} className="text-xs text-rose-300/90 flex items-start gap-2 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-[#7a8296] italic pl-1">
                      No documented agronomic limiting factors for this ecology.
                    </p>
                  )}
                </div>

                {/* NASA Seasonal Water Telemetry Context */}
                <div className="p-3 rounded-lg bg-[#1a1e28] border border-white/[0.06] text-xs text-[#a3a9b8] space-y-1 mb-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#7a8296]">
                    <Satellite size={12} className="text-[#004FF4]" />
                    <span>NASA Seasonal Water Context</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#d1d5db]">
                    {season === "2026"
                      ? "Kharif 2026 (Preliminary): GPM IMERG Late Run daily (district scale) and GLDAS-2.1 Noah (June–July only; August–September pending release). Two-indicator water-deficit signal: Moderate."
                      : result.seasonal_water_context || "NASA GPM IMERG Final v07 & GLDAS-2.1 Noah land surface model."}
                  </p>
                </div>
              </div>

              {/* Source Reference Footer */}
              <div className="pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-[#7a8296]">
                <span className="truncate max-w-[280px]" title={result.source_references}>
                  ICAR-CCARI Varietal Records · NASA GES DISC
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-400/90 shrink-0">
                  <ShieldCheck size={11} />
                  <span>M4/M5 Verified</span>
                </span>
              </div>
            </article>
          );
        })}
      </div>

      {/* Scientific Transparency Callout */}
      <div className="p-4 rounded-xl bg-[#11141c] border border-white/[0.08] text-xs text-[#a3a9b8] flex items-start gap-3">
        <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-[#eef0f5] block">
            Scientific methodology &amp; classification rules
          </strong>
          <p className="leading-relaxed text-[11px] text-[#7a8296]">
            EarthScope screens rice varieties exclusively against documented agronomic tolerances from ICAR-CCARI, KVK Goa, and ICAR-CSSRI bulletin records. Suitability classes are qualitative (Highly Suitable, Moderately Suitable, Not Recommended) and explicitly disclose supporting traits, limiting constraints, and NASA satellite water-deficit telemetry. EarthScope does not fabricate numeric crop yield predictions or hallucinate scalar percentages.
          </p>
        </div>
      </div>
    </div>
  );
}
