import { SectionLabel } from "@/components/ui/SectionLabel";

type EditorialBridgeProps = {
  id?: string;
  index: string;
  label: string;
  title: React.ReactNode;
  body: React.ReactNode;
  dark?: boolean;
};

export function EditorialBridge({ id, index, label, title, body, dark = false }: EditorialBridgeProps) {
  return (
    <section
      id={id}
      className={`editorial-bridge${dark ? " editorial-bridge-dark" : ""}`}
      data-plate={index}
    >
      <div className="container">
        <SectionLabel index={index}>{label}</SectionLabel>
        <div className="editorial-bridge-grid">
          <h2>{title}</h2>
          <p>{body}</p>
        </div>
      </div>
    </section>
  );
}
