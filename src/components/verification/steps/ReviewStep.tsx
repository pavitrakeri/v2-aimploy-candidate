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
      return { status: 'completed', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100/80 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-transparent font-semibold text-[10px]' };
    }
    return { status: 'pending', color: 'text-muted-foreground/50', bgColor: 'bg-muted text-muted-foreground border-transparent font-semibold text-[10px]' };
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
              <div className="p-2 rounded-lg bg-blue-100/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{completedSteps.size}</p>
                <p className="text-xs text-muted-foreground">Steps Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100/80 dark:bg-green-950/40 text-green-600 dark:text-green-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{getDocumentCount()}</p>
                <p className="text-xs text-muted-foreground">Documents Uploaded</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100/80 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {isReadyToSubmit ? 'Ready' : 'Pending'}
                </p>
                <p className="text-xs text-muted-foreground">Submission Status</p>
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
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border transition-all ${
                    isCompleted 
                      ? 'border-green-200 bg-green-50/25 dark:border-green-900/30 dark:bg-green-950/5' 
                      : 'border-border bg-muted/20'
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 mt-0.5">
                      {isCompleted ? (
                        <CheckCircle className={`h-5 w-5 ${stepStatus.color}`} />
                      ) : (
                        <Circle className={`h-5 w-5 ${stepStatus.color}`} />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Icon className={`h-3.5 w-3.5 ${stepStatus.color}`} />
                        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
                        <Badge 
                          className={stepStatus.bgColor}
                        >
                          {isCompleted ? 'Completed' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-normal">
                        {getStepSummary(index)}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onGoToStep(index)}
                    className="gap-2 self-start sm:self-center text-xs h-8"
                  >
                    <Edit className="h-3.5 w-3.5" />
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
              <div className="p-4 bg-green-50/50 border border-green-200 dark:bg-green-950/20 dark:border-green-900/50 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-400 mb-1 text-sm">Ready to Submit!</h4>
                <p className="text-xs text-green-800 dark:text-green-450 leading-relaxed">
                  Your verification is complete. Click below to submit for review.
                </p>
              </div>
              
              <Button size="lg" className="w-full bg-gradient-primary text-white hover:opacity-90 transition-opacity gap-2 font-bold text-sm">
                Submit Verification
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50 rounded-lg">
                <h4 className="font-semibold text-amber-900 dark:text-amber-400 mb-1 text-sm">Almost There!</h4>
                <p className="text-xs text-amber-800 dark:text-amber-450 leading-relaxed">
                  Complete {8 - completedSteps.size} more step{(8 - completedSteps.size) !== 1 ? 's' : ''} to submit your verification.
                </p>
              </div>
              
              <Button size="lg" className="w-full text-sm font-semibold" disabled>
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
