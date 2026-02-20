'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { apiClient } from '../../../utils/api_client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Train, AlertCircle, ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import Link from 'next/link';

export default function ComplaintPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [trainNumber, setTrainNumber] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [trainSchedule, setTrainSchedule] = useState(null);
  const [trainStations, setTrainStations] = useState([]);
  const [selectedStationCode, setSelectedStationCode] = useState('');
  const [trainInfo, setTrainInfo] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const validateTrain = async () => {
    if (!trainNumber) return;
    setLoading(true);
    setError('');
    setTrainSchedule(null);
    setTrainStations([]);
    setSelectedStationCode('');
    
    try {
      // Get train basic info
      const trainRes = await apiClient.get(`/mobile/train/${trainNumber}`);
      const trainPayload = trainRes.data?.data;
      setTrainInfo(trainPayload?.train ?? null);
      
      // Get all stations for this train
      const stationsRes = await apiClient.get(`/mobile/train/${trainNumber}/stations`);
      const stationsPayload = stationsRes.data?.data;
      const stations = stationsPayload?.stations ?? [];
      setTrainStations(stations);
      
      // Auto-select first station schedule
      if (stations.length > 0) {
        setTrainSchedule(stations[0]);
        setSelectedStationCode(stations[0].station_code);
      } else {
        // Fallback: try to get schedule directly
        const scheduleRes = await apiClient.get(`/mobile/train/${trainNumber}/schedule`);
        const schedulePayload = scheduleRes.data?.data;
        if (schedulePayload?.schedule) {
          setTrainSchedule(schedulePayload.schedule);
          setSelectedStationCode(schedulePayload.schedule.station_code);
        }
      }
    } catch (err) {
      console.error('Train validation error:', err);
      setError('Train number not found or schedule unavailable');
      setTrainInfo(null);
      setTrainSchedule(null);
      setTrainStations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStationChange = (stationCode) => {
    setSelectedStationCode(stationCode);
    const selectedStation = trainStations.find(s => s.station_code === stationCode);
    if (selectedStation) {
      setTrainSchedule(selectedStation);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
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
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('description', complaintText);
      formData.append('source', 'mobile');
      
      // Send train_number and station_code, backend will fetch schedule from CSV
      if (trainNumber) {
        formData.append('train_number', trainNumber);
        if (selectedStationCode) {
          formData.append('station_code', selectedStationCode);
        }
      }
      
      // Optionally send train_schedule if we have it (backend can also fetch it)
      if (trainSchedule) {
        formData.append('train_schedule', JSON.stringify(trainSchedule));
      }
      
      images.forEach((image, index) => {
        formData.append('images', image);
      });

      const res = await apiClient.post('/mobile/complaint-with-gemini', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const payload = res.data?.data;
      setResult(payload);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.message || 'Failed to submit complaint. Try again.');
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
              className="railmind-card p-6 rounded-xl border"
              style={{ borderColor: 'rgba(78,78,148,0.2)' }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}>
                  <CheckCircle size={20} style={{ color: '#22C55E' }} />
                </div>
                <div className="flex-1">
                  <h2 className="font-outfit font-semibold text-lg mb-3" style={{ color: '#1A1A2E' }}>
                    Complaint Analyzed!
                  </h2>
                  
                  {result.gemini_analysis && (
                    <div className="space-y-3 mb-4">
                      <div>
                        <span className="font-medium text-sm" style={{ color: '#4A4A6A' }}>Categories:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {result.gemini_analysis.categories?.map((cat, idx) => (
                            <span key={idx} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'rgba(78,78,148,0.1)', color: '#4E4E94' }}>
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-sm" style={{ color: '#4A4A6A' }}>Department:</span>{' '}
                        <strong style={{ color: '#4E4E94' }}>{result.gemini_analysis.department}</strong>
                      </div>
                      <div>
                        <span className="font-medium text-sm" style={{ color: '#4A4A6A' }}>Urgent:</span>{' '}
                        <strong style={{ color: result.gemini_analysis.is_urgent ? '#EF4444' : '#22C55E' }}>
                          {result.gemini_analysis.is_urgent ? 'Yes' : 'No'}
                        </strong>
                      </div>
                      {result.gemini_analysis.priority_analysis && (
                        <div>
                          <span className="font-medium text-sm" style={{ color: '#4A4A6A' }}>Priority Analysis:</span>
                          <p className="text-sm mt-1" style={{ color: '#1A1A2E' }}>{result.gemini_analysis.priority_analysis}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {result.fastapi_classification && (
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(78,78,148,0.2)' }}>
                      <span className="font-medium text-sm" style={{ color: '#4A4A6A' }}>FastAPI Classification:</span>
                      <div className="mt-2">
                        <p>
                          <span className="text-sm" style={{ color: '#4A4A6A' }}>Department:</span>{' '}
                          <strong style={{ color: '#4E4E94' }}>{result.fastapi_classification.department}</strong>
                        </p>
                        {result.fastapi_classification.confidence && (
                          <p className="text-sm mt-1" style={{ color: '#4A4A6A' }}>
                            Confidence: {(result.fastapi_classification.confidence * 100).toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(78,78,148,0.2)' }}>
                    <p className="text-xs" style={{ color: '#4A4A6A' }}>
                      Train Running: {result.train_running ? 'Yes' : 'No'}
                    </p>
                    {result.images && result.images.length > 0 && (
                      <p className="text-xs mt-1" style={{ color: '#4A4A6A' }}>
                        Images uploaded: {result.images.length}
                      </p>
                    )}
                  </div>
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
                  
                  {/* Station Selection (if multiple stations available) */}
                  {trainStations.length > 1 && (
                    <div className="mt-3">
                      <label className="block text-xs font-medium mb-2" style={{ color: '#4A4A6A' }}>
                        Select Station:
                      </label>
                      <select
                        value={selectedStationCode}
                        onChange={(e) => handleStationChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all"
                        style={{
                          borderColor: 'rgba(78,78,148,0.2)',
                          backgroundColor: '#fff',
                          color: '#1A1A2E',
                        }}
                      >
                        {trainStations.map((station) => (
                          <option key={station.station_code} value={station.station_code}>
                            {station.station_name} ({station.station_code}) - Arr: {station.arrival_time || 'N/A'} Dep: {station.departure_time || 'N/A'}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Show selected schedule */}
                  {trainSchedule && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 p-3 rounded-lg text-xs"
                      style={{ backgroundColor: 'rgba(78,78,148,0.05)' }}
                    >
                      <p className="font-medium mb-1" style={{ color: '#4E4E94' }}>Schedule:</p>
                      <p style={{ color: '#4A4A6A' }}>
                        {trainSchedule.station_name} ({trainSchedule.station_code}) - 
                        Arr: {trainSchedule.arrival_time || 'N/A'} | 
                        Dep: {trainSchedule.departure_time || 'N/A'}
                      </p>
                    </motion.div>
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

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1A1A2E' }}>
                    Images <span className="font-normal text-xs" style={{ color: '#4A4A6A' }}>(optional, max 5)</span>
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:bg-gray-50"
                      style={{ borderColor: 'rgba(78,78,148,0.3)' }}>
                      <ImageIcon size={20} style={{ color: '#4E4E94' }} />
                      <span className="text-sm font-medium" style={{ color: '#4E4E94' }}>
                        Choose Images
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    {images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                              style={{ borderColor: 'rgba(78,78,148,0.2)' }}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 rounded-lg flex items-center gap-2"
                    style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}
                  >
                    <AlertCircle size={16} style={{ color: '#EF4444' }} />
                    <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>
                  </motion.div>
                )}

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
                      Analyzing with Gemini...
                    </>
                  ) : (
                    'Submit & Analyze'
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
