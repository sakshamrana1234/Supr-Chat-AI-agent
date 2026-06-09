import { PrismaClient, Sender } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a demo conversation to verify the schema works
  const conversation = await prisma.conversation.create({
    data: {
      messages: {
        create: [
          {
            sender: Sender.user,
            text: 'Hi! What are your shipping options?',
          },
          {
            sender: Sender.ai,
            text: 'Hello! Welcome to SwiftCart. We offer the following shipping options:\n\n• **India**: 3–5 business days\n• **USA**: 7–12 business days\n\nOrders above ₹999 qualify for free shipping! Is there anything else I can help you with?',
          },
        ],
      },
    },
    include: { messages: true },
  });

  console.log(`✅ Created demo conversation: ${conversation.id}`);
  console.log(`   Messages: ${conversation.messages.length}`);
  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
