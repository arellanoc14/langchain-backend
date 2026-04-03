import { ChatOpenAI } from '@langchain/openai';
import dotenv from 'dotenv';

dotenv.config();

const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
  apiKey: process.env.OPENAI_API_KEY,
});

const getTrendingHats = () => {
  return `🔥 **Real Trending Hat Styles - April 2026**:

1. **Patriotic & USA Skull Caps** — Extremely popular right now.
2. **Fuzzy & Textured Bucket Hats** — Huge for spring/summer.
3. **Retro Flat Caps & Baker Boy Hats** — Strong comeback.
4. **Crochet & Knit Caps** — Soft aesthetic trending on TikTok.
5. **Bold Logo Baseball Caps** — Sporty looks dominating.

Patriotic themes and textured materials are performing the best this month.`;
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { message } = req.body;

      const prompt = `You are Laurita, a stylish marketing assistant for a baseball cap brand.

Use this trending data:
${getTrendingHats()}

User question: ${message}

Be creative and give actionable marketing ideas (captions, TikTok scripts, strategies).`;

      const result = await model.invoke(prompt);

      res.status(200).json({ reply: result.content });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sorry, try again!" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}