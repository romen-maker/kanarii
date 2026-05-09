import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, HeartHandshake } from 'lucide-react';

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
          <h1 className="text-3xl font-serif text-[#4A4E4D]">Nuestra Puesta e Intención</h1>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#EAE2D6] space-y-6 text-lg leading-relaxed text-stone-600">
          <div className="flex item-start gap-4 p-5 bg-[#F9F7F1] rounded-2xl mb-6 border border-[#EAE2D6]">
            <HeartHandshake className="w-8 h-8 text-[#CB997E] flex-shrink-0 mt-1" />
            <p className="text-stone-700 text-base leading-relaxed">
              Bienvenidas y bienvenidos, linda tribu. Estás a punto de crear tu ficha comunitaria. Lejos de ser un mero trámite, esto es un paso para reconocernos, saber desde dónde nos sostenemos y cuidamos mutuamente.
            </p>
          </div>

          <p>
            <b>Kanarii / Tawăzawazt</b> es el reflejo de una intención profunda. Esto no es un evento en concreto, es un canal para congregarnos cada cierto tiempo y unirnos aún más como tribu. Es una forma y experiencia de vida guiada por valores como la soberanía comunitaria, el amor por la vida, por la naturaleza y la búsqueda de equilibrios entre nuestras energías.
          </p>
          
          <p>
            Ser parte de esta comunidad requiere compromiso e implicación en el tiempo. La información que vamos a compartir en los siguientes pasos es esencial para mapear nuestros ciclos vitales, saberes, necesidades y nuestra energía actual. Nos ayudará a trazar la "tela de araña cósmica" que lo integra y conecta todo.
          </p>
          
          <div className="text-center py-4">
            <p className="text-[#CB997E] font-medium font-serif italic text-xl">
              "Las personas solas pueden llegar a ser poderosas, pero juntas somos invencibles."
            </p>
          </div>

          <p className="text-sm text-stone-500 italic">
            Trataremos tu información desde una perspectiva de seguridad comunitaria. Todo lo que se crea aquí se nutre de la tribu y para la tribu.
          </p>

          <div className="pt-8">
            <button
              onClick={handleAccept}
              className="w-full sm:w-auto bg-[#CB997E] hover:bg-[#B58368] text-white py-4 px-8 rounded-2xl text-lg font-medium transition-colors float-right"
            >
              Siento la llamada y me resuena
            </button>
            <div className="clear-both"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
