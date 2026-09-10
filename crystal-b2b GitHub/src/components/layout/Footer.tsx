import { contactLinks } from "@/data/contacts";
import { ContactIcon } from "@/components/ui/ContactIcon";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-identity">
        <p>Даниил Чекулаев</p>
        <p className="site-footer-contacts">
          {contactLinks.map((contact) => (
            <a key={contact.href} href={contact.href}>
              <ContactIcon name={contact.icon} />{contact.label}
            </a>
          ))}
        </p>
      </div>
      <p>© {new Date().getFullYear()}</p>
    </footer>
  );
}
