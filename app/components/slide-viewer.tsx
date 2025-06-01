"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Copy, 
  Eye, 
  EyeOff,
  Clock,
  Highlighter,
  Eraser,
  ZoomIn,
  ZoomOut
} from "lucide-react"
import { type SlideTheme, defaultThemes } from "./slide-styles"
import { type HighlightToolType, type HighlightSettings } from "./highlight-tools"
import { type TransitionType } from "./transition-controls"
import { cn } from "@/lib/utils"

interface SlideViewerProps {
  content: string
  themeId?: string
  onSlideChange?: (slideIndex: number) => void
}

export default function SlideViewer({ content, themeId = "clean", onSlideChange }: SlideViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<Array<{ title: string; content: string }>>([])
  const [showControls, setShowControls] = useState(true)
  const [currentTransition, setCurrentTransition] = useState<TransitionType>('fade')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [highlights, setHighlights] = useState<Array<{
    id: string;
    type: HighlightToolType;
    settings: HighlightSettings;
    position?: { x: number; y: number };
    visible: boolean;
    expiresAt?: number;
  }>>([])
  
  // Parse the content into slides 
  useEffect(() => {
    setSlides(parseSlides(content));
  }, [content]);

  // Notificar sobre mudança de slide
  useEffect(() => {
    onSlideChange?.(currentSlide);
  }, [currentSlide, onSlideChange]);

  // Gerenciar expiração dos destaques temporários
  useEffect(() => {
    const now = Date.now();
    const updatedHighlights = highlights.map(highlight => {
      if (highlight.expiresAt && highlight.expiresAt < now) {
        return { ...highlight, visible: false };
      }
      return highlight;
    });
    
    if (JSON.stringify(updatedHighlights) !== JSON.stringify(highlights)) {
      setHighlights(updatedHighlights);
    }
    
    const checkInterval = setInterval(() => {
      const now = Date.now();
      const updatedHighlights = highlights.map(highlight => {
        if (highlight.expiresAt && highlight.expiresAt < now) {
          return { ...highlight, visible: false };
        }
        return highlight;
      });
      
      if (JSON.stringify(updatedHighlights) !== JSON.stringify(highlights)) {
        setHighlights(updatedHighlights);
      }
    }, 1000);
    
    return () => clearInterval(checkInterval);
  }, [highlights]);

  // Parse the content into slides
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

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      changeSlide(currentSlide + 1);
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      changeSlide(currentSlide - 1);
    }
  }
  
  const changeSlide = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, 400); // Duração da transição
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content)
  }

  // Encontrar o tema atual com base no ID
  const currentTheme = defaultThemes.find(theme => theme.id === themeId) || defaultThemes[0]

  // Aplicar estilos baseados no tema
  const slideStyle = {
    backgroundColor: currentTheme.primaryColor,
    fontFamily: currentTheme.fontFamily,
    borderColor: currentTheme.secondaryColor,
  }

  const titleStyle = {
    color: themeId === "dark" ? "#ffffff" : "#1a202c",
  }

  const contentStyle = {
    color: themeId === "dark" ? "#e2e8f0" : "#4a5568",
  }

  const dividerStyle = {
    backgroundColor: currentTheme.accentColor,
  }

  // Adicionar um destaque
  const addHighlight = (type: HighlightToolType, settings: HighlightSettings, position?: { x: number; y: number }) => {
    const newHighlight = {
      id: `highlight-${Date.now()}`,
      type,
      settings: { ...settings },
      position: position || { x: 50, y: 50 }, // Posição padrão no centro
      visible: true,
      expiresAt: settings.mode === 'temporary' ? Date.now() + (settings.temporaryDuration * 1000) : undefined
    };
    
    setHighlights([...highlights, newHighlight]);
  };

  // Limpar todos os destaques
  const clearHighlights = () => {
    setHighlights([]);
  };

  // Função para exportar os slides em formato HTML
  const exportToHTML = () => {
    // Construindo o conteúdo HTML
    let htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Apresentação: ${slides[0]?.title || "Apresentação"}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Nunito:wght@400;700&family=Poppins:wght@400;700&family=Quicksand:wght@400;700&display=swap');
        
        body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
        }
        
        body {
            font-family: ${currentTheme.fontFamily};
        }
        
        .slide-container {
            position: relative;
            width: 100vw;
            height: 100vh;
            display: none;
            flex-direction: column;
            justify-content: center;
            padding: 2rem;
            box-sizing: border-box;
            background-color: ${currentTheme.primaryColor};
        }
        
        .slide-container.active {
            display: flex;
        }
        
        .slide-title {
            text-align: center;
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
            color: ${themeId === "dark" ? "#ffffff" : "#1a202c"};
        }
        
        .slide-divider {
            width: 80px;
            height: 4px;
            background-color: ${currentTheme.accentColor};
            margin: 0 auto 2rem auto;
        }
        
        .slide-content {
            max-width: 800px;
            margin: 0 auto;
            font-size: 1.5rem;
            line-height: 1.6;
            color: ${themeId === "dark" ? "#e2e8f0" : "#4a5568"};
        }
        
        .controls {
            position: fixed;
            bottom: 20px;
            right: 20px;
            display: flex;
            gap: 10px;
        }
        
        .control-btn {
            background-color: ${currentTheme.accentColor};
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .slide-number {
            position: fixed;
            bottom: 20px;
            left: 20px;
            font-size: 0.9rem;
            color: ${themeId === "dark" ? "#e2e8f0" : "#4a5568"};
        }
        
        /* Estilos para transições */
        .fade-transition {
            transition: opacity 0.5s ease-in-out;
        }
        
        .slide-transition {
            transition: transform 0.5s ease-in-out;
        }
        
        .zoom-transition {
            transition: transform 0.5s ease-in-out, opacity 0.5s ease-in-out;
        }
    </style>
</head>
<body>
    `;

    // Adicionar cada slide
    slides.forEach((slide, index) => {
      htmlContent += `
    <div class="slide-container ${index === 0 ? 'active' : ''}" id="slide-${index + 1}">
        <h2 class="slide-title">${slide.title}</h2>
        <div class="slide-divider"></div>
        <div class="slide-content">
            ${slide.content
              .replace(/\n/g, "<br>")
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              .replace(/\*(.*?)\*/g, "<em>$1</em>")
              .replace(/- (.*?)$/gm, "• $1<br>")}
        </div>
        <div class="slide-number">${index + 1} / ${slides.length}</div>
    </div>`;
    });

    // Adicionar controles de navegação e JavaScript
    htmlContent += `
    <div class="controls">
        <button class="control-btn" onclick="prevSlide()">&#8249;</button>
        <button class="control-btn" onclick="nextSlide()">&#8250;</button>
    </div>

    <script>
        let currentSlide = 1;
        let transitionType = 'fade';
        const totalSlides = ${slides.length};
        
        function showSlide(slideNumber) {
            // Aplicar transição de saída
            const currentSlideElement = document.getElementById('slide-' + currentSlide);
            
            // Ocultar slide atual com transição
            switch(transitionType) {
                case 'fade':
                    currentSlideElement.style.opacity = '0';
                    break;
                case 'slide':
                    currentSlideElement.style.transform = 'translateX(-100%)';
                    break;
                case 'zoom':
                    currentSlideElement.style.transform = 'scale(0.8)';
                    currentSlideElement.style.opacity = '0';
                    break;
            }
            
            setTimeout(() => {
                // Remover classe ativa de todos os slides
                document.querySelectorAll('.slide-container').forEach(slide => {
                    slide.classList.remove('active');
                    slide.style.opacity = '';
                    slide.style.transform = '';
                });
                
                // Mostrar o novo slide
                const newSlide = document.getElementById('slide-' + slideNumber);
                newSlide.classList.add('active');
                
                // Aplicar transição de entrada
                if (transitionType === 'fade') {
                    newSlide.style.opacity = '0';
                    setTimeout(() => {
                        newSlide.style.opacity = '1';
                    }, 50);
                } else if (transitionType === 'slide') {
                    newSlide.style.transform = 'translateX(100%)';
                    setTimeout(() => {
                        newSlide.style.transform = 'translateX(0)';
                    }, 50);
                } else if (transitionType === 'zoom') {
                    newSlide.style.transform = 'scale(1.2)';
                    newSlide.style.opacity = '0';
                    setTimeout(() => {
                        newSlide.style.transform = 'scale(1)';
                        newSlide.style.opacity = '1';
                    }, 50);
                }
                
                currentSlide = slideNumber;
            }, 300);
        }
        
        function nextSlide() {
            let next = currentSlide + 1;
            if (next > totalSlides) next = 1;
            showSlide(next);
        }
        
        function prevSlide() {
            let prev = currentSlide - 1;
            if (prev < 1) prev = totalSlides;
            showSlide(prev);
        }
        
        // Aplicar transições a todos os slides
        document.querySelectorAll('.slide-container').forEach(slide => {
            slide.classList.add('fade-transition');
        });
        
        // Controles de teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                nextSlide();
            } else if (e.key === 'ArrowLeft') {
                prevSlide();
            }
        });
    </script>
