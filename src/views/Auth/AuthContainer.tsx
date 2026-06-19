import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, User, Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface AuthContainerProps {
  onNavigate: (page: string) => void;
  initialMode?: 'login' | 'register' | 'recovery';
}

export const AuthContainer: React.FC<AuthContainerProps> = ({ onNavigate, initialMode = 'login' }) => {
  const { login, registerClient, recoverPassword } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register' | 'recovery'>(initialMode);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration State
  const [regData, setRegData] = useState({
    name: '',
    cpf: '',
    birthDate: '',
    sex: 'Feminino' as 'Masculino' | 'Feminino' | 'Outro',
    phone: '',
    whatsapp: '',
    email: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    city: '',
    state: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRegData(prev => ({ ...prev, [name]: value }));
  };

  // CEP Lookup using ViaCEP Public API
  const handleCepBlur = async () => {
    const cleanCep = regData.cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setRegData(prev => ({
            ...prev,
            street: data.logradouro || '',
            city: data.localidade || '',
            state: data.uf || ''
          }));
          setError(null);
        } else {
          setError('CEP não encontrado. Digite manualmente.');
        }
      } catch (err) {
        // Fail silently and let user type manually
      }
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    
    if (!identifier || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    const res = login(identifier, password);
    if (res.success) {
      // Redirect to correct dashboard
      const isAdminLogin = identifier.trim().toLowerCase() === 'admin@clinica.com.br' && password === 'admin123';
      onNavigate(isAdminLogin ? 'admin-panel' : 'client-panel');
    } else {
      setError(res.error || 'Erro no login.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Destructure to check required fields
    const { name, cpf, birthDate, sex, phone, whatsapp, email, cep, street, number, city, state, password, confirmPassword } = regData;
    
    if (!name || !cpf || !birthDate || !phone || !whatsapp || !email || !cep || !street || !number || !city || !state || !password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve possuir pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    // Run creation
    setTimeout(() => {
      const res = registerClient({
        name,
        cpf,
        birthDate,
        sex,
        phone,
        whatsapp,
        email,
        address: {
          cep,
          street,
          number,
          complement: regData.complement,
          city,
          state
        },
        // We simulate saving a password in our db
        // In db.ts client profile is saved, password is typed.
      });

      setIsLoading(false);
      
      if (res.success) {
        setSuccessMsg('Cadastro realizado com sucesso! Redirecionando...');
        setTimeout(() => {
          onNavigate('client-panel');
        }, 1500);
      } else {
        setError(res.error || 'Erro ao efetuar cadastro.');
      }
    }, 1000);
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!recoveryEmail) {
      setError('Por favor, digite seu e-mail.');
      return;
    }

    const res = recoverPassword(recoveryEmail);
    if (res.success) {
      setSuccessMsg(res.message || 'E-mail de recuperação enviado.');
      setRecoveryEmail('');
    } else {
      setError('Ocorreu um erro. Tente novamente.');
    }
  };

  return (
    <div className="flex flex-col align-center justify-between" style={{ minHeight: '100vh', backgroundColor: 'var(--neutral-light)' }}>
      {/* Header bar */}
      <div className="container flex justify-between align-center" style={{ width: '100%', height: '70px', padding: '0 1.5rem' }}>
        <div className="flex align-center gap-2" style={{ cursor: 'pointer' }} onClick={() => onNavigate('landing')}>
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
            <Heart size={16} fill="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>
            Pé de Anjo
          </span>
        </div>
        <button onClick={() => onNavigate('landing')} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
          <ArrowLeft size={14} /> Voltar ao Site
        </button>
      </div>

      {/* Main card */}
      <div className="container flex align-center justify-between" style={{ flex: 1, padding: '2rem 1.5rem', width: '100%', maxWidth: mode === 'register' ? '800px' : '480px' }}>
        <div className="card animate-fade-in" style={{ width: '100%', boxShadow: 'var(--shadow-lg)', padding: '2.5rem' }}>
          
          {/* Logo & title */}
          <div className="text-center" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>
              {mode === 'login' && 'Entrar na sua Conta'}
              {mode === 'register' && 'Criar sua Conta'}
              {mode === 'recovery' && 'Recuperar sua Senha'}
            </h2>
            <p className="text-muted text-sm" style={{ marginTop: '0.25rem' }}>
              {mode === 'login' && 'Gerencie seus agendamentos, pagamentos e prontuário.'}
              {mode === 'register' && 'Cadastre-se para agendar suas consultas com rapidez.'}
              {mode === 'recovery' && 'Insira seu e-mail cadastrado para redefinir sua senha.'}
            </p>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="badge badge-danger" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.25rem', borderRadius: 'var(--radius-md)', textTransform: 'none', fontWeight: 500, fontSize: '0.85rem' }}>
              {error}
            </div>
          )}
          {successMsg && (
            <div className="badge badge-success" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.25rem', borderRadius: 'var(--radius-md)', textTransform: 'none', fontWeight: 500, fontSize: '0.85rem' }}>
              {successMsg}
            </div>
          )}

          {/* MODE: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">E-mail ou CPF</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="exemplo@email.com ou 123.456.789-00"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                  />
                  <User size={16} className="text-muted" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <div className="flex justify-between align-center">
                  <label className="form-label">Senha</label>
                  <button type="button" onClick={() => setMode('recovery')} className="btn-text" style={{ fontSize: '0.75rem', padding: 0 }}>
                    Esqueceu a senha?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  />
                  <Lock size={16} className="text-muted" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--neutral-muted)' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem' }}>
                Entrar na Conta
              </button>

              <div className="text-center text-sm" style={{ marginTop: '1.5rem', color: 'var(--neutral-muted)' }}>
                Não tem uma conta?{' '}
                <button type="button" onClick={() => setMode('register')} className="btn-text" style={{ fontSize: '0.875rem', fontWeight: 600, padding: 0 }}>
                  Criar conta
                </button>
              </div>

              {/* Admin login helper */}
              <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--primary-subtle)', fontSize: '0.75rem' }}>
                <span className="font-semibold" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.25rem' }}>Acesso de Demonstração:</span>
                <div>Administrador: <code>admin@clinica.com.br</code> / Senha: <code>admin123</code></div>
                <div style={{ marginTop: '0.25rem' }}>Cliente (Dummy): <code>ana.silva@email.com</code> / Senha: <code>qualquer</code> (ou CPF: <code>123.456.789-00</code>)</div>
              </div>
            </form>
          )}

          {/* MODE: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--primary)', borderBottom: '1px solid var(--neutral-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Dados Pessoais</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nome Completo *</label>
                  <input type="text" name="name" className="form-input" required value={regData.name} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">CPF *</label>
                  <input type="text" name="cpf" className="form-input" placeholder="123.456.789-00" required value={regData.cpf} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Data de Nascimento *</label>
                  <input type="date" name="birthDate" className="form-input" required value={regData.birthDate} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Sexo *</label>
                  <select name="sex" className="form-input" value={regData.sex} onChange={handleInputChange}>
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Telefone *</label>
                  <input type="text" name="phone" className="form-input" placeholder="(11) 99999-9999" required value={regData.phone} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp *</label>
                  <input type="text" name="whatsapp" className="form-input" placeholder="(11) 99999-9999" required value={regData.whatsapp} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">E-mail *</label>
                  <input type="email" name="email" className="form-input" placeholder="exemplo@email.com" required value={regData.email} onChange={handleInputChange} />
                </div>
              </div>

              <h4 style={{ fontSize: '0.95rem', color: 'var(--primary)', borderBottom: '1px solid var(--neutral-border)', paddingBottom: '0.5rem', marginTop: '1.5rem', marginBottom: '1rem' }}>Endereço Completo</h4>

              <div className="form-row" style={{ gridTemplateColumns: '120px 1fr 100px' }}>
                <div className="form-group">
                  <label className="form-label">CEP *</label>
                  <input type="text" name="cep" className="form-input" placeholder="01310-100" required value={regData.cep} onChange={handleInputChange} onBlur={handleCepBlur} />
                </div>
                <div className="form-group">
                  <label className="form-label">Logradouro *</label>
                  <input type="text" name="street" className="form-input" required value={regData.street} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Número *</label>
                  <input type="text" name="number" className="form-input" required value={regData.number} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Complemento</label>
                  <input type="text" name="complement" className="form-input" value={regData.complement} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cidade *</label>
                  <input type="text" name="city" className="form-input" required value={regData.city} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Estado (UF) *</label>
                  <input type="text" name="state" className="form-input" maxLength={2} placeholder="SP" required value={regData.state} onChange={handleInputChange} />
                </div>
              </div>

              <h4 style={{ fontSize: '0.95rem', color: 'var(--primary)', borderBottom: '1px solid var(--neutral-border)', paddingBottom: '0.5rem', marginTop: '1.5rem', marginBottom: '1rem' }}>Segurança da Conta</h4>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Senha de Acesso *</label>
                  <input type="password" name="password" className="form-input" placeholder="Min. 6 caracteres" required value={regData.password} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirmar Senha *</label>
                  <input type="password" name="confirmPassword" className="form-input" required value={regData.confirmPassword} onChange={handleInputChange} />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem' }}>
                {isLoading ? 'Efetuando cadastro...' : 'Criar Cadastro Completo'}
              </button>

              <div className="text-center text-sm" style={{ marginTop: '1.5rem', color: 'var(--neutral-muted)' }}>
                Já possui uma conta?{' '}
                <button type="button" onClick={() => setMode('login')} className="btn-text" style={{ fontSize: '0.875rem', fontWeight: 600, padding: 0 }}>
                  Faça login
                </button>
              </div>
            </form>
          )}

          {/* MODE: RECOVERY */}
          {mode === 'recovery' && (
            <form onSubmit={handleRecoverySubmit}>
              <div className="form-group">
                <label className="form-label">E-mail Cadastrado</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="exemplo@email.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                  />
                  <Mail size={16} className="text-muted" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem' }}>
                Enviar link de recuperação
              </button>

              <div className="text-center text-sm" style={{ marginTop: '1.5rem', color: 'var(--neutral-muted)' }}>
                Lembrou sua senha?{' '}
                <button type="button" onClick={() => setMode('login')} className="btn-text" style={{ fontSize: '0.875rem', fontWeight: 600, padding: 0 }}>
                  Fazer login
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-xs text-muted" style={{ padding: '2rem 1.5rem', borderTop: '1px solid var(--neutral-border)', width: '100%' }}>
        © {new Date().getFullYear()} Pé de Anjo. Todos os direitos reservados.
      </div>
    </div>
  );
};
