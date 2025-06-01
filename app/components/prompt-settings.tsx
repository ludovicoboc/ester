"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Settings, Save, RotateCcw } from "lucide-react"

export default function PromptSettings() {
  const [systemPrompt, setSystemPrompt] =
    useState(`Você é um especialista em criação de apresentações e pesquisa acadêmica. Sua tarefa é:

1. Realizar uma pesquisa profunda sobre o tópico fornecido
2. Estruturar o conteúdo em slides organizados e coerentes
3. Incluir informações atualizadas e relevantes
4. Fornecer fontes confiáveis para cada informação

Formato de resposta esperado:
- Título da apresentação
- Estrutura de slides com títulos e conteúdo detalhado
- Sugestões de elementos visuais
- Fontes e referências

Mantenha um tom profissional e educativo.`)

  const [chatPrompt, setChatPrompt] =
    useState(`Você é um assistente especializado em criação e refinamento de apresentações.

Suas responsabilidades:
- Ajudar a refinar e melhorar slides existentes
- Sugerir melhorias no conteúdo e estrutura
- Responder perguntas sobre o tema da apresentação
- Fornecer informações atualizadas e precisas
- Manter consistência com o material já criado

Sempre forneça respostas construtivas e específicas para melhorar a qualidade da apresentação.`)

  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(4000)

  const resetToDefaults = () => {
    setSystemPrompt(`Você é um especialista em criação de apresentações e pesquisa acadêmica. Sua tarefa é:

1. Realizar uma pesquisa profunda sobre o tópico fornecido
2. Estruturar o conteúdo em slides organizados e coerentes
3. Incluir informações atualizadas e relevantes
4. Fornecer fontes confiáveis para cada informação

Formato de resposta esperado:
- Título da apresentação
- Estrutura de slides com títulos e conteúdo detalhado
- Sugestões de elementos visuais
- Fontes e referências

Mantenha um tom profissional e educativo.`)

    setChatPrompt(`Você é um assistente especializado em criação e refinamento de apresentações.

Suas responsabilidades:
- Ajudar a refinar e melhorar slides existentes
- Sugerir melhorias no conteúdo e estrutura
- Responder perguntas sobre o tema da apresentação
- Fornecer informações atualizadas e precisas
- Manter consistência com o material já criado

Sempre forneça respostas construtivas e específicas para melhorar a qualidade da apresentação.`)

    setTemperature(0.7)
    setMaxTokens(4000)
  }

  const saveSettings = () => {
    // Aqui você salvaria as configurações no localStorage ou backend
    localStorage.setItem(
      "slideGenerator_settings",
      JSON.stringify({
        systemPrompt,
        chatPrompt,
        temperature,
        maxTokens,
      }),
    )
    alert("Configurações salvas com sucesso!")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações de Prompt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Prompt do Sistema (Geração de Slides)</label>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={8}
              className="w-full font-mono text-sm"
              placeholder="Defina como a IA deve se comportar ao gerar slides..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Prompt do Chat (Refinamento)</label>
            <Textarea
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
              rows={6}
              className="w-full font-mono text-sm"
              placeholder="Defina como a IA deve se comportar no chat..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parâmetros do Modelo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Temperatura ({temperature})</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(Number.parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-600 mt-1">
              Controla a criatividade das respostas (0 = mais focado, 1 = mais criativo)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Máximo de Tokens</label>
            <Input
              type="number"
              min="1000"
              max="8000"
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number.parseInt(e.target.value))}
              className="w-32"
            />
            <p className="text-xs text-gray-600 mt-1">Limite de tokens para as respostas</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={saveSettings} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
        <Button onClick={resetToDefaults} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Restaurar Padrões
        </Button>
      </div>
    </div>
  )
}
