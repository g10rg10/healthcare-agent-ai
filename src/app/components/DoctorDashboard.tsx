import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, FileText, Upload, User, AlertCircle, CheckCircle, Clock, Scan, Send, RotateCcw, Edit3, Bot, Download, RefreshCw, Edit2, X as XIcon, Check, Plus, Trash2, Sparkles, Calendar, Activity, TrendingUp, Pill, Users, Heart, Mail, Phone, Eye, UserX, MapPin, Mic, MicOff } from 'lucide-react';
import sanoIcon from '../../assets/sano-icon.png';

const getTestPrompts = (name: string) => [
  `Show me ${name}'s latest blood test results, check for any allergy conflicts with current medications, and flag any abnormal lab values`,
  `What medications is ${name} currently on? Are there any known drug interactions or allergy contraindications?`,
  `Give me a full clinical overview of ${name}: active conditions, current medications, allergies, and latest lab results`,
  `${name} is reporting new symptoms — summarize the current clinical picture and list what to verify before the consultation`,
  `What are the 3 most critical clinical points to keep in mind for ${name}'s upcoming visit, including drugs to avoid and out-of-range labs?`,
  `Pull ${name}'s full medical history and documented allergies, then assess the overall risk profile`,
  `Are there any drug interactions or dosage concerns in ${name}'s current medication regimen?`,
  `Summarize ${name}'s chronic conditions and tell me whether current medications are appropriately managing them`,
  `What lab values for ${name} are outside the normal range, and what is the clinical significance?`,
  `I have a visit with ${name} shortly — give me a quick pre-visit briefing: key issues, alerts, and recommended checks`,
];
import { sendMessage, buildPatientContext } from '../../services/gemini';

interface DoctorDashboardProps {
  onBackToSelector?: () => void;
  onSwitchToPatient?: () => void;
}

type EditSection = 'patient-id' | 'allergies' | 'symptoms' | 'medications' | null;
type TabType = 'overview' | 'history' | 'medications' | 'documents' | 'timeline';

export default function DoctorDashboard({ onBackToSelector, onSwitchToPatient }: DoctorDashboardProps) {
  const [selectedPatient, setSelectedPatient] = useState<string | null>('CH-2026-4521');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSection, setEditingSection] = useState<EditSection>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [chatInput, setChatInput] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);
  const [newPatientCounter, setNewPatientCounter] = useState(1);
  const [uploadedAIFiles, setUploadedAIFiles] = useState<string[]>([]);
  const [extraDocuments, setExtraDocuments] = useState<Array<{id: number; name: string; type: string; date: string; size: string}>>([]);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiProcessingSteps, setAiProcessingSteps] = useState<string[]>([]);
  const [sharedWithTeam, setSharedWithTeam] = useState<{[key: string]: boolean}>({});
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant' | 'suggestion' | 'appointment-confirm', content: string, medId?: number, originalName?: string, suggestedName?: string, appointmentData?: {date: string; time: string; notes: string}}>>([]);
  const [rightTab, setRightTab] = useState<'appointment' | 'documents' | 'meetings'>('documents');
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [docRenameSuggestions, setDocRenameSuggestions] = useState<Array<{id: number; original: string; suggested: string}>>([]);
  const [docRenamePanelVisible, setDocRenamePanelVisible] = useState(false);
  const [editingRenameId, setEditingRenameId] = useState<number | null>(null);
  const [editingRenameValue, setEditingRenameValue] = useState('');
  const [docNameOverrides, setDocNameOverrides] = useState<Record<string | number, string>>({});
  const [showPastConversations, setShowPastConversations] = useState(false);
  const [activeConvTab, setActiveConvTab] = useState<'list' | 'current' | number>('current');
  const [showPastConvList, setShowPastConvList] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Pending appointment from AI
  const [pendingAppointment, setPendingAppointment] = useState<{ date: string; time: string; notes: string } | null>(null);

  // Meeting recording
  const [meetingState, setMeetingState] = useState<'idle' | 'recording' | 'review'>('idle');
  const [meetingTranscript, setMeetingTranscript] = useState('');
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [meetingSummary, setMeetingSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [savedMeetings, setSavedMeetings] = useState<Array<{
    id: number; patientId: string; patientName: string;
    date: string; duration: number; transcript: string; summary?: string;
  }>>([]);
  const [viewingMeeting, setViewingMeeting] = useState<number | null>(null);
  const meetingRecognitionRef = useRef<SpeechRecognition | null>(null);
  const meetingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const meetingTranscriptRef = useRef('');

  // Chat autoscroll refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Autoscroll to bottom when chat messages change
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages.length]);

  // Cleanup speech recognition and meeting timer on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      meetingRecognitionRef.current?.abort();
      if (meetingTimerRef.current) clearInterval(meetingTimerRef.current);
    };
  }, []);

  // Past conversations by patient
  const [pastConversations, setPastConversations] = useState<{ [key: string]: Array<{date: string, summary: string, messages: Array<{role: 'user' | 'assistant', content: string}>}> }>({
    'CH-2026-4521': [
      {
        date: '2026-04-28',
        summary: 'Medication review and allergy check',
        messages: [
          { role: 'user', content: 'What are Lucia\'s current medications?' },
          { role: 'assistant', content: 'Lucia Rossi is currently taking the following medications:\n\n1. **Atorvastatin** - 20mg, Once daily\n2. **Lisinopril** - 10mg, Once daily\n3. **Aspirin** - 81mg, Once daily' },
          { role: 'user', content: 'Any allergies to note?' },
          { role: 'assistant', content: 'Yes, Lucia has documented allergies to:\n\n• **Penicillin** - Moderate severity\n• **Sulfa drugs** - Mild severity\n\nPlease ensure alternative antibiotics are prescribed if needed.' }
        ]
      },
      {
        date: '2026-04-25',
        summary: 'Blood test results discussion',
        messages: [
          { role: 'user', content: 'Show me the latest lab results' },
          { role: 'assistant', content: 'Latest lab results for Lucia Rossi:\n\n**Blood Test** (2026-04-20)\n• LDL Cholesterol: 145 mg/dL (slightly elevated)\n• HDL Cholesterol: 52 mg/dL (normal)\n• Blood Pressure: 138/88 mmHg (borderline high)\n\nRecommendation: Continue current statin therapy and monitor BP.' }
        ]
      }
    ],
    'CH-2026-4534': [
      {
        date: '2026-04-30',
        summary: 'Diabetes management consultation',
        messages: [
          { role: 'user', content: 'What medications is John currently taking?' },
          { role: 'assistant', content: 'John Doe is currently taking the following medications:\n\n1. **Metformin** - 1000mg, Twice daily\n2. **Glimepiride** - 2mg, Once daily before breakfast\n3. **Atorvastatin** - 40mg, Once daily\n\nAll medications are confirmed Swiss equivalents.' }
        ]
      }
    ]
  });

  // Get initial patient-specific data
  const getInitialPatientData = (patientId: string | null) => {
    if (!patientId) {
      return {
        name: '',
        dob: '',
        condition: { symptoms: [], onset: '', severity: 0, notes: '' },
        allergies: [],
        symptoms: [],
        medications: []
      };
    }
    if (patientId === 'CH-2026-4521') {
      // Lucia Rossi - PARTIAL data with cardiac issues
      return {
        name: 'Lucia Rossi',
        dob: '17 April 1995',
        condition: {
          symptoms: ['Chest pain', 'Shortness of breath', 'Fatigue'],
          onset: '2026-04-18',
          severity: 7,
          notes: 'Patient reports increased chest discomfort during physical activity. Pain radiates to left arm.'
        },
        allergies: [
          { id: 1, name: 'Lactose', severity: 'moderate', reaction: 'Digestive issues' },
          { id: 2, name: 'Penicillin', severity: 'severe', reaction: 'Anaphylaxis' }
        ],
        symptoms: [
          { id: 1, text: 'Chest tightness during exertion' },
          { id: 2, text: 'Difficulty breathing when lying flat' }
        ],
        medications: [
          {
            id: 1,
            name: 'Tritace 5mg',
            originalName: 'Ramipril-5mg-(IT-originale)',
            dose: '5 mg',
            frequency: '1x daily',
            route: 'Oral',
            since: '22.06.2024',
            prescribedBy: 'Dr. med. Peter Müller',
            status: 'active',
            hasError: false,
            confirmed: true
          },
          {
            id: 3,
            name: 'Bisoprolol 2.5 mg',
            originalName: 'Bisoprolol-(IT)',
            dose: '2.5 mg',
            frequency: '1x daily',
            route: 'Oral',
            since: '12.10.2025',
            prescribedBy: 'Dr. med. Peter Müller',
            status: 'active',
            hasError: true,
            confirmed: false,
            suggestedName: 'Bisoprolol-Mepha 2.5 mg'
          }
        ]
      };
    } else if (patientId === 'CH-2026-4512') {
      // Hans Schmidt - NO data
      return {
        name: 'Hans Schmidt',
        dob: '12 March 1988',
        condition: {
          symptoms: [],
          onset: '',
          severity: 0,
          notes: ''
        },
        allergies: [],
        symptoms: [],
        medications: []
      };
    } else if (patientId === 'CH-2026-4518') {
      // John Doe - COMPLETE data with digestive issues
      return {
        name: 'John Doe',
        dob: '15 May 1981',
        condition: {
          symptoms: ['Abdominal pain', 'Nausea', 'Bloating'],
          onset: '2026-04-12',
          severity: 5,
          notes: 'Patient experiencing persistent gastrointestinal discomfort. Symptoms worsen after meals.'
        },
        allergies: [
          { id: 1, name: 'Shellfish', severity: 'severe', reaction: 'Anaphylaxis, hives' },
          { id: 2, name: 'Ibuprofen', severity: 'moderate', reaction: 'Gastric irritation' }
        ],
        symptoms: [
          { id: 1, text: 'Bloating and gas after eating' },
          { id: 2, text: 'Intermittent diarrhea' },
          { id: 3, text: 'Loss of appetite' }
        ],
        medications: [
          {
            id: 1,
            name: 'Omeprazole 20mg',
            originalName: 'Omeprazolo-20mg-(IT)',
            dose: '20 mg',
            frequency: '1x daily before breakfast',
            route: 'Oral',
            since: '15.03.2026',
            prescribedBy: 'Dr. med. Andreas Meyer',
            status: 'active',
            hasError: false,
            confirmed: true
          },
          {
            id: 2,
            name: 'Iberogast',
            originalName: 'Digestivo-Naturale-(IT)',
            dose: '20 drops',
            frequency: '3x daily',
            route: 'Oral',
            since: '20.03.2026',
            prescribedBy: 'Dr. med. Andreas Meyer',
            status: 'active',
            hasError: false,
            confirmed: true
          }
        ]
      };
    } else {
      // New patients - ALL EMPTY
      return {
        name: '',
        dob: '',
        condition: {
          symptoms: [],
          onset: '',
          severity: 0,
          notes: ''
        },
        allergies: [],
        symptoms: [],
        medications: []
      };
    }
  };

  const initialData = getInitialPatientData(selectedPatient);

  // Editable data states
  const [patientFirstName, setPatientFirstName] = useState('Lucia');
  const [patientLastName, setPatientLastName] = useState('Rossi');
  const [patientDobDay, setPatientDobDay] = useState('17');
  const [patientDobMonth, setPatientDobMonth] = useState('04');
  const [patientDobYear, setPatientDobYear] = useState('1995');
  const [patientSex, setPatientSex] = useState('Female');
  const [patientAVS, setPatientAVS] = useState('756.1234.5678.97');
  const [patientNationality, setPatientNationality] = useState('Italian');
  const [patientPhonePrefix, setPatientPhonePrefix] = useState('+41');
  const [patientPhoneNumber, setPatientPhoneNumber] = useState('91 234 56 78');
  const [patientEmail, setPatientEmail] = useState('lucia.rossi@email.com');
  const [patientAddress, setPatientAddress] = useState('Via Nassa 12, 6900 Lugano, Switzerland');
  const [emergencyContact, setEmergencyContact] = useState('Marco Rossi (Husband) - +41 91 987 65 43');
  const [insuranceInfo, setInsuranceInfo] = useState('Helsana - Policy #: 80-12345-6');
  const [currentCondition, setCurrentCondition] = useState(initialData.condition);
  const [allergies, setAllergies] = useState(initialData.allergies);
  const [newAllergy, setNewAllergy] = useState('');
  const [symptoms, setSymptoms] = useState(initialData.symptoms);
  const [newSymptom, setNewSymptom] = useState('');
  const [medications, setMedications] = useState(initialData.medications);

  // Patient-specific data based on selected patient
  const getPatientData = () => {
    if (!selectedPatient) {
      return {
        careTeam: [],
        medicalHistory: [],
        documents: [],
        timeline: [],
        labResults: []
      };
    }
    if (selectedPatient === 'CH-2026-4521') {
      // Lucia Rossi - PARTIAL data
      return {
        careTeam: [
          {
            name: 'Dr. med. Peter Müller',
            role: 'Cardiologist (Primary)',
            phone: '+41 91 811 91 11',
            image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop'
          }
        ],
        medicalHistory: [
          {
            id: 1,
            condition: 'Hypertension',
            type: 'Chronic Condition',
            diagnosedDate: '2015-06-22',
            status: 'Active',
            notes: 'Well controlled with ACE inhibitors'
          },
          {
            id: 2,
            condition: 'Atrial Fibrillation',
            type: 'Cardiac Arrhythmia',
            diagnosedDate: '2022-11-08',
            status: 'Active',
            notes: 'Managed with beta-blockers, regular monitoring required'
          }
        ],
        documents: [
          {
            id: 1,
            name: 'Blood Test Results',
            type: 'Lab Results',
            category: 'reports',
            date: '2026-04-10',
            size: '1.1 MB'
          },
          {
            id: 2,
            name: 'Ramipril Prescription',
            type: 'Prescription',
            category: 'prescriptions',
            date: '2024-06-22',
            size: '0.3 MB'
          }
        ],
        timeline: [
          {
            id: 1,
            date: '2026-04-10',
            type: 'Lab',
            title: 'Blood Panel',
            description: 'Routine lipid panel and HbA1c test.',
            provider: 'OEC Laboratory'
          }
        ],
        labResults: [
          {
            test: 'Total Cholesterol',
            value: '5.2',
            unit: 'mmol/L',
            normalRange: '< 5.0',
            status: 'high',
            date: '2026-04-10'
          },
          {
            test: 'HbA1c',
            value: '6.8',
            unit: '%',
            normalRange: '< 6.5',
            status: 'high',
            date: '2026-04-10'
          }
        ]
      };
    } else if (selectedPatient === 'CH-2026-4512') {
      // Hans Schmidt - FULL data after AI processing
      return {
        careTeam: [
          {
            name: 'Dr. med. Klaus Weber',
            role: 'Orthopedic Specialist (Primary)',
            phone: '+49 30 555 9999',
            image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop'
          }
        ],
        medicalHistory: [
          {
            id: 1,
            condition: 'Chronic Lower Back Pain',
            type: 'Musculoskeletal',
            diagnosedDate: '2025-12-10',
            status: 'Active',
            notes: 'Degenerative disc disease L4-L5. Managed with NSAIDs and physiotherapy.'
          },
          {
            id: 2,
            condition: 'Herniated Disc L4-L5',
            type: 'Spinal Injury',
            diagnosedDate: '2024-08-15',
            status: 'Active',
            notes: 'MRI confirmed disc herniation. Conservative treatment ongoing.'
          }
        ],
        documents: [
          {
            id: 1,
            name: 'MRI Scan - Lumbar Spine',
            type: 'Imaging',
            category: 'reports',
            date: '2024-08-20',
            size: '3.2 MB'
          },
          {
            id: 2,
            name: 'Physiotherapy Report',
            type: 'Treatment Report',
            category: 'reports',
            date: '2026-03-15',
            size: '0.8 MB'
          },
          {
            id: 3,
            name: 'Pain Medication Prescription',
            type: 'Prescription',
            category: 'prescriptions',
            date: '2026-02-20',
            size: '0.2 MB'
          }
        ],
        timeline: [
          {
            id: 1,
            date: '2026-03-15',
            type: 'Visit',
            title: 'Physiotherapy Session',
            description: 'Regular physiotherapy session for lower back strengthening exercises.',
            provider: 'Physiotherapie Berlin Mitte'
          },
          {
            id: 2,
            date: '2026-02-20',
            type: 'Visit',
            title: 'Orthopedic Consultation',
            description: 'Follow-up consultation. Pain levels reduced with current treatment plan.',
            provider: 'Dr. med. Klaus Weber'
          },
          {
            id: 3,
            date: '2024-08-20',
            type: 'Lab',
            title: 'MRI Scan',
            description: 'Lumbar spine MRI showing herniated disc at L4-L5 level.',
            provider: 'Berlin Diagnostics Center'
          }
        ],
        labResults: [
          {
            test: 'C-Reactive Protein (CRP)',
            value: '3.2',
            unit: 'mg/L',
            normalRange: '< 5.0',
            status: 'normal',
            date: '2026-02-18'
          },
          {
            test: 'Vitamin D',
            value: '18',
            unit: 'ng/mL',
            normalRange: '> 30',
            status: 'low',
            date: '2026-02-18'
          }
        ]
      };
    } else if (selectedPatient === 'CH-2026-4518') {
      // John Doe - COMPLETE data
      return {
        careTeam: [
          {
            name: 'Dr. med. Peter Müller',
            role: 'Cardiologist (Primary)',
            phone: '+41 91 811 91 11',
            image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop'
          },
          {
            name: 'Dr. med. Andreas Meyer',
            role: 'GI Specialist',
            phone: '+41 91 811 92 22',
            image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop'
          },
          {
            name: 'Sophie Weber, RN',
            role: 'Primary Nurse',
            phone: '+41 91 811 93 33',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'
          }
        ],
        medicalHistory: [
          {
            id: 1,
            condition: 'Gastroesophageal Reflux Disease (GERD)',
            type: 'Chronic Condition',
            diagnosedDate: '2023-09-15',
            status: 'Active',
            notes: 'Managed with proton pump inhibitors, lifestyle modifications recommended'
          },
          {
            id: 2,
            condition: 'Cholecystectomy',
            type: 'Surgery',
            diagnosedDate: '2020-03-12',
            status: 'Resolved',
            notes: 'Laparoscopic gallbladder removal due to gallstones. Post-operative recovery normal.'
          },
          {
            id: 3,
            condition: 'Irritable Bowel Syndrome (IBS)',
            type: 'Chronic Condition',
            diagnosedDate: '2024-01-20',
            status: 'Active',
            notes: 'Ongoing symptoms, dietary management and herbal treatment initiated'
          }
        ],
        documents: [
          {
            id: 1,
            name: 'Cardiology Report - Annual Checkup',
            type: 'Report',
            category: 'reports',
            date: '2026-04-15',
            size: '2.4 MB'
          },
          {
            id: 2,
            name: 'Blood Test Results',
            type: 'Lab Results',
            category: 'reports',
            date: '2026-04-10',
            size: '1.1 MB'
          },
          {
            id: 3,
            name: 'Aspirin Prescription',
            type: 'Prescription',
            category: 'prescriptions',
            date: '2024-08-23',
            size: '0.3 MB'
          }
        ],
        timeline: [
          {
            id: 1,
            date: '2026-04-20',
            type: 'Visit',
            title: 'Cardiology Consultation',
            description: 'Follow-up for chest pain. ECG performed, results normal.',
            provider: 'Dr. med. Peter Müller'
          },
          {
            id: 2,
            date: '2026-04-10',
            type: 'Lab',
            title: 'Blood Panel',
            description: 'Routine lipid panel and HbA1c test.',
            provider: 'OEC Laboratory'
          },
          {
            id: 3,
            date: '2025-10-12',
            type: 'Hospitalization',
            title: 'Emergency Admission',
            description: 'Acute chest pain, 3-day observation. Discharged stable.',
            provider: 'OEC Lugano'
          }
        ],
        labResults: [
          {
            test: 'Total Cholesterol',
            value: '5.2',
            unit: 'mmol/L',
            normalRange: '< 5.0',
            status: 'high',
            date: '2026-04-10'
          },
          {
            test: 'LDL Cholesterol',
            value: '3.1',
            unit: 'mmol/L',
            normalRange: '< 3.0',
            status: 'high',
            date: '2026-04-10'
          },
          {
            test: 'HDL Cholesterol',
            value: '1.4',
            unit: 'mmol/L',
            normalRange: '> 1.0',
            status: 'normal',
            date: '2026-04-10'
          },
          {
            test: 'HbA1c',
            value: '6.8',
            unit: '%',
            normalRange: '< 6.5',
            status: 'high',
            date: '2026-04-10'
          }
        ]
      };
    } else {
      // New patients - NO data
      return {
        careTeam: [],
        medicalHistory: [],
        documents: [],
        timeline: [],
        labResults: []
      };
    }
  };

  const patientData = getPatientData();
  const careTeam = patientData.careTeam;
  const medicalHistory = patientData.medicalHistory;
  const documents = patientData.documents;
  const timeline = patientData.timeline;
  const labResults = patientData.labResults;

  // Update patient data when selected patient changes
  useEffect(() => {
    const newData = getInitialPatientData(selectedPatient);

    // Update patient-specific fields based on selected patient
    if (selectedPatient === 'CH-2026-4521') {
      // Lucia Rossi - FULL DATA
      setPatientFirstName('Lucia');
      setPatientLastName('Rossi');
      setPatientDobDay('17');
      setPatientDobMonth('04');
      setPatientDobYear('1995');
      setPatientSex('Female');
      setPatientAVS('756.1234.5678.97');
      setPatientNationality('Italian');
      setPatientPhonePrefix('+41');
      setPatientPhoneNumber('91 234 56 78');
      setPatientEmail('lucia.rossi@email.com');
      setPatientAddress('Via Nassa 12, 6900 Lugano, Switzerland');
      setEmergencyContact('Marco Rossi (Husband) - +41 91 987 65 43');
      setInsuranceInfo('Helsana - Policy #: 80-12345-6');
    } else if (selectedPatient === 'CH-2026-4512') {
      // Hans Schmidt - ONLY NAME
      setPatientFirstName('Hans');
      setPatientLastName('Schmidt');
      setPatientDobDay('');
      setPatientDobMonth('');
      setPatientDobYear('');
      setPatientSex('');
      setPatientAVS('');
      setPatientNationality('');
      setPatientPhonePrefix('+41');
      setPatientPhoneNumber('');
      setPatientEmail('');
      setPatientAddress('');
      setEmergencyContact('');
      setInsuranceInfo('');
    } else if (selectedPatient === 'CH-2026-4518') {
      // John Doe - FULL DATA
      setPatientFirstName('John');
      setPatientLastName('Doe');
      setPatientDobDay('15');
      setPatientDobMonth('05');
      setPatientDobYear('1981');
      setPatientSex('Male');
      setPatientAVS('756.5555.6666.88');
      setPatientNationality('American');
      setPatientPhonePrefix('+41');
      setPatientPhoneNumber('22 789 12 34');
      setPatientEmail('john.doe@email.com');
      setPatientAddress('Rue du Rhône 88, 1204 Geneva, Switzerland');
      setEmergencyContact('Jane Doe (Sister) - +41 22 345 67 89');
      setInsuranceInfo('Swica - Policy #: 75-11223-3');
    } else {
      // New patient - ALL EMPTY
      setPatientFirstName('');
      setPatientLastName('');
      setPatientDobDay('');
      setPatientDobMonth('');
      setPatientDobYear('');
      setPatientSex('');
      setPatientAVS('');
      setPatientNationality('');
      setPatientPhonePrefix('+41');
      setPatientPhoneNumber('');
      setPatientEmail('');
      setPatientAddress('');
      setEmergencyContact('');
      setInsuranceInfo('');
    }

    setCurrentCondition(newData.condition);
    setAllergies(newData.allergies);
    setSymptoms(newData.symptoms);
    setMedications(newData.medications);
    setEditingSection(null);
    setSharedWithTeam({});
    setChatMessages([]);
    setUploadedAIFiles([]);
    setExtraDocuments([]);
    setAiProcessingSteps([]);
    setDocRenameSuggestions([]);
    setDocRenamePanelVisible(false);
    setDocNameOverrides({});
    setActiveConvTab('current');
    setShowPastConvList(false);
  }, [selectedPatient]);

  const [patients, setPatients] = useState([
    {
      id: 'CH-2026-4521',
      name: 'Lucia Rossi',
      dob: '17 April 1995',
      age: 31,
      appointmentDate: '2026-05-12',
      appointmentTime: '14:30',
      appointments: [
        { date: 'May 12, 2026', time: '14:30', room: 'Room 108, OEC Lugano', duration: '45 minutes', status: 'Confirmed', notes: 'Routine follow-up for cardiovascular monitoring and lab result review.' }
      ],
      status: 'partial',
      uploadedDocs: 3,
      missingDocs: 2,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
      isDefault: true
    },
    {
      id: 'CH-2026-4518',
      name: 'John Doe',
      dob: '15 May 1981',
      age: 45,
      appointmentDate: '2026-05-08',
      appointmentTime: '10:00',
      appointments: [
        { date: 'May 8, 2026', time: '10:00', room: 'Room 204, OEC Lugano', duration: '30 minutes', status: 'Confirmed', notes: 'Follow-up consultation for medication review and health status assessment.' },
        { date: 'May 19, 2026', time: '15:00', room: 'Room 311, OEC Lugano', duration: '60 minutes', status: 'Pending', notes: 'Endocrinology specialist visit — diabetes management review and HbA1c evaluation.' }
      ],
      status: 'complete',
      uploadedDocs: 8,
      missingDocs: 0,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      isDefault: true
    },
    {
      id: 'CH-2026-4512',
      name: 'Hans Schmidt',
      dob: '12 March 1988',
      age: 38,
      appointmentDate: '2026-05-21',
      appointmentTime: '09:00',
      appointments: [
        { date: 'May 21, 2026', time: '09:00', room: 'Room 015, OEC Lugano', duration: '30 minutes', status: 'Confirmed', notes: 'Initial consultation and documentation intake for new patient onboarding.' }
      ],
      status: 'none',
      uploadedDocs: 0,
      missingDocs: 5,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
      isDefault: true
    }
  ]);

  const currentPatient = patients.find(p => p.id === selectedPatient);

  // Function to check if a tab has errors or missing data
  const getTabStatus = (tabId: TabType) => {
    switch (tabId) {
      case 'medications':
        const hasMedicationErrors = medications.some(med => med.hasError);
        if (hasMedicationErrors) return 'error';
        return 'ok';

      default:
        return 'ok';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            <span>Complete</span>
          </div>
        );
      case 'partial':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            <span>Partial</span>
          </div>
        );
      case 'none':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            <span>Awaiting</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getLabStatusColor = (status: string) => {
    switch (status) {
      case 'high':
      case 'low':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'borderline':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-white border-gray-200 text-gray-900';
    }
  };

  const handleSaveSection = (section: EditSection) => {
    setEditingSection(null);
  };

  const handleCancelSection = () => {
    setEditingSection(null);
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setAllergies([...allergies, { id: Date.now(), name: newAllergy, severity: 'mild', reaction: '' }]);
      setNewAllergy('');
    }
  };

  const removeAllergy = (id: number) => {
    setAllergies(allergies.filter(a => a.id !== id));
  };

  const addSymptom = () => {
    if (newSymptom.trim()) {
      setSymptoms([...symptoms, { id: Date.now(), text: newSymptom }]);
      setNewSymptom('');
    }
  };

  const removeSymptom = (id: number) => {
    setSymptoms(symptoms.filter(s => s.id !== id));
  };

  const addMedication = () => {
    setMedications([...medications, {
      id: Date.now(),
      name: '',
      originalName: '',
      dose: '',
      frequency: '',
      route: 'Oral',
      since: new Date().toLocaleDateString('de-CH'),
      prescribedBy: '',
      status: 'active',
      hasError: false,
      confirmed: false
    }]);
  };

  const removeMedication = (id: number) => {
    setMedications(medications.filter(m => m.id !== id));
  };

  const updateMedication = (id: number, field: string, value: string) => {
    setMedications(medications.map(m =>
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const acceptMedSubstitution = (medId: number, suggestedName: string) => {
    setMedications(prev => prev.map(m =>
      m.id === medId ? { ...m, name: suggestedName, hasError: false, confirmed: true, suggestedName: undefined } : m
    ));
    setChatMessages(prev => prev.map(msg =>
      (msg as any).medId === medId && msg.role === 'suggestion'
        ? { ...msg, role: 'assistant' as const, content: `✓ Medication updated to **${suggestedName}**.`, medId: undefined, suggestedName: undefined }
        : msg
    ));
  };

  const addNewPatient = () => {
    const newId = `CH-2026-${5000 + patients.length}`;
    const newPatient = {
      id: newId,
      name: '',
      age: 0,
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '09:00',
      status: 'none',
      uploadedDocs: 0,
      missingDocs: 5,
      image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200&h=200&fit=crop',
      isDefault: false
    };
    setPatients([...patients, newPatient]);
    setNewPatientCounter(newPatientCounter + 1);
    setSelectedPatient(newId);
    setActiveTab('overview');
  };

  const handleAIFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newFiles: string[] = [];
      files.forEach(file => {
        newFiles.push(file.name);
      });
      setUploadedAIFiles(prev => [...prev, ...newFiles]);

      // Add uploaded files to the center Documents list
      const today = new Date().toISOString().split('T')[0];
      const newDocs = files.map((file, i) => ({
        id: Date.now() + i,
        name: file.name.replace(/\.[^/.]+$/, ''),
        type: 'Uploaded Document',
        date: today,
        size: file.size > 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`
      }));
      setExtraDocuments(prev => [...prev, ...newDocs]);

      setRightTab('documents');
      setActiveConvTab('current');
    }
  };

  const initializeDocumentChecklist = (uploadedFiles: string[]) => {
    // After a delay, check if we need to ask for renaming
    setTimeout(() => {
      if (uploadedFiles.length > 0) {
        setShowRenameDialog(true);
      }
    }, 2000);
  };

  const processDocumentsWithAI = async (files: string[]) => {
    setIsAIProcessing(true);
    setAiProcessingSteps([]);

    const steps = [
      'Analyzing uploaded documents...',
      'Extracting patient information...',
      'Processing medical history...',
      'Identifying medications...',
      'Checking Swiss medication database...',
      'Verifying insurance information...',
      'Completing patient profile...'
    ];

    // Show steps progressively
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setAiProcessingSteps(prev => [...prev, steps[i]]);
    }

    // Wait a bit before filling data
    await new Promise(resolve => setTimeout(resolve, 500));

    // Auto-fill Hans Schmidt data
    setPatientFirstName('Hans');
    setPatientLastName('Schmidt');
    setPatientDobDay('12');
    setPatientDobMonth('03');
    setPatientDobYear('1988');
    setPatientSex('Male');
    setPatientAVS('756.8877.6655.44');
    setPatientNationality('German');
    setPatientPhonePrefix('+49');
    setPatientPhoneNumber('30 555 1234');
    setPatientEmail('hans.schmidt@email.de');
    setPatientAddress('Friedrichstraße 123, 10117 Berlin, Germany');
    setEmergencyContact('Petra Schmidt (Wife) - +49 30 555 5678');
    setInsuranceInfo('CSS - Policy #: 65-98765-4');

    // Add allergies
    setAllergies([
      { id: 1, name: 'Pollen', severity: 'mild', reaction: 'Seasonal rhinitis' },
      { id: 2, name: 'Aspirin', severity: 'moderate', reaction: 'Skin rash' }
    ]);

    // Add symptoms
    setSymptoms([
      { id: 1, text: 'Chronic lower back pain' },
      { id: 2, text: 'Occasional headaches' }
    ]);

    // Add medications with one requiring human intervention
    setMedications([
      {
        id: 1,
        name: 'Ibuprofen 400mg',
        originalName: 'Ibuprofen-400mg-(DE)',
        dose: '400 mg',
        frequency: '2x daily',
        route: 'Oral',
        since: '15.01.2025',
        prescribedBy: 'Dr. med. Klaus Weber',
        status: 'active',
        hasError: false,
        confirmed: true
      },
      {
        id: 2,
        name: 'Diclofenac 75mg',
        originalName: 'Voltaren-Retard-75mg-(DE)',
        dose: '75 mg',
        frequency: '1x daily',
        route: 'Oral',
        since: '20.02.2026',
        prescribedBy: 'Dr. med. Klaus Weber',
        status: 'active',
        hasError: true,
        confirmed: false
      }
    ]);

    // Update condition
    setCurrentCondition({
      symptoms: ['Lower back pain', 'Muscle stiffness'],
      onset: '2025-12-10',
      severity: 6,
      notes: 'Patient reports chronic lower back pain, particularly after physical activity. Pain radiates to left leg.'
    });

    setIsAIProcessing(false);

    // Update Hans Schmidt status from "none" to "partial"
    setPatients(prevPatients =>
      prevPatients.map(p =>
        p.id === 'CH-2026-4512'
          ? { ...p, status: 'partial', uploadedDocs: 3, missingDocs: 1 }
          : p
      )
    );
  };

  const confirmDeletePatient = (patientId: string) => {
    setPatientToDelete(patientId);
    setShowDeleteModal(true);
  };

  const deletePatient = () => {
    if (patientToDelete) {
      setPatients(patients.filter(p => p.id !== patientToDelete));
      if (selectedPatient === patientToDelete) {
        setSelectedPatient(patients[0]?.id || null);
      }
      setShowDeleteModal(false);
      setPatientToDelete(null);
    }
  };

  const handleShareDocuments = (memberName: string) => {
    setSharedWithTeam(prev => ({
      ...prev,
      [memberName]: !prev[memberName]
    }));
  };

  const renderMd = (text: string) =>
    text
      .replace(/^#{1,3}\s+(.+)$/gm, '<strong>$1</strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^[\*\-]\s+(.+)$/gm, '• $1')
      .replace(/\n/g, '<br />');

  const saveCurrentConversation = () => {
    if (!selectedPatient || chatMessages.length === 0) return;
    const firstUserMsg = chatMessages.find(m => m.role === 'user');
    const summary = firstUserMsg
      ? firstUserMsg.content.slice(0, 50) + (firstUserMsg.content.length > 50 ? '…' : '')
      : 'Conversation';
    const today = new Date().toISOString().split('T')[0];
    setPastConversations(prev => ({
      ...prev,
      [selectedPatient]: [
        { date: today, summary, messages: chatMessages },
        ...(prev[selectedPatient] ?? [])
      ]
    }));
    setChatMessages([]);
  };

  const generateDocRenameSuggestions = () => {
    const suggestions = uploadedAIFiles.map((fileName, idx) => {
      const lowerName = fileName.toLowerCase();
      const ext = fileName.split('.').pop() || '';
      let suggestedName = '';
      if (lowerName.includes('medical') || lowerName.includes('history') || lowerName.includes('report') || lowerName.includes('cardio')) {
        suggestedName = `Medical History Report.${ext}`;
      } else if (lowerName.includes('blood') || lowerName.includes('lab') || lowerName.includes('test')) {
        suggestedName = `Blood Test Results.${ext}`;
      } else if (lowerName.includes('med') || lowerName.includes('prescription') || lowerName.includes('pharma')) {
        suggestedName = `Current Medications List.${ext}`;
      } else if (lowerName.includes('insurance') || lowerName.includes('card')) {
        suggestedName = `Insurance Card.${ext}`;
      } else if (lowerName.includes('id') || lowerName.includes('passport')) {
        suggestedName = `ID-Passport Copy.${ext}`;
      } else if (lowerName.includes('mri') || lowerName.includes('scan') || lowerName.includes('imaging') || lowerName.includes('xray') || lowerName.includes('x-ray')) {
        suggestedName = `MRI Scan Report.${ext}`;
      } else if (lowerName.includes('physio') || lowerName.includes('therapy') || lowerName.includes('rehabilitation')) {
        suggestedName = `Physiotherapy Report.${ext}`;
      } else {
        suggestedName = `Document ${idx + 1}.${ext}`;
      }
      return { id: idx, original: fileName, suggested: suggestedName };
    });
    setDocRenameSuggestions(suggestions);
    setTimeout(() => setDocRenamePanelVisible(true), 10);
  };

  const applyDocRename = (suggestionId: number, newName?: string) => {
    const suggestion = docRenameSuggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;
    const finalName = newName ?? suggestion.suggested;
    setExtraDocuments(prev => prev.map(doc =>
      doc.name === suggestion.original.replace(/\.[^/.]+$/, '')
        ? { ...doc, name: finalName.replace(/\.[^/.]+$/, '') }
        : doc
    ));
    setUploadedAIFiles(prev => prev.map(f => f === suggestion.original ? finalName : f));
    setDocRenameSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    if (docRenameSuggestions.length <= 1) setDocRenamePanelVisible(false);
  };

  const applyAllDocRenames = () => {
    docRenameSuggestions.forEach(s => {
      setExtraDocuments(prev => prev.map(doc =>
        doc.name === s.original.replace(/\.[^/.]+$/, '')
          ? { ...doc, name: s.suggested.replace(/\.[^/.]+$/, '') }
          : doc
      ));
      setUploadedAIFiles(prev => prev.map(f => f === s.original ? s.suggested : f));
    });
    setDocRenameSuggestions([]);
    setDocRenamePanelVisible(false);
  };

  const handleVoiceRecord = () => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert('Voice recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition: SpeechRecognition = new SpeechRecognitionAPI();
    recognition.lang = 'it-IT';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsRecording(true);
      setIsTranscribing(false);
      setInterimTranscript('');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const finalText = result[0].transcript;
          setChatInput(prev => (prev ? prev + ' ' : '') + finalText.trim());
          setInterimTranscript('');
        } else {
          interim += result[0].transcript;
        }
      }
      setInterimTranscript(interim);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsTranscribing(false);
      setInterimTranscript('');
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setIsTranscribing(false);
      setInterimTranscript('');
    };

    recognition.start();
  };

  const startMeetingRecording = () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) { alert('Voice recognition not supported. Try Chrome or Edge.'); return; }
    meetingTranscriptRef.current = '';
    setMeetingTranscript('');
    setMeetingSummary('');
    setMeetingDuration(0);
    setMeetingState('recording');
    setRightTab('meetings');

    const recognition: SpeechRecognition = new SpeechRecognitionAPI();
    recognition.lang = 'it-IT';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    meetingRecognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const text = event.results[i][0].transcript.trim();
          meetingTranscriptRef.current += (meetingTranscriptRef.current ? ' ' : '') + text;
          setMeetingTranscript(meetingTranscriptRef.current);
        }
      }
    };
    recognition.onerror = () => {};
    recognition.onend = () => {};
    recognition.start();

    meetingTimerRef.current = setInterval(() => {
      setMeetingDuration(prev => prev + 1);
    }, 1000);
  };

  const stopMeetingRecording = () => {
    meetingRecognitionRef.current?.stop();
    if (meetingTimerRef.current) clearInterval(meetingTimerRef.current);
    setMeetingState('review');
  };

  const summarizeMeeting = async () => {
    if (!meetingTranscriptRef.current) return;
    setIsSummarizing(true);
    try {
      const summary = await (await import('../../services/gemini')).sendMessage(
        `You are reviewing a doctor-patient consultation transcript to generate a clinical summary.

IMPORTANT: First evaluate whether the transcript contains actual clinical content (symptoms, diagnoses, medications, clinical decisions, follow-up actions, or medical history).

If the transcript does NOT contain enough clinical information — for example if it is too short, contains only greetings, or is unrelated to medicine — respond ONLY with this exact message (in the same language as the transcript):
"⚠️ La trascrizione non contiene informazioni cliniche sufficienti per generare un riassunto utile. Registra una conversazione medica più dettagliata."

If there IS sufficient clinical content, provide a structured summary with: key symptoms discussed, decisions made, medications mentioned, follow-up actions. Respond in the same language as the transcript.

Transcript:
${meetingTranscriptRef.current}`,
        []
      );
      setMeetingSummary(summary);
    } catch (e) { setMeetingSummary('Errore nella generazione del riassunto.'); }
    setIsSummarizing(false);
  };

  const saveMeeting = () => {
    if (!currentPatient || !meetingTranscriptRef.current) return;
    const now = new Date();
    setSavedMeetings(prev => [{
      id: Date.now(),
      patientId: currentPatient.id,
      patientName: currentPatient.name,
      date: now.toISOString().split('T')[0],
      duration: meetingDuration,
      transcript: meetingTranscriptRef.current,
      summary: meetingSummary || undefined,
    }, ...prev]);
    setMeetingState('idle');
    setRightTab('meetings');
  };

  const formatDuration = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const confirmAppointment = () => {
    if (!pendingAppointment || !selectedPatient) return;
    const { date, time, notes } = pendingAppointment;
    // Format date for display: "2026-05-15" → "May 15, 2026"
    const displayDate = (() => {
      try { return new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); }
      catch { return date; }
    })();
    setPatients(prev => prev.map(p => p.id === selectedPatient ? {
      ...p,
      appointments: [...(p.appointments ?? []), {
        date: displayDate, time, room: 'Room 108, OEC Lugano',
        duration: '30 minutes', status: 'Confirmed', notes
      }]
    } : p));
    setPendingAppointment(null);
  };

  const testPrompts = useMemo(
    () => getTestPrompts(currentPatient?.name ?? 'the patient'),
    [currentPatient?.name]
  );

  const generateRandomPrompt = () => {
    setChatInput(testPrompts[Math.floor(Math.random() * testPrompts.length)]);
  };

  const handleSendMessage = async (overrideMessage?: string) => {
    const hasFiles = !overrideMessage && uploadedAIFiles.length > 0;
    if (!overrideMessage && !chatInput.trim() && !hasFiles) return;
    if (isAIThinking) return;

    // Stop any active voice recording before sending
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      setInterimTranscript('');
    }

    // Handle file send: show files in chat, run processing, then trigger rename
    if (hasFiles) {
      const filesToProcess = [...uploadedAIFiles];
      const fileLabel = filesToProcess.map(f => `📎 ${f}`).join('\n');
      setChatMessages(prev => [
        ...prev,
        { role: 'user', content: chatInput.trim() ? `${chatInput.trim()}\n${fileLabel}` : fileLabel }
      ]);
      setActiveConvTab('current');
      setChatInput('');
      setUploadedAIFiles([]);

      // Run AI processing for all patients when files are sent
      await processDocumentsWithAI(filesToProcess);

      // After processing, go straight to Smart Renaming panel
      setTimeout(() => generateDocRenameSuggestions(), 500);
      return;
    }

    const userMessage = overrideMessage ?? chatInput;

    // If viewing a past conversation, load its messages and continue from there
    if (typeof activeConvTab === 'number' && selectedPatient && pastConversations[selectedPatient]?.[activeConvTab]) {
      const pastMsgs = pastConversations[selectedPatient][activeConvTab].messages;
      setChatMessages([...pastMsgs, { role: 'user', content: userMessage }]);
      // Remove from past conversations since it becomes the active one
      setPastConversations(prev => ({
        ...prev,
        [selectedPatient]: prev[selectedPatient].filter((_, i) => i !== activeConvTab)
      }));
    } else {
      setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    }

    setActiveConvTab('current');
    if (!overrideMessage) setChatInput('');

    // Detect rename-via-chat commands: "rinomina ... chiamalo/in ..." / "rename ... to ..."
    const renameMatch =
      userMessage.match(/rinomina\s+(?:il\s+)?(?:file\s+)?(.+?)\s+(?:e\s+)?chiamalo\s+(.+)/i) ||
      userMessage.match(/rinomina\s+(?:il\s+)?(?:file\s+)?(.+?)\s+in\s+(.+)/i) ||
      userMessage.match(/rename\s+(?:the\s+)?(?:file\s+)?(.+?)\s+(?:and\s+)?call\s+it\s+(.+)/i) ||
      userMessage.match(/rename\s+(.+?)\s+to\s+(.+)/i);

    if (renameMatch) {
      const keyword = renameMatch[1].trim().toLowerCase();
      const newName = renameMatch[2].trim();
      const allDocs = [...documents, ...extraDocuments];

      // Search in rename panel suggestions first, then all docs
      const panelMatch = docRenameSuggestions.find(s =>
        s.original.toLowerCase().includes(keyword) || s.suggested.toLowerCase().includes(keyword)
      );

      if (panelMatch) {
        const ext = panelMatch.suggested.split('.').pop() || '';
        const finalName = newName.includes('.') ? newName : `${newName}.${ext}`;
        setDocRenameSuggestions(prev => prev.map(s =>
          s.id === panelMatch.id ? { ...s, suggested: finalName } : s
        ));
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: `Rename suggestion for **${panelMatch.original}** updated to **${finalName}**. Accept it in the panel to apply.`
        }]);
        return;
      }

      const docMatch = allDocs.find(d =>
        (docNameOverrides[d.id] ?? d.name).toLowerCase().includes(keyword)
      );

      if (docMatch) {
        setDocNameOverrides(prev => ({ ...prev, [docMatch.id]: newName }));
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: `Il documento è stato rinominato in **${newName}**.`
        }]);
        return;
      }
    }

    setIsAIThinking(true);

    try {
      const patientContext = currentPatient
        ? buildPatientContext({
            name: currentPatient.name,
            dob: `${patientDobDay} ${patientDobMonth} ${patientDobYear}`,
            sex: patientSex,
            avs: patientAVS,
            nationality: patientNationality,
            phone: `${patientPhonePrefix} ${patientPhoneNumber}`,
            email: patientEmail,
            address: patientAddress,
            emergencyContact,
            insurance: insuranceInfo,
            allergies,
            symptoms,
            medications,
            condition: currentCondition,
            labResults,
            medicalHistory,
            timeline,
            careTeam
          })
        : undefined;

      const historyForAI = chatMessages.filter(m => m.role === 'user' || m.role === 'assistant') as Array<{role: 'user' | 'assistant', content: string}>;
      const response = await sendMessage(userMessage, historyForAI, patientContext);

      // Detect APPT tag and strip it from displayed message
      const apptMatch = response.match(/APPT:\{([^}]+)\}/);
      const cleanResponse = response.replace(/\nAPPT:\{[^}]+\}/g, '').trim();
      let parsedAppt: {date: string; time: string; notes: string} | null = null;
      if (apptMatch) {
        try { parsedAppt = JSON.parse(`{${apptMatch[1]}}`); } catch (e) {
          console.error('Failed to parse APPT tag:', e);
        }
      }

      setChatMessages(prev => {
        const updated = [...prev, { role: 'assistant' as const, content: cleanResponse }];
        if (parsedAppt) {
          updated.push({ role: 'appointment-confirm' as const, content: '', appointmentData: parsedAppt });
        }
        // After AI responds, check if it mentions any error medication — if so inject a suggestion card
        const errorMeds = medications.filter(m => m.hasError && (m as any).suggestedName);
        const responseLower = response.toLowerCase();
        const mentionedMed = errorMeds.find(m =>
          responseLower.includes(m.name.toLowerCase()) ||
          responseLower.includes(m.originalName.toLowerCase())
        );
        if (mentionedMed && (mentionedMed as any).suggestedName) {
          updated.push({
            role: 'suggestion',
            content: '',
            medId: mentionedMed.id,
            originalName: mentionedMed.name,
            suggestedName: (mentionedMed as any).suggestedName
          });
        }
        return updated;
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: `⚠️ AI error: ${msg}` }
      ]);
    } finally {
      setIsAIThinking(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={sanoIcon} alt="Sano" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="font-semibold text-gray-900">Sano</h1>
                <p className="text-sm text-gray-500">Doctor Portal - OEC Lugano</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {onSwitchToPatient && (
                <button
                  onClick={onSwitchToPatient}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                  title="Switch to Patient View"
                >
                  <RefreshCw className="w-4 h-4 text-blue-700" />
                  <span className="text-sm font-medium text-blue-700">Patient View</span>
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-200">
                  <img
                    src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop"
                    alt="Dr. Peter Müller"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Dr. med. Peter Müller</p>
                  <p className="text-gray-500">Cardiologist</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-6 h-full">
          {/* Left Section - Patient List */}
          <div className="xl:col-span-3 h-full overflow-hidden">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Patients</h2>
                <button
                  onClick={addNewPatient}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  style={{ color: '#3D38F5' }}
                  title="Add new patient"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D38F5] focus:border-transparent text-sm"
                />
              </div>

              {/* Patient List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {patients
                  .filter(patient =>
                    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    patient.id.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((patient) => (
                  <div key={patient.id} className="relative">
                    <button
                      onClick={() => {
                        setSelectedPatient(patient.id);
                        setActiveTab('overview');
                      }}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedPatient === patient.id
                          ? 'border-[#3D38F5] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-200 flex-shrink-0">
                          <img
                            src={patient.image}
                            alt={patient.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {patient.name || 'New Patient'}
                            </h3>
                            {getStatusBadge(patient.status)}
                          </div>
                          <p className="text-xs text-gray-500 mb-2">ID: {patient.id}{patient.age > 0 ? ` • Age: ${patient.age}` : ''}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Clock className="w-3 h-3" />
                            <span>{patient.appointmentDate} at {patient.appointmentTime}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                    {!patient.isDefault && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDeletePatient(patient.id);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-lg hover:bg-red-50 border border-gray-200 hover:border-red-300 transition-colors"
                        title="Delete patient"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Section - Patient Details with Tabs */}
          <div className="xl:col-span-5 h-full overflow-y-auto space-y-6 pr-1">
            {currentPatient ? (
              <>
                {/* Patient Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Patient Details</h2>
                    <div className="flex items-center gap-3">
                      <img
                        src={currentPatient.image}
                        alt={currentPatient.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200"
                      />
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900">{currentPatient.name || 'New Patient'}</p>
                        <p className="text-gray-500">{currentPatient.id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs Navigation */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="flex border-b border-gray-200 overflow-x-auto">
                    {[
                      { id: 'overview', label: 'Overview', icon: User },
                      { id: 'history', label: 'Medical History', icon: FileText },
                      { id: 'medications', label: 'Medications', icon: Pill },
                      { id: 'documents', label: 'Documents & Labs', icon: FileText },
                      { id: 'timeline', label: 'Timeline', icon: Activity }
                    ].map((tab) => {
                      const tabStatus = getTabStatus(tab.id as TabType);
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as TabType)}
                          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap relative ${
                            activeTab === tab.id
                              ? 'border-blue-600 text-blue-600 font-medium bg-blue-50'
                              : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          <tab.icon className="w-4 h-4" />
                          <span className="text-sm">{tab.label}</span>
                          {tabStatus === 'error' && (
                            <div className="w-2 h-2 rounded-full bg-red-500 absolute top-2 right-2" title="Errors found" />
                          )}
                          {tabStatus === 'warning' && (
                            <div className="w-2 h-2 rounded-full bg-orange-500 absolute top-2 right-2" title="Missing data" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab Content */}
                  <div className="p-6 space-y-6">
                    {/* PATIENT OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                      <>
                        {/* Patient Identification */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                          <div className={`px-4 py-3 flex items-center justify-between transition-colors ${
                            editingSection === 'patient-id' ? 'bg-blue-100' : 'bg-gray-50'
                          }`}>
                            <h3 className="font-semibold text-gray-900">Patient Identification</h3>
                            <div className="flex items-center gap-2">
                              {editingSection === 'patient-id' ? (
                                <>
                                  <button
                                    onClick={() => handleSaveSection('patient-id')}
                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                  >
                                    <XIcon className="w-5 h-5 text-red-600" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => setEditingSection('patient-id')}
                                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                  <Edit2 className="w-4 h-4 text-gray-600" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                                <input
                                  type="text"
                                  value={patientFirstName}
                                  onChange={(e) => setPatientFirstName(e.target.value)}
                                  readOnly={editingSection !== 'patient-id'}
                                  className={`w-full px-3 py-2 border rounded-lg text-sm ${
                                    editingSection === 'patient-id'
                                      ? 'bg-white border-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                                      : !patientFirstName
                                      ? 'bg-red-50 border-red-200'
                                      : 'bg-gray-50 border-gray-200'
                                  }`}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Surname</label>
                                <input
                                  type="text"
                                  value={patientLastName}
                                  onChange={(e) => setPatientLastName(e.target.value)}
                                  readOnly={editingSection !== 'patient-id'}
                                  className={`w-full px-3 py-2 border rounded-lg text-sm ${
                                    editingSection === 'patient-id'
                                      ? 'bg-white border-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                                      : !patientLastName
                                      ? 'bg-red-50 border-red-200'
                                      : 'bg-gray-50 border-gray-200'
                                  }`}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Date of Birth</label>
                                <div className="grid grid-cols-3 gap-2">
                                  <select
                                    value={patientDobDay}
                                    onChange={(e) => setPatientDobDay(e.target.value)}
                                    disabled={editingSection !== 'patient-id'}
                                    className={`w-full px-3 py-2 border rounded-lg text-sm ${
                                      editingSection === 'patient-id'
                                        ? 'bg-white border-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                                        : !patientDobDay
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-gray-50 border-gray-200'
                                    }`}
                                  >
                                    <option value="">Day</option>
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                      <option key={day} value={day.toString().padStart(2, '0')}>
                                        {day}
                                      </option>
                                    ))}
                                  </select>
                                  <select
                                    value={patientDobMonth}
                                    onChange={(e) => setPatientDobMonth(e.target.value)}
                                    disabled={editingSection !== 'patient-id'}
                                    className={`w-full px-3 py-2 border rounded-lg text-sm ${
                                      editingSection === 'patient-id'
                                        ? 'bg-white border-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                                        : !patientDobMonth
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-gray-50 border-gray-200'
                                    }`}
                                  >
                                    <option value="">Month</option>
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                                      <option key={i} value={(i + 1).toString().padStart(2, '0')}>
                                        {month}
                                      </option>
                                    ))}
                                  </select>
                                  <select
                                    value={patientDobYear}
                                    onChange={(e) => setPatientDobYear(e.target.value)}
                                    disabled={editingSection !== 'patient-id'}
                                    className={`w-full px-3 py-2 border rounded-lg text-sm ${
                                      editingSection === 'patient-id'
                                        ? 'bg-white border-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                                        : !patientDobYear
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-gray-50 border-gray-200'
                                    }`}
                                  >
                                    <option value="">Year</option>
                                    {Array.from({ length: 100 }, (_, i) => 2024 - i).map(year => (
                                      <option key={year} value={year}>
                                        {year}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Sex assigned at birth</label>
                                <select
                                  value={patientSex}
                                  onChange={(e) => setPatientSex(e.target.value)}
                                  disabled={editingSection !== 'patient-id'}
                                  className={`w-full px-3 py-2 border rounded-lg text-sm ${
                                    editingSection === 'patient-id'
                                      ? 'bg-white border-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                                      : !patientSex
                                      ? 'bg-red-50 border-red-200'
                                      : 'bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <option value="">Select</option>
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Nationality</label>
                                <input
                                  type="text"
                                  value={patientNationality}
                                  onChange={(e) => setPatientNationality(e.target.value)}
                                  readOnly={editingSection !== 'patient-id'}
                                  className={`w-full px-3 py-2 border rounded-lg text-sm ${
                                    editingSection === 'patient-id'
                                      ? 'bg-white border-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                                      : !patientNationality
                                      ? 'bg-red-50 border-red-200'
                                      : 'bg-gray-50 border-gray-200'
                                  }`}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">AVS Number</label>
                                <input
                                  type="text"
                                  value={patientAVS}
                                  onChange={(e) => setPatientAVS(e.target.value)}
                                  readOnly={editingSection !== 'patient-id'}
                                  className={`w-full px-3 py-2 border rounded-lg text-sm ${
                                    editingSection === 'patient-id'
                                      ? 'bg-white border-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                                      : !patientAVS
                                      ? 'bg-red-50 border-red-200'
                                      : 'bg-gray-50 border-gray-200'
                                  }`}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                                <div className="flex gap-2">
                                  <select
                                    value={patientPhonePrefix}
                                    onChange={(e) => setPatientPhonePrefix(e.target.value)}
                                    disabled={editingSection !== 'patient-id'}
                                    className={`w-24 px-2 py-2 border rounded-lg text-sm ${
                                      editingSection === 'patient-id'
                                        ? 'bg-white border-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                                        : 'bg-gray-50 border-gray-200'
                                    }`}
                                  >
                                    <option value="+41">🇨🇭 +41</option>
                                    <option value="+39">🇮🇹 +39</option>
                                    <option value="+49">🇩🇪 +49</option>
                                    <option value="+33">🇫🇷 +33</option>
                                    <option value="+1">🇺🇸 +1</option>
                                  </select>
                                  <input
                                    type="text"
                                    value={patientPhoneNumber}
                                    onChange={(e) => setPatientPhoneNumber(e.target.value)}
                                    readOnly={editingSection !== 'patient-id'}
                                    className={`flex-1 px-3 py-2 border rounded-lg text-sm ${
                                      editingSection === 'patient-id'
                                        ? 'bg-white border-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                                        : !patientPhoneNumber
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-gray-50 border-gray-200'
                                    }`}
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                                <input
                                  type="text"
                                  value={patientEmail}
                                  onChange={(e) => setPatientEmail(e.target.value)}
                                  readOnly={editingSection !== 'patient-id'}
                                  className={`w-full px-3 py-2 border rounded-lg text-sm ${
                                    editingSection === 'patient-id'
                                      ? 'bg-white border-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                                      : !patientEmail
                                      ? 'bg-red-50 border-red-200'
                                      : 'bg-gray-50 border-gray-200'
                                  }`}
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                                <input
                                  type="text"
                                  value={patientAddress}
                                  onChange={(e) => setPatientAddress(e.target.value)}
                                  readOnly={editingSection !== 'patient-id'}
                                  className={`w-full px-3 py-2 border rounded-lg text-sm ${
                                    editingSection === 'patient-id'
                                      ? 'bg-white border-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                                      : !patientAddress
                                      ? 'bg-red-50 border-red-200'
                                      : 'bg-gray-50 border-gray-200'
                                  }`}
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Emergency Contact</label>
                                <input
                                  type="text"
                                  value={emergencyContact}
                                  onChange={(e) => setEmergencyContact(e.target.value)}
                                  readOnly={editingSection !== 'patient-id'}
                                  className={`w-full px-3 py-2 border rounded-lg text-sm ${
                                    editingSection === 'patient-id'
                                      ? 'bg-white border-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                                      : !emergencyContact
                                      ? 'bg-red-50 border-red-200'
                                      : 'bg-gray-50 border-gray-200'
                                  }`}
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Insurance Information</label>
                                <input
                                  type="text"
                                  value={insuranceInfo}
                                  onChange={(e) => setInsuranceInfo(e.target.value)}
                                  readOnly={editingSection !== 'patient-id'}
                                  className={`w-full px-3 py-2 border rounded-lg text-sm ${
                                    editingSection === 'patient-id'
                                      ? 'bg-white border-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                                      : !insuranceInfo
                                      ? 'bg-red-50 border-red-200'
                                      : 'bg-gray-50 border-gray-200'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Current Condition */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                          <div className="px-4 py-3 flex items-center justify-between bg-gray-50">
                            <h3 className="font-semibold text-gray-900">Current Condition</h3>
                          </div>
                          <div className="p-4 space-y-4">
                            {currentCondition.symptoms.length > 0 || currentCondition.notes ? (
                              <>
                                {currentCondition.symptoms.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-600 mb-2">Active Symptoms</p>
                                    <div className="flex flex-wrap gap-2">
                                      {currentCondition.symptoms.map((symptom, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                                          {symptom}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                  {currentCondition.onset && (
                                    <div>
                                      <p className="text-sm font-medium text-gray-600">Onset Date</p>
                                      <p className="text-sm text-gray-900">{currentCondition.onset}</p>
                                    </div>
                                  )}
                                  {currentCondition.severity > 0 && (
                                    <div>
                                      <p className="text-sm font-medium text-gray-600 mb-1">Severity</p>
                                      <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                          <div
                                            className="bg-orange-500 h-2 rounded-full"
                                            style={{ width: `${currentCondition.severity * 10}%` }}
                                          />
                                        </div>
                                        <span className="text-sm font-medium">{currentCondition.severity}/10</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {currentCondition.notes && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Notes</p>
                                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{currentCondition.notes}</p>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-center py-8">
                                <Heart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No current condition recorded</p>
                                <p className="text-xs text-gray-400 mt-1">Patient needs to provide symptom details</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Allergies and Symptoms Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Allergies */}
                          <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className={`px-4 py-3 flex items-center justify-between ${
                              editingSection === 'allergies' ? 'bg-red-100' : 'bg-gray-50'
                            }`}>
                              <h3 className="font-semibold text-gray-900">Allergies</h3>
                              <div className="flex items-center gap-2">
                                {editingSection === 'allergies' ? (
                                  <>
                                    <button onClick={() => handleSaveSection('allergies')} className="p-2 hover:bg-red-100 rounded-lg">
                                      <XIcon className="w-5 h-5 text-red-600" />
                                    </button>
                                  </>
                                ) : (
                                  <button onClick={() => setEditingSection('allergies')} className="p-2 hover:bg-gray-200 rounded-lg">
                                    <Edit2 className="w-4 h-4 text-gray-600" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="p-4 space-y-2">
                              {allergies.length > 0 ? (
                                allergies.map((allergy) => (
                                  <div key={allergy.id} className="flex items-center justify-between px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                                    <div>
                                      <span className="text-sm font-medium text-gray-900">{allergy.name}</span>
                                      {allergy.reaction && <p className="text-xs text-gray-600">{allergy.reaction}</p>}
                                    </div>
                                    {editingSection === 'allergies' && (
                                      <button onClick={() => removeAllergy(allergy.id)} className="text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                ))
                              ) : editingSection !== 'allergies' ? (
                                <div className="text-center py-6">
                                  <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                  <p className="text-sm text-gray-500">No allergies recorded</p>
                                </div>
                              ) : null}
                              {editingSection === 'allergies' && (
                                <div className="flex gap-2 mt-3">
                                  <input
                                    type="text"
                                    value={newAllergy}
                                    onChange={(e) => setNewAllergy(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                                    placeholder="Add allergy..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                  />
                                  <button onClick={addAllergy} className="px-3 py-2 bg-blue-600 text-white rounded-lg">
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Symptoms */}
                          <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className={`px-4 py-3 flex items-center justify-between ${
                              editingSection === 'symptoms' ? 'bg-yellow-100' : 'bg-gray-50'
                            }`}>
                              <h3 className="font-semibold text-gray-900">Symptoms</h3>
                              <div className="flex items-center gap-2">
                                {editingSection === 'symptoms' ? (
                                  <>
                                    <button onClick={() => handleSaveSection('symptoms')} className="p-2 hover:bg-red-100 rounded-lg">
                                      <XIcon className="w-5 h-5 text-red-600" />
                                    </button>
                                  </>
                                ) : (
                                  <button onClick={() => setEditingSection('symptoms')} className="p-2 hover:bg-gray-200 rounded-lg">
                                    <Edit2 className="w-4 h-4 text-gray-600" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="p-4 space-y-2">
                              {symptoms.length > 0 ? (
                                symptoms.map((symptom) => (
                                  <div key={symptom.id} className="flex items-center justify-between px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <span className="text-sm text-gray-900">{symptom.text}</span>
                                    {editingSection === 'symptoms' && (
                                      <button onClick={() => removeSymptom(symptom.id)} className="text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                ))
                              ) : editingSection !== 'symptoms' ? (
                                <div className="text-center py-6">
                                  <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                  <p className="text-sm text-gray-500">No symptoms recorded</p>
                                </div>
                              ) : null}
                              {editingSection === 'symptoms' && (
                                <div className="flex gap-2 mt-3">
                                  <input
                                    type="text"
                                    value={newSymptom}
                                    onChange={(e) => setNewSymptom(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                                    placeholder="Add symptom..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                  />
                                  <button onClick={addSymptom} className="px-3 py-2 bg-blue-600 text-white rounded-lg">
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* MEDICAL HISTORY TAB */}
                    {activeTab === 'history' && (
                      <div className="space-y-3">
                        {medicalHistory.length > 0 ? (
                          medicalHistory.map((item) => (
                            <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-gray-900">{item.condition}</h3>
                                  <p className="text-xs text-gray-500 mt-1">{item.type}</p>
                                  <p className="text-sm text-gray-700 mt-2">{item.notes}</p>
                                  <p className="text-xs text-gray-500 mt-2">Diagnosed: {item.diagnosedDate}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  item.status === 'Active' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                                }`}>
                                  {item.status}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-700">No medical history available</p>
                            <p className="text-xs text-gray-500 mt-1">Patient needs to upload medical records</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* MEDICATIONS TAB */}
                    {activeTab === 'medications' && (
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className={`px-4 py-3 flex items-center justify-between ${
                          editingSection === 'medications' ? 'bg-purple-100' : 'bg-gray-50'
                        }`}>
                          <h3 className="font-semibold text-gray-900">Current Medications</h3>
                          <div className="flex items-center gap-2">
                            {editingSection === 'medications' ? (
                              <>
                                <button onClick={addMedication} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg flex items-center gap-1">
                                  <Plus className="w-4 h-4" />
                                  Add
                                </button>
                                <button onClick={() => handleSaveSection('medications')} className="p-2 hover:bg-red-100 rounded-lg">
                                  <XIcon className="w-5 h-5 text-red-600" />
                                </button>
                              </>
                            ) : (
                              <button onClick={() => setEditingSection('medications')} className="p-2 hover:bg-gray-200 rounded-lg">
                                <Edit2 className="w-4 h-4 text-gray-600" />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="p-4 space-y-4">
                          {medications.length > 0 ? (
                            <>
                              {medications.map((med, index) => (
                                <div key={med.id} className={`rounded-lg border-2 p-4 ${
                                  med.hasError ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                                }`}>
                              <div className="flex items-start justify-between mb-3">
                                <p className="text-xs font-semibold text-gray-500 uppercase">Medication {index + 1}</p>
                                {editingSection === 'medications' && (
                                  <button onClick={() => removeMedication(med.id)} className="p-1 hover:bg-red-100 rounded">
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </button>
                                )}
                              </div>

                              {editingSection === 'medications' ? (
                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">Swiss Medication</label>
                                    <input
                                      type="text"
                                      value={med.name}
                                      onChange={(e) => updateMedication(med.id, 'name', e.target.value)}
                                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm"
                                      placeholder="Swiss medication name"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">Original Medication</label>
                                    <input
                                      type="text"
                                      value={med.originalName}
                                      onChange={(e) => updateMedication(med.id, 'originalName', e.target.value)}
                                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                                      placeholder="Original medication name"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">Dose</label>
                                      <input
                                        type="text"
                                        value={med.dose}
                                        onChange={(e) => updateMedication(med.id, 'dose', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">Since</label>
                                      <input
                                        type="text"
                                        value={med.since}
                                        onChange={(e) => updateMedication(med.id, 'since', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm"
                                      />
                                    </div>
                                  </div>
                                  {(med.hasError || !med.confirmed) && (
                                    <button
                                      onClick={() => setMedications(prev => prev.map(m => m.id === med.id ? { ...m, confirmed: true, hasError: false } : m))}
                                      className="w-full mt-1 flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                      <Check className="w-4 h-4" />
                                      Confirm & save medication
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <p className={`font-semibold text-sm ${med.hasError ? 'text-red-700' : 'text-green-600'}`}>
                                    {med.name} / {med.dose}
                                  </p>
                                  <p className="text-xs text-gray-600">{med.originalName}</p>
                                  <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2">
                                      {med.confirmed ? (
                                        <>
                                          <CheckCircle className="w-4 h-4 text-green-600" />
                                          <span className="text-xs text-green-700 font-medium">✓ CH equivalent confirmed</span>
                                        </>
                                      ) : (
                                        <>
                                          <AlertCircle className="w-4 h-4 text-red-600" />
                                          <span className="text-xs text-red-700 font-medium">No Swiss equivalent found</span>
                                        </>
                                      )}
                                    </div>
                                    {med.hasError && (med as any).suggestedName && (
                                      <button
                                        onClick={() => acceptMedSubstitution(med.id, (med as any).suggestedName)}
                                        className="flex items-center gap-1 px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded-lg transition-colors"
                                        title={`Accept substitution: ${(med as any).suggestedName}`}
                                      >
                                        <Check className="w-3 h-3" />
                                        {(med as any).suggestedName}
                                      </button>
                                    )}
                                  </div>
                                </div>
                                )}
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
                            <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-700">No medications recorded</p>
                            <p className="text-xs text-gray-500 mt-1">Patient needs to upload prescription information</p>
                          </div>
                        )}
                        </div>
                      </div>
                    )}

                    {/* DOCUMENTS & LABS TAB */}
                    {activeTab === 'documents' && (
                      <div className="space-y-6">
                        {/* Documents Section */}
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">Documents</h3>
                          <div className="space-y-2">
                            {[...documents, ...extraDocuments].length > 0 ? (
                              [...documents, ...extraDocuments].map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                      <FileText className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm text-gray-900">{docNameOverrides[doc.id] ?? doc.name}</p>
                                      <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-gray-500">{doc.type}</span>
                                        <span className="text-xs text-gray-400">•</span>
                                        <span className="text-xs text-gray-500">{doc.date}</span>
                                        <span className="text-xs text-gray-400">•</span>
                                        <span className="text-xs text-gray-500">{doc.size}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                                      <Eye className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                                      <Download className="w-4 h-4 text-gray-600" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
                                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">No documents uploaded</p>
                                <p className="text-xs text-gray-500 mt-1">Waiting for patient to submit documents</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Care Team & Document Sharing */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                          <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Care Team & Collaboration</h3>
                          </div>

                          {careTeam.length > 0 ? (
                            <div className="p-4">
                              <div className="space-y-3">
                                {careTeam.map((member, idx) => {
                                  const isCurrentDoctor = member.name === 'Dr. med. Peter Müller';
                                  const isShared = sharedWithTeam[member.name];

                                  return (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-200">
                                          <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                          <p className="font-medium text-sm text-gray-900">{member.name}</p>
                                          <p className="text-xs text-gray-600">{member.role}</p>
                                          <div className="flex items-center gap-1 mt-1">
                                            <Phone className="w-3 h-3 text-gray-400" />
                                            <p className="text-xs text-gray-500">{member.phone}</p>
                                          </div>
                                        </div>
                                      </div>
                                      {isCurrentDoctor ? (
                                        <span className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed">
                                          You
                                        </span>
                                      ) : isShared ? (
                                        <button
                                          onClick={() => handleShareDocuments(member.name)}
                                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors flex items-center gap-1"
                                          title={`Revoke access for ${member.name}`}
                                        >
                                          <CheckCircle className="w-3 h-3" />
                                          Shared
                                        </button>
                                      ) : documents.length > 0 ? (
                                        <button
                                          onClick={() => handleShareDocuments(member.name)}
                                          className="px-3 py-1.5 text-xs font-medium rounded-lg border-2 hover:bg-blue-50 transition-colors"
                                          style={{ borderColor: '#3D38F5', color: '#3D38F5' }}
                                          title={`Share documents with ${member.name}`}
                                        >
                                          Share Docs
                                        </button>
                                      ) : null}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="p-4">
                              <div className="text-center py-8">
                                <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No care team assigned</p>
                                <p className="text-xs text-gray-400 mt-1">Upload required documents to proceed</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Lab Results Section */}
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">Lab Results</h3>
                          {labResults.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4">
                              {labResults.map((lab, idx) => (
                                <div key={idx} className={`p-4 rounded-lg border ${getLabStatusColor(lab.status)}`}>
                                  <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-medium text-sm">{lab.test}</h3>
                                    {lab.status !== 'normal' && <AlertCircle className="w-4 h-4 text-red-600" />}
                                  </div>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold">{lab.value}</span>
                                    <span className="text-sm text-gray-600">{lab.unit}</span>
                                  </div>
                                  <div className="mt-2 pt-2 border-t border-gray-200">
                                    <p className="text-xs text-gray-600">Normal: {lab.normalRange}</p>
                                    <p className="text-xs text-gray-500 mt-1">{lab.date}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
                              <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                              <p className="text-sm font-medium text-gray-700">No lab results available</p>
                              <p className="text-xs text-gray-500 mt-1">Blood tests and diagnostics will appear here</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* TIMELINE TAB */}
                    {activeTab === 'timeline' && (
                      <div className="space-y-6">
                        {timeline.length > 0 ? (
                          timeline.map((event, idx) => (
                            <div key={event.id} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  event.type === 'Visit' ? 'bg-blue-100' :
                                  event.type === 'Lab' ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                  {event.type === 'Visit' && <Calendar className="w-5 h-5 text-blue-600" />}
                                  {event.type === 'Lab' && <TrendingUp className="w-5 h-5 text-green-600" />}
                                  {event.type === 'Hospitalization' && <Activity className="w-5 h-5 text-red-600" />}
                                </div>
                                {idx < timeline.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-2" />}
                              </div>
                              <div className="flex-1 pb-6">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-gray-500">{event.date}</span>
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                    event.type === 'Visit' ? 'bg-blue-100 text-blue-800' :
                                    event.type === 'Lab' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {event.type}
                                  </span>
                                </div>
                                <h3 className="font-medium text-gray-900 mb-1">{event.title}</h3>
                                <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                                <p className="text-xs text-gray-500">{event.provider}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
                            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-700">No timeline events</p>
                            <p className="text-xs text-gray-500 mt-1">Medical history will appear here once available</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a patient to view details</p>
              </div>
            )}
          </div>

          {/* Right Section - Tabbed Panel */}
          <div className="xl:col-span-4 h-full overflow-hidden">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full flex flex-col">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setRightTab('documents')}
                  className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
                    rightTab === 'documents'
                      ? 'text-[#3D38F5] border-b-2 border-[#3D38F5]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  AI Chat
                </button>
                <button
                  onClick={() => setRightTab('meetings')}
                  className={`flex-1 px-3 py-3 text-sm font-medium transition-colors relative ${
                    rightTab === 'meetings'
                      ? 'text-[#3D38F5] border-b-2 border-[#3D38F5]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Meetings
                  {savedMeetings.length > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                      {savedMeetings.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setRightTab('appointment')}
                  className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
                    rightTab === 'appointment'
                      ? 'text-[#3D38F5] border-b-2 border-[#3D38F5]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Appointment
                </button>
              </div>

              <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6">
                {/* Upcoming Appointment Tab */}
                {rightTab === 'appointment' && (
                  <div className="space-y-4">
                    {currentPatient ? (
                      <>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3D38F5' }}>
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Upcoming Appointments</h3>
                            <p className="text-xs text-gray-500">{(currentPatient as any).appointments?.length ?? 1} scheduled</p>
                          </div>
                        </div>

                        {((currentPatient as any).appointments ?? []).map((appt: { date: string; time: string; room: string; duration: string; status: string; notes: string }, idx: number) => (
                          <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{currentPatient.name}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded ${appt.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {appt.status}
                              </span>
                            </div>

                            <div className="space-y-2 mt-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-900">{appt.date} at {appt.time}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-900">Duration: {appt.duration}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-900">{appt.room}</span>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-blue-200">
                              <p className="text-xs font-semibold text-gray-700 mb-2">Appointment Notes</p>
                              <p className="text-xs text-gray-600">{appt.notes}</p>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No upcoming appointments</p>
                        <p className="text-xs text-gray-400 mt-1">Select a patient to view their schedule</p>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Document Helper Tab */}
                {rightTab === 'documents' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <img src={sanoIcon} alt="Sano" className="w-10 h-10 object-contain flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">Sano AI</h3>
                        <p className="text-xs text-gray-500">Upload and organize patient documents</p>
                      </div>
                      {currentPatient && (
                        <span className="text-xs text-gray-400 flex-shrink-0">{currentPatient.name}</span>
                      )}
                    </div>

                    {/* Past Conversations — visible only when chat is completely idle */}
                    {activeConvTab === 'current' &&
                     chatMessages.length === 0 &&
                     uploadedAIFiles.length === 0 &&
                     !chatInput.trim() &&
                     aiProcessingSteps.length === 0 &&
                     selectedPatient && pastConversations[selectedPatient]?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Past conversations</p>
                        {pastConversations[selectedPatient].map((conv, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveConvTab(idx)}
                            className="w-full text-left flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-100 transition-colors"
                          >
                            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-800 truncate">{conv.summary}</p>
                              <p className="text-xs text-gray-400">{conv.date}</p>
                            </div>
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* VIEW: past conversation detail */}
                    {typeof activeConvTab === 'number' && selectedPatient && pastConversations[selectedPatient]?.[activeConvTab] && (() => {
                      const conv = pastConversations[selectedPatient][activeConvTab as number];
                      return (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => setActiveConvTab('current')}
                              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                              Back
                            </button>
                          </div>
                          <p className="text-xs text-gray-400">{conv.date} · {conv.summary}</p>
                          {conv.messages.map((message, index) => (
                            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              {message.role === 'assistant' && (
                                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1" style={{ backgroundColor: '#3D38F5' }}>
                                  <Bot className="w-4 h-4 text-white" />
                                </div>
                              )}
                              <div className={`max-w-[85%] rounded-lg p-3 ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                                <p className="text-sm whitespace-pre-line" dangerouslySetInnerHTML={{ __html: renderMd(message.content) }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {/* VIEW: current/new conversation */}
                    {activeConvTab === 'current' && (
                      <div className="space-y-4">
                        {chatMessages.length === 0 && aiProcessingSteps.length === 0 && (
                          <div className="text-center py-12">
                            <Bot className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">Upload patient documents to get started</p>
                            <p className="text-xs text-gray-400 mt-1">AI will analyze and organize the files automatically</p>
                          </div>
                        )}
                        {chatMessages.map((message, index) => (
                          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {message.role === 'suggestion' ? (
                              <div className="w-full bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between gap-3">
                                <div className="flex items-start gap-2">
                                  <Pill className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs font-semibold text-amber-800">Suggested substitute</p>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                      <span className="line-through text-red-400">{message.originalName}</span>
                                      {' → '}
                                      <span className="font-medium text-green-700">{message.suggestedName}</span>
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => acceptMedSubstitution(message.medId!, message.suggestedName!)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors flex-shrink-0"
                                >
                                  <Check className="w-3 h-3" />
                                  Accept
                                </button>
                              </div>
                            ) : message.role === 'appointment-confirm' && message.appointmentData ? (
                              <div className="w-full bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-indigo-600" />
                                  <p className="text-sm font-semibold text-indigo-800">Confirm appointment</p>
                                </div>
                                <div className="space-y-1.5 text-sm text-gray-700">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                    <span>{message.appointmentData.date} · {message.appointmentData.time}</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-xs text-gray-600">{message.appointmentData.notes}</span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      if (!selectedPatient) return;
                                      const appt = message.appointmentData!;
                                      const displayDate = (() => { try { return new Date(appt.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); } catch { return appt.date; } })();
                                      setPatients(prev => prev.map(p => p.id === selectedPatient ? { ...p, appointments: [...(p.appointments ?? []), { date: displayDate, time: appt.time, room: 'Room 108, OEC Lugano', duration: '30 minutes', status: 'Confirmed', notes: appt.notes }] } : p));
                                      setChatMessages(prev => prev.map((m, i) => i === index ? { ...m, role: 'assistant' as const, content: `✓ Appointment added: ${displayDate} at ${appt.time}.`, appointmentData: undefined } : m));
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-medium"
                                    style={{ backgroundColor: '#3D38F5' }}
                                  >
                                    <Check className="w-3.5 h-3.5" /> Add to Calendar
                                  </button>
                                  <button
                                    onClick={() => setChatMessages(prev => prev.filter((_, i) => i !== index))}
                                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs"
                                  >
                                    Dismiss
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {message.role === 'assistant' && (
                                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1" style={{ backgroundColor: '#3D38F5' }}>
                                    <Bot className="w-4 h-4 text-white" />
                                  </div>
                                )}
                                <div className={`max-w-[85%] rounded-lg p-3 ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                                  <p className="text-sm whitespace-pre-line" dangerouslySetInnerHTML={{ __html: renderMd(message.content) }} />
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                        {/* AI Processing steps — after messages so autoscroll shows them */}
                        {aiProcessingSteps.length > 0 && (
                          <div className={`border rounded-xl p-4 ${isAIProcessing ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-start gap-2 mb-3">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#3D38F5' }}>
                                <Bot className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">
                                  {isAIProcessing ? 'Analyzing documents...' : 'Analysis complete'}
                                </p>
                                <p className={`text-xs ${isAIProcessing ? 'text-blue-600' : 'text-green-600'}`}>
                                  {isAIProcessing ? 'Please wait' : 'Patient profile updated'}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              {aiProcessingSteps.map((step, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                                  <p className="text-xs text-gray-700">{step}</p>
                                </div>
                              ))}
                              {isAIProcessing && (
                                <div className="flex items-center gap-2">
                                  <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                                  <p className="text-xs text-gray-500 italic">Processing...</p>
                                </div>
                              )}
                            </div>
                            {!isAIProcessing && (
                              <div className="mt-3 pt-3 border-t border-gray-200 flex items-start gap-2">
                                <AlertCircle className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-yellow-800">1 medication requires verification — check the Medications tab.</p>
                              </div>
                            )}
                          </div>
                        )}
                        {isAIThinking && (
                          <div className="flex justify-start">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center mr-2 flex-shrink-0">
                              <Bot className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-1">
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>
                    )}


                    {/* Smart Renaming panel */}
                    {docRenameSuggestions.length > 0 && (
                      <div
                        className="bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 border-2 border-purple-300 rounded-xl p-4 space-y-3 transition-all duration-300 ease-out"
                        style={{ opacity: docRenamePanelVisible ? 1 : 0, transform: docRenamePanelVisible ? 'translateY(0)' : 'translateY(-8px)' }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">Smart Renaming</p>
                              <p className="text-xs text-gray-500">Click on a name to edit it manually</p>
                            </div>
                          </div>
                          <button onClick={() => { setDocRenameSuggestions([]); setDocRenamePanelVisible(false); }} className="text-gray-400 hover:text-gray-600">
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          {docRenameSuggestions.map((s) => (
                            <div key={s.id} className="bg-white rounded-xl p-3 border border-purple-200">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                  <FileText className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
                                  <span className="text-sm text-gray-400 truncate shrink min-w-0 line-through">{s.original}</span>
                                  <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                  </svg>
                                  {editingRenameId === s.id ? (
                                    <input
                                      autoFocus
                                      className="text-sm font-semibold text-purple-900 border-b border-purple-400 outline-none bg-transparent min-w-0 flex-1"
                                      value={editingRenameValue}
                                      onChange={e => setEditingRenameValue(e.target.value)}
                                      onBlur={() => {
                                        if (editingRenameValue.trim()) {
                                          const ext = s.suggested.split('.').pop() || '';
                                          const newName = editingRenameValue.includes('.') ? editingRenameValue : `${editingRenameValue}.${ext}`;
                                          setDocRenameSuggestions(prev => prev.map(x => x.id === s.id ? { ...x, suggested: newName } : x));
                                        }
                                        setEditingRenameId(null);
                                      }}
                                      onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                    />
                                  ) : (
                                    <span
                                      className="text-sm font-semibold text-purple-900 truncate shrink min-w-0 cursor-text hover:underline"
                                      title="Click to edit"
                                      onClick={() => { setEditingRenameId(s.id); setEditingRenameValue(s.suggested.replace(/\.[^/.]+$/, '')); }}
                                    >{s.suggested}</span>
                                  )}
                                </div>
                                <button
                                  onClick={() => applyDocRename(s.id)}
                                  className="px-3 py-2 rounded-lg font-medium text-sm text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all flex-shrink-0 h-10"
                                >
                                  Accept
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {docRenameSuggestions.length > 1 && (
                          <button
                            onClick={applyAllDocRenames}
                            className="w-full px-4 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all shadow-md text-sm"
                          >
                            Accept All Changes
                          </button>
                        )}
                      </div>
                    )}

                  </div>
                )}

                {/* Meetings Tab */}
                {rightTab === 'meetings' && (
                  <div className="space-y-4">

                    {/* Active recording UI */}
                    {meetingState === 'recording' && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                            <span className="text-sm font-semibold text-red-700">Recording</span>
                            <span className="text-sm font-mono text-red-600">{formatDuration(meetingDuration)}</span>
                          </div>
                          <button
                            onClick={stopMeetingRecording}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors"
                          >
                            Stop
                          </button>
                        </div>
                        {currentPatient && (
                          <p className="text-xs text-red-500">{currentPatient.name} · {new Date().toLocaleDateString('en-CH')}</p>
                        )}
                        <div className="bg-white border border-red-100 rounded-lg p-3 min-h-[60px] max-h-32 overflow-y-auto">
                          {meetingTranscript
                            ? <p className="text-sm text-gray-700 leading-relaxed">{meetingTranscript}</p>
                            : <p className="text-xs text-gray-400 italic">Listening… speak to start transcribing</p>
                          }
                        </div>
                      </div>
                    )}

                    {/* Record button when idle */}
                    {meetingState === 'idle' && (
                      <button
                        onClick={startMeetingRecording}
                        disabled={!currentPatient}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-40 text-sm font-medium"
                      >
                        <Mic className="w-4 h-4" />
                        Record new meeting
                      </button>
                    )}

                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">Recorded Meetings</h3>
                      {viewingMeeting !== null && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => { setSavedMeetings(prev => prev.filter(x => x.id !== viewingMeeting)); setViewingMeeting(null); }}
                            className="text-xs text-red-500 hover:underline flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                          <button onClick={() => setViewingMeeting(null)} className="text-xs text-indigo-600 hover:underline">← Back</button>
                        </div>
                      )}
                    </div>

                    {viewingMeeting !== null ? (() => {
                      const m = savedMeetings.find(x => x.id === viewingMeeting);
                      if (!m) return null;
                      return (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{m.date}</span><span>·</span>
                            <span>{formatDuration(m.duration)}</span><span>·</span>
                            <span className="font-medium text-indigo-700">{m.patientName}</span>
                          </div>
                          {m.summary && (
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                              <p className="text-xs font-semibold text-indigo-700 mb-2">AI Summary</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{m.summary}</p>
                            </div>
                          )}
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-h-80 overflow-y-auto">
                            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Full Transcript</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{m.transcript || 'No transcript available.'}</p>
                          </div>
                        </div>
                      );
                    })() : savedMeetings.length === 0 ? (
                      <div className="text-center py-16">
                        <Mic className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No recorded meetings yet</p>
                        <p className="text-xs text-gray-400 mt-1">Press Record to start a new meeting</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {savedMeetings.map(m => (
                          <div key={m.id} className="group relative p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                            <button
                              onClick={() => setViewingMeeting(m.id)}
                              className="w-full text-left"
                            >
                              <div className="flex items-start gap-2">
                                <div className="min-w-0 pr-6">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{m.patientName}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">{m.date} · {formatDuration(m.duration)}</p>
                                  {m.summary && (
                                    <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">{m.summary}</p>
                                  )}
                                  {!m.summary && (
                                    <p className="text-xs text-gray-400 mt-1.5 italic line-clamp-2">{m.transcript.slice(0, 100)}{m.transcript.length > 100 ? '…' : ''}</p>
                                  )}
                                </div>
                              </div>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setSavedMeetings(prev => prev.filter(x => x.id !== m.id)); if (viewingMeeting === m.id) setViewingMeeting(null); }}
                              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-100 text-gray-400 hover:text-red-500 transition-all"
                              title="Delete meeting"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Input Area - Only for Documents Tab */}
              {rightTab === 'documents' && (
                <div className="p-6 pt-4 border-t border-gray-200 space-y-2">
                  {/* Staged files preview */}
                  {uploadedAIFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {uploadedAIFiles.map((file, i) => (
                        <div key={i} className="flex items-center gap-1 pl-2 pr-1 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-700">
                          <FileText className="w-3 h-3 flex-shrink-0" />
                          <span className="max-w-[140px] truncate">{file}</span>
                          <button onClick={() => setUploadedAIFiles(prev => prev.filter((_, j) => j !== i))} className="ml-0.5 hover:text-red-500">
                            <XIcon className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <label
                      className="px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
                      title="Upload documents"
                    >
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.tiff"
                        onChange={handleAIFileUpload}
                        className="hidden"
                      />
                      <Upload className="w-5 h-5 text-gray-600" />
                    </label>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder={isRecording ? '' : currentPatient ? `Ask about ${currentPatient.name}...` : 'Ask AI assistant or upload missing documents...'}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className={`w-full px-4 py-3 pr-12 border rounded-lg text-sm focus:outline-none transition-all duration-200 ${
                          isRecording
                            ? 'border-red-400 ring-2 ring-red-200 focus:ring-red-300'
                            : 'border-gray-300 focus:ring-2 focus:ring-[#3D38F5]'
                        }`}
                      />
                      {/* Waveform + interim transcript — shown only when input is empty */}
                      {isRecording && !chatInput && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 right-12 flex items-center gap-[3px] pointer-events-none overflow-hidden">
                          {!interimTranscript && [0.4, 0.7, 1, 0.7, 0.4].map((h, i) => (
                            <span
                              key={i}
                              className="block w-[3px] rounded-full bg-red-400 flex-shrink-0"
                              style={{
                                height: `${h * 16}px`,
                                animation: `voiceBar 0.8s ease-in-out ${i * 0.12}s infinite alternate`
                              }}
                            />
                          ))}
                          <span className={`text-sm truncate ${interimTranscript ? 'text-red-400 italic' : 'text-red-400 ml-2'}`}>
                            {interimTranscript || 'Listening...'}
                          </span>
                        </div>
                      )}
                      {/* Interim transcript appended after confirmed text */}
                      {isRecording && chatInput && interimTranscript && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 right-12 pointer-events-none text-sm truncate">
                          <span className="text-transparent">{chatInput} </span>
                          <span className="text-red-400 italic">{interimTranscript}</span>
                        </div>
                      )}
                      <button
                        onClick={handleVoiceRecord}
                        title={isRecording ? 'Stop recording' : 'Start voice input'}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                          isRecording ? 'text-red-500' : 'text-gray-400 hover:text-[#3D38F5]'
                        }`}
                      >
                        {isRecording
                          ? <MicOff className="w-4 h-4" />
                          : <Mic className="w-4 h-4" />
                        }
                      </button>
                    </div>
                    <button
                      onClick={generateRandomPrompt}
                      title="Generate random test prompt"
                      disabled={isAIThinking}
                      className="px-3 py-3 rounded-lg border border-gray-300 text-gray-500 hover:border-[#3D38F5] hover:text-[#3D38F5] transition-all disabled:opacity-40"
                    >
                      <Sparkles className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleSendMessage()}
                      className="px-4 py-3 rounded-lg text-white hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: '#3D38F5' }}
                      disabled={(!chatInput.trim() && uploadedAIFiles.length === 0) || isAIThinking}
                    >
                      {isAIThinking
                        ? <RefreshCw className="w-5 h-5 animate-spin" />
                        : <Send className="w-5 h-5" />
                      }
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Meeting Review Panel */}
      {meetingState === 'review' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Meeting Recording</h2>
                <p className="text-xs text-gray-500 mt-0.5">{currentPatient?.name} · {formatDuration(meetingDuration)}</p>
              </div>
              <button onClick={() => setMeetingState('idle')} className="p-2 rounded-lg hover:bg-gray-100">
                <XIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Transcript */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Full Transcript</p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-h-48 overflow-y-auto">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {meetingTranscript || <span className="italic text-gray-400">No speech detected during recording.</span>}
                  </p>
                </div>
              </div>

              {/* Summary */}
              {meetingSummary && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">AI Summary</p>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{meetingSummary}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
              <button
                onClick={summarizeMeeting}
                disabled={isSummarizing || !meetingTranscript}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors text-sm font-medium disabled:opacity-40"
              >
                {isSummarizing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {meetingSummary ? 'Re-summarize' : 'Get AI Summary'}
              </button>
              <button
                onClick={saveMeeting}
                disabled={!meetingTranscript}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-40 ml-auto"
                style={{ backgroundColor: '#3D38F5' }}
              >
                <Check className="w-4 h-4" />
                Save to Meetings
              </button>
              <button
                onClick={() => setMeetingState('idle')}
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Patient Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-400/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Patient Profile</h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete this patient profile? This action will permanently remove:
                </p>
                <ul className="mt-3 space-y-1 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    <span>All patient identification data</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    <span>Medical history and records</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    <span>Medications and prescriptions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    <span>Uploaded documents</span>
                  </li>
                </ul>
                <p className="mt-3 text-sm font-semibold text-red-700">
                  ⚠️ This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPatientToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deletePatient}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Delete Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
