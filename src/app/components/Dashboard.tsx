import { useState } from 'react';
import { Camera, Upload, Calendar, Clock, Mail, Phone, FileText, User, Menu, X, Plus } from 'lucide-react';
import sanoIcon from '../../assets/sano-icon.png';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'upload' | 'received'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      setUploadedFiles(prev => [...prev, file.name]);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        setUploadedFiles(prev => [...prev, file.name]);
      });
    }
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        setUploadedFiles(prev => [...prev, target.files![0].name]);
      }
    };
    input.click();
  };

  const appointments = [
    {
      id: 1,
      doctor: 'Dr. med. Peter Müller',
      specialty: 'Cardiologist',
      email: 'petermuller@gmail.com',
      phone: '+41 89 243 55 97',
      date: 'Fr, 3 January, 2026',
      time: '14:30',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop'
    },
    {
      id: 2,
      doctor: 'Dr. med. Andreas Meyer',
      specialty: 'GI-Chirurgen',
      date: 'Fr, 7 February, 2026',
      time: '10:00 - 12:00',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop'
    }
  ];

  const requests = [
    {
      id: 1,
      from: 'Universitätsspital Zürich',
      requestType: 'Blood Test Results',
      date: '2026-04-15',
      status: 'pending'
    },
    {
      id: 2,
      from: 'Klinik Hirslanden',
      requestType: 'X-Ray Images',
      date: '2026-04-10',
      status: 'pending'
    }
  ];

  const receivedDocs = [
    {
      id: 1,
      name: 'Cardiology Report 2026.pdf',
      from: 'Dr. med. Peter Müller',
      date: '2026-01-05',
      size: '2.4 MB'
    },
    {
      id: 2,
      name: 'Blood Test Results.pdf',
      from: 'Universitätsspital Zürich',
      date: '2026-03-12',
      size: '1.1 MB'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={sanoIcon} alt="Sano" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="font-semibold text-gray-900">Sano</h1>
                <p className="text-sm text-gray-500">Clinical Data Intelligence</p>
              </div>
            </div>

            <button
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-200">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
                    alt="John Doe"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">John Doe</p>
                  <p className="text-gray-500">Patient ID: CH-2026-4521</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-200">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
                    alt="John Doe"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">John Doe</p>
                  <p className="text-gray-500">Patient ID: CH-2026-4521</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Section - Upload Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Your Data / Medical History</h2>

              {/* Disclaimer */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#3D38F5' }}>
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      This is a secure channel for submitting sensitive medical documents in compliance with Swiss Federal Data Protection Act (FADP). All data transmitted through this portal is encrypted and will be securely sent to <span className="font-semibold">Ospedale Civico di Lugano (OEC)</span>. Your personal health information is handled with the highest standards of confidentiality and privacy protection.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'upload'
                      ? 'text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={activeTab === 'upload' ? { backgroundColor: '#3D38F5' } : {}}
                >
                  Upload Documents
                </button>
                <button
                  onClick={() => setActiveTab('received')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'received'
                      ? 'text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={activeTab === 'received' ? { backgroundColor: '#3D38F5' } : {}}
                >
                  Received Documents
                </button>
              </div>

              {/* Upload Tab */}
              {activeTab === 'upload' && (
                <div className="space-y-6">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 lg:p-12 transition-all ${
                      isDragging
                        ? 'border-[#3D38F5] bg-blue-50'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8" style={{ color: '#3D38F5' }} />
                      </div>
                      <p className="text-gray-700 font-medium mb-2">Drag and drop files here</p>
                      <p className="text-sm text-gray-500 mb-4">or</p>
                      <label>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.tiff"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <span
                          className="inline-block px-6 py-3 rounded-lg text-white font-medium cursor-pointer hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: '#3D38F5' }}
                        >
                          Click here to upload
                        </span>
                      </label>
                      <p className="text-xs text-gray-400 mt-4">
                        Supported formats: PDF, JPG, JPEG, PNG, TIFF up to 50 mb
                      </p>
                      <p className="text-xs text-gray-400">
                        File size should be maximum 50 mb and it shouldn't be password protected
                      </p>
                    </div>
                  </div>

                  {/* Camera Capture Button */}
                  <button
                    onClick={handleCameraCapture}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    style={{ borderColor: '#3D38F5' }}
                  >
                    <Camera className="w-5 h-5" style={{ color: '#3D38F5' }} />
                    <span>Capture Photo of Document</span>
                  </button>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-900">Uploaded Files ({uploadedFiles.length})</h3>
                      <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{file}</p>
                                <p className="text-xs text-gray-500">Uploaded successfully</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                              className="text-red-500 hover:text-red-700 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Received Documents Tab */}
              {activeTab === 'received' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Documents shared with you by healthcare providers.
                  </p>
                  {receivedDocs.map((doc) => (
                    <div key={doc.id} className="border border-gray-200 rounded-xl p-4 hover:border-[#3D38F5] transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3D38F5' }}>
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{doc.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">From: {doc.from}</p>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                            <span>Date: {doc.date}</span>
                            <span>Size: {doc.size}</span>
                          </div>
                        </div>
                        <button
                          className="px-4 py-2 rounded-lg text-white font-medium text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                          style={{ backgroundColor: '#3D38F5' }}
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Appointments */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-6" style={{ color: '#3D38F5' }}>
                Upcoming Appointment
              </h2>

              <div className="space-y-6">
                {appointments.map((appointment, index) => (
                  <div key={appointment.id} className={index === 0 ? 'pb-6' : 'pb-6 border-t border-gray-100 pt-6'}>
                    <div className="flex flex-col items-center text-center mb-4">
                      <div className="w-24 h-24 rounded-full overflow-hidden mb-3 ring-4 ring-blue-50">
                        <img
                          src={appointment.image}
                          alt={appointment.doctor}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900" style={index === 0 ? { color: '#3D38F5' } : {}}>
                        {appointment.doctor}
                      </h3>
                      <p className="text-sm text-gray-600">{appointment.specialty}</p>
                      {appointment.email && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                          <Mail className="w-3 h-3" />
                          <span>{appointment.email}</span>
                        </div>
                      )}
                      {appointment.phone && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone className="w-3 h-3" />
                          <span>{appointment.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                        <Calendar className="w-4 h-4" style={{ color: '#3D38F5' }} />
                        <span className="text-sm font-medium text-gray-700">{appointment.date}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                        <Clock className="w-4 h-4" style={{ color: '#3D38F5' }} />
                        <span className="text-sm font-medium text-gray-700">{appointment.time}</span>
                      </div>
                    </div>

                    {index === 0 && (
                      <button
                        className="w-full mt-4 px-4 py-2 rounded-lg text-white font-medium text-sm hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#3D38F5' }}
                      >
                        Reschedule
                      </button>
                    )}
                  </div>
                ))}

                <button className="w-full px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium text-sm hover:bg-gray-200 transition-colors">
                  View All Appointments
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
