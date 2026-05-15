import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { AuthGateModal } from '../components/AuthGateModal';

export function Welcome() {
  const { user, appUser, login } = useAuth();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    if (appUser) {
      // 1. Prioridad: Ficha pendiente de onboarding
      const pendingFicha = localStorage.getItem('kanarii_pendingFicha');
      if (pendingFicha) {
        navigate('/ficha-preview');
        return;
      }

      // 2. Si no tiene comunidades, forzar descubrimiento
      if (!appUser.communityIds || appUser.communityIds.length === 0) {
        navigate('/comunidades');
      }
    }
  }, [appUser, navigate]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="flex justify-center mb-4">
          <img src="/kanarii-logo.svg" alt="Kanarii" style={{ width: '140px', height: '140px', objectFit: 'contain' }} />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-[#4A4E4D]">Kanarii</h1>
        <h2 className="text-xl md:text-2xl font-light text-[#8A817C] tracking-wide">Tawăzawazt</h2>
        
        <div className="text-lg text-stone-600 leading-relaxed mt-6 space-y-4">
          <p className="font-medium text-[#6B705C]">
            Esto no es un evento, es una forma de vida.
          </p>
          <p>
            Un espacio que congrega a nuestra tribu. Una red que sostiene, cuida
            y hace crecer nuestra revolución interna para expandirla de adentro hacia afuera.
          </p>
        </div>


        <div className="pt-8 space-y-4">
          {appUser ? (
            <div className="flex flex-col items-center gap-4 border border-[#EAE2D6] bg-white p-6 rounded-3xl shadow-sm">
               <div className="flex items-center gap-3 mb-2">
                 {user?.photoURL ? (
                   <img src={user.photoURL} alt={user.displayName || 'Avatar'} className="w-12 h-12 rounded-full" />
                 ) : (
                   <div className="w-12 h-12 rounded-full bg-[#EAE2D6] flex items-center justify-center text-[#6B705C]">
                     <User className="w-6 h-6" />
                   </div>
                 )}
                 <div className="text-left">
                   <p className="font-medium text-stone-800">{user?.displayName || appUser.email}</p>
                   <p className="text-sm text-stone-500">Sesión iniciada</p>
                 </div>
               </div>

               <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={() => navigate('/ficha')}
                    className="flex-1 bg-[#A5A58D] hover:bg-[#6B705C] text-white transition-colors py-3 px-4 rounded-xl font-medium"
                  >
                    Ver mi ficha
                  </button>
                  {appUser.role === 'admin' && (
                    <button
                      onClick={() => navigate('/admin')}
                      className="flex-1 border border-[#A5A58D] text-[#A5A58D] hover:bg-[#F9F7F1] transition-colors py-3 px-4 rounded-xl font-medium"
                    >
                      Panel admin
                    </button>
                  )}
               </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate('/contexto')}
                className="w-full bg-[#A5A58D] hover:bg-[#6B705C] text-white transition-colors duration-300 py-4 px-6 rounded-2xl text-lg font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-3"
              >
                Unirse a la tribu
              </button>
              
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="w-full py-4 px-6 text-[#A5A58D] hover:text-[#6B705C] transition-colors rounded-2xl text-lg font-medium"
              >
                Ya soy parte (Iniciar sesión)
              </button>
            </>
          )}
          <p className="text-[#CB997E] font-medium font-serif text-xl pt-6">
            Las personas solas pueden llegar a ser poderosas, pero juntas somos invencibles.
          </p>
        </div>
      </div>
      <AuthGateModal
        isOpen={isLoginModalOpen}
        mode="login"
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
