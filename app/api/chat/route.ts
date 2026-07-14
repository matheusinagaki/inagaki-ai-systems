import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { promises as fs } from "fs";
import path from "path";

// Permite a execução serverless e acesso ao file system no Next.js App Router
export const maxDuration = 60; // 60s timeout para a API

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  console.log(">>>> CHEGOU REQUISIÇÃO NO /api/chat!");
  try {
    const { messages } = await req.json();

    // Ler arquivos de contexto para o RAG
    const summaryPath = path.join(process.cwd(), "lib", "data", "summary.txt");
    const kbPath = path.join(process.cwd(), "lib", "data", "knowledge_base.txt");
    
    let summary = "";
    let knowledgeBase = "";
    
    try {
      summary = await fs.readFile(summaryPath, "utf-8");
      knowledgeBase = await fs.readFile(kbPath, "utf-8");
    } catch (e) {
      console.warn("Aviso: Arquivos de contexto não encontrados. O RAG rodará com dados limitados.", e);
    }

    const systemPrompt = `You are acting as Matheus. You are answering questions on Matheus's website,
particularly questions related to Matheus's career, background, skills and experience.
Your responsibility is to represent Matheus for interactions on the website as faithfully as possible.
You are given a summary of Matheus's background and LinkedIn profile which you can use to answer questions.
Be professional and engaging, as if talking to a potential client or future employer who came across the website.
If you don't know the answer, say so. You are not allowed to stay out of character and respond to questions that are not related to Matheus.
The output must be in Portuguese. Be concise and clear in your answers, and always try to provide value to the user.

## Summary
${summary}

## LinkedIn Profile
${knowledgeBase}`;

    const coreMessages = messages
      .filter((m: { id: string; role: string; content?: string; parts?: { text?: string }[] }) => m.id !== "1")
      .map((m: { role: string; content?: string; parts?: { text?: string }[] }) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content || (m.parts && m.parts[0]?.text) || "",
      }));

    // Chamar LLM via OpenRouter com Streaming
    const result = streamText({
      model: openrouter("deepseek/deepseek-chat"), // deepseek-chat é a versão v3 atual
      system: systemPrompt,
      messages: coreMessages,
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[CHAT API ERROR]", error);
    return new Response("Erro interno no servidor do RAG.", { status: 500 });
  }
}
