export function GovSectionHeader({ index, title }: { index: string; title: string }) {
  return (
    <div className="gov-section-head">
      <span className="gov-section-index">{index}</span>
      <h2 className="gov-section-title">{title}</h2>
    </div>
  );
}
