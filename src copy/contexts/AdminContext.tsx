import React, { createContext, useContext, useState, useEffect } from 'react';
import { Booking, Client, Payment, Service, AuditLog, Settings, db, BookingStatus } from '../services/db';
import { useAuth } from './AuthContext';

interface AdminContextType {
  bookings: Booking[];
  clients: Client[];
  payments: Payment[];
  services: Service[];
  auditLogs: AuditLog[];
  settings: Settings;
  statistics: {
    todayBookingsCount: number;
    weekBookingsCount: number;
    clientsCount: number;
    dailyRevenue: number;
    weeklyRevenue: number;
    monthlyRevenue: number;
    cancelledCount: number;
    occupancyRate: number;
    topServices: Array<{ name: string; count: number; value: number }>;
    monthlyHistory: Array<{ month: string; value: number }>;
  };
  
  refreshData: () => void;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  rescheduleBooking: (bookingId: string, date: string, time: string) => { success: boolean; error?: string };
  updateClientStatus: (clientId: string, active: boolean) => void;
  saveService: (service: Service) => void;
  updateSettings: (settings: Settings) => void;
  exportReportExcel: (type: 'clients' | 'bookings' | 'payments' | 'services') => void;
  exportReportPdf: (type: 'clients' | 'bookings' | 'payments' | 'services') => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useAuth();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<Settings>(db.getSettings());

  const refreshData = () => {
    setBookings(db.getBookings());
    setClients(db.getClients());
    setPayments(db.getPayments());
    setServices(db.getServices());
    setAuditLogs(db.getAuditLogs());
    setSettings(db.getSettings());
  };

  useEffect(() => {
    refreshData();
  }, [isAdmin]);

  const updateBookingStatus = (bookingId: string, status: BookingStatus) => {
    const booking = db.getBookingById(bookingId);
    if (!booking) return;

    booking.status = status;
    
    // Auto-update associated payment status if relevant
    if (booking.paymentId) {
      const payment = db.getPaymentById(booking.paymentId);
      if (payment) {
        if (status === 'Cancelado') {
          payment.status = 'Cancelado';
        } else if (status === 'Reembolsado') {
          payment.status = 'Reembolsado';
        } else if (status === 'Aprovado' || status === 'Finalizado') {
          payment.status = 'Aprovado';
        }
        db.savePayment(payment);
      }
    }

    db.saveBooking(booking);
    
    const clientFound = db.getClientById(booking.clientId);
    const clientName = clientFound ? clientFound.name : 'Desconhecido';
    
    db.addAuditLog(
      'admin', 
      'Dr. Roberto Podólogo (Adm)', 
      'Admin', 
      'BOOKING_STATUS_CHANGE', 
      `Status do agendamento ${bookingId} de ${clientName} alterado para ${status}.`
    );
    
    refreshData();
  };

  const rescheduleBooking = (bookingId: string, date: string, time: string): { success: boolean; error?: string } => {
    const booking = db.getBookingById(bookingId);
    if (!booking) return { success: false, error: 'Agendamento não encontrado.' };

    // Check if the time slot is already taken on that day
    const timeTaken = db.getBookings().some(
      b => b.date === date && b.time === time && b.id !== bookingId && b.status !== 'Cancelado' && b.status !== 'Reembolsado'
    );
    if (timeTaken) {
      return { success: false, error: 'Este horário já está reservado por outro cliente.' };
    }

    const oldDate = booking.date;
    const oldTime = booking.time;
    booking.date = date;
    booking.time = time;
    
    db.saveBooking(booking);
    
    const clientFound = db.getClientById(booking.clientId);
    const clientName = clientFound ? clientFound.name : 'Desconhecido';
    
    db.addAuditLog(
      'admin', 
      'Dr. Roberto Podólogo (Adm)', 
      'Admin', 
      'BOOKING_RESCHEDULE', 
      `Agendamento ${bookingId} de ${clientName} reagendado de ${oldDate} às ${oldTime} para ${date} às ${time}.`
    );
    
    refreshData();
    return { success: true };
  };

  const updateClientStatus = (clientId: string, active: boolean) => {
    const client = db.getClientById(clientId);
    if (!client) return;

    client.active = active;
    db.saveClient(client);
    
    db.addAuditLog(
      'admin', 
      'Dr. Roberto Podólogo (Adm)', 
      'Admin', 
      'CLIENT_STATUS_CHANGE', 
      `Status da conta do cliente ${client.name} alterado para ${active ? 'ATIVO' : 'BLOQUEADO'}.`
    );
    
    refreshData();
  };

  const saveService = (service: Service) => {
    const isNew = !service.id;
    if (isNew) {
      service.id = 's' + Date.now();
    }
    
    db.saveService(service);
    db.addAuditLog(
      'admin', 
      'Dr. Roberto Podólogo (Adm)', 
      'Admin', 
      isNew ? 'SERVICE_CREATE' : 'SERVICE_UPDATE', 
      `Serviço '${service.name}' ${isNew ? 'criado' : 'atualizado'} (Preço: R$ ${service.price.toFixed(2)}, Duração: ${service.duration}min).`
    );
    
    refreshData();
  };

