'use client';
import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { apiClient } from '../../../utils/api_client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Train, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
      const payload = res.data?.data;
      setTrainInfo(payload?.train ?? null);
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
      const payload = res.data?.data;
      setResult(payload?.complaint ?? null);
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
      <div className="min-h-screen bg-background">
        {/* Header */}
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b" style={{ borderBottomColor: 'rgba(78,78,148,0.15)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
            <Link href="/mobile" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft size={20} style={{ color: '#4E4E94' }} />
            </Link>
            <h1 className="font-outfit text-xl sm:text-2xl font-bold" style={{ color: '#1A1A2E' }}>
              Log a Complaint
            </h1>
          </div>
        </nav>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="railmind-card"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}>
                  <CheckCircle size={20} style={{ color: '#22C55E' }} />
                </div>
                <div className="flex-1">
                  <h2 className="font-outfit font-semibold text-lg mb-3" style={{ color: '#1A1A2E' }}>
                    Complaint Submitted!
                  </h2>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium" style={{ color: '#4A4A6A' }}>Category:</span>{' '}
                      <strong style={{ color: '#4E4E94' }}>{result.category}</strong>
                    </p>
                    <p>
                      <span className="font-medium" style={{ color: '#4A4A6A' }}>Severity:</span>{' '}
                      <strong style={{ color: '#4E4E94' }}>{result.severity}</strong>
                    </p>
                    <p>
                      <span className="font-medium" style={{ color: '#4A4A6A' }}>Assigned to:</span>{' '}
                      <strong style={{ color: '#4E4E94' }}>{result.assignedDepartment}</strong>
                    </p>
                  </div>
                  <p className="mt-4 text-xs" style={{ color: '#4A4A6A' }}>
                    Redirecting to issues page...
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Train Number Field */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1A1A2E' }}>
                    Train Number <span className="font-normal text-xs" style={{ color: '#4A4A6A' }}>(optional)</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Train size={18} style={{ color: '#4A4A6A' }} />
                      </div>
                      <input
                        type="text"
                        value={trainNumber}
                        onChange={(e) => setTrainNumber(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                        style={{
                          borderColor: 'rgba(78,78,148,0.2)',
                          backgroundColor: '#fff',
                          color: '#1A1A2E',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#4E4E94';
                          e.target.style.boxShadow = '0 0 0 3px rgba(78,78,148,0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(78,78,148,0.2)';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder="e.g., 12345"
                      />
                    </div>
                    <motion.button
                      type="button"
                      onClick={validateTrain}
                      disabled={loading || !trainNumber}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 sm:px-6 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: loading || !trainNumber ? 'rgba(78,78,148,0.1)' : '#4E4E94',
                        color: loading || !trainNumber ? '#4A4A6A' : '#fff',
                      }}
                    >
                      {loading ? '...' : 'Check'}
                    </motion.button>
                  </div>
                  {trainInfo && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm mt-2 flex items-center gap-2"
                      style={{ color: '#22C55E' }}
                    >
                      <CheckCircle size={14} />
                      Train found: {trainInfo.train_name} (Zone: {trainInfo.zone})
                    </motion.p>
                  )}
                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm mt-2 flex items-center gap-2"
                      style={{ color: '#EF4444' }}
                    >
                      <AlertCircle size={14} />
                      {error}
                    </motion.p>
                  )}
                </div>

                {/* Complaint Details Field */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1A1A2E' }}>
                    Complaint Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows="6"
                    value={complaintText}
                    onChange={(e) => setComplaintText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all resize-none"
                    style={{
                      borderColor: 'rgba(78,78,148,0.2)',
                      backgroundColor: '#fff',
                      color: '#1A1A2E',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4E4E94';
                      e.target.style.boxShadow = '0 0 0 3px rgba(78,78,148,0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(78,78,148,0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="Describe your issue in detail..."
                    required
                  />
                  <p className="text-xs mt-1.5" style={{ color: '#4A4A6A' }}>
                    Be specific about the problem, location, and time if relevant.
                  </p>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: submitting ? 1 : 1.02 }}
                  whileTap={{ scale: submitting ? 1 : 0.98 }}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: '#4E4E94',
                    color: '#fff',
                    boxShadow: submitting ? 'none' : '0 4px 20px rgba(78,78,148,0.25)',
                  }}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Complaint'
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}