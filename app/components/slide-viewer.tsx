"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Download, Copy } from "lucide-react"

interface SlideViewerProps {
  content: string
}

export default function SlideViewer({ content }: SlideViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Parse the content into slides (simplified parsing)
  const parseSlides = (content: string) => {
    const lines = content.split("\n")
    const slides = []
    let currentSlideContent = []
    let slideTitle = ""

    for (const line of lines) {
      if (line.startsWith("# ") || line.startsWith("## ")) {
        if (currentSlideContent.length > 0) {
          slides.push({
            title: slideTitle,
            content: currentSlideContent.join("\n"),
          })
          currentSlideContent = []
        }
        slideTitle = line.replace(/^#+\s/, "")
      } else if (line.trim()) {
        currentSlideContent.push(line)
      }
    }

    if (currentSlideContent.length > 0) {
      slides.push({
        title: slideTitle,
        content: currentSlideContent.join("\n"),
      })
    }

    return slides.length > 0 ? slides : [{ title: "Apresentação", content }]
  }

  const slides = parseSlides(content)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Slides Gerados</CardTitle>
            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Copiar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-white border-2 border-gray-200 rounded-lg p-8 min-h-[400px] shadow-inner">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{slides[currentSlide]?.title}</h2>
              <div className="w-16 h-1 bg-blue-500 mx-auto"></div>
            </div>

            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">{slides[currentSlide]?.content}</div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button onClick={prevSlide} disabled={slides.length <= 1} variant="outline">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            <span className="text-sm text-gray-600">
              {currentSlide + 1} de {slides.length}
            </span>

            <Button onClick={nextSlide} disabled={slides.length <= 1} variant="outline">
              Próximo
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conteúdo Completo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">{content}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
