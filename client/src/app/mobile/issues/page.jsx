'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { apiClient } from '../../../utils/api_client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Clock, CheckCircle, AlertCircle, Train, Calendar } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';

export default function IssuesPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await apiClient.get('/mobile/complaints');
      setComplaints(res.data.complaints);
    } catch (error) {
      console.error('Failed to fetch complaints', error);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    Pending: {
      bg: 'rgba(234,179,8,0.1)',
      text: '#CA8A04',
      icon: Clock,
    },
    'In Progress': {
      bg: 'rgba(59,130,246,0.1)',
      text: '#2563EB',
      icon: AlertCircle,
    },
    Resolved: {
      bg: 'rgba(34,197,94,0.1)',
      text: '#16A34A',
      icon: CheckCircle,
    },
  };

  const severityColors = {
    Critical: { bg: 'rgba(239,68,68,0.1)', text: '#DC2626' },
    High: { bg: 'rgba(249,115,22,0.1)', text: '#EA580C' },
    Normal: { bg: 'rgba(78,78,148,0.1)', text: '#4E4E94' },
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b" style={{ borderBottomColor: 'rgba(78,78,148,0.15)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/mobile" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <ArrowLeft size={20} style={{ color: '#4E4E94' }} />
              </Link>
              <h1 className="font-outfit text-xl sm:text-2xl font-bold" style={{ color: '#1A1A2E' }}>
                My Issues
              </h1>
            </div>
            <Link href="/mobile/complaint">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-semibold text-sm text-white transition-all"
                style={{
                  backgroundColor: '#4E4E94',
                  boxShadow: '0 4px 20px rgba(78,78,148,0.25)',
                }}
              >
                <Plus size={16} />
                <span className="hidden sm:inline">New</span>
              </motion.button>
            </Link>
          </div>
        </nav>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" style={{ borderColor: '#4E4E94', borderTopColor: 'transparent' }} />
            </div>
          ) : complaints.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(78,78,148,0.1)' }}>
                <AlertCircle size={32} style={{ color: '#4E4E94' }} />
              </div>
              <h2 className="font-outfit text-xl font-semibold mb-2" style={{ color: '#1A1A2E' }}>
                No complaints yet
              </h2>
              <p className="text-sm mb-6" style={{ color: '#4A4A6A' }}>
                Start by logging your first complaint
              </p>
              <Link href="/mobile/complaint">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all"
                  style={{
                    backgroundColor: '#4E4E94',
                    boxShadow: '0 4px 20px rgba(78,78,148,0.25)',
                  }}
                >
                  <Plus size={18} />
                  Log a Complaint
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {complaints.map((c, index) => {
                const status = statusConfig[c.status] || statusConfig.Pending;
                const StatusIcon = status.icon;
                const severity = severityColors[c.severity] || severityColors.Normal;

                return (
                  <motion.div
                    key={c._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="railmind-card"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar size={14} style={{ color: '#4A4A6A' }} />
                          <span className="text-xs" style={{ color: '#4A4A6A' }}>
                            {new Date(c.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <h3 className="font-outfit font-semibold text-lg mb-1.5" style={{ color: '#1A1A2E' }}>
                          {c.category}
                        </h3>
                        <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#4A4A6A' }}>
                          {c.complaintText}
                        </p>
                        {c.trainNumber && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <Train size={14} style={{ color: '#4A4A6A' }} />
                            <span className="text-xs" style={{ color: '#4A4A6A' }}>
                              Train: {c.trainNumber}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                        <div
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: status.bg,
                            color: status.text,
                          }}
                        >
                          <StatusIcon size={12} />
                          {c.status}
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t" style={{ borderTopColor: 'rgba(78,78,148,0.1)' }}>
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium"
                        style={{
                          backgroundColor: severity.bg,
                          color: severity.text,
                        }}
                      >
                        Severity: {c.severity}
                      </span>
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium"
                        style={{
                          backgroundColor: 'rgba(78,78,148,0.1)',
                          color: '#4E4E94',
                        }}
                      >
                        Dept: {c.assignedDepartment}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}