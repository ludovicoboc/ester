"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RotateCcw, Save } from "lucide-react"

const defaultPrompts = {
  standard: `Você é um especialista em criação de apresentações e pesquisa acadêmica. Sua tarefa é:

1. Realizar uma pesquisa profunda sobre o tópico fornecido
2. Estruturar o conteúdo em slides organizados e coerentes
3. Incluir informações atualizadas e relevantes
4. Fornecer fontes confiáveis para cada informação

Formato de resposta esperado:
- Título da apresentação
- Estrutura de slides com títulos e conteúdo detalhado
- Sugestões de elementos visuais
- Fontes e referências

Mantenha um tom profissional e educativo.`,
  
  educational: `Você é um especialista em educação e criação de material didático. Sua tarefa é:

1. Criar slides educacionais sobre o tópico fornecido, adequados para uso em sala de aula
2. Adaptar o conteúdo para o nível educacional apropriado (ensino fundamental/médio)
3. Estruturar os slides de forma clara e didática
4. Incluir exemplos práticos e analogias para facilitar o entendimento
5. Sugerir atividades ou perguntas para discussão em classe

Formato de resposta esperado:
- Slide de título atraente
- Objetivos de aprendizagem
- Conteúdo explicativo em linguagem acessível
- Exemplos concretos e imagens sugeridas
- Atividades para fixação do conteúdo
- Perguntas para estimular discussão

Mantenha um tom educativo, engajador e adequado para estudantes.`,
  
  simplified: `Você é um especialista em simplificar conceitos complexos. Sua tarefa é:

1. Criar slides sobre o tópico fornecido usando linguagem simples e acessível
2. Explicar conceitos difíceis de forma que iniciantes possam entender
3. Usar analogias e exemplos do dia a dia
4. Evitar jargões técnicos desnecessários

Formato de resposta esperado:
- Título simples e direto
- Explicações em linguagem cotidiana
- Comparações com situações familiares
- Ilustrações e exemplos práticos sugeridos

Mantenha um tom conversacional e amigável.`
}

export default function PromptSettings() {
  const [activeTab, setActiveTab] = useState("general")
  const [includeImages, setIncludeImages] = useState(true)
  const [includeExamples, setIncludeExamples] = useState(true)
  const [simpleLanguage, setSimpleLanguage] = useState(false)
  const [includeQuestions, setIncludeQuestions] = useState(true)
  const [promptTemplate, setPromptTemplate] = useState(defaultPrompts.standard)
  const [isEducationalFocus, setIsEducationalFocus] = useState(false)
  const [selectedPromptType, setSelectedPromptType] = useState("standard")

  const handlePromptTypeChange = (type) => {
    setSelectedPromptType(type)
    setPromptTemplate(defaultPrompts[type])
  }

  const handleResetPrompt = () => {
    setPromptTemplate(defaultPrompts[selectedPromptType])
  }

  const handleSaveSettings = () => {
    // Simulação de salvamento
    localStorage.setItem("slideSettings", JSON.stringify({
      includeImages,
      includeExamples,
      simpleLanguage,
      includeQuestions,
      isEducationalFocus,
      promptTemplate,
      selectedPromptType
    }))
    
    alert("Configurações salvas com sucesso!")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Geração</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="prompt">Prompt Personalizado</TabsTrigger>
            <TabsTrigger value="educational">Foco Educacional</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="images">Incluir sugestões de imagens</Label>
                  <p className="text-sm text-gray-500">
                    Sugerir imagens relevantes para cada slide
                  </p>
                </div>
                <Switch 
                  id="images" 
                  checked={includeImages}
                  onCheckedChange={setIncludeImages}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="examples">Incluir exemplos práticos</Label>
                  <p className="text-sm text-gray-500">
                    Adicionar exemplos concretos para ilustrar conceitos
                  </p>
                </div>
                <Switch 
                  id="examples" 
                  checked={includeExamples}
                  onCheckedChange={setIncludeExamples}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="language">Linguagem simplificada</Label>
                  <p className="text-sm text-gray-500">
                    Usar terminologia mais acessível e explicações simples
                  </p>
                </div>
                <Switch 
                  id="language" 
                  checked={simpleLanguage}
                  onCheckedChange={setSimpleLanguage}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="questions">Incluir perguntas para discussão</Label>
                  <p className="text-sm text-gray-500">
                    Adicionar perguntas para estimular o pensamento crítico
                  </p>
                </div>
                <Switch 
                  id="questions" 
                  checked={includeQuestions}
                  onCheckedChange={setIncludeQuestions}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="prompt" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Modelo de Prompt</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant={selectedPromptType === "standard" ? "default" : "outline"}
                    onClick={() => handlePromptTypeChange("standard")}
                    className="w-full"
                  >
                    Padrão
                  </Button>
                  <Button 
                    variant={selectedPromptType === "educational" ? "default" : "outline"}
                    onClick={() => handlePromptTypeChange("educational")}
                    className="w-full"
                  >
                    Educacional
                  </Button>
                  <Button 
                    variant={selectedPromptType === "simplified" ? "default" : "outline"}
                    onClick={() => handlePromptTypeChange("simplified")}
                    className="w-full"
                  >
                    Simplificado
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-prompt">Prompt Personalizado</Label>
                <Textarea 
                  id="custom-prompt" 
                  value={promptTemplate}
                  onChange={(e) => setPromptTemplate(e.target.value)}
                  rows={10}
                  placeholder="Insira instruções personalizadas para a IA..."
                  className="font-mono text-sm"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={handleResetPrompt}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restaurar Padrão
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="educational" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="educational-focus">Otimizar para Uso Educacional</Label>
                  <p className="text-sm text-gray-500">
                    Adaptar a apresentação para uso em sala de aula e contextos educacionais
                  </p>
                </div>
                <Switch 
                  id="educational-focus" 
                  checked={isEducationalFocus}
                  onCheckedChange={setIsEducationalFocus}
                />
              </div>
              
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <h3 className="text-base font-medium mb-2">Recursos Educacionais</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Switch id="obj" checked={isEducationalFocus} disabled={!isEducationalFocus} />
                      <div>
                        <Label htmlFor="obj">Objetivos de Aprendizagem</Label>
                        <p className="text-xs text-gray-500">
                          Incluir slide com objetivos claros da aula
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Switch id="activity" checked={isEducationalFocus} disabled={!isEducationalFocus} />
                      <div>
                        <Label htmlFor="activity">Atividades para Fixação</Label>
                        <p className="text-xs text-gray-500">
                          Incluir exercícios e atividades práticas
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Switch id="summary" checked={isEducationalFocus} disabled={!isEducationalFocus} />
                      <div>
                        <Label htmlFor="summary">Resumo e Revisão</Label>
                        <p className="text-xs text-gray-500">
                          Incluir slide de resumo e revisão dos conceitos
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Switch id="references" checked={isEducationalFocus} disabled={!isEducationalFocus} />
                      <div>
                        <Label htmlFor="references">Material Complementar</Label>
                        <p className="text-xs text-gray-500">
                          Sugerir material adicional para estudantes
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-6">
          <Button onClick={handleSaveSettings}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
