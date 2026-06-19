export interface Address {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
}

export interface Client {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  whatsapp: string;
  birthDate: string;
  sex: 'Masculino' | 'Feminino' | 'Outro';
  address: Address;
  active: boolean;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  active: boolean;
}

export type BookingStatus = 'Pendente' | 'Aprovado' | 'Finalizado' | 'Cancelado' | 'Reembolsado';

export interface Booking {
  id: string;
  clientId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  isFirstConsultation: boolean;
  hasDiabetes: boolean;
  hasCirculatoryProblems: boolean;
  hasAllergies: boolean;
  allergiesDescription?: string;
  observations?: string;
  status: BookingStatus;
  paymentId?: string;
  createdAt: string;
}

export type PaymentStatus = 'Pendente' | 'Aprovado' | 'Cancelado' | 'Reembolsado';
export type PaymentType = 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD';

export interface Payment {
  id: string;
  bookingId: string;
  clientId: string;
  type: PaymentType;
  status: PaymentStatus;
  value: number;
  transactionId: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: 'Client' | 'Admin';
  action: string;
  details: string;
  timestamp: string;
}

export interface Settings {
  businessHours: {
    open: string;  // HH:MM
    close: string; // HH:MM
  };
  holidays: Array<{ date: string; name: string }>;
  blockedDates: Array<string>; // YYYY-MM-DD
}

// Keys for localStorage
const KEYS = {
  CLIENTS: 'podo_clients',
  SERVICES: 'podo_services',
  BOOKINGS: 'podo_bookings',
  PAYMENTS: 'podo_payments',
  AUDIT_LOGS: 'podo_audit_logs',
  SETTINGS: 'podo_settings',
  LOGGED_USER: 'podo_logged_user',
};

// Initial services seed data
const INITIAL_SERVICES: Service[] = [
  {
    id: 's1',
    name: 'Avaliação Podológica',
    description: 'Exame clínico detalhado para diagnóstico de patologias dos pés e indicação do melhor tratamento.',
    duration: 30,
    price: 80.00,
    active: true
  },
  {
    id: 's2',
    name: 'Tratamento de Calosidade',
    description: 'Remoção de hiperqueratose (calos e calosidades) com desbastamento e hidratação profunda.',
    duration: 45,
    price: 120.00,
    active: true
  },
  {
    id: 's3',
    name: 'Tratamento de Unha Encravada',
    description: 'Procedimento técnico de espiculotomia para alívio e tratamento de onicocriptose inflamada.',
    duration: 50,
    price: 140.00,
    active: true
  },
  {
    id: 's4',
    name: 'Tratamento de Micose (Laserterapia)',
    description: 'Aplicação de laser terapêutico para eliminação de fungos causadores de onicomicose.',
    duration: 30,
    price: 110.00,
    active: true
  },
  {
    id: 's5',
    name: 'Reflexologia Podal',
    description: 'Massagem relaxante e terapêutica aplicada em pontos específicos dos pés que estimulam a saúde geral.',
    duration: 40,
    price: 100.00,
    active: true
  },
  {
    id: 's6',
    name: 'Podologia Preventiva',
    description: 'Corte correto das unhas, limpeza de sulcos, lixamento e hidratação preventiva para a saúde diária.',
    duration: 45,
    price: 130.00,
    active: true
  },
  {
    id: 's7',
    name: 'Atendimento Domiciliar',
    description: 'Atendimento podológico completo com equipamentos portáteis no conforto da residência do paciente.',
    duration: 60,
    price: 200.00,
    active: true
  }
];

// Initial settings seed data
const INITIAL_SETTINGS: Settings = {
  businessHours: {
    open: '08:00',
    close: '18:00'
  },
  holidays: [
    { date: '2026-01-01', name: 'Ano Novo' },
    { date: '2026-04-21', name: 'Tiradentes' },
    { date: '2026-05-01', name: 'Dia do Trabalho' },
    { date: '2026-09-07', name: 'Independência do Brasil' },
    { date: '2026-10-12', name: 'Nossa Senhora Aparecida' },
    { date: '2026-11-02', name: 'Finados' },
    { date: '2026-11-15', name: 'Proclamação da República' },
    { date: '2026-12-25', name: 'Natal' }
  ],
  blockedDates: []
};

