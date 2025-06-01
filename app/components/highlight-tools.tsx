"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { 
  MousePointer, 
  Highlighter,
  ZoomIn,
  Eye,
  Eraser,
  Clock,
  SlidersHorizontal,
  Pin
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type HighlightToolType = 'marker' | 'zoom' | 'curtain';
export type HighlightModeType = 'temporary' | 'permanent';

export interface HighlightSettings {
  activeToolType: HighlightToolType;
  mode: HighlightModeType;
  color: string;
  size: number;
  temporaryDuration: number; // em segundos
}

export const defaultHighlightSettings: HighlightSettings = {
  activeToolType: 'marker',
  mode: 'temporary',
  color: '#ef4444', // vermelho
  size: 20,
  temporaryDuration: 5
};

interface HighlightToolsProps {
  settings?: HighlightSettings;
  onSettingsChange?: (settings: HighlightSettings) => void;
  onApplyHighlight?: (type: HighlightToolType, settings: HighlightSettings) => void;
  onClearHighlights?: () => void;
}

export default function HighlightTools({
  settings = defaultHighlightSettings,
  onSettingsChange,
  onApplyHighlight,
  onClearHighlights
}: HighlightToolsProps) {
  const [localSettings, setLocalSettings] = useState<HighlightSettings>(settings);
  const [activeTab, setActiveTab] = useState<string>("tools");

  // Cores disponíveis para os marcadores
  const COLORS = [
    { value: '#ef4444', label: 'Vermelho' },
    { value: '#f97316', label: 'Laranja' },
    { value: '#eab308', label: 'Amarelo' },
    { value: '#22c55e', label: 'Verde' },
    { value: '#0ea5e9', label: 'Azul' },
    { value: '#8b5cf6', label: 'Roxo' }
  ];

  // Atualizar as configurações
  const updateSettings = (newSettings: Partial<HighlightSettings>) => {
    const updated = { ...localSettings, ...newSettings };
    setLocalSettings(updated);
    onSettingsChange?.(updated);
  };

  // Aplicar destaque
  const applyHighlight = () => {
    onApplyHighlight?.(localSettings.activeToolType, localSettings);
  };

  // Limpar todos os destaques
  const clearHighlights = () => {
    onClearHighlights?.();
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="tools">Ferramentas</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>
        
        {/* Aba de Ferramentas */}
        <TabsContent value="tools">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Highlighter className="w-5 h-5" />
                Ferramentas de Destaque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Tipos de ferramentas */}
                <div>
                  <RadioGroup
                    value={localSettings.activeToolType}
                    onValueChange={(value: HighlightToolType) => updateSettings({ activeToolType: value })}
                    className="grid grid-cols-3 gap-2"
                  >
                    <div>
                      <RadioGroupItem 
                        value="marker" 
                        id="tool-marker" 
                        className="peer sr-only" 
                      />
                      <Label
                        htmlFor="tool-marker"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Highlighter className="mb-3 h-6 w-6" />
                        <span className="text-sm font-medium">Marcador</span>
                      </Label>
                    </div>
                    
                    <div>
                      <RadioGroupItem 
                        value="zoom" 
                        id="tool-zoom" 
                        className="peer sr-only" 
                      />
                      <Label
                        htmlFor="tool-zoom"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <ZoomIn className="mb-3 h-6 w-6" />
                        <span className="text-sm font-medium">Zoom</span>
                      </Label>
                    </div>
                    
                    <div>
                      <RadioGroupItem 
                        value="curtain" 
                        id="tool-curtain" 
                        className="peer sr-only" 
                      />
                      <Label
                        htmlFor="tool-curtain"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Eye className="mb-3 h-6 w-6" />
                        <span className="text-sm font-medium">Cortina</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Descrição da ferramenta atual */}
                <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-md">
                  {localSettings.activeToolType === 'marker' && (
                    <p>O <strong>Marcador</strong> permite destacar áreas específicas do slide com uma cor customizada.</p>
                  )}
                  {localSettings.activeToolType === 'zoom' && (
                    <p>O <strong>Zoom</strong> permite ampliar elementos importantes do slide para chamar a atenção.</p>
                  )}
                  {localSettings.activeToolType === 'curtain' && (
                    <p>A <strong>Cortina</strong> permite revelar gradualmente o conteúdo do slide, controlando o foco da audiência.</p>
                  )}
                </div>
                
                {/* Configurações rápidas */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Temporário
                    </Label>
                    <Switch
                      checked={localSettings.mode === 'temporary'}
                      onCheckedChange={(checked) => 
                        updateSettings({ mode: checked ? 'temporary' : 'permanent' })}
                    />
                  </div>
                  
                  {localSettings.activeToolType === 'marker' && (
                    <div>
                      <Label className="mb-2 block">Cor</Label>
                      <div className="flex gap-2">
                        {COLORS.map(color => (
                          <div
                            key={color.value}
                            className={`w-6 h-6 rounded-full cursor-pointer border ${
                              localSettings.color === color.value ? 'ring-2 ring-offset-1 ring-blue-500' : 'ring-0'
                            }`}
                            style={{ backgroundColor: color.value }}
                            onClick={() => updateSettings({ color: color.value })}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(localSettings.activeToolType === 'marker' || localSettings.activeToolType === 'zoom') && (
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label>Tamanho</Label>
                        <span className="text-sm text-gray-500">{localSettings.size}px</span>
                      </div>
                      <Slider
                        min={5}
                        max={50}
                        step={1}
                        value={[localSettings.size]}
                        onValueChange={(value) => updateSettings({ size: value[0] })}
                      />
                    </div>
                  )}
                </div>
                
                {/* Botões de ação */}
                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1" 
                    onClick={applyHighlight}
                  >
                    {localSettings.activeToolType === 'marker' && <Highlighter className="mr-2 h-4 w-4" />}
                    {localSettings.activeToolType === 'zoom' && <ZoomIn className="mr-2 h-4 w-4" />}
                    {localSettings.activeToolType === 'curtain' && <Eye className="mr-2 h-4 w-4" />}
                    Aplicar {localSettings.activeToolType === 'marker' ? 'Marcador' : 
                             localSettings.activeToolType === 'zoom' ? 'Zoom' : 'Cortina'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={clearHighlights}
                  >
                    <Eraser className="mr-2 h-4 w-4" />
                    Limpar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba de Configurações */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" />
                Configurações de Destaque
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="font-medium">Modo de Destaque</Label>
                  <RadioGroup
                    value={localSettings.mode}
                    onValueChange={(value: HighlightModeType) => updateSettings({ mode: value })}
                    className="grid grid-cols-2 gap-2 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="temporary" id="mode-temporary" />
                      <Label htmlFor="mode-temporary" className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Temporário
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="permanent" id="mode-permanent" />
                      <Label htmlFor="mode-permanent" className="flex items-center gap-1">
                        <Pin className="h-4 w-4" />
                        Permanente
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {localSettings.mode === 'temporary' && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Duração (segundos)</Label>
                      <span className="text-sm text-gray-500">{localSettings.temporaryDuration}s</span>
                    </div>
                    <Slider
                      min={1}
                      max={15}
                      step={1}
                      value={[localSettings.temporaryDuration]}
                      onValueChange={(value) => updateSettings({ temporaryDuration: value[0] })}
                    />
                  </div>
                )}
                
                <div className="pt-4">
                  <Label className="font-medium mb-2 block">Configurações por Ferramenta</Label>
                  
                  <div className="space-y-4 mt-4">
                    {/* Marcador */}
                    <div className="p-4 border rounded-md">
                      <div className="flex items-center mb-3">
                        <Highlighter className="h-5 w-5 mr-2" />
                        <h3 className="font-medium">Marcador</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label className="mb-2 block">Cor</Label>
                          <div className="flex gap-2">
                            {COLORS.map(color => (
                              <Popover key={color.value}>
                                <PopoverTrigger asChild>
                                  <div
                                    className={`w-6 h-6 rounded-full cursor-pointer border ${
                                      localSettings.color === color.value ? 'ring-2 ring-offset-1 ring-blue-500' : 'ring-0'
                                    }`}
                                    style={{ backgroundColor: color.value }}
                                    onClick={() => updateSettings({ color: color.value })}
                                  />
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-1">
                                  <span className="text-xs">{color.label}</span>
                                </PopoverContent>
                              </Popover>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <Label>Espessura</Label>
                            <span className="text-sm text-gray-500">{localSettings.size}px</span>
                          </div>
                          <Slider
                            min={5}
                            max={50}
                            step={1}
                            value={[localSettings.size]}
                            onValueChange={(value) => updateSettings({ size: value[0] })}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Zoom */}
                    <div className="p-4 border rounded-md">
                      <div className="flex items-center mb-3">
                        <ZoomIn className="h-5 w-5 mr-2" />
                        <h3 className="font-medium">Zoom</h3>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Nível de Ampliação</Label>
                          <span className="text-sm text-gray-500">{localSettings.size / 10}x</span>
                        </div>
                        <Slider
                          min={10}
                          max={30}
                          step={5}
                          value={[localSettings.size]}
                          onValueChange={(value) => updateSettings({ size: value[0] })}
                        />
                      </div>
                    </div>
                    
                    {/* Cortina */}
                    <div className="p-4 border rounded-md">
                      <div className="flex items-center mb-3">
                        <Eye className="h-5 w-5 mr-2" />
                        <h3 className="font-medium">Cortina</h3>
                      </div>
                      
                      <p className="text-sm text-gray-500">
                        A cortina revela gradualmente o conteúdo do slide, de cima para baixo,
                        permitindo controlar o ritmo da apresentação.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Visualização da ferramenta atual */}
      <Card className="border-dashed">
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Prévia da Ferramenta</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="aspect-video bg-gray-100 relative overflow-hidden">
            {/* Simulação de conteúdo do slide */}
            <div className="p-4 absolute inset-0">
              <div className="w-3/4 h-6 bg-gray-200 mb-4"></div>
              <div className="w-full h-4 bg-gray-200 mb-2"></div>
              <div className="w-5/6 h-4 bg-gray-200 mb-2"></div>
              <div className="w-4/6 h-4 bg-gray-200 mb-2"></div>
              <div className="w-full h-4 bg-gray-200 mb-6"></div>
              
              <div className="flex justify-between mb-6">
                <div className="w-1/3 h-20 bg-gray-200 mr-2"></div>
                <div className="w-1/3 h-20 bg-gray-200 mr-2"></div>
                <div className="w-1/3 h-20 bg-gray-200"></div>
              </div>
              
              <div className="w-full h-4 bg-gray-200 mb-2"></div>
              <div className="w-4/5 h-4 bg-gray-200"></div>
            </div>
            
            {/* Simulação de destaque */}
            {localSettings.activeToolType === 'marker' && (
              <div 
                className="absolute rounded-full"
                style={{
                  width: `${localSettings.size * 3}px`,
                  height: `${localSettings.size}px`,
                  backgroundColor: localSettings.color,
                  opacity: 0.5,
                  top: '40%',
                  left: '35%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none'
                }}
              ></div>
            )}
            
            {localSettings.activeToolType === 'zoom' && (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <div className="relative">
                  <div 
                    className="absolute bg-white rounded-full"
                    style={{
                      width: `${localSettings.size * 5}px`,
                      height: `${localSettings.size * 5}px`,
                      transform: 'translate(-50%, -50%)',
                      border: '2px solid #0ea5e9',
                      opacity: 0.9,
                      top: '0',
                      left: '0'
                    }}
                  ></div>
                  <div 
                    className="absolute rounded-full flex items-center justify-center"
                    style={{
                      width: `${localSettings.size * 5}px`,
                      height: `${localSettings.size * 5}px`,
                      transform: 'translate(-50%, -50%)',
                      top: '0',
                      left: '0',
                      fontSize: `${localSettings.size / 5}rem`,
                      fontWeight: 'bold',
                      color: '#0ea5e9'
                    }}
                  >
                    {localSettings.size / 10}x
                  </div>
                </div>
              </div>
            )}
            
            {localSettings.activeToolType === 'curtain' && (
              <div 
                className="absolute bg-white"
                style={{
                  width: '100%',
                  height: '70%',
                  top: '0',
                  left: '0',
                  borderBottom: '2px dashed #0ea5e9'
                }}
              ></div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 