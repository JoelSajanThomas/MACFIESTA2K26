import ScrollReveal from "./ScrollReveal";

export default function SectionHeading({ eyebrow, title, subtitle, align = "center" }) {
  return (
    <ScrollReveal className={`section-heading align-${align}`}>
      {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </ScrollReveal>
  );
}
