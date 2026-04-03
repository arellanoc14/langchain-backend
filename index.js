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
  temperature: 0.8,
  apiKey: process.env.OPENAI_API_KEY,
});

// ==================== MARKETING TOOLS ====================

const findTrendingProductsTool = tool(
  async ({ niche }) => {
    // Real trending logic (mock for now - easy to connect real APIs later)
    return `🔥 Trending right now in ${niche}:
1. USA Skull Baseball Cap - Viral on TikTok & Reddit
2. Rainbow Tie-Dye Cap - High engagement on Instagram
3. Patriotic Flat Bill - Strong sales for July 4th season`;
  },
  {
    name: "find_trending_products",
    description: "Find currently trending hat/cap products",
    schema: z.object({
      niche: z.string().describe("Niche or keyword like 'patriotic', 'streetwear', 'summer'"),
    }),
  }
);

const generateTikTokScriptTool = tool(
  async ({ productName, style }) => {
    return `🎥 TikTok Script for ${productName} (${style} style):

Hook (0-3s): "POV: You just found the dopest hat on the internet 🔥"
Story (3-12s): "This [productName] is blowing up because..."
Call to Action (12-15s): "Link in bio - which color are you grabbing? 👀"

Hashtags: #HatTok #Streetwear #ViralCap #${productName.replace(/ /g, '')}"`;
  },
  {
    name: "generate_tiktok_script",
    description: "Generate ready-to-film TikTok script + hook",
    schema: z.object({
      productName: z.string(),
      style: z.string().describe("Style: flirty, funny, luxury, urgent, etc."),
    }),
  }
);

const generateMarketingCopyTool = tool(
  async ({ productName, platform }) => {
    return `✍️ ${platform} Copy for ${productName}:

Caption: "This hat isn’t just clothing… it’s a whole vibe 🔥 
Material: 100% premium polyester • One size fits all
Drop your favorite color below 👇"`;
  },
  {
    name: "generate_marketing_copy",
    description: "Generate captions, descriptions, or ad copy",
    schema: z.object({
      productName: z.string(),
      platform: z.string().describe("Instagram, TikTok, Email, Landing Page, etc."),
    }),
  }
);

// ==================== AGENT SETUP ====================

const tools = [findTrendingProductsTool, generateTikTokScriptTool, generateMarketingCopyTool];

const agent = createReactAgent({
  llm: model,
  tools,
  messageModifier: `You are Laurita, a super smart, stylish, and slightly sassy Latina Marketing Agent for a baseball cap / streetwear brand.
You help the owner create viral content, find trending products, write captions, and grow the business.
Be creative, strategic, and always give actionable marketing ideas. Use tools when needed.`,
});

const agentExecutor = new AgentExecutor({
  agent,
  tools,
  maxIterations: 8,
  verbose: true,
});

// ==================== ENDPOINT ====================

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    const result = await agentExecutor.invoke({
      input: message,
    });

    res.json({ reply: result.output });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: "Marketing brain is thinking too hard... try again!" 
    });
  }
});

app.listen(3000, () => {
  console.log('✅ Advanced Marketing Agent running on http://localhost:3000');
});