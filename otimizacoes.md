# Guia de Otimizações - Gerador de Slides IA

## 1. Migração para IndexedDB

A migração do localStorage para IndexedDB oferece maior capacidade de armazenamento e melhor desempenho para dados complexos.

### Passo a passo:

1. **Criação do módulo de banco de dados**:
```typescript
// app/utils/database.ts
export class SlideDatabase {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'slidesGeneratorDB';
  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => reject(request.error);
      
      request.onupgradeneeded = (event) => {
        const db = request.result;
        
        // Stores para diferentes tipos de dados
        if (!db.objectStoreNames.contains('configurations')) {
          db.createObjectStore('configurations', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('slides')) {
          db.createObjectStore('slides', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('teacherNotes')) {
          db.createObjectStore('teacherNotes', { keyPath: 'slideId' });
        }
        
        if (!db.objectStoreNames.contains('quizData')) {
          db.createObjectStore('quizData', { keyPath: 'id', autoIncrement: true });
        }
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
    });
  }

  // Métodos de acesso aos dados
  async saveConfiguration(config: any): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['configurations'], 'readwrite');
      const store = transaction.objectStore('configurations');
      
      const request = store.put({
        id: 'appConfig',
        ...config,
        updatedAt: new Date().toISOString()
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getConfiguration(): Promise<any> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['configurations'], 'readonly');
      const store = transaction.objectStore('configurations');
      
      const request = store.get('appConfig');
      
      request.onsuccess = () => resolve(request.result || {});
      request.onerror = () => reject(request.error);
    });
  }

  // Métodos similares para outros stores (slides, teacherNotes, quizData)
  // ...
}

// Singleton para uso em toda a aplicação
export const slideDB = new SlideDatabase();
```

2. **Migração dos dados existentes**:
```typescript
// app/utils/migration.ts
import { slideDB } from './database';

export async function migrateFromLocalStorage(): Promise<void> {
  // Configurações
  const storedConfig = localStorage.getItem('slideGeneratorConfig');
  if (storedConfig) {
    try {
      const config = JSON.parse(storedConfig);
      await slideDB.saveConfiguration(config);
    } catch (e) {
      console.error('Erro ao migrar configurações:', e);
    }
  }
  
  // Anotações do professor
  const storedNotes = localStorage.getItem('teacherNotes');
  if (storedNotes) {
    try {
      const notes = JSON.parse(storedNotes);
      for (const [slideId, noteContent] of Object.entries(notes)) {
        await slideDB.saveTeacherNote({ 
          slideId, 
          content: noteContent,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error('Erro ao migrar anotações:', e);
    }
  }
  
  // Migrar outros dados...
  
  // Após migração bem-sucedida, podemos limpar o localStorage
  // localStorage.clear(); // Descomente após testar
}
```

3. **Atualização dos componentes**:
```typescript
// Exemplo para o componente de configurações
import { slideDB } from '../utils/database';
import { useEffect, useState } from 'react';

export function ConfigurationPanel() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadConfig() {
      try {
        const savedConfig = await slideDB.getConfiguration();
        setConfig(savedConfig);
      } catch (e) {
        console.error('Erro ao carregar configurações:', e);
      } finally {
        setLoading(false);
      }
    }
    
    loadConfig();
  }, []);
  
  const saveConfig = async (newConfig) => {
    try {
      await slideDB.saveConfiguration({
        ...config,
        ...newConfig
      });
      setConfig(prev => ({ ...prev, ...newConfig }));
    } catch (e) {
      console.error('Erro ao salvar configurações:', e);
    }
  };
  
  if (loading) return <div>Carregando configurações...</div>;
  
  // JSX do componente...
}
```

4. **Execução da migração**:
```typescript
// app/page.tsx
import { useEffect } from 'react';
import { slideDB } from './utils/database';
import { migrateFromLocalStorage } from './utils/migration';

export default function App() {
  useEffect(() => {
    async function initDatabase() {
      await slideDB.init();
      
      // Verificar se é a primeira execução após atualização
      const migrationDone = localStorage.getItem('indexedDBMigrationDone');
      if (!migrationDone) {
        await migrateFromLocalStorage();
        localStorage.setItem('indexedDBMigrationDone', 'true');
      }
    }
    
    initDatabase();
  }, []);
  
  // JSX da aplicação...
}
```

