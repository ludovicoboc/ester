"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Palette, Check } from "lucide-react"

export interface SlideTheme {
  id: string
  name: string
  description: string
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  accentColor: string
}

const defaultThemes: SlideTheme[] = [
  {
    id: "clean",
    name: "Clássico",
    description: "Design minimalista e profissional",
    primaryColor: "#ffffff",
    secondaryColor: "#f8f9fa",
    fontFamily: "'Inter', sans-serif",
    accentColor: "#3b82f6"
  },
  {
    id: "education",
    name: "Educacional",
    description: "Colorido e adequado para sala de aula",
    primaryColor: "#f0f9ff",
    secondaryColor: "#e0f2fe",
    fontFamily: "'Nunito', sans-serif",
    accentColor: "#0ea5e9"
  },
  {
    id: "dark",
    name: "Escuro",
    description: "Contraste elevado, bom para ambientes claros",
    primaryColor: "#1e293b",
    secondaryColor: "#0f172a",
    fontFamily: "'Inter', sans-serif",
    accentColor: "#38bdf8"
  },
  {
    id: "pastel",
    name: "Pastel",
    description: "Cores suaves e acolhedoras",
    primaryColor: "#fdf2f8",
    secondaryColor: "#fbcfe8",
    fontFamily: "'Quicksand', sans-serif",
    accentColor: "#ec4899"
  },
  {
    id: "nature",
    name: "Natureza",
    description: "Tons de verde e elementos naturais",
    primaryColor: "#f0fdf4",
    secondaryColor: "#dcfce7",
    fontFamily: "'Poppins', sans-serif",
    accentColor: "#22c55e"
  }
]

interface SlideStylesProps {
  selectedTheme: string
  onThemeChange: (themeId: string) => void
}

export default function SlideStyles({ selectedTheme, onThemeChange }: SlideStylesProps) {
  // Encontrar o tema atual com base no ID
  const currentTheme = defaultThemes.find(theme => theme.id === selectedTheme) || defaultThemes[0]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Estilo dos Slides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedTheme} onValueChange={onThemeChange} className="space-y-4">
            {defaultThemes.map((theme) => (
              <div 
                key={theme.id} 
                className={`flex items-start space-x-3 border rounded-lg p-3 cursor-pointer hover:border-blue-300 transition-colors ${
                  selectedTheme === theme.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => onThemeChange(theme.id)}
              >
                <RadioGroupItem value={theme.id} id={`theme-${theme.id}`} className="mt-1" />
                <div className="flex-1">
                  <Label 
                    htmlFor={`theme-${theme.id}`} 
                    className="text-base font-medium cursor-pointer"
                  >
                    {theme.name}
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    {theme.description}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {[theme.primaryColor, theme.secondaryColor, theme.accentColor].map((color, i) => (
                      <div 
                        key={i} 
                        className="w-6 h-6 rounded-full border border-gray-200" 
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Visualização prévia do tema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Visualização Prévia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="border-2 rounded-lg p-6 shadow-inner"
            style={{
              backgroundColor: currentTheme.primaryColor,
              fontFamily: currentTheme.fontFamily,
              borderColor: currentTheme.secondaryColor,
            }}
          >
            <div className="text-center mb-4">
              <h2 
                className="text-xl font-bold mb-2"
                style={{
                  color: selectedTheme === "dark" ? "#ffffff" : "#1a202c",
                }}
              >
                Exemplo de Slide
              </h2>
              <div 
                className="w-12 h-1 mx-auto"
                style={{
                  backgroundColor: currentTheme.accentColor,
                }}
              ></div>
            </div>

            <div className="prose max-w-none">
              <div 
                className="whitespace-pre-wrap leading-relaxed"
                style={{
                  color: selectedTheme === "dark" ? "#e2e8f0" : "#4a5568",
                }}
              >
                <ul className="list-disc pl-5 space-y-2">
                  <li>Este é um exemplo de como os slides ficarão</li>
                  <li>Cada tema tem suas próprias cores e estilo</li>
                  <li>Escolha o que melhor se adapta à sua apresentação</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Button 
              variant="default"
              className="gap-2"
            >
              <Check className="w-4 h-4" />
              Aplicar tema "{currentTheme.name}"
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { defaultThemes } 