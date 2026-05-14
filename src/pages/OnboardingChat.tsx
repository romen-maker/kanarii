import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Send, User as UserIcon, Leaf, ArrowLeft, LogIn, Undo2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { LocationAutocomplete } from '../components/LocationAutocomplete';
import { geocodeLugar } from '../lib/geocoding';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
}

const INITIAL_STEPS = [
  { key: 'rol_tipo', q: '¿Cómo llegas a la comunidad?', 
    options: [
      { label: 'Soy del núcleo / propietaria o propietario', value: 'propietario' },
      { label: 'Soy miembro de la comunidad', value: 'miembro' },
      { label: 'Vengo como voluntario/a (Workaway, HelpX...)', value: 'voluntario' }
    ]
  },
  { key: 'nombre', q: '¡Bienvenida, bienvenido a esta linda tribu! Qué alegría sentir tu energía aquí. Para empezar a tejer nuestra red, ¿cómo te llamas o cómo sientes que te llamemos?' },
  { key: 'fechaNacimiento', type: 'date', q: 'Tanemmirt (gracias). Para conectar con nuestros ciclos vitales y entender tu momento en esta experiencia, ¿cuál es tu fecha de nacimiento? (ej: 1990-05-14)' },
  { key: 'hora', type: 'time', q: 'El instante en que llegaste tiene su propia magia. ¿Conoces la hora, aunque sea aproximada, en la que naciste? Si no la sabes, escribe 00:00. Puedes buscarla en tu partida de nacimiento. (ej: 14:30)' },
  { key: 'lugar', q: 'Nuestras raíces nos conectan con la tierra. ¿En qué rincón del mundo, ciudad o región naciste?' },
  { key: 'genero', q: 'En esta búsqueda de equilibrio entre nuestras energías femeninas y masculinas, ¿con qué género te identificas y habitas el mundo?',
    options: [
      { label: 'Hombre', value: 'hombre' },
      { label: 'Mujer', value: 'mujer' },
      { label: 'No Binario', value: 'no_binario' },
      { label: 'Prefiero no decir', value: 'prefiero_no_decir' }
    ]
  },
  { key: 'saberes', q: 'Todas y todos traemos aprendizajes valiosos. ¿Cuáles son tus saberes, formación o recorrido vital que te acompañan hoy?', example: 'Ejemplos: Sé de agricultura ecológica, me encanta tejer, estuve 10 años como electricista, toco la guitarra, cocino para multitudes...' },
  { key: 'rol_comunidad', q: 'Cada persona es un hilo vital en nuestra tela de araña cósmica. ¿Cuál sientes que es tu rol, participación o aporte actual dentro de este proyecto y nuestra tribu?', example: 'Ejemplos: Colaboro en el huerto, asisto a los círculos de escucha, ayudo con la contabilidad, hago los diseños gráficos...' },
  { key: 'antiguedad_anos', q: 'El tiempo caminando juntos fortalece nuestros cimientos. ¿Desde cuándo formas parte de la comunidad o sientes tu vinculación a esta red?',
    options: [
      { label: 'Recién llegado/a (menos de 6 meses)', value: '0' },
      { label: 'Entre 6 meses y 1 año', value: '0.5' },
      { label: 'Entre 1 y 2 años', value: '1' },
      { label: 'Entre 2 y 5 años', value: '3' },
      { label: 'Más de 5 años', value: '5' }
    ]
  },
  { key: 'tension', q: 'Por último, para poder cuidarnos y sostenernos desde el respeto: ¿cómo describirías tu estado interno actual, tu paz o tu nivel de tensión en la convivencia de la tribu?', example: 'Ejemplos: Me siento en paz y con energía, a veces me estresan las asambleas largas, tengo poco tiempo disponible úlitmamente, me cuesta expresarme en grupo...' }
];

