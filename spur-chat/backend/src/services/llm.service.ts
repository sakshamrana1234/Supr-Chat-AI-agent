import OpenAI from 'openai';
import { ChatMessage, MessageDTO } from '../lib/types';

// ---------------------------------------------------------------------------
// OpenAI client (lazy-initialised so tests can skip it)
// ---------------------------------------------------------------------------
let openaiClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set.');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// ---------------------------------------------------------------------------
// SwiftCart store knowledge — injected into every system prompt
// ---------------------------------------------------------------------------
const STORE_KNOWLEDGE = `
Store Name: SwiftCart

SHIPPING POLICY:
- India delivery: 3–5 business days
- USA delivery: 7–12 business days
- Free shipping on orders above ₹999
- International shipping may have additional customs duties

RETURNS & REFUNDS:
- Returns accepted within 7 days of delivery
- Product must be unused and in original packaging
- Refunds processed within 5–7 business days after inspection
- Damaged or defective items are eligible for immediate replacement

SUPPORT:
- Hours: Monday to Saturday, 10 AM – 7 PM IST
- Email: support@swiftcart.example
- Outside support hours, customers can leave a message and will be contacted next business day

PAYMENTS:
- Accepted methods: UPI, credit/debit cards, Razorpay, Stripe
- All transactions are secured with SSL encryption
- EMI options available on purchases above ₹2,000

ORDER CHANGES & CANCELLATIONS:
- Orders can be modified or cancelled only before they are shipped
- Once shipped, cancellation is not possible; use return process instead
- To cancel, contact support immediately with your order ID
`.trim();

const SYSTEM_PROMPT = `You are a helpful support agent for SwiftCart, a fictional small e-commerce store. Answer clearly, politely, and concisely. Use only the store policies provided below. If a customer asks something outside your knowledge, say that you'll connect them with a human support agent.

${STORE_KNOWLEDGE}

Guidelines:
- Be warm but professional
- Keep replies concise (2–4 sentences for simple questions)
- If a policy detail is not listed above, say "I'll connect you with a human agent for this"
- Never make up pricing, tracking info, or personal data
- Format lists with bullet points when it helps clarity`;

// ---------------------------------------------------------------------------
// Max conversation history turns to include (cost control)
// ---------------------------------------------------------------------------
const MAX_HISTORY_TURNS = 10;

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------

/**
 * Generates an AI reply given the conversation history and the new user message.
 * @param history - Previous messages in the conversation (from DB)
 * @param userMessage - The latest user message text
 */
export async function generateReply(
  history: MessageDTO[],
  userMessage: string,
): Promise<string> {
  const client = getClient();

  // Build message array for the LLM, capping history to control token cost
  const recentHistory = history.slice(-MAX_HISTORY_TURNS * 2);

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    // Map DB messages to OpenAI format
    ...recentHistory.map((msg) => ({
      role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
      content: msg.text,
    })),
    { role: 'user', content: userMessage },
  ];

  const completion = await client.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    max_tokens: 500,
    temperature: 0.4, // Slightly deterministic for a support context
  });

  const reply = completion.choices[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error('LLM returned an empty response.');
  }

  return reply;
}
