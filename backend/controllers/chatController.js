import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SPECIALITIES = [
  "General physician",
  "Gynecologist",
  "Dermatologist",
  "Pediatricians",
  "Neurologist",
  "Gastroenterologist",
];

const SYSTEM_INSTRUCTION = `You are "Presi", the friendly support assistant on Prescripto, a doctor appointment booking website in India.

WHAT PRESCRIPTO DOES:
- Patients browse verified doctors, filter by speciality, and book appointment slots online.
- Payments are made securely online via Razorpay (UPI, cards, netbanking) at the time of booking.
- Patients manage their bookings from the "My Appointments" page (view, pay, or cancel).
- Available specialities on the platform are exactly: ${SPECIALITIES.join(", ")}.
- Support contact: support@prescripto.com, +91 98765 43210 (Mon–Sat, 9am–6pm).

YOUR TWO JOBS:
1. Answer general questions about using the site (how to book, how payment works, how to cancel, how to find a doctor, account/profile questions, etc).
2. When a patient describes symptoms or health concerns, suggest which ONE speciality from the list above they should book, with a one-line reason. Then tell them they can find matching doctors on the "Doctors" page filtered by that speciality.

STRICT RULES:
- You are NOT a doctor. Never diagnose a condition, never recommend medication, dosages, or treatment. Only point to the right speciality.
- Only ever recommend specialities from the exact list above — never invent a speciality that isn't in that list. If nothing fits well, recommend "General physician" as the safe default.
- If symptoms sound urgent or severe (e.g. chest pain, difficulty breathing, severe bleeding, stroke signs, suicidal thoughts), tell the person to seek emergency care immediately (call local emergency services) instead of booking a routine appointment.
- Keep replies short — 2-4 sentences, friendly and clear. No markdown headers or bullet walls; plain conversational text.
- If you don't know something about the platform, say so honestly and point them to support@prescripto.com instead of guessing.`;

const chatWithBot = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.json({ success: false, message: "Message is required" });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ success: false, message: "Chatbot is not configured yet" });
    }

    // Cap message length — this is a support/triage bot, not a document
    // pipeline, so anything beyond ~1000 chars is either abuse or noise
    // that just burns tokens for no benefit.
    const trimmedMessage = message.trim().slice(0, 1000);

    // history: [{ role: "user"|"bot", text: "..." }, ...] from the client.
    // 6 turns (3 back-and-forths) is plenty of context for a short FAQ/triage
    // bot and keeps the request payload — and therefore latency and cost —
    // smaller than the previous 10-turn window.
    const contents = Array.isArray(history)
      ? history
          .filter((h) => h && h.text)
          .slice(-6)
          .map((h) => ({
            role: h.role === "bot" ? "model" : "user",
            parts: [{ text: String(h.text).slice(0, 1000) }],
          }))
      : [];

    contents.push({ role: "user", parts: [{ text: trimmedMessage }] });

    // Hard timeout so a stalled upstream call can't hold the connection open
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          maxOutputTokens: 300,
          temperature: 0.4,
          // Disable Gemini 2.5 Flash's internal "thinking" pass. Replies here
          // are short, conversational FAQ/triage answers that don't need
          // multi-step reasoning — thinking tokens only add latency and cost.
          thinkingConfig: { thinkingBudget: 0 },
          abortSignal: controller.signal,
        },
      });
    } finally {
      clearTimeout(timeout);
    }

    const reply = response.text?.trim();
    if (!reply) {
      return res.json({ success: false, message: "No response from chatbot" });
    }

    res.json({ success: true, reply });
  } catch (error) {
    console.error("Chatbot error:", error.message);
    res.json({ success: false, message: "Chatbot is temporarily unavailable" });
  }
};

export { chatWithBot };
