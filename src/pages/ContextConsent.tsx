import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, Info } from 'lucide-react';

export function ContextConsent() {
  const { updateConsent } = useAuth();
  const navigate = useNavigate();

  const handleAccept = async () => {
    await updateConsent();
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 p-6 flex flex-col items-center py-12">
      <div className="max-w-2xl w-full">
        <div className="flex items-center gap-3 mb-8">
          <Leaf className="text-[#6B705C] w-8 h-8" />
          <h1 className="text-3xl font-serif text-[#4A4E4D]">Antes de empezar</h1>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#EAE2D6] space-y-6 text-lg leading-relaxed text-stone-600">
          <div className="flex item-start gap-4 p-4 bg-[#F9F7F1] rounded-2xl mb-6">
            <Info className="w-6 h-6 text-[#A5A58D] flex-shrink-0 mt-1" />
            <p className="text-stone-700 text-base">
              Hola. Estás a punto de crear tu ficha comunitaria. Esta información nos ayuda a conocernos, ubicarnos y cuidarnos mutuamente.
            </p>
          </div>

          <p>
            <b>Kanarii / Tawăzawazt</b> es más que una plataforma; es un reflejo de nuestra comunidad.
          </p>
          
          <p>
            Al continuar, iniciarás una conversación breve para compartir quién eres y desde dónde te acercas. Los datos que pedimos son obligatorios para mantener un mapa claro de nuestra red, nuestras edades, roles y niveles de convivencia.
          </p>
          
          <p>
            Trataremos tu información con el debido cuidado, bajo una perspectiva de seguridad comunitaria y respeto.
          </p>

          <div className="pt-8">
            <button
              onClick={handleAccept}
              className="w-full sm:w-auto bg-[#CB997E] hover:bg-[#B58368] text-white py-4 px-8 rounded-2xl text-lg font-medium transition-colors float-right"
            >
              Comprendo y acepto
            </button>
            <div className="clear-both"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
