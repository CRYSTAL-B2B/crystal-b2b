"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Script from "next/script";
import { Arrow } from "@/components/ui/Arrow";
import { trackEvent } from "@/lib/analytics";
import { FieldErrors, validateLead } from "@/lib/validation";
import { DEFAULT_PHONE_FLAG, detectCountryFlag } from "@/lib/phoneCountry";

declare global {
  interface Window {
    turnstile?: { reset: (widget?: string | HTMLElement) => void };
  }
}

type FormStatus = "idle" | "sending" | "success" | "error";

interface ContactFormProps {
  qualifiers: string[];
}

export function ContactForm({ qualifiers }: ContactFormProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [started, setStarted] = useState(false);
  const [phoneFlag, setPhoneFlag] = useState(DEFAULT_PHONE_FLAG);

  const markStarted = () => {
    if (!started) {
      setStarted(true);
      trackEvent("contact_start");
    }
  };

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPhoneFlag(detectCountryFlag(event.target.value));
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const raw = {
      name: formData.get("name"),
      contact: formData.get("contact"),
      task: formData.get("task"),
      company: formData.get("company"),
      turnstileToken: formData.get("cf-turnstile-response"),
      qualifiers,
    };
    const validation = validateLead(raw);

    if (!validation.data) {
      setErrors(validation.errors);
      setStatus("error");
      setMessage("Проверьте обязательные поля.");
      trackEvent("contact_error", { reason: "validation" });
      return;
    }

    setErrors({});
    setStatus("sending");
    setMessage("");
    trackEvent("contact_submit");

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });
      const result = await response.json() as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || "Не удалось отправить сообщение.");
      }

      setStatus("success");
      setMessage("Сообщение отправлено. Даниил свяжется с вами после получения заявки.");
      form.reset();
      trackEvent("contact_success");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Не удалось отправить сообщение. Попробуйте позже.");
      trackEvent("contact_error", { reason: "delivery" });
    } finally {
      window.turnstile?.reset();
    }
  }

  return (
    <>
      {started ? (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" async defer />
      ) : null}
      <form className="contact-form" onSubmit={submit} onFocus={markStarted} noValidate>
      <div className="form-field">
        <label htmlFor="name">Имя <span aria-hidden="true">*</span></label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
          placeholder="Как к вам обращаться"
        />
        {errors.name ? <p className="field-error" id="name-error">{errors.name}</p> : null}
      </div>
      <div className="form-field">
        <label htmlFor="contact-method">Номер телефона <span aria-hidden="true">*</span></label>
        <div className="phone-input">
          <span className="phone-flag" aria-hidden="true">{phoneFlag}</span>
          <input
            id="contact-method"
            name="contact"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            onChange={handlePhoneChange}
            aria-invalid={Boolean(errors.contact)}
            aria-describedby={errors.contact ? "contact-error" : undefined}
            placeholder="+7 ___ ___-__-__"
          />
        </div>
        {errors.contact ? <p className="field-error" id="contact-error">{errors.contact}</p> : null}
      </div>
      <div className="form-field form-field-wide">
        <label htmlFor="task">Задача</label>
        <textarea
          id="task"
          name="task"
          rows={4}
          aria-invalid={Boolean(errors.task)}
          aria-describedby={errors.task ? "task-error" : undefined}
          placeholder="Где сейчас узкое место: спрос, лиды, CRM, продажи или аналитика?"
        />
        {errors.task ? <p className="field-error" id="task-error">{errors.task}</p> : null}
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="company">Компания</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      {started ? (
        <div
          className="cf-turnstile"
          data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          data-theme="auto"
        />
      ) : null}
      {errors.turnstileToken ? (
        <p className="field-error" role="alert">{errors.turnstileToken}</p>
      ) : null}
      <div className="form-submit">
        <button className="button button-contact" type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Отправляем…" : "Обсудить задачу"} <Arrow />
        </button>
        <p>Нажимая кнопку, вы передаёте данные для ответа на обращение.</p>
      </div>
      <p className={`form-status form-status-${status}`} role="status" aria-live="polite">
        {message}
      </p>
      </form>
    </>
  );
}