## 2. Desempenho: Implementação de Lazy Loading

### Passo a passo:

1. **Configuração do Next.js para suporte a lazy loading**:
```typescript
// app/components/lazy-loaded.tsx
'use client';
import React, { Suspense } from 'react';

// Componente de fallback enquanto carrega
function LoadingComponent() {
  return <div className="p-4 text-center">Carregando componente...</div>;
}

// HOC para lazy loading
export function withLazyLoading(Component) {
  return function LazyComponent(props) {
    return (
      <Suspense fallback={<LoadingComponent />}>
        <Component {...props} />
      </Suspense>
    );
  };
}
```

2. **Aplicação em componentes pesados**:
```typescript
// app/page.tsx
import dynamic from 'next/dynamic';
import { withLazyLoading } from './components/lazy-loaded';

// Componentes carregados sob demanda
const SlideViewer = dynamic(
  () => import('./components/slide-viewer').then(mod => mod.SlideViewer),
  { ssr: false }
);

const QuizSystem = withLazyLoading(
  dynamic(() => import('./components/quiz-system').then(mod => mod.QuizSystem))
);

const TeacherNotes = withLazyLoading(
  dynamic(() => import('./components/teacher-notes').then(mod => mod.TeacherNotes))
);

// Outros componentes pesados...

export default function SlidesApp() {
  // Renderização condicional baseada na navegação/tabs
  return (
    <div>
      {/* Apenas carrega quando necessário */}
      {activeTab === 'slides' && <SlideViewer />}
      {activeTab === 'quiz' && <QuizSystem />}
      {activeTab === 'notes' && <TeacherNotes />}
    </div>
  );
}
```

## 3. Usabilidade: Simplificação da Interface

### Passo a passo:

1. **Auditoria de UI/UX**:
   - Revisar todos os fluxos de usuário e identificar pontos de complexidade
   - Mapear as funcionalidades mais utilizadas

2. **Implementação de interface em camadas**:
```typescript
// app/components/layered-interface.tsx
'use client';
import { useState } from 'react';

export function LayeredInterface({ children, advancedComponents }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  return (
    <div className="interface-container">
      {/* Componentes essenciais sempre visíveis */}
      <div className="essential-features">
        {children}
      </div>
      
      {/* Toggle para funcionalidades avançadas */}
      <button 
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="advanced-toggle"
      >
        {showAdvanced ? 'Simplificar Interface' : 'Mostrar Opções Avançadas'}
      </button>
      
      {/* Componentes avançados */}
      {showAdvanced && (
        <div className="advanced-features">
          {advancedComponents}
        </div>
      )}
    </div>
  );
}
```

3. **Refatoração da barra de ferramentas**:
```typescript
// app/components/toolbar.tsx
'use client';
import { useState } from 'react';

export function Toolbar({ tools }) {
  const [expanded, setExpanded] = useState(false);
  
  // Dividir ferramentas entre essenciais e avançadas
  const essentialTools = tools.filter(tool => tool.essential);
  const advancedTools = tools.filter(tool => !tool.essential);
  
  return (
    <div className="toolbar">
      {/* Ferramentas essenciais sempre visíveis */}
      <div className="essential-tools">
        {essentialTools.map(tool => (
          <button key={tool.id} onClick={tool.action} title={tool.title}>
            {tool.icon}
          </button>
        ))}
      </div>
      
      {/* Ferramentas avançadas em menu expansível */}
      {advancedTools.length > 0 && (
        <>
          <button 
            onClick={() => setExpanded(!expanded)}
            className="toggle-advanced"
          >
            {expanded ? 'Menos' : 'Mais'} Ferramentas
          </button>
          
          {expanded && (
            <div className="advanced-tools">
              {advancedTools.map(tool => (
                <button key={tool.id} onClick={tool.action} title={tool.title}>
                  {tool.icon} {tool.label}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

## 4. Responsividade: Experiência Otimizada para Dispositivos Móveis

### Passo a passo:

1. **Implementação de design responsivo com Tailwind**:
```typescript
// app/components/responsive-container.tsx
export function ResponsiveContainer({ children }) {
  return (
    <div className="w-full mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
      {children}
    </div>
  );
}
```

2. **Adaptação de componentes para mobile**:
```typescript
// app/components/slide-viewer-responsive.tsx
'use client';
import { useEffect, useState } from 'react';

