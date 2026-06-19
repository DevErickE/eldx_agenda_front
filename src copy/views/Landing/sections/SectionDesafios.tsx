import React from 'react';
import { AlertCircle, MessageSquare, Clock, Users, DollarSign } from 'lucide-react';

export const SectionDesafios: React.FC = () => {
  return (
    <section id="dores" style={{ backgroundColor: '#ffffff', padding: '6rem 1.5rem', borderTop: '1px solid var(--neutral-border)', borderBottom: '1px solid var(--neutral-border)' }}>
      <div className="container">
        <div className="text-center" style={{ marginBottom: '4rem' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>O Grande Gargalo</span>
          <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>
            Sua clínica ainda funciona no manual?
          </h2>
          <p className="text-muted" style={{ maxWidth: '600px', margin: '0.5rem auto 0', fontSize: '1.05rem' }}>
            Trabalhar de forma desorganizada limita o crescimento do seu negócio e consome sua energia.
          </p>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div className="card" style={{ padding: '2rem', border: '1px solid #fee2e2', backgroundColor: '#fffdfd' }}>
            <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '12px', width: 'fit-content', marginBottom: '1.25rem' }}>
              <AlertCircle size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 700 }}>Agenda no caderno</h3>
            <p className="text-muted text-sm" style={{ lineHeight: '1.6' }}>
              Rasuras, páginas rasgadas, esquecimento de dados e risco de perder todo o histórico de consultas em caso de acidente.
            </p>
          </div>

          <div className="card" style={{ padding: '2rem', border: '1px solid #fee2e2', backgroundColor: '#fffdfd' }}>
            <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '12px', width: 'fit-content', marginBottom: '1.25rem' }}>
              <MessageSquare size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 700 }}>WhatsApp bagunçado</h3>
            <p className="text-muted text-sm" style={{ lineHeight: '1.6' }}>
              Perder horas respondendo áudios de clientes para marcar horários, com mensagens se acumulando e marcações esquecidas.
            </p>
          </div>

          <div className="card" style={{ padding: '2rem', border: '1px solid #fee2e2', backgroundColor: '#fffdfd' }}>
            <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '12px', width: 'fit-content', marginBottom: '1.25rem' }}>
              <Clock size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 700 }}>Horários duplicados</h3>
            <p className="text-muted text-sm" style={{ lineHeight: '1.6' }}>
              O estresse e constrangimento de agendar duas pessoas no mesmo dia e horário, comprometendo a imagem profissional da sua clínica.
            </p>
          </div>

          <div className="card" style={{ padding: '2rem', border: '1px solid #fee2e2', backgroundColor: '#fffdfd' }}>
            <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '12px', width: 'fit-content', marginBottom: '1.25rem' }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 700 }}>Clientes faltosos</h3>
            <p className="text-muted text-sm" style={{ lineHeight: '1.6' }}>
              Pacientes que esquecem do agendamento e não avisam, deixando salas vazias e gerando prejuízo imediato no faturamento.
            </p>
          </div>

          <div className="card" style={{ padding: '2rem', border: '1px solid #fee2e2', backgroundColor: '#fffdfd' }}>
            <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '12px', width: 'fit-content', marginBottom: '1.25rem' }}>
              <DollarSign size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 700 }}>Falta de controle financeiro</h3>
            <p className="text-muted text-sm" style={{ lineHeight: '1.6' }}>
              Não saber com exatidão quanto fatura no mês, quais serviços dão mais lucro ou quanto tem em caixa para investir.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