// Initial clients seed data
const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Ana Silva Santos',
    cpf: '123.456.789-00',
    email: 'ana.silva@email.com',
    phone: '(11) 98888-7777',
    whatsapp: '(11) 98888-7777',
    birthDate: '1988-04-12',
    sex: 'Feminino',
    address: {
      cep: '01310-100',
      street: 'Avenida Paulista',
      number: '1000',
      complement: 'Apto 42',
      city: 'São Paulo',
      state: 'SP'
    },
    active: true,
    createdAt: '2026-05-01T10:00:00Z'
  },
  {
    id: 'c2',
    name: 'Carlos Oliveira Costa',
    cpf: '234.567.890-11',
    email: 'carlos.costa@email.com',
    phone: '(11) 97777-6666',
    whatsapp: '(11) 97777-6666',
    birthDate: '1975-08-25',
    sex: 'Masculino',
    address: {
      cep: '04571-010',
      street: 'Rua Berrini',
      number: '500',
      city: 'São Paulo',
      state: 'SP'
    },
    active: true,
    createdAt: '2026-05-15T14:30:00Z'
  },
  {
    id: 'c3',
    name: 'Mariana Lima Azevedo',
    cpf: '345.678.901-22',
    email: 'mari.lima@email.com',
    phone: '(11) 96666-5555',
    whatsapp: '(11) 96666-5555',
    birthDate: '1995-11-03',
    sex: 'Feminino',
    address: {
      cep: '05407-002',
      street: 'Rua Pinheiros',
      number: '120',
      complement: 'Bloco B',
      city: 'São Paulo',
      state: 'SP'
    },
    active: false, // Bloqueada para demonstração
    createdAt: '2026-05-20T11:15:00Z'
  }
];

// Helper to generate dates around today
const getRelativeDateString = (offsetDays: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
};

// Initial bookings & payments seed data
const getInitialBookingsAndPayments = () => {
  const bookings: Booking[] = [
    {
      id: 'b1',
      clientId: 'c1',
      serviceId: 's1', // Avaliação
      date: getRelativeDateString(-5), // 5 days ago
      time: '09:00',
      isFirstConsultation: true,
      hasDiabetes: false,
      hasCirculatoryProblems: false,
      hasAllergies: false,
      status: 'Finalizado',
      paymentId: 'p1',
      createdAt: '2026-06-01T10:00:00Z'
    },
    {
      id: 'b2',
      clientId: 'c1',
      serviceId: 's3', // Unha encravada
      date: getRelativeDateString(1), // Tomorrow
      time: '10:00',
      isFirstConsultation: false,
      hasDiabetes: false,
      hasCirculatoryProblems: false,
      hasAllergies: false,
      status: 'Aprovado',
      paymentId: 'p2',
      createdAt: '2026-06-09T16:00:00Z'
    },
    {
      id: 'b3',
      clientId: 'c2',
      serviceId: 's2', // Calosidade
      date: getRelativeDateString(0), // Today
      time: '14:00',
      isFirstConsultation: true,
      hasDiabetes: true, // Paciente diabético
      hasCirculatoryProblems: true,
      hasAllergies: true,
      allergiesDescription: 'Alergia a iodo',
      observations: 'Paciente relata dor no calcanhar direito.',
      status: 'Aprovado',
      paymentId: 'p3',
      createdAt: '2026-06-10T11:00:00Z'
    },
    {
      id: 'b4',
      clientId: 'c3',
      serviceId: 's6', // Preventiva
      date: getRelativeDateString(3), // 3 days from now
      time: '15:00',
      isFirstConsultation: false,
      hasDiabetes: false,
      hasCirculatoryProblems: false,
      hasAllergies: false,
      status: 'Pendente', // Pendente de pagamento (exemplo de fluxo incompleto ou aguardando)
      paymentId: 'p4',
      createdAt: '2026-06-11T08:00:00Z'
    },
    {
      id: 'b5',
      clientId: 'c2',
      serviceId: 's5', // Reflexologia
      date: getRelativeDateString(-2), // 2 days ago
      time: '16:00',
      isFirstConsultation: false,
      hasDiabetes: false,
      hasCirculatoryProblems: false,
      hasAllergies: false,
      status: 'Cancelado',
      paymentId: 'p5',
      createdAt: '2026-06-05T09:00:00Z'
    }
  ];

  const payments: Payment[] = [
    {
      id: 'p1',
      bookingId: 'b1',
      clientId: 'c1',
      type: 'DEBIT_CARD',
      status: 'Aprovado',
      value: 80.00,
      transactionId: 'TX-89217398',
      createdAt: '2026-06-01T10:05:00Z'
    },
    {
      id: 'p2',
      bookingId: 'b2',
      clientId: 'c1',
      type: 'PIX',
      status: 'Aprovado',
      value: 140.00,
      transactionId: 'TX-99017263',
      createdAt: '2026-06-09T16:02:00Z'
    },
    {
      id: 'p3',
      bookingId: 'b3',
      clientId: 'c2',
      type: 'CREDIT_CARD',
      status: 'Aprovado',
      value: 120.00,
      transactionId: 'TX-77881263',
      createdAt: '2026-06-10T11:04:00Z'
    },
    {
      id: 'p4',
      bookingId: 'b4',
      clientId: 'c3',
      type: 'PIX',
      status: 'Pendente',
      value: 130.00,
      transactionId: 'TX-23423455',
      createdAt: '2026-06-11T08:00:00Z'
    },
    {
      id: 'p5',
      bookingId: 'b5',
      clientId: 'c2',
      type: 'PIX',
      status: 'Reembolsado',
      value: 100.00,
      transactionId: 'TX-12938172',
      createdAt: '2026-06-05T09:02:00Z'
    }
  ];

  return { bookings, payments };
};

