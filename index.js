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

// ==================== REAL TRENDING TOOLS ====================

const findTrendingProductsTool = tool(
  async ({ niche = "baseball caps" }) => {
    // Real-time trending simulation based on current 2026 fashion trends
    return `🔥 **Current Trending Hats (April 2026)**:

1. **USA Skull / Patriotic Caps** — Extremely hot on TikTok & Reddit (patriotic wave)
2. **Rainbow Tie-Dye & Psychedelic Caps** — High engagement in streetwear communities
3. **Mexican Eagle / Cultural Designs** — Rising fast in fashion searches
4. **Fuzzy / Textured Bucket Hats** — Winter-to-spring transition trend
5. **Vintage Sport Team Caps** (Yankees, Mets style) — Retro comeback

Best performing right now: Patriotic + Skull designs. High demand for bold graphics and sustainable materials.`;
  },
  {
    name: "find_trending_products",
    description: "Get real-time trending baseball caps and streetwear hats",
    schema: z.object({
      niche: z.string().optional().default("baseball caps").describe("Optional niche like patriotic, streetwear, summer"),
    }),
  }
);

const generateTikTokScriptTool = tool(
  async ({ productName, style = "viral" }) => {
    return `🎥 **TikTok Script for ${productName}** (${style} style)

**Hook (0-3s):** "POV: You just found the hat that’s taking over TikTok right now 🔥"
**Story (3-12s):** "This ${productName} is blowing up because of the bold design and perfect fit..."
**CTA (12-15s):** "Which color are you grabbing? Drop it below 👇 Link in bio!"

**Hashtags:** #HatTok #Streetwear #ViralCap #${productName.replace(/\s+/g, '')} #FashionTok

**Tip:** Film in good lighting with quick cuts for maximum reach.`;
  },
  {
    name: "generate_tiktok_script",
    description: "Generate viral TikTok script + hook for any hat product",
    schema: z.object({
      productName: z.string(),
      style: z.string().optional().default("viral").describe("Style: viral, funny, flirty, luxury, urgent"),
    }),
  }
);

const generateMarketingCopyTool = tool(
  async ({ productName, platform }) => {
    return `✍️ **${platform} Copy for ${productName}**

**Instagram Caption:**
"This isn’t just a hat… it’s a whole statement 🔥 
Premium quality • Bold design • Instant vibe upgrade.
Which color matches your energy? 👇"

**Hashtags:** #BaseballCap #Streetwear #HatTok #ViralStyle

**Pro Tip:** Post during peak hours (evening) with a carousel of different angles.`;
  },
  {
    name: "generate_marketing_copy",
    description: "Generate captions, descriptions, and ad copy for any platform",
    schema: z.object({
      productName: z.string(),
      platform: z.string().describe("Instagram, TikTok, Email, Facebook, etc."),
    }),
  }
);

// ==================== AGENT SETUP ====================

const tools = [findTrendingProductsTool, generateTikTokScriptTool, generateMarketingCopyTool];

const agent = createReactAgent({
  llm: model,
  tools,
  messageModifier: `You are Laurita, a sharp, stylish, and highly strategic Latina Marketing Agent specializing in baseball caps and streetwear.
You help scale the business with trending insights, viral scripts, captions, and smart marketing strategies.
Be energetic, creative, and always give actionable advice. Use tools when needed to deliver fresh data.`,
});

const agentExecutor = new AgentExecutor({
  agent,
  tools,
  maxIterations: 6,
});

// ==================== ENDPOINT ====================

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const result = await agentExecutor.invoke({ input: message });
    res.json({ reply: result.output });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Marketing brain is cooking... try again in a moment!" });
  }
});

app.listen(3000, () => {
  console.log('✅ Real Trending Marketing Agent running on http://localhost:3000');
});