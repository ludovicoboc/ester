import { perplexity } from "@ai-sdk/perplexity"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json()

    const systemPrompt = `Você é um assistente especializado em criação e refinamento de apresentações. 

Contexto da sessão: ${context || "Criação de slides"}

Suas responsabilidades:
- Ajudar a refinar e melhorar slides existentes
- Sugerir melhorias no conteúdo e estrutura
- Responder perguntas sobre o tema da apresentação
- Fornecer informações atualizadas e precisas
- Manter consistência com o material já criado

Sempre forneça respostas construtivas e específicas para melhorar a qualidade da apresentação.`

    const result = streamText({
      model: perplexity("sonar-pro"),
      system: systemPrompt,
      messages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Erro no chat:", error)
    return new Response("Erro interno do servidor", { status: 500 })
  }
}
