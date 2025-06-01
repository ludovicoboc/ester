"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { 
  Wand2,
  Play,
  RotateCw,
  MoveRight,
  ArrowDownUp,
  Sparkles,
  Hourglass,
  Layers
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type TransitionType = 'fade' | 'slide' | 'zoom' | 'flip' | 'rotate';
export type AnimationPresetsType = 'default' | 'dynamic' | 'formal' | 'subtle' | 'attention';

export interface TransitionSettings {
  transitionType: TransitionType;
  transitionSpeed: number; // em ms (300-2000)
  enableElementAnimations: boolean;
  animateItems: boolean;
  animateText: boolean;
  animateImages: boolean;
  animationDelay: number; // em ms (0-1000)
  preset: AnimationPresetsType;
}

export const defaultTransitionSettings: TransitionSettings = {
  transitionType: 'fade',
  transitionSpeed: 500,
  enableElementAnimations: true,
  animateItems: true,
  animateText: false,
  animateImages: true,
  animationDelay: 200,
  preset: 'default'
};

interface TransitionControlsProps {
  settings?: TransitionSettings;
  onSettingsChange?: (settings: TransitionSettings) => void;
  onPreviewTransition?: (type: TransitionType) => void;
}

export default function TransitionControls({
  settings = defaultTransitionSettings,
  onSettingsChange,
  onPreviewTransition
}: TransitionControlsProps) {
  const [localSettings, setLocalSettings] = useState<TransitionSettings>(settings);
  const [activeTab, setActiveTab] = useState<string>("transitions");
  const [isPreviewActive, setIsPreviewActive] = useState<boolean>(false);

  // Definição dos presets
  const presets = [
    { 
      id: 'default', 
      name: 'Padrão', 
      description: 'Transições suaves e equilibradas' 
    },
    { 
      id: 'dynamic', 
      name: 'Dinâmico', 
      description: 'Transições rápidas e animações energéticas' 
    },
    { 
      id: 'formal', 
      name: 'Formal', 
      description: 'Discreto e profissional, ideal para apresentações sérias' 
    },
    { 
      id: 'subtle', 
      name: 'Sutil', 
      description: 'Mínimo e elegante, sem distrações' 
    },
    { 
      id: 'attention', 
      name: 'Atenção', 
      description: 'Projetado para reconquistar a atenção após intervalos' 
    }
  ];

  // Atualizar configurações
  const updateSettings = (newSettings: Partial<TransitionSettings>) => {
    const updated = { ...localSettings, ...newSettings };
    setLocalSettings(updated);
    onSettingsChange?.(updated);
  };

  // Aplicar preset
  const applyPreset = (presetId: AnimationPresetsType) => {
    let newSettings: Partial<TransitionSettings> = { preset: presetId };
    
    switch(presetId) {
      case 'dynamic':
        newSettings = {
          ...newSettings,
          transitionType: 'slide',
          transitionSpeed: 400,
          enableElementAnimations: true,
          animateItems: true,
          animateText: true,
          animateImages: true,
          animationDelay: 100
        };
        break;
      case 'formal':
        newSettings = {
          ...newSettings,
          transitionType: 'fade',
          transitionSpeed: 800,
          enableElementAnimations: false,
          animateItems: false,
          animateText: false,
          animateImages: false,
          animationDelay: 0
        };
        break;
      case 'subtle':
        newSettings = {
          ...newSettings,
          transitionType: 'fade',
          transitionSpeed: 1000,
          enableElementAnimations: true,
          animateItems: false,
          animateText: false,
          animateImages: true,
          animationDelay: 300
        };
        break;
      case 'attention':
        newSettings = {
          ...newSettings,
          transitionType: 'zoom',
          transitionSpeed: 600,
          enableElementAnimations: true,
          animateItems: true,
          animateText: true,
          animateImages: true,
          animationDelay: 150
        };
        break;
      default: // 'default'
        newSettings = {
          ...newSettings,
          transitionType: 'fade',
          transitionSpeed: 500,
          enableElementAnimations: true,
          animateItems: true,
          animateText: false,
          animateImages: true,
          animationDelay: 200
        };
    }
    
    updateSettings(newSettings);
  };

  // Visualizar transição
  const previewTransition = () => {
    setIsPreviewActive(true);
    onPreviewTransition?.(localSettings.transitionType);
    
    // Simulação de visualização - em um aplicativo real, isso seria manipulado no componente do slide
    setTimeout(() => {
      setIsPreviewActive(false);
    }, localSettings.transitionSpeed + 500);
  };

  // Mapear ícones com base no tipo de transição
  const getTransitionIcon = (type: TransitionType) => {
    switch(type) {
      case 'fade':
        return <Layers className="h-5 w-5" />;
      case 'slide':
        return <MoveRight className="h-5 w-5" />;
      case 'zoom':
        return <Wand2 className="h-5 w-5" />;
      case 'flip':
        return <ArrowDownUp className="h-5 w-5" />;
      case 'rotate':
        return <RotateCw className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="transitions">Transições</TabsTrigger>
          <TabsTrigger value="animations">Animações</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
        </TabsList>
        
        {/* Aba de Transições */}
        <TabsContent value="transitions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MoveRight className="w-5 h-5" />
                Transições entre Slides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label className="mb-3 block">Tipo de Transição</Label>
                  <RadioGroup
                    value={localSettings.transitionType}
                    onValueChange={(value: TransitionType) => updateSettings({ transitionType: value })}
                    className="grid grid-cols-3 gap-3"
                  >
                    {['fade', 'slide', 'zoom', 'flip', 'rotate'].map((type) => (
                      <div key={type}>
                        <RadioGroupItem 
                          value={type} 
                          id={`transition-${type}`} 
                          className="peer sr-only" 
                        />
                        <Label
                          htmlFor={`transition-${type}`}
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          {getTransitionIcon(type as TransitionType)}
                          <span className="mt-2 text-sm font-medium capitalize">{type}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Velocidade da Transição</Label>
                    <span className="text-sm text-gray-500">{localSettings.transitionSpeed}ms</span>
                  </div>
                  <Slider
                    min={300}
                    max={2000}
                    step={100}
                    value={[localSettings.transitionSpeed]}
                    onValueChange={(value) => updateSettings({ transitionSpeed: value[0] })}
                  />
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>Rápida</span>
                    <span>Lenta</span>
                  </div>
                </div>
                
                <Button
                  onClick={previewTransition}
                  disabled={isPreviewActive}
                  className="w-full"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {isPreviewActive ? "Visualizando..." : "Visualizar Transição"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba de Animações */}
        <TabsContent value="animations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Animações de Elementos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable-animations" className="font-medium">Ativar Animações</Label>
                    <p className="text-sm text-gray-500">
                      Animar elementos individuais nos slides
                    </p>
                  </div>
                  <Switch
                    id="enable-animations"
                    checked={localSettings.enableElementAnimations}
                    onCheckedChange={(checked) => updateSettings({ enableElementAnimations: checked })}
                  />
                </div>
                
                <Separator />
                
                <div className={localSettings.enableElementAnimations ? "" : "opacity-50 pointer-events-none"}>
                  <h3 className="text-sm font-medium mb-3">Elementos a Animar</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="animate-items" className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Itens de Lista
                      </Label>
                      <Switch
                        id="animate-items"
                        checked={localSettings.animateItems}
                        onCheckedChange={(checked) => updateSettings({ animateItems: checked })}
                        disabled={!localSettings.enableElementAnimations}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="animate-text" className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Blocos de Texto
                      </Label>
                      <Switch
                        id="animate-text"
                        checked={localSettings.animateText}
                        onCheckedChange={(checked) => updateSettings({ animateText: checked })}
                        disabled={!localSettings.enableElementAnimations}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="animate-images" className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Imagens e Gráficos
                      </Label>
                      <Switch
                        id="animate-images"
                        checked={localSettings.animateImages}
                        onCheckedChange={(checked) => updateSettings({ animateImages: checked })}
                        disabled={!localSettings.enableElementAnimations}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex justify-between mb-2">
                      <Label>Atraso entre Animações</Label>
                      <span className="text-sm text-gray-500">{localSettings.animationDelay}ms</span>
                    </div>
                    <Slider
                      min={0}
                      max={1000}
                      step={50}
                      value={[localSettings.animationDelay]}
                      onValueChange={(value) => updateSettings({ animationDelay: value[0] })}
                      disabled={!localSettings.enableElementAnimations}
                    />
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>Sem atraso</span>
                      <span>Atraso maior</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button
                    onClick={previewTransition}
                    disabled={isPreviewActive || !localSettings.enableElementAnimations}
                    className="w-full"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {isPreviewActive ? "Visualizando..." : "Visualizar Animações"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba de Presets */}
        <TabsContent value="presets">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hourglass className="w-5 h-5" />
                Presets Educacionais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-sm text-gray-500">
                  Selecione um conjunto predefinido de transições e animações otimizado para ambiente educacional.
                </p>
                
                <div className="grid gap-3">
                  {presets.map((preset) => (
                    <div 
                      key={preset.id} 
                      className={`flex items-start space-x-3 border rounded-lg p-3 cursor-pointer hover:border-blue-300 transition-colors ${
                        localSettings.preset === preset.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => applyPreset(preset.id as AnimationPresetsType)}
                    >
                      <RadioGroupItem 
                        value={preset.id} 
                        id={`preset-${preset.id}`} 
                        className="mt-1"
                        checked={localSettings.preset === preset.id}
                        onCheckedChange={() => {}}
                      />
                      <div className="flex-1">
                        <Label 
                          htmlFor={`preset-${preset.id}`} 
                          className="text-base font-medium cursor-pointer"
                        >
                          {preset.name}
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">
                          {preset.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-2">
                  <Button
                    onClick={previewTransition}
                    disabled={isPreviewActive}
                    className="w-full"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {isPreviewActive ? "Visualizando..." : "Visualizar Preset"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Visualização da transição */}
      <Card className="border-dashed">
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex justify-between items-center">
            <span>Prévia de Transição</span>
            <span className="text-xs font-normal text-gray-500">
              {localSettings.transitionType}, {localSettings.transitionSpeed}ms
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="aspect-video bg-gray-100 relative overflow-hidden">
            <div 
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                isPreviewActive ? 
                  localSettings.transitionType === 'fade' ? 'opacity-0' :
                  localSettings.transitionType === 'slide' ? 'translate-x-full' :
                  localSettings.transitionType === 'zoom' ? 'scale-150 opacity-0' :
                  localSettings.transitionType === 'flip' ? 'rotateY-90' :
                  localSettings.transitionType === 'rotate' ? 'rotate-90 opacity-0' :
                  ''
                : ''
              }`}
            >
              {/* Simulação de conteúdo do slide */}
              <div className="p-4">
                <div className="w-2/3 h-6 bg-gray-200 mb-4"></div>
                <div className="w-full h-3 bg-gray-200 mb-2"></div>
                <div className="w-full h-3 bg-gray-200 mb-2"></div>
                <div className="w-4/5 h-3 bg-gray-200 mb-4"></div>
                
                <div className="flex space-x-2 mb-4">
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  <div className="w-4/5 h-4 bg-gray-200"></div>
                </div>
                <div className="flex space-x-2 mb-4">
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  <div className="w-3/4 h-4 bg-gray-200"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  <div className="w-2/3 h-4 bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 