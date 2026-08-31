"use client";

import { ChangeEvent, FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Arrow } from "@/components/ui/Arrow";
import { trackEvent } from "@/lib/analytics";
import { FieldErrors, validateLead } from "@/lib/validation";
import { DEFAULT_PHONE_FLAG, detectCountryFlag } from "@/lib/phoneCountry";

interface TurnstileApi {
  render: (container: HTMLElement, options: { sitekey: string; theme?: string }) => string;
  reset: (widget?: string | HTMLElement) => void;
  remove: (widget: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type FormStatus = "idle" | "sending" | "success" | "error";

interface ContactFormProps {
  qualifiers: string[];
  /** Префикс идентификаторов полей: форма бывает на странице не одна. */
  formId?: string;
  /** Откуда отправлена заявка - уходит в аналитику. */
  placement?: string;
  /** Второе действие рядом с кнопкой отправки. */
  secondaryAction?: ReactNode;
  /** Подпись под кнопками - например, длительность созвона. */
  note?: ReactNode;
}

export function ContactForm({
  qualifiers,
  formId = "contact",
  placement = "contact",
  secondaryAction,
  note,
}: ContactFormProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [started, setStarted] = useState(false);
  const [phoneFlag, setPhoneFlag] = useState(DEFAULT_PHONE_FLAG);
  const turnstileRef = useRef<HTMLDivElement>(null);
  // Идентификатор своего виджета: на странице их может быть два, и сбрасывать
  // нужно именно тот, что принадлежит этой форме.
  const widgetRef = useRef<string | null>(null);

  const markStarted = () => {
    if (!started) {
      setStarted(true);
      trackEvent("contact_start", { placement });
    }
  };

  // Рисуем виджет явно: автоматический режим Turnstile обходит страницу один
  // раз при загрузке и не увидит форму, которая появилась позже - в окне.
  // Скрипт при этом один на страницу, поэтому ждём появления самого api,
  // а не колбэка загрузки: так не важно, какая из форм его подключила.
  useEffect(() => {
    if (!started) return;
    const container = turnstileRef.current;
    const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!container || !sitekey) return;

    let timer = 0;

    const draw = () => {
      if (!window.turnstile || widgetRef.current) return false;
      widgetRef.current = window.turnstile.render(container, { sitekey, theme: "auto" });
      return true;
    };

    if (!draw()) {
      timer = window.setInterval(() => {
        if (draw()) window.clearInterval(timer);
      }, 200);
    }

    return () => {
      window.clearInterval(timer);
      if (!widgetRef.current) return;
      window.turnstile?.remove(widgetRef.current);
      widgetRef.current = null;
    };
  }, [started]);

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
      trackEvent("contact_error", { reason: "validation", placement });
      return;
    }

    setErrors({});
    setStatus("sending");
    setMessage("");
    trackEvent("contact_submit", { placement });

    const webhook = process.env.NEXT_PUBLIC_LEAD_WEBHOOK_URL;
    if (!webhook) {
      setStatus("error");
      setMessage("Канал отправки ещё настраивается. Пожалуйста, попробуйте позже.");
      trackEvent("contact_error", { reason: "no_webhook", placement });
      return;
    }

    try {
      // No server in this build (static export) — posts straight to n8n, same
      // workflow the VPS deployment already uses. n8n's own "Антиспам" node
      // still drops honeypot hits, and the Turnstile secret check happens
      // there too, so this stays safe without a Next.js proxy in front of it.
      const response = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "danil-chekulaev-site",
          placement,
          name: validation.data.name,
          contact: validation.data.contact,
          task: validation.data.task || "",
          company: validation.data.company || "",
          qualifiers: validation.data.qualifiers,
          "cf-turnstile-response": validation.data.turnstileToken,
        }),
        signal: AbortSignal.timeout(8_000),
      });

      if (!response.ok) {
        throw new Error("Сервис не подтвердил доставку. Попробуйте ещё раз.");
      }

      setStatus("success");
      setMessage("Сообщение отправлено. Даниил свяжется с вами после получения заявки.");
      form.reset();
      trackEvent("contact_success", { placement });
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Не удалось отправить сообщение. Попробуйте позже.");
      trackEvent("contact_error", { reason: "delivery", placement });
    } finally {
      if (widgetRef.current) window.turnstile?.reset(widgetRef.current);
    }
  }

  return (
    <>
      {started ? (
        <Script
          id="cf-turnstile-api"
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          async
          defer
        />
      ) : null}
      <form className="contact-form" onSubmit={submit} onFocus={markStarted} noValidate>
      <div className="form-field">
        <label htmlFor={`${formId}-name`}>Имя <span aria-hidden="true">*</span></label>
        <input
          id={`${formId}-name`}
          name="name"
          type="text"
          autoComplete="name"
          required
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${formId}-name-error` : undefined}
          placeholder="Как к вам обращаться"
        />
        {errors.name ? <p className="field-error" id={`${formId}-name-error`}>{errors.name}</p> : null}
      </div>
      <div className="form-field">
        <label htmlFor={`${formId}-phone`}>Номер телефона <span aria-hidden="true">*</span></label>
        <div className="phone-input">
          <span className="phone-flag" aria-hidden="true">{phoneFlag}</span>
          <input
            id={`${formId}-phone`}
            name="contact"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            onChange={handlePhoneChange}
            aria-invalid={Boolean(errors.contact)}
            aria-describedby={errors.contact ? `${formId}-contact-error` : undefined}
            placeholder="+7 ___ ___-__-__"
          />
        </div>
        {errors.contact ? <p className="field-error" id={`${formId}-contact-error`}>{errors.contact}</p> : null}
      </div>
      <div className="form-field form-field-wide">
        <label htmlFor={`${formId}-task`}>Задача</label>
        <textarea
          id={`${formId}-task`}
          name="task"
          rows={4}
          aria-invalid={Boolean(errors.task)}
          aria-describedby={errors.task ? `${formId}-task-error` : undefined}
          placeholder="Где сейчас узкое место: спрос, лиды, CRM, продажи или аналитика?"
        />
        {errors.task ? <p className="field-error" id={`${formId}-task-error`}>{errors.task}</p> : null}
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor={`${formId}-company`}>Компания</label>
        <input id={`${formId}-company`} name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="cf-turnstile" ref={turnstileRef} />
      {errors.turnstileToken ? (
        <p className="field-error" role="alert">{errors.turnstileToken}</p>
      ) : null}
      <div className="form-submit">
        <div className="form-submit-actions">
          <button className="button button-contact" type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Отправляем…" : "Обсудить задачу"} <Arrow />
          </button>
          {secondaryAction}
        </div>
        <p>
          Нажимая кнопку, вы передаёте данные для ответа на обращение.
          {note ? <> {note}</> : null}
        </p>
      </div>
      <p className={`form-status form-status-${status}`} role="status" aria-live="polite">
        {message}
      </p>
      </form>
    </>
  );
}
