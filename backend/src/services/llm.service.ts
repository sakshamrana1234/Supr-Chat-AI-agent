import Groq from 'groq-sdk';
import { MessageDTO } from '../lib/types';

let groqClient: Groq | null = null;

function getClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY environment variable is not set.');
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

const STORE_KNOWLEDGE = `
Store Name: SwiftCart
SHIPPING: India 3–5 days, USA 7–12 days, free shipping above ₹999
RETURNS: Within 7 days, unused, original packaging, refund in 5–7 days
SUPPORT: Mon–Sat 10AM–7PM IST, support@swiftcart.example
PAYMENTS: UPI, cards, Razorpay, Stripe
ORDERS: Can modify/cancel only before shipping
`.trim();

const SYSTEM_PROMPT = `You are a helpful support agent for SwiftCart, a small e-commerce store. Answer clearly, politely, and concisely. Use only the store policies below. If unknown, say you'll connect them with a human agent.\n\n${STORE_KNOWLEDGE}`;

const MAX_HISTORY_TURNS = 10;

export async function generateReply(history: MessageDTO[], userMessage: string): Promise<string> {
  const client = getClient();
  const recentHistory = history.slice(-MAX_HISTORY_TURNS * 2);

  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    ...recentHistory.map((msg) => ({
      role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.text,
    })),
    { role: 'user' as const, content: userMessage },
  ];

  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    max_tokens: 500,
    temperature: 0.4,
  });

  const reply = completion.choices[0]?.message?.content?.trim();
  if (!reply) throw new Error('LLM returned an empty response.');
  return reply;
}
