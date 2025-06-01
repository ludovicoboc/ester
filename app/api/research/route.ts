import { perplexity } from "@ai-sdk/perplexity"
import { generateText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { 
      topic, 
      documents, 
      slideCount = 10, 
      themeId = "clean",
      promptTemplate,
      includeImages = true,
      includeExamples = true,
      simpleLanguage = false,
      includeQuestions = true,
      isEducationalFocus = false
    } = await req.json()

    // Usar o prompt personalizado se fornecido, senão usar o padrão
    const systemPrompt = promptTemplate || `Você é um especialista em criação de apresentações e pesquisa acadêmica. Sua tarefa é:

1. Realizar uma pesquisa profunda sobre o tópico fornecido
2. Estruturar o conteúdo em slides organizados e coerentes
3. Incluir informações atualizadas e relevantes
4. Fornecer fontes confiáveis para cada informação

Formato de resposta esperado:
- Título da apresentação
- Estrutura de slides com títulos e conteúdo detalhado
- Sugestões de elementos visuais
- Fontes e referências

Mantenha um tom profissional e educativo.`

    let researchPrompt = `Crie uma apresentação completa sobre: ${topic}

Número de slides desejado: ${slideCount}

Por favor, estruture a apresentação com:
- Slide de título
- Introdução/contexto
- Desenvolvimento do tema (múltiplos slides)
- Conclusões/próximos passos
- Referências

`

    // Adicionar instruções específicas com base nas configurações
    if (isEducationalFocus) {
      researchPrompt += `
Esta apresentação será usada em contexto educacional (sala de aula).
Adapte o conteúdo para fins didáticos, usando linguagem apropriada para estudantes.
Inclua objetivos de aprendizagem no início e um resumo no final.
`
    }

    if (includeImages) {
      researchPrompt += `
Sugira imagens ou elementos visuais relevantes para cada slide.
`
    }

    if (includeExamples) {
      researchPrompt += `
Inclua exemplos práticos e casos reais para ilustrar os conceitos.
`
    }

    if (simpleLanguage) {
      researchPrompt += `
Use linguagem simples e acessível, evitando termos técnicos desnecessários.
Explique conceitos complexos de forma clara e direta.
`
    }

    if (includeQuestions) {
      researchPrompt += `
Adicione perguntas para discussão ou reflexão ao final da apresentação.
`
    }

    // Se houver documentos anexados, incluir no prompt
    if (documents && documents.length > 0) {
      researchPrompt += `\nDocumentos de referência fornecidos:\n${documents.join("\n\n")}`
    }

    const result = await generateText({
      model: perplexity("sonar-pro"),
      system: systemPrompt,
      prompt: researchPrompt,
    })

    return Response.json({
      success: true,
      content: result.text,
      usage: result.usage,
    })
  } catch (error) {
    console.error("Erro na pesquisa:", error)
    return Response.json({ success: false, error: "Erro ao processar pesquisa" }, { status: 500 })
  }
}
