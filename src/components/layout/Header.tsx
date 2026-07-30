import { UserAvatarMenu } from './UserAvatarMenu';

export function Header() {
  return (
    <>
      {/* TopBar Móvil (fijo en la parte superior de la pantalla) */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#EAE2D6] px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <img src="/icono-palmera.svg" alt="Kanarii" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span className="font-serif text-lg text-[#4A4E4D] font-bold tracking-tight">Kanarii</span>
        </div>
        <UserAvatarMenu />
      </header>

      {/* TopBar Escritorio (fijo en la esquina superior derecha del viewport) */}
      <header className="hidden md:block fixed top-4 right-6 z-40">
        <UserAvatarMenu />
      </header>
    </>
  );
}
