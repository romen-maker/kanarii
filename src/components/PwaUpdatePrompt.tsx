import { useRegisterSW } from 'virtual:pwa-register/react';

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50
                    bg-[#6B705C] border border-[#FDFBF7]/25 text-[#FDFBF7] px-5 py-3.5 rounded-[1.25rem] shadow-xl
                    flex items-center gap-4 text-xs font-medium backdrop-blur-md">
      <span className="flex items-center gap-1.5 font-semibold">
        🔄 Nueva versión disponible
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateServiceWorker(true)}
          className="bg-[#FDFBF7] text-[#6B705C] px-3 py-1.5 rounded-xl font-bold transition-all hover:bg-[#FDFBF7]/90 active:scale-95 shadow-sm"
        >
          Actualizar
        </button>
        <button 
          onClick={() => setNeedRefresh(false)} 
          className="hover:bg-white/10 p-1.5 rounded-lg transition-colors opacity-70 hover:opacity-100"
          aria-label="Cerrar aviso"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
