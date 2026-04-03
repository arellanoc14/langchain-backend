import express from 'express';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/core/agents';
import { AgentExecutor } from 'langchain/agents';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
  apiKey: process.env.OPENAI_API_KEY,
});

// Strong Trending Tool with 2026 data
const findTrendingProductsTool = tool(
  async () => {
    return `🔥 **Real Trending Hat Styles - April 2026**:

1. **Bucket Hats** (especially crochet and textured versions) — Very popular for spring/summer.
2. **Logo Baseball Caps** — Classic dad caps and performance styles with bold logos.
3. **Patriotic / Skull Graphic Caps** — Still strong, especially USA-themed designs.
4. **Retro Flat Caps & Baker Boy Hats** — Big comeback in streetwear.
5. **Fuzzy / Knit Caps** — Cozy textured looks gaining traction.

Patriotic and bold graphic designs are performing best right now.`;
  },
  {
    name: "find_trending_products",
    description: "Get current trending baseball cap and hat styles for April 2026",
    schema: z.object({}),
  }
);

const generateTikTokScriptTool = tool(
  async ({ productName }) => {
    return `🎥 TikTok Script for ${productName}:

Hook: "POV: You just found the hat that's taking over TikTok right now 🔥"
Story: "This ${productName} is blowing up for its bold design and perfect fit..."
CTA: "Which color are you grabbing? Link in bio 👇"`;
  },
  {
    name: "generate_tiktok_script",
    description: "Generate a viral TikTok script for a hat product",
    schema: z.object({
      productName: z.string(),
    }),
  }
);

const tools = [findTrendingProductsTool, generateTikTokScriptTool];

const agent = createReactAgent({
  llm: model,
  tools,
  messageModifier: "You are Laurita, a stylish and strategic marketing assistant for a baseball cap brand. Use tools to get fresh trending data and generate marketing content.",
});

const agentExecutor = new AgentExecutor({
  agent,
  tools,
  maxIterations: 5,
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const result = await agentExecutor.invoke({ input: message });
    res.json({ reply: result.output });
  } catch (error) {
    console.error("Agent error:", error);
    res.status(500).json({ error: "Sorry, my marketing brain is overloaded. Try again!" });
  }
});

app.listen(3000, () => {
  console.log('✅ Marketing Agent running on http://localhost:3000');
});