import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSignInWithEmailLink } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth, getMemoryEmail } from '../contexts/AuthContext';
import { Loader2, Mail, ArrowRight, AlertTriangle } from 'lucide-react';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { completeMagicLinkLogin } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'need_email' | 'error'>('verifying');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        const savedEmail = getMemoryEmail();
        
        if (savedEmail) {
          try {
            await completeMagicLinkLogin(savedEmail, window.location.href);
            finalize();
          } catch (err: any) {
            console.error("Auth callback error:", err);
            setErrorMessage("El enlace ha caducado o ya ha sido utilizado.");
            setStatus('error');
          }
        } else {
          // No está en memoria (abrió en otro navegador o pestaña)
          setStatus('need_email');
        }
      } else {
        navigate('/');
      }
    };

    handleCallback();
  }, [completeMagicLinkLogin, navigate]);

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await completeMagicLinkLogin(email.trim(), window.location.href);
      finalize();
    } catch (err: any) {
      console.error("Auth callback with email error:", err);
      setErrorMessage("Ese email no coincide con el que solicitó el enlace o el enlace no es válido.");
      setIsSubmitting(false);
    }
  };

  const finalize = () => {
    const pendingFicha = localStorage.getItem('kanarii_pendingFicha');
    if (pendingFicha) {
      navigate('/ficha-preview');
    } else {
      navigate('/comunidades');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#EAE2D6] p-10 text-center">
        {status === 'verifying' && (
          <div className="space-y-6">
            <Loader2 className="w-12 h-12 text-[#6B705C] animate-spin mx-auto" />
            <h2 className="text-2xl font-serif text-[#4A4E4D]">Verificando tu identidad...</h2>
            <p className="text-stone-500">Estamos conectando con la red galáctica para validar tu acceso.</p>
          </div>
        )}

        {status === 'need_email' && (
          <div className="space-y-8">
            <div className="w-16 h-16 bg-[#F9F7F1] rounded-2xl flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-[#CB997E]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif text-[#4A4E4D]">Confirma tu email</h2>
              <p className="text-stone-500 text-sm">
                Parece que has abierto el enlace en un dispositivo o pestaña diferente. 
                Por seguridad, reintroduce el email donde recibiste el enlace.
              </p>
            </div>

            <form onSubmit={handleSubmitEmail} className="space-y-4">
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-2xl py-4 px-6 text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]"
              />
              {errorMessage && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {errorMessage}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="w-full bg-[#6B705C] hover:bg-[#4A4E4D] text-white py-4 px-6 rounded-2xl font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continuar <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-500">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif text-[#4A4E4D]">Algo no ha salido bien</h2>
              <p className="text-stone-500 text-sm">{errorMessage}</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-[#EAE2D6] text-[#4A4E4D] py-4 px-6 rounded-2xl font-bold hover:bg-[#DED2C1] transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
