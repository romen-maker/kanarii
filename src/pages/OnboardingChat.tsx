import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Send, User as UserIcon, Leaf, ArrowLeft, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { LocationAutocomplete } from '../components/LocationAutocomplete';
import { geocodeLugar } from '../lib/geocoding';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
}

const STEPS = [
  { key: 'nombre', q: '¡Bienvenida, bienvenido a esta linda tribu! Qué alegría sentir tu energía aquí. Para empezar a tejer nuestra red, ¿cómo te llamas o cómo sientes que te llamemos?' },
  { key: 'fechaNacimiento', q: 'Tanemmirt (gracias). Para conectar con nuestros ciclos vitales y entender tu momento en esta experiencia, ¿cuál es tu fecha de nacimiento? (ej: 1990-05-14)' },
  { key: 'hora', q: 'El instante en que llegaste tiene su propia magia. ¿Conoces la hora, aunque sea aproximada, en la que naciste? Si no la sabes, escribe 00:00. Puedes buscarla en tu partida de nacimiento. (ej: 14:30)' },
  { key: 'lugar', q: 'Nuestras raíces nos conectan con la tierra. ¿En qué rincón del mundo, ciudad o región naciste?' },
  { key: 'genero', q: 'En esta búsqueda de equilibrio entre nuestras energías femeninas y masculinas, ¿con qué género te identificas y habitas el mundo?',
    options: [
      { label: 'Hombre', value: 'hombre' },
      { label: 'Mujer', value: 'mujer' },
      { label: 'No Binario', value: 'no_binario' },
      { label: 'Prefiero no decir', value: 'prefiero_no_decir' }
    ]
  },
  { key: 'saberes', q: 'Todas y todos traemos aprendizajes valiosos. ¿Cuáles son tus saberes, formación o recorrido vital que te acompañan hoy?' },
  { key: 'rol_arteara', q: 'Cada persona es un hilo vital en nuestra tela de araña cósmica. ¿Cuál sientes que es tu rol, participación o aporte actual dentro de este proyecto y nuestra tribu?' },
  { key: 'antiguedad_anos', q: 'El tiempo caminando juntos fortalece nuestros cimientos. ¿Desde cuándo formas parte de la comunidad o sientes tu vinculación a esta red?',
    options: [
      { label: 'Recién llegado/a (menos de 6 meses)', value: '0' },
      { label: 'Entre 6 meses y 1 año', value: '0.5' },
      { label: 'Entre 1 y 2 años', value: '1' },
      { label: 'Entre 2 y 5 años', value: '3' },
      { label: 'Más de 5 años', value: '5' }
    ]
  },
  { key: 'tension', q: 'Por último, para poder cuidarnos y sostenernos desde el respeto: ¿cómo describirías tu estado interno actual, tu paz o tu nivel de tensión en la convivencia de la tribu?' }
];

