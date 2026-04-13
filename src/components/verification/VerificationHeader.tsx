import React from 'react';
import { Progress } from '@/components/ui/progress';
import { ShieldCheck } from 'lucide-react';

interface VerificationHeaderProps {
  completedSteps: Set<number>;
}

export const VerificationHeader: React.FC<VerificationHeaderProps> = ({ completedSteps }) => {
  const progress = (completedSteps.size / 9) * 100;

  return (
    <header className="bg-card border-b border-border px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Background Verification</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {completedSteps.size} of 9 steps completed
          </span>
          <Progress value={progress} className="h-2 w-36" />
        </div>
      </div>
    </header>
  );
};
