"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, 
  Bold, 
  Italic, 
  List, 
  PanelLeft, 
  Save, 
  Bookmark,
  X
} from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export interface TeacherNote {
  content: string;
  markers: {
    id: string;
    x: number;
    y: number;
    color: string;
    text: string;
  }[];
}

export type SlideNotes = Record<number, TeacherNote>;

interface TeacherNotesProps {
  currentSlide: number;
  totalSlides: number;
  savedNotes?: SlideNotes;
  onNotesChange?: (notes: SlideNotes) => void;
}

const COLORS = ["#ef4444", "#f97316", "#22c55e", "#0ea5e9", "#8b5cf6"];

export default function TeacherNotes({ 
  currentSlide, 
  totalSlides, 
  savedNotes = {}, 
  onNotesChange 
}: TeacherNotesProps) {
  const [notes, setNotes] = useState<SlideNotes>(savedNotes);
  const [currentNote, setCurrentNote] = useState<string>("");
  const [markers, setMarkers] = useState<TeacherNote['markers']>([]);
  const [isAddingMarker, setIsAddingMarker] = useState<boolean>(false);
  const [selectedMarkerColor, setSelectedMarkerColor] = useState<string>(COLORS[0]);
  const [isDualViewMode, setIsDualViewMode] = useState<boolean>(false);

  // Carregar notas quando o slide mudar
  useEffect(() => {
    if (notes[currentSlide]) {
      setCurrentNote(notes[currentSlide].content);
      setMarkers(notes[currentSlide].markers);
    } else {
      setCurrentNote("");
      setMarkers([]);
    }
  }, [currentSlide, notes]);

  // Sincronizar notas externas
  useEffect(() => {
    setNotes(savedNotes);
  }, [savedNotes]);

  // Salvar notas
  const saveNotes = () => {
    const updatedNotes = {
      ...notes,
      [currentSlide]: {
        content: currentNote,
        markers: markers
      }
    };
    
    setNotes(updatedNotes);
    onNotesChange?.(updatedNotes);
  };

  // Adicionar um marcador
  const addMarker = () => {
    const newMarker = {
      id: `marker-${Date.now()}`,
      x: 50, // Posição padrão centrada
      y: 50,
      color: selectedMarkerColor,
      text: "Ponto importante"
    };
    
    const updatedMarkers = [...markers, newMarker];
    setMarkers(updatedMarkers);
    
    // Atualizar as notas do slide atual
    const updatedNotes = {
      ...notes,
      [currentSlide]: {
        content: currentNote,
        markers: updatedMarkers
      }
    };
    
    setNotes(updatedNotes);
    onNotesChange?.(updatedNotes);
  };

  // Remover um marcador
  const removeMarker = (id: string) => {
    const updatedMarkers = markers.filter(marker => marker.id !== id);
    setMarkers(updatedMarkers);
    
    // Atualizar as notas do slide atual
    const updatedNotes = {
      ...notes,
      [currentSlide]: {
        content: currentNote,
        markers: updatedMarkers
      }
    };
    
    setNotes(updatedNotes);
    onNotesChange?.(updatedNotes);
  };

  // Atualizar o texto da nota
  const updateNoteContent = (content: string) => {
    setCurrentNote(content);
    
    // Não salva imediatamente para evitar muitas atualizações
    // O usuário precisa clicar em Salvar
  };

  // Aplicar formatação ao texto
  const applyFormatting = (format: string) => {
    let formattedText = currentNote;
    const textarea = document.getElementById('note-textarea') as HTMLTextAreaElement;
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selection = currentNote.substring(start, end);
      
      switch(format) {
        case 'bold':
          formattedText = currentNote.substring(0, start) + `**${selection}**` + currentNote.substring(end);
          break;
        case 'italic':
          formattedText = currentNote.substring(0, start) + `*${selection}*` + currentNote.substring(end);
          break;
        case 'list':
          const lines = selection.split('\n');
          const bulletLines = lines.map(line => `- ${line}`).join('\n');
          formattedText = currentNote.substring(0, start) + bulletLines + currentNote.substring(end);
          break;
      }
      
      setCurrentNote(formattedText);
    }
  };

  return (
    <div className={cn("space-y-6", isDualViewMode && "flex gap-4")}>
      <Card className={isDualViewMode ? "w-1/2" : "w-full"}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Anotações do Professor
            </div>
            <div className="flex items-center gap-2">
              <Toggle 
                pressed={isDualViewMode} 
                onPressedChange={setIsDualViewMode}
                size="sm"
                aria-label="Modo visualização dupla"
              >
                <PanelLeft className="h-4 w-4" />
              </Toggle>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-1 border rounded-md p-1 bg-gray-50">
            <Toggle 
              size="sm" 
              aria-label="Negrito"
              onClick={() => applyFormatting('bold')}
            >
              <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle 
              size="sm" 
              aria-label="Itálico"
              onClick={() => applyFormatting('italic')}
            >
              <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle 
              size="sm" 
              aria-label="Lista"
              onClick={() => applyFormatting('list')}
            >
              <List className="h-4 w-4" />
            </Toggle>
            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={saveNotes}
                className="h-8"
              >
                <Save className="h-4 w-4 mr-1" />
                Salvar
              </Button>
            </div>
          </div>

          <Textarea
            id="note-textarea"
            placeholder="Adicione suas anotações aqui. Estas notas são visíveis apenas para você."
            className="min-h-[200px] font-mono text-sm"
            value={currentNote}
            onChange={(e) => updateNoteContent(e.target.value)}
          />
          
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Marcadores Visuais</h3>
              <div className="flex items-center space-x-2">
                {isAddingMarker ? (
                  <div className="flex items-center space-x-1">
                    {COLORS.map(color => (
                      <div
                        key={color}
                        className={`w-4 h-4 rounded-full cursor-pointer border ${
                          selectedMarkerColor === color ? 'ring-2 ring-offset-1 ring-blue-500' : 'ring-0'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedMarkerColor(color)}
                      />
                    ))}
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-7 ml-1"
                      onClick={addMarker}
                    >
                      <Bookmark className="h-3 w-3 mr-1" />
                      Adicionar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="h-7"
                      onClick={() => setIsAddingMarker(false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="h-7"
                    onClick={() => setIsAddingMarker(true)}
                  >
                    <Bookmark className="h-3 w-3 mr-1" />
                    Novo Marcador
                  </Button>
                )}
              </div>
            </div>
            
            {markers.length > 0 ? (
              <div className="space-y-2">
                {markers.map(marker => (
                  <div 
                    key={marker.id} 
                    className="flex items-center justify-between p-2 rounded-md border"
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: marker.color }}
                      />
                      <span className="text-sm">{marker.text}</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 w-6 p-0"
                      onClick={() => removeMarker(marker.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-2">
                Sem marcadores para este slide.
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-500 pt-2 border-t">
            <p>Slide atual: {currentSlide + 1} de {totalSlides}</p>
            <p>As anotações são privadas e visíveis apenas para você.</p>
          </div>
        </CardContent>
      </Card>

      {/* Modo de visualização dupla: Visualização do slide */}
      {isDualViewMode && (
        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>Prévia do Slide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border">
              <div className="text-center text-gray-500">
                <p>Visualização do Slide {currentSlide + 1}</p>
                <p className="text-xs mt-2">No modo apresentação, esta área mostrará o slide atual</p>
                
                {/* Simulação dos marcadores */}
                {markers.map(marker => (
                  <div
                    key={marker.id}
                    className="absolute w-6 h-6 flex items-center justify-center rounded-full"
                    style={{
                      backgroundColor: marker.color,
                      left: `${marker.x}%`,
                      top: `${marker.y}%`,
                      transform: 'translate(-50%, -50%)',
                      opacity: 0.8
                    }}
                  >
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 