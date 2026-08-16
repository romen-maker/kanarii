import { useTopBar } from '../../contexts/TopBarContext';
import { UserAvatarMenu } from './UserAvatarMenu';
import { LanguageSelector } from '../language/LanguageSelector';

export function TopBar() {
  const { topBarState } = useTopBar();

  return (
    <header className="sticky top-0 z-30 bg-bg-page/95 backdrop-blur-md border-b border-border px-4 md:px-6 h-14 flex items-center justify-between shadow-xs">
      {/* Zona Izquierda: Logo Kanarii y/o Título */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <img src="/icono-palmera.svg" alt="Kanarii" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span className="font-serif text-lg text-stone-800 font-bold tracking-tight">Kanarii</span>
        </div>

        {topBarState.title && (
          <>
            <span className="text-stone-300 text-sm hidden sm:inline">/</span>
            <h2 className="text-sm font-bold text-stone-800 truncate hidden sm:inline">{topBarState.title}</h2>
          </>
        )}
      </div>

      {/* Zona Derecha: Actions Slot (a la izquierda del avatar) + Separador + UserAvatarMenu */}
      <div className="flex items-center shrink-0 ml-auto gap-1 sm:gap-2">
        {topBarState.actions && (
          <div className="flex items-center gap-2">
            {topBarState.actions}
          </div>
        )}

        {topBarState.actions && (
          <div className="h-5 w-px bg-border mx-2 sm:mx-3 shrink-0" />
        )}

        <LanguageSelector />
        <UserAvatarMenu />
      </div>
    </header>
  );
}
