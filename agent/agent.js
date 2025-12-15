// backend/agent/agent.js
import { ChatOpenAI } from "@langchain/openai";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { ChatMessage } from "../models/Models.js";
import { RunnableSequence } from "@langchain/core/runnables";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

const llm = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
  apiKey: process.env.OPENAI_API_KEY,
});

export async function askAgent(sessionId, userMessage) {
  console.log(
    "🧠 askAgent called with sessionId:",
    sessionId,
    "and message:",
    userMessage
  );

  // 1️⃣ Ambil history dari DB
  const historyMessages = await ChatMessage.findAll({
    where: { sessionId },
    order: [["createdAt", "ASC"]],
  });
  console.log("📜 Loaded history messages:", historyMessages.length);

  // 2️⃣ Konversi ke format LangChain
  const chatHistory = new ChatMessageHistory();
  for (const msg of historyMessages) {
    console.log(`   ↳ ${msg.role}: ${msg.content}`);
    if (msg.role === "user") chatHistory.addUserMessage(msg.content);
    else if (msg.role === "assistant") chatHistory.addAIMessage(msg.content);
  }

  // 3️⃣ Setup memory
  const memory = new BufferMemory({
    chatHistory,
    returnMessages: true,
    memoryKey: "history",
    inputKey: "input",
    outputKey: "output",
  });
  console.log("💾 Memory initialized");

  // 4️⃣ Template prompt
  const prompt = ChatPromptTemplate.fromMessages([
    new MessagesPlaceholder("history"),
    ["human", "{input}"],
  ]);

  console.log("🧩 Prompt template created");

  // 5️⃣ Buat chain runnable
  const chain = RunnableSequence.from([
    {
      history: async () => {
        const vars = await memory.loadMemoryVariables({});
        console.log("📚 Loaded memory variables:", vars);
        return vars.history || [];
      },
      input: (input) => input.input,
    },
    prompt,
    llm,
    async (output, { input }) => {
      console.log("🤖 Model output received:", output);
      await memory.saveContext(
        { input: input || userMessage },
        { output: output.content }
      );
      console.log("✅ Context saved to memory");
      return output.content;
    },
  ]);

  // 6️⃣ Jalankan agent
  console.log("🚀 Running agent chain...");
  const response = await chain.invoke({ input: userMessage || "(no message)" });

  console.log("💬 Final response:", response);
  return response;
}
