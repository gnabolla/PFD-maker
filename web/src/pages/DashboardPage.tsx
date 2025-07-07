import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { setPDSList, setLoading } from '../store/slices/pdsSlice';
import { pdsService } from '../services/pdsService';

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { list: pdsList, loading } = useSelector(
    (state: RootState) => state.pds
  );
  const [error, setError] = useState('');

  useEffect(() => {
    loadPDSList();
  }, []);

  const loadPDSList = async () => {
    dispatch(setLoading(true));
    try {
      const response = await pdsService.getAll();
      dispatch(setPDSList(response.data || []));
    } catch (err: any) {
      setError(err.message || 'Failed to load PDS records');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this PDS record?')) {
      try {
        await pdsService.delete(id);
        loadPDSList(); // Reload the list
      } catch (err: any) {
        setError(err.message || 'Failed to delete PDS record');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">PDS Maker Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.firstName}</span>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-b border-gray-200 pb-5 mb-5">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Personal Data Sheets
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your PDS records
                </p>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-4">
                <Link
                  to="/pds/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create New PDS
                </Link>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-sm text-gray-500">Loading...</p>
            </div>
          ) : pdsList.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No PDS records
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new PDS.
              </p>
              <div className="mt-6">
                <Link
                  to="/pds/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create New PDS
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {pdsList.map((pds) => (
                  <li key={pds.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
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
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {pds.personalInfo?.firstName}{' '}
                              {pds.personalInfo?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              Created:{' '}
                              {new Date(pds.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/pds/${pds.id}/view`}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            View
                          </Link>
                          <Link
                            to={`/pds/${pds.id}/edit`}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(pds.id)}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
