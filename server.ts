import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "5mb" }));
  const PORT = Number(process.env.PORT) || 3001;

  // Initialize Gemini SDK with telemetry header
  const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API Endpoint to generate storyboard using Gemini 3.6 Flash
  app.post("/api/generate-storyboard", async (req, res) => {
    try {
      const { message, tone = "Romance", visualTheme = "Pastel Dream", visualMood = "floating_hearts", sceneCount = 5 } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Personal message is required." });
      }

      const ai = getAi();
      if (!ai) {
        console.error("GEMINI_API_KEY is missing.");
        return res.status(500).json({ error: "API Key configuration is missing on the server. Please contact support." });
      }

      const prompt = `Turn the following personal message into a beautiful ${sceneCount}-scene narrated animated video storyboard in JSON format.
Tone requested: ${tone}
Visual Theme: ${visualTheme}
Primary Visual Mood: ${visualMood}

Message:
"${message}"

Instructions:
1. Craft an evocative title and subtitle.
2. Divide the story into exactly ${sceneCount} sequential scenes that capture the emotional beats.
3. Each scene must have narrationText (1-2 sentences of rhythmic, spoken narration line), a visualMood chosen from ['starlight', 'falling_petals', 'rain', 'sunrise', 'fireflies', 'floating_hearts', 'aurora', 'soft_bokeh', 'autumn_breeze'], duration between 8 and 14 seconds, emotionPrompt, a valid CSS gradient string for bgGradient (e.g. "linear-gradient(to bottom, #fce7f3, #fbcfe8)"), a hex accent color, and a short memorable keyQuote.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are LoveFable AI, a master director of romantic, sentimental, and emotional animated storyboards. Always respond in valid JSON matching the requested schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Title of the fable" },
              subtitle: { type: Type.STRING, description: "Subtitle or dedication tagline" },
              overallEmotion: { type: Type.STRING, description: "Main emotional theme" },
              bgMusicMood: {
                type: Type.STRING,
                description: "Background music mood: 'soft_piano', 'music_box', 'rain_ambient', 'chill_lofi', or 'romantic_strings'",
              },
              scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    sceneTitle: { type: Type.STRING },
                    narrationText: { type: Type.STRING },
                    visualMood: { type: Type.STRING },
                    duration: { type: Type.INTEGER },
                    emotionPrompt: { type: Type.STRING },
                    bgGradient: { type: Type.STRING },
                    accentColor: { type: Type.STRING },
                    keyQuote: { type: Type.STRING },
                  },
                  required: ["id", "sceneTitle", "narrationText", "visualMood", "duration", "bgGradient"],
                },
              },
            },
            required: ["title", "subtitle", "overallEmotion", "bgMusicMood", "scenes"],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from Gemini.");
      }

      const parsed = JSON.parse(text);
      const storyboard = {
        id: `fable-${Date.now()}`,
        title: parsed.title || "Your Personal LoveFable",
        subtitle: parsed.subtitle || `A ${tone.toLowerCase()} story of affection`,
        overallEmotion: parsed.overallEmotion || "Heartfelt Connection",
        bgMusicMood: parsed.bgMusicMood || "soft_piano",
        visualTheme: visualTheme,
        tone: tone,
        originalMessage: message,
        createdAt: Date.now(),
        scenes: (parsed.scenes || []).map((s: Record<string, unknown>, idx: number) => ({
          id: idx + 1,
          sceneTitle: s.sceneTitle || `Scene ${idx + 1}`,
          narrationText: s.narrationText || "A moment held in quiet warmth.",
          visualMood: s.visualMood || visualMood,
          duration: typeof s.duration === "number" ? s.duration : 10,
          emotionPrompt: s.emotionPrompt || "Warm affection",
          bgGradient: s.bgGradient || "linear-gradient(to bottom, #fce7f3, #fbcfe8, #f472b6)",
          accentColor: s.accentColor || "#ec4899",
          keyQuote: s.keyQuote || "Every memory holds a spark of love.",
        })),
      };

      res.json({ storyboard });
    } catch (err: unknown) {
      console.error("Gemini API error:", err);
      res.status(500).json({ error: "Failed to generate storyboard. Please try again later." });
    }
  });

  // Initialize Stripe
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ error: "Stripe configuration is missing. Add your STRIPE_SECRET_KEY to .env." });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "LoveFable Pro Plan (Monthly)",
                description: "Unlock HD exports, unlimited daily generations & watermark removal",
              },
              unit_amount: 600, // $6.00
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin || "http://localhost:3001"}?success=true`,
        cancel_url: `${req.headers.origin || "http://localhost:3001"}?canceled=true`,
      });

      res.json({ id: session.id });
    } catch (err: unknown) {
      console.error("Stripe error:", err);
      res.status(500).json({ error: (err as Error).message || "Failed to create checkout session" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { port: 24679 } },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
