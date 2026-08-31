"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/data/site";
import { contactLinks } from "@/data/contacts";
import { Arrow } from "@/components/ui/Arrow";
import { BookingButton } from "@/components/booking/BookingButton";
import { useBooking } from "@/components/booking/BookingProvider";
import { LeadButton } from "@/components/contact/LeadButton";
import { bookingCopy } from "@/data/booking";
import { leadCopy } from "@/data/lead";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Без адреса расписания кнопки записи нет - нумерация пунктов меню сдвигается.
  const { available: bookingAvailable } = useBooking();
  const leadIndex = navigation.length + (bookingAvailable ? 2 : 1);

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
      <Link className="site-mark" href="/#top" aria-label="Даниил Чекулаев - в начало страницы">
        <span>Даниил Чекулаев</span>
      </Link>
      <nav className="desktop-nav" aria-label="Основная навигация">
        {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
      </nav>
      <div className="header-actions">
        <BookingButton placement="header" className="header-book">
          {bookingCopy.action}
        </BookingButton>
        <LeadButton placement="header" className="header-contact" event="navigation_contact">
          {leadCopy.action} <Arrow />
        </LeadButton>
      </div>
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
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              <span>0{index + 1}</span>{item.label}
            </Link>
          ))}
          {/* Меню остаётся открытым под окном: так фокус после закрытия
              возвращается на ту же строку, с которой окно открыли. */}
          <BookingButton placement="menu" className="mobile-menu-item">
            <span>0{navigation.length + 1}</span>{bookingCopy.action}
          </BookingButton>
          <LeadButton placement="menu" className="mobile-menu-item" event="navigation_contact">
            <span>0{leadIndex}</span>{leadCopy.action}
          </LeadButton>
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
