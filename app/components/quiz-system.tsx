"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  HelpCircle,
  BarChart2,
  Loader2,
  QrCode,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Download,
  Edit,
  Trash2
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

export interface QuizQuestion {
  id: string;
  type: 'multiple' | 'truefalse' | 'short';
  question: string;
  options?: string[];
  correctAnswer?: string | boolean;
}

export interface QuizResponse {
  questionId: string;
  response: string | boolean;
  isCorrect?: boolean;
}

export interface QuizSettings {
  autoGenerate: boolean;
  questionTypes: {
    multiple: boolean;
    truefalse: boolean;
    short: boolean;
  };
  questionCount: number;
}

export const defaultQuizSettings: QuizSettings = {
  autoGenerate: true,
  questionTypes: {
    multiple: true,
    truefalse: true,
    short: true
  },
  questionCount: 3
};

interface QuizSystemProps {
  slideContent: string;
  settings?: QuizSettings;
  onSettingsChange?: (settings: QuizSettings) => void;
}

export default function QuizSystem({ 
  slideContent, 
  settings = defaultQuizSettings,
  onSettingsChange 
}: QuizSystemProps) {
  const [localSettings, setLocalSettings] = useState<QuizSettings>(settings);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("create");
  const [showQrCode, setShowQrCode] = useState<boolean>(false);
  const [isQuizActive, setIsQuizActive] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);

  // Sincronizar configurações
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Gerar perguntas com base no conteúdo do slide
  const generateQuestions = async () => {
    setIsGenerating(true);
    
    try {
      // Simulação de chamada à API - em produção, isso seria substituído pela API real
      // que usaria IA para gerar perguntas com base no conteúdo
      setTimeout(() => {
        const generatedQuestions: QuizQuestion[] = [
          {
            id: `q-${Date.now()}-1`,
            type: 'multiple',
            question: 'Qual o tema principal abordado neste slide?',
            options: [
              'Opção A - baseada no conteúdo',
              'Opção B - baseada no conteúdo',
              'Opção C - baseada no conteúdo',
              'Opção D - baseada no conteúdo'
            ],
            correctAnswer: 'Opção A - baseada no conteúdo'
          },
          {
            id: `q-${Date.now()}-2`,
            type: 'truefalse',
            question: 'Esta afirmação extraída do slide está correta?',
            correctAnswer: true
          },
          {
            id: `q-${Date.now()}-3`,
            type: 'short',
            question: 'Explique brevemente o conceito apresentado no slide:'
          }
        ];
        
        setQuestions(generatedQuestions);
        setIsGenerating(false);
      }, 1500);
      
      // Em produção, isso seria:
      /*
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: slideContent,
          settings: localSettings
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setQuestions(data.questions);
      }
      */
    } catch (error) {
      console.error("Erro ao gerar perguntas:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Adicionar uma nova pergunta manualmente
  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      type: 'multiple',
      question: 'Nova pergunta',
      options: ['Opção 1', 'Opção 2', 'Opção 3', 'Opção 4'],
      correctAnswer: 'Opção 1'
    };
    
    setQuestions([...questions, newQuestion]);
    setEditingQuestion(newQuestion);
  };

  // Remover uma pergunta
  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    if (editingQuestion && editingQuestion.id === id) {
      setEditingQuestion(null);
    }
  };

  // Editar uma pergunta
  const updateQuestion = (updated: QuizQuestion) => {
    setQuestions(questions.map(q => q.id === updated.id ? updated : q));
    setEditingQuestion(null);
  };

  // Atualizar configurações
  const updateSettings = (newSettings: Partial<QuizSettings>) => {
    const updated = { ...localSettings, ...newSettings };
    setLocalSettings(updated);
    onSettingsChange?.(updated);
  };

  // Iniciar ou parar o quiz
  const toggleQuizActive = () => {
    setIsQuizActive(!isQuizActive);
    if (!isQuizActive) {
      // Quando inicia o quiz, limpa as respostas anteriores
      setResponses([]);
    }
  };

  // Exportar resultados
  const exportResults = () => {
    const resultsData = {
      date: new Date().toISOString(),
      questions: questions,
      responses: responses
    };
    
    const blob = new Blob([JSON.stringify(resultsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-results-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  // Simular resultados do quiz (em produção, isso viria da API)
  const simulateResponses = () => {
    const simulatedResponses: QuizResponse[] = questions.map(q => {
      if (q.type === 'multiple') {
        return {
          questionId: q.id,
          response: q.options![Math.floor(Math.random() * q.options!.length)],
          isCorrect: Math.random() > 0.5
        };
      } else if (q.type === 'truefalse') {
        const response = Math.random() > 0.5;
        return {
          questionId: q.id,
          response,
          isCorrect: response === q.correctAnswer
        };
      } else {
        return {
          questionId: q.id,
          response: "Resposta curta simulada"
        };
      }
    });
    
    setResponses(simulatedResponses);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="create">Criar</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="results" disabled={!isQuizActive && responses.length === 0}>
            Resultados
          </TabsTrigger>
        </TabsList>
        
        {/* Aba de Criação */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Quiz e Feedback
                </div>
                <div>
                  <Button
                    variant={isQuizActive ? "destructive" : "default"}
                    size="sm"
                    onClick={toggleQuizActive}
                    className="mr-2"
                  >
                    {isQuizActive ? "Encerrar Quiz" : "Iniciar Quiz"}
                  </Button>
                  {isQuizActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowQrCode(!showQrCode)}
                    >
                      <QrCode className="w-4 h-4 mr-1" />
                      {showQrCode ? "Ocultar QR" : "Mostrar QR"}
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* QR Code para participação */}
              {showQrCode && isQuizActive && (
                <div className="bg-white p-4 rounded-lg border text-center mb-4">
                  <div className="mx-auto w-48 h-48 bg-gray-200 flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-gray-500" />
                  </div>
                  <p className="mt-2 text-sm">
                    Escaneie o QR Code para participar do quiz
                  </p>
                  <p className="text-xs text-gray-500">
                    Ou acesse: https://quiz.example.com/join/ABC123
                  </p>
                </div>
              )}
              
              {/* Botões para geração de perguntas */}
              {!isQuizActive && (
                <div className="flex gap-2 mb-4">
                  <Button
                    onClick={generateQuestions}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>Gerar Perguntas Automaticamente</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={addQuestion}
                    className="flex-none"
                  >
                    <PlusCircle className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
              )}
              
              {/* Lista de perguntas */}
              {questions.length > 0 ? (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium">
                          Pergunta {index + 1}: {question.type === 'multiple' ? 'Múltipla Escolha' : 
                            question.type === 'truefalse' ? 'Verdadeiro/Falso' : 'Resposta Curta'}
                        </h3>
                        {!isQuizActive && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingQuestion(question)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeQuestion(question.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="mb-2">{question.question}</p>
                      
                      {question.type === 'multiple' && question.options && (
                        <div className="space-y-1 ml-4">
                          {question.options.map((option, i) => (
                            <div key={i} className="flex items-center">
                              <span className="mr-2 text-sm">{String.fromCharCode(65 + i)}.</span>
                              <span className={option === question.correctAnswer ? "font-medium text-green-600" : ""}>
                                {option}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.type === 'truefalse' && (
                        <div className="space-y-1 ml-4">
                          <div className="flex items-center">
                            <span className={question.correctAnswer === true ? "font-medium text-green-600" : ""}>
                              Verdadeiro
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className={question.correctAnswer === false ? "font-medium text-green-600" : ""}>
                              Falso
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {question.type === 'short' && (
                        <div className="ml-4 text-sm text-gray-500 italic">
                          Resposta livre (texto curto)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {isGenerating ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-8 h-8 animate-spin mb-2" />
                      <p>Gerando perguntas com base no conteúdo do slide...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <HelpCircle className="w-8 h-8 mb-2" />
                      <p>Nenhuma pergunta criada.</p>
                      <p className="text-sm">Gere automaticamente ou adicione manualmente.</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Editor de perguntas */}
              {editingQuestion && (
                <div className="border rounded-lg p-4 mt-4 bg-blue-50">
                  <h3 className="font-medium mb-3">Editar Pergunta</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="question-type">Tipo de Pergunta</Label>
                      <Select
                        value={editingQuestion.type}
                        onValueChange={(value: 'multiple' | 'truefalse' | 'short') => {
                          setEditingQuestion({
                            ...editingQuestion,
                            type: value,
                            options: value === 'multiple' ? 
                              editingQuestion.options || ['Opção 1', 'Opção 2', 'Opção 3', 'Opção 4'] : 
                              undefined,
                            correctAnswer: value === 'multiple' ? 
                              editingQuestion.options?.[0] || 'Opção 1' : 
                              value === 'truefalse' ? true : undefined
                          });
                        }}
                      >
                        <SelectTrigger id="question-type" className="w-full">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple">Múltipla Escolha</SelectItem>
                          <SelectItem value="truefalse">Verdadeiro/Falso</SelectItem>
                          <SelectItem value="short">Resposta Curta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="question-text">Texto da Pergunta</Label>
                      <Textarea
                        id="question-text"
                        value={editingQuestion.question}
                        onChange={(e) => setEditingQuestion({
                          ...editingQuestion,
                          question: e.target.value
                        })}
                        className="mt-1"
                      />
                    </div>
                    
                    {editingQuestion.type === 'multiple' && (
                      <div>
                        <Label>Opções</Label>
                        <div className="space-y-2 mt-1">
                          {editingQuestion.options?.map((option, i) => (
                            <div key={i} className="flex gap-2">
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(editingQuestion.options || [])];
                                  newOptions[i] = e.target.value;
                                  setEditingQuestion({
                                    ...editingQuestion,
                                    options: newOptions,
                                    correctAnswer: editingQuestion.correctAnswer === option ? 
                                      e.target.value : editingQuestion.correctAnswer
                                  });
                                }}
                                className="flex-1"
                              />
                              <RadioGroup
                                value={editingQuestion.correctAnswer === option ? 'correct' : ''}
                                onValueChange={() => {
                                  setEditingQuestion({
                                    ...editingQuestion,
                                    correctAnswer: option
                                  });
                                }}
                                className="flex"
                              >
                                <div className="flex items-center space-x-1">
                                  <RadioGroupItem value="correct" id={`correct-${i}`} />
                                  <Label htmlFor={`correct-${i}`} className="text-xs">Correta</Label>
                                </div>
                              </RadioGroup>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0"
                                onClick={() => {
                                  const newOptions = [...(editingQuestion.options || [])].filter((_, idx) => idx !== i);
                                  setEditingQuestion({
                                    ...editingQuestion,
                                    options: newOptions,
                                    correctAnswer: editingQuestion.correctAnswer === option ? 
                                      newOptions[0] : editingQuestion.correctAnswer
                                  });
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingQuestion({
                                ...editingQuestion,
                                options: [...(editingQuestion.options || []), `Opção ${(editingQuestion.options?.length || 0) + 1}`]
                              });
                            }}
                          >
                            <PlusCircle className="h-4 w-4 mr-1" />
                            Adicionar Opção
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {editingQuestion.type === 'truefalse' && (
                      <div>
                        <Label>Resposta Correta</Label>
                        <RadioGroup
                          value={editingQuestion.correctAnswer === true ? 'true' : 'false'}
                          onValueChange={(value) => {
                            setEditingQuestion({
                              ...editingQuestion,
                              correctAnswer: value === 'true'
                            });
                          }}
                          className="flex space-x-4 mt-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="true" />
                            <Label htmlFor="true">Verdadeiro</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="false" />
                            <Label htmlFor="false">Falso</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setEditingQuestion(null)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => updateQuestion(editingQuestion)}
                      >
                        Salvar Pergunta
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Botão de debug para simular respostas (apenas para demonstração) */}
              {isQuizActive && questions.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={simulateResponses}
                  className="w-full mt-4"
                >
                  <BarChart2 className="w-4 h-4 mr-1" />
                  Simular Respostas (Apenas para Demonstração)
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba de Configurações */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Quiz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-generate" className="font-medium">Geração Automática</Label>
                  <p className="text-sm text-gray-500">
                    Gerar perguntas automaticamente com base no conteúdo
                  </p>
                </div>
                <Switch
                  id="auto-generate"
                  checked={localSettings.autoGenerate}
                  onCheckedChange={(checked) => updateSettings({ autoGenerate: checked })}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="font-medium">Tipos de Perguntas</Label>
                <p className="text-sm text-gray-500">
                  Selecione os tipos de perguntas que deseja incluir
                </p>
                
                <div className="space-y-2 ml-1 mt-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="type-multiple" className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Múltipla Escolha
                    </Label>
                    <Switch
                      id="type-multiple"
                      checked={localSettings.questionTypes.multiple}
                      onCheckedChange={(checked) => updateSettings({
                        questionTypes: { ...localSettings.questionTypes, multiple: checked }
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="type-truefalse" className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Verdadeiro / Falso
                    </Label>
                    <Switch
                      id="type-truefalse"
                      checked={localSettings.questionTypes.truefalse}
                      onCheckedChange={(checked) => updateSettings({
                        questionTypes: { ...localSettings.questionTypes, truefalse: checked }
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="type-short" className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Resposta Curta
                    </Label>
                    <Switch
                      id="type-short"
                      checked={localSettings.questionTypes.short}
                      onCheckedChange={(checked) => updateSettings({
                        questionTypes: { ...localSettings.questionTypes, short: checked }
                      })}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="question-count" className="font-medium">
                  Número de Perguntas
                </Label>
                <p className="text-sm text-gray-500 mb-2">
                  Quantidade de perguntas a serem geradas automaticamente
                </p>
                <Input
                  id="question-count"
                  type="number"
                  min="1"
                  max="10"
                  value={localSettings.questionCount}
                  onChange={(e) => updateSettings({ 
                    questionCount: Math.max(1, Math.min(10, Number(e.target.value))) 
                  })}
                  className="w-20"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba de Resultados */}
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5" />
                  Resultados do Quiz
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={exportResults}
                  disabled={responses.length === 0}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Exportar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {responses.length > 0 ? (
                <div className="space-y-6">
                  {/* Resumo dos resultados */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <p className="text-lg font-mono font-bold text-green-600">
                        {Math.round((responses.filter(r => r.isCorrect).length / responses.length) * 100)}%
                      </p>
                      <p className="text-sm text-green-600">Taxa de Acerto</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                      <p className="text-lg font-mono font-bold text-blue-600">
                        {responses.length}
                      </p>
                      <p className="text-sm text-blue-600">Respostas</p>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                      <p className="text-lg font-mono font-bold text-orange-600">
                        {responses.filter(r => r.isCorrect).length}/{responses.length}
                      </p>
                      <p className="text-sm text-orange-600">Acertos</p>
                    </div>
                  </div>
                  
                  {/* Detalhes por pergunta */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Resultado por Pergunta</h3>
                    
                    {questions.map((question, index) => {
                      const questionResponses = responses.filter(r => r.questionId === question.id);
                      const correctResponses = questionResponses.filter(r => r.isCorrect);
                      
                      return (
                        <div key={question.id} className="border rounded-lg p-4">
                          <div className="flex justify-between mb-2">
                            <h4 className="font-medium">Pergunta {index + 1}</h4>
                            <span className="text-sm">
                              {question.type === 'short' ? 'Resposta Curta' : (
                                <span className={correctResponses.length > 0 ? "text-green-600" : "text-red-600"}>
                                  {correctResponses.length}/{questionResponses.length} Corretas
                                </span>
                              )}
                            </span>
                          </div>
                          
                          <p className="text-sm mb-3">{question.question}</p>
                          
                          {question.type === 'multiple' && question.options && (
                            <div className="space-y-1 ml-4">
                              {question.options.map((option, i) => {
                                const optionResponses = questionResponses.filter(r => r.response === option);
                                const percentage = questionResponses.length > 0 ? 
                                  Math.round((optionResponses.length / questionResponses.length) * 100) : 0;
                                
                                return (
                                  <div key={i} className="flex items-center">
                                    <div className="w-32 flex items-center">
                                      <span className="mr-2 text-xs">{String.fromCharCode(65 + i)}.</span>
                                      <span className={option === question.correctAnswer ? "text-green-600 text-sm" : "text-sm"}>
                                        {option}
                                      </span>
                                      {option === question.correctAnswer && (
                                        <CheckCircle2 className="w-3 h-3 ml-1 text-green-600" />
                                      )}
                                    </div>
                                    <div className="flex-1 ml-2">
                                      <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full ${option === question.correctAnswer ? 'bg-green-300' : 'bg-blue-300'}`}
                                          style={{ width: `${percentage}%` }}
                                        />
                                      </div>
                                    </div>
                                    <span className="text-xs ml-2 w-12 text-right">{percentage}%</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          {question.type === 'truefalse' && (
                            <div className="space-y-1 ml-4">
                              {[true, false].map((option, i) => {
                                const optionResponses = questionResponses.filter(r => r.response === option);
                                const percentage = questionResponses.length > 0 ? 
                                  Math.round((optionResponses.length / questionResponses.length) * 100) : 0;
                                
                                return (
                                  <div key={i} className="flex items-center">
                                    <div className="w-32 flex items-center">
                                      <span className={option === question.correctAnswer ? "text-green-600 text-sm" : "text-sm"}>
                                        {option ? 'Verdadeiro' : 'Falso'}
                                      </span>
                                      {option === question.correctAnswer && (
                                        <CheckCircle2 className="w-3 h-3 ml-1 text-green-600" />
                                      )}
                                    </div>
                                    <div className="flex-1 ml-2">
                                      <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full ${option === question.correctAnswer ? 'bg-green-300' : 'bg-blue-300'}`}
                                          style={{ width: `${percentage}%` }}
                                        />
                                      </div>
                                    </div>
                                    <span className="text-xs ml-2 w-12 text-right">{percentage}%</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          {question.type === 'short' && questionResponses.length > 0 && (
                            <div className="space-y-2 ml-4">
                              <p className="text-xs text-gray-500 mb-1">Algumas respostas:</p>
                              {questionResponses.slice(0, 3).map((response, i) => (
                                <div key={i} className="p-2 bg-gray-50 rounded text-sm">
                                  {response.response}
                                </div>
                              ))}
                              {questionResponses.length > 3 && (
                                <p className="text-xs text-gray-500">
                                  +{questionResponses.length - 3} outras respostas
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BarChart2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Sem dados de resultados disponíveis.</p>
                  <p className="text-sm mt-2">
                    Inicie um quiz e colete respostas para ver os resultados.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 