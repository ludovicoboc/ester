"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  MessageSquare, 
  Presentation, 
  Settings, 
  Loader2, 
  Palette,
  Timer,
  BookOpen,
  HelpCircle,
  Highlighter,
  Wand2
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ChatInterface from "./components/chat-interface"
import SlideViewer from "./components/slide-viewer"
import DocumentUpload from "./components/document-upload"
import PromptSettings from "./components/prompt-settings"
import SlideStyles from "./components/slide-styles"
import TimerControl from "./components/timer-control"
import TeacherNotes from "./components/teacher-notes"
import QuizSystem from "./components/quiz-system"
import HighlightTools from "./components/highlight-tools"
import TransitionControls from "./components/transition-controls"

// Interface para as configurações
interface SlideSettings {
  includeImages: boolean
  includeExamples: boolean
  simpleLanguage: boolean
  includeQuestions: boolean
  isEducationalFocus: boolean
  promptTemplate: string
  selectedPromptType: string
}

// Configurações padrão
const defaultSettings: SlideSettings = {
  includeImages: true,
  includeExamples: true,
  simpleLanguage: false,
  includeQuestions: true,
  isEducationalFocus: false,
  promptTemplate: "",
  selectedPromptType: "standard"
}

export default function SlideGenerator() {
  const [activeTab, setActiveTab] = useState("generator")
  const [topic, setTopic] = useState("")
  const [slideCount, setSlideCount] = useState(10)
  const [documents, setDocuments] = useState<string[]>([])
  const [generatedContent, setGeneratedContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [chatContext, setChatContext] = useState("")
  const [selectedTheme, setSelectedTheme] = useState("clean")
  const [settings, setSettings] = useState<SlideSettings>(defaultSettings)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [totalSlides, setTotalSlides] = useState(0)
  const [activeToolTab, setActiveToolTab] = useState("timer")
  const [slideNotes, setSlideNotes] = useState({})

  // Carregar configurações salvas quando o componente montar
  useEffect(() => {
    const savedSettings = localStorage.getItem("slideSettings")
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error("Erro ao carregar configurações:", error)
      }
    }

    const savedNotes = localStorage.getItem("slideNotes")
    if (savedNotes) {
      try {
        setSlideNotes(JSON.parse(savedNotes))
      } catch (error) {
        console.error("Erro ao carregar anotações:", error)
      }
    }
  }, [])

  // Atualizar o número total de slides quando o conteúdo for gerado
  useEffect(() => {
    if (generatedContent) {
      // Contar os títulos de slides no conteúdo gerado
      const slideMatches = generatedContent.match(/^#\s/gm);
      setTotalSlides(slideMatches ? slideMatches.length : 1);
    } else {
      setTotalSlides(0);
    }
  }, [generatedContent]);

  const handleGenerate = async () => {
    if (!topic.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          documents,
          slideCount,
          themeId: selectedTheme,
          promptTemplate: settings.promptTemplate,
          includeImages: settings.includeImages,
          includeExamples: settings.includeExamples,
          simpleLanguage: settings.simpleLanguage,
          includeQuestions: settings.includeQuestions,
          isEducationalFocus: settings.isEducationalFocus
        }),
      })

      const data = await response.json()
      if (data.success) {
        setGeneratedContent(data.content)
        setChatContext(`Apresentação sobre: ${topic}`)
        setActiveTab("slides")
      }
    } catch (error) {
      console.error("Erro ao gerar slides:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Salvar anotações no localStorage
  const handleNotesChange = (notes) => {
    setSlideNotes(notes);
    localStorage.setItem("slideNotes", JSON.stringify(notes));
  };

  // Lidar com a alteração do slide atual
  const handleSlideChange = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gerador de Slides IA</h1>
          <p className="text-gray-600">
            Crie apresentações profissionais automaticamente usando IA e pesquisa avançada
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
          <Button
            variant={activeTab === "generator" ? "default" : "ghost"}
            onClick={() => setActiveTab("generator")}
            className="flex items-center gap-2"
          >
            <Presentation className="w-4 h-4" />
            Gerador
          </Button>
          <Button
            variant={activeTab === "slides" ? "default" : "ghost"}
            onClick={() => setActiveTab("slides")}
            className="flex items-center gap-2"
            disabled={!generatedContent}
          >
            <MessageSquare className="w-4 h-4" />
            Slides
          </Button>
          <Button
            variant={activeTab === "chat" ? "default" : "ghost"}
            onClick={() => setActiveTab("chat")}
            className="flex items-center gap-2"
            disabled={!generatedContent}
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </Button>
          <Button
            variant={activeTab === "tools" ? "default" : "ghost"}
            onClick={() => setActiveTab("tools")}
            className="flex items-center gap-2"
          >
            <Timer className="w-4 h-4" />
            Ferramentas
          </Button>
          <Button
            variant={activeTab === "styles" ? "default" : "ghost"}
            onClick={() => setActiveTab("styles")}
            className="flex items-center gap-2"
          >
            <Palette className="w-4 h-4" />
            Estilos
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "ghost"}
            onClick={() => setActiveTab("settings")}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Configurações
          </Button>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === "generator" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Presentation className="w-5 h-5" />
                    Criar Nova Apresentação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tópico da Apresentação</label>
                    <Input
                      placeholder="Ex: Inteligência Artificial na Medicina"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Número de Slides</label>
                    <Input
                      type="number"
                      min="5"
                      max="50"
                      value={slideCount}
                      onChange={(e) => setSlideCount(Number.parseInt(e.target.value))}
                      className="w-32"
                    />
                  </div>

                  <DocumentUpload documents={documents} onDocumentsChange={setDocuments} />

                  <Button
                    onClick={handleGenerate}
                    disabled={!topic.trim() || isGenerating}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando Apresentação...
                      </>
                    ) : (
                      <>
                        <Presentation className="w-4 h-4 mr-2" />
                        Gerar Slides
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeTab === "slides" && generatedContent && (
              <SlideViewer 
                content={generatedContent} 
                themeId={selectedTheme} 
                onSlideChange={handleSlideChange}
              />
            )}

            {activeTab === "chat" && generatedContent && <ChatInterface context={chatContext} />}

            {activeTab === "tools" && (
              <div className="space-y-6">
                <Tabs value={activeToolTab} onValueChange={setActiveToolTab}>
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="timer" className="flex items-center gap-1">
                      <Timer className="w-4 h-4" />
                      <span className="hidden sm:inline">Temporizador</span>
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span className="hidden sm:inline">Anotações</span>
                    </TabsTrigger>
                    <TabsTrigger value="quiz" className="flex items-center gap-1">
                      <HelpCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Quiz</span>
                    </TabsTrigger>
                    <TabsTrigger value="highlight" className="flex items-center gap-1">
                      <Highlighter className="w-4 h-4" />
                      <span className="hidden sm:inline">Destaque</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="timer">
                    <TimerControl 
                      totalSlides={totalSlides} 
                      currentSlide={currentSlide} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="notes">
                    <TeacherNotes 
                      currentSlide={currentSlide} 
                      totalSlides={totalSlides}
                      savedNotes={slideNotes}
                      onNotesChange={handleNotesChange}
                    />
                  </TabsContent>
                  
                  <TabsContent value="quiz">
                    <QuizSystem 
                      slideContent={generatedContent} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="highlight">
                    <HighlightTools />
                  </TabsContent>
                </Tabs>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wand2 className="w-5 h-5" />
                      Transições e Animações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TransitionControls />
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "styles" && <SlideStyles selectedTheme={selectedTheme} onThemeChange={setSelectedTheme} />}

            {activeTab === "settings" && <PromptSettings />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status da Sessão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tópico:</span>
                    <span className="text-sm font-medium">{topic || "Não definido"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Slides:</span>
                    <span className="text-sm font-medium">{slideCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Documentos:</span>
                    <span className="text-sm font-medium">{documents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Estilo:</span>
                    <span className="text-sm font-medium">{selectedTheme}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Modo Educacional:</span>
                    <span className="text-sm font-medium">{settings.isEducationalFocus ? "Ativado" : "Desativado"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`text-sm font-medium ${generatedContent ? "text-green-600" : "text-gray-400"}`}>
                      {generatedContent ? "Pronto" : "Aguardando"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {activeTab === "tools" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ferramentas Ativas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Temporizador</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-green-500" />
                      <span className="text-sm">
                        {Object.keys(slideNotes).length > 0 ? 
                          `${Object.keys(slideNotes).length} anotações salvas` : 
                          "Sem anotações"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">Quiz não iniciado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">Transição: Fade</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "generator" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dicas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>
                      Descreva o tópico com detalhes para obter melhores resultados.
                    </p>
                    <p>
                      Use a aba "Configurações" para personalizar o conteúdo gerado.
                    </p>
                    <p>
                      O modo educacional otimiza o conteúdo para uso em sala de aula.
                    </p>
                    <p>
                      Use o chat para refinar a apresentação após a geração.
                    </p>
                    <p>
                      Experimente diferentes estilos para encontrar o visual ideal.
                    </p>
                    <p>
                      Use as ferramentas docentes para melhorar a experiência em aulas expositivas.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
