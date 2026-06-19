import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '../services/db';

interface CalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelectDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const settings = db.getSettings();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getDaysArray = () => {
    const days = [];
    // Pad first days
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    // Month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const isDateBlocked = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Block past dates
    if (date < today) return true;

    // Block weekends (0 = Sunday, 6 = Saturday)
    const day = date.getDay();
    if (day === 0 || day === 6) return true;

    // Block holidays and custom blocked dates from admin
    const dateString = date.toISOString().split('T')[0];
    const isHoliday = settings.holidays.some(h => h.date === dateString);
    const isCustomBlocked = settings.blockedDates.includes(dateString);

    return isHoliday || isCustomBlocked;
  };

  const formatIsoDate = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  };

  const handleDateClick = (date: Date) => {
    if (isDateBlocked(date)) return;
    onSelectDate(formatIsoDate(date));
  };

  const days = getDaysArray();

  return (
    <div className="calendar-card card" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <div className="flex align-center justify-between" style={{ marginBottom: '1.25rem' }}>
        <button onClick={handlePrevMonth} className="btn btn-secondary" style={{ padding: '0.4rem' }}>
          <ChevronLeft size={20} />
        </button>
        <span className="font-semibold text-lg" style={{ fontFamily: 'var(--font-title)' }}>
          {MONTHS_PT[month]} {year}
        </span>
        <button onClick={handleNextMonth} className="btn btn-secondary" style={{ padding: '0.4rem' }}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '8px' }}>
        {WEEKDAYS_PT.map(d => (
          <span key={d} className="font-bold text-sm" style={{ color: 'var(--neutral-muted)', fontSize: '0.75rem' }}>
            {d}
          </span>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
        {days.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} />;
          }

          const dateStr = formatIsoDate(date);
          const isSelected = dateStr === selectedDate;
          const blocked = isDateBlocked(date);

          return (
            <button
              key={dateStr}
              onClick={() => handleDateClick(date)}
              disabled={blocked}
              className="calendar-day-btn"
              style={{
                aspectRatio: '1',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-body)',
                fontWeight: isSelected ? '700' : '500',
                fontSize: '0.9rem',
                cursor: blocked ? 'not-allowed' : 'pointer',
                backgroundColor: isSelected 
                  ? 'var(--primary)' 
                  : blocked 
                    ? '#f1f5f9' 
                    : 'transparent',
                color: isSelected 
                  ? 'white' 
                  : blocked 
                    ? '#cbd5e1' 
                    : 'var(--neutral-dark)',
                border: isSelected ? 'none' : blocked ? 'none' : '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                if (!blocked && !isSelected) {
                  e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                  e.currentTarget.style.borderColor = 'var(--primary-subtle)';
                }
              }}
              onMouseLeave={(e) => {
                if (!blocked && !isSelected) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#f1f5f9';
                }
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      
      <div className="flex gap-2 justify-between" style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--neutral-muted)' }}>
        <div className="flex align-center gap-1">
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></span>
          <span>Selecionado</span>
        </div>
        <div className="flex align-center gap-1">
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', border: '1px solid #cbd5e1', backgroundColor: 'transparent' }}></span>
          <span>Livre</span>
        </div>
        <div className="flex align-center gap-1">
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#cbd5e1' }}></span>
          <span>Bloqueado</span>
        </div>
      </div>
    </div>
  );
};
