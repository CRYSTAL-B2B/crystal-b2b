"use client";

import { useEffect, useRef, useState } from "react";
import { navigation } from "@/data/site";
import { contactLinks } from "@/data/contacts";
import { trackEvent } from "@/lib/analytics";
import { Arrow } from "@/components/ui/Arrow";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 12);
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.dataset.navigationOpen = "true";
    const firstLink = menuRef.current?.querySelector<HTMLAnchorElement>("a");
    firstLink?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      delete document.body.dataset.navigationOpen;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className="site-header" data-open={open} data-scrolled={scrolled}>
      <a className="site-mark" href="#top" aria-label="Даниил Чекулаев - в начало страницы">
        <span>Даниил Чекулаев</span>
      </a>
      <nav className="desktop-nav" aria-label="Основная навигация">
        {navigation.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
      </nav>
      <a
        className="header-contact"
        href="#contact"
        onClick={() => trackEvent("navigation_contact")}
      >
        Обсудить задачу <Arrow />
      </a>
      <button
        ref={buttonRef}
        className="menu-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span>{open ? "Закрыть" : "Меню"}</span>
        <i aria-hidden="true" />
      </button>
      <div id="mobile-menu" className="mobile-menu" ref={menuRef} aria-hidden={!open} inert={!open}>
        <nav aria-label="Мобильная навигация">
          {navigation.map((item, index) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              <span>0{index + 1}</span>{item.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => {
              trackEvent("navigation_contact");
              setOpen(false);
            }}
          >
            <span>05</span>Обсудить задачу
          </a>
        </nav>
        <div className="mobile-menu-contacts">
          {contactLinks.map((contact) => (
            <a key={contact.href} href={contact.href}>{contact.label}</a>
          ))}
        </div>
      </div>
    </header>
  );
}
