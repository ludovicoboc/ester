"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Presentation, Settings, Loader2 } from "lucide-react"
import ChatInterface from "./components/chat-interface"
import SlideViewer from "./components/slide-viewer"
import DocumentUpload from "./components/document-upload"
import PromptSettings from "./components/prompt-settings"

export default function SlideGenerator() {
  const [activeTab, setActiveTab] = useState("generator")
  const [topic, setTopic] = useState("")
  const [slideCount, setSlideCount] = useState(10)
  const [documents, setDocuments] = useState<string[]>([])
  const [generatedContent, setGeneratedContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [chatContext, setChatContext] = useState("")

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

            {activeTab === "slides" && generatedContent && <SlideViewer content={generatedContent} />}

            {activeTab === "chat" && generatedContent && <ChatInterface context={chatContext} />}

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
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`text-sm font-medium ${generatedContent ? "text-green-600" : "text-gray-400"}`}>
                      {generatedContent ? "Pronto" : "Aguardando"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dicas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Seja específico no tópico para melhores resultados</li>
                  <li>• Anexe documentos relevantes para enriquecer o conteúdo</li>
                  <li>• Use o chat para refinar e melhorar os slides</li>
                  <li>• Ajuste as configurações conforme necessário</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
