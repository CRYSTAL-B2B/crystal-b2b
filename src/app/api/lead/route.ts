import { NextRequest, NextResponse } from "next/server";
import { validateLead } from "@/lib/validation";

type RateBucket = { count: number; resetAt: number };

const buckets = new Map<string, RateBucket>();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 5;

function clientAddress(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT;
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 12_000) {
    return NextResponse.json({ message: "Слишком большой запрос." }, { status: 413 });
  }

  if (isRateLimited(clientAddress(request))) {
    return NextResponse.json(
      { message: "Слишком много попыток. Попробуйте ещё раз через несколько минут." },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Некорректный формат запроса." }, { status: 400 });
  }

  const raw = typeof payload === "object" && payload !== null ? payload as Record<string, unknown> : {};

  // Honeypot: automated submissions receive an indistinguishable success response.
  if (typeof raw.company === "string" && raw.company.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const validation = validateLead(payload);
  if (!validation.data) {
    return NextResponse.json(
      { message: "Проверьте обязательные поля.", errors: validation.errors },
      { status: 400 },
    );
  }

  const webhook = process.env.LEAD_WEBHOOK_URL?.trim();
  if (!webhook) {
    return NextResponse.json(
      { message: "Канал отправки ещё настраивается. Пожалуйста, попробуйте позже." },
      { status: 503 },
    );
  }

  let endpoint: URL;
  try {
    endpoint = new URL(webhook);
    if (endpoint.protocol !== "https:") throw new Error("HTTPS required");
  } catch {
    return NextResponse.json(
      { message: "Канал отправки временно недоступен." },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "danil-chekulaev-site",
        name: validation.data.name,
        contact: validation.data.contact,
        task: validation.data.task || "",
        qualifiers: validation.data.qualifiers,
        "cf-turnstile-response": validation.data.turnstileToken,
      }),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Сервис не подтвердил доставку. Данные сохранены в форме - попробуйте ещё раз." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "Не удалось подтвердить доставку. Данные сохранены в форме - попробуйте позже." },
      { status: 502 },
    );
  }
}
