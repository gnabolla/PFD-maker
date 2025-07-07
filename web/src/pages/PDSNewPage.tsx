import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addPDS } from '../store/slices/pdsSlice';
import { pdsService } from '../services/pdsService';

const PDSNewPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Basic form data - in a real app, this would be much more comprehensive
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await pdsService.create(formData);
      dispatch(addPDS(response.data));
      navigate(`/pds/${response.data.id}/edit`);
    } catch (err: any) {
      setError(err.message || 'Failed to create PDS');
      setLoading(false);
    }
  };

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
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Create New PDS
          </h1>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6"
          >
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Personal Information
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Basic information to start your PDS
              </p>
            </div>

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
                  required
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
                  required
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
                  required
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
                  required
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
                  required
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
                  required
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
                  required
                  value={formData.personalInfo.citizenship}
                  onChange={handleChange}
                  placeholder="Filipino"
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                to="/dashboard"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create PDS'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PDSNewPage;