</body>
</html>
    `;

    // Criar um blob com o conteúdo HTML
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    // Criar um link para download e clicar automaticamente
    const a = document.createElement("a");
    a.href = url;
    a.download = `apresentacao-${slides[0]?.title || "slides"}.html`.replace(/\s+/g, "-").toLowerCase();
    a.click();

    // Limpar o objeto URL
    URL.revokeObjectURL(url);
  };

  // Atualizar o tipo de transição
  const updateTransitionType = (type: TransitionType) => {
    setCurrentTransition(type);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2">
              Apresentação
              <span className="text-sm font-normal text-gray-500">
                Slide {currentSlide + 1} de {slides.length}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowControls(!showControls)}>
                {showControls ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={exportToHTML}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Slide Container */}
          <div 
            className="relative aspect-video overflow-hidden"
            style={slideStyle}
          >
            {/* Slide Content */}
            <div 
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center p-6 transition-all",
                isTransitioning ? (
                  currentTransition === 'fade' ? 'opacity-0' : 
                  currentTransition === 'slide' ? 'translate-x-full' :
                  currentTransition === 'zoom' ? 'scale-150 opacity-0' :
                  currentTransition === 'flip' ? 'rotateY-90' :
                  currentTransition === 'rotate' ? 'rotate-90 opacity-0' : ''
                ) : ''
              )}
              style={{
                transitionDuration: '400ms'
              }}
            >
              <h2 
                className="text-2xl font-bold mb-4 text-center"
                style={titleStyle}
              >
                {slides[currentSlide]?.title || "Apresentação"}
              </h2>
              <div 
                className="w-12 h-1 mb-6"
                style={dividerStyle}
              ></div>
              <div 
                className="prose max-w-md lg:max-w-lg"
                style={contentStyle}
              >
                <div 
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ 
                    __html: slides[currentSlide]?.content
                      .replace(/\n/g, "<br>")
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\*(.*?)\*/g, "<em>$1</em>")
                      .replace(/- (.*?)$/gm, "• $1<br>") || ""
                  }}
                />
              </div>
            </div>
            
            {/* Destaques */}
            {highlights.filter(h => h.visible).map(highlight => (
              <div key={highlight.id}>
                {highlight.type === 'marker' && (
                  <div 
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: `${highlight.settings.size * 3}px`,
                      height: `${highlight.settings.size}px`,
                      backgroundColor: highlight.settings.color,
                      opacity: 0.5,
                      top: `${highlight.position?.y || 50}%`,
                      left: `${highlight.position?.x || 50}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                )}
                
                {highlight.type === 'zoom' && (
                  <div 
                    className="absolute"
                    style={{
                      width: `${highlight.settings.size * 5}px`,
                      height: `${highlight.settings.size * 5}px`,
                      top: `${highlight.position?.y || 50}%`,
                      left: `${highlight.position?.x || 50}%`,
                      transform: 'translate(-50%, -50%)',
                      borderRadius: '50%',
                      border: '2px solid rgba(14, 165, 233, 0.8)',
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 0 15px rgba(14, 165, 233, 0.5)',
                      pointerEvents: 'none',
                      zIndex: 10
                    }}
                  />
                )}
                
                {highlight.type === 'curtain' && (
                  <div 
                    className="absolute bg-white pointer-events-none"
                    style={{
                      width: '100%',
                      height: `${highlight.position?.y || 50}%`,
                      top: 0,
                      left: 0,
                      borderBottom: '2px dashed #0ea5e9'
                    }}
                  />
                )}
              </div>
            ))}
            
            {/* Ferramentas de destaque flutuantes */}
            {showControls && (
              <div className="absolute right-4 top-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-1">
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => addHighlight('marker', {
                      activeToolType: 'marker',
                      mode: 'temporary',
                      color: '#ef4444',
                      size: 15,
                      temporaryDuration: 5
                    })}
                  >
                    <Highlighter className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => addHighlight('zoom', {
                      activeToolType: 'zoom',
                      mode: 'temporary',
                      color: '#0ea5e9',
                      size: 20,
                      temporaryDuration: 5
                    })}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={clearHighlights}
                  >
                    <Eraser className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Temporizador */}
          <div 
            className={cn(
              "px-4 py-2 flex justify-between items-center",
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
            style={{
              transition: 'opacity 0.3s ease-in-out'
            }}
          >
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={prevSlide} disabled={currentSlide === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={nextSlide} disabled={currentSlide === slides.length - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2 items-center">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500">
                00:00
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
