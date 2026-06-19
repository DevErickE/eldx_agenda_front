import React from 'react';

export const SectionComoFunciona: React.FC = () => {
  return (
    <section id="como-funciona" className="container" style={{ padding: '6rem 1.5rem' }}>
      <div className="text-center" style={{ marginBottom: '4rem' }}>
        <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Passo a passo</span>
        <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>
          Como Funciona
        </h2>
        <p className="text-muted" style={{ maxWidth: '600px', margin: '0.5rem auto 0', fontSize: '1.05rem' }}>
          Em menos de 5 minutos você configura sua clínica e começa a receber agendamentos.
        </p>
      </div>

      {/* Timeline representation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '700px', margin: '0 auto', position: 'relative' }}>
        
        <div className="flex gap-4" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'var(--primary)', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', zIndex: 2 }}>
              1
            </div>
            <div style={{ width: '2px', backgroundColor: 'var(--neutral-border)', flex: 1, minHeight: '40px' }}></div>
          </div>
          <div style={{ paddingBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>Crie sua conta</h4>
            <p className="text-muted text-sm">Insira seus dados profissionais e defina a URL da sua clínica no sistema em poucos cliques.</p>
          </div>
        </div>

        <div className="flex gap-4" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'var(--primary)', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', zIndex: 2 }}>
              2
            </div>
            <div style={{ width: '2px', backgroundColor: 'var(--neutral-border)', flex: 1, minHeight: '40px' }}></div>
          </div>
          <div style={{ paddingBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>Configure serviços e horários</h4>
            <p className="text-muted text-sm">Cadastre os tipos de tratamentos (ex: calosidades, unha encravada), valores, tempo de duração e horários de trabalho.</p>
          </div>
        </div>

        <div className="flex gap-4" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'var(--primary)', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', zIndex: 2 }}>
              3
            </div>
            <div style={{ width: '2px', backgroundColor: 'var(--neutral-border)', flex: 1, minHeight: '40px' }}></div>
          </div>
          <div style={{ paddingBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>Divulgue seu link exclusivo</h4>
            <p className="text-muted text-sm">Adicione o link personalizado da sua clínica em suas redes sociais, status e envie diretamente via WhatsApp.</p>
          </div>
        </div>

        <div className="flex gap-4" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'var(--primary)', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', zIndex: 2 }}>
              4
            </div>
            <div style={{ width: '2px', backgroundColor: 'var(--neutral-border)', flex: 1, minHeight: '40px' }}></div>
          </div>
          <div style={{ paddingBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>Clientes agendam online</h4>
            <p className="text-muted text-sm">Os pacientes entram na página da sua clínica, escolhem o serviço e o horário vago. Sem você precisar responder nada.</p>
          </div>
        </div>

        <div className="flex gap-4" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'var(--primary)', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', zIndex: 2 }}>
              5
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>Confirmação e Pagamento</h4>
            <p className="text-muted text-sm">Receba o pagamento (se configurado antecipado) e acompanhe a agenda encher sozinha com confirmações automáticas.</p>
          </div>
        </div>

      </div>
    </section>
  );
};
