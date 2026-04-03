import express from 'express';
import { ChatOpenAI } from '@langchain/openai';
import dotenv from 'dotenv';

dotenv.config();   // ← This loads your .env file

const app = express();
app.use(express.json());

const model = new ChatOpenAI({
  temperature: 0.7,
  modelName: "gpt-4o-mini",
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const result = await model.invoke(message);
    
    res.json({ reply: result.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: "Failed to get response from AI", 
      details: error.message 
    });
  }
});

app.listen(3000, () => {
  console.log('✅ LangChain backend running on http://localhost:3000');
});