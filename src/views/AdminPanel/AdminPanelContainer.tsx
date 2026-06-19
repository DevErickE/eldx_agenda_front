import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useAuth } from '../../contexts/AuthContext';
import { Client, Service } from '../../services/db';
import { RevenueAreaChart, TopServicesBarChart } from '../../components/Charts';
import { 
  BarChart2, Calendar, Users, CreditCard, Settings, FileSpreadsheet, 
  ShieldAlert, LogOut, Heart, Plus, Search, Edit, 
  Lock, Unlock, Eye, Printer, Filter
} from 'lucide-react';

interface AdminPanelContainerProps {
  onNavigate: (page: string) => void;
}

export const AdminPanelContainer: React.FC<AdminPanelContainerProps> = ({ onNavigate }) => {
  const { isAdmin, logout } = useAuth();
  
  // Dynamic SaaS clinic data customization
  const saasUser = localStorage.getItem('saas_user');
  const saasData = saasUser ? JSON.parse(saasUser) : null;
  const clinicName = saasData?.clinicName || 'Pé de Anjo';
  const doctorName = saasData?.name || 'Dr. Roberto';

  const {
    bookings,
    clients,
    payments,
    services,
    auditLogs,
    settings,
    statistics,
    updateBookingStatus,
    rescheduleBooking,
    updateClientStatus,
    saveService,
    updateSettings,
    exportReportExcel,
    exportReportPdf
  } = useAdmin();

  const [activeSection, setActiveSection] = useState<
    'dashboard' | 'agenda' | 'clients' | 'finance' | 'services' | 'settings' | 'reports' | 'audit'
  >('dashboard');

  // Agenda section specific states
  const [selectedAgendaDate, setSelectedAgendaDate] = useState(new Date().toISOString().split('T')[0]);
  const [rescheduleData, setRescheduleData] = useState<{ bookingId: string; date: string; time: string } | null>(null);
  
  // Client section specific states
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClientDetail, setSelectedClientDetail] = useState<Client | null>(null);
  
  // Service section specific states
  const [editingService, setEditingService] = useState<Omit<Service, 'id'> & { id?: string } | null>(null);

  // Settings section specific states
  const [settingsForm, setSettingsForm] = useState({
    open: '08:00',
    close: '18:00',
    blockedDate: ''
  });

  // Finance section filters
  const [financeFilterStatus, setFinanceFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (!isAdmin) {
      onNavigate('login');
    }
  }, [isAdmin]);

  useEffect(() => {
    if (settings) {
      setSettingsForm(prev => ({
        ...prev,
        open: settings.businessHours.open,
        close: settings.businessHours.close
      }));
    }
  }, [settings]);

  const handleLogout = () => {
    logout();
    onNavigate('landing');
  };

  // Reschedule process
  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleData) return;
    
    const res = rescheduleBooking(rescheduleData.bookingId, rescheduleData.date, rescheduleData.time);
    if (res.success) {
      alert('Agendamento reagendado com sucesso!');
      setRescheduleData(null);
    } else {
      alert(res.error || 'Erro ao reagendar.');
    }
  };

  // Add/Edit Service
  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    if (!editingService.name || !editingService.price || !editingService.duration) {
      alert('Preencha os dados obrigatórios.');
      return;
    }

    saveService({
      id: editingService.id || '',
      name: editingService.name,
      description: editingService.description || '',
      price: Number(editingService.price),
      duration: Number(editingService.duration),
      active: editingService.active ?? true
    });

    setEditingService(null);
  };

  // Update business settings
  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...settings,
      businessHours: {
        open: settingsForm.open,
        close: settingsForm.close
      }
    });
    alert('Configurações salvas com sucesso.');
  };

  // Block a date
  const handleBlockDate = () => {
    if (!settingsForm.blockedDate) return;
    
    if (settings.blockedDates.includes(settingsForm.blockedDate)) {
      alert('Data já está bloqueada.');
      return;
    }

    updateSettings({
      ...settings,
      blockedDates: [...settings.blockedDates, settingsForm.blockedDate]
    });

    setSettingsForm(prev => ({ ...prev, blockedDate: '' }));
  };

  // Unblock a date
  const handleUnblockDate = (dateStr: string) => {
    updateSettings({
      ...settings,
      blockedDates: settings.blockedDates.filter(d => d !== dateStr)
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const getFilteredClients = () => {
    if (!clientSearch) return clients;
    const search = clientSearch.toLowerCase();
    return clients.filter(c => 
      c.name.toLowerCase().includes(search) || 
      c.cpf.replace(/\D/g, '').includes(search.replace(/\D/g, ''))
    );
  };

  const getFilteredPayments = () => {
    if (financeFilterStatus === 'all') return payments;
    return payments.filter(p => p.status === financeFilterStatus);
  };

  return (
    <div className="flex" style={{ minHeight: '100vh', backgroundColor: 'var(--neutral-light)' }}>
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="glass" style={{ width: '260px', borderRight: '1px solid var(--neutral-border)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', padding: '1.5rem 1rem' }}>
        <div className="flex align-center gap-2" style={{ marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
            <Heart size={18} fill="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>
            {clinicName} <span style={{ color: 'var(--neutral-dark)', fontSize: '0.85rem', fontWeight: 600 }}>Adm</span>
          </span>
        </div>

        {/* Sidebar buttons */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
          <button 
            onClick={() => setActiveSection('dashboard')} 
            className="btn" 
            style={{ 
              justifyContent: 'flex-start',
              backgroundColor: activeSection === 'dashboard' ? 'var(--primary-light)' : 'transparent',
              color: activeSection === 'dashboard' ? 'var(--primary)' : 'var(--neutral-dark)',
              borderColor: activeSection === 'dashboard' ? 'var(--primary-subtle)' : 'transparent',
              padding: '0.65rem 0.85rem',
              fontSize: '0.9rem'
            }}
          >
            <BarChart2 size={18} /> Dashboard Geral
          </button>
          
          <button 
            onClick={() => setActiveSection('agenda')} 
            className="btn" 
            style={{ 
              justifyContent: 'flex-start',
              backgroundColor: activeSection === 'agenda' ? 'var(--primary-light)' : 'transparent',
              color: activeSection === 'agenda' ? 'var(--primary)' : 'var(--neutral-dark)',
              borderColor: activeSection === 'agenda' ? 'var(--primary-subtle)' : 'transparent',
              padding: '0.65rem 0.85rem',
              fontSize: '0.9rem'
            }}
          >
            <Calendar size={18} /> Agenda Clínica
          </button>

          <button 
            onClick={() => setActiveSection('clients')} 
            className="btn" 
            style={{ 
              justifyContent: 'flex-start',
              backgroundColor: activeSection === 'clients' ? 'var(--primary-light)' : 'transparent',
              color: activeSection === 'clients' ? 'var(--primary)' : 'var(--neutral-dark)',
              borderColor: activeSection === 'clients' ? 'var(--primary-subtle)' : 'transparent',
              padding: '0.65rem 0.85rem',
              fontSize: '0.9rem'
            }}
          >
            <Users size={18} /> Clientes & Prontuários
          </button>

          <button 
            onClick={() => setActiveSection('finance')} 
            className="btn" 
            style={{ 
              justifyContent: 'flex-start',
              backgroundColor: activeSection === 'finance' ? 'var(--primary-light)' : 'transparent',
              color: activeSection === 'finance' ? 'var(--primary)' : 'var(--neutral-dark)',
              borderColor: activeSection === 'finance' ? 'var(--primary-subtle)' : 'transparent',
              padding: '0.65rem 0.85rem',
              fontSize: '0.9rem'
            }}
          >
            <CreditCard size={18} /> Faturamento Financeiro
          </button>

          <button 
            onClick={() => setActiveSection('services')} 
            className="btn" 
            style={{ 
              justifyContent: 'flex-start',
              backgroundColor: activeSection === 'services' ? 'var(--primary-light)' : 'transparent',
              color: activeSection === 'services' ? 'var(--primary)' : 'var(--neutral-dark)',
              borderColor: activeSection === 'services' ? 'var(--primary-subtle)' : 'transparent',
              padding: '0.65rem 0.85rem',
              fontSize: '0.9rem'
            }}
          >
            <Settings size={18} /> Gestão de Serviços
          </button>

          <button 
            onClick={() => setActiveSection('settings')} 
            className="btn" 
            style={{ 
              justifyContent: 'flex-start',
              backgroundColor: activeSection === 'settings' ? 'var(--primary-light)' : 'transparent',
              color: activeSection === 'settings' ? 'var(--primary)' : 'var(--neutral-dark)',
              borderColor: activeSection === 'settings' ? 'var(--primary-subtle)' : 'transparent',
              padding: '0.65rem 0.85rem',
              fontSize: '0.9rem'
            }}
          >
            <Settings size={18} /> Horários & Feriados
          </button>

          <button 
            onClick={() => setActiveSection('reports')} 
            className="btn" 
            style={{ 
              justifyContent: 'flex-start',
              backgroundColor: activeSection === 'reports' ? 'var(--primary-light)' : 'transparent',
              color: activeSection === 'reports' ? 'var(--primary)' : 'var(--neutral-dark)',
              borderColor: activeSection === 'reports' ? 'var(--primary-subtle)' : 'transparent',
              padding: '0.65rem 0.85rem',
              fontSize: '0.9rem'
            }}
          >
            <FileSpreadsheet size={18} /> Relatórios Exportáveis
          </button>

          <button 
            onClick={() => setActiveSection('audit')} 
            className="btn" 
            style={{ 
              justifyContent: 'flex-start',
              backgroundColor: activeSection === 'audit' ? 'var(--primary-light)' : 'transparent',
              color: activeSection === 'audit' ? 'var(--primary)' : 'var(--neutral-dark)',
              borderColor: activeSection === 'audit' ? 'var(--primary-subtle)' : 'transparent',
              padding: '0.65rem 0.85rem',
              fontSize: '0.9rem'
            }}
          >
            <ShieldAlert size={18} /> Logs de Auditoria
          </button>
        </nav>

        {/* Admin info & Logout */}
        <div style={{ borderTop: '1px solid var(--neutral-border)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="flex flex-col text-xs" style={{ paddingLeft: '0.5rem' }}>
            <strong className="text-neutral-dark">{doctorName} (Adm)</strong>
            <span className="text-muted">Podólogo Chefe</span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <LogOut size={14} /> Sair do Painel
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main style={{ flex: 1, padding: '2.5rem 3rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto', maxHeight: '100vh' }}>
        
        {/* SECTION: DASHBOARD */}
        {activeSection === 'dashboard' && (
          <div className="animate-fade-in flex flex-col gap-4">
            <div>
              <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-title)' }}>Dashboard Geral</h2>
              <p className="text-muted">Métricas de ocupação, faturamento e vendas calculadas em tempo real.</p>
            </div>

            {saasData?.slug && (
              <div className="card flex justify-between align-center" style={{ padding: '1rem', border: '1px solid var(--primary-subtle)', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem', display: 'flex', flexDirection: 'row' }}>
                <div className="flex align-center gap-2">
                  <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                    <Heart size={20} fill="var(--primary)" />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--neutral-muted)', display: 'block' }}>Link exclusivo de agendamento online ativo:</span>
                    <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>
                      {window.location.origin}/{saasData.slug}/booking
                    </strong>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/${saasData.slug}/booking`);
                    alert('Link de agendamento copiado para a área de transferência!');
                  }}
                  className="btn btn-secondary" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  Copiar Link
                </button>
              </div>
            )}

            {/* Statistics Cards Grid */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
              <div className="card flex flex-col justify-between" style={{ padding: '1.25rem' }}>
                <span className="text-muted font-semibold text-sm">Agendamentos Hoje</span>
                <strong style={{ fontSize: '2.2rem', marginTop: '0.5rem' }}>{statistics.todayBookingsCount}</strong>
              </div>
              <div className="card flex flex-col justify-between" style={{ padding: '1.25rem' }}>
                <span className="text-muted font-semibold text-sm">Faturamento Diário</span>
                <strong style={{ fontSize: '2.2rem', color: 'var(--primary)', marginTop: '0.5rem' }}>R$ {statistics.dailyRevenue.toFixed(2)}</strong>
              </div>
              <div className="card flex flex-col justify-between" style={{ padding: '1.25rem' }}>
                <span className="text-muted font-semibold text-sm">Faturamento Mensal</span>
                <strong style={{ fontSize: '2.2rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>R$ {statistics.monthlyRevenue.toFixed(2)}</strong>
              </div>
              <div className="card flex flex-col justify-between" style={{ padding: '1.25rem' }}>
                <span className="text-muted font-semibold text-sm">Clientes Ativos</span>
                <strong style={{ fontSize: '2.2rem', marginTop: '0.5rem' }}>{statistics.clientsCount}</strong>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginTop: '1rem' }}>
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontFamily: 'var(--font-title)' }}>Histórico de Receita (R$)</h3>
                <RevenueAreaChart data={statistics.monthlyHistory} />
              </div>
              
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontFamily: 'var(--font-title)' }}>Serviços Mais Vendidos</h3>
                <TopServicesBarChart data={statistics.topServices} />
              </div>
            </div>
          </div>
        )}

        {/* SECTION: AGENDA */}
        {activeSection === 'agenda' && (
          <div className="animate-fade-in flex flex-col gap-4">
            <div className="flex justify-between align-center">
              <div>
                <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-title)' }}>Agenda Clínica</h2>
                <p className="text-muted">Visualização de consultas marcadas e acompanhamento médico.</p>
              </div>
              
              <div className="flex align-center gap-2">
                <label className="form-label" style={{ marginBottom: 0 }}>Visualizar dia:</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={selectedAgendaDate} 
                  onChange={(e) => setSelectedAgendaDate(e.target.value)} 
                />
              </div>
            </div>

            {/* List appointments for selectedDate */}
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)' }}>
                Consultas do dia {formatDate(selectedAgendaDate)}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {bookings.filter(b => b.date === selectedAgendaDate).map(b => {
                  const c = clients.find(cl => cl.id === b.clientId);
                  const s = services.find(srv => srv.id === b.serviceId);
                  
                  return (
                    <div key={b.id} className="card flex justify-between align-center" style={{ backgroundColor: 'var(--neutral-light)', padding: '1rem 1.25rem', border: '1px solid var(--neutral-border)' }}>
                      <div>
                        <div className="flex align-center gap-2">
                          <strong className="text-lg">{b.time}</strong>
                          <span className="badge badge-pending" style={{ fontSize: '0.7rem' }}>{s ? s.name : ''}</span>
                        </div>
                        <div style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>
                          <strong>Paciente:</strong> {c ? c.name : 'Desconhecido'} ({c ? c.phone : ''})
                        </div>
                        
                        {/* Medical quick badges */}
                        <div className="flex gap-2" style={{ marginTop: '0.5rem' }}>
                          {b.isFirstConsultation && <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Primeira Consulta</span>}
                          {b.hasDiabetes && <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Diabético</span>}
                          {b.hasCirculatoryProblems && <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Problema Circulatório</span>}
                          {b.hasAllergies && <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Alergia: {b.allergiesDescription}</span>}
                        </div>
                        {b.observations && <div style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', marginTop: '0.25rem' }}>*Obs: {b.observations}</div>}
                      </div>

                      <div className="flex align-center gap-2">
                        <span className={`badge badge-${
                          b.status === 'Aprovado' ? 'success' : b.status === 'Finalizado' ? 'pending' : 'danger'
                        }`}>
                          {b.status === 'Aprovado' ? 'Confirmado' : b.status === 'Finalizado' ? 'Finalizado' : 'Cancelado'}
                        </span>

                        {b.status === 'Aprovado' && (
                          <>
                            <button 
                              onClick={() => updateBookingStatus(b.id, 'Finalizado')}
                              className="btn btn-secondary" 
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: 'var(--success)' }}
                            >
                              Finalizar
                            </button>
                            <button 
                              onClick={() => setRescheduleData({ bookingId: b.id, date: b.date, time: b.time })}
                              className="btn btn-secondary" 
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                            >
                              Reagendar
                            </button>
                            <button 
                              onClick={() => updateBookingStatus(b.id, 'Cancelado')}
                              className="btn btn-secondary" 
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

                {bookings.filter(b => b.date === selectedAgendaDate).length === 0 && (
                  <div className="text-center text-muted" style={{ padding: '2rem' }}>
                    Nenhuma consulta agendada para este dia.
                  </div>
                )}
              </div>
            </div>

            {/* Reschedule Modal Box (simulation) */}
            {rescheduleData && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <form onSubmit={handleRescheduleSubmit} className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem' }}>Reagendar Consulta</h3>
                  
                  <div className="form-group">
                    <label className="form-label">Nova Data</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      required 
                      value={rescheduleData.date} 
                      onChange={(e) => setRescheduleData(prev => ({ ...prev!, date: e.target.value }))} 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Novo Horário</label>
                    <input 
                      type="time" 
                      className="form-input" 
                      required 
                      value={rescheduleData.time} 
                      onChange={(e) => setRescheduleData(prev => ({ ...prev!, time: e.target.value }))} 
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setRescheduleData(null)} className="btn btn-secondary">
                      Voltar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Reagendar Horário
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* SECTION: CLIENTS */}
        {activeSection === 'clients' && (
          <div className="animate-fade-in flex flex-col gap-4">
            <div>
              <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-title)' }}>Clientes & Prontuários</h2>
              <p className="text-muted">Pesquisa cadastral, bloqueio de contas e histórico de prontuários.</p>
            </div>

            {/* Search Bar */}
            <div className="card flex align-center justify-between" style={{ padding: '0.75rem 1rem' }}>
              <div className="flex align-center gap-2" style={{ flex: 1 }}>
                <Search size={18} className="text-muted" />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Pesquisar cliente por nome ou CPF..." 
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  style={{ border: 'none', width: '100%', padding: '0.25rem' }} 
                />
              </div>
            </div>

            {/* Clients Table */}
            <div className="card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--neutral-border)', fontSize: '0.85rem', color: 'var(--neutral-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Nome</th>
                    <th style={{ padding: '0.75rem 1rem' }}>CPF</th>
                    <th style={{ padding: '0.75rem 1rem' }}>E-mail</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Telefone</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredClients().map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--neutral-border)', fontSize: '0.9rem' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{c.name}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{c.cpf}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{c.email}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{c.phone}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className={`badge badge-${c.active ? 'success' : 'danger'}`}>
                          {c.active ? 'Ativo' : 'Bloqueado'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <div className="flex gap-2 justify-center">
                          <button 
                            onClick={() => setSelectedClientDetail(c)}
                            className="btn btn-secondary" 
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          >
                            <Eye size={12} /> Prontuário
                          </button>
                          
                          {c.active ? (
                            <button 
                              onClick={() => updateClientStatus(c.id, false)}
                              className="btn btn-secondary" 
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'var(--danger-light)' }}
                            >
                              <Lock size={12} /> Bloquear
                            </button>
                          ) : (
                            <button 
                              onClick={() => updateClientStatus(c.id, true)}
                              className="btn btn-secondary" 
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--success)', borderColor: 'var(--success-light)' }}
                            >
                              <Unlock size={12} /> Desbloquear
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Client Medical Detail / History Prontuário Modal */}
            {selectedClientDetail && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--neutral-border)', paddingBottom: '0.75rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.4rem' }}>Ficha Prontuário: {selectedClientDetail.name}</h3>
                    <button onClick={() => setSelectedClientDetail(null)} className="btn-text" style={{ padding: 0, fontSize: '1.25rem' }}>&times;</button>
                  </div>

                  {/* Medical profile details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem' }}>
                    <div><strong>CPF:</strong> {selectedClientDetail.cpf}</div>
                    <div><strong>Nascimento:</strong> {formatDate(selectedClientDetail.birthDate)}</div>
                    <div><strong>WhatsApp:</strong> {selectedClientDetail.whatsapp}</div>
                    <div><strong>E-mail:</strong> {selectedClientDetail.email}</div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <strong>Endereço:</strong> {selectedClientDetail.address.street}, {selectedClientDetail.address.number} - {selectedClientDetail.address.city}/{selectedClientDetail.address.state}
                    </div>
                  </div>

                  {/* Past appointment lists */}
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--primary)', borderBottom: '1px solid var(--neutral-border)', paddingBottom: '0.25rem', marginTop: '0.5rem' }}>Histórico Clínico de Consultas</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {bookings.filter(b => b.clientId === selectedClientDetail.id).map(b => {
                      const s = services.find(srv => srv.id === b.serviceId);
                      return (
                        <div key={b.id} style={{ border: '1px solid var(--neutral-border)', borderRadius: 'var(--radius-md)', padding: '0.75rem', fontSize: '0.85rem', backgroundColor: 'var(--neutral-light)' }}>
                          <div className="flex justify-between font-semibold">
                            <span>{s ? s.name : ''}</span>
                            <span>{formatDate(b.date)} às {b.time}</span>
                          </div>
                          <div style={{ marginTop: '0.25rem' }}>
                            <strong>Status:</strong> {b.status} | 
                            <strong> Triagem:</strong> Diabetes: {b.hasDiabetes ? 'Sim' : 'Não'} | Alergias: {b.hasAllergies ? b.allergiesDescription : 'Não'}
                          </div>
                          {b.observations && <div style={{ color: 'var(--neutral-muted)', marginTop: '0.25rem' }}>*Obs: {b.observations}</div>}
                        </div>
                      );
                    })}

                    {bookings.filter(b => b.clientId === selectedClientDetail.id).length === 0 && (
                      <div className="text-center text-muted">Nenhum agendamento clínico registrado para este paciente.</div>
                    )}
                  </div>

                  <div className="flex justify-end" style={{ marginTop: '1rem' }}>
                    <button type="button" onClick={() => setSelectedClientDetail(null)} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
                      Fechar Ficha
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION: FINANCE */}
        {activeSection === 'finance' && (
          <div className="animate-fade-in flex flex-col gap-4">
            <div>
              <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-title)' }}>Faturamento Financeiro</h2>
              <p className="text-muted">Gestão de pagamentos aprovados, pendentes ou reembolsados.</p>
            </div>

            {/* Stats */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="card text-center" style={{ padding: '1rem' }}>
                <span className="text-muted text-xs font-bold block">TOTAL RECEBIDO</span>
                <strong className="text-lg" style={{ color: 'var(--success)' }}>
                  R$ {payments.filter(p => p.status === 'Aprovado').reduce((acc, p) => acc + p.value, 0).toFixed(2)}
                </strong>
              </div>
              <div className="card text-center" style={{ padding: '1rem' }}>
                <span className="text-muted text-xs font-bold block">PAGAMENTOS PENDENTES</span>
                <strong className="text-lg" style={{ color: 'var(--warning)' }}>
                  R$ {payments.filter(p => p.status === 'Pendente').reduce((acc, p) => acc + p.value, 0).toFixed(2)}
                </strong>
              </div>
              <div className="card text-center" style={{ padding: '1rem' }}>
                <span className="text-muted text-xs font-bold block">TOTAL REEMBOLSADO/CANCELADO</span>
                <strong className="text-lg" style={{ color: 'var(--danger)' }}>
                  R$ {payments.filter(p => p.status === 'Reembolsado' || p.status === 'Cancelado').reduce((acc, p) => acc + p.value, 0).toFixed(2)}
                </strong>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="card flex justify-between align-center" style={{ padding: '0.75rem 1rem' }}>
              <div className="flex align-center gap-2">
                <Filter size={18} className="text-muted" />
                <span className="text-sm font-semibold">Filtrar status:</span>
                <select 
                  className="form-input" 
                  value={financeFilterStatus} 
                  onChange={(e) => setFinanceFilterStatus(e.target.value)}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                >
                  <option value="all">Todos Pagamentos</option>
                  <option value="Aprovado">Aprovado</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Reembolsado">Reembolsado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            {/* Payments Table */}
            <div className="card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--neutral-border)', fontSize: '0.85rem', color: 'var(--neutral-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>ID Transação</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Cliente</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Método</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Valor</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredPayments().map(p => {
                    const c = clients.find(cl => cl.id === p.clientId);
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--neutral-border)', fontSize: '0.9rem' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{p.transactionId}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>{c ? c.name : 'Desconhecido'}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>{p.type}</td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>R$ {p.value.toFixed(2)}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span className={`badge badge-${
                            p.status === 'Aprovado' ? 'success' : p.status === 'Pendente' ? 'warning' : 'danger'
                          }`} style={{ fontSize: '0.7rem' }}>
                            {p.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>{formatDate(p.createdAt.split('T')[0])}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION: SERVICES */}
        {activeSection === 'services' && (
          <div className="animate-fade-in flex flex-col gap-4">
            <div className="flex justify-between align-center">
              <div>
                <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-title)' }}>Gestão de Serviços</h2>
                <p className="text-muted">Cadastro de novos procedimentos, edição de preços e durações.</p>
              </div>
              
              <button 
                onClick={() => setEditingService({ name: '', description: '', price: 0, duration: 30, active: true })}
                className="btn btn-primary" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                <Plus size={16} /> Novo Serviço
              </button>
            </div>

            {/* List Services */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {services.map(s => (
                <div key={s.id} className="card flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between align-center" style={{ marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-title)' }}>{s.name}</h3>
                      <span className={`badge badge-${s.active ? 'success' : 'danger'}`} style={{ fontSize: '0.65rem' }}>
                        {s.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-muted text-sm" style={{ marginBottom: '1rem' }}>{s.description}</p>
                  </div>
                  
                  <div style={{ borderTop: '1px solid var(--neutral-border)', paddingTop: '0.75rem', display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="font-bold text-lg" style={{ color: 'var(--primary)' }}>R$ {s.price.toFixed(2)}</div>
                      <div className="text-xs text-muted">{s.duration} minutos</div>
                    </div>
                    
                    <button 
                      onClick={() => setEditingService(s)}
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem', borderRadius: '50%' }}
                    >
                      <Edit size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Service Form Modal */}
            {editingService && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <form onSubmit={handleServiceSubmit} className="card animate-fade-in" style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem' }}>
                    {editingService.id ? 'Editar Serviço' : 'Criar Novo Serviço'}
                  </h3>

                  <div className="form-group">
                    <label className="form-label">Nome do Serviço *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={editingService.name} 
                      onChange={(e) => setEditingService(prev => ({ ...prev!, name: e.target.value }))} 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Descrição</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editingService.description || ''} 
                      onChange={(e) => setEditingService(prev => ({ ...prev!, description: e.target.value }))} 
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Valor (R$) *</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="form-input" 
                        required 
                        value={editingService.price} 
                        onChange={(e) => setEditingService(prev => ({ ...prev!, price: Number(e.target.value) }))} 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Duração (Min) *</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        required 
                        value={editingService.duration} 
                        onChange={(e) => setEditingService(prev => ({ ...prev!, duration: Number(e.target.value) }))} 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status Ativo</label>
                    <select 
                      className="form-input" 
                      value={editingService.active ? 'yes' : 'no'}
                      onChange={(e) => setEditingService(prev => ({ ...prev!, active: e.target.value === 'yes' }))}
                    >
                      <option value="yes">Sim (Visível para Agendamento)</option>
                      <option value="no">Não (Inativo)</option>
                    </select>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setEditingService(null)} className="btn btn-secondary">
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Salvar Serviço
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* SECTION: SETTINGS */}
        {activeSection === 'settings' && (
          <div className="animate-fade-in flex flex-col gap-4">
            <div>
              <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-title)' }}>Horários & Feriados</h2>
              <p className="text-muted">Ajuste os horários diários de funcionamento ou adicione bloqueios na agenda.</p>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              
              {/* Daily Hours Form */}
              <form onSubmit={handleSettingsSubmit} className="card flex flex-col gap-4">
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem' }}>Horário de Expediente</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Abertura</label>
                    <input 
                      type="time" 
                      className="form-input" 
                      value={settingsForm.open}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, open: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fechamento</label>
                    <input 
                      type="time" 
                      className="form-input" 
                      value={settingsForm.close}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, close: e.target.value }))}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  Salvar Expediente
                </button>
              </form>

              {/* Blocked Dates Form */}
              <div className="card flex flex-col gap-4">
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem' }}>Bloqueio Temporário de Datas</h3>
                
                <div className="flex gap-2">
                  <input 
                    type="date" 
                    className="form-input" 
                    value={settingsForm.blockedDate}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, blockedDate: e.target.value }))}
                    style={{ width: '100%' }}
                  />
                  <button onClick={handleBlockDate} className="btn btn-secondary">
                    Bloquear
                  </button>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <label className="form-label">Datas Bloqueadas Ativas:</label>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
                    {settings.blockedDates.map(date => (
                      <li key={date} className="flex justify-between align-center" style={{ fontSize: '0.85rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--neutral-light)', borderRadius: '4px' }}>
                        <span>{formatDate(date)}</span>
                        <button onClick={() => handleUnblockDate(date)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                          Desbloquear
                        </button>
                      </li>
                    ))}
                    {settings.blockedDates.length === 0 && <span className="text-muted text-xs">Nenhuma data bloqueada cadastrada.</span>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: REPORTS */}
        {activeSection === 'reports' && (
          <div className="animate-fade-in flex flex-col gap-4">
            <div>
              <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-title)' }}>Relatórios Exportáveis</h2>
              <p className="text-muted">Gere relatórios impressos em PDF ou planilhas prontas em Excel/CSV.</p>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              
              {/* Clients Report Card */}
              <div className="card flex flex-col justify-between">
                <div>
                  <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Relatório de Clientes</h3>
                  <p className="text-muted text-sm">Contém a lista de clientes, CPFs, dados de contato e status da conta.</p>
                </div>
                <div className="flex gap-2" style={{ marginTop: '1.5rem' }}>
                  <button onClick={() => exportReportExcel('clients')} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>
                    <FileSpreadsheet size={16} /> Excel (CSV)
                  </button>
                  <button onClick={() => exportReportPdf('clients')} className="btn btn-primary" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>
                    <Printer size={16} /> Impressão PDF
                  </button>
                </div>
              </div>

              {/* Bookings Report Card */}
              <div className="card flex flex-col justify-between">
                <div>
                  <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Relatório de Agendamentos</h3>
                  <p className="text-muted text-sm">Lista histórico e agendamentos futuros filtrados com informações médicas.</p>
                </div>
                <div className="flex gap-2" style={{ marginTop: '1.5rem' }}>
                  <button onClick={() => exportReportExcel('bookings')} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>
                    <FileSpreadsheet size={16} /> Excel (CSV)
                  </button>
                  <button onClick={() => exportReportPdf('bookings')} className="btn btn-primary" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>
                    <Printer size={16} /> Impressão PDF
                  </button>
                </div>
              </div>

              {/* Finance Report Card */}
              <div className="card flex flex-col justify-between">
                <div>
                  <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Relatório Financeiro</h3>
                  <p className="text-muted text-sm">Demonstrativo completo de receitas brutas, transações aprovadas e reembolsos.</p>
                </div>
                <div className="flex gap-2" style={{ marginTop: '1.5rem' }}>
                  <button onClick={() => exportReportExcel('payments')} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>
                    <FileSpreadsheet size={16} /> Excel (CSV)
                  </button>
                  <button onClick={() => exportReportPdf('payments')} className="btn btn-primary" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>
                    <Printer size={16} /> Impressão PDF
                  </button>
                </div>
              </div>

              {/* Services Report Card */}
              <div className="card flex flex-col justify-between">
                <div>
                  <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Tabela de Serviços</h3>
                  <p className="text-muted text-sm">Exporte a tabela cadastral de serviços com preços e durações configuradas.</p>
                </div>
                <div className="flex gap-2" style={{ marginTop: '1.5rem' }}>
                  <button onClick={() => exportReportExcel('services')} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>
                    <FileSpreadsheet size={16} /> Excel (CSV)
                  </button>
                  <button onClick={() => exportReportPdf('services')} className="btn btn-primary" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>
                    <Printer size={16} /> Impressão PDF
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION: AUDIT */}
        {activeSection === 'audit' && (
          <div className="animate-fade-in flex flex-col gap-4">
            <div>
              <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-title)' }}>Logs de Auditoria</h2>
              <p className="text-muted">Registro histórico de acessos, agendamentos e modificações financeiras do sistema.</p>
            </div>

            {/* Audit Logs List */}
            <div className="card" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {auditLogs.map((log) => (
                  <div key={log.id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--neutral-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <div style={{ flex: 1, paddingRight: '1rem' }}>
                      <div className="flex align-center gap-2">
                        <span className="badge badge-pending" style={{ fontSize: '0.65rem' }}>{log.action}</span>
                        <strong className="text-neutral-dark">{log.userName} ({log.userRole})</strong>
                      </div>
                      <p className="text-muted" style={{ marginTop: '0.25rem' }}>{log.details}</p>
                    </div>
                    
                    <span style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}

                {auditLogs.length === 0 && (
                  <div className="text-center text-muted" style={{ padding: '2rem' }}>
                    Nenhum log de auditoria disponível.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