export function OnboardingChat() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [steps, setSteps] = useState(INITIAL_STEPS);

  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', sender: 'bot', text: INITIAL_STEPS[0].q }
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

  const handleBack = () => {
    if (currentStepIndex === 0 || saving) return;
    const prevIndex = currentStepIndex - 1;
    setCurrentStepIndex(prevIndex);
    
    setInput('');
    const rebuiltMessages: Message[] = [
      { id: 'initial', sender: 'bot', text: INITIAL_STEPS[0].q }
    ];
    const newPending = pendingResponses.slice(0, prevIndex);
    
    newPending.forEach((resp, i) => {
      if (resp.sender === 'user') {
        rebuiltMessages.push({ id: `user_${i}`, sender: 'user', text: resp.message });
      }
      if (steps[i + 1]) {
         rebuiltMessages.push({ id: `bot_${i+1}`, sender: 'bot', text: steps[i + 1].q });
      }
    });

    setPendingResponses(newPending);
    setMessages(rebuiltMessages);
  };

  const handleSend = async () => {
    if (!input.trim() || saving) return;
    const userText = input.trim();
    setInput('');

    // Add user msg
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    
    const stepKey = steps[currentStepIndex].key;
    const newData = { ...formData, [stepKey]: userText };
    
    let currentSteps = [...steps];
    if (stepKey === 'rol_tipo') {
      newData.rol = userText; // Map to the rol property dynamically
      if (userText === 'voluntario') {
        const lugarIndex = currentSteps.findIndex(s => s.key === 'lugar');
        if (lugarIndex !== -1 && !currentSteps.find(s => s.key === 'fechas_voluntario')) {
          currentSteps.splice(lugarIndex + 1, 0, 
            { key: 'fechas_voluntario', q: '¿Cuándo planeas llegar y cuándo te irías aproximadamente?' },
            { key: 'habilidades_voluntario', q: '¿Qué habilidades o saberes traes para compartir con la finca?' }
          );
        }
      } else {
        currentSteps = currentSteps.filter(s => s.key !== 'fechas_voluntario' && s.key !== 'habilidades_voluntario');
      }
      setSteps(currentSteps);
    }
    
    setFormData(newData);
    saveResponseLocal(stepKey, userText, 'user');

    if (currentStepIndex < currentSteps.length - 1) {
      const nextStepIndex = currentStepIndex + 1;
      const botMsgText = currentSteps[nextStepIndex].q;
      
      setCurrentStepIndex(nextStepIndex);
      
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: botMsgText }]);
        saveResponseLocal(currentSteps[nextStepIndex].key, botMsgText, 'bot');
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
          {steps[currentStepIndex]?.options ? (
            <div className="flex flex-wrap gap-2 justify-center mb-2">
              {steps[currentStepIndex].options?.map((opt: any) => (
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
          {steps[currentStepIndex]?.key === 'lugar' ? (
            <LocationAutocomplete 
              disabled={saving}
              onEnter={() => {
                setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: 'Por favor, selecciona tu lugar desde la lista para obtener las coordenadas correctas.' }]);
              }}
              onSelect={async (data) => {
                setSaving(true);
                
                const waitMsgId = Date.now().toString() + "_wait";
                setMessages(prev => [...prev, 
                  { id: Date.now().toString(), sender: 'user', text: data.ciudad },
                  { id: waitMsgId, sender: 'bot', text: 'Un momento, obteniendo coordenadas... 🌍' }
                ]);

                try {
                  const newDataFields = {
                    lugar: data.lugarNormalizado || data.ciudad,
                    latitud: data.latitud.toString(),
                    longitud: data.longitud.toString(),
                    timezone: data.timezone
                  };
                  setFormData(prev => ({ ...prev, ...newDataFields }));
                  
                  saveResponseLocal(steps[currentStepIndex].key, data.ciudad, 'user');

                  // Replace temporary wait message and let the user proceed
                  setMessages(prev => prev.filter(m => m.id !== waitMsgId));

                  if (currentStepIndex < steps.length - 1) {
                    const nextStepIndex = currentStepIndex + 1;
                    const botMsgText = steps[nextStepIndex].q;
                    setCurrentStepIndex(nextStepIndex);
                    setTimeout(() => {
                      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: botMsgText }]);
                      saveResponseLocal(steps[nextStepIndex].key, botMsgText, 'bot');
                      setSaving(false);
                    }, 600);
                  } else {
                    setTimeout(() => {
                      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: '¡Tanemmirt (gracias) por tu tiempo y energía! Estamos trazando tu ficha comunitaria...' }]);
                      const finalData = { ...formData, ...newDataFields };
                      localStorage.setItem('kanarii_pendingFicha', JSON.stringify(finalData));
                      localStorage.setItem('kanarii_pendingResponses', JSON.stringify([...pendingResponses, { step: steps[currentStepIndex].key, message: data.ciudad, sender: 'user' }]));
                      navigate('/ficha-preview');
                    }, 1000);
                  }
                } catch (err) {
                  setMessages(prev => [
                    ...prev.filter(m => m.id !== waitMsgId), 
                    { id: Date.now().toString() + "_err", sender: 'bot', text: 'No pudimos guardar las coordenadas. Por favor, inténtalo de nuevo.' }
                  ]);
                  setSaving(false);
                }
            }} />
          ) : (
            <div className="relative flex items-center w-full gap-2">
              {currentStepIndex > 0 && (
                <button
                  onClick={handleBack}
                  disabled={saving}
                  title="Volver al paso anterior"
                  className="flex-shrink-0 p-3 bg-white border border-[#EAE2D6] text-stone-500 rounded-full hover:bg-[#F9F7F1] hover:text-stone-800 transition-colors disabled:opacity-50"
                >
                  <Undo2 className="w-5 h-5" />
                </button>
              )}
              <div className="relative flex-1 flex flex-col gap-1">
                {(steps[currentStepIndex] as any)?.example && (
                  <p className="text-xs text-stone-500 pl-4">{(steps[currentStepIndex] as any).example}</p>
                )}
                <div className="relative w-full">
                  <input
                    type={(steps[currentStepIndex] as any)?.type || "text"}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={steps[currentStepIndex]?.options ? "O selecciona una opción arriba..." : "Escribe tu respuesta aquí..."}
                    disabled={saving}
                    className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-full py-4 pl-6 pr-14 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={saving || !input.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#6B705C] text-white rounded-full hover:bg-[#4A4E4D] transition-colors disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
