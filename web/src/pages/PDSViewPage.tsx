import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCurrentPDS } from '../store/slices/pdsSlice';
import { pdsService } from '../services/pdsService';

const PDSViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const [pds, setPDS] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPDS();
  }, [id]);

  const loadPDS = async () => {
    if (!id) return;

    try {
      const response = await pdsService.getById(id);
      setPDS(response.data);
      dispatch(setCurrentPDS(response.data));
    } catch (err: any) {
      setError(err.message || 'Failed to load PDS');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'excel' | 'word' | 'pdf') => {
    if (!id) return;

    try {
      let response;
      let filename;
      let mimeType;

      switch (format) {
        case 'excel':
          response = await pdsService.exportExcel(id);
          filename = `PDS_${id}.xlsx`;
          mimeType =
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'word':
          response = await pdsService.exportWord(id);
          filename = `PDS_${id}.docx`;
          mimeType =
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'pdf':
          response = await pdsService.exportPdf(id);
          filename = `PDS_${id}.pdf`;
          mimeType = 'application/pdf';
          break;
      }

      // Create blob and download
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || `Failed to export as ${format}`);
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

  if (!pds) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">PDS not found</p>
          <Link
            to="/dashboard"
            className="mt-4 text-blue-600 hover:text-blue-500"
          >
            Back to Dashboard
          </Link>
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
              <Link
                to={`/pds/${id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit
              </Link>
              <div className="relative inline-block text-left">
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() =>
                    document
                      .getElementById('export-menu')
                      ?.classList.toggle('hidden')
                  }
                >
                  Export
                  <svg
                    className="-mr-1 ml-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <div
                  id="export-menu"
                  className="hidden origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                >
                  <div className="py-1">
                    <button
                      onClick={() => handleExport('excel')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as Excel
                    </button>
                    <button
                      onClick={() => handleExport('word')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as Word
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Personal Data Sheet
          </h1>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Personal Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Status:{' '}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    pds.status === 'validated'
                      ? 'bg-green-100 text-green-800'
                      : pds.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {pds.status}
                </span>
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Full name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {pds.personalInfo?.firstName} {pds.personalInfo?.middleName}{' '}
                    {pds.personalInfo?.lastName}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Date of Birth
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {pds.personalInfo?.dateOfBirth
                      ? new Date(
                          pds.personalInfo.dateOfBirth
                        ).toLocaleDateString()
                      : 'N/A'}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Place of Birth
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {pds.personalInfo?.placeOfBirth || 'N/A'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Sex</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {pds.personalInfo?.sex || 'N/A'}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Civil Status
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {pds.personalInfo?.civilStatus || 'N/A'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Citizenship
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {pds.personalInfo?.citizenship || 'N/A'}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Height / Weight
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {pds.personalInfo?.height || 'N/A'} m /{' '}
                    {pds.personalInfo?.weight || 'N/A'} kg
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Blood Type
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {pds.personalInfo?.bloodType || 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>Created: {new Date(pds.createdAt).toLocaleString()}</p>
            <p>Last Updated: {new Date(pds.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PDSViewPage;
