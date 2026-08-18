export function SectionLabel({ children, index }: { children: React.ReactNode; index?: string }) {
  return (
    <div className="section-label">
      {index ? <span aria-hidden="true">{index}</span> : null}
      <p>{children}</p>
    </div>
  );
}
