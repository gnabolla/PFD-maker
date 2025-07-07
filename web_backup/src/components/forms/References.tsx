import React from 'react';
import { useFormContext } from 'react-hook-form';

interface Reference {
  name: string;
  address: string;
  telephoneNumber: string;
}

const References: React.FC = () => {
  const { register, formState: { errors } } = useFormContext<{ references: Reference[] }>();

  const validateNameFormat = (value: string) => {
    if (!value || value === 'N/A') return true;
    
    // Check if the name follows the format: FIRST NAME, MI, SURNAME
    const namePattern = /^[A-Za-z\s]+,\s*[A-Za-z]\.?,\s*[A-Za-z\s]+$/;
    
    if (!namePattern.test(value)) {
      return 'Name must be in format: FIRST NAME, MI, SURNAME (e.g., Juan, A., Dela Cruz)';
    }
    
    return true;
  };

  return (
    <div className="references-form">
      <h2>X. REFERENCES</h2>
      <p className="form-instruction">
        (Person not related by consanguinity or affinity to applicant/appointee)
      </p>

      {[0, 1, 2].map((index) => (
        <div key={index} className="reference-section">
          <h3>Reference {index + 1}</h3>
          
          <div className="form-group">
            <label htmlFor={`reference-name-${index}`} className="form-label">
              NAME
              <span className="label-format"> (Format: FIRST NAME, MI, SURNAME)</span>
            </label>
            <input
              id={`reference-name-${index}`}
              {...register(`references.${index}.name` as const, {
                required: 'Reference name is required',
                validate: validateNameFormat,
              })}
              className="form-input"
              placeholder="e.g., Juan, A., Dela Cruz"
              defaultValue="N/A"
            />
            {errors.references?.[index]?.name && (
              <span className="error-message">
                {errors.references[index].name?.message}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor={`reference-address-${index}`} className="form-label">
              ADDRESS
            </label>
            <input
              id={`reference-address-${index}`}
              {...register(`references.${index}.address` as const, {
                required: 'Reference address is required',
              })}
              className="form-input"
              placeholder="Complete address"
              defaultValue="N/A"
            />
            {errors.references?.[index]?.address && (
              <span className="error-message">
                {errors.references[index].address?.message}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor={`reference-telephone-${index}`} className="form-label">
              TELEPHONE NUMBER
            </label>
            <input
              id={`reference-telephone-${index}`}
              {...register(`references.${index}.telephoneNumber` as const, {
                required: 'Telephone number is required',
                pattern: {
                  value: /^[0-9\s\-\+\(\)]+$/,
                  message: 'Please enter a valid telephone number',
                },
              })}
              className="form-input"
              placeholder="e.g., +63 2 1234-5678"
              defaultValue="N/A"
            />
            {errors.references?.[index]?.telephoneNumber && (
              <span className="error-message">
                {errors.references[index].telephoneNumber?.message}
              </span>
            )}
          </div>
        </div>
      ))}

      <style jsx>{`
        .references-form {
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        h2 {
          color: #333;
          margin-bottom: 10px;
          font-size: 20px;
          font-weight: bold;
        }

        h3 {
          color: #555;
          margin-bottom: 15px;
          font-size: 16px;
          font-weight: 600;
        }

        .form-instruction {
          font-size: 14px;
          color: #666;
          margin-bottom: 20px;
          font-style: italic;
        }

        .reference-section {
          margin-bottom: 30px;
          padding: 20px;
          background-color: white;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .reference-section:last-child {
          margin-bottom: 0;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 5px;
        }

        .label-format {
          font-size: 12px;
          color: #666;
          font-weight: normal;
          font-style: italic;
        }

        .form-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          transition: border-color 0.3s;
        }

        .form-input:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
        }

        .error-message {
          display: block;
          color: #f44336;
          font-size: 12px;
          margin-top: 5px;
        }
      `}</style>
    </div>
  );
};

export default References;