import { motion } from 'motion/react';
import { Shield, Sparkles, MessageCircle, Heart, Award, ArrowUpRight } from 'lucide-react';

interface UserPassport {
  name: string;
  avatarUrl?: string;
  roles: string[];
  offerings: string[]; // Lo que doy
  knowledges: string[]; // Lo que sé
  needs: string[]; // Lo que busco
}

interface PasaporteVisualProps {
  user?: UserPassport;
  onConnect?: () => void;
}

const defaultUser: UserPassport = {
  name: 'Mateo Valenzuela',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  roles: ['Facilitador General', 'Tejedor Tecnológico', 'Enlace de Ecología'],
  offerings: ['Tiempo para mantenimiento del invernadero', 'Préstamo de herramientas agrícolas', 'Acompañamiento emocional en mediación'],
  knowledges: ['Permacultura avanzada', 'Instalaciones solares básicas', 'Sistemas de riego por goteo', 'Ingeniería de software (React)'],
  needs: ['Semillas de variedades locales de tomate', 'Colaborador para taller de compostaje', 'Espacio para guardar herramientas'],
};

export default function PasaporteVisual({
  user = defaultUser,
  onConnect,
}: PasaporteVisualProps) {

  return (
    <div className="w-full max-w-xl mx-auto bg-[#FDFBF7] text-[#5D4037] font-sans">
      
      {/* Container Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-[40px] border border-[#D2B48C]/15 shadow-sm p-8 md:p-10 space-y-10"
      >
        
        {/* Cabecera / Header Section */}
        <div className="flex flex-col items-center text-center md:text-left md:flex-row md:items-start gap-6 pb-8 border-b border-[#D2B48C]/10">
          
          {/* Avatar Container with decorative custom borders */}
          <div className="relative">
            <div className="absolute inset-0 bg-[#A5A58D] rounded-[32px] rotate-6 scale-102 opacity-40 animate-pulse" />
            <div className="relative w-24 h-24 rounded-[28px] overflow-hidden border-2 border-white shadow-md z-10 bg-[#FAF9F6] flex items-center justify-center">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-3xl font-serif text-[#A5A58D]">
                  {user.name.charAt(0)}
                </span>
              )}
            </div>
          </div>

          {/* User Meta Data */}
          <div className="space-y-3 flex-1 font-sans">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-50/60 rounded-full border border-amber-100">
                <Sparkles size={11} className="text-[#A5A58D]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A5A58D]">Tribu Kanarii</span>
              </div>
              <h1 className="text-3xl font-serif font-bold text-[#3E2723] tracking-tight">
                {user.name}
              </h1>
            </div>

            {/* Roles labels list */}
            <div className="flex flex-wrap justify-center md:justify-start gap-1 pb-1">
              {user.roles.map((role) => (
                <span 
                  key={role} 
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6B705C] bg-[#6B705C]/5 px-2.5 py-1 rounded-full border border-[#6B705C]/10"
                >
                  <Shield size={10} />
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tríada Comunitaria (Estricto Orden: Ofrendas -> Saberes -> Necesidades) */}
        <div className="space-y-8 font-sans">
          
          {/* 1. Bloque: OFRENDAS (lo que doy) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-800">
                <Heart size={12} strokeWidth={2.5} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-[#6B705C]">
                Ofrendas <span className="font-serif capitalize text-xs tracking-normal font-medium text-[#5D4037]/60">— Lo que doy</span>
              </h3>
            </div>
            
            <div className="flex flex-col gap-2">
              {user.offerings.map((offering, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={offering}
                  className="bg-emerald-50/40 hover:bg-emerald-50/60 border border-emerald-100/45 px-4 py-3 rounded-2xl text-xs font-medium text-[#5D4037]/90 leading-relaxed transition-colors flex items-center justify-between"
                >
                  <span>{offering}</span>
                  <span className="text-[10px] font-mono text-emerald-700/60 font-semibold px-2 py-0.5 bg-white rounded-full">Recurso libre</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 2. Bloque: SABERES (lo que sé) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-indigo-50 flex items-center justify-center text-[#5A5A40]">
                <Award size={12} strokeWidth={2.5} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-[#5A5A40]">
                Saberes <span className="font-serif capitalize text-xs tracking-normal font-medium text-[#5D4037]/60">— Lo que sé</span>
              </h3>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {user.knowledges.map((knowledge, idx) => (
                <motion.span
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  key={knowledge}
                  className="text-xs bg-[#FAF9F6] border border-[#D2B48C]/20 hover:border-[#5A5A40]/30 text-[#5D4037]/80 rounded-xl px-3 py-1.5 font-medium transition-colors cursor-default"
                >
                  📖 {knowledge}
                </motion.span>
              ))}
            </div>
          </div>

          {/* 3. Bloque: NECESIDADES (lo que busco) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-amber-50 flex items-center justify-center text-amber-700">
                <MessageCircle size={12} strokeWidth={2.5} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-amber-800">
                Necesidades <span className="font-serif capitalize text-xs tracking-normal font-medium text-[#5D4037]/60">— Lo que busco</span>
              </h3>
            </div>

            <div className="flex flex-col gap-2">
              {user.needs.map((need, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  key={need}
                  className="bg-amber-50/30 hover:bg-amber-50/50 border border-amber-100/40 px-4 py-3 rounded-2xl text-xs font-medium text-[#5D4037]/90 leading-relaxed transition-colors flex items-center justify-between"
                >
                  <span>{need}</span>
                  <span className="text-[10px] font-mono text-amber-800/80 font-bold px-2 py-0.5 bg-amber-100/40 rounded-full">Solidario</span>
                </motion.div>
              ))}
            </div>
          </div>

        </div>

        {/* CTA: Call to Action (Cero Jerarquías, Sin mensajería privada directa para transparencia) */}
        <div className="pt-4 font-sans">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConnect}
            className="w-full bg-[#5A5A40] text-white py-4 px-6 rounded-[24px] font-bold text-center flex items-center justify-center gap-2 shadow-lg shadow-[#5A5A40]/10 hover:bg-[#4A4A35] transition-all cursor-pointer"
          >
            Conectar vía Tablón
            <ArrowUpRight size={18} />
          </motion.button>
          
          <p className="text-center text-[10px] text-[#A5A58D] mt-3 font-mono uppercase tracking-wider">
            La comunicación cooperativa fomenta la confianza mutua
          </p>
        </div>

      </motion.div>
    </div>
  );
}
