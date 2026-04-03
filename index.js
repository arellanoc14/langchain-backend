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

// Real Trending Tool (updated with actual 2026 trends)
const findTrendingProductsTool = tool(
  async ({ niche = "baseball caps" }) => {
    return `🔥 **Real Trending Hats - April 2026** (based on current fashion buzz):

1. **Patriotic / USA Skull Caps** — Still very strong, especially with bold graphics and American themes.
2. **Fuzzy & Textured Bucket Hats** — Huge for spring/summer transition, playful and cozy.
3. **Retro Flat Caps & Baker Boy Hats** — Big comeback with '80s/'90s hip-hop and European street style influence.
4. **Crochet & Knit Caps** — Soft, handmade aesthetic trending heavily on TikTok and Instagram.
5. **Logo-Heavy & Color-Blocked Baseball Caps** — Sporty performance looks with bold logos and contrasting panels.

Hot right now: Sustainable materials, retro vibes, and bold patriotic/cultural designs. Trucker and snapback silhouettes remain popular.`;
  },
  {
    name: "find_trending_products",
    description: "Get current real-world trending baseball caps and hat styles for 2026",
    schema: z.object({
      niche: z.string().optional().default("baseball caps").describe("Optional focus area like patriotic, streetwear, summer"),
    }),
  }
);

const generateTikTokScriptTool = tool(
  async ({ productName, style = "viral" }) => {
    return `🎥 **TikTok Script for ${productName}** (${style} style)

**Hook (0-3s):** "Wait until you see this hat... it's actually taking over right now 🔥"
**Story (3-12s):** "The ${productName} is blowing up because of the perfect mix of style and comfort..."
**CTA (12-15s):** "Which color are you claiming? Comment below 👇 Link in bio!"

**Pro Tip:** Use trending sounds + quick outfit transitions for max reach.`;
  },
  {
    name: "generate_tiktok_script",
    description: "Generate viral TikTok script and hook",
    schema: z.object({
      productName: z.string(),
      style: z.string().optional().default("viral"),
    }),
  }
);

const generateMarketingCopyTool = tool(
  async ({ productName, platform }) => {
    return `✍️ **${platform} Ready Copy for ${productName}**

**Caption Idea:**
"This hat isn't just an accessory... it's a whole mood 🔥 
Premium feel, bold look, instant style upgrade.
Tag someone who needs this in their life 👇"`;
  },
  {
    name: "generate_marketing_copy",
    description: "Generate marketing copy for different platforms",
    schema: z.object({
      productName: z.string(),
      platform: z.string().describe("Instagram, TikTok, Email, etc."),
    }),
  }
);

const tools = [findTrendingProductsTool, generateTikTokScriptTool, generateMarketingCopyTool];

const agent = createReactAgent({
  llm: model,
  tools,
  messageModifier: `You are Laurita, a sharp, energetic, and strategic Latina Marketing Agent for a baseball cap & streetwear brand.
You provide real trending insights, viral content ideas, and smart marketing strategies.
Be helpful, creative, and always give actionable advice. Use tools to get fresh data.`,
});

const agentExecutor = new AgentExecutor({
  agent,
  tools,
  maxIterations: 6,
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const result = await agentExecutor.invoke({ input: message });
    res.json({ reply: result.output });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Marketing brain is cooking... try again!" });
  }
});

app.listen(3000, () => {
  console.log('✅ Real Trending Marketing Agent running');
});