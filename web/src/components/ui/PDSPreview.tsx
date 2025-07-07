import React, { forwardRef } from 'react';
import { PDS, PersonalInfo, Address } from '../../types';
import clsx from 'clsx';

interface PDSPreviewProps {
  pds: PDS;
  className?: string;
}

export const PDSPreview = forwardRef<HTMLDivElement, PDSPreviewProps>(
  ({ pds, className }, ref) => {
    const personalInfo = pds.personalInfo;

    const formatAddress = (address?: Address) => {
      if (!address) return 'N/A';
      return `${address.houseNumber} ${address.street}, ${address.barangay}, ${address.city}, ${address.province} ${address.zipCode}`;
    };

    return (
      <div
        ref={ref}
        className={clsx(
          'bg-white shadow-lg rounded-lg print:shadow-none print:rounded-none',
          'p-8 print:p-0',
          className
        )}
      >
        {/* Header */}
        <div className="text-center mb-6 print:mb-4">
          <h1 className="text-2xl font-bold text-gray-900 print:text-xl">
            PERSONAL DATA SHEET
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            CS Form No. 212 (Revised 2017)
          </p>
        </div>

        {/* Personal Information Section */}
        <section className="mb-8 print:mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300 print:text-base">
            I. PERSONAL INFORMATION
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
            <div>
              <Label>Surname</Label>
              <Value>{personalInfo?.lastName || 'N/A'}</Value>
            </div>
            <div>
              <Label>First Name</Label>
              <Value>{personalInfo?.firstName || 'N/A'}</Value>
            </div>
            <div>
              <Label>Middle Name</Label>
              <Value>{personalInfo?.middleName || 'N/A'}</Value>
            </div>
            <div>
              <Label>Name Extension</Label>
              <Value>{personalInfo?.nameExtension || 'N/A'}</Value>
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Value>{personalInfo?.dateOfBirth || 'N/A'}</Value>
            </div>
            <div>
              <Label>Place of Birth</Label>
              <Value>{personalInfo?.placeOfBirth || 'N/A'}</Value>
            </div>
            <div>
              <Label>Sex</Label>
              <Value>{personalInfo?.sex || 'N/A'}</Value>
            </div>
            <div>
              <Label>Civil Status</Label>
              <Value>{personalInfo?.civilStatus || 'N/A'}</Value>
            </div>
            <div>
              <Label>Height (m)</Label>
              <Value>{personalInfo?.height || 'N/A'}</Value>
            </div>
            <div>
              <Label>Weight (kg)</Label>
              <Value>{personalInfo?.weight || 'N/A'}</Value>
            </div>
            <div>
              <Label>Blood Type</Label>
              <Value>{personalInfo?.bloodType || 'N/A'}</Value>
            </div>
            <div>
              <Label>Citizenship</Label>
              <Value>{personalInfo?.citizenship || 'N/A'}</Value>
            </div>
          </div>

          <div className="mt-6 print:mt-4">
            <h3 className="font-semibold text-gray-700 mb-3">Government IDs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
              <div>
                <Label>GSIS ID No.</Label>
                <Value>{personalInfo?.gsisId || 'N/A'}</Value>
              </div>
              <div>
                <Label>PAG-IBIG ID No.</Label>
                <Value>{personalInfo?.pagibigId || 'N/A'}</Value>
              </div>
              <div>
                <Label>PHILHEALTH No.</Label>
                <Value>{personalInfo?.philhealthId || 'N/A'}</Value>
              </div>
              <div>
                <Label>SSS No.</Label>
                <Value>{personalInfo?.sssId || 'N/A'}</Value>
              </div>
              <div>
                <Label>TIN No.</Label>
                <Value>{personalInfo?.tinId || 'N/A'}</Value>
              </div>
              <div>
                <Label>Agency Employee No.</Label>
                <Value>{personalInfo?.agencyEmployeeNumber || 'N/A'}</Value>
              </div>
            </div>
          </div>

          <div className="mt-6 print:mt-4">
            <h3 className="font-semibold text-gray-700 mb-3">Contact Information</h3>
            <div className="space-y-3 print:space-y-2">
              <div>
                <Label>Residential Address</Label>
                <Value>{formatAddress(personalInfo?.residentialAddress)}</Value>
              </div>
              <div>
                <Label>Permanent Address</Label>
                <Value>{formatAddress(personalInfo?.permanentAddress)}</Value>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:gap-2">
                <div>
                  <Label>Telephone No.</Label>
                  <Value>{personalInfo?.telephoneNumber || 'N/A'}</Value>
                </div>
                <div>
                  <Label>Mobile No.</Label>
                  <Value>{personalInfo?.mobileNumber || 'N/A'}</Value>
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Value>{personalInfo?.emailAddress || 'N/A'}</Value>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional sections would go here */}
        {/* This is a simplified preview - full implementation would include all PDS sections */}
      </div>
    );
  }
);

PDSPreview.displayName = 'PDSPreview';

// Helper components
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs font-medium text-gray-600 uppercase tracking-wider print:text-[10px]">
    {children}
  </p>
);

const Value: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-gray-900 font-medium print:text-xs">
    {children}
  </p>
);