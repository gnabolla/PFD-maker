import React from 'react';
import { useFieldArray, UseFormRegister, Control, FieldErrors } from 'react-hook-form';
import { VoluntaryWork as VoluntaryWorkType } from '../../../../api/src/models/pds';

interface VoluntaryWorkFormProps {
  register: UseFormRegister<any>;
  control: Control<any>;
  errors: FieldErrors;
}

export const VoluntaryWorkForm: React.FC<VoluntaryWorkFormProps> = ({
  register,
  control,
  errors
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'voluntaryWork'
  });

  const addVoluntaryWork = () => {
    append({
      nameAndAddressOfOrganization: '',
      inclusiveDates: {
        from: '',
        to: ''
      },
      numberOfHours: '',
      positionNatureOfWork: ''
    });
  };

  const formatDateInput = (value: string) => {
    // Remove non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Format as MM/DD/YYYY
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
    }
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  const validateNoAbbreviations = (value: string) => {
    // Check for common abbreviations in organization names
    const abbreviations = /\b(ORG|ORG\.|ASSOC|ASSOC\.|FOUND|FOUND\.|INC|INC\.|CORP|CORP\.|NGO|CO|CO\.)\b/i;
    if (abbreviations.test(value)) {
      return 'Please write the full name without abbreviations';
    }
    return true;
  };

  return (
    <div className="voluntary-work-form">
      <h3 className="text-lg font-semibold mb-4">VI. VOLUNTARY WORK OR INVOLVEMENT IN CIVIC / NON-GOVERNMENT / PEOPLE / VOLUNTARY ORGANIZATION/S</h3>
      
      {fields.map((field, index) => (
        <div key={field.id} className="border p-4 mb-4 rounded-lg bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Voluntary Work #{index + 1}</h4>
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Remove
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name & Address of Organization (Write in full)
              </label>
              <textarea
                {...register(`voluntaryWork.${index}.nameAndAddressOfOrganization`, {
                  required: 'Organization name and address is required',
                  validate: validateNoAbbreviations
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="Organization Name, Complete Address"
              />
              {errors.voluntaryWork?.[index]?.nameAndAddressOfOrganization && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.voluntaryWork[index].nameAndAddressOfOrganization.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inclusive Dates
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">From (MM/DD/YYYY)</label>
                  <input
                    {...register(`voluntaryWork.${index}.inclusiveDates.from`, {
                      required: 'From date is required',
                      pattern: {
                        value: /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/,
                        message: 'Date must be in MM/DD/YYYY format'
                      }
                    })}
                    onChange={(e) => {
                      e.target.value = formatDateInput(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="MM/DD/YYYY"
                    maxLength={10}
                  />
                  {errors.voluntaryWork?.[index]?.inclusiveDates?.from && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.voluntaryWork[index].inclusiveDates.from.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">To (MM/DD/YYYY)</label>
                  <input
                    {...register(`voluntaryWork.${index}.inclusiveDates.to`, {
                      required: 'To date is required',
                      pattern: {
                        value: /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/,
                        message: 'Date must be in MM/DD/YYYY format'
                      }
                    })}
                    onChange={(e) => {
                      e.target.value = formatDateInput(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="MM/DD/YYYY"
                    maxLength={10}
                  />
                  {errors.voluntaryWork?.[index]?.inclusiveDates?.to && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.voluntaryWork[index].inclusiveDates.to.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Hours
                </label>
                <input
                  {...register(`voluntaryWork.${index}.numberOfHours`, {
                    required: 'Number of hours is required',
                    pattern: {
                      value: /^\d+$/,
                      message: 'Must be a valid number'
                    },
                    min: {
                      value: 1,
                      message: 'Must be at least 1 hour'
                    }
                  })}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 40"
                />
                {errors.voluntaryWork?.[index]?.numberOfHours && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.voluntaryWork[index].numberOfHours.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position / Nature of Work
                </label>
                <input
                  {...register(`voluntaryWork.${index}.positionNatureOfWork`, {
                    required: 'Position/Nature of work is required'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Volunteer Teacher"
                />
                {errors.voluntaryWork?.[index]?.positionNatureOfWork && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.voluntaryWork[index].positionNatureOfWork.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addVoluntaryWork}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Add Voluntary Work
      </button>

      {fields.length === 0 && (
        <p className="text-gray-500 text-sm mt-4 italic">
          No voluntary work added yet. Click "Add Voluntary Work" to add an entry.
        </p>
      )}
    </div>
  );
};

export default VoluntaryWorkForm;