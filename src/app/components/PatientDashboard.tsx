import { useState } from 'react';
import { Camera, Upload, Calendar, Clock, Mail, Phone, FileText, Menu, X, RefreshCw, CheckCircle, Bot, AlertCircle, MapPin, X as XIcon } from 'lucide-react';

interface PatientDashboardProps {
  onBackToSelector?: () => void;
  onSwitchToDoctor?: () => void;
}

export default function PatientDashboard({ onBackToSelector, onSwitchToDoctor }: PatientDashboardProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'sent'>('upload');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sentDocs, setSentDocs] = useState<Array<{id: number, name: string, from: string, date: string, size: string}>>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [documentChecklist, setDocumentChecklist] = useState<Array<{name: string, uploaded: boolean, fileName?: string, file?: File}>>([
    { name: 'Medical History Report', uploaded: false },
    { name: 'Blood Test Results', uploaded: false },
    { name: 'Current Medications List', uploaded: false },
    { name: 'Insurance Card', uploaded: false },
    { name: 'ID/Passport Copy', uploaded: false }
  ]);
  const [aiRenameSuggestions, setAiRenameSuggestions] = useState<Array<{original: string, suggested: string, index: number}>>([]);
  const [hasAppliedAI, setHasAppliedAI] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [showDisclaimerMobile, setShowDisclaimerMobile] = useState(false);
  const [mobileTab, setMobileTab] = useState<'data' | 'appointment'>('data');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{name: string, file: File}>>([]);

  // Add example messy files on component mount for demo
  const loadExampleFiles = () => {
    const exampleFiles = [
      { name: 'IMG_2847.jpg', file: new File([], 'IMG_2847.jpg') },
      { name: 'scan001.pdf', file: new File([], 'scan001.pdf') },
      { name: 'documento_medico.pdf', file: new File([], 'documento_medico.pdf') },
      { name: 'Photo_May_02_2026.png', file: new File([], 'Photo_May_02_2026.png') },
      { name: 'file123.pdf', file: new File([], 'file123.pdf') }
    ];
    setUploadedFiles(exampleFiles);
    // Reset AI applied flag when example files are loaded
    setHasAppliedAI(false);
  };

  // Handle drag and drop
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
    const newFiles = files.map(file => ({ name: file.name, file }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    // Reset AI applied flag when new files are added
    setHasAppliedAI(false);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newFiles = files.map(file => ({ name: file.name, file }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
      // Reset AI applied flag when new files are added
      setHasAppliedAI(false);
    }
  };

  // Handle camera capture
  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        setUploadedFiles(prev => [...prev, { name: file.name, file }]);
        // Reset AI applied flag when new files are added
        setHasAppliedAI(false);
      }
    };
    input.click();
  };

  // Remove uploaded file
  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    // Reset AI applied flag if all files are removed
    if (uploadedFiles.length === 1) {
      setHasAppliedAI(false);
    }
  };

  // Handle individual document upload
  const handleDocumentUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const updatedChecklist = [...documentChecklist];
      updatedChecklist[index] = {
        ...updatedChecklist[index],
        uploaded: true,
        fileName: file.name,
        file: file
      };
      setDocumentChecklist(updatedChecklist);
    }
  };

  // Remove individual document
  const removeDocument = (index: number) => {
    const updatedChecklist = [...documentChecklist];
    updatedChecklist[index] = {
      ...updatedChecklist[index],
      uploaded: false,
      fileName: undefined,
      file: undefined
    };
    setDocumentChecklist(updatedChecklist);
  };

  // AI File Organization - show suggestions
  const triggerAIOrganization = () => {
    const suggestions = uploadedFiles.map((fileObj, index) => {
      const ext = fileObj.name.split('.').pop() || 'pdf';
      const lowerName = fileObj.name.toLowerCase();

      let suggestedName = '';
      if (lowerName.includes('medical') || lowerName.includes('history') || lowerName.includes('report') || lowerName.includes('cardio')) {
        suggestedName = `Medical History Report.${ext}`;
      } else if (lowerName.includes('blood') || lowerName.includes('lab') || lowerName.includes('test')) {
        suggestedName = `Blood Test Results.${ext}`;
      } else if (lowerName.includes('med') || lowerName.includes('prescription') || lowerName.includes('pharma')) {
        suggestedName = `Current Medications List.${ext}`;
      } else if (lowerName.includes('insurance') || lowerName.includes('assicurazione') || lowerName.includes('card')) {
        suggestedName = `Insurance Card.${ext}`;
      } else if (lowerName.includes('id') || lowerName.includes('passport') || lowerName.includes('carta')) {
        suggestedName = `ID-Passport Copy.${ext}`;
      } else {
        // Default suggestion based on order
        const suggestions = [
          `Medical History Report.${ext}`,
          `Blood Test Results.${ext}`,
          `Current Medications List.${ext}`,
          `Insurance Card.${ext}`,
          `ID-Passport Copy.${ext}`
        ];
        suggestedName = suggestions[index % suggestions.length];
      }

      return {
        original: fileObj.name,
        suggested: suggestedName,
        index
      };
    });
    setAiRenameSuggestions(suggestions);
  };

  // Apply single rename suggestion
  const applySingleRename = (suggestionIndex: number) => {
    const suggestion = aiRenameSuggestions[suggestionIndex];
    const updatedFiles = [...uploadedFiles];
    updatedFiles[suggestion.index] = {
      ...updatedFiles[suggestion.index],
      name: suggestion.suggested
    };
    setUploadedFiles(updatedFiles);

    // Remove this suggestion
    setAiRenameSuggestions(prev => prev.filter((_, i) => i !== suggestionIndex));

    // Mark AI as applied
    setHasAppliedAI(true);
  };

  // Apply all rename suggestions
  const applyAllRenames = () => {
    const updatedFiles = uploadedFiles.map((fileObj, index) => {
      const suggestion = aiRenameSuggestions.find(s => s.index === index);
      if (suggestion) {
        return { ...fileObj, name: suggestion.suggested };
      }
      return fileObj;
    });
    setUploadedFiles(updatedFiles);
    setAiRenameSuggestions([]);
    setHasAppliedAI(true);
  };


  const handleSubmitDocuments = () => {
    // Create new sent documents from uploaded files
    const newSentDocs = uploadedFiles.map((fileObj, index) => ({
      id: Date.now() + index,
      name: fileObj.name,
      from: 'OEC Lugano - Dr. med. Peter Müller',
      date: new Date().toISOString().split('T')[0],
      size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`
    }));

    // Add to sent documents
    setSentDocs(prev => [...newSentDocs, ...prev]);

    // Clear uploaded files
    setUploadedFiles([]);

    // Clear AI suggestions
    setAiRenameSuggestions([]);

    // Reset AI applied flag
    setHasAppliedAI(false);

    // Show confirmation
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 5000);
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
    }
  ];


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-2 lg:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg bg-red-600 flex items-center justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-sm lg:text-base font-semibold text-gray-900">Swiss Health Portal</h1>
                <p className="text-xs lg:text-sm text-gray-500">Secure Medical Data Platform</p>
              </div>
            </div>

            <button
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="hidden lg:flex items-center gap-4">
              {onSwitchToDoctor && (
                <button
                  onClick={onSwitchToDoctor}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
                  title="Switch to Doctor View"
                >
                  <RefreshCw className="w-4 h-4 text-purple-700" />
                  <span className="text-sm font-medium text-purple-700">Doctor View</span>
                </button>
              )}
              <div className="flex items-center gap-3">
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
              <div className="flex items-center gap-3 px-4 py-3">
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
      <main className="px-4 sm:px-6 lg:px-8 py-3 lg:py-8">
        {/* Mobile Tabs - Only visible on mobile */}
        <div className="lg:hidden mb-3">
          <div className="flex gap-1.5 bg-white rounded-2xl shadow-sm border border-gray-200 p-1.5">
            <button
              onClick={() => setMobileTab('data')}
              className={`flex-1 px-2 py-2.5 rounded-xl font-medium text-xs transition-all flex flex-col items-center gap-0.5 ${
                mobileTab === 'data'
                  ? 'text-white shadow-md'
                  : 'text-gray-600'
              }`}
              style={mobileTab === 'data' ? { backgroundColor: '#3D38F5' } : {}}
            >
              <Upload className="w-4 h-4" />
              <span>Your Data</span>
            </button>
            <button
              onClick={() => setMobileTab('appointment')}
              className={`flex-1 px-2 py-2.5 rounded-xl font-medium text-xs transition-all flex flex-col items-center gap-0.5 ${
                mobileTab === 'appointment'
                  ? 'text-white shadow-md'
                  : 'text-gray-600'
              }`}
              style={mobileTab === 'appointment' ? { backgroundColor: '#3D38F5' } : {}}
            >
              <Calendar className="w-4 h-4" />
              <span>Appointment</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Section - Upload Area */}
          <div className={`lg:col-span-2 space-y-6 ${mobileTab !== 'data' ? 'hidden lg:block' : ''}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 lg:p-6">
              <h2 className="text-lg lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-2">Your Data</h2>

              {/* Disclaimer - Desktop Version */}
              <div className="hidden lg:block mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
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

              {/* Disclaimer - Mobile Version (Collapsible) */}
              <div className="lg:hidden mb-3">
                <button
                  onClick={() => setShowDisclaimerMobile(!showDisclaimerMobile)}
                  className="w-full flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#3D38F5' }}>
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">Privacy & Security Info</span>
                  </div>
                  <div className={`transform transition-transform ${showDisclaimerMobile ? 'rotate-180' : ''}`}>
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {showDisclaimerMobile && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-xs text-gray-700 leading-relaxed">
                      This is a secure channel for submitting sensitive medical documents in compliance with Swiss Federal Data Protection Act (FADP). All data transmitted through this portal is encrypted and will be securely sent to <span className="font-semibold">Ospedale Civico di Lugano (OEC)</span>. Your personal health information is handled with the highest standards of confidentiality and privacy protection.
                    </p>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex items-center justify-between gap-4 mb-3 lg:mb-6">
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'upload'
                        ? 'text-[#3D38F5] border-b-2 border-[#3D38F5]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Upload Documents
                  </button>
                  <button
                    onClick={() => setActiveTab('sent')}
                    className={`px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'sent'
                        ? 'text-[#3D38F5] border-b-2 border-[#3D38F5]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Sent Documents
                  </button>
                </div>

                {/* Smart Renaming Button - only show if files uploaded, no suggestions showing, and hasn't been applied yet */}
                {uploadedFiles.length > 0 && aiRenameSuggestions.length === 0 && activeTab === 'upload' && (
                  <button
                    onClick={triggerAIOrganization}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg group animate-fade-in"
                  >
                    <Bot className="w-4 h-4" />
                    <span className="hidden sm:inline">Smart Renaming</span>
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Upload Tab */}
              {activeTab === 'upload' && (
                <div className="space-y-3 lg:space-y-4">
                  {/* Success Message */}
                  {showConfirmation && (
                    <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 animate-fade-in">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-green-900 text-lg mb-1">Files Transmitted Successfully!</h4>
                          <p className="text-sm text-green-700">Your documents have been securely sent to OEC Lugano - Dr. med. Peter Müller</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Rename Suggestions */}
                  {aiRenameSuggestions.length > 0 && (
                    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 border-2 border-purple-300 rounded-xl p-4 lg:p-6 space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Smart Renaming</h4>
                            <p className="text-xs text-gray-600">Intelligent filename suggestions for your documents</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setAiRenameSuggestions([])}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <XIcon className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {aiRenameSuggestions.map((suggestion, index) => (
                          <div key={index} className="bg-white rounded-xl p-3 border border-purple-200">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-purple-600" />
                              </div>
                              <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
                                <span className="text-sm text-gray-400 truncate shrink min-w-0 line-through">{suggestion.original}</span>
                                <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                <span className="text-sm font-semibold text-purple-900 truncate shrink min-w-0">{suggestion.suggested}</span>
                              </div>
                              <button
                                onClick={() => applySingleRename(index)}
                                className="px-2.5 py-1 rounded-lg font-medium text-xs text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all flex-shrink-0"
                              >
                                Accept
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={applyAllRenames}
                        className="w-full px-4 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all shadow-md"
                      >
                        Accept All Changes
                      </button>
                    </div>
                  )}

                  {/* Uploaded Files List - show when files are uploaded and no AI suggestions */}
                  {uploadedFiles.length > 0 && aiRenameSuggestions.length === 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-base text-gray-900">Uploaded Files ({uploadedFiles.length})</h3>
                      <div className="space-y-2">
                        {uploadedFiles.map((fileObj, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">{fileObj.name}</p>
                                <p className="text-xs text-gray-500">Uploaded successfully</p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeUploadedFile(index)}
                              className="text-gray-400 hover:text-red-600 transition-colors ml-2 flex-shrink-0"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Drag and Drop Area - show when no files uploaded and no AI suggestions and no confirmation */}
                  {uploadedFiles.length === 0 && aiRenameSuggestions.length === 0 && !showConfirmation && (
                    <div className="space-y-4">
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-12 transition-all ${
                          isDragging
                            ? 'border-[#3D38F5] bg-blue-50'
                            : 'border-gray-300 bg-gray-50'
                        }`}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                            <Upload className="w-8 h-8" style={{ color: '#3D38F5' }} />
                          </div>
                          <p className="text-base text-gray-700 font-medium mb-2">Drag and drop files here</p>
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
                              className="inline-block px-6 py-3 rounded-lg text-white text-base font-medium cursor-pointer hover:opacity-90 transition-opacity"
                              style={{ backgroundColor: '#3D38F5' }}
                            >
                              Click here to upload
                            </span>
                          </label>
                          <div className="mt-6 text-xs text-gray-400 space-y-1">
                            <p>Supported formats: PDF, JPG, JPEG, PNG, TIFF up to 50 mb</p>
                            <p>File size should be maximum 50 mb and it shouldn't be password protected</p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleCameraCapture}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 rounded-xl text-gray-700 text-base font-medium hover:bg-gray-50 transition-colors"
                        style={{ borderColor: '#3D38F5' }}
                      >
                        <Camera className="w-5 h-5" style={{ color: '#3D38F5' }} />
                        <span>Capture Photo of Document</span>
                      </button>

                      {/* Demo button */}
                      <div className="pt-2 border-t border-gray-200">
                        <button
                          onClick={loadExampleFiles}
                          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          Load Example Files (Demo)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Submit Button - hide when showing AI suggestions */}
                  {uploadedFiles.length > 0 && aiRenameSuggestions.length === 0 && (
                    <button
                      onClick={handleSubmitDocuments}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 lg:py-3 rounded-xl text-white text-base lg:text-sm font-semibold hover:opacity-90 transition-opacity shadow-md"
                      style={{ backgroundColor: '#3D38F5' }}
                    >
                      <Upload className="w-5 h-5" />
                      <span>Submit Documents</span>
                    </button>
                  )}
                </div>
              )}

              {/* Sent Documents Tab */}
              {activeTab === 'sent' && (
                <div className="space-y-4">
                  <p className="text-sm lg:text-sm text-gray-600 mb-4">
                    Documents you have sent to the hospital.
                  </p>
                  {sentDocs.length === 0 ? (
                    <div className="text-center py-12 lg:py-12 border border-gray-200 rounded-xl bg-gray-50">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-base lg:text-sm font-medium text-gray-700">No documents sent yet</p>
                      <p className="text-sm lg:text-xs text-gray-500 mt-2 lg:mt-1 px-4">Upload and submit documents to see them here</p>
                    </div>
                  ) : (
                    <>
                      {sentDocs.map((doc) => (
                        <div key={doc.id} className="border border-gray-200 rounded-xl p-4 lg:p-4 hover:border-[#3D38F5] transition-colors">
                          <div className="flex flex-col lg:flex-row items-start gap-4">
                            <div className="flex items-start gap-4 flex-1 w-full">
                              <div className="w-12 h-12 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#3D38F5' }}>
                                <FileText className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-2">
                                  <h3 className="text-base lg:text-base font-semibold text-gray-900 truncate flex-1">{doc.name}</h3>
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full whitespace-nowrap">
                                    Sent
                                  </span>
                                </div>
                                <p className="text-sm lg:text-sm text-gray-600 mt-1">Sent to: {doc.from}</p>
                                <div className="flex flex-wrap gap-3 mt-2 text-xs lg:text-xs text-gray-500">
                                  <span>Date: {doc.date}</span>
                                  <span>Size: {doc.size}</span>
                                </div>
                              </div>
                            </div>
                            <button
                              className="w-full lg:w-auto px-4 py-3 lg:py-2 rounded-xl lg:rounded-lg text-white font-medium text-base lg:text-sm hover:opacity-90 transition-opacity"
                              style={{ backgroundColor: '#3D38F5' }}
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Right Section - Appointment Panel */}
          <div className={`lg:col-span-1 ${mobileTab === 'appointment' ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 lg:sticky lg:top-24 max-h-[calc(100vh-120px)] flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                {/* Upcoming Appointment */}
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
                          <>
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center gap-2 text-sm mb-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-900">Room 204, OEC Lugano</span>
                              </div>
                              <p className="text-xs text-gray-600">
                                Please bring your insurance card and any recent medical documents.
                              </p>
                            </div>
                            <button
                              className="w-full mt-4 px-4 py-2 rounded-lg text-white font-medium text-sm hover:opacity-90 transition-opacity"
                              style={{ backgroundColor: '#3D38F5' }}
                            >
                              Reschedule
                            </button>
                          </>
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
        </div>
      </main>

      {/* AI File Organization Modal */}
      {showRenameDialog && uploadedFiles.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#3D38F5' }}>
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">AI File Organization</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Let me help organize and rename your files based on their content
                </p>
              </div>
              <button
                onClick={() => setShowRenameDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* File Renaming Suggestions */}
            <div className="space-y-3 mb-6">
              {uploadedFiles.map((fileName, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{fileName}</span>
                  </div>
                  <span className="text-gray-400">→</span>
                  <div className="flex-1">
                    <span className="text-sm text-green-700 font-medium">{suggestFileName(fileName, idx)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRenameDialog(false);
                  const renamedFiles = uploadedFiles.map((fileName, idx) => suggestFileName(fileName, idx));
                  setUploadedFiles(renamedFiles);
                }}
                className="flex-1 px-4 py-3 text-white font-medium rounded-xl hover:opacity-90"
                style={{ backgroundColor: '#3D38F5' }}
              >
                Yes, organize my files
              </button>
              <button
                onClick={() => setShowRenameDialog(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200"
              >
                Keep original names
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
