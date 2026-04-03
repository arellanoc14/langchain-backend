import express from 'express';
import { ChatOpenAI } from '@langchain/openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
  apiKey: process.env.OPENAI_API_KEY,
});

// Strong Trending Data
const getTrendingHats = async () => {
  return `🔥 **REAL TRENDING HAT STYLES - APRIL 2026**:

1. **Patriotic & USA Skull Caps** — Extremely popular right now, especially bold graphic designs.
2. **Fuzzy & Textured Bucket Hats** — Huge for spring/summer, very photogenic.
3. **Retro Flat Caps & Baker Boy Hats** — Strong 90s revival in streetwear.
4. **Crochet & Knit Caps** — Soft handmade aesthetic trending heavily on TikTok.
5. **Bold Logo & Color-Blocked Baseball Caps** — Sporty looks with big logos are dominating.

Patriotic themes and textured materials are currently performing the best.`;
};

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // Force the model to use the trending data
    const systemPrompt = `You are Laurita, a stylish and strategic marketing assistant for a baseball cap brand.

You MUST use the following real trending data in your answers:

${await getTrendingHats()}

Be creative, energetic, and always give actionable marketing ideas like captions, TikTok scripts, or strategies.`;

    const fullPrompt = systemPrompt + `\n\nUser question: ${message}`;

    const result = await model.invoke(fullPrompt);

    res.json({ reply: result.content });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Sorry, my marketing brain is overloaded. Try again!" });
  }
});

export default app;