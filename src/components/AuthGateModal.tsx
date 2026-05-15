import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Loader2, Leaf, Chrome, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthGateModalProps {
  isOpen: boolean;
}

export function AuthGateModal({ isOpen }: AuthGateModalProps) {
  const { login, sendMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      await login();
    } catch (err) {
      console.error("Google login error:", err);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSending) return;
    
    setIsSending(true);
    setError(null);
    try {
      await sendMagicLink(email.trim());
      setSentTo(email.trim());
    } catch (err: any) {
      console.error("Magic link error:", err);
      setError("No pudimos enviar el enlace. Verifica el email e inténtalo de nuevo.");
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-[#FDFBF7] rounded-[2rem] shadow-2xl border border-[#EAE2D6] overflow-hidden"
      >
        <div className="p-8 pt-10 text-center">
          <div className="w-16 h-16 bg-[#EAE2D6] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Leaf className="w-8 h-8 text-[#6B705C]" />
          </div>
          
          <h2 className="text-2xl font-serif text-[#4A4E4D] mb-2">Guarda tu ficha</h2>
          <p className="text-stone-600 mb-8 px-4">
            Crea tu cuenta para no perder tu conversación de acogida y formar parte de la tribu.
          </p>

          <AnimatePresence mode="wait">
            {!sentTo ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                {/* Google Button */}
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-[#EAE2D6] hover:bg-stone-50 text-stone-700 py-4 px-6 rounded-2xl font-bold transition-all shadow-sm group"
                >
                  <Chrome className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                  Continuar con Google
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#EAE2D6]"></div></div>
                  <div className="relative flex justify-center text-xs uppercase tracking-widest text-stone-400">
                    <span className="bg-[#FDFBF7] px-4 italic font-serif">o</span>
                  </div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="text-left space-y-1.5">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-4">Continuar con email</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="w-full bg-white border border-[#EAE2D6] rounded-2xl py-4 pl-14 pr-6 text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-[#A5A58D] transition-all"
                      />
                    </div>
                    {error && <p className="text-red-500 text-xs ml-4 mt-1 font-medium">{error}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSending || !email.trim()}
                    className="w-full bg-[#6B705C] hover:bg-[#4A4E4D] text-white py-4 px-6 rounded-2xl font-bold transition-all shadow-md flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {isSending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Enviar enlace mágico
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-6 space-y-6"
              >
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-serif text-[#4A4E4D]">Revisa tu bandeja de entrada</h3>
                  <p className="text-stone-500 text-sm leading-relaxed px-4">
                    Te enviamos un enlace a <span className="font-bold text-stone-700">{sentTo}</span>. 
                    Haz clic en él para guardar tu ficha y entrar.
                  </p>
                </div>

                <button
                  onClick={() => setSentTo(null)}
                  className="text-[#CB997E] text-sm font-bold hover:underline"
                >
                  Cambiar email
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-10 text-xs text-stone-400 px-6">
            Al continuar, aceptas nuestras pautas de convivencia y el tratamiento de tus datos para el bien común de la tribu.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
