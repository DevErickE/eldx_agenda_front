import React from 'react';
import { Calendar as CalendarIcon, Share2, Lock, Zap, TrendingUp, Users } from 'lucide-react';

export const SectionSolucoes: React.FC = () => {
  return (
    <section id="solucoes" className="container" style={{ padding: '6rem 1.5rem' }}>
      <div className="text-center" style={{ marginBottom: '4rem' }}>
        <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tudo Resolvido</span>
        <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>
          Tudo o que sua clínica precisa em um só lugar
        </h2>
        <p className="text-muted" style={{ maxWidth: '600px', margin: '0.5rem auto 0', fontSize: '1.05rem' }}>
          Nossa plataforma centraliza sua operação para você focar no atendimento e na saúde dos pés de seus pacientes.
        </p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
        <div className="card card-hover flex flex-col justify-between" style={{ padding: '2rem' }}>
          <div>
            <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '12px', borderRadius: '16px', width: 'fit-content', marginBottom: '1.5rem' }}>
              <CalendarIcon size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', fontWeight: 700 }}>Agenda inteligente</h3>
            <p className="text-muted text-sm" style={{ lineHeight: '1.6' }}>
              Bloqueio de horários automático, agendamento facilitado e grade flexível de acordo com seus horários.
            </p>
          </div>
        </div>

        <div className="card card-hover flex flex-col justify-between" style={{ padding: '2rem' }}>
          <div>
            <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '12px', borderRadius: '16px', width: 'fit-content', marginBottom: '1.5rem' }}>
              <Share2 size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', fontWeight: 700 }}>Agendamento online 24/7</h3>
            <p className="text-muted text-sm" style={{ lineHeight: '1.6' }}>
              Seus clientes agendam em qualquer hora, dia ou noite. Link único para a sua clínica, fácil de compartilhar.
            </p>
          </div>
        </div>

        <div className="card card-hover flex flex-col justify-between" style={{ padding: '2rem' }}>
          <div>
            <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '12px', borderRadius: '16px', width: 'fit-content', marginBottom: '1.5rem' }}>
              <Lock size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', fontWeight: 700 }}>Pagamento integrado</h3>
            <p className="text-muted text-sm" style={{ lineHeight: '1.6' }}>
              Receba pagamentos antes da consulta via PIX, débito ou crédito. Reduce faltas em até 99%.
            </p>
          </div>
        </div>

        <div className="card card-hover flex flex-col justify-between" style={{ padding: '2rem' }}>
          <div>
            <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '12px', borderRadius: '16px', width: 'fit-content', marginBottom: '1.5rem' }}>
              <Zap size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', fontWeight: 700 }}>Lembretes automáticos</h3>
            <p className="text-muted text-sm" style={{ lineHeight: '1.6' }}>
              Sua clínica envia lembretes automáticos no WhatsApp do cliente. Ele confirma ou desmarca pelo próprio chat.
            </p>
          </div>
        </div>

        <div className="card card-hover flex flex-col justify-between" style={{ padding: '2rem' }}>
          <div>
            <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '12px', borderRadius: '16px', width: 'fit-content', marginBottom: '1.5rem' }}>
              <TrendingUp size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', fontWeight: 700 }}>Relatórios financeiros</h3>
            <p className="text-muted text-sm" style={{ lineHeight: '1.6' }}>
              Acompanhe seu faturamento em tempo real. Saiba quanto você ganha por serviço, cliente e período.
            </p>
          </div>
        </div>

        <div className="card card-hover flex flex-col justify-between" style={{ padding: '2rem' }}>
          <div>
            <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '12px', borderRadius: '16px', width: 'fit-content', marginBottom: '1.5rem' }}>
              <Users size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', fontWeight: 700 }}>Gestão de clientes</h3>
            <p className="text-muted text-sm" style={{ lineHeight: '1.6' }}>
              Base de dados de todos os seus pacientes com histórico de consultas, telefone, e-mail e preferências.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