export function OnboardingChat() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', sender: 'bot', text: STEPS[0].q }
  ]);
  const [pendingResponses, setPendingResponses] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [input, setInput] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveResponseLocal = (step: string, message: string, sender: 'bot' | 'user') => {
    setPendingResponses(prev => [...prev, { step, message, sender }]);
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
    
    // START GEOCODING IN BG if local
    if (stepKey === 'lugar') {
      geocodeLugar(userText).then(res => {
         setFormData(current => ({
           ...current, 
           lugar: res.lugarNormalizado,
           latitud: res.latitud.toString(), // will be parsed as float later
           longitud: res.longitud.toString(),
           timezone: res.timezone
         }));
      }).catch(err => {
         console.warn("Geocoding failed for initial input", err);
      });
    }

    saveResponseLocal(stepKey, userText, 'user');

    if (currentStepIndex < STEPS.length - 1) {
      const nextStepIndex = currentStepIndex + 1;
      const botMsgText = STEPS[nextStepIndex].q;
      
      setCurrentStepIndex(nextStepIndex);
      
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: botMsgText }]);
        saveResponseLocal(STEPS[nextStepIndex].key, botMsgText, 'bot');
      }, 600);
      
    } else {
      // Done!
      setSaving(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: '¡Tanemmirt (gracias) por tu tiempo y energía! Estamos trazando tu ficha comunitaria...' }]);
        
        localStorage.setItem('kanarii_pendingFicha', JSON.stringify(newData));
        localStorage.setItem('kanarii_pendingResponses', JSON.stringify([...pendingResponses, { step: stepKey, message: userText, sender: 'user' }]));
        navigate('/ficha-preview');
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center">
      <header className="w-full bg-white border-b border-[#EAE2D6] p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm relative">
        <div className="flex-1">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors">
             <ArrowLeft className="w-4 h-4" />
             <span className="hidden sm:inline">Volver al inicio</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2 justify-center absolute left-1/2 -translate-x-1/2">
          <Leaf className="w-6 h-6 text-[#6B705C]" />
          <h1 className="text-xl font-serif text-[#4A4E4D]">Conversación de Acogida</h1>
        </div>

        <div className="flex-1 flex justify-end">
          {user === null && (
            <button onClick={login} className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-[#CB997E] transition-colors">
              <span className="hidden sm:inline">Iniciar sesión</span>
              <LogIn className="w-4 h-4" />
            </button>
          )}
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
        <div className="max-w-2xl w-full relative flex flex-col gap-2">
          {STEPS[currentStepIndex]?.options ? (
            <div className="flex flex-wrap gap-2 justify-center mb-2">
              {STEPS[currentStepIndex].options.map((opt: any) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setInput(opt.value);
                    // use setTimeout to ensure state isn't batched wrongly, or just call handleSend directly with value:
                    // Actually handleSend uses input state, better let it be or pass param
                  }}
                  className="bg-white border border-[#CB997E] text-[#CB997E] hover:bg-[#CB997E] hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ) : null}
          {STEPS[currentStepIndex]?.key === 'lugar' ? (
            <LocationAutocomplete onSelect={(data) => {
              // we store the JSON string to parse it later, or just mock typing it
              const val = JSON.stringify(data);
              setFormData(prev => ({ ...prev, [STEPS[currentStepIndex].key]: val }));
              // Then artificially send message
              const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: data.ciudad };
              setMessages(prev => [...prev, userMsg]);
              saveResponseLocal(STEPS[currentStepIndex].key, data.ciudad, 'user');
              
              if (currentStepIndex < STEPS.length - 1) {
                const nextStepIndex = currentStepIndex + 1;
                const botMsgText = STEPS[nextStepIndex].q;
                setCurrentStepIndex(nextStepIndex);
                setTimeout(() => {
                  setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: botMsgText }]);
                  saveResponseLocal(STEPS[nextStepIndex].key, botMsgText, 'bot');
                }, 600);
              } else {
                setSaving(true);
                setTimeout(() => {
                  setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: '¡Tanemmirt (gracias) por tu tiempo y energía! Estamos trazando tu ficha comunitaria...' }]);
                  const finalData = { ...formData, [STEPS[currentStepIndex].key]: val };
                  localStorage.setItem('kanarii_pendingFicha', JSON.stringify(finalData));
                  localStorage.setItem('kanarii_pendingResponses', JSON.stringify([...pendingResponses, { step: STEPS[currentStepIndex].key, message: data.ciudad, sender: 'user' }]));
                  navigate('/ficha-preview');
                }, 1000);
              }
            }} />
          ) : (
            <div className="relative flex items-center w-full">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={STEPS[currentStepIndex]?.options ? "O selecciona una opción arriba..." : "Escribe tu respuesta aquí..."}
                disabled={saving}
                className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-full py-4 pl-6 pr-14 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]"
              />
              <button
                onClick={() => handleSend()}
                disabled={saving || !input.trim()}
                className="absolute right-2 p-2 bg-[#6B705C] text-white rounded-full hover:bg-[#4A4E4D] transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
