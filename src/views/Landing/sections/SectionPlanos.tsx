import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface SectionPlanosProps {
  onSelectPlan?: (plan: 'Starter' | 'Pro') => void;
}

export const SectionPlanos: React.FC<SectionPlanosProps> = ({ onSelectPlan }) => {
  const [billingInterval, setBillingInterval] = useState<'mensal' | 'anual'>('mensal');

  const plans = [
    {
      name: 'Starter',
      description: 'Perfeito para começar',
      priceMonthly: 'R$ 99',
      priceAnnually: 'R$ 990',
      features: [
        'Agenda online 24/7',
        'Até 500 agendamentos/mês',
        'Lembretes automáticos no WhatsApp',
        'Relatório básico de faturamento',
        'Suporte por email',
        '7 dias grátis'
      ],
      cta: 'Começar',
      isPrimary: false
    },
    {
      name: 'Pro',
      description: 'Tudo ilimitado',
      priceMonthly: 'R$ 199',
      priceAnnually: 'R$ 1990',
      features: [
        'Tudo do Starter +',
        'Agendamentos ilimitados',
        'Pagamento integrado (PIX/Débito/Crédito)',
        'Relatórios avançados e gráficos',
        'Gestão de múltiplos usuários',
        'API para integrações',
        'Suporte prioritário 24/7',
        '7 dias grátis'
      ],
      cta: 'Começar',
      isPrimary: true
    }
  ];

  return (
    <section id="planos" style={{ backgroundColor: '#ffffff', padding: '6rem 1.5rem', borderTop: '1px solid var(--neutral-border)' }}>
      <div className="container">
        <div className="text-center" style={{ marginBottom: '4rem' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Transparent</span>
          <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>
            Planos simples e acessíveis
          </h2>
          <p className="text-muted" style={{ maxWidth: '600px', margin: '0.5rem auto 0', fontSize: '1.05rem' }}>
            Sem contratos complexos. Cancele quando quiser.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center align-center gap-3" style={{ marginBottom: '3rem' }}>
          <button 
            onClick={() => setBillingInterval('mensal')}
            style={{
              padding: '0.75rem 1.5rem',
              border: billingInterval === 'mensal' ? '2px solid var(--primary)' : '2px solid var(--neutral-border)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: billingInterval === 'mensal' ? 'var(--primary-light)' : 'transparent',
              color: billingInterval === 'mensal' ? 'var(--primary)' : 'var(--neutral-muted)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Mensal
          </button>
          <button 
            onClick={() => setBillingInterval('anual')}
            style={{
              padding: '0.75rem 1.5rem',
              border: billingInterval === 'anual' ? '2px solid var(--primary)' : '2px solid var(--neutral-border)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: billingInterval === 'anual' ? 'var(--primary-light)' : 'transparent',
              color: billingInterval === 'anual' ? 'var(--primary)' : 'var(--neutral-muted)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Anual
            <span style={{ marginLeft: '0.5rem', color: '#10b981', fontWeight: 700 }}>-17% OFF</span>
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
          {plans.map((plan, idx) => (
            <div 
              key={idx}
              className="card"
              style={{
                padding: '2.5rem',
                border: plan.isPrimary ? '2px solid var(--primary)' : '1px solid var(--neutral-border)',
                backgroundColor: plan.isPrimary ? 'var(--primary-light)' : 'white',
                position: 'relative',
                transform: plan.isPrimary ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}
            >
              {plan.isPrimary && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  padding: '0.4rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  Mais Popular
                </div>
              )}

              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                {plan.name}
              </h3>
              <p className="text-muted text-sm" style={{ marginBottom: '1.5rem' }}>
                {plan.description}
              </p>

              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {billingInterval === 'mensal' ? plan.priceMonthly : plan.priceAnnually}
                </div>
                <p className="text-muted text-sm">
                  {billingInterval === 'mensal' ? '/mês' : '/ano'}
                </p>
              </div>

              <button 
                onClick={() => onSelectPlan?.(plan.name as 'Starter' | 'Pro')}
                className={plan.isPrimary ? 'btn btn-primary' : 'btn btn-secondary'}
                style={{ width: '100%', marginBottom: '2rem' }}
              >
                {plan.cta}
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {plan.features.map((feature, fidx) => (
                  <div key={fidx} className="flex align-center gap-2">
                    <Check size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
