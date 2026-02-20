'use client';
import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { apiClient } from '../../../utils/api_client';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Image as ImageIcon, X, Loader2, Train, User, Brain, Database, ArrowRight, List } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProfileDropdown from '../../components/ProfileDropdown';

export default function TestComplaintPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [trainNumber, setTrainNumber] = useState('107');
  const [complaintText, setComplaintText] = useState('AC not working in coach B2, temperature is very high and passengers are uncomfortable.');
  const [trainSchedule, setTrainSchedule] = useState(null);
  const [trainStations, setTrainStations] = useState([]);
  const [selectedStationCode, setSelectedStationCode] = useState('');
  const [trainInfo, setTrainInfo] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [workflowSteps, setWorkflowSteps] = useState({
    user_input: { status: 'pending', message: 'Waiting for user input...' },
    gemini_analysis: { status: 'pending', message: 'Pending...' },
    nlp_classification: { status: 'pending', message: 'Pending...' },
    output: { status: 'pending', message: 'Pending...' }
  });
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
    setResult(null);
    
    // Reset workflow steps
    setWorkflowSteps({
      user_input: { status: 'completed', message: 'User input received' },
      gemini_analysis: { status: 'in_progress', message: 'Analyzing with Gemini AI...' },
      nlp_classification: { status: 'pending', message: 'Waiting for Gemini analysis...' },
      output: { status: 'pending', message: 'Pending...' }
    });

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
      
      images.forEach((image) => {
        formData.append('images', image);
      });

      const res = await apiClient.post('/mobile/complaint-with-gemini', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const payload = res.data?.data;
      
      // Update workflow: All steps complete
      setWorkflowSteps({
        user_input: { status: 'completed', message: 'User input received' },
        gemini_analysis: { status: 'completed', message: 'Gemini analysis complete' },
        nlp_classification: { status: 'completed', message: 'NLP classification complete' },
        output: { status: 'completed', message: 'Results ready' }
      });
      
      setResult(payload);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to submit complaint. Try again.');
      
      // Update workflow: Error state
      setWorkflowSteps(prev => ({
        ...prev,
        gemini_analysis: { status: 'error', message: 'Analysis failed' },
        nlp_classification: { status: 'error', message: 'Classification failed' }
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const getStepIcon = (status) => {
    if (status === 'completed') return <CheckCircle size={20} className="text-green-600" />;
    if (status === 'in_progress') return <Loader2 size={20} className="animate-spin text-blue-600" />;
    if (status === 'error') return <AlertCircle size={20} className="text-red-600" />;
    return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
  };

  const getStepColor = (status) => {
    if (status === 'completed') return 'text-green-600';
    if (status === 'in_progress') return 'text-blue-600';
    if (status === 'error') return 'text-red-600';
    return 'text-gray-400';
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#1A1A2E' }}>
              Test Complaint Workflow
            </h1>
            <ProfileDropdown />
          </div>
          <p className="text-sm mb-6" style={{ color: '#4A4A6A' }}>
            Complete workflow: User Input → Gemini Analysis → FastAPI NLP Classification → Output
          </p>

          {/* Workflow Steps Indicator */}
          {submitting && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border p-6 mb-6"
              style={{ borderColor: 'rgba(78,78,148,0.2)' }}
            >
              <h3 className="font-semibold mb-4 text-lg" style={{ color: '#1A1A2E' }}>
                Workflow Progress
              </h3>
              <div className="space-y-4">
                {/* Step 1: User Input */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getStepIcon(workflowSteps.user_input.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User size={16} className={getStepColor(workflowSteps.user_input.status)} />
                      <span className={`font-medium text-sm ${getStepColor(workflowSteps.user_input.status)}`}>
                        Step 1: User Input
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: '#4A4A6A' }}>
                      {workflowSteps.user_input.message}
                    </p>
                  </div>
                </div>

                <ArrowRight size={16} className="text-gray-400 ml-6" />

                {/* Step 2: Gemini Analysis */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getStepIcon(workflowSteps.gemini_analysis.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain size={16} className={getStepColor(workflowSteps.gemini_analysis.status)} />
                      <span className={`font-medium text-sm ${getStepColor(workflowSteps.gemini_analysis.status)}`}>
                        Step 2: Gemini AI Analysis
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: '#4A4A6A' }}>
                      {workflowSteps.gemini_analysis.message}
                    </p>
                  </div>
                </div>

                <ArrowRight size={16} className="text-gray-400 ml-6" />

                {/* Step 3: NLP Classification */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getStepIcon(workflowSteps.nlp_classification.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Database size={16} className={getStepColor(workflowSteps.nlp_classification.status)} />
                      <span className={`font-medium text-sm ${getStepColor(workflowSteps.nlp_classification.status)}`}>
                        Step 3: FastAPI NLP Classification
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: '#4A4A6A' }}>
                      {workflowSteps.nlp_classification.message}
                    </p>
                  </div>
                </div>

                <ArrowRight size={16} className="text-gray-400 ml-6" />

                {/* Step 4: Output */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getStepIcon(workflowSteps.output.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle size={16} className={getStepColor(workflowSteps.output.status)} />
                      <span className={`font-medium text-sm ${getStepColor(workflowSteps.output.status)}`}>
                        Step 4: Final Output
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: '#4A4A6A' }}>
                      {workflowSteps.output.message}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border p-6"
              style={{ borderColor: 'rgba(78,78,148,0.2)' }}
            >
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}>
                  <CheckCircle size={20} style={{ color: '#22C55E' }} />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-xl mb-4" style={{ color: '#1A1A2E' }}>
                    Analysis Complete!
                  </h2>

                  {/* Gemini Analysis Results */}
                  {result.gemini_analysis && (
                    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(78,78,148,0.05)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Brain size={20} style={{ color: '#4E4E94' }} />
                        <h3 className="font-semibold text-lg" style={{ color: '#4E4E94' }}>
                          Step 2: Gemini Analysis Results
                        </h3>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium text-sm" style={{ color: '#4A4A6A' }}>Categories:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {result.gemini_analysis.categories?.map((cat, idx) => (
                              <span key={idx} className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(78,78,148,0.15)', color: '#4E4E94' }}>
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-sm" style={{ color: '#4A4A6A' }}>Keywords:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {result.gemini_analysis.keywords?.map((kw, idx) => (
                              <span key={idx} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'rgba(78,78,148,0.1)', color: '#4E4E94' }}>
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <span className="font-medium text-sm" style={{ color: '#4A4A6A' }}>Department:</span>
                            <p className="font-semibold mt-1" style={{ color: '#4E4E94' }}>{result.gemini_analysis.department}</p>
                          </div>
                          <div>
                            <span className="font-medium text-sm" style={{ color: '#4A4A6A' }}>Is Urgent:</span>
                            <p className={`font-semibold mt-1 ${result.gemini_analysis.is_urgent ? 'text-red-600' : 'text-green-600'}`}>
                              {result.gemini_analysis.is_urgent ? 'Yes' : 'No'}
                            </p>
                          </div>
                        </div>
                        {result.gemini_analysis.priority_analysis && (
                          <div>
                            <span className="font-medium text-sm" style={{ color: '#4A4A6A' }}>Priority Analysis:</span>
                            <p className="text-sm mt-1 p-2 rounded" style={{ backgroundColor: 'rgba(78,78,148,0.05)', color: '#1A1A2E' }}>
                              {result.gemini_analysis.priority_analysis}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* FastAPI Classification Results */}
                  {result.fastapi_classification && (
                    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(34,197,94,0.05)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Database size={20} style={{ color: '#22C55E' }} />
                        <h3 className="font-semibold text-lg" style={{ color: '#22C55E' }}>
                          Step 3: FastAPI NLP Classification Results
                        </h3>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium text-sm" style={{ color: '#4A4A6A' }}>Department:</span>
                          <p className="font-semibold mt-1" style={{ color: '#22C55E' }}>
                            {result.fastapi_classification.department}
                          </p>
                        </div>
                        {result.fastapi_classification.confidence !== undefined && (
                          <div>
                            <span className="font-medium text-sm" style={{ color: '#4A4A6A' }}>Confidence:</span>
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="h-2.5 rounded-full"
                                  style={{
                                    backgroundColor: '#22C55E',
                                    width: `${result.fastapi_classification.confidence * 100}%`
                                  }}
                                />
                              </div>
                              <p className="text-sm mt-1" style={{ color: '#4A4A6A' }}>
                                {(result.fastapi_classification.confidence * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="pt-4 border-t" style={{ borderColor: 'rgba(78,78,148,0.2)' }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium" style={{ color: '#4A4A6A' }}>Train Running:</span>
                        <p className={`font-semibold ${result.train_running ? 'text-green-600' : 'text-gray-600'}`}>
                          {result.train_running ? 'Yes' : 'No'}
                        </p>
                      </div>
                      {result.images && result.images.length > 0 && (
                        <div>
                          <span className="font-medium" style={{ color: '#4A4A6A' }}>Images Uploaded:</span>
                          <p className="font-semibold" style={{ color: '#4E4E94' }}>{result.images.length}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <motion.button
                      onClick={() => router.push('/mobile/issues')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
                      style={{
                        backgroundColor: '#4E4E94',
                        color: '#fff',
                        boxShadow: '0 4px 20px rgba(78,78,148,0.25)',
                      }}
                    >
                      <List size={16} />
                      View My Issues
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        setResult(null);
                        setWorkflowSteps({
                          user_input: { status: 'pending', message: 'Waiting for user input...' },
                          gemini_analysis: { status: 'pending', message: 'Pending...' },
                          nlp_classification: { status: 'pending', message: 'Pending...' },
                          output: { status: 'pending', message: 'Pending...' }
                        });
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border"
                      style={{
                        borderColor: 'rgba(78,78,148,0.3)',
                        backgroundColor: '#fff',
                        color: '#4E4E94',
                      }}
                    >
                      Test Again
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6" style={{ borderColor: 'rgba(78,78,148,0.2)' }}>
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1A1A2E' }}>
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows="4"
                    value={complaintText}
                    onChange={(e) => setComplaintText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all resize-none"
                    style={{
                      borderColor: 'rgba(78,78,148,0.2)',
                      backgroundColor: '#fff',
                      color: '#1A1A2E',
                    }}
                    required
                  />
                </div>

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
                        placeholder="e.g., 107"
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
                    className="p-4 rounded-lg flex items-start gap-3"
                    style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}
                  >
                    <AlertCircle size={20} style={{ color: '#EF4444' }} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm" style={{ color: '#EF4444' }}>Error</p>
                      <p className="text-sm mt-1" style={{ color: '#EF4444' }}>{error}</p>
                    </div>
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
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing Workflow...
                    </>
                  ) : (
                    'Submit & Analyze'
                  )}
                </motion.button>
              </div>
            </form>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
