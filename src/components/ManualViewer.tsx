import React, { useState, useMemo } from 'react';
import Markdown from 'react-markdown';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ManualViewerProps {
  content: string;
}

const TABS = [
  { id: 0, label: '🎯 Identidad' },
  { id: 1, label: '⚖️ Poder' },
  { id: 2, label: '🌓 Sombra' },
  { id: 3, label: '🗣️ Comunicación' },
  { id: 4, label: '🛠️ Mantenimiento' }
];

export function ManualViewer({ content }: ManualViewerProps) {
  const [activeTab, setActiveTab] = useState(0);

  const parsedSections = useMemo(() => {
    if (!content) return null;

    // Busca las cabeceras de cada sección, ignorando espacios, almohadillas o asteriscos iniciales
    const reg1 = /(?:^|\n)[\s#\*]*1\.\s+/;
    const reg2 = /(?:^|\n)[\s#\*]*2\.\s+/;
    const reg3 = /(?:^|\n)[\s#\*]*3\.\s+/;
    const reg4 = /(?:^|\n)[\s#\*]*4\.\s+/;
    const reg5 = /(?:^|\n)[\s#\*]*5\.\s+/;

    const m1 = content.match(reg1);
    const m2 = content.match(reg2);
    const m3 = content.match(reg3);
    const m4 = content.match(reg4);
    const m5 = content.match(reg5);

    if (m1 && m2 && m3 && m4 && m5) {
      // Ajustamos los índices por si la cabecera empieza con \n
      const idx1 = m1.index! + (m1[0].startsWith('\n') ? 1 : 0);
      const idx2 = m2.index! + (m2[0].startsWith('\n') ? 1 : 0);
      const idx3 = m3.index! + (m3[0].startsWith('\n') ? 1 : 0);
      const idx4 = m4.index! + (m4[0].startsWith('\n') ? 1 : 0);
      const idx5 = m5.index! + (m5[0].startsWith('\n') ? 1 : 0);

      if (idx1 < idx2 && idx2 < idx3 && idx3 < idx4 && idx4 < idx5) {
        const intro = content.substring(0, idx1).trim();
        const sec1 = content.substring(idx1, idx2).trim();
        const sec2 = content.substring(idx2, idx3).trim();
        const sec3 = content.substring(idx3, idx4).trim();
        const sec4 = content.substring(idx4, idx5).trim();
        const sec5 = content.substring(idx5).trim();

        return [
          intro ? `${intro}\n\n${sec1}` : sec1,
          sec2,
          sec3,
          sec4,
          sec5
        ];
      }
    }
    
    return null;
  }, [content]);

  if (!parsedSections) {
    return (
      <div className="manual-prose px-5 sm:px-0">
        <Markdown>{content}</Markdown>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-[#EAE2D6] pb-4 px-5 sm:px-0">
        {TABS.map((tab, idx) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(idx)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === idx 
                ? 'bg-[#CB997E] text-white shadow-sm' 
                : 'bg-[#F9F7F1] text-stone-600 hover:bg-[#EAE2D6]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-5 sm:px-0">
        <div className="manual-prose">
          <Markdown>{parsedSections[activeTab]}</Markdown>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-10 pt-6 border-t border-[#EAE2D6] flex items-center justify-between text-sm font-medium px-5 sm:px-0">
        <button
          onClick={() => setActiveTab(prev => Math.max(0, prev - 1))}
          disabled={activeTab === 0}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>
        
        <span className="text-stone-400">
          {activeTab + 1} de 5
        </span>

        <button
          onClick={() => setActiveTab(prev => Math.min(4, prev + 1))}
          disabled={activeTab === 4}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