  const updateSettings = (updatedSettings: Settings) => {
    db.saveSettings(updatedSettings);
    db.addAuditLog(
      'admin', 
      'Dr. Roberto Podólogo (Adm)', 
      'Admin', 
      'SETTINGS_UPDATE', 
      'Configurações de horários e feriados atualizadas pelo administrador.'
    );
    
    refreshData();
  };

  // Metrics Calculations for Dashboard
  const getStatistics = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Get start of this week (Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0,0,0,0);
    
    // Get start of this month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayBookings = bookings.filter(b => b.date === todayStr);
    const weekBookings = bookings.filter(b => {
      const bDate = new Date(b.date + 'T00:00:00');
      return bDate >= startOfWeek && b.status !== 'Cancelado' && b.status !== 'Reembolsado';
    });

    const dailyRev = payments
      .filter(p => p.createdAt.startsWith(todayStr) && p.status === 'Aprovado')
      .reduce((sum, p) => sum + p.value, 0);

    const weeklyRev = payments
      .filter(p => {
        const pDate = new Date(p.createdAt);
        return pDate >= startOfWeek && p.status === 'Aprovado';
      })
      .reduce((sum, p) => sum + p.value, 0);

    const monthlyRev = payments
      .filter(p => {
        const pDate = new Date(p.createdAt);
        return pDate >= startOfMonth && p.status === 'Aprovado';
      })
      .reduce((sum, p) => sum + p.value, 0);

    const cancelled = bookings.filter(b => b.status === 'Cancelado' || b.status === 'Reembolsado').length;

    // Occupancy Rate: ratio of booked slots to total available slots.
    // E.g., 8 hours/day = 16 slots of 30 minutes. Let's assume 10 slots available per day.
    // For today: occupied slots vs 10 slots
    const totalSlotsPerDay = 10;
    const occupiedToday = todayBookings.filter(b => b.status !== 'Cancelado' && b.status !== 'Reembolsado').length;
    const occupancy = Math.min(Math.round((occupiedToday / totalSlotsPerDay) * 100), 100);

    // Top services calculation
    const serviceCounts: { [key: string]: { name: string; count: number; value: number } } = {};
    bookings.forEach(b => {
      if (b.status === 'Cancelado' || b.status === 'Reembolsado') return;
      const s = services.find(srv => srv.id === b.serviceId);
      if (!s) return;
      if (!serviceCounts[s.id]) {
        serviceCounts[s.id] = { name: s.name, count: 0, value: 0 };
      }
      serviceCounts[s.id].count += 1;
      serviceCounts[s.id].value += s.price;
    });
    
    const topServices = Object.values(serviceCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Hardcoded past monthly data + current month for chart
    const monthlyHistory = [
      { month: 'Jan', value: 8200 },
      { month: 'Fev', value: 9400 },
      { month: 'Mar', value: 11200 },
      { month: 'Abr', value: 10500 },
      { month: 'Mai', value: 12800 },
      { month: 'Jun', value: monthlyRev || 14200 }, // Fallback to demo if month has no data
    ];

    return {
      todayBookingsCount: todayBookings.length,
      weekBookingsCount: weekBookings.length,
      clientsCount: clients.length,
      dailyRevenue: dailyRev,
      weeklyRevenue: weeklyRev,
      monthlyRevenue: monthlyRev,
      cancelledCount: cancelled,
      occupancyRate: occupancy,
      topServices,
      monthlyHistory
    };
  };

  const statistics = getStatistics();

