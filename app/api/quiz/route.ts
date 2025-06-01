import { NextResponse } from 'next/server';
import type { QuizQuestion, QuizSettings } from '../../components/quiz-system';

export async function POST(request: Request) {
  try {
    const { content, settings } = await request.json();

    if (!content) {
      return NextResponse.json(
        { success: false, message: "Conteúdo não fornecido" },
        { status: 400 }
      );
    }

    // Em um sistema real, aqui faríamos uma chamada a um modelo de linguagem (LLM)
    // para gerar perguntas de acordo com o conteúdo fornecido
    // Por enquanto, vamos simular esse comportamento

    const questions = generateQuestions(content, settings);

    return NextResponse.json({
      success: true,
      questions
    });
  } catch (error) {
    console.error("Erro ao processar solicitação de quiz:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Função para gerar perguntas com base no conteúdo
function generateQuestions(content: string, settings: QuizSettings): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const questionCount = settings.questionCount || 3;
  
  // Gerar perguntas de múltipla escolha
  if (settings.questionTypes.multiple) {
    const multipleChoiceCount = Math.ceil(questionCount / 3);
    
    for (let i = 0; i < multipleChoiceCount; i++) {
      questions.push({
        id: `mc-${Date.now()}-${i}`,
        type: 'multiple',
        question: `Pergunta de múltipla escolha baseada no conteúdo: "${truncateContent(content)}"`,
        options: [
          'Primeira opção baseada no conteúdo',
          'Segunda opção baseada no conteúdo',
          'Terceira opção baseada no conteúdo',
          'Quarta opção baseada no conteúdo'
        ],
        correctAnswer: 'Primeira opção baseada no conteúdo'
      });
    }
  }
  
  // Gerar perguntas de verdadeiro/falso
  if (settings.questionTypes.truefalse) {
    const trueFalseCount = Math.ceil(questionCount / 3);
    
    for (let i = 0; i < trueFalseCount; i++) {
      questions.push({
        id: `tf-${Date.now()}-${i}`,
        type: 'truefalse',
        question: `Afirmação baseada no conteúdo: "${truncateContent(content)}". Esta afirmação está correta?`,
        correctAnswer: Math.random() > 0.5
      });
    }
  }
  
  // Gerar perguntas de resposta curta
  if (settings.questionTypes.short) {
    const shortAnswerCount = Math.ceil(questionCount / 3);
    
    for (let i = 0; i < shortAnswerCount; i++) {
      questions.push({
        id: `sa-${Date.now()}-${i}`,
        type: 'short',
        question: `Explique brevemente o seguinte conceito do conteúdo: "${truncateContent(content)}"`
      });
    }
  }
  
  // Limitar ao número solicitado
  return questions.slice(0, questionCount);
}

// Função auxiliar para truncar o conteúdo
function truncateContent(content: string, maxLength = 50): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
}

// Endpoint para coletar respostas dos alunos
export async function PUT(request: Request) {
  try {
    const { quizId, responses } = await request.json();
    
    if (!quizId || !responses) {
      return NextResponse.json(
        { success: false, message: "Dados incompletos" },
        { status: 400 }
      );
    }
    
    // Em um sistema real, aqui salvaríamos as respostas em um banco de dados
    // Por enquanto, vamos apenas simular esse comportamento
    
    console.log(`Recebidas ${responses.length} respostas para o quiz ${quizId}`);
    
    return NextResponse.json({
      success: true,
      message: `${responses.length} respostas processadas com sucesso`
    });
  } catch (error) {
    console.error("Erro ao processar respostas do quiz:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Endpoint para obter resultados agregados
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const quizId = url.searchParams.get('quizId');
    
    if (!quizId) {
      return NextResponse.json(
        { success: false, message: "ID do quiz não fornecido" },
        { status: 400 }
      );
    }
    
    // Em um sistema real, aqui buscaríamos os resultados do banco de dados
    // Por enquanto, vamos apenas simular esse comportamento
    
    const simulatedResults = {
      quizId,
      totalResponses: Math.floor(Math.random() * 30) + 5,
      correctRate: Math.random() * 0.6 + 0.2, // Entre 20% e 80%
      questionBreakdown: [
        {
          questionId: "q1",
          correctRate: Math.random(),
          responseDistribution: {
            "Opção A": Math.random() * 0.5,
            "Opção B": Math.random() * 0.3,
            "Opção C": Math.random() * 0.2,
            "Opção D": Math.random() * 0.1
          }
        },
        {
          questionId: "q2",
          correctRate: Math.random(),
          responseDistribution: {
            "true": Math.random() * 0.6,
            "false": Math.random() * 0.4
          }
        }
      ]
    };
    
    return NextResponse.json({
      success: true,
      results: simulatedResults
    });
  } catch (error) {
    console.error("Erro ao obter resultados do quiz:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 