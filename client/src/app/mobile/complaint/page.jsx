'use client';
import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { apiClient } from '../../../utils/api_client';
import { useRouter } from 'next/navigation';

export default function ComplaintPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [trainNumber, setTrainNumber] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [trainInfo, setTrainInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const validateTrain = async () => {
    if (!trainNumber) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get(`/mobile/train/${trainNumber}`);
      setTrainInfo(res.data.train);
    } catch (err) {
      setError('Train number not found');
      setTrainInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!complaintText.trim()) {
      setError('Complaint text is required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await apiClient.post('/mobile/complaint', {
        trainNumber: trainNumber || undefined,
        complaintText
      });
      setResult(res.data.complaint);
      // Clear form
      setTrainNumber('');
      setComplaintText('');
      setTrainInfo(null);
      // Optionally redirect after a delay
      setTimeout(() => router.push('/mobile/issues'), 2000);
    } catch (err) {
      setError('Failed to submit complaint. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Log a Complaint</h1>
        {result ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h2 className="font-semibold text-green-800">Complaint Submitted!</h2>
            <p className="mt-2">Category: <strong>{result.category}</strong></p>
            <p>Severity: <strong>{result.severity}</strong></p>
            <p>Assigned to: <strong>{result.assignedDepartment}</strong></p>
            <p className="mt-2 text-sm">Redirecting to issues page...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Train Number (optional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trainNumber}
                  onChange={(e) => setTrainNumber(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 12345"
                />
                <button
                  type="button"
                  onClick={validateTrain}
                  disabled={loading || !trainNumber}
                  className="bg-gray-200 px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {loading ? '...' : 'Check'}
                </button>
              </div>
              {trainInfo && (
                <p className="text-sm text-green-600 mt-1">
                  Train found: {trainInfo.train_name} (Zone: {trainInfo.zone})
                </p>
              )}
              {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Complaint Details *</label>
              <textarea
                rows="5"
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your issue..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        )}
      </div>
    </ProtectedRoute>
  );
}