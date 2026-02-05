'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

// Converte dd/mm/yyyy para yyyy-mm-dd
const formatToISO = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return dateStr;
};

// Converte yyyy-mm-dd para dd/mm/yyyy
const formatToBR = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

export const DateInput: React.FC<DateInputProps> = ({ 
  label, 
  value, 
  onChange, 
  name, 
  error, 
  required,
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    // Se o valor vem no formato ISO (yyyy-mm-dd), converte para BR
    if (value && value.includes('-')) {
      setDisplayValue(formatToBR(value));
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Remove tudo que não é número
    inputValue = inputValue.replace(/\D/g, '');
    
    // Formata dd/mm/yyyy
    if (inputValue.length >= 2) {
      inputValue = inputValue.substring(0, 2) + '/' + inputValue.substring(2);
    }
    if (inputValue.length >= 5) {
      inputValue = inputValue.substring(0, 5) + '/' + inputValue.substring(5, 9);
    }
    
    setDisplayValue(inputValue);
    
    // Se a data está completa (dd/mm/yyyy), valida e envia no formato ISO
    if (inputValue.length === 10) {
      const [day, month, year] = inputValue.split('/');
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      
      // Validação básica
      if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900) {
        const isoDate = formatToISO(inputValue);
        onChange(isoDate);
      }
    } else if (inputValue === '') {
      onChange('');
    }
  };

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoDate = e.target.value;
    setDisplayValue(formatToBR(isoDate));
    onChange(isoDate);
    setShowPicker(false);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && '*'}
      </label>
      <div className="relative">
        <input
          type="text"
          name={name}
          value={displayValue}
          onChange={handleInputChange}
          placeholder="dd/mm/yyyy"
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          maxLength={10}
          required={required}
        />
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <Calendar size={20} />
        </button>
        
        {showPicker && (
          <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2">
            <input
              type="date"
              value={value && value.includes('-') ? value : formatToISO(displayValue)}
              onChange={handleDatePickerChange}
              className="border-0 focus:ring-0"
            />
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
