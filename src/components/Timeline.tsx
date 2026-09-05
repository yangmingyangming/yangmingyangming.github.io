import { Plus } from "lucide-react";
import type { TimelineEntry } from "../data/portfolio";

type TimelineProps = {
  entries: TimelineEntry[];
  label: string;
};

export default function Timeline({ entries, label }: TimelineProps) {
  return (
    <div className="timeline" aria-label={label}>
      {entries.map((entry) => (
        <details className="timeline-item" key={`${entry.organization}-${entry.period}`} open data-reveal>
          <summary>
            <span className="timeline-period">{entry.period}</span>
            <span className="timeline-organization">{entry.organization}</span>
            <span className="timeline-role">{entry.role}</span>
            <span className="timeline-toggle" aria-hidden="true"><Plus size={22} /></span>
          </summary>
          <div className="timeline-content">
            <ul className="timeline-points">
              {entry.points.map((point) => (
                <li key={`${point.label ?? "detail"}-${point.content}`}>
                  {point.label && <strong>{point.label}：</strong>}
                  <span>{point.content}</span>
                </li>
              ))}
            </ul>
          </div>
        </details>
      ))}
    </div>
  );
}
