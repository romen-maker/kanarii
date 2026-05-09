import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { saveFicha } from '../lib/appService';
import { useFicha } from '../hooks/useFicha';
import { Send, User as UserIcon, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
}

const STEPS = [
  { key: 'nombre', q: '¡Bienvenida, bienvenido a esta linda tribu! Qué alegría sentir tu energía aquí. Para empezar a tejer nuestra red, ¿cómo te llamas o cómo sientes que te llamemos?' },
  { key: 'fechaNacimiento', q: 'Tanemmirt (gracias). Para conectar con nuestros ciclos vitales y entender tu momento en esta experiencia, ¿cuál es tu fecha de nacimiento? (ej: 14/05/1990)' },
  { key: 'horaNacimiento', q: 'El instante en que llegaste tiene su propia magia. ¿Conoces la hora, aunque sea aproximada, en la que naciste?' },
  { key: 'lugarNacimiento', q: 'Nuestras raíces nos conectan con la tierra. ¿En qué rincón del mundo, ciudad o región naciste?' },
  { key: 'genero', q: 'En esta búsqueda de equilibrio entre nuestras energías femeninas y masculinas, ¿con qué género te identificas y habitas el mundo?' },
  { key: 'nivelEstudios', q: 'Todas y todos traemos aprendizajes valiosos. ¿Cuáles son tus saberes, formación o recorrido de estudios que te acompañan hoy?' },
  { key: 'rolProyecto', q: 'Cada persona es un hilo vital en nuestra tela de araña cósmica. ¿Cuál sientes que es tu rol, participación o aporte actual dentro de este proyecto y nuestra tribu?' },
  { key: 'antiguedad', q: 'El tiempo caminando juntos fortalece nuestros cimientos. ¿Desde cuándo formas parte de la comunidad o sientes tu vinculación a esta red?' },
  { key: 'estadoTension', q: 'Por último, para poder cuidarnos y sostenernos desde el respeto: ¿cómo describirías tu estado interno actual, tu paz o tu nivel de tensión en la convivencia de la tribu?' }
];

export function OnboardingChat() {
  const { appUser } = useAuth();
  const { ficha, loadingFicha } = useFicha();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', sender: 'bot', text: STEPS[0].q }
  ]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [input, setInput] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadingFicha && ficha) {
      navigate('/ficha');
    }
  }, [ficha, loadingFicha, navigate]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveResponse = async (step: string, message: string, sender: 'bot'|'user') => {
    if (!appUser) return;
    try {
      await addDoc(collection(db, 'responses'), {
        userId: appUser.uid,
        step,
        message,
        sender,
        createdAt: serverTimestamp()
      });
    } catch(err) {
      handleFirestoreError(err, OperationType.CREATE, 'responses');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || saving) return;
    const userText = input.trim();
    setInput('');

    // Add user msg
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    
    const stepKey = STEPS[currentStepIndex].key;
    const newData = { ...formData, [stepKey]: userText };
    setFormData(newData);
    
    // Save to firestore async
    saveResponse(stepKey, userText, 'user');

    if (currentStepIndex < STEPS.length - 1) {
      const nextStepIndex = currentStepIndex + 1;
      const botMsgText = STEPS[nextStepIndex].q;
      
      setCurrentStepIndex(nextStepIndex);
      
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: botMsgText }]);
        saveResponse(STEPS[nextStepIndex].key, botMsgText, 'bot');
      }, 600);
      
    } else {
      // Done!
      setSaving(true);
      setTimeout(async () => {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: '¡Gracias por compartir! Generando tu ficha comunitaria...' }]);
        
        await saveFicha(appUser!.uid, newData);
        navigate('/ficha');
      }, 1000);
    }
  };

  if (loadingFicha || ficha) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center">
      <header className="w-full bg-white border-b border-[#EAE2D6] p-4 flex justify-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-[#6B705C]" />
          <h1 className="text-xl font-serif text-[#4A4E4D]">Conversación de Acogida</h1>
        </div>
      </header>
      
      <div className="flex-1 w-full max-w-2xl p-4 overflow-y-auto space-y-6 pb-32">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.sender === 'user' ? 'bg-[#CB997E] text-white' : 'bg-[#EAE2D6] text-[#6B705C]'}`}>
                  {msg.sender === 'user' ? <UserIcon className="w-5 h-5" /> : <Leaf className="w-5 h-5" />}
                </div>
                <div className={`p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-[#CB997E] text-white rounded-tr-none' : 'bg-white border border-[#EAE2D6] text-stone-700 rounded-tl-none shadow-sm'}`}>
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endOfMessagesRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-[#EAE2D6] p-4 flex justify-center">
        <div className="max-w-2xl w-full relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu respuesta aquí..."
            disabled={saving}
            className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-full py-4 pl-6 pr-14 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]"
          />
          <button
            onClick={handleSend}
            disabled={saving || !input.trim()}
            className="absolute right-2 p-2 bg-[#6B705C] text-white rounded-full hover:bg-[#4A4E4D] transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
