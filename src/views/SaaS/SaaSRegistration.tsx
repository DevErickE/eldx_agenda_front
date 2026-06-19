import React, { useState } from 'react';
import { Calendar, User, Mail, Lock, Phone, Link2, Sparkles, ArrowLeft } from 'lucide-react';

interface SaaSRegistrationProps {
  onNavigateTo: (path: string) => void;
}

export const SaaSRegistration: React.FC<SaaSRegistrationProps> = ({ onNavigateTo }) => {
  const [formData, setFormData] = useState({
    name: '',
    clinicName: '',
    slug: '',
    email: '',
    whatsapp: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'slug') {
      // Keep only alphanumeric and dashes
      const cleanSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
      setFormData(prev => ({ ...prev, [name]: cleanSlug }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { name, clinicName, slug, email, whatsapp, password, confirmPassword } = formData;

    if (!name || !clinicName || !slug || !email || !whatsapp || !password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Check if slug is already taken (mock check)
      if (slug === 'admin' || slug === 'pe-de-anjo' || slug === 'suporte') {
        setError('Este endereço de agendamento já está em uso.');
        setIsLoading(false);
        return;
      }

      // Save SaaS user object
      const saasUser = {
        name,
        clinicName,
        slug,
        email,
        whatsapp,
        plan: localStorage.getItem('saas_selected_plan') || 'Pro',
        status: 'pending_payment',
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('saas_user', JSON.stringify(saasUser));
      setSuccess('Cadastro realizado com sucesso!');
      setIsLoading(false);

      setTimeout(() => {
        onNavigateTo(`/${slug}/checkout`);
      }, 1200);
    }, 1000);
  };

  return (
    <div className="flex flex-col align-center justify-between" style={{ minHeight: '100vh', backgroundColor: 'var(--neutral-light)' }}>
      {/* Header bar */}
      <div className="container flex justify-between align-center" style={{ width: '100%', height: '70px', padding: '0 1.5rem' }}>
        <div className="flex align-center gap-2" style={{ cursor: 'pointer' }} onClick={() => onNavigateTo('/')}>
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
            <Calendar size={18} />
          </div>
          <span style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>
            Agenda Eldx <span style={{ color: 'var(--neutral-dark)', fontSize: '0.8rem', fontWeight: 500 }}>SaaS</span>
          </span>
        </div>
        <button onClick={() => onNavigateTo('/')} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
          <ArrowLeft size={14} /> Voltar ao Site
        </button>
      </div>

      {/* Form Container */}
      <div className="container flex align-center justify-center" style={{ flex: 1, padding: '2rem 1.5rem', width: '100%', maxWidth: '640px' }}>
        <div className="card animate-fade-in" style={{ width: '100%', boxShadow: 'var(--shadow-lg)', padding: '2.5rem' }}>
          
          <div className="text-center" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignContent: 'center', justifyContent: 'center', color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '10px', borderRadius: '50%', marginBottom: '0.75rem' }}>
              <Sparkles size={24} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>
              Crie sua conta na Agenda Eldx
            </h2>
            <p className="text-muted text-sm" style={{ marginTop: '0.25rem' }}>
              O sistema definitivo para alavancar e automatizar seu consultório de podologia.
            </p>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="badge badge-danger" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.25rem', borderRadius: 'var(--radius-md)', textTransform: 'none', fontWeight: 500, fontSize: '0.85rem' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="badge badge-success" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.25rem', borderRadius: 'var(--radius-md)', textTransform: 'none', fontWeight: 500, fontSize: '0.85rem' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', borderBottom: '1px solid var(--neutral-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Dados do Profissional</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nome do Podólogo *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    name="name" 
                    className="form-input" 
                    placeholder="Ana Silva" 
                    required 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                  />
                  <User size={16} className="text-muted" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    name="whatsapp" 
                    className="form-input" 
                    placeholder="(11) 98888-7777" 
                    required 
                    value={formData.whatsapp} 
                    onChange={handleInputChange} 
                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                  />
                  <Phone size={16} className="text-muted" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>

            <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', borderBottom: '1px solid var(--neutral-border)', paddingBottom: '0.5rem', marginTop: '1.25rem', marginBottom: '1rem' }}>Sua Clínica & Link Exclusivo</h4>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nome da Clínica *</label>
                <input 
                  type="text" 
                  name="clinicName" 
                  className="form-input" 
                  placeholder="Ana Silva Podologia" 
                  required 
                  value={formData.clinicName} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Link de Agendamento desejado *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    name="slug" 
                    className="form-input" 
                    placeholder="ana-podologia" 
                    required 
                    value={formData.slug} 
                    onChange={handleInputChange} 
                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                  />
                  <Link2 size={16} className="text-muted" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>

            {formData.slug && (
              <div style={{ backgroundColor: 'var(--primary-light)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--primary-subtle)', marginBottom: '1rem', fontSize: '0.8rem' }}>
                <span className="font-semibold text-muted">Seu link exclusivo será:</span>{' '}
                <code style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                  {window.location.origin}/{formData.slug}/booking
                </code>
              </div>
            )}

            <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', borderBottom: '1px solid var(--neutral-border)', paddingBottom: '0.5rem', marginTop: '0.75rem', marginBottom: '1rem' }}>Segurança da Conta</h4>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">E-mail de Login *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="email" 
                    name="email" 
                    className="form-input" 
                    placeholder="ana@email.com" 
                    required 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                  />
                  <Mail size={16} className="text-muted" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Senha *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="password" 
                    name="password" 
                    className="form-input" 
                    placeholder="••••••••" 
                    required 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                  />
                  <Lock size={16} className="text-muted" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirmar Senha *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    className="form-input" 
                    placeholder="••••••••" 
                    required 
                    value={formData.confirmPassword} 
                    onChange={handleInputChange} 
                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                  />
                  <Lock size={16} className="text-muted" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem' }}>
              {isLoading ? 'Cadastrando...' : 'Criar Conta e Escolher Plano'}
            </button>

            <div className="text-center text-sm" style={{ marginTop: '1.25rem', color: 'var(--neutral-muted)' }}>
              Já tem uma conta?{' '}
              <button type="button" onClick={() => onNavigateTo('/login')} className="btn-text" style={{ fontSize: '0.875rem', fontWeight: 600, padding: 0 }}>
                Faça login
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-xs text-muted" style={{ padding: '1.5rem 1.5rem', borderTop: '1px solid var(--neutral-border)', width: '100%' }}>
        © {new Date().getFullYear()} Agenda Eldx - Gestão para Podologia. Todos os direitos reservados.
      </div>
    </div>
  );
};
