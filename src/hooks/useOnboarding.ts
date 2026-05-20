import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { markOnboardingComplete } from '../lib/appService';

export type ViewState = 'intro' | 'menu' | 'tour' | 'individual' | 'final';

export function useOnboarding(uid?: string) {
  const [view, setView] = useState<ViewState>('intro');
  const [tourStep, setTourStep] = useState(0); 
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const navigate = useNavigate();

  const startTour = () => {
    setTourStep(0);
    setView('tour');
  };

  const nextTourStep = () => {
    if (tourStep < 5) {
      setTourStep(prev => prev + 1);
    } else {
      setView('final');
    }
  };

  const backToMenu = () => {
    setView('menu');
    setSelectedModule(null);
  };

  const viewModule = (modId: string) => {
    setSelectedModule(modId);
    setView('individual');
  };

  const completeTour = async () => {
    if (uid) {
      try {
        await markOnboardingComplete(uid);
      } catch (err) {
        console.error('Error al guardar el estado de onboarding en Firestore:', err);
      }
    } else {
      console.warn('No se puede guardar el estado de onboarding: UID no definido.');
    }
    navigate('/ficha');
  };

  return {
    view,
    setView,
    tourStep,
    setTourStep,
    selectedModule,
    setSelectedModule,
    startTour,
    nextTourStep,
    backToMenu,
    viewModule,
    completeTour
  };
}