export function SlideViewerResponsive({ slides }) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Detectar tamanho de tela
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <div className={`slide-viewer ${isMobile ? 'mobile-view' : 'desktop-view'}`}>
      {isMobile ? (
        // Visualização otimizada para mobile
        <div className="mobile-controls">
          <button className="w-full py-3 mb-2">Tela Cheia</button>
          <div className="flex justify-between mb-4">
            <button className="px-4 py-2">Anterior</button>
            <span>Slide {currentSlide + 1}/{slides.length}</span>
            <button className="px-4 py-2">Próximo</button>
          </div>
        </div>
      ) : (
        // Visualização desktop com mais controles
        <div className="desktop-controls">
          {/* Controles mais completos */}
        </div>
      )}
      
      {/* Conteúdo do slide com tamanho adaptável */}
      <div className={`slide-content ${isMobile ? 'text-sm' : 'text-base'}`}>
        {/* Renderização do slide atual */}
      </div>
    </div>
  );
}
```

3. **Menu adaptativo para mobile**:
```typescript
// app/components/adaptive-menu.tsx
'use client';
import { useState } from 'react';

export function AdaptiveMenu({ menuItems }) {
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <>
      {/* Hamburger menu para mobile */}
      <button 
        className="md:hidden p-2" 
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span className="block w-6 h-0.5 bg-black mb-1"></span>
        <span className="block w-6 h-0.5 bg-black mb-1"></span>
        <span className="block w-6 h-0.5 bg-black"></span>
      </button>
      
      {/* Menu para desktop */}
      <nav className="hidden md:flex space-x-4">
        {menuItems.map(item => (
          <a 
            key={item.id} 
            href={item.href}
            className="px-3 py-2 hover:bg-gray-100 rounded"
          >
            {item.label}
          </a>
        ))}
      </nav>
      
      {/* Menu mobile expansível */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white z-50 border-b shadow-lg">
          {menuItems.map(item => (
            <a
              key={item.id}
              href={item.href}
              className="block px-4 py-3 hover:bg-gray-100 border-b"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
```

## 5. Acessibilidade: Implementação de Diretrizes WCAG

### Passo a passo:

1. **Componentes base com suporte a acessibilidade**:
```typescript
// app/components/a11y/button.tsx
import { forwardRef } from 'react';

export const AccessibleButton = forwardRef(function AccessibleButton(
  { 
    children, 
    onClick, 
    disabled = false, 
    ariaLabel, 
    className = '',
    ...props 
  }, 
  ref
) {
  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      className={`focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});
```

2. **Sistema de contraste e tamanho de fonte ajustáveis**:
```typescript
// app/components/a11y/settings.tsx
'use client';
import { createContext, useContext, useState, useEffect } from 'react';

// Contexto para configurações de acessibilidade
const A11yContext = createContext(null);

export function A11yProvider({ children }) {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('medium'); // small, medium, large, xlarge
  
  // Aplicar configurações no carregamento
  useEffect(() => {
    // Carregar configurações do IndexedDB
    async function loadSettings() {
      const db = await slideDB.getConfiguration();
      if (db.a11y) {
        setHighContrast(db.a11y.highContrast || false);
        setFontSize(db.a11y.fontSize || 'medium');
      }
    }
    
    loadSettings();
  }, []);
  
  // Aplicar classes CSS baseadas nas configurações
  useEffect(() => {
    const rootElement = document.documentElement;
    
    // Contraste
    if (highContrast) {
      rootElement.classList.add('high-contrast');
    } else {
      rootElement.classList.remove('high-contrast');
    }
    
    // Tamanho da fonte
    rootElement.classList.remove('text-small', 'text-medium', 'text-large', 'text-xlarge');
    rootElement.classList.add(`text-${fontSize}`);
    
    // Salvar configurações
    slideDB.saveConfiguration({
      a11y: { highContrast, fontSize }
    });
  }, [highContrast, fontSize]);
  
  return (
    <A11yContext.Provider value={{
      highContrast,
      setHighContrast,
      fontSize,
      setFontSize
    }}>
      {children}
    </A11yContext.Provider>
  );
}

// Hook para usar configurações de acessibilidade
export function useA11y() {
  const context = useContext(A11yContext);
  if (!context) {
    throw new Error('useA11y deve ser usado dentro de um A11yProvider');
  }
  return context;
}
```

3. **Painel de configurações de acessibilidade**:
```typescript
// app/components/a11y/control-panel.tsx
'use client';
import { useA11y } from './settings';

export function AccessibilityControlPanel() {
  const { highContrast, setHighContrast, fontSize, setFontSize } = useA11y();
  
  return (
    <div className="a11y-controls p-4 border rounded" role="region" aria-label="Configurações de acessibilidade">
      <h2 className="text-lg font-bold mb-3">Acessibilidade</h2>
      
      <div className="mb-3">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={highContrast}
            onChange={e => setHighContrast(e.target.checked)}
            className="mr-2"
          />
          Alto Contraste
        </label>
      </div>
      
      <div>
        <span id="font-size-label" className="block mb-2">Tamanho da Fonte</span>
        <div className="flex space-x-2" role="radiogroup" aria-labelledby="font-size-label">
          {['small', 'medium', 'large', 'xlarge'].map(size => (
            <button
              key={size}
              onClick={() => setFontSize(size)}
              className={`px-3 py-1 border rounded ${fontSize === size ? 'bg-blue-500 text-white' : ''}`}
              aria-checked={fontSize === size}
              role="radio"
            >
              {size === 'small' && 'A-'}
              {size === 'medium' && 'A'}
              {size === 'large' && 'A+'}
              {size === 'xlarge' && 'A++'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## 6. Exportação: Suporte Nativo para PDF

### Passo a passo:

1. **Implementação do serviço de exportação para PDF**:
```typescript
// app/utils/pdf-export.ts
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function exportToPDF(slidesContainer: HTMLElement, filename: string = 'apresentacao'): Promise<void> {
  if (!slidesContainer) return;
  
  const pdf = new jsPDF('landscape', 'pt', 'a4');
  const slides = slidesContainer.querySelectorAll('.slide');
  const totalSlides = slides.length;
  
  // Configurações da página PDF
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Processar cada slide
  for (let i = 0; i < totalSlides; i++) {
    const slide = slides[i] as HTMLElement;
    
    // Tornar visível apenas o slide atual
    slides.forEach((s, index) => {
      (s as HTMLElement).style.display = index === i ? 'flex' : 'none';
    });
    
    // Capturar o slide como canvas
    const canvas = await html2canvas(slide, {
      scale: 2, // Melhor qualidade
      useCORS: true, // Permitir imagens de outros domínios
      logging: false,
      allowTaint: true
    });
    
    // Ajustar proporções para caber na página
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Adicionar ao PDF
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Adicionar nova página, exceto no último slide
    if (i < totalSlides - 1) {
      pdf.addPage();
    }
  }
  
  // Restaurar visibilidade de todos os slides
  slides.forEach((s) => {
    (s as HTMLElement).style.display = '';
  });
  
  // Salvar o arquivo PDF
  pdf.save(`${filename}.pdf`);
}
```

2. **Integração na interface**:
```typescript
// app/components/export-options.tsx
'use client';
import { useRef } from 'react';
import { exportToPDF } from '../utils/pdf-export';

export function ExportOptions({ slidesTitle = 'Apresentação' }) {
  const slidesContainerRef = useRef<HTMLDivElement>(null);
  
  const handleExportPDF = async () => {
    if (!slidesContainerRef.current) return;
    
    try {
      await exportToPDF(slidesContainerRef.current, slidesTitle);
    } catch (error) {
      console.error('Erro ao exportar para PDF:', error);
      // Mostrar erro ao usuário
    }
  };
  
  const handleExportHTML = () => {
    // Código existente para exportação HTML
  };
  
  return (
    <div className="export-controls">
      <h3 className="text-lg font-medium mb-2">Exportar Apresentação</h3>
      
      <div className="flex space-x-3">
        <button 
          onClick={handleExportPDF}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Exportar como PDF
        </button>
        
        <button 
          onClick={handleExportHTML}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Exportar como HTML
        </button>
      </div>
      
      {/* Container de slides para referência */}
      <div ref={slidesContainerRef} className="hidden-slides-container">
        {/* Slides serão renderizados aqui para captura */}
      </div>
    </div>
  );
}
```

3. **Adição de dependências necessárias**:
```bash
npm install html2canvas jspdf
```

## 7. Integração com Plataformas Educacionais

### Passo a passo:

1. **Implementação de módulo de exportação para plataformas LMS**:
```typescript
// app/utils/lms-integration.ts

// Interface para plataformas suportadas
interface LMSPlatform {
  name: string;
  exportFunction: (slides: any[], config: any) => Promise<string>;
  icon: string;
}

// Exportação para Moodle
async function exportToMoodle(slides: any[], config: any): Promise<string> {
  // Criar arquivo no formato que o Moodle aceita
  // Normalmente, um arquivo HTML ou SCORM package
  
  // Criar estrutura SCORM
  const scormPackage = createSCORMPackage(slides, config);
  
  // Retornar URL para download
  return URL.createObjectURL(scormPackage);
}

// Exportação para Google Classroom
async function exportToGoogleClassroom(slides: any[], config: any): Promise<string> {
  // Integração com Google Classroom API
  // Requer autenticação OAuth
  
  // Para uma integração mais simples, podemos gerar um link compartilhável
  const htmlPackage = createHTMLExport(slides, config);
  
  // Retornar URL para download
  return URL.createObjectURL(htmlPackage);
}

// Plataformas suportadas
export const supportedPlatforms: LMSPlatform[] = [
  {
    name: 'Moodle',
    exportFunction: exportToMoodle,
    icon: '/icons/moodle.svg'
  },
  {
    name: 'Google Classroom',
    exportFunction: exportToGoogleClassroom,
    icon: '/icons/google-classroom.svg'
  },
  // Outras plataformas...
];

// Função auxiliar para criar pacote SCORM
function createSCORMPackage(slides: any[], config: any): Blob {
  // Implementação da criação do pacote SCORM
  // ...
  
  // Retornar como blob
  return new Blob([/* dados do pacote */], { type: 'application/zip' });
}

// Função auxiliar para criar exportação HTML
function createHTMLExport(slides: any[], config: any): Blob {
  // Implementação da exportação HTML
  // ...
  
  // Retornar como blob
  return new Blob([/* dados HTML */], { type: 'text/html' });
}
```

2. **Interface para integração**:
```typescript
// app/components/lms-integration.tsx
'use client';
import { useState } from 'react';
import { supportedPlatforms } from '../utils/lms-integration';

export function LMSIntegration({ slides, config }) {
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [exportStatus, setExportStatus] = useState('idle');
  const [exportUrl, setExportUrl] = useState(null);
  
  const handleExport = async () => {
    if (!selectedPlatform) return;
    
    try {
      setExportStatus('loading');
      
      // Buscar a plataforma selecionada
      const platform = supportedPlatforms.find(p => p.name === selectedPlatform);
      if (!platform) throw new Error('Plataforma não encontrada');
      
      // Executar exportação
      const url = await platform.exportFunction(slides, config);
      
      setExportUrl(url);
      setExportStatus('success');
    } catch (error) {
      console.error('Erro na exportação para LMS:', error);
      setExportStatus('error');
    }
  };
  
  return (
    <div className="lms-integration p-4 border rounded">
      <h3 className="text-lg font-medium mb-3">Exportar para Plataforma Educacional</h3>
      
      <div className="mb-4">
        <label className="block mb-2">Selecione a plataforma:</label>
        <select 
          value={selectedPlatform || ''} 
          onChange={e => setSelectedPlatform(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Escolha uma plataforma</option>
          {supportedPlatforms.map(platform => (
            <option key={platform.name} value={platform.name}>
              {platform.name}
            </option>
          ))}
        </select>
      </div>
      
      <button
        onClick={handleExport}
        disabled={!selectedPlatform || exportStatus === 'loading'}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {exportStatus === 'loading' ? 'Exportando...' : 'Exportar'}
      </button>
      
      {exportStatus === 'success' && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
          <p className="mb-2">Exportação concluída com sucesso!</p>
          <a 
            href={exportUrl}
            download={`slides-${selectedPlatform.toLowerCase()}.zip`}
            className="text-blue-600 hover:underline"
          >
            Baixar arquivo para importação
          </a>
        </div>
      )}
      
      {exportStatus === 'error' && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
          <p className="text-red-700">
            Erro ao exportar. Por favor, tente novamente.
          </p>
        </div>
      )}
    </div>
  );
} 