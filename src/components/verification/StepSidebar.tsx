import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Circle } from 'lucide-react';
import { STEPS } from '@/types/verification';

interface StepSidebarProps {
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
}

export const StepSidebar: React.FC<StepSidebarProps> = ({
  currentStep,
  completedSteps,
  onStepClick
}) => {
  const getIcon = (stepIndex: number) => {
    const isCompleted = completedSteps.has(stepIndex);
    const isCurrent = stepIndex === currentStep;
    
    if (isCompleted) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    
    return (
      <Circle className={`h-5 w-5 ${
        isCurrent ? 'text-primary' : 'text-muted-foreground/30'
      }`} />
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-full h-full flex-col border-r border-border bg-card p-6 overflow-hidden">
        <h2 className="text-lg font-semibold mb-6 text-foreground flex-shrink-0">Verification Steps</h2>
        <nav className="space-y-2 overflow-hidden">
          {STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = completedSteps.has(index);
            
            return (
              <Button
                key={step.label}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 h-auto p-3 flex-shrink-0 ${
                  isActive ? 'bg-primary/10 text-primary' : ''
                }`}
                onClick={() => onStepClick(index)}
              >
                {getIcon(index)}
                <div className="text-left">
                  <div className={`font-medium ${
                    isActive ? 'text-primary' : isCompleted ? 'text-black' : 'text-black'
                  }`}>
                    {index + 1}. {step.label}
                  </div>
                </div>
              </Button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Horizontal Scroll */}
      <div className="lg:hidden border-b border-border bg-card p-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = completedSteps.has(index);
            
            return (
              <Button
                key={step.label}
                variant={isActive ? "default" : isCompleted ? "secondary" : "outline"}
                size="sm"
                className={`flex-shrink-0 gap-2 ${
                  isActive ? 'bg-primary text-primary-foreground' : ''
                }`}
                onClick={() => onStepClick(index)}
              >
                {getIcon(index)}
                <span className="text-xs">{index + 1}. {step.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
};
