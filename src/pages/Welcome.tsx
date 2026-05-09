import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { Leaf } from 'lucide-react';

export function Welcome() {
  const { appUser, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (appUser) {
      if (appUser.role === 'admin') navigate('/admin');
      else if (!appUser.hasConsented) navigate('/contexto');
      else navigate('/ficha'); // We need logic to check if onboarded
    }
  }, [appUser, navigate]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="flex justify-center mb-4">
          <div className="bg-[#EAE2D6] p-4 rounded-full">
            <Leaf className="w-12 h-12 text-[#6B705C]" />
          </div>
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
          <p className="text-[#CB997E] font-medium font-serif text-xl mt-4">
            Las personas solas pueden llegar a ser poderosas, pero juntas somos invencibles.
          </p>
        </div>

        <div className="pt-8 space-y-4">
          <button
            onClick={() => navigate('/contexto')}
            className="w-full bg-[#A5A58D] hover:bg-[#6B705C] text-white transition-colors duration-300 py-4 px-6 rounded-2xl text-lg font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-3"
          >
            Unirse a la tribu
          </button>
          
          <button
            onClick={login}
            className="w-full py-4 px-6 text-[#A5A58D] hover:text-[#6B705C] transition-colors rounded-2xl text-lg font-medium"
          >
            Ya soy parte (Iniciar sesión)
          </button>
        </div>
      </div>
    </div>
  );
}
