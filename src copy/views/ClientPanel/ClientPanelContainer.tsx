import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db, Booking, Payment, Service } from '../../services/db';
import { 
  Calendar, CreditCard, User, LogOut, CheckCircle, Clock, 
  XCircle, FileText, Heart
} from 'lucide-react';

interface ClientPanelContainerProps {
  onNavigate: (page: string) => void;
}

export const ClientPanelContainer: React.FC<ClientPanelContainerProps> = ({ onNavigate }) => {
  const { client, logout, updateProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'bookings' | 'payments' | 'profile'>('bookings');
  
  // Data states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    city: '',
    state: ''
  });

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Load client data
  const loadClientData = () => {
    if (client) {
      setBookings(db.getBookingsByClientId(client.id));
      setPayments(db.getPaymentsByClientId(client.id));
      setServices(db.getServices());
      
      setProfileForm({
        name: client.name,
        email: client.email,
        phone: client.phone,
        whatsapp: client.whatsapp,
        cep: client.address.cep,
        street: client.address.street,
        number: client.address.number,
        complement: client.address.complement || '',
        city: client.address.city,
        state: client.address.state
      });
    }
  };

  useEffect(() => {
    // If not logged in, redirect to login
    if (!client) {
      onNavigate('login');
    } else {
      loadClientData();
    }
  }, [client]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCepBlur = async () => {
    const cleanCep = profileForm.cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setProfileForm(prev => ({
            ...prev,
            street: data.logradouro || '',
            city: data.localidade || '',
            state: data.uf || ''
          }));
        }
      } catch (err) {
        // fail silently
      }
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    if (!client) return;

    const updatedClient = {
      ...client,
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
      whatsapp: profileForm.whatsapp,
      address: {
        cep: profileForm.cep,
        street: profileForm.street,
        number: profileForm.number,
        complement: profileForm.complement,
        city: profileForm.city,
        state: profileForm.state
      }
    };

    const res = updateProfile(updatedClient);
    if (res.success) {
      setFeedbackMsg({ type: 'success', text: 'Dados atualizados com sucesso!' });
    } else {
      setFeedbackMsg({ type: 'danger', text: res.error || 'Erro ao atualizar dados.' });
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    if (!window.confirm('Tem certeza de que deseja cancelar este agendamento? O reembolso será analisado administrativamente conforme nossa política de cancelamento.')) {
      return;
    }

    const booking = db.getBookingById(bookingId);
    if (booking) {
      booking.status = 'Cancelado';
      db.saveBooking(booking);

      // Cancel payment if associated
      if (booking.paymentId) {
        const payment = db.getPaymentById(booking.paymentId);
        if (payment) {
          payment.status = 'Cancelado';
          db.savePayment(payment);
        }
      }

      db.addAuditLog(client!.id, client!.name, 'Client', 'BOOKING_CANCEL', `Cliente solicitou cancelamento do agendamento ${bookingId}.`);
      setFeedbackMsg({ type: 'success', text: 'Agendamento cancelado com sucesso.' });
      loadClientData();
    }
  };

  const handleOpenReceipt = (payment: Payment, serviceName: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Recibo de Pagamento - Clínica de Podologia</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .receipt-box { max-width: 500px; margin: 0 auto; border: 1px solid #ddd; padding: 25px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .header { text-align: center; border-bottom: 2px solid #0f4c81; padding-bottom: 15px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #0f4c81; }
            .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
            .divider { border-top: 1px dashed #ddd; margin: 15px 0; }
            .total { font-size: 18px; font-weight: bold; color: #0f4c81; }
            .footer { text-align: center; font-size: 11px; color: #888; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <div class="header">
              <div class="logo">Pé de Anjo Podologia</div>
              <div style="font-size: 12px; color: #666; margin-top: 5px;">Recibo de Atendimento Podológico</div>
            </div>
            <div class="row"><span>ID da Transação:</span> <strong>${payment.transactionId}</strong></div>
            <div class="row"><span>Data/Hora:</span> <strong>${new Date(payment.createdAt).toLocaleString('pt-BR')}</strong></div>
            <div class="row"><span>Cliente:</span> <strong>${client?.name}</strong></div>
            <div class="row"><span>CPF:</span> <strong>${client?.cpf}</strong></div>
            <div class="divider"></div>
            <div class="row"><span>Serviço Realizado:</span> <strong>${serviceName}</strong></div>
            <div class="row"><span>Forma de Pagamento:</span> <strong>${payment.type === 'PIX' ? 'PIX' : payment.type === 'CREDIT_CARD' ? 'Cartão de Crédito' : 'Cartão de Débito'}</strong></div>
            <div class="row"><span>Status:</span> <strong style="color: green;">PAGO/APROVADO</strong></div>
            <div class="divider"></div>
            <div class="row total"><span>Valor total:</span> <span>R$ ${payment.value.toFixed(2)}</span></div>
            <div class="footer">
              <p>Pé de Anjo Podologia Ltda | CNPJ: 12.345.678/0001-99</p>
              <p>Avenida Paulista, 1000 - São Paulo, SP</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleLogout = () => {
    logout();
    onNavigate('landing');
  };

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="flex flex-col" style={{ minHeight: '100vh', backgroundColor: 'var(--neutral-light)' }}>
      {/* Top Header */}
      <nav className="glass" style={{ borderBottom: '1px solid var(--neutral-border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="container flex justify-between align-center" style={{ height: '70px', padding: '0 1.5rem' }}>
          <div className="flex align-center gap-2" style={{ cursor: 'pointer' }} onClick={() => onNavigate('landing')}>
            <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
              <Heart size={16} fill="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>
              Pé de Anjo <span style={{ color: 'var(--neutral-dark)', fontSize: '0.8rem', fontWeight: 500 }}>Cliente</span>
            </span>
          </div>

          <div className="flex align-center gap-3">
            <span className="text-sm font-semibold text-neutral-dark">Olá, {client?.name.split(' ')[0]}</span>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>
      </nav>

      {/* Main Grid Layout */}
      <div className="container grid" style={{ flex: 1, padding: '2.5rem 1.5rem', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem', width: '100%' }}>
        
        {/* Sidebar Controls (Grid 12-to-3 columns) */}
        <div className="card" style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: '0.5rem', height: 'fit-content', padding: '1rem' }}>
          <button 
            onClick={() => setActiveTab('bookings')} 
            className="btn" 
            style={{ 
              justifyContent: 'flex-start',
              backgroundColor: activeTab === 'bookings' ? 'var(--primary-light)' : 'transparent',
              color: activeTab === 'bookings' ? 'var(--primary)' : 'var(--neutral-dark)',
              borderColor: activeTab === 'bookings' ? 'var(--primary-subtle)' : 'transparent',
              padding: '0.75rem 1rem'
            }}
          >
            <Calendar size={18} /> Meus Agendamentos
          </button>
          <button 
            onClick={() => setActiveTab('payments')} 
            className="btn" 
            style={{ 
              justifyContent: 'flex-start',
              backgroundColor: activeTab === 'payments' ? 'var(--primary-light)' : 'transparent',
              color: activeTab === 'payments' ? 'var(--primary)' : 'var(--neutral-dark)',
              borderColor: activeTab === 'payments' ? 'var(--primary-subtle)' : 'transparent',
              padding: '0.75rem 1rem'
            }}
          >
            <CreditCard size={18} /> Meus Pagamentos
          </button>
          <button 
            onClick={() => setActiveTab('profile')} 
            className="btn" 
            style={{ 
              justifyContent: 'flex-start',
              backgroundColor: activeTab === 'profile' ? 'var(--primary-light)' : 'transparent',
              color: activeTab === 'profile' ? 'var(--primary)' : 'var(--neutral-dark)',
              borderColor: activeTab === 'profile' ? 'var(--primary-subtle)' : 'transparent',
              padding: '0.75rem 1rem'
            }}
          >
            <User size={18} /> Meu Perfil
          </button>
          
          <div style={{ borderTop: '1px solid var(--neutral-border)', marginTop: '1rem', paddingTop: '1rem', textAlign: 'center' }}>
            <button onClick={() => onNavigate('booking')} className="btn btn-primary" style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}>
              Novo Agendamento
            </button>
          </div>
        </div>

        {/* Dynamic Display Area (Grid 12-to-9 columns) */}
        <div style={{ gridColumn: 'span 9' }}>
          
          {/* Notifications */}
          {feedbackMsg && (
            <div className={`badge badge-${feedbackMsg.type} animate-fade-in`} style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)', textTransform: 'none', fontWeight: 500 }}>
              {feedbackMsg.text}
            </div>
          )}

          {/* TAB: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="animate-fade-in flex flex-col gap-4">
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>Meus Agendamentos</h2>
              
              <div className="flex flex-col gap-3">
                {bookings.map(b => {
                  const s = services.find(sr => sr.id === b.serviceId);
                  
                  return (
                    <div key={b.id} className="card flex justify-between align-center" style={{ padding: '1.25rem' }}>
                      <div className="flex align-center gap-3">
                        <div style={{ 
                          backgroundColor: b.status === 'Aprovado' 
                            ? 'var(--success-light)' 
                            : b.status === 'Finalizado' 
                              ? 'var(--pending-light)' 
                              : 'var(--danger-light)', 
                          color: b.status === 'Aprovado' 
                            ? 'var(--success)' 
                            : b.status === 'Finalizado' 
                              ? 'var(--pending)' 
                              : 'var(--danger)', 
                          padding: '10px', 
                          borderRadius: '12px' 
                        }}>
                          {b.status === 'Aprovado' && <CheckCircle size={24} />}
                          {b.status === 'Finalizado' && <Clock size={24} />}
                          {(b.status === 'Cancelado' || b.status === 'Reembolsado') && <XCircle size={24} />}
                        </div>
                        
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-title)' }}>{s ? s.name : 'Avaliação Podológica'}</h3>
                          <div className="flex gap-3 text-xs text-muted" style={{ marginTop: '0.25rem' }}>
                            <span><strong>Data:</strong> {formatDate(b.date)}</span>
                            <span><strong>Horário:</strong> {b.time}</span>
                            <span><strong>Valor:</strong> R$ {s ? s.price.toFixed(2) : '0,00'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex align-center gap-2">
                        <span className={`badge badge-${
                          b.status === 'Aprovado' 
                            ? 'success' 
                            : b.status === 'Finalizado' 
                              ? 'pending' 
                              : 'danger'
                        }`}>
                          {b.status === 'Aprovado' ? 'Confirmado' : b.status === 'Finalizado' ? 'Finalizado' : 'Cancelado'}
                        </span>

                        {b.status === 'Aprovado' && (
                          <button 
                            onClick={() => handleCancelBooking(b.id)} 
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'var(--danger-light)' }}
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {bookings.length === 0 && (
                  <div className="card text-center text-muted" style={{ padding: '3rem 2rem' }}>
                    <Calendar size={40} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
                    <p>Você não possui nenhum agendamento registrado.</p>
                    <button onClick={() => onNavigate('booking')} className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', fontSize: '0.85rem' }}>
                      Agendar Agora
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="animate-fade-in flex flex-col gap-4">
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>Meus Pagamentos</h2>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--neutral-border)' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid var(--neutral-border)', fontSize: '0.85rem', color: 'var(--neutral-muted)' }}>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Transação</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Serviço</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Método</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Valor</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Recibo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => {
                      const b = bookings.find(bk => bk.paymentId === p.id);
                      const s = b ? services.find(srv => srv.id === b.serviceId) : null;
                      const serviceName = s ? s.name : 'Serviço Clínico';

                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--neutral-border)', fontSize: '0.9rem' }}>
                          <td style={{ padding: '1rem', fontWeight: 600 }}>{p.transactionId}</td>
                          <td style={{ padding: '1rem' }}>{serviceName}</td>
                          <td style={{ padding: '1rem' }}>{p.type === 'PIX' ? 'PIX' : p.type === 'CREDIT_CARD' ? 'Crédito' : 'Débito'}</td>
                          <td style={{ padding: '1rem', fontWeight: 700 }}>R$ {p.value.toFixed(2)}</td>
                          <td style={{ padding: '1rem' }}>
                            <span className={`badge badge-${
                              p.status === 'Aprovado' ? 'success' : p.status === 'Pendente' ? 'warning' : 'danger'
                            }`} style={{ fontSize: '0.7rem' }}>
                              {p.status === 'Aprovado' ? 'Aprovado' : p.status === 'Pendente' ? 'Pendente' : p.status}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            {p.status === 'Aprovado' ? (
                              <button 
                                onClick={() => handleOpenReceipt(p, serviceName)}
                                className="btn btn-secondary" 
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                              >
                                <FileText size={14} /> Recibo
                              </button>
                            ) : (
                              <span className="text-muted text-xs">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {payments.length === 0 && (
                  <div className="card text-center text-muted" style={{ padding: '3rem 2rem', border: 'none' }}>
                    <CreditCard size={40} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
                    <p>Nenhum pagamento registrado.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div className="animate-fade-in flex flex-col gap-4">
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>Meu Perfil</h2>
              
              <form onSubmit={handleProfileSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', borderBottom: '1px solid var(--neutral-border)', paddingBottom: '0.5rem', fontFamily: 'var(--font-title)' }}>Dados Pessoais</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nome Completo</label>
                    <input type="text" name="name" className="form-input" required value={profileForm.name} onChange={handleProfileChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">E-mail</label>
                    <input type="email" name="email" className="form-input" required value={profileForm.email} onChange={handleProfileChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Telefone</label>
                    <input type="text" name="phone" className="form-input" required value={profileForm.phone} onChange={handleProfileChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp</label>
                    <input type="text" name="whatsapp" className="form-input" required value={profileForm.whatsapp} onChange={handleProfileChange} />
                  </div>
                </div>

                <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', borderBottom: '1px solid var(--neutral-border)', paddingBottom: '0.5rem', marginTop: '1rem', fontFamily: 'var(--font-title)' }}>Endereço Completo</h3>

                <div className="form-row" style={{ gridTemplateColumns: '120px 1fr 100px' }}>
                  <div className="form-group">
                    <label className="form-label">CEP</label>
                    <input type="text" name="cep" className="form-input" required value={profileForm.cep} onChange={handleProfileChange} onBlur={handleCepBlur} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rua</label>
                    <input type="text" name="street" className="form-input" required value={profileForm.street} onChange={handleProfileChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Número</label>
                    <input type="text" name="number" className="form-input" required value={profileForm.number} onChange={handleProfileChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Complemento</label>
                    <input type="text" name="complement" className="form-input" value={profileForm.complement} onChange={handleProfileChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cidade</label>
                    <input type="text" name="city" className="form-input" required value={profileForm.city} onChange={handleProfileChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estado (UF)</label>
                    <input type="text" name="state" className="form-input" maxLength={2} required value={profileForm.state} onChange={handleProfileChange} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-muted" style={{ padding: '2rem 1.5rem', borderTop: '1px solid var(--neutral-border)' }}>
        © {new Date().getFullYear()} Pé de Anjo. Todos os direitos reservados.
      </footer>
    </div>
  );
};