// Initial audit logs
const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'l1',
    userId: 'admin',
    userName: 'Dr. Roberto Podólogo (Adm)',
    userRole: 'Admin',
    action: 'LOGIN',
    details: 'Administrador efetuou login no painel.',
    timestamp: '2026-06-11T08:00:00Z'
  },
  {
    id: 'l2',
    userId: 'c1',
    userName: 'Ana Silva Santos',
    userRole: 'Client',
    action: 'BOOKING_CREATE',
    details: 'Novo agendamento criado (b2) para o serviço Tratamento de Unha Encravada no valor de R$ 140,00.',
    timestamp: '2026-06-09T16:00:00Z'
  },
  {
    id: 'l3',
    userId: 'c1',
    userName: 'Ana Silva Santos',
    userRole: 'Client',
    action: 'PAYMENT_CONFIRM',
    details: 'Pagamento via PIX aprovado para o agendamento b2 (Transação TX-99017263).',
    timestamp: '2026-06-09T16:02:00Z'
  },
  {
    id: 'l4',
    userId: 'admin',
    userName: 'Dr. Roberto Podólogo (Adm)',
    userRole: 'Admin',
    action: 'CLIENT_STATUS_CHANGE',
    details: 'Status da cliente Mariana Lima Azevedo (c3) alterado para INATIVO.',
    timestamp: '2026-06-10T10:15:00Z'
  },
  {
    id: 'l5',
    userId: 'admin',
    userName: 'Dr. Roberto Podólogo (Adm)',
    userRole: 'Admin',
    action: 'BOOKING_UPDATE',
    details: 'Status do agendamento b1 de Ana Silva Santos alterado para FINALIZADO após a consulta.',
    timestamp: '2026-06-06T09:45:00Z'
  }
];

// Initialize database in localStorage
export const initDB = () => {
  if (!localStorage.getItem(KEYS.SERVICES)) {
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
  }
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  }
  if (!localStorage.getItem(KEYS.CLIENTS)) {
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
  }
  
  const { bookings, payments } = getInitialBookingsAndPayments();
  
  if (!localStorage.getItem(KEYS.BOOKINGS)) {
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings));
  }
  if (!localStorage.getItem(KEYS.PAYMENTS)) {
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(payments));
  }
  if (!localStorage.getItem(KEYS.AUDIT_LOGS)) {
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  }
};

