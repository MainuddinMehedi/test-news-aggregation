import crypto from "crypto";

export function hashSnippet(text) {
  if (!text) return null;

  const cleaned = text.toLowerCase().replace(/\s+/g, " ").trim();

  return crypto.createHash("sha256").update(cleaned).digest("hex");
}
