export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  // OpenAI validation fields
  validation_score?: number;
  validation_details?: Record<string, any>;
  analysis_method?: string;
  validation_status?: 'pending' | 'verified' | 'rejected' | 'needs_review';
  rawFile?: File;
  metadata?: any;
}

export interface IdentityData {
  aadhaar?: UploadedFile;
  pan?: UploadedFile;
  passport?: UploadedFile;
  voterId?: UploadedFile;
  drivingLicence?: UploadedFile;
}

export interface AddressData {
  currentAddress: string;
  currentCity: string;
  currentState: string;
  currentPincode: string;
  permanentAddress: string;
  permanentCity: string;
  permanentState: string;
  permanentPincode: string;
  sameAsCurrent: boolean;
  addressProof?: UploadedFile;
}

export type EducationLevel = '10th' | '12th / Diploma' | 'Degree' | 'Post Graduation';

export interface EducationEntry {
  id: string;
  level: EducationLevel;
  institution: string;
  board: string;
  year: string;
  percentage: string;
  document?: UploadedFile;
}

export interface EmploymentEntry {
  id: string;
  company: string;
  designation: string;
  fromDate: string;
  toDate: string;
  managerName?: string;
  hrEmail?: string;
  offerLetter?: UploadedFile;
  experienceLetter?: UploadedFile;
  payslip?: UploadedFile;
}

export interface FinancialData {
  bankStatement?: UploadedFile;
  salarySlip?: UploadedFile;
  taxReturn?: UploadedFile;
}

export interface PhotoData {
  photo?: UploadedFile;
}

export interface ReferenceEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  company: string;
}

export interface BackgroundCheckData {
  consentGiven: boolean;
  noCriminalRecord: boolean;
  references: ReferenceEntry[];
}

export interface AdditionalDoc {
  id: string;
  label: string;
  file?: UploadedFile;
}

export interface VerificationState {
  currentStep: number;
  identity: IdentityData;
  address: AddressData;
  education: EducationEntry[];
  employment: EmploymentEntry[];
  financial: FinancialData;
  photo: PhotoData;
  backgroundCheck: BackgroundCheckData;
  additionalDocs: AdditionalDoc[];
}

export const STEPS = [
  { label: 'Identity', icon: 'Fingerprint' },
  { label: 'Address', icon: 'MapPin' },
  { label: 'Education', icon: 'GraduationCap' },
  { label: 'Employment', icon: 'Briefcase' },
  { label: 'Financial', icon: 'Landmark' },
  { label: 'Photo', icon: 'Camera' },
  { label: 'Additional Docs', icon: 'FolderPlus' },
  { label: 'Review & Submit', icon: 'ClipboardCheck' },
] as const;

export const initialState: VerificationState = {
  currentStep: 0,
  identity: {},
  address: {
    currentAddress: '', currentCity: '', currentState: '', currentPincode: '',
    permanentAddress: '', permanentCity: '', permanentState: '', permanentPincode: '',
    sameAsCurrent: false,
  },
  education: [
    { id: '10th', level: '10th', institution: '', board: '', year: '', percentage: '' },
    { id: '12th', level: '12th / Diploma', institution: '', board: '', year: '', percentage: '' },
    { id: 'degree', level: 'Degree', institution: '', board: '', year: '', percentage: '' },
    { id: 'pg', level: 'Post Graduation', institution: '', board: '', year: '', percentage: '' },
  ],
  employment: [{ id: '1', company: '', designation: '', fromDate: '', toDate: '', managerName: '', hrEmail: '' }],
  financial: {},
  photo: {},
  backgroundCheck: { consentGiven: false, noCriminalRecord: false, references: [{ id: '1', name: '', email: '', phone: '', relationship: '', company: '' }] },
  additionalDocs: [],
};