// Database queries & helpers
export const db = {
  // Services
  getServices: (): Service[] => {
    initDB();
    return JSON.parse(localStorage.getItem(KEYS.SERVICES) || '[]');
  },
  saveService: (service: Service): Service => {
    const services = db.getServices();
    const index = services.findIndex(s => s.id === service.id);
    if (index >= 0) {
      services[index] = service;
    } else {
      services.push(service);
    }
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(services));
    return service;
  },

  // Clients
  getClients: (): Client[] => {
    initDB();
    return JSON.parse(localStorage.getItem(KEYS.CLIENTS) || '[]');
  },
  getClientById: (id: string): Client | undefined => {
    return db.getClients().find(c => c.id === id);
  },
  getClientByCpf: (cpf: string): Client | undefined => {
    const normalizedCpf = cpf.replace(/\D/g, '');
    return db.getClients().find(c => c.cpf.replace(/\D/g, '') === normalizedCpf);
  },
  getClientByEmail: (email: string): Client | undefined => {
    return db.getClients().find(c => c.email.toLowerCase() === email.toLowerCase());
  },
  saveClient: (client: Client): Client => {
    const clients = db.getClients();
    const index = clients.findIndex(c => c.id === client.id);
    if (index >= 0) {
      clients[index] = client;
    } else {
      clients.push(client);
    }
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
    return client;
  },

  // Bookings
  getBookings: (): Booking[] => {
    initDB();
    return JSON.parse(localStorage.getItem(KEYS.BOOKINGS) || '[]');
  },
  getBookingById: (id: string): Booking | undefined => {
    return db.getBookings().find(b => b.id === id);
  },
  getBookingsByClientId: (clientId: string): Booking[] => {
    return db.getBookings().filter(b => b.clientId === clientId);
  },
  saveBooking: (booking: Booking): Booking => {
    const bookings = db.getBookings();
    const index = bookings.findIndex(b => b.id === booking.id);
    if (index >= 0) {
      bookings[index] = booking;
    } else {
      bookings.push(booking);
    }
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings));
    return booking;
  },

  // Payments
  getPayments: (): Payment[] => {
    initDB();
    return JSON.parse(localStorage.getItem(KEYS.PAYMENTS) || '[]');
  },
  getPaymentById: (id: string): Payment | undefined => {
    return db.getPayments().find(p => p.id === id);
  },
  getPaymentsByClientId: (clientId: string): Payment[] => {
    return db.getPayments().filter(p => p.clientId === clientId);
  },
  savePayment: (payment: Payment): Payment => {
    const payments = db.getPayments();
    const index = payments.findIndex(p => p.id === payment.id);
    if (index >= 0) {
      payments[index] = payment;
    } else {
      payments.push(payment);
    }
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(payments));
    return payment;
  },

  // Settings
  getSettings: (): Settings => {
    initDB();
    return JSON.parse(localStorage.getItem(KEYS.SETTINGS) || JSON.stringify(INITIAL_SETTINGS));
  },
  saveSettings: (settings: Settings): Settings => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    return settings;
  },

  // Audit Logs
  getAuditLogs: (): AuditLog[] => {
    initDB();
    return JSON.parse(localStorage.getItem(KEYS.AUDIT_LOGS) || '[]');
  },
  addAuditLog: (userId: string, userName: string, role: 'Client' | 'Admin', action: string, details: string): AuditLog => {
    const logs = db.getAuditLogs();
    const log: AuditLog = {
      id: 'l' + (Date.now() + Math.floor(Math.random() * 1000)),
      userId,
      userName,
      userRole: role,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    logs.unshift(log); // Add to the top
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 1000))); // Keep last 1000 logs
    return log;
  },

  // Session Management (Mock Auth cookies/JWT)
  getLoggedUser: (): { client?: Client; admin?: boolean } | null => {
    const data = localStorage.getItem(KEYS.LOGGED_USER);
    if (!data) return null;
    return JSON.parse(data);
  },
  setLoggedUser: (user: { client?: Client; admin?: boolean } | null) => {
    if (user) {
      localStorage.setItem(KEYS.LOGGED_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.LOGGED_USER);
    }
  }
};
