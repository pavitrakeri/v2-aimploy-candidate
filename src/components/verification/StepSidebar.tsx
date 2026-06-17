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
      return <CheckCircle className="h-4.5 w-4.5 text-green-600 dark:text-green-400 shrink-0" />;
    }
    
    return (
      <Circle className={`h-4.5 w-4.5 shrink-0 ${
        isCurrent ? 'text-primary animate-pulse' : 'text-muted-foreground/45'
      }`} />
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-full h-full flex-col border-r border-border bg-card p-6 overflow-hidden">
        <h2 className="text-base font-bold mb-6 text-foreground flex-shrink-0 tracking-tight">Verification Steps</h2>
        <nav className="space-y-1.5 overflow-hidden">
          {STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = completedSteps.has(index);
            
            return (
              <Button
                key={step.label}
                variant="ghost"
                className={`w-full justify-start gap-3 h-auto p-3.5 flex-shrink-0 transition-all rounded-lg border-l-2 ${
                  isActive 
                    ? 'bg-primary/5 text-primary border-primary dark:bg-primary/10' 
                    : isCompleted
                      ? 'border-transparent text-foreground/80 hover:text-foreground hover:bg-muted/30'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
                onClick={() => onStepClick(index)}
              >
                {getIcon(index)}
                <div className="text-left">
                  <div className={`font-semibold text-sm ${
                    isActive 
                      ? 'text-primary' 
                      : isCompleted 
                        ? 'text-foreground' 
                        : 'text-muted-foreground'
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
      <div className="lg:hidden border-b border-border bg-card p-3 sticky top-0 z-20">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = completedSteps.has(index);
            
            return (
              <Button
                key={step.label}
                variant={isActive ? "default" : isCompleted ? "secondary" : "outline"}
                size="sm"
                className={`flex-shrink-0 gap-1.5 px-3 py-1.5 h-8.5 rounded-full text-xs font-semibold ${
                  isActive 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                    : isCompleted 
                      ? 'bg-green-100/60 text-green-800 dark:bg-green-950/20 dark:text-green-400 dark:border-green-950/30' 
                      : 'text-muted-foreground border-border hover:bg-muted/40'
                }`}
                onClick={() => onStepClick(index)}
              >
                {getIcon(index)}
                <span>{index + 1}. {step.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
};
