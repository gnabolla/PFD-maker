import React, { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormDatePicker,
  FormRadioGroup,
  FormCheckbox,
  ErrorMessage,
  ValidationSummary,
  Tooltip,
  StepIndicator,
  FormProgress,
  MobileStepIndicator,
  MobileFormNavigation,
  PDSPreview,
  PrintButton,
  SkipLink,
  FocusTrap,
  HighContrastToggle,
} from '../components/ui';
import { ValidationError, PDS } from '../types';

const UIShowcase: React.FC = () => {
  const { register, control, formState: { errors }, handleSubmit } = useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [formProgress, setFormProgress] = useState(25);
  const [showFocusTrap, setShowFocusTrap] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const steps = [
    { id: 'personal', name: 'Personal Info', description: 'Basic information' },
    { id: 'address', name: 'Address', description: 'Residential details' },
    { id: 'contact', name: 'Contact', description: 'Contact information' },
    { id: 'review', name: 'Review', description: 'Review and submit' },
  ];

  const validationErrors: ValidationError[] = [
    {
      field: 'firstName',
      code: 'INVALID_FORMAT',
      message: 'First name must be in FULL UPPERCASE',
      suggestion: 'Change "john" to "JOHN"',
    },
    {
      field: 'dateOfBirth',
      code: 'INVALID_DATE',
      message: 'Date must be in MM/DD/YYYY format',
      suggestion: 'Use format like 01/15/1990',
    },
  ];

  const mockPDS: PDS = {
    id: '1',
    userId: '1',
    status: 'draft',
    personalInfo: {
      firstName: 'JUAN',
      lastName: 'DELA CRUZ',
      middleName: 'SANTOS',
      dateOfBirth: '01/15/1990',
      placeOfBirth: 'MANILA',
      sex: 'Male',
      civilStatus: 'Single',
      height: '1.70',
      weight: '70',
      bloodType: 'O+',
      citizenship: 'Filipino',
      residentialAddress: {
        houseNumber: '123',
        street: 'Main Street',
        barangay: 'Barangay 1',
        city: 'Quezon City',
        province: 'Metro Manila',
        zipCode: '1100',
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const onSubmit = (data: any) => {
    console.log('Form submitted:', data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">UI Component Showcase</h1>
          <HighContrastToggle />
        </div>

        <main id="main-content" className="space-y-12">
          {/* Form Components Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Form Components</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  id="firstName"
                  label="First Name"
                  placeholder="Enter your first name"
                  registration={register('firstName', { required: 'First name is required' })}
                  error={errors.firstName?.message as string}
                  hint="Must be in FULL UPPERCASE"
                  required
                />

                <FormInput
                  id="lastName"
                  label="Last Name"
                  placeholder="Enter your last name"
                  registration={register('lastName')}
                  showCharCount
                  maxLength={50}
                />

                <FormSelect
                  id="civilStatus"
                  label="Civil Status"
                  registration={register('civilStatus', { required: 'Civil status is required' })}
                  error={errors.civilStatus?.message as string}
                  options={[
                    { value: 'single', label: 'Single' },
                    { value: 'married', label: 'Married' },
                    { value: 'widowed', label: 'Widowed' },
                    { value: 'separated', label: 'Separated' },
                  ]}
                  required
                />

                <FormDatePicker
                  name="dateOfBirth"
                  control={control}
                  label="Date of Birth"
                  error={errors.dateOfBirth?.message as string}
                  hint="Format: MM/DD/YYYY"
                  required
                />
              </div>

              <FormTextarea
                id="remarks"
                label="Remarks"
                placeholder="Enter any additional remarks"
                registration={register('remarks')}
                showCharCount
                maxLength={200}
                rows={4}
              />

              <FormRadioGroup
                name="sex"
                label="Sex"
                registration={register('sex', { required: 'Sex is required' })}
                error={errors.sex?.message as string}
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                ]}
                orientation="horizontal"
                required
              />

              <FormCheckbox
                id="consent"
                label="I consent to the processing of my personal data"
                registration={register('consent', { required: 'Consent is required' })}
                error={errors.consent?.message as string}
                hint="Your data will be processed in accordance with data privacy laws"
              />

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Submit Form
              </button>
            </form>
          </section>

          {/* Error & Validation Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Error & Validation Components
            </h2>
            
            <div className="space-y-4">
              <ErrorMessage
                title="Form submission failed"
                message="Please fix the errors below and try again."
                variant="error"
                onDismiss={() => console.log('Dismissed')}
              />

              <ErrorMessage
                title="Warning"
                message="Some fields may need your attention."
                variant="warning"
              />

              <ErrorMessage
                title="Information"
                message="Your form has been auto-saved."
                variant="info"
              />

              <ValidationSummary errors={validationErrors} />

              <div className="flex items-center space-x-2">
                <span>Need help?</span>
                <Tooltip content="Click here for detailed instructions on filling out this form" />
              </div>
            </div>
          </section>

          {/* Progress Indicators Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Progress Indicators</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">Step Indicator</h3>
                <StepIndicator
                  steps={steps}
                  currentStep={currentStep}
                  onStepClick={(step) => setCurrentStep(step)}
                />
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">Mobile Step Indicator</h3>
                <MobileStepIndicator steps={steps} currentStep={currentStep} />
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">Form Progress</h3>
                <FormProgress
                  value={formProgress}
                  label="Form Completion"
                  color="blue"
                />
                <div className="mt-2">
                  <button
                    onClick={() => setFormProgress(Math.min(100, formProgress + 10))}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Increase Progress
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">Mobile Form Navigation</h3>
                <div className="relative h-20 bg-gray-100 rounded">
                  <MobileFormNavigation
                    currentStep={currentStep}
                    totalSteps={steps.length}
                    onPrevious={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    onNext={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                    onSubmit={() => console.log('Form submitted')}
                    className="rounded-b"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Print Components Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Print Components</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">PDS Preview</h3>
                <PDSPreview ref={previewRef} pds={mockPDS} />
              </div>

              <div className="flex space-x-4">
                <PrintButton
                  contentRef={previewRef}
                  documentTitle="Personal Data Sheet"
                  variant="primary"
                />
                <PrintButton
                  contentRef={previewRef}
                  documentTitle="Personal Data Sheet"
                  variant="secondary"
                  showPreview
                />
              </div>
            </div>
          </section>

          {/* Accessibility Components Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Accessibility Components</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">Focus Trap Demo</h3>
                <button
                  onClick={() => setShowFocusTrap(!showFocusTrap)}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  {showFocusTrap ? 'Disable' : 'Enable'} Focus Trap
                </button>
                
                {showFocusTrap && (
                  <FocusTrap className="mt-4 p-4 border-2 border-purple-500 rounded">
                    <p className="mb-4">Focus is trapped within this container.</p>
                    <div className="space-x-2">
                      <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
                        Button 1
                      </button>
                      <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
                        Button 2
                      </button>
                      <button
                        onClick={() => setShowFocusTrap(false)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Close
                      </button>
                    </div>
                  </FocusTrap>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default UIShowcase;