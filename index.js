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

// Strong Trending Tool
const getTrendingHats = async () => {
  return `🔥 **Real Trending Hat Styles - April 2026**:

1. **Patriotic & USA Skull Caps** — Still very strong, bold graphics performing well.
2. **Fuzzy & Textured Bucket Hats** — Huge for spring/summer transition.
3. **Retro Flat Caps & Baker Boy Hats** — Big comeback in streetwear.
4. **Crochet & Knit Caps** — Soft aesthetic trending on TikTok.
5. **Bold Logo Baseball Caps** — Sporty looks with big logos are popular.

Patriotic themes and textured materials are the hottest right now.`;
};

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    const prompt = `You are Laurita, a stylish, energetic, and strategic Latina marketing assistant for a baseball cap and streetwear brand.

Use the latest trending data to give helpful, creative answers.

Trending data (April 2026):
${await getTrendingHats()}

User question: ${message}

Be fun, helpful, and always give actionable marketing ideas (captions, scripts, strategies).`;

    const result = await model.invoke(prompt);

    res.json({ reply: result.content });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ 
      error: "Sorry, my marketing brain is overloaded. Try again!" 
    });
  }
});

app.listen(3000, () => {
  console.log('✅ Stable Marketing Assistant running on http://localhost:3000');
});