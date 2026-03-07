import { useState, useEffect } from 'react';
import { X, UserPlus, Building2 } from 'lucide-react';
import { Issue, User } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import { getContractors, getContractorCompanies } from '../../api/userApi';

interface AssignModalProps {
  issue: Issue;
  onClose: () => void;
  onSubmit: (contractorId: string) => Promise<void>;
}

const AssignModal = ({ issue, onClose, onSubmit }: AssignModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState('');
  const [companies, setCompanies] = useState<string[]>([]);
  const [contractors, setContractors] = useState<User[]>([]);
  const [companyFilter, setCompanyFilter] = useState('');
  const [loadingContractors, setLoadingContractors] = useState(true);

  useEffect(() => {
    fetchCompanies();
    fetchContractors();
  }, []);

  useEffect(() => {
    fetchContractors(companyFilter);
    setSelectedContractor('');
  }, [companyFilter]);

  const fetchCompanies = async () => {
    try {
      const response = await getContractorCompanies();
      setCompanies(response.data.companies);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const fetchContractors = async (company?: string) => {
    setLoadingContractors(true);
    try {
      const response = await getContractors(company ? { company } : undefined);
      setContractors(response.data.contractors);
    } catch (error) {
      console.error('Failed to fetch contractors:', error);
    } finally {
      setLoadingContractors(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedContractor) {
      alert('Please select a contractor');
      return;
    }
    setIsLoading(true);
    await onSubmit(selectedContractor);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Assign Contractor</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Issue Summary */}
          <div className="bg-primary-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Issue</p>
            <p className="text-gray-900 font-medium line-clamp-2">{issue.description}</p>
            <p className="text-sm text-gray-500 mt-2 capitalize">
              Category: {issue.category.replace('_', ' ')}
            </p>
          </div>

          {/* Company Filter */}
          {companies.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4 inline mr-1" />
                Filter by Company
              </label>
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Companies</option>
                <option value="independent">Independent Contractors</option>
                {companies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Contractor Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Contractor
            </label>
            {loadingContractors ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : contractors.length === 0 ? (
              <p className="text-gray-500 text-sm">
                {companyFilter
                  ? `No contractors available${companyFilter === 'independent' ? ' without company affiliation' : ` from ${companyFilter}`}`
                  : 'No contractors available'}
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {contractors.map((contractor) => (
                  <label
                    key={contractor._id}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedContractor === contractor._id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="contractor"
                      value={contractor._id}
                      checked={selectedContractor === contractor._id}
                      onChange={(e) => setSelectedContractor(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {contractor.profile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {contractor.contractor?.company || 'Independent Contractor'}
                      </p>
                      {contractor.contractor?.specialization && (
                        <div className="flex gap-1 mt-1">
                          {contractor.contractor.specialization.map((spec) => (
                            <span
                              key={spec}
                              className="px-2 py-0.5 bg-primary-50 text-gray-600 rounded text-xs capitalize"
                            >
                              {spec.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-primary-50 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-primary-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={isLoading || !selectedContractor}
              className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : <UserPlus className="w-5 h-5" />}
              Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignModal;
