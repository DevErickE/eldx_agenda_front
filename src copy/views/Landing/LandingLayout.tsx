import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

interface LandingLayoutProps {
  onNavigateTo: (path: string) => void;
  children: React.ReactNode;
}

export const LandingLayout: React.FC<LandingLayoutProps> = ({ onNavigateTo, children }) => {
  return (
    <div className="landing-page" style={{ backgroundColor: 'var(--neutral-light)', minHeight: '100vh' }}>
      
      {/* Top Banner Navigation */}
      <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--neutral-border)' }}>
        <div className="container flex justify-between align-center" style={{ height: '75px' }}>
          <div className="flex align-center gap-2" style={{ cursor: 'pointer' }} onClick={() => {
            window.location.hash = '';
            onNavigateTo('/');
          }}>
            <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
              <CalendarIcon size={20} />
            </div>
            <span style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--primary)' }}>
              Agenda Eldx
            </span>
          </div>

          {/* Desktop links */}
          <div className="flex align-center gap-4 text-sm font-semibold" style={{ color: 'var(--neutral-muted)' }}>
            <a href="#dores" style={{ padding: '0.5rem' }}>Desafios</a>
            <a href="#solucoes" style={{ padding: '0.5rem' }}>Recursos</a>
            <a href="#beneficios" style={{ padding: '0.5rem' }}>Benefícios</a>
            <a href="#como-funciona" style={{ padding: '0.5rem' }}>Como Funciona</a>
            <a href="#planos" style={{ padding: '0.5rem' }}>Planos</a>
            <a href="#faq" style={{ padding: '0.5rem' }}>FAQ</a>
            
            <button onClick={() => onNavigateTo('/login')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
              Entrar
            </button>
            <button onClick={() => onNavigateTo('/cadastro')} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              Testar Grátis
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {children}

      {/* CTA Banner - "A Hora é Agora" */}
      <section style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            A Hora é Agora
          </h2>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', opacity: 0.95 }}>
            Pronta para modernizar sua clínica?
          </h3>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: '1.6', opacity: 0.9 }}>
            Saia do papel e leve seu atendimento ao próximo nível com a Agenda Eldx. Teste grátis por 7 dias.
          </p>
          <button 
            onClick={() => onNavigateTo('/cadastro')} 
            className="btn" 
            style={{ backgroundColor: 'white', color: 'var(--primary)', fontWeight: 700, padding: '1rem 2.5rem', fontSize: '1rem' }}
          >
            COMEÇAR AGORA
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#1e293b', color: '#94a3b8', padding: '2rem 1.5rem', borderTop: '1px solid var(--neutral-border)' }}>
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '1.5rem' }}>
            <div>
              <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem' }}>Navegação</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <li><a href="#dores" style={{ color: '#94a3b8', textDecoration: 'none' }}>Desafios</a></li>
                <li><a href="#solucoes" style={{ color: '#94a3b8', textDecoration: 'none' }}>Recursos</a></li>
                <li><a href="#beneficios" style={{ color: '#94a3b8', textDecoration: 'none' }}>Benefícios</a></li>
                <li><a href="#como-funciona" style={{ color: '#94a3b8', textDecoration: 'none' }}>Como Funciona</a></li>
                <li><a href="#planos" style={{ color: '#94a3b8', textDecoration: 'none' }}>Preços</a></li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem' }}>Portal Administrativo</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <li><a href="#" onClick={(e) => { e.preventDefault(); }} style={{ color: '#94a3b8', textDecoration: 'none' }}>Acesso ao Painel da Clínica</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); }} style={{ color: '#94a3b8', textDecoration: 'none' }}>Criar Cadastro de Clínica</a></li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem' }}>Sobre</h4>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                A plataforma SaaS definitiva de agendamento online e gestão financeira voltada exclusivamente para podólogas e clínicas de podologia.
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(148,163,184,0.2)', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
            <p>© 2026 Agenda Eldx - Plataforma de Gestão. Todos os direitos reservados. CNPJ: 99.888.777/0001-99</p>
            <p style={{ marginTop: '0.5rem' }}>Desenvolvido com sofisticação tecnológica de alto nível para alavancar a podologia brasileira.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
