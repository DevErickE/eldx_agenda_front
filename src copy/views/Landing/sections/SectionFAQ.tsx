import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const SectionFAQ: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Preciso instalar alguma coisa no meu computador ou celular?',
      a: 'Não! A Agenda Eldx é 100% online. Você pode acessar a plataforma de qualquer dispositivo (computador, tablet ou celular) conectado à internet através de um navegador.'
    },
    {
      q: 'Como funciona o link de agendamento online?',
      a: 'Assim que você cria sua conta, você escolhe seu endereço exclusivo (ex: eldxagenda.com/ana-podologia/booking). Você pode colar esse link na bio do seu Instagram, no status do WhatsApp, no Google Meu Negócio ou gerar um QR Code. O cliente entra, escolhe o serviço, dia e horário, e o agendamento aparece na sua tela na hora!'
    },
    {
      q: 'Posso aceitar pagamentos antecipados pelo link?',
      a: 'Sim! No plano Pro, você pode integrar seu PIX ou gateway de pagamentos. O cliente só consegue confirmar o horário após efetuar o pagamento do serviço ou de um valor sinal, eliminando 99% dos calotes e faltas.'
    },
    {
      q: 'Os lembretes no WhatsApp são automáticos?',
      a: 'Sim. A plataforma envia mensagens de confirmação e lembretes automáticos de 24h e 2h antes da consulta para o WhatsApp do cliente. Se o cliente desmarcar ou confirmar por lá, sua agenda atualiza sozinha.'
    },
    {
      q: 'O período de teste é grátis mesmo? Como cancelo?',
      a: 'Sim, você pode testar gratuitamente por 7 dias. Não pedimos cartão de crédito para começar o teste. Se decidir não continuar, basta não realizar o pagamento da assinatura no painel.'
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <section id="faq" className="container" style={{ padding: '6rem 1.5rem' }}>
      <div className="text-center" style={{ marginBottom: '4rem' }}>
        <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Dúvidas?</span>
        <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>
          Perguntas Frequentes
        </h2>
        <p className="text-muted" style={{ maxWidth: '600px', margin: '0.5rem auto 0', fontSize: '1.05rem' }}>
          Respostas para as dúvidas mais comuns sobre a Agenda Eldx
        </p>
      </div>

      <div style={{ maxWidth: '750px', margin: '0 auto' }}>
        {faqs.map((faq, idx) => (
          <div 
            key={idx}
            className="card"
            style={{
              marginBottom: '1rem',
              padding: '1.5rem',
              border: '1px solid var(--neutral-border)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => toggleFaq(idx)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--neutral-dark)', flex: 1 }}>
                {faq.q}
              </h4>
              <div style={{ color: 'var(--primary)', flexShrink: 0 }}>
                {openFaqIndex === idx ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
              </div>
            </div>

            {openFaqIndex === idx && (
              <div style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--neutral-border)',
                color: 'var(--neutral-muted)',
                lineHeight: '1.6',
                fontSize: '0.95rem',
                animation: 'fadeIn 0.3s ease'
              }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};
