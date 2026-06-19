import React from 'react';
import { Zap, Smartphone, BarChart3, ShieldCheck } from 'lucide-react';

export const SectionBeneficios: React.FC = () => {
  return (
    <section id="beneficios" style={{ backgroundColor: 'var(--primary-light)', padding: '6rem 1.5rem' }}>
      <div className="container">
        <div className="text-center" style={{ marginBottom: '4rem' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Por que usar</span>
          <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>
            Benefícios para sua clínica
          </h2>
          <p className="text-muted" style={{ maxWidth: '600px', margin: '0.5rem auto 0', fontSize: '1.05rem' }}>
            Transforme sua forma de trabalhar e veja os resultados imediatos
          </p>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
          <div className="card" style={{ padding: '2rem', backgroundColor: 'white' }}>
            <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '16px', borderRadius: '16px', width: 'fit-content', marginBottom: '1.5rem' }}>
              <Zap size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 700 }}>Economize tempo</h3>
            <p className="text-muted text-sm" style={{ lineHeight: '1.6' }}>
              Automatize 90% da marcação de consultas e respostas de clientes no WhatsApp
            </p>
          </div>

          <div className="card" style={{ padding: '2rem', backgroundColor: 'white' }}>
            <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '16px', borderRadius: '16px', width: 'fit-content', marginBottom: '1.5rem' }}>
              <Smartphone size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 700 }}>Acesse de qualquer lugar</h3>
            <p className="text-muted text-sm" style={{ lineHeight: '1.6' }}>
              Plataforma 100% online. Computador, tablet ou celular - a agenda na sua mão sempre
            </p>
          </div>

          <div className="card" style={{ padding: '2rem', backgroundColor: 'white' }}>
            <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '16px', borderRadius: '16px', width: 'fit-content', marginBottom: '1.5rem' }}>
              <BarChart3 size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 700 }}>Aumente seu faturamento</h3>
            <p className="text-muted text-sm" style={{ lineHeight: '1.6' }}>
              Reduza faltas, maximize seus horários e receba pagamentos antecipados
            </p>
          </div>

          <div className="card" style={{ padding: '2rem', backgroundColor: 'white' }}>
            <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '16px', borderRadius: '16px', width: 'fit-content', marginBottom: '1.5rem' }}>
              <ShieldCheck size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 700 }}>Segurança garantida</h3>
            <p className="text-muted text-sm" style={{ lineHeight: '1.6' }}>
              Seus dados criptografados e backups automáticos. Nenhum risco de perda de informações
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
