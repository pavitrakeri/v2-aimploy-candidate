import React from 'react';
import { Progress } from '@/components/ui/progress';
import { ShieldCheck } from 'lucide-react';

interface VerificationHeaderProps {
  completedSteps: Set<number>;
}

export const VerificationHeader: React.FC<VerificationHeaderProps> = ({ completedSteps }) => {
  const progress = (completedSteps.size / 9) * 100;

  return (
    <header className="bg-card border-b border-border p-4 md:p-6 rounded-t-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight">Background Verification</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Verify credentials securely via automated BGV</p>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-border/50 pt-2 sm:border-0 sm:pt-0">
          <span className="text-xs md:text-sm font-semibold text-muted-foreground">
            {completedSteps.size} of 9 completed
          </span>
          <Progress value={progress} className="h-2 w-28 md:w-36" />
        </div>
      </div>
    </header>
  );
};
