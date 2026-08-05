import { SAMPLE_GENDER_DISTRIBUTION } from "../../utils/pageContent";

export default function GenderDistributionChart() {
  return (
    <div className="gender-dist-panel">
      <h3 className="insights-subtitle">Gender Distribution</h3>
      <p className="sample-data-note">Sample illustrative data — gender is not collected on registrations.</p>
      <div className="gender-dist-bars">
        {SAMPLE_GENDER_DISTRIBUTION.map((row) => (
          <div key={row.label} className="gender-dist-row">
            <span className="gender-dist-label">{row.label}</span>
            <div className="gender-dist-track">
              <div className="gender-dist-fill" style={{ width: `${row.value}%` }} />
            </div>
            <span className="gender-dist-pct">{row.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
