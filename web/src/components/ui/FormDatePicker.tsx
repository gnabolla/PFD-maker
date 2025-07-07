import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { Controller, Control } from 'react-hook-form';
import { FiCalendar, FiAlertCircle } from 'react-icons/fi';
import { format, parse, isValid } from 'date-fns';
import clsx from 'clsx';
import 'react-datepicker/dist/react-datepicker.css';

interface FormDatePickerProps {
  name: string;
  control: Control<any>;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  placeholder?: string;
}

export const FormDatePicker: React.FC<FormDatePickerProps> = ({
  name,
  control,
  label,
  error,
  hint,
  required,
  minDate,
  maxDate,
  disabled,
  placeholder = 'MM/DD/YYYY',
}) => {
  return (
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const selectedDate = field.value
            ? parse(field.value, 'MM/dd/yyyy', new Date())
            : null;

          return (
            <div className="relative">
              <DatePicker
                id={name}
                selected={isValid(selectedDate) ? selectedDate : null}
                onChange={(date) => {
                  field.onChange(date ? format(date, 'MM/dd/yyyy') : '');
                }}
                dateFormat="MM/dd/yyyy"
                placeholderText={placeholder}
                minDate={minDate}
                maxDate={maxDate}
                disabled={disabled}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                aria-invalid={!!error}
                aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
                className={clsx(
                  'block w-full rounded-md shadow-sm transition-colors duration-200',
                  'px-3 py-2 pr-10 text-gray-900 placeholder-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-offset-0',
                  error
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
                  disabled && 'bg-gray-100 cursor-not-allowed'
                )}
                wrapperClassName="w-full"
              />
              
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                {error ? (
                  <FiAlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                ) : (
                  <FiCalendar className="h-5 w-5 text-gray-400" aria-hidden="true" />
                )}
              </div>
            </div>
          );
        }}
      />

      {(error || hint) && (
        <div className="mt-1">
          {error && (
            <p id={`${name}-error`} className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          {!error && hint && (
            <p id={`${name}-hint`} className="text-sm text-gray-500">
              {hint}
            </p>
          )}
        </div>
      )}
    </div>
  );
};