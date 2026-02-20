'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { apiClient } from '../../../utils/api_client';
import Link from 'next/link';

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

  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    Resolved: 'bg-green-100 text-green-800',
  };

  return (
    <ProtectedRoute>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">My Issues</h1>
        {loading ? (
          <p>Loading...</p>
        ) : complaints.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No complaints yet.</p>
            <Link href="/mobile/complaint" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded">
              Log a Complaint
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <div key={c._id} className="border rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                    <h3 className="font-semibold mt-1">{c.category}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{c.complaintText}</p>
                    {c.trainNumber && <p className="text-xs text-gray-400 mt-1">Train: {c.trainNumber}</p>}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusColors[c.status] || 'bg-gray-100'}`}>
                    {c.status}
                  </span>
                </div>
                <div className="mt-2 flex gap-2 text-xs">
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Severity: {c.severity}</span>
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded">Dept: {c.assignedDepartment}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}