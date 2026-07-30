import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Send, Copy, Check, X, ShieldCheck, RefreshCw, Unlink, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { generateTelegramBindToken, getTelegramIdentityByUserId, revokeTelegramLink } from '../../lib/services/identities';
import { UserTelegramIdentity } from '../../lib/services/contracts';

interface TelegramLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TelegramLinkModal({ isOpen, onClose }: TelegramLinkModalProps) {
  const { appUser } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [identity, setIdentity] = useState<UserTelegramIdentity | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Cargar estado de vinculación o generar token al abrir modal
  useEffect(() => {
    if (!isOpen || !appUser?.uid) return;

    let isMounted = true;
    async function init() {
      setLoading(true);
      setError(null);
      try {
        const linkedIdentity = await getTelegramIdentityByUserId(appUser.uid);
        if (!isMounted) return;

        if (linkedIdentity) {
          setIdentity(linkedIdentity);
          setToken(null);
        } else {
          setIdentity(null);
          const newToken = await generateTelegramBindToken(appUser.uid);
          if (isMounted) setToken(newToken);
        }
      } catch (err: any) {
        console.error('Error inicializando vinculación Telegram:', err);
        if (isMounted) setError(err?.message || 'Error al conectar con el servicio de identidad.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    init();
    return () => {
      isMounted = false;
    };
  }, [isOpen, appUser?.uid]);

  const handleGenerateNewToken = async () => {
    if (!appUser?.uid) return;
    setLoading(true);
    setError(null);
    try {
      const newToken = await generateTelegramBindToken(appUser.uid);
      setToken(newToken);
    } catch (err: any) {
      setError(err?.message || 'Error al generar token de vinculación.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!token) return;
    const textToCopy = `/start ${token}`;
    let success = false;

    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        success = true;
      } catch (err) {
        console.warn('navigator.clipboard.writeText falló, intentando fallback:', err);
      }
    }

    if (!success) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (fallbackErr) {
        console.error('Fallback execCommand falló:', fallbackErr);
      }
    }

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevoke = async () => {
    if (!appUser?.uid) return;
    setRevoking(true);
    try {
      await revokeTelegramLink(appUser.uid);
      setIdentity(null);
      await handleGenerateNewToken();
    } catch (err: any) {
      setError(err?.message || 'Error al revocar la vinculación.');
    } finally {
      setRevoking(false);
    }
  };

  if (!isOpen) return null;

  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'alisios_app_bot';
  const telegramBotUrl = `https://t.me/${botUsername.replace('@', '')}`;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#FDFBF7] rounded-3xl border border-[#EAE2D6] shadow-2xl overflow-hidden p-6 text-[#4A4E4D]">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[#CB997E]/10 rounded-2xl text-[#CB997E]">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-[#4A4E4D]">Vincular con Telegram</h3>
            <p className="text-xs text-stone-500 font-medium">Notificaciones y gestión rápida desde tu chat</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#CB997E] animate-spin" />
            <p className="text-xs text-stone-500">Preparando vinculación...</p>
          </div>
        ) : identity ? (
          /* Estado: Ya vinculado */
          <div className="space-y-4 py-2">
            <div className="p-4 bg-[#F9F7F1] border border-[#EAE2D6] rounded-2xl flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#6B705C] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#4A4E4D]">Cuenta Vinculada</p>
                <p className="text-xs text-stone-500 truncate">
                  {identity.telegramUsername ? `@${identity.telegramUsername}` : `ID: ${identity.telegramUserId}`}
                </p>
              </div>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Tu cuenta de Kanarii está enlazada correctamente con Telegram. Puedes recibir notificaciones y confirmar acciones mediante el bot.
            </p>
            <div className="pt-2 flex justify-between gap-3">
              <a
                href={telegramBotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 bg-[#6B705C] hover:bg-[#585c4c] text-white rounded-xl text-xs font-bold text-center transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Abrir Bot Telegram</span>
              </a>
              <button
                onClick={handleRevoke}
                disabled={revoking}
                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Unlink className="w-4 h-4" />
                <span>{revoking ? 'Revocando...' : 'Desvincular'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Estado: Generar token de vinculación (Flujo Simplificado) */
          <div className="space-y-4 py-1">
            {/* CTA Principal - Deep Link Directo */}
            <div className="p-4 bg-[#F9F7F1] border border-[#CB997E]/30 rounded-2xl space-y-3 text-center">
              <a
                href={`${telegramBotUrl}?start=${token}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-[#CB997E] hover:bg-[#B58368] text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                <span>Abrir Telegram Bot</span>
              </a>
              <p className="text-[11px] text-stone-500 font-medium leading-snug">
                El código de vinculación se aplicará automáticamente al pulsar <strong>Iniciar</strong> en Telegram.
              </p>
            </div>

            {/* Código visible con fallback manual */}
            <div className="p-3 bg-white border border-[#EAE2D6] rounded-2xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[11px] text-stone-400 font-medium">Código:</span>
                <code className="text-base font-mono font-bold text-[#CB997E] tracking-wider">{token}</code>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleGenerateNewToken}
                  className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
                  title="Generar nuevo código"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-[#EAE2D6] hover:bg-[#D4C3A3] text-[#4A4E4D] rounded-lg text-xs font-bold transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#6B705C]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Desplegable de Ayuda contextual */}
            <div className="border-t border-[#EAE2D6] pt-3">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="w-full flex items-center justify-between text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors py-1"
              >
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-[#CB997E]" />
                  <span>¿Cómo funciona la vinculación?</span>
                </div>
                {showHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showHelp && (
                <div className="mt-2.5 p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-xs text-stone-600 leading-relaxed animate-in fade-in duration-150">
                  <p><strong>1.</strong> Pulsa <strong>Abrir Telegram Bot</strong> para ir directo con tu código asignado.</p>
                  <p><strong>2.</strong> Toca en <strong>Iniciar</strong> (o envía <code className="bg-stone-200 px-1 py-0.5 rounded font-mono text-[11px]">/start {token}</code>).</p>
                  <p><strong>3.</strong> ¡Listo! Tu cuenta de Kanarii quedará conectada inmediatamente.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
