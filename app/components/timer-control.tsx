"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface TimerSettings {
  totalTime: number;           // tempo total em minutos
  slideSpecificTimes: Record<number, number>; // tempo para cada slide em minutos
  isTimerVisible: boolean;     // se o timer deve ser visível para todos
  showAlerts: boolean;         // se deve mostrar alertas visuais
}

export const defaultTimerSettings: TimerSettings = {
  totalTime: 30,
  slideSpecificTimes: {},
  isTimerVisible: false,
  showAlerts: true
}

interface TimerControlProps {
  totalSlides: number;
  currentSlide: number;
  settings?: TimerSettings;
  onSettingsChange?: (settings: TimerSettings) => void;
}

export default function TimerControl({ 
  totalSlides, 
  currentSlide, 
  settings = defaultTimerSettings,
  onSettingsChange
}: TimerControlProps) {
  const [localSettings, setLocalSettings] = useState<TimerSettings>(settings);
  const [timeRemaining, setTimeRemaining] = useState<number>(0); // em segundos
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sincronizar configurações locais com as passadas via props
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Inicializar o tempo restante com base no slide atual
  useEffect(() => {
    const slideTime = localSettings.slideSpecificTimes[currentSlide] || 
      (localSettings.totalTime / totalSlides);
    setTimeRemaining(Math.floor(slideTime * 60));
  }, [currentSlide, localSettings, totalSlides]);

  // Lógica do temporizador
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          // Exibe o aviso quando o tempo estiver acabando (menos de 10% do tempo)
          const slideTime = localSettings.slideSpecificTimes[currentSlide] || 
            (localSettings.totalTime / totalSlides);
          const tenPercentTime = Math.floor(slideTime * 60 * 0.1);
          
          if (prev <= tenPercentTime && localSettings.showAlerts) {
            setShowWarning(true);
          } else {
            setShowWarning(false);
          }
          
          if (prev <= 0) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, currentSlide, localSettings, totalSlides]);

  // Formatar o tempo restante para exibição
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Atualizar as configurações locais e propagar para o componente pai
  const updateSettings = (newSettings: Partial<TimerSettings>) => {
    const updated = { ...localSettings, ...newSettings };
    setLocalSettings(updated);
    onSettingsChange?.(updated);
  };

  // Configurar tempo específico para o slide atual
  const setSlideTime = (minutes: number) => {
    const updatedTimes = { 
      ...localSettings.slideSpecificTimes,
      [currentSlide]: minutes
    };
    
    updateSettings({ slideSpecificTimes: updatedTimes });
    setTimeRemaining(minutes * 60);
  };

  // Resetar o temporizador
  const resetTimer = () => {
    const slideTime = localSettings.slideSpecificTimes[currentSlide] || 
      (localSettings.totalTime / totalSlides);
    setTimeRemaining(Math.floor(slideTime * 60));
    setShowWarning(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Controle de Tempo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Exibição do temporizador atual */}
          <div className={cn(
            "text-center p-4 rounded-lg border-2 font-mono text-4xl", 
            showWarning ? "bg-red-50 border-red-300 text-red-600 animate-pulse" : "bg-gray-50 border-gray-200"
          )}>
            {formatTime(timeRemaining)}
            {showWarning && (
              <div className="flex items-center justify-center mt-2 text-sm font-sans text-red-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                Tempo acabando!
              </div>
            )}
          </div>

          {/* Controles do temporizador */}
          <div className="flex justify-center gap-2">
            <Button 
              variant={isRunning ? "outline" : "default"} 
              size="icon"
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={resetTimer}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Configurações do temporizador */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-sm">Configurações do Slide Atual</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="slide-time" className="text-sm">
                  Tempo para este slide (min)
                </Label>
                <Input
                  id="slide-time"
                  type="number"
                  min="1"
                  max="60"
                  value={localSettings.slideSpecificTimes[currentSlide] || Math.floor(localSettings.totalTime / totalSlides)}
                  onChange={(e) => setSlideTime(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="total-time" className="text-sm">
                  Tempo total da apresentação (min)
                </Label>
                <Input
                  id="total-time"
                  type="number"
                  min="5"
                  max="240"
                  value={localSettings.totalTime}
                  onChange={(e) => updateSettings({ totalTime: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="timer-visibility"
                  checked={localSettings.isTimerVisible}
                  onCheckedChange={(checked) => updateSettings({ isTimerVisible: checked })}
                />
                <Label htmlFor="timer-visibility" className="text-sm">
                  Visível para todos
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show-alerts"
                  checked={localSettings.showAlerts}
                  onCheckedChange={(checked) => updateSettings({ showAlerts: checked })}
                />
                <Label htmlFor="show-alerts" className="text-sm">
                  Mostrar alertas
                </Label>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 pt-2 border-t">
            <p>Slide atual: {currentSlide + 1} de {totalSlides}</p>
            <p>Modo de visualização: {localSettings.isTimerVisible ? 
              <span className="flex items-center text-blue-600"><Eye className="w-3 h-3 mr-1" /> Compartilhado</span> : 
              <span className="flex items-center text-gray-600"><EyeOff className="w-3 h-3 mr-1" /> Somente professor</span>
            }</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 