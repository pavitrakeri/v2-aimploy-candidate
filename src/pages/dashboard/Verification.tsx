import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { VerificationHeader } from '@/components/verification/VerificationHeader';
import { StepSidebar } from '@/components/verification/StepSidebar';
import { IdentityStep } from '@/components/verification/steps/IdentityStep';
import { AddressStep } from '@/components/verification/steps/AddressStep';
import { EducationStep } from '@/components/verification/steps/EducationStep';
import { EmploymentStep } from '@/components/verification/steps/EmploymentStep';
import { FinancialStep } from '@/components/verification/steps/FinancialStep';
import { PhotoStep } from '@/components/verification/steps/PhotoStep';
import { BackgroundCheckStep } from '@/components/verification/steps/BackgroundCheckStep';
import { AdditionalDocsStep } from '@/components/verification/steps/AdditionalDocsStep';
import { ReviewStep } from '@/components/verification/steps/ReviewStep';
import { STEPS, initialState, type VerificationState } from '@/types/verification';
import { useVerification } from '@/contexts/VerificationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Verification = () => {
  const { 
    state, 
    updateState, 
    verification, 
    verificationStatus, 
    isLoading, 
    error, 
    startVerification, 
    submitVerification 
  } = useVerification();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const step = state.currentStep;
  const [verificationStarted, setVerificationStarted] = useState(false);
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  const update = useCallback(<K extends keyof VerificationState>(key: K, value: VerificationState[K]) => {
    updateState({ [key]: value });
  }, [updateState]);

  const handleStartVerification = () => {
    setVerificationStarted(true);
  };

  const handleSubmitVerification = async () => {
    try {
      // Mock candidate ID - in real app, get from auth context
      const candidateId = 1;
      await startVerification(candidateId);
      await submitVerification();
      setVerificationSubmitted(true);
    } catch (error) {
      console.error('Failed to submit verification:', error);
    }
  };

  const handleReviewVerification = () => {
    window.location.href = '/dashboard/verification-management';
  };

  const completedSteps = useMemo(() => {
    const set = new Set<number>();
    if (state.identity.aadhaar || state.identity.pan) set.add(0);
    if (state.address.currentAddress && state.address.currentCity && state.address.addressProof) set.add(1);
    if (state.education.some((e) => e.institution && e.board && e.document)) set.add(2);
    if (state.employment.some((e) => e.company && e.designation)) set.add(3);
    if (state.financial.bankStatement || state.financial.salarySlip) set.add(4);
    if (state.photo.photo) set.add(5);
    if (state.backgroundCheck.consentGiven && state.backgroundCheck.noCriminalRecord && state.backgroundCheck.references.some((r) => r.name && r.email && r.phone)) set.add(6);
    if (state.additionalDocs.some((doc) => doc.file && doc.label)) set.add(7);
    if (set.size >= 8) set.add(8);
    return set;
  }, [state]);

  const goTo = (s: number) => updateState({ currentStep: s });

  const renderStep = () => {
    switch (step) {
      case 0: return <IdentityStep data={state.identity} onChange={(d) => update('identity', d)} />;
      case 1: return <AddressStep data={state.address} onChange={(d) => update('address', d)} />;
      case 2: return <EducationStep data={state.education} onChange={(d) => update('education', d)} />;
      case 3: return <EmploymentStep data={state.employment} onChange={(d) => update('employment', d)} />;
      case 4: return <FinancialStep data={state.financial} onChange={(d) => update('financial', d)} />;
      case 5: return <PhotoStep data={state.photo} onChange={(d) => update('photo', d)} />;
      case 6: return <BackgroundCheckStep data={state.backgroundCheck} onChange={(d) => update('backgroundCheck', d)} />;
      case 7: return <AdditionalDocsStep data={state.additionalDocs} onChange={(d) => update('additionalDocs', d)} />;
      case 8: return <ReviewStep state={state} completedSteps={completedSteps} onGoToStep={goTo} />;
      default: return null;
    }
  };

  
  return (
    <div className="w-full -mt-6">
      {/* Start Verification Screen */}
      {!verificationStarted && !verificationSubmitted && (
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Background Verification</CardTitle>
              <p className="text-muted-foreground">
                Complete your background verification process by providing the required documents and information.
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4 mb-6">
                <div className="text-left">
                  <h3 className="font-medium mb-2">What you'll need:</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Identity documents (Aadhaar, PAN, Passport)</li>
                    <li>• Address proof documents</li>
                    <li>• Education certificates</li>
                    <li>• Employment documents</li>
                    <li>• Professional references</li>
                    <li>• Recent photograph</li>
                  </ul>
                </div>
              </div>
              <Button 
                onClick={handleStartVerification}
                size="lg"
                className="w-full sm:w-auto"
              >
                Start Verification
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success Screen */}
      {verificationSubmitted && (
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">Successfully Submitted!</CardTitle>
              <p className="text-muted-foreground">
                Your background verification has been submitted successfully. We'll review your documents and information.
              </p>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {verification && (
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <h3 className="font-medium mb-2">Verification Details:</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Verification ID:</span> #{verification.id}</p>
                    <p><span className="text-muted-foreground">Status:</span> {verification.status}</p>
                    <p><span className="text-muted-foreground">Submitted:</span> {new Date(verification.initiated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline"
                  onClick={handleReviewVerification}
                >
                  Review Verification
                </Button>
                <Button 
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Verification Form */}
      {verificationStarted && !verificationSubmitted && (
        <>
          {/* Status Display */}
          {verification && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {verification.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                    )}
                    Verification Status: {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/dashboard/verification-management'}
                  >
                    View Details
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Verification ID: {verification.id} | Started: {new Date(verification.initiated_at).toLocaleDateString()}
                </p>
                {verificationStatus && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{verificationStatus.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${verificationStatus.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <VerificationHeader completedSteps={completedSteps} />

          <div className="flex gap-6">
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="h-screen sticky top-0">
                <StepSidebar currentStep={step} completedSteps={completedSteps} onStepClick={goTo} />
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-6">
                {renderStep()}
              </div>

              <div className="flex items-center justify-between border-t border-border bg-card px-4 py-3 sm:px-6">
                <Button variant="outline" size="sm" disabled={step === 0} onClick={() => goTo(step - 1)} className="gap-1">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Step {step + 1} of {STEPS.length}</span>
                </div>
                {step === STEPS.length - 1 ? (
                  <Button 
                    size="sm" 
                    onClick={handleSubmitVerification}
                    disabled={isLoading || completedSteps.size < STEPS.length}
                    className="bg-green-600 text-white gap-1"
                  >
                    <span className="hidden sm:inline">
                      {isLoading ? 'Submitting...' : 'Submit Verification'}
                    </span>
                    {isLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    disabled={step === STEPS.length - 1} 
                    onClick={() => goTo(step + 1)} 
                    className="bg-primary text-primary-foreground gap-1"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Verification;
