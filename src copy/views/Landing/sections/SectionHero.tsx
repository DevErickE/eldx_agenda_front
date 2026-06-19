import React from 'react';
import { CheckCircle, ArrowRight, Calendar as CalendarIcon, TrendingUp, DollarSign } from 'lucide-react';

interface SectionHeroProps {
  onNavigateTo: (path: string) => void;
}

export const SectionHero: React.FC<SectionHeroProps> = ({ onNavigateTo }) => {
  return (
    <section className="container grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', padding: '6rem 1.5rem', alignItems: 'center' }}>
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="flex align-center gap-2" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></span>
          <span>Exclusivo para Podólogas e Clínicas</span>
        </div>
        
        <h1 style={{ fontSize: '3.6rem', lineHeight: '1.1', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Transforme sua clínica de podologia com <span className="text-gradient">tecnologia.</span>
        </h1>
        
        <p className="text-muted text-lg" style={{ maxWidth: '520px', lineHeight: '1.6' }}>
          Organize sua agenda, automatize pagamentos e ofereça agendamento online automático 24h para seus clientes. Esqueça de vez as rasuras no caderno.
        </p>
        
        <div className="flex gap-2" style={{ marginTop: '0.5rem' }}>
          <button onClick={() => onNavigateTo('/cadastro')} className="btn btn-primary btn-lg" style={{ fontSize: '1rem', padding: '1rem 2rem' }}>
            Começar Agora <ArrowRight size={18} />
          </button>
          <a href="#planos" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '1rem 2rem' }}>
            Ver Planos
          </a>
        </div>

        <div className="flex gap-4" style={{ marginTop: '1rem', borderTop: '1px solid var(--neutral-border)', paddingTop: '1.5rem' }}>
          <div className="flex align-center gap-1">
            <CheckCircle size={16} style={{ color: '#10b981' }} />
            <span className="text-sm text-muted">7 dias grátis</span>
          </div>
          <div className="flex align-center gap-1">
            <CheckCircle size={16} style={{ color: '#10b981' }} />
            <span className="text-sm text-muted">Sem cartão de crédito</span>
          </div>
          <div className="flex align-center gap-1">
            <CheckCircle size={16} style={{ color: '#10b981' }} />
            <span className="text-sm text-muted">Ativação instantânea</span>
          </div>
        </div>
      </div>

      {/* Hero Visual Mockup Container */}
      <div className="animate-slide-in" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '1.5rem', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--neutral-border)', borderRadius: '24px', backgroundColor: 'var(--white)' }}>
          <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--neutral-border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <div className="flex align-center gap-2">
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
              <span className="text-xs text-muted font-semibold" style={{ marginLeft: '0.5rem' }}>Painel da Clínica</span>
            </div>
            <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Online</span>
          </div>

          <div className="flex flex-col gap-3">
            {/* Stat */}
            <div className="flex justify-between align-center" style={{ backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-border)' }}>
              <div>
                <span className="text-xs text-muted font-bold block" style={{ textTransform: 'uppercase' }}>Faturamento do Mês</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>R$ 5.840,00</strong>
              </div>
              <TrendingUp size={24} style={{ color: '#10b981' }} />
            </div>

            {/* Mini Agenda list */}
            <div>
              <span className="text-xs font-bold text-muted block" style={{ textTransform: 'uppercase', marginBottom: '0.5rem' }}>Consultas de Hoje</span>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between align-center" style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--neutral-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <div className="flex align-center gap-2">
                    <strong>09:00</strong>
                    <span>Ana Silva (Reflexologia)</span>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>Confirmado</span>
                </div>
                <div className="flex justify-between align-center" style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--neutral-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <div className="flex align-center gap-2">
                    <strong>11:30</strong>
                    <span>Carlos Costa (Unhas Encravadas)</span>
                  </div>
                  <span className="badge badge-warning" style={{ fontSize: '0.6rem' }}>Pendente</span>
                </div>
              </div>
            </div>

            {/* Shared Link Mockup */}
            <div style={{ borderTop: '1px solid var(--neutral-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <span className="text-xs font-semibold text-muted block" style={{ marginBottom: '0.25rem' }}>Seu link de agendamento:</span>
              <div style={{ backgroundColor: 'var(--primary-light)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--primary-subtle)', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                eldxagenda.com/sua-clinica/booking
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
