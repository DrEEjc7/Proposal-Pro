import { GoogleGenerativeAI } from "@google/generative-ai"
import { GoogleGenerativeAIStream, StreamingTextResponse } from "ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "")

export const runtime = "edge"

export async function POST(req: Request) {
  const { prompt, action, tone } = await req.json()

  let systemPrompt = "You are a helpful assistant for a proposal generator app."

  switch (action) {
    case "improve":
      systemPrompt =
        "You are an expert copywriter. Your task is to improve the following text for a professional business proposal, making it more clear, concise, and compelling. Only return the improved text."
      break
    case "tone":
      systemPrompt = `You are a master of communication. Your task is to rewrite the following text to have a ${
        tone || "professional"
      } tone. Only return the rewritten text.`
      break
    case "format":
      systemPrompt =
        "You are a document formatting expert. Your task is to format the following text into a well-structured section for a business proposal. Use clear headings, paragraphs, and bullet points where appropriate. Only return the formatted text."
      break
    case "generate":
      systemPrompt =
        "You are a creative and professional writer. Your task is to generate a well-written text for a business proposal based on the following topic. The text should be clear, engaging, and professional."
      break
  }

  const geminiStream = await genAI
    .getGenerativeModel({ model: "gemini-1.5-flash" })
    .generateContentStream([systemPrompt, prompt].join("\n\n"))

  return new StreamingTextResponse(GoogleGenerativeAIStream(geminiStream))
}
