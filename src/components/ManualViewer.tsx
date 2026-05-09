import React, { useState, useMemo } from 'react';
import Markdown from 'react-markdown';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ManualViewerProps {
  manualText: string;
}

const TABS = [
  { id: 0, label: '🎯 Identidad' },
  { id: 1, label: '⚖️ Poder' },
  { id: 2, label: '🌓 Sombra' },
  { id: 3, label: '🗣️ Comunicación' },
  { id: 4, label: '🛠️ Mantenimiento' }
];

export function ManualViewer({ manualText }: ManualViewerProps) {
  const [activeTab, setActiveTab] = useState(0);

  const parsedSections = useMemo(() => {
    // A regex that attempts to match "1. ", "2. ", etc., up to 5 sections
    // Captures the whole text of the block.
    // It finds points like \n1. or ^1. and looks forward.
    const splitRegex = /(?:^|\n)(#{0,3}\s*[1-5]\.\s+.*?)(?=(?:\n#{0,3}\s*[1-5]\.\s+)|$)/gs;
    const matches = Array.from(manualText.matchAll(splitRegex)).map(m => m[1].trim());

    // Check if we found exactly 5 blocks and they begin with standard increments
    const hasAllFive = matches.length === 5 && 
      matches[0].match(/^#{0,3}\s*1\./) &&
      matches[1].match(/^#{0,3}\s*2\./) &&
      matches[2].match(/^#{0,3}\s*3\./) &&
      matches[3].match(/^#{0,3}\s*4\./) &&
      matches[4].match(/^#{0,3}\s*5\./);

    if (hasAllFive) {
      // Find intro if it exists before the first match
      const firstMatch = manualText.match(/(?:^|\n)#{0,3}\s*1\.\s+/);
      let intro = "";
      if (firstMatch && firstMatch.index !== undefined && firstMatch.index > 0) {
        intro = manualText.substring(0, firstMatch.index).trim();
      }

      if (intro) {
        matches[0] = intro + "\n\n" + matches[0];
      }
      return matches;
    }
    
    return null;
  }, [manualText]);

  if (!parsedSections) {
    return (
      <div className="manual-prose px-5 sm:px-0">
        <Markdown>{manualText}</Markdown>
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