  // Export report to Excel (Simulated CSV download)
  const exportReportExcel = (type: 'clients' | 'bookings' | 'payments' | 'services') => {
    let headers = '';
    let rows: string[] = [];
    const filename = `relatorio_${type}_${new Date().toISOString().split('T')[0]}.csv`;

    if (type === 'clients') {
      headers = 'ID,Nome,CPF,E-mail,Telefone,Cidade,Estado,Status,Data de Cadastro\n';
      rows = clients.map(c => 
        `"${c.id}","${c.name}","${c.cpf}","${c.email}","${c.phone}","${c.address.city}","${c.address.state}","${c.active ? 'Ativo' : 'Bloqueado'}","${c.createdAt.split('T')[0]}"`
      );
    } else if (type === 'bookings') {
      headers = 'ID,Cliente,Servico,Data,Horario,Diabetes,Alergias,Status,Data de Criacao\n';
      rows = bookings.map(b => {
        const c = clients.find(cl => cl.id === b.clientId);
        const s = services.find(sr => sr.id === b.serviceId);
        return `"${b.id}","${c ? c.name : 'Desconhecido'}","${s ? s.name : 'Desconhecido'}","${b.date}","${b.time}","${b.hasDiabetes ? 'Sim' : 'Nao'}","${b.hasAllergies ? 'Sim' : 'Nao'}","${b.status}","${b.createdAt.split('T')[0]}"`;
      });
    } else if (type === 'payments') {
      headers = 'ID,ID Agendamento,Cliente,Metodo,Valor,Status,Transacao,Data\n';
      rows = payments.map(p => {
        const c = clients.find(cl => cl.id === p.clientId);
        return `"${p.id}","${p.bookingId}","${c ? c.name : 'Desconhecido'}","${p.type}","R$ ${p.value.toFixed(2)}","${p.status}","${p.transactionId}","${p.createdAt.split('T')[0]}"`;
      });
    } else if (type === 'services') {
      headers = 'ID,Nome,Preco,Duracao (min),Status\n';
      rows = services.map(s => 
        `"${s.id}","${s.name}","R$ ${s.price.toFixed(2)}","${s.duration}","${s.active ? 'Ativo' : 'Inativo'}"`
      );
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(headers + rows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    db.addAuditLog('admin', 'Dr. Roberto Podólogo (Adm)', 'Admin', 'REPORT_EXPORT', `Exportado relatório de ${type} em formato CSV/Excel.`);
  };

  // Export report to PDF (Simulated Print triggers or layout window)
  const exportReportPdf = (type: 'clients' | 'bookings' | 'payments' | 'services') => {
    // Open a printable popup with clean report design
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let tableContent = '';
    const dateStr = new Date().toLocaleDateString('pt-BR');

    if (type === 'clients') {
      tableContent = `
        <h2>Relatório de Clientes</h2>
        <table>
          <thead>
            <tr><th>Nome</th><th>CPF</th><th>E-mail</th><th>Telefone</th><th>Cidade/UF</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${clients.map(c => `<tr><td>${c.name}</td><td>${c.cpf}</td><td>${c.email}</td><td>${c.phone}</td><td>${c.address.city}/${c.address.state}</td><td>${c.active ? 'Ativo' : 'Bloqueado'}</td></tr>`).join('')}
          </tbody>
        </table>`;
    } else if (type === 'bookings') {
      tableContent = `
        <h2>Relatório de Agendamentos</h2>
        <table>
          <thead>
            <tr><th>Cliente</th><th>Serviço</th><th>Data</th><th>Horário</th><th>Diabetes</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${bookings.map(b => {
              const c = clients.find(cl => cl.id === b.clientId);
              const s = services.find(sr => sr.id === b.serviceId);
              return `<tr><td>${c ? c.name : 'Desconhecido'}</td><td>${s ? s.name : ''}</td><td>${b.date}</td><td>${b.time}</td><td>${b.hasDiabetes ? 'Sim' : 'Não'}</td><td>${b.status}</td></tr>`;
            }).join('')}
          </tbody>
        </table>`;
    } else if (type === 'payments') {
      tableContent = `
        <h2>Relatório Financeiro</h2>
        <table>
          <thead>
            <tr><th>Transação</th><th>Cliente</th><th>Método</th><th>Valor</th><th>Status</th><th>Data</th></tr>
          </thead>
          <tbody>
            ${payments.map(p => {
              const c = clients.find(cl => cl.id === p.clientId);
              return `<tr><td>${p.transactionId}</td><td>${c ? c.name : 'Desconhecido'}</td><td>${p.type}</td><td>R$ ${p.value.toFixed(2)}</td><td>${p.status}</td><td>${new Date(p.createdAt).toLocaleDateString('pt-BR')}</td></tr>`;
            }).join('')}
          </tbody>
        </table>`;
    } else if (type === 'services') {
      tableContent = `
        <h2>Relatório de Serviços</h2>
        <table>
          <thead>
            <tr><th>Nome</th><th>Descrição</th><th>Preço</th><th>Duração</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${services.map(s => `<tr><td>${s.name}</td><td>${s.description}</td><td>R$ ${s.price.toFixed(2)}</td><td>${s.duration} min</td><td>${s.active ? 'Ativo' : 'Inativo'}</td></tr>`).join('')}
          </tbody>
        </table>`;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório - Clínica de Podologia</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1 { color: #0f4c81; margin-bottom: 5px; }
            h2 { color: #475569; margin-top: 0; }
            .header-info { margin-bottom: 30px; font-size: 14px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 13px; }
            th { background-color: #f4f6f9; }
            tr:nth-child(even) { background-color: #fafbfc; }
          </style>
        </head>
        <body>
          <h1>Pé de Anjo - Clínica de Podologia</h1>
          <div class="header-info">Gerado em: ${dateStr} às ${new Date().toLocaleTimeString('pt-BR')} | Acesso Administrativo</div>
          <hr />
          ${tableContent}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    
    db.addAuditLog('admin', 'Dr. Roberto Podólogo (Adm)', 'Admin', 'REPORT_PRINT', `Exportado relatório de ${type} para impressão PDF.`);
  };

  return (
    <AdminContext.Provider
      value={{
        bookings,
        clients,
        payments,
        services,
        auditLogs,
        settings,
        statistics,
        refreshData,
        updateBookingStatus,
        rescheduleBooking,
        updateClientStatus,
        saveService,
        updateSettings,
        exportReportExcel,
        exportReportPdf
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin deve ser usado dentro de um AdminProvider');
  }
  return context;
};
