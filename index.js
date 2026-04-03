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

// Simple but effective trending tool
const findTrendingProductsTool = async (niche = "baseball caps") => {
  return `🔥 **Current Trending Hat Styles - April 2026**:

1. **Patriotic Skull & USA Caps** — Extremely popular right now
2. **Fuzzy/Textured Bucket Hats** — Big for spring/summer
3. **Retro Flat Caps & Baker Boy Hats** — Strong comeback
4. **Crochet & Knit Caps** — Soft aesthetic trending on TikTok
5. **Bold Logo & Color-Blocked Baseball Caps** — Sporty looks dominating

Patriotic and textured designs are performing the best this month.`;
};

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // For now, we let the LLM handle most logic with strong system prompt
    const prompt = `You are Laurita, a stylish and strategic marketing assistant for a baseball cap brand.
Use the latest 2026 fashion trends to give helpful answers.

User question: ${message}

If the question is about trending styles, use this data:
${await findTrendingProductsTool()}

Give creative, actionable marketing advice.`;

    const result = await model.invoke(prompt);

    res.json({ reply: result.content });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ 
      error: "Sorry, my marketing brain is thinking too hard. Try again in a moment!" 
    });
  }
});

app.listen(3000, () => {
  console.log('✅ Stable Marketing Assistant running on http://localhost:3000');
});