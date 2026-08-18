import { describe, expect, it } from "vitest";
import { validateLead } from "./validation";

describe("validateLead", () => {
  it("accepts a valid lead and normalizes whitespace", () => {
    const result = validateLead({
      name: "  Анна   Петрова ",
      contact: " +7 999 123-45-67 ",
      task: " Нужна CRM-стратегия ",
      turnstileToken: "test-token",
      qualifiers: ["ПОСТРОИТЬ СИСТЕМУ"],
    });

    expect(result.errors).toEqual({});
    expect(result.data).toEqual({
      name: "Анна Петрова",
      contact: "+7 999 123-45-67",
      task: "Нужна CRM-стратегия",
      company: "",
      turnstileToken: "test-token",
      qualifiers: ["ПОСТРОИТЬ СИСТЕМУ"],
    });
  });

  it("rejects missing required fields", () => {
    const result = validateLead({ name: "", contact: "" });
    expect(result.data).toBeUndefined();
    expect(result.errors.name).toBeTruthy();
    expect(result.errors.contact).toBeTruthy();
  });

  it("rejects a malformed phone number", () => {
    const result = validateLead({
      name: "Анна",
      contact: "not-a-phone",
      turnstileToken: "test-token",
    });
    expect(result.errors.contact).toBeTruthy();
  });

  it("rejects a phone number that is too short", () => {
    const result = validateLead({
      name: "Анна",
      contact: "+7 999",
      turnstileToken: "test-token",
    });
    expect(result.errors.contact).toBeTruthy();
  });

  it("rejects oversized task text", () => {
    const result = validateLead({
      name: "Анна",
      contact: "+7 999 123-45-67",
      task: "x".repeat(2001),
      turnstileToken: "test-token",
    });
    expect(result.errors.task).toBeTruthy();
  });

  it("rejects a missing turnstile token", () => {
    const result = validateLead({ name: "Анна", contact: "+7 999 123-45-67" });
    expect(result.errors.turnstileToken).toBeTruthy();
  });

  it("defaults qualifiers to an empty array when omitted", () => {
    const result = validateLead({
      name: "Анна",
      contact: "+7 999 123-45-67",
      turnstileToken: "test-token",
    });
    expect(result.data?.qualifiers).toEqual([]);
  });
});
