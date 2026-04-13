import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

const Verification = () => {
  const [state, setState] = useState<VerificationState>(initialState);
  const scrollRef = useRef<HTMLDivElement>(null);
  const step = state.currentStep;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  const update = useCallback(<K extends keyof VerificationState>(key: K, value: VerificationState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  }, []);

  const completedSteps = useMemo(() => {
    const set = new Set<number>();
    if (state.identity.aadhaar || state.identity.pan) set.add(0);
    if (state.address.currentAddress && state.address.currentCity && state.address.addressProof) set.add(1);
    if (state.education.some((e) => e.institution && e.board && e.document)) set.add(2);
    if (state.employment.some((e) => e.company && e.designation)) set.add(3);
    if (state.financial.bankStatement || state.financial.salarySlip) set.add(4);
    if (state.photo.photo) set.add(5);
    if (state.backgroundCheck.consentGiven && state.backgroundCheck.noCriminalRecord && state.backgroundCheck.references.some((r) => r.name && r.email && r.phone)) set.add(6);
    set.add(7);
    if (set.size >= 8) set.add(8);
    return set;
  }, [state]);

  const goTo = (s: number) => setState((prev) => ({ ...prev, currentStep: s }));

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
            <Button size="sm" disabled={step === STEPS.length - 1} onClick={() => goTo(step + 1)} className="bg-primary text-primary-foreground gap-1">
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verification;
