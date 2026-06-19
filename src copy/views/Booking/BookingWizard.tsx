import React, { useState } from 'react';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar } from '../../components/Calendar';
import { db } from '../../services/db';
import { 
  ArrowLeft, ArrowRight, Clock, CreditCard, 
  QrCode, CheckCircle, Info, Heart, Copy, Check 
} from 'lucide-react';

interface BookingWizardProps {
  onNavigate: (page: string) => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({ onNavigate }) => {
  const {
    step,
    selectedService,
    selectedDate,
    selectedTime,
    intakeData,
    bookingDetails,
    paymentType,
    isProcessing,
    errorMessage,
    createdTempPassword,
    nextStep,
    prevStep,
    setSelectedService,
    setSelectedDate,
    setSelectedTime,
    setIntakeData,
    setBookingDetails,
    setPaymentType,
    processBookingAndPayment,
    resetBooking,
    getOccupiedTimes
  } = useBooking();

  const { client } = useAuth();
  const services = db.getServices().filter(s => s.active);
  const settings = db.getSettings();

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  // Generate hourly timeslots from settings
  const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    const openH = Number(settings.businessHours.open.split(':')[0]);
    const closeH = Number(settings.businessHours.close.split(':')[0]);
    
    // Simple 1-hour slots for simplicity in selection
    for (let h = openH; h < closeH; h++) {
      // Avoid lunch break slot if needed, e.g. 12:00
      if (h === 12) continue;
      
      const hourStr = h.toString().padStart(2, '0');
      slots.push(`${hourStr}:00`);
      slots.push(`${hourStr}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const occupiedTimes = selectedDate ? getOccupiedTimes(selectedDate) : [];

  // Card fields for mock processing
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleCepBlur = async () => {
    const cleanCep = bookingDetails.cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setBookingDetails(prev => ({
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

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({ ...prev, [name]: value }));
  };

  const copyToClipboard = (text: string, type: 'key' | 'pass') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  const handlePaymentSubmit = async () => {
    if (paymentType !== 'PIX') {
      if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv) {
        alert('Por favor, preencha todos os dados do cartão.');
        return;
      }
    }
    
    await processBookingAndPayment();
  };

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="flex flex-col justify-between" style={{ minHeight: '100vh', backgroundColor: 'var(--neutral-light)' }}>
      {/* Header bar */}
      <nav className="glass" style={{ borderBottom: '1px solid var(--neutral-border)' }}>
        <div className="container flex justify-between align-center" style={{ height: '70px', padding: '0 1.5rem' }}>
          <div className="flex align-center gap-2" style={{ cursor: 'pointer' }} onClick={() => { resetBooking(); onNavigate('landing'); }}>
            <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
              <Heart size={16} fill="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>
              Pé de Anjo
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>
            {step < 6 ? `Etapa ${step} de 5` : 'Concluído'}
          </div>
        </div>
      </nav>

      {/* Progress bar */}
      {step < 6 && (
        <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--neutral-border)' }}>
          <div 
            style={{ 
              width: `${((step - 1) / 4) * 100}%`, 
              height: '100%', 
              backgroundColor: 'var(--primary)', 
              transition: 'width var(--transition-normal)' 
            }} 
          />
        </div>
      )}

      {/* Main Body */}
      <div className="container" style={{ flex: 1, padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: step === 4 ? '800px' : '640px' }}>
          
          {/* Back button (if step > 1 and < 6) */}
          {step > 1 && step < 6 && !isProcessing && (
            <button onClick={prevStep} className="btn-text" style={{ paddingLeft: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
              <ArrowLeft size={16} /> Voltar para Etapa {step - 1}
            </button>
          )}

          {/* Feedback errors */}
          {errorMessage && (
            <div className="badge badge-danger animate-fade-in" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)', textTransform: 'none', fontWeight: 500 }}>
              {errorMessage}
            </div>
          )}

          {/* STEP 1: SERVICE SELECTION */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-center" style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', marginBottom: '0.5rem' }}>Escolha o Serviço</h2>
              <p className="text-center text-muted" style={{ marginBottom: '2.5rem' }}>Selecione o procedimento podológico que deseja agendar.</p>
              
              <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1rem' }}>
                {services.map(s => {
                  const isSelected = selectedService?.id === s.id;
                  return (
                    <div 
                      key={s.id} 
                      onClick={() => setSelectedService(s)}
                      className="card card-hover" 
                      style={{ 
                        cursor: 'pointer',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--neutral-border)',
                        borderWidth: isSelected ? '2px' : '1px',
                        backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--white)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1.25rem'
                      }}
                    >
                      <div style={{ flex: 1, paddingRight: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-title)' }}>{s.name}</h3>
                        <p className="text-muted text-sm" style={{ marginTop: '0.25rem' }}>{s.description}</p>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '100px' }}>
                        <span className="font-bold text-lg" style={{ color: 'var(--primary)' }}>R$ {s.price.toFixed(2)}</span>
                        <span className="text-xs text-muted flex align-center gap-1" style={{ marginTop: '0.25rem' }}>
                          <Clock size={12} /> {s.duration} min
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button onClick={nextStep} className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
                  Avançar <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DATE SELECTION */}
          {step === 2 && (
            <div className="animate-fade-in text-center">
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', marginBottom: '0.5rem' }}>Selecione a Data</h2>
              <p className="text-muted" style={{ marginBottom: '2rem' }}>As consultas ocorrem de segunda a sexta-feira. Finais de semana e feriados são bloqueados.</p>
              
              <Calendar 
                selectedDate={selectedDate} 
                onSelectDate={(date) => { setSelectedDate(date); setSelectedTime(''); }} 
              />

              {selectedDate && (
                <div style={{ marginTop: '1.5rem', color: 'var(--primary)', fontWeight: 600 }}>
                  Data selecionada: {formatDateLabel(selectedDate)}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button onClick={nextStep} className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
                  Escolher Horário <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: TIME SELECTION */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="text-center" style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', marginBottom: '0.5rem' }}>Escolha o Horário</h2>
              <p className="text-center text-muted" style={{ marginBottom: '2rem' }}>Dia selecionado: {formatDateLabel(selectedDate)}</p>
              
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
                {timeSlots.map(time => {
                  const isOccupied = occupiedTimes.includes(time);
                  const isSelected = selectedTime === time;

                  return (
                    <button
                      key={time}
                      disabled={isOccupied}
                      onClick={() => setSelectedTime(time)}
                      className="btn"
                      style={{
                        padding: '0.75rem 0.5rem',
                        fontSize: '0.9rem',
                        backgroundColor: isSelected 
                          ? 'var(--primary)' 
                          : isOccupied 
                            ? '#f1f5f9' 
                            : 'var(--white)',
                        color: isSelected 
                          ? 'white' 
                          : isOccupied 
                            ? '#cbd5e1' 
                            : 'var(--neutral-dark)',
                        borderColor: isSelected 
                          ? 'var(--primary)' 
                          : isOccupied 
                            ? '#e2e8f0' 
                            : 'var(--neutral-border)',
                        cursor: isOccupied ? 'not-allowed' : 'pointer',
                        opacity: isOccupied ? 0.7 : 1
                      }}
                    >
                      {time}
                      {isOccupied && <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600 }}>Ocupado</span>}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button onClick={nextStep} className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
                  Preencher Cadastro <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REGISTRATION & TRIAGE */}
          {step === 4 && (
            <div className="animate-fade-in">
              <h2 className="text-center" style={{ fontFamily: 'var(--font-title)', fontSize: '2.0rem', marginBottom: '0.5rem' }}>Cadastro & Triagem Médica</h2>
              <p className="text-center text-muted" style={{ marginBottom: '2.5rem' }}>Precisamos de seus dados cadastrais e algumas informações de saúde para o prontuário.</p>
              
              <form onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
                {/* Prefilled alert if client logged in */}
                {client && (
                  <div className="badge badge-pending" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)', textTransform: 'none', fontWeight: 500, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Info size={16} />
                    Você está logado como <strong>{client.name}</strong>. Seus dados cadastrais foram preenchidos automaticamente.
                  </div>
                )}

                {/* Cadastral form (enabled only if client is not logged in) */}
                {!client && (
                  <>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', borderBottom: '1px solid var(--neutral-border)', paddingBottom: '0.5rem', marginBottom: '1rem', fontFamily: 'var(--font-title)' }}>Dados Pessoais</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Nome Completo *</label>
                        <input type="text" name="name" className="form-input" required value={bookingDetails.name} onChange={handleDetailsChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CPF *</label>
                        <input type="text" name="cpf" className="form-input" placeholder="123.456.789-00" required value={bookingDetails.cpf} onChange={handleDetailsChange} />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Data de Nascimento *</label>
                        <input type="date" name="birthDate" className="form-input" required value={bookingDetails.birthDate} onChange={handleDetailsChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Sexo *</label>
                        <select name="sex" className="form-input" value={bookingDetails.sex} onChange={handleDetailsChange}>
                          <option value="Feminino">Feminino</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Telefone *</label>
                        <input type="text" name="phone" className="form-input" placeholder="(11) 99999-9999" required value={bookingDetails.phone} onChange={handleDetailsChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">WhatsApp *</label>
                        <input type="text" name="whatsapp" className="form-input" placeholder="(11) 99999-9999" required value={bookingDetails.whatsapp} onChange={handleDetailsChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">E-mail *</label>
                        <input type="email" name="email" className="form-input" placeholder="exemplo@email.com" required value={bookingDetails.email} onChange={handleDetailsChange} />
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', borderBottom: '1px solid var(--neutral-border)', paddingBottom: '0.5rem', marginTop: '1.5rem', marginBottom: '1rem', fontFamily: 'var(--font-title)' }}>Endereço</h3>
                    <div className="form-row" style={{ gridTemplateColumns: '120px 1fr 100px' }}>
                      <div className="form-group">
                        <label className="form-label">CEP *</label>
                        <input type="text" name="cep" className="form-input" placeholder="01310-100" required value={bookingDetails.cep} onChange={handleDetailsChange} onBlur={handleCepBlur} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Logradouro *</label>
                        <input type="text" name="street" className="form-input" required value={bookingDetails.street} onChange={handleDetailsChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Número *</label>
                        <input type="text" name="number" className="form-input" required value={bookingDetails.number} onChange={handleDetailsChange} />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Complemento</label>
                        <input type="text" name="complement" className="form-input" value={bookingDetails.complement} onChange={handleDetailsChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Cidade *</label>
                        <input type="text" name="city" className="form-input" required value={bookingDetails.city} onChange={handleDetailsChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Estado *</label>
                        <input type="text" name="state" className="form-input" maxLength={2} placeholder="SP" required value={bookingDetails.state} onChange={handleDetailsChange} />
                      </div>
                    </div>
                  </>
                )}

                {/* Medical intake questions */}
                <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', borderBottom: '1px solid var(--neutral-border)', paddingBottom: '0.5rem', marginTop: '1.5rem', marginBottom: '1rem', fontFamily: 'var(--font-title)' }}>Triagem de Saúde</h3>
                
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="card flex align-center justify-between" style={{ padding: '0.75rem 1rem' }}>
                    <span className="font-semibold text-sm">Primeira consulta clínica?</span>
                    <input 
                      type="checkbox" 
                      checked={intakeData.isFirstConsultation}
                      onChange={(e) => setIntakeData(prev => ({ ...prev, isFirstConsultation: e.target.checked }))}
                      style={{ width: '20px', height: '20px' }}
                    />
                  </div>

                  <div className="card flex align-center justify-between" style={{ padding: '0.75rem 1rem' }}>
                    <span className="font-semibold text-sm" style={{ color: intakeData.hasDiabetes ? 'var(--danger)' : 'inherit' }}>Possui Diabetes?</span>
                    <input 
                      type="checkbox" 
                      checked={intakeData.hasDiabetes}
                      onChange={(e) => setIntakeData(prev => ({ ...prev, hasDiabetes: e.target.checked }))}
                      style={{ width: '20px', height: '20px' }}
                    />
                  </div>

                  <div className="card flex align-center justify-between" style={{ padding: '0.75rem 1rem' }}>
                    <span className="font-semibold text-sm">Problemas circulatórios?</span>
                    <input 
                      type="checkbox" 
                      checked={intakeData.hasCirculatoryProblems}
                      onChange={(e) => setIntakeData(prev => ({ ...prev, hasCirculatoryProblems: e.target.checked }))}
                      style={{ width: '20px', height: '20px' }}
                    />
                  </div>

                  <div className="card flex align-center justify-between" style={{ padding: '0.75rem 1rem' }}>
                    <span className="font-semibold text-sm">Possui alergias?</span>
                    <input 
                      type="checkbox" 
                      checked={intakeData.hasAllergies}
                      onChange={(e) => setIntakeData(prev => ({ ...prev, hasAllergies: e.target.checked }))}
                      style={{ width: '20px', height: '20px' }}
                    />
                  </div>
                </div>

                {intakeData.hasAllergies && (
                  <div className="form-group animate-fade-in">
                    <label className="form-label">Descreva suas alergias (Remédios, iodo, etc.) *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={intakeData.allergiesDescription}
                      onChange={(e) => setIntakeData(prev => ({ ...prev, allergiesDescription: e.target.value }))}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Observações adicionais ou sintomas sentidos</label>
                  <textarea 
                    className="form-input" 
                    rows={3} 
                    value={intakeData.observations}
                    onChange={(e) => setIntakeData(prev => ({ ...prev, observations: e.target.value }))}
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
                    Escolher Pagamento <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 5: PAYMENT */}
          {step === 5 && (
            <div className="animate-fade-in">
              <h2 className="text-center" style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', marginBottom: '0.5rem' }}>Pagamento Obrigatório</h2>
              <p className="text-center text-muted" style={{ marginBottom: '2.5rem' }}>Realize o pagamento para confirmar o seu horário e finalizar o agendamento.</p>
              
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'start' }}>
                
                {/* Left side: Booking Summary */}
                <div className="card" style={{ border: '1px solid var(--primary-subtle)', backgroundColor: 'var(--primary-light)' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--primary-subtle)', paddingBottom: '0.5rem', fontFamily: 'var(--font-title)' }}>Resumo do Agendamento</h3>
                  
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                    <li className="flex justify-between">
                      <span className="text-muted">Serviço:</span>
                      <strong className="text-neutral-dark">{selectedService?.name}</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted">Data:</span>
                      <strong className="text-neutral-dark">{formatDateLabel(selectedDate)}</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted">Horário:</span>
                      <strong className="text-neutral-dark">{selectedTime}</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted">Duração:</span>
                      <strong className="text-neutral-dark">{selectedService?.duration} min</strong>
                    </li>
                    <li className="flex justify-between" style={{ borderTop: '1px dashed var(--primary-subtle)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                      <span className="text-muted font-bold">Total a pagar:</span>
                      <strong className="text-lg" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>R$ {selectedService?.price.toFixed(2)}</strong>
                    </li>
                  </ul>
                </div>

                {/* Right side: Payment form */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setPaymentType('PIX')}
                      className="btn" 
                      style={{ 
                        flex: 1, 
                        fontSize: '0.85rem',
                        backgroundColor: paymentType === 'PIX' ? 'var(--primary-light)' : 'transparent',
                        borderColor: paymentType === 'PIX' ? 'var(--primary)' : 'var(--neutral-border)'
                      }}
                    >
                      <QrCode size={16} /> PIX (Desconto)
                    </button>
                    <button 
                      onClick={() => setPaymentType('CREDIT_CARD')}
                      className="btn"
                      style={{ 
                        flex: 1, 
                        fontSize: '0.85rem',
                        backgroundColor: paymentType === 'CREDIT_CARD' ? 'var(--primary-light)' : 'transparent',
                        borderColor: paymentType === 'CREDIT_CARD' ? 'var(--primary)' : 'var(--neutral-border)'
                      }}
                    >
                      <CreditCard size={16} /> Cartão Crédito
                    </button>
                  </div>

                  {isProcessing ? (
                    <div className="text-center" style={{ padding: '2rem 0' }}>
                      <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }}></div>
                      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                      <h4 style={{ fontSize: '0.95rem' }}>Processando transação...</h4>
                      <p className="text-sm text-muted">Aguardando aprovação do gateway de pagamento.</p>
                    </div>
                  ) : (
                    <>
                      {paymentType === 'PIX' && (
                        <div className="animate-fade-in text-center flex flex-col align-center gap-2">
                          <div style={{ padding: '1rem', backgroundColor: 'var(--neutral-light)', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'center' }}>
                            {/* Mock QR Code in SVG */}
                            <svg width="150" height="150" viewBox="0 0 100 100" style={{ shapeRendering: 'crispEdges' }}>
                              <rect width="100" height="100" fill="white"/>
                              {/* Draw mock qr squares */}
                              <rect x="5" y="5" width="25" height="25" fill="black"/>
                              <rect x="10" y="10" width="15" height="15" fill="white"/>
                              <rect x="12" y="12" width="11" height="11" fill="black"/>
                              
                              <rect x="70" y="5" width="25" height="25" fill="black"/>
                              <rect x="75" y="10" width="15" height="15" fill="white"/>
                              <rect x="77" y="12" width="11" height="11" fill="black"/>
                              
                              <rect x="5" y="70" width="25" height="25" fill="black"/>
                              <rect x="10" y="75" width="15" height="15" fill="white"/>
                              <rect x="12" y="77" width="11" height="11" fill="black"/>

                              <rect x="40" y="40" width="20" height="20" fill="black"/>
                              <rect x="45" y="45" width="10" height="10" fill="white"/>
                              
                              <rect x="45" y="10" width="5" height="20" fill="black"/>
                              <rect x="10" y="45" width="20" height="5" fill="black"/>
                              <rect x="70" y="45" width="20" height="5" fill="black"/>
                              <rect x="45" y="70" width="5" height="20" fill="black"/>

                              <rect x="75" y="75" width="10" height="10" fill="black"/>
                            </svg>
                          </div>
                          
                          <span className="text-xs text-muted" style={{ display: 'block', marginTop: '0.25rem' }}>Escaneie o QR Code no app do seu banco.</span>
                          
                          <div style={{ width: '100%', marginTop: '1rem' }}>
                            <label className="form-label" style={{ textAlign: 'left', display: 'block' }}>Chave Copia e Cola:</label>
                            <div className="flex gap-2" style={{ marginTop: '0.25rem' }}>
                              <input 
                                type="text" 
                                className="form-input" 
                                readOnly 
                                value="00020126580014br.gov.bcb.pix0136pedeanjopodologia@pix.com.br"
                                style={{ width: '100%', fontSize: '0.75rem', padding: '0.5rem' }} 
                              />
                              <button 
                                onClick={() => copyToClipboard('00020126580014br.gov.bcb.pix0136pedeanjopodologia@pix.com.br', 'key')}
                                className="btn btn-secondary" 
                                style={{ padding: '0.5rem', display: 'flex', alignItems: 'center' }}
                              >
                                {copiedKey ? <Check size={16} style={{ color: 'var(--success)' }} /> : <Copy size={16} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {paymentType === 'CREDIT_CARD' && (
                        <div className="animate-fade-in flex flex-col gap-2">
                          <div className="form-group">
                            <label className="form-label">Número do Cartão</label>
                            <input 
                              type="text" 
                              name="number" 
                              className="form-input" 
                              placeholder="0000 0000 0000 0000"
                              value={cardDetails.number}
                              onChange={handleCardChange}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Nome Impresso no Cartão</label>
                            <input 
                              type="text" 
                              name="name" 
                              className="form-input" 
                              placeholder="NOME DO TITULAR"
                              value={cardDetails.name}
                              onChange={handleCardChange}
                            />
                          </div>
                          <div className="form-row">
                            <div className="form-group">
                              <label className="form-label">Validade</label>
                              <input 
                                type="text" 
                                name="expiry" 
                                className="form-input" 
                                placeholder="MM/AA"
                                value={cardDetails.expiry}
                                onChange={handleCardChange}
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">CVV</label>
                              <input 
                                type="text" 
                                name="cvv" 
                                className="form-input" 
                                placeholder="123"
                                value={cardDetails.cvv}
                                onChange={handleCardChange}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <button 
                        onClick={handlePaymentSubmit} 
                        className="btn btn-primary" 
                        style={{ width: '100%', padding: '0.8rem', marginTop: '1rem' }}
                      >
                        Confirmar e Pagar R$ {selectedService?.price.toFixed(2)}
                      </button>
                    </>
                  )}

                </div>
              </div>
            </div>
          )}

          {/* STEP 6: SUCCESS / CONFIRMATION */}
          {step === 6 && (
            <div className="animate-fade-in text-center card" style={{ padding: '3rem 2rem', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--success)' }}>
              <div style={{ color: 'var(--success)', display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <CheckCircle size={64} fill="var(--success-light)" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--neutral-dark)' }}>Agendamento Confirmado!</h2>
              <p className="text-muted" style={{ maxWidth: '480px', margin: '0 auto 2rem' }}>
                Seu pagamento foi aprovado pelo gateway e seu horário de atendimento está garantido.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', padding: '1.25rem', backgroundColor: 'var(--neutral-light)', borderRadius: 'var(--radius-lg)', maxWidth: '440px', margin: '0 auto 2rem', textAlign: 'left', fontSize: '0.9rem' }}>
                <div><strong>Serviço:</strong> {selectedService?.name}</div>
                <div><strong>Profissional:</strong> Dr. Roberto Santos</div>
                <div><strong>Data:</strong> {formatDateLabel(selectedDate)} às {selectedTime}</div>
                <div><strong>Local:</strong> Avenida Paulista, 1000 - Pé de Anjo Podologia</div>
              </div>

              {/* Account created notice */}
              {createdTempPassword && (
                <div style={{ border: '1px dashed var(--primary-subtle)', backgroundColor: 'var(--primary-light)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', maxWidth: '440px', margin: '0 auto 2rem', textAlign: 'left' }}>
                  <span className="font-bold text-sm" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>
                    Sua conta foi criada automaticamente!
                  </span>
                  <p className="text-xs text-muted" style={{ marginBottom: '1rem' }}>
                    Enviamos um e-mail de boas-vindas com seus dados. Você já está logado na plataforma. Anote seus acessos para logins futuros:
                  </p>
                  <div className="flex flex-col gap-1 text-sm">
                    <div><strong>Usuário (CPF):</strong> {bookingDetails.cpf}</div>
                    <div className="flex align-center gap-2">
                      <span><strong>Senha Temporária:</strong> <code>{createdTempPassword}</code></span>
                      <button 
                        onClick={() => copyToClipboard(createdTempPassword || '', 'pass')}
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem', display: 'inline-flex', alignItems: 'center' }}
                      >
                        {copiedPass ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-center" style={{ marginTop: '1.5rem' }}>
                <button 
                  onClick={() => { resetBooking(); onNavigate('landing'); }} 
                  className="btn btn-secondary"
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  Voltar para Home
                </button>
                <button 
                  onClick={() => { resetBooking(); onNavigate('client-panel'); }} 
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  Ir para Painel do Cliente
                </button>
              </div>
            </div>
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
