import React, { useState, useEffect } from 'react';
import { Calendar, CreditCard, ShieldCheck, CheckCircle2, QrCode, Copy, Sparkles, ArrowRight } from 'lucide-react';
import { db } from '../../services/db';

interface SaaSCheckoutProps {
  slug: string;
  onNavigateTo: (path: string) => void;
}

export const SaaSCheckout: React.FC<SaaSCheckoutProps> = ({ slug, onNavigateTo }) => {
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [selectedPlan, setSelectedPlan] = useState<'Starter' | 'Pro'>('Pro');
  const [saasUser, setSaasUser] = useState<any>(null);
  
  // Card states
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Load registration data
    const rawUser = localStorage.getItem('saas_user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      setSaasUser(parsed);
      setSelectedPlan(parsed.plan || 'Pro');
    } else {
      // If no SaaS user registered, force them back to register
      onNavigateTo('/cadastro');
    }
  }, []);

  const planPrice = selectedPlan === 'Starter' ? 49.00 : 99.00;

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Masking input
    if (name === 'number') {
      const clean = value.replace(/\D/g, '').substring(0, 16);
      const masked = clean.replace(/(\d{4})(?=\d)/g, '$1 ');
      setCardData(prev => ({ ...prev, [name]: masked }));
    } else if (name === 'expiry') {
      const clean = value.replace(/\D/g, '').substring(0, 4);
      const masked = clean.replace(/(\d{2})(?=\d)/, '$1/');
      setCardData(prev => ({ ...prev, [name]: masked }));
    } else if (name === 'cvv') {
      const clean = value.replace(/\D/g, '').substring(0, 3);
      setCardData(prev => ({ ...prev, [name]: clean }));
    } else {
      setCardData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    }
  };

  const copyPixCode = () => {
    const code = `00020101021226870014br.gov.bcb.pix2565pix.eldxagenda.com/q/payment-${Date.now()}5204000053039865405${planPrice.toFixed(2)}5802BR5912AgendaEldx6009SaoPaulo62070503SaaS`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (paymentMethod === 'card') {
      const newErrors: Record<string, string> = {};
      if (!cardData.number || cardData.number.replace(/\s/g, '').length < 16) {
        newErrors.number = 'Número de cartão inválido.';
      }
      if (!cardData.name) {
        newErrors.name = 'Nome impresso obrigatório.';
      }
      if (!cardData.expiry || cardData.expiry.length < 5) {
        newErrors.expiry = 'Validade inválida (MM/AA).';
      }
      if (!cardData.cvv || cardData.cvv.length < 3) {
        newErrors.cvv = 'CVV inválido.';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    setIsProcessing(true);

    // Simulate gateway request
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Update local storage user status
      if (saasUser) {
        const updatedUser = { ...saasUser, status: 'active', plan: selectedPlan };
        localStorage.setItem('saas_user', JSON.stringify(updatedUser));
      }
      
      // Log the user into the admin panel as admin
      db.setLoggedUser({ admin: true });
      db.addAuditLog('admin', `${saasUser?.name || 'Podóloga'} (Adm)`, 'Admin', 'SaaS_PURCHASE', `Assinatura do Plano ${selectedPlan} aprovada.`);
    }, 2000);
  };

  const handleAccessAdmin = () => {
    // Reload and navigate to admin panel to initialize properly
    window.location.href = '/admin-panel';
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col align-center justify-center" style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem' }}>
        <div className="card text-center animate-fade-in" style={{ maxWidth: '500px', width: '100%', padding: '3.5rem 2.5rem', border: '1px solid var(--neutral-border)', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ display: 'inline-flex', alignContent: 'center', justifyContent: 'center', color: '#10b981', backgroundColor: '#ecfdf5', padding: '16px', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <CheckCircle2 size={48} />
          </div>
          
          <div style={{ display: 'flex', alignContent: 'center', justifyContent: 'center', gap: '0.25rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            <Sparkles size={14} />
            <span>Assinatura Aprovada</span>
          </div>

          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: 800, marginBottom: '1rem', color: 'var(--neutral-dark)' }}>
            Seja bem-vinda à Agenda Eldx!
          </h2>

          <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            O pagamento do seu plano **{selectedPlan}** foi confirmado com sucesso. Sua clínica **{saasUser?.clinicName}** está pronta para operar de forma 100% digital.
          </p>

          <div style={{ backgroundColor: '#f1f5f9', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '2.5rem', textAlign: 'left' }}>
            <span className="text-xs text-muted font-bold block" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Seu Link de Agendamento Online</span>
            <code style={{ color: 'var(--primary)', fontWeight: 700, display: 'block', marginTop: '0.25rem', fontSize: '0.9rem', wordBreak: 'break-all' }}>
              {window.location.origin}/{slug}/booking
            </code>
          </div>

          <button onClick={handleAccessAdmin} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            Acessar Painel da Clínica <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

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
        <button onClick={() => onNavigateTo('/cadastro')} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
          Alterar Cadastro
        </button>
      </div>

      {/* Checkout Row */}
      <div className="container grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', padding: '2rem 1.5rem', flex: 1, width: '100%', maxWidth: '1050px', alignItems: 'flex-start' }}>
        
        {/* Left Side: Payment Form */}
        <div className="card animate-fade-in" style={{ boxShadow: 'var(--shadow-lg)', padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-title)', fontWeight: 800, marginBottom: '1.5rem' }}>
            Método de Pagamento
          </h2>

          {/* Payment Method Selector Tabs */}
          <div className="flex gap-2" style={{ borderBottom: '1px solid var(--neutral-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <button 
              type="button"
              onClick={() => setPaymentMethod('pix')}
              className="btn"
              style={{
                flex: 1,
                backgroundColor: paymentMethod === 'pix' ? 'var(--primary-light)' : 'transparent',
                color: paymentMethod === 'pix' ? 'var(--primary)' : 'var(--neutral-muted)',
                borderColor: paymentMethod === 'pix' ? 'var(--primary-subtle)' : 'var(--neutral-border)',
                borderWidth: '1px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}
            >
              <QrCode size={18} /> PIX Instantâneo
            </button>
            <button 
              type="button"
              onClick={() => setPaymentMethod('card')}
              className="btn"
              style={{
                flex: 1,
                backgroundColor: paymentMethod === 'card' ? 'var(--primary-light)' : 'transparent',
                color: paymentMethod === 'card' ? 'var(--primary)' : 'var(--neutral-muted)',
                borderColor: paymentMethod === 'card' ? 'var(--primary-subtle)' : 'var(--neutral-border)',
                borderWidth: '1px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}
            >
              <CreditCard size={18} /> Cartão de Crédito
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {paymentMethod === 'pix' ? (
              <div className="animate-fade-in flex flex-col align-center text-center" style={{ gap: '1rem' }}>
                <p className="text-muted text-sm">
                  Escaneie o código QR abaixo no aplicativo do seu banco para ativar sua conta instantaneamente.
                </p>

                {/* SVG QR Code Simulation */}
                <div style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-border)', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="150" height="150" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* QR Code pattern approximation */}
                    <rect x="0" y="0" width="30" height="30" fill="var(--neutral-dark)" />
                    <rect x="5" y="5" width="20" height="20" fill="white" />
                    <rect x="10" y="10" width="10" height="10" fill="var(--neutral-dark)" />
                    
                    <rect x="70" y="0" width="30" height="30" fill="var(--neutral-dark)" />
                    <rect x="75" y="5" width="20" height="20" fill="white" />
                    <rect x="80" y="10" width="10" height="10" fill="var(--neutral-dark)" />
                    
                    <rect x="0" y="70" width="30" height="30" fill="var(--neutral-dark)" />
                    <rect x="5" y="75" width="20" height="20" fill="white" />
                    <rect x="10" y="80" width="10" height="10" fill="var(--neutral-dark)" />
                    
                    {/* Random small blocks */}
                    <rect x="40" y="5" width="10" height="15" fill="var(--neutral-dark)" />
                    <rect x="55" y="0" width="10" height="10" fill="var(--neutral-dark)" />
                    <rect x="45" y="25" width="20" height="10" fill="var(--neutral-dark)" />
                    
                    <rect x="35" y="45" width="15" height="15" fill="var(--neutral-dark)" />
                    <rect x="60" y="35" width="10" height="20" fill="var(--neutral-dark)" />
                    <rect x="80" y="40" width="15" height="10" fill="var(--neutral-dark)" />
                    
                    <rect x="35" y="70" width="10" height="15" fill="var(--neutral-dark)" />
                    <rect x="50" y="85" width="25" height="10" fill="var(--neutral-dark)" />
                    <rect x="60" y="65" width="15" height="15" fill="var(--neutral-dark)" />
                    <rect x="85" y="75" width="15" height="15" fill="var(--neutral-dark)" />
                    
                    <circle cx="50" cy="50" r="8" fill="var(--primary)" />
                  </svg>
                </div>

                <div className="flex flex-col" style={{ width: '100%', gap: '0.5rem' }}>
                  <label className="form-label text-center">Pix Copia e Cola</label>
                  <div className="flex" style={{ width: '100%', gap: '0.25rem' }}>
                    <input 
                      type="text" 
                      readOnly 
                      value={`00020101021226870014br.gov.bcb.pix2565pix.eldxagenda.com/q/payment-${Date.now()}520400...`}
                      className="form-input" 
                      style={{ flex: 1, fontSize: '0.8rem', backgroundColor: '#f1f5f9', cursor: 'text' }}
                    />
                    <button 
                      type="button" 
                      onClick={copyPixCode} 
                      className="btn btn-secondary" 
                      style={{ padding: '0 1rem' }}
                    >
                      <Copy size={16} /> {copied ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>

                <div className="flex align-center justify-center gap-2" style={{ color: '#059669', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.5rem' }}>
                  <span className="animate-pulse" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                  Aguardando confirmação de PIX (Simulado)...
                </div>
              </div>
            ) : (
              <div className="animate-fade-in flex flex-col gap-3">
                <div className="form-group">
                  <label className="form-label">Número do Cartão</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      name="number"
                      value={cardData.number}
                      onChange={handleCardInputChange}
                      placeholder="0000 0000 0000 0000"
                      className="form-input"
                      style={{ width: '100%', paddingLeft: '2.5rem', borderColor: errors.number ? 'var(--danger)' : 'var(--neutral-border)' }}
                    />
                    <CreditCard size={16} className="text-muted" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                  {errors.number && <span className="text-xs" style={{ color: 'var(--danger)' }}>{errors.number}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Nome Impresso no Cartão</label>
                  <input 
                    type="text" 
                    name="name"
                    value={cardData.name}
                    onChange={handleCardInputChange}
                    placeholder="MARIA SILVA"
                    className="form-input"
                    style={{ textTransform: 'uppercase', borderColor: errors.name ? 'var(--danger)' : 'var(--neutral-border)' }}
                  />
                  {errors.name && <span className="text-xs" style={{ color: 'var(--danger)' }}>{errors.name}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Validade (MM/AA)</label>
                    <input 
                      type="text" 
                      name="expiry"
                      value={cardData.expiry}
                      onChange={handleCardInputChange}
                      placeholder="MM/AA"
                      className="form-input"
                      style={{ borderColor: errors.expiry ? 'var(--danger)' : 'var(--neutral-border)' }}
                    />
                    {errors.expiry && <span className="text-xs" style={{ color: 'var(--danger)' }}>{errors.expiry}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Código CVV</label>
                    <input 
                      type="password" 
                      name="cvv"
                      value={cardData.cvv}
                      onChange={handleCardInputChange}
                      placeholder="000"
                      className="form-input"
                      style={{ borderColor: errors.cvv ? 'var(--danger)' : 'var(--neutral-border)' }}
                    />
                    {errors.cvv && <span className="text-xs" style={{ color: 'var(--danger)' }}>{errors.cvv}</span>}
                  </div>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isProcessing} 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1rem', padding: '0.9rem', fontSize: '1rem' }}
            >
              {isProcessing ? 'Processando transação...' : `Confirmar Pagamento - R$ ${planPrice.toFixed(2)}`}
            </button>

            <div className="flex align-center justify-center gap-2 text-xs text-muted" style={{ marginTop: '0.5rem' }}>
              <ShieldCheck size={14} style={{ color: '#059669' }} />
              Ambiente criptografado e 100% seguro.
            </div>

          </form>
        </div>

        {/* Right Side: Plan Summary */}
        <div className="card animate-fade-in" style={{ border: '1px solid var(--neutral-border)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'var(--white)', position: 'sticky', top: '100px' }}>
          <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>Resumo do Pedido</h3>
          
          <div style={{ borderBottom: '1px solid var(--neutral-border)', paddingBottom: '1rem' }}>
            <div className="flex justify-between font-semibold" style={{ fontSize: '1rem' }}>
              <span>Plano {selectedPlan} (Mensal)</span>
              <span>R$ {planPrice.toFixed(2)}/mês</span>
            </div>
            <span className="text-xs text-muted" style={{ display: 'block', marginTop: '0.25rem' }}>
              {selectedPlan === 'Pro' 
                ? 'Acesso total: Agenda, Financeiro completo, Relatórios, Agendamento Online e Automatizações.'
                : 'Acesso básico: Agenda inteligente, clientes ilimitados e link exclusivo.'
              }
            </span>
          </div>

          <div style={{ borderBottom: '1px solid var(--neutral-border)', paddingBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>R$ {planPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Taxas de ativação</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>Grátis</span>
            </div>
          </div>

          <div className="flex justify-between font-bold" style={{ fontSize: '1.2rem', color: 'var(--neutral-dark)' }}>
            <span>Valor Total</span>
            <span style={{ color: 'var(--primary)' }}>R$ {planPrice.toFixed(2)}</span>
          </div>

          <div style={{ backgroundColor: 'var(--primary-light)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--primary-subtle)', fontSize: '0.8rem' }}>
            <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.25rem' }}>Clínica a ser criada:</strong>
            <div className="text-muted"><strong>Profissional:</strong> {saasUser?.name}</div>
            <div className="text-muted"><strong>Clínica:</strong> {saasUser?.clinicName}</div>
            <div className="text-muted"><strong>URL Slug:</strong> {slug}</div>
          </div>
        </div>

      </div>

      {/* Footer copyright */}
      <div className="text-center text-xs text-muted" style={{ padding: '1.5rem 1.5rem', borderTop: '1px solid var(--neutral-border)', width: '100%' }}>
        © {new Date().getFullYear()} Agenda Eldx - Gestão para Podologia. Todos os direitos reservados.
      </div>
    </div>
  );
};
