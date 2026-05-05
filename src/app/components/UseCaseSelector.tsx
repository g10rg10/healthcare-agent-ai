import { useState } from 'react';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import { User, UserCog, ArrowRight } from 'lucide-react';

type ViewMode = 'selector' | 'patient' | 'doctor';

export default function UseCaseSelector() {
  const [viewMode, setViewMode] = useState<ViewMode>('selector');

  if (viewMode === 'patient') {
    return (
      <PatientDashboard
        onBackToSelector={() => setViewMode('selector')}
        onSwitchToDoctor={() => setViewMode('doctor')}
      />
    );
  }

  if (viewMode === 'doctor') {
    return (
      <DoctorDashboard
        onBackToSelector={() => setViewMode('selector')}
        onSwitchToPatient={() => setViewMode('patient')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-xl bg-red-600 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Swiss Health Portal</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Secure medical document exchange platform for patients and healthcare providers
          </p>
        </div>

        {/* Portal Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Portal */}
          <button
            onClick={() => setViewMode('patient')}
            className="group bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 hover:border-[#3D38F5] hover:shadow-xl transition-all text-left"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="w-8 h-8" style={{ color: '#3D38F5' }} />
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-[#3D38F5] group-hover:translate-x-1 transition-all" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">Patient Portal</h3>
            <p className="text-gray-600 mb-4">
              Upload your medical documents securely before your hospital visit. Access your health records and upcoming appointments.
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#3D38F5' }}></div>
                <span>Upload documents via drag & drop</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#3D38F5' }}></div>
                <span>Capture photos with mobile camera</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#3D38F5' }}></div>
                <span>View appointment details</span>
              </div>
            </div>
          </button>

          {/* Doctor Portal */}
          <button
            onClick={() => setViewMode('doctor')}
            className="group bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 hover:border-[#3D38F5] hover:shadow-xl transition-all text-left"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserCog className="w-8 h-8" style={{ color: '#3D38F5' }} />
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-[#3D38F5] group-hover:translate-x-1 transition-all" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">Doctor Portal</h3>
            <p className="text-gray-600 mb-4">
              Access patient medical records, review uploaded documents, and manage consultation workflows at OEC Lugano.
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#3D38F5' }}></div>
                <span>View upcoming consultations</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#3D38F5' }}></div>
                <span>Review patient document status</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#3D38F5' }}></div>
                <span>Upload missing documents</span>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Protected by Swiss Federal Data Protection Act (FADP) • Ospedale Civico di Lugano (OEC)
          </p>
        </div>
      </div>
    </div>
  );
}
