import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VerificationState } from '@/types/verification';
import { 
  CheckCircle, 
  Circle, 
  FileText, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Landmark, 
  Camera, 
  ShieldCheck, 
  FolderPlus,
  Edit,
  ChevronRight
} from 'lucide-react';

interface ReviewStepProps {
  state: VerificationState;
  completedSteps: Set<number>;
  onGoToStep: (step: number) => void;
}

const stepIcons = {
  0: FileText,
  1: MapPin,
  2: GraduationCap,
  3: Briefcase,
  4: Landmark,
  5: Camera,
  6: FolderPlus,
};

const stepTitles = [
  'Identity Verification',
  'Address Verification',
  'Education Verification',
  'Employment Verification',
  'Financial Verification',
  'Photo Verification',
  'Additional Documents'
];

export const ReviewStep: React.FC<ReviewStepProps> = ({ 
  state, 
  completedSteps, 
  onGoToStep 
}) => {
  const getStepStatus = (stepIndex: number) => {
    if (completedSteps.has(stepIndex)) {
      return { status: 'completed', color: 'text-green-600', bgColor: 'bg-green-100' };
    }
    return { status: 'pending', color: 'text-gray-400', bgColor: 'bg-gray-100' };
  };

  const getDocumentCount = () => {
    let count = 0;
    
    // Identity documents
    count += Object.values(state.identity).filter(Boolean).length;
    
    // Address proof
    if (state.address.addressProof) count++;
    
    // Education documents
    count += state.education.filter(edu => edu.document).length;
    
    // Employment documents
    state.employment.forEach(emp => {
      if (emp.offerLetter) count++;
      if (emp.experienceLetter) count++;
      if (emp.payslip) count++;
    });
    
    // Financial documents
    count += Object.values(state.financial).filter(Boolean).length;
    
    // Photo
    if (state.photo.photo) count++;
    
    // Additional documents
    count += state.additionalDocs.filter(doc => doc.file).length;
    
    return count;
  };

  const isReadyToSubmit = completedSteps.size >= 7; // At least 7 steps completed

  const getStepSummary = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Identity
        const identityDocs = Object.entries(state.identity).filter(([_, file]) => file).length;
        return `${identityDocs} document${identityDocs !== 1 ? 's' : ''} uploaded`;
      
      case 1: // Address
        const hasAddress = state.address.currentAddress && state.address.currentCity;
        const hasProof = state.address.addressProof;
        return hasAddress && hasProof ? 'Address and proof provided' : 'Incomplete';
      
      case 2: // Education
        const eduDocs = state.education.filter(edu => edu.document).length;
        const eduInfo = state.education.filter(edu => edu.institution && edu.board).length;
        return `${eduInfo} entries filled, ${eduDocs} document${eduDocs !== 1 ? 's' : ''}`;
      
      case 3: // Employment
        const empEntries = state.employment.filter(emp => emp.company && emp.designation).length;
        const empDocs = state.employment.reduce((count, emp) => {
          return count + [emp.offerLetter, emp.experienceLetter, emp.payslip].filter(Boolean).length;
        }, 0);
        return `${empEntries} entr${empEntries !== 1 ? 'ies' : 'y'}, ${empDocs} document${empDocs !== 1 ? 's' : ''}`;
      
      case 4: // Financial
        const finDocs = Object.values(state.financial).filter(Boolean).length;
        return `${finDocs} document${finDocs !== 1 ? 's' : ''} uploaded`;
      
      case 5: // Photo
        return state.photo.photo ? 'Photo uploaded' : 'No photo';
      
      case 6: // Additional Docs
        const addDocs = state.additionalDocs.filter(doc => doc.file).length;
        return `${addDocs} additional document${addDocs !== 1 ? 's' : ''}`;
      
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Review & Submit</h2>
        <p className="text-muted-foreground">
          Review your verification details before submitting. You can go back to edit any section.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedSteps.size}</p>
                <p className="text-sm text-muted-foreground">Steps Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{getDocumentCount()}</p>
                <p className="text-sm text-muted-foreground">Documents Uploaded</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <ShieldCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {isReadyToSubmit ? 'Ready' : 'Pending'}
                </p>
                <p className="text-sm text-muted-foreground">Submission Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step-by-step Review */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Steps Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stepTitles.map((title, index) => {
              const Icon = stepIcons[index as keyof typeof stepIcons];
              const stepStatus = getStepStatus(index);
              const isCompleted = completedSteps.has(index);
              
              return (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${
                    isCompleted ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-gray-50/50'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle className={`h-6 w-6 ${stepStatus.color}`} />
                    ) : (
                      <Circle className={`h-6 w-6 ${stepStatus.color}`} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-4 w-4 ${stepStatus.color}`} />
                      <h3 className="font-medium">{title}</h3>
                      <Badge 
                        variant={isCompleted ? "default" : "secondary"}
                        className={isCompleted ? stepStatus.bgColor : ''}
                      >
                        {isCompleted ? 'Completed' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getStepSummary(index)}
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onGoToStep(index)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Submission Section */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isReadyToSubmit ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Ready to Submit!</h4>
                <p className="text-sm text-green-800">
                  Your verification is complete. Click below to submit for review.
                </p>
              </div>
              
              <Button size="lg" className="w-full gradient-primary gap-2">
                Submit Verification
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-medium text-amber-900 mb-2">Almost There!</h4>
                <p className="text-sm text-amber-800">
                  Complete {8 - completedSteps.size} more step{(8 - completedSteps.size) !== 1 ? 's' : ''} to submit your verification.
                </p>
              </div>
              
              <Button size="lg" className="w-full" disabled>
                Submit Verification
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground text-center">
            By submitting, you confirm that all information provided is accurate and authentic.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
