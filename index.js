import express from 'express';
import { ChatOpenAI } from '@langchain/openai';
import { createToolCallingAgent } from '@langchain/core/agents';
import { AgentExecutor } from 'langchain/agents';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// 1. Define Tools (you can add more later)
const searchProductsTool = tool(
  async ({ query }) => {
    // TODO: Later connect to your real product database
    // For now it returns example products
    return `Found these products for "${query}": 
    - USA Skull Baseball Cap - $14 (best seller)
    - Rainbow Tie-Dye Cap - $20
    - Flat Bill Patriot Cap - $18`;
  },
  {
    name: "search_products",
    description: "Search for hats and caps in the store",
    schema: z.object({
      query: z.string().describe("What the user is looking for (color, style, theme, etc.)"),
    }),
  }
);

const getProductDetailsTool = tool(
  async ({ productName }) => {
    return `Product: ${productName}
Price: $14–$20
Material: 100% Polyester or Twill
Best for: Streetwear, casual, or patriotic looks`;
  },
  {
    name: "get_product_details",
    description: "Get detailed info about a specific product",
    schema: z.object({
      productName: z.string().describe("Name of the product"),
    }),
  }
);

// 2. Create the LLM + Agent
const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
  apiKey: process.env.OPENAI_API_KEY,
});

const tools = [searchProductsTool, getProductDetailsTool];

const agent = createToolCallingAgent({
  llm: model,
  tools,
  systemMessage: `You are Laurita, a friendly, stylish, slightly sassy Latina fashion expert who specializes in baseball caps and streetwear.
Always be helpful, fun, and encouraging about style. Use tools when needed to give accurate product info.`,
});

const agentExecutor = new AgentExecutor({
  agent,
  tools,
  verbose: true,        // shows reasoning in logs
  maxIterations: 5,
});

// 3. The same endpoint as before (Base44 still works)
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    const result = await agentExecutor.invoke({
      input: message,
    });

    res.json({ reply: result.output });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('✅ Full LangChain Agent running on http://localhost:3000');
});