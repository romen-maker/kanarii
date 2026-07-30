import { useTopBar } from '../../contexts/TopBarContext';
import { UserAvatarMenu } from './UserAvatarMenu';

export function TopBar() {
  const { topBarState } = useTopBar();

  return (
    <header className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#EAE2D6] px-4 md:px-6 h-14 flex items-center justify-between shadow-xs">
      {/* Zona Izquierda: Logo Kanarii y/o Título */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <img src="/icono-palmera.svg" alt="Kanarii" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span className="font-serif text-lg text-[#4A4E4D] font-bold tracking-tight">Kanarii</span>
        </div>

        {topBarState.title && (
          <>
            <span className="text-stone-300 text-sm hidden sm:inline">/</span>
            <h2 className="text-sm font-bold text-[#4A4E4D] truncate hidden sm:inline">{topBarState.title}</h2>
          </>
        )}
      </div>

      {/* Zona Derecha: Actions Slot + Separador + UserAvatarMenu */}
      <div className="flex items-center shrink-0">
        {topBarState.actions && (
          <div className="flex items-center gap-2">
            {topBarState.actions}
          </div>
        )}

        {topBarState.actions && (
          <div className="h-5 w-px bg-[#EAE2D6] mx-3 shrink-0" />
        )}

        <UserAvatarMenu />
      </div>
    </header>
  );
}
