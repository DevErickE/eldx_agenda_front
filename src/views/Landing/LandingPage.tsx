import React, { useEffect, useState } from 'react';
import { LandingLayout } from './LandingLayout';
import { SectionHero } from './sections/SectionHero';
import { SectionDesafios } from './sections/SectionDesafios';
import { SectionSolucoes } from './sections/SectionSolucoes';
import { SectionBeneficios } from './sections/SectionBeneficios';
import { SectionComoFunciona } from './sections/SectionComoFunciona';
import { SectionPlanos } from './sections/SectionPlanos';
import { SectionFAQ } from './sections/SectionFAQ';

interface LandingPageProps {
  onNavigateTo: (path: string) => void;
  scrollToPlans?: boolean;
}

type PageSection = 'home' | 'dores' | 'solucoes' | 'beneficios' | 'como-funciona' | 'planos' | 'faq';

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateTo, scrollToPlans }) => {
  const [currentSection, setCurrentSection] = useState<PageSection>('home');

  useEffect(() => {
    // Detectar hash na URL e mudar a seção
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === '' || hash === 'home') {
        setCurrentSection('home');
      } else if (['dores', 'solucoes', 'beneficios', 'como-funciona', 'planos', 'faq'].includes(hash)) {
        setCurrentSection(hash as PageSection);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (scrollToPlans) {
      setCurrentSection('planos');
      window.location.hash = 'planos';
    }
  }, [scrollToPlans]);

  const handleSelectPlan = (planName: 'Starter' | 'Pro') => {
    localStorage.setItem('saas_selected_plan', planName);
    const saasUser = localStorage.getItem('saas_user');
    if (saasUser) {
      const parsed = JSON.parse(saasUser);
      onNavigateTo(`/${parsed.slug}/checkout`);
    } else {
      onNavigateTo('/cadastro');
    }
  };

  return (
    <LandingLayout onNavigateTo={onNavigateTo}>
      {currentSection === 'home' && <SectionHero onNavigateTo={onNavigateTo} />}
      {currentSection === 'dores' && <SectionDesafios />}
      {currentSection === 'solucoes' && <SectionSolucoes />}
      {currentSection === 'beneficios' && <SectionBeneficios />}
      {currentSection === 'como-funciona' && <SectionComoFunciona />}
      {currentSection === 'planos' && <SectionPlanos onSelectPlan={handleSelectPlan} />}
      {currentSection === 'faq' && <SectionFAQ />}
    </LandingLayout>
  );
};

