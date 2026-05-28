import { useState, useCallback } from 'react';

export interface UseTagArrayReturn {
  tags: string[];
  addTag: (tag: string) => boolean;
  removeTag: (tag: string) => void;
  setTags: (tags: string[]) => void;
  clear: () => void;
}

/**
 * Hook de utilidad para gestionar el estado de un array de strings (tags).
 * Evita duplicados, elimina espacios en blanco y filtra elementos vacíos.
 */
export function useTagArray(initialTags: string[] = []): UseTagArrayReturn {
  const [tags, setTagsState] = useState<string[]>(() => 
    initialTags.map(t => t.trim()).filter(Boolean)
  );

  const addTag = useCallback((tag: string): boolean => {
    const cleaned = tag.trim();
    if (!cleaned) return false;

    let added = false;
    setTagsState(prev => {
      if (prev.includes(cleaned)) {
        return prev; // Evitar duplicados
      }
      added = true;
      return [...prev, cleaned];
    });

    return added;
  }, []);

  const removeTag = useCallback((tagToRemove: string) => {
    setTagsState(prev => prev.filter(t => t !== tagToRemove));
  }, []);

  const setTags = useCallback((newTags: string[]) => {
    setTagsState(newTags.map(t => t.trim()).filter(Boolean));
  }, []);

  const clear = useCallback(() => {
    setTagsState([]);
  }, []);

  return {
    tags,
    addTag,
    removeTag,
    setTags,
    clear
  };
}
