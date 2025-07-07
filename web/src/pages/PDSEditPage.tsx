import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCurrentPDS, updatePDS } from '../store/slices/pdsSlice';
import { pdsService } from '../services/pdsService';

const PDSEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      middleName: '',
      dateOfBirth: '',
      placeOfBirth: '',
      sex: '',
      civilStatus: '',
      citizenship: '',
      height: '',
      weight: '',
      bloodType: '',
    },
  });

  useEffect(() => {
    loadPDS();
  }, [id]);

  const loadPDS = async () => {
    if (!id) return;

    try {
      const response = await pdsService.getById(id);
      dispatch(setCurrentPDS(response.data));

      // Populate form with existing data
      if (response.data.personalInfo) {
        setFormData((prev) => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            ...response.data.personalInfo,
          },
        }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load PDS');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [name]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!id) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await pdsService.update(id, formData);
      dispatch(updatePDS(response.data));
      setSuccess('PDS saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save PDS');
    } finally {
      setSaving(false);
    }
  };

  const handleValidate = async () => {
    if (!id) return;

    try {
      const response = await pdsService.validate(id);
      if (response.data.valid) {
        setSuccess('PDS is valid!');
      } else {
        setError('PDS has validation errors. Please check and correct them.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to validate PDS');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-sm text-gray-500">Loading PDS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/dashboard"
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleValidate}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Validate
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Edit Personal Data Sheet
          </h1>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4 mb-4">
              <div className="text-sm text-green-800">{success}</div>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Personal Information
              </h3>

              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-2">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={formData.personalInfo.firstName}
                    onChange={handleChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label
                    htmlFor="middleName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Middle Name
                  </label>
                  <input
                    type="text"
                    name="middleName"
                    id="middleName"
                    value={formData.personalInfo.middleName}
                    onChange={handleChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formData.personalInfo.lastName}
                    onChange={handleChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="dateOfBirth"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    id="dateOfBirth"
                    value={formData.personalInfo.dateOfBirth}
                    onChange={handleChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="placeOfBirth"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Place of Birth
                  </label>
                  <input
                    type="text"
                    name="placeOfBirth"
                    id="placeOfBirth"
                    value={formData.personalInfo.placeOfBirth}
                    onChange={handleChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label
                    htmlFor="sex"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Sex
                  </label>
                  <select
                    id="sex"
                    name="sex"
                    value={formData.personalInfo.sex}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label
                    htmlFor="civilStatus"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Civil Status
                  </label>
                  <select
                    id="civilStatus"
                    name="civilStatus"
                    value={formData.personalInfo.civilStatus}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                    <option value="Annulled">Annulled</option>
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label
                    htmlFor="citizenship"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Citizenship
                  </label>
                  <input
                    type="text"
                    name="citizenship"
                    id="citizenship"
                    value={formData.personalInfo.citizenship}
                    onChange={handleChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label
                    htmlFor="height"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Height (m)
                  </label>
                  <input
                    type="text"
                    name="height"
                    id="height"
                    value={formData.personalInfo.height}
                    onChange={handleChange}
                    placeholder="1.65"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label
                    htmlFor="weight"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Weight (kg)
                  </label>
                  <input
                    type="text"
                    name="weight"
                    id="weight"
                    value={formData.personalInfo.weight}
                    onChange={handleChange}
                    placeholder="65"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label
                    htmlFor="bloodType"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Blood Type
                  </label>
                  <input
                    type="text"
                    name="bloodType"
                    id="bloodType"
                    value={formData.personalInfo.bloodType}
                    onChange={handleChange}
                    placeholder="O+"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>
              This is a simplified form. The complete PDS includes sections for:
            </p>
            <ul className="list-disc list-inside mt-2">
              <li>Family Background</li>
              <li>Educational Background</li>
              <li>Civil Service Eligibility</li>
              <li>Work Experience</li>
              <li>Voluntary Work</li>
              <li>Learning and Development</li>
              <li>Other Information</li>
              <li>Questions (34-40)</li>
              <li>References</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PDSEditPage;
