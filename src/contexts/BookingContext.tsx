import React, { createContext, useContext, useState, useEffect } from 'react';
import { Service, Booking, Payment, Client, db, PaymentType } from '../services/db';
import { useAuth } from './AuthContext';

export interface IntakeData {
  isFirstConsultation: boolean;
  hasDiabetes: boolean;
  hasCirculatoryProblems: boolean;
  hasAllergies: boolean;
  allergiesDescription: string;
  observations: string;
}

export interface BookingDetails {
  name: string;
  cpf: string;
  birthDate: string;
  sex: 'Masculino' | 'Feminino' | 'Outro';
  phone: string;
  whatsapp: string;
  email: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  city: string;
  state: string;
}

interface BookingContextType {
  step: number;
  selectedService: Service | null;
  selectedDate: string;
  selectedTime: string;
  intakeData: IntakeData;
  bookingDetails: BookingDetails;
  paymentType: PaymentType;
  isProcessing: boolean;
  errorMessage: string | null;
  createdBookingId: string | null;
  createdTempPassword: string | null;
  createdClientAccount: Client | null;
  
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  setSelectedService: (service: Service | null) => void;
  setSelectedDate: (date: string) => void;
  setSelectedTime: (time: string) => void;
  setIntakeData: React.Dispatch<React.SetStateAction<IntakeData>>;
  setBookingDetails: React.Dispatch<React.SetStateAction<BookingDetails>>;
  setPaymentType: (type: PaymentType) => void;
  processBookingAndPayment: () => Promise<{ success: boolean; error?: string }>;
  resetBooking: () => void;
  getOccupiedTimes: (date: string) => string[];
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const initialIntake: IntakeData = {
  isFirstConsultation: true,
  hasDiabetes: false,
  hasCirculatoryProblems: false,
  hasAllergies: false,
  allergiesDescription: '',
  observations: '',
};

const initialDetails: BookingDetails = {
  name: '',
  cpf: '',
  birthDate: '',
  sex: 'Feminino',
  phone: '',
  whatsapp: '',
  email: '',
  cep: '',
  street: '',
  number: '',
  complement: '',
  city: '',
  state: '',
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { client, login } = useAuth();
  
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [intakeData, setIntakeData] = useState<IntakeData>(initialIntake);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>(initialDetails);
  const [paymentType, setPaymentTypeState] = useState<PaymentType>('PIX');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [createdTempPassword, setCreatedTempPassword] = useState<string | null>(null);
  const [createdClientAccount, setCreatedClientAccount] = useState<Client | null>(null);

  // If user is already logged in, prefill their details
  useEffect(() => {
    if (client) {
      setBookingDetails({
        name: client.name,
        cpf: client.cpf,
        birthDate: client.birthDate,
        sex: client.sex,
        phone: client.phone,
        whatsapp: client.whatsapp,
        email: client.email,
        cep: client.address.cep,
        street: client.address.street,
        number: client.address.number,
        complement: client.address.complement || '',
        city: client.address.city,
        state: client.address.state,
      });
    } else {
      setBookingDetails(initialDetails);
    }
  }, [client]);

  const setPaymentType = (type: PaymentType) => {
    setPaymentTypeState(type);
  };

  const nextStep = () => {
    setErrorMessage(null);
    
    // Step-specific validation
    if (step === 1 && !selectedService) {
      setErrorMessage('Por favor, selecione um serviço.');
      return;
    }
    if (step === 2 && !selectedDate) {
      setErrorMessage('Por favor, selecione uma data.');
      return;
    }
    if (step === 3 && !selectedTime) {
      setErrorMessage('Por favor, selecione um horário.');
      return;
    }
    if (step === 4) {
      // Validate details
      const { name, cpf, phone, email, street, number, city, state } = bookingDetails;
      if (!name || !cpf || !phone || !email || !street || !number || !city || !state) {
        setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      
      // Basic Email Validation
      if (!email.includes('@') || !email.includes('.')) {
        setErrorMessage('Por favor, insira um e-mail válido.');
        return;
      }

      // CPF uniqueness check (only if client is not logged in)
      if (!client) {
        const normalizedCpf = cpf.replace(/\D/g, '');
        const clientFound = db.getClientByCpf(normalizedCpf);
        if (clientFound) {
          setErrorMessage('Já existe uma conta cadastrada com este CPF. Por favor, faça login para agendar.');
          return;
        }
        
        const emailFound = db.getClientByEmail(email);
        if (emailFound) {
          setErrorMessage('Este e-mail já está em uso por outra conta. Faça login para agendar.');
          return;
        }
      }
    }
    
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setErrorMessage(null);
    setStep(prev => Math.max(1, prev - 1));
  };

  const getOccupiedTimes = (date: string): string[] => {
    return db.getBookings()
      .filter(b => b.date === date && b.status !== 'Cancelado' && b.status !== 'Reembolsado')
      .map(b => b.time);
  };

  const processBookingAndPayment = async (): Promise<{ success: boolean; error?: string }> => {
    if (!selectedService || !selectedDate || !selectedTime) {
      return { success: false, error: 'Dados do agendamento incompletos.' };
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Simulate Payment Processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      let bookingUser: Client;
      let tempPasswordGenerated: string | null = null;
      let accountCreatedOnTheFly = false;

      // 1. Account Creation (if not logged in)
      if (!client) {
        // Double check CPF uniqueness in database before creating
        const normalizedCpf = bookingDetails.cpf.replace(/\D/g, '');
        const clientFound = db.getClientByCpf(normalizedCpf);
        if (clientFound) {
          throw new Error('CPF já cadastrado. Por favor, realize o login.');
        }

        // Generate temporary password
        tempPasswordGenerated = 'Podo' + Math.floor(1000 + Math.random() * 9000);
        
        const newClient: Client = {
          id: 'c' + Date.now(),
          name: bookingDetails.name,
          cpf: bookingDetails.cpf,
          email: bookingDetails.email,
          phone: bookingDetails.phone,
          whatsapp: bookingDetails.whatsapp,
          birthDate: bookingDetails.birthDate,
          sex: bookingDetails.sex,
          address: {
            cep: bookingDetails.cep,
            street: bookingDetails.street,
            number: bookingDetails.number,
            complement: bookingDetails.complement,
            city: bookingDetails.city,
            state: bookingDetails.state,
          },
          active: true,
          createdAt: new Date().toISOString()
        };

        db.saveClient(newClient);
        db.addAuditLog(
          newClient.id, 
          newClient.name, 
          'Client', 
          'AUTO_REGISTER', 
          `Conta criada automaticamente no fluxo de agendamento. Senha temporária: ${tempPasswordGenerated}`
        );
        
        bookingUser = newClient;
        accountCreatedOnTheFly = true;
        setCreatedTempPassword(tempPasswordGenerated);
        setCreatedClientAccount(newClient);
      } else {
        bookingUser = client;
      }

      // 2. Generate Booking
      const bookingId = 'b' + Date.now();
      const paymentId = 'p' + (Date.now() + 1);

      const newBooking: Booking = {
        id: bookingId,
        clientId: bookingUser.id,
        serviceId: selectedService.id,
        date: selectedDate,
        time: selectedTime,
        isFirstConsultation: intakeData.isFirstConsultation,
        hasDiabetes: intakeData.hasDiabetes,
        hasCirculatoryProblems: intakeData.hasCirculatoryProblems,
        hasAllergies: intakeData.hasAllergies,
        allergiesDescription: intakeData.allergiesDescription,
        observations: intakeData.observations,
        status: 'Aprovado', // Payment Approved automatically in simulation
        paymentId: paymentId,
        createdAt: new Date().toISOString()
      };

      // 3. Generate Payment
      const newPayment: Payment = {
        id: paymentId,
        bookingId: bookingId,
        clientId: bookingUser.id,
        type: paymentType,
        status: 'Aprovado',
        value: selectedService.price,
        transactionId: 'TX-' + Math.floor(10000000 + Math.random() * 90000000),
        createdAt: new Date().toISOString()
      };

      // Save to database
      db.saveBooking(newBooking);
      db.savePayment(newPayment);
      
      // Audit log
      db.addAuditLog(
        bookingUser.id, 
        bookingUser.name, 
        'Client', 
        'BOOKING_CREATE', 
        `Agendamento ${bookingId} criado e pago com sucesso (R$ ${selectedService.price.toFixed(2)} via ${paymentType}).`
      );

      // If they just registered, automatically log them in
      if (accountCreatedOnTheFly) {
        db.setLoggedUser({ client: bookingUser });
        // Simulates logging in in memory too
        // We login using credentials: CPF & tempPassword in memory
        login(bookingUser.cpf, tempPasswordGenerated || '');
      }

      setCreatedBookingId(bookingId);
      setStep(6); // Go to Success Step
      setIsProcessing(false);
      return { success: true };

    } catch (err: any) {
      setIsProcessing(false);
      const errMessage = err.message || 'Houve um erro no processamento do agendamento.';
      setErrorMessage(errMessage);
      return { success: false, error: errMessage };
    }
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
    setIntakeData(initialIntake);
    setPaymentTypeState('PIX');
    setErrorMessage(null);
    setCreatedBookingId(null);
    setCreatedTempPassword(null);
    setCreatedClientAccount(null);
  };

  return (
    <BookingContext.Provider
      value={{
        step,
        selectedService,
        selectedDate,
        selectedTime,
        intakeData,
        bookingDetails,
        paymentType,
        isProcessing,
        errorMessage,
        createdBookingId,
        createdTempPassword,
        createdClientAccount,
        nextStep,
        prevStep,
        setStep,
        setSelectedService,
        setSelectedDate,
        setSelectedTime,
        setIntakeData,
        setBookingDetails,
        setPaymentType,
        processBookingAndPayment,
        resetBooking,
        getOccupiedTimes,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking deve ser usado dentro de um BookingProvider');
  }
  return context;
};
