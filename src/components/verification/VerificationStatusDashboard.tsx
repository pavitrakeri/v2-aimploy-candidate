import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle, FileText, Users, Shield } from 'lucide-react';
import { VerificationStatus, ReferenceResponse, DocumentResponse } from '@/services/verification-api';
import DocumentValidationCard from './DocumentValidationCard';

interface VerificationStatusDashboardProps {
  verificationStatus: VerificationStatus;
  references: ReferenceResponse[];
  documents: DocumentResponse[];
}

const VerificationStatusDashboard: React.FC<VerificationStatusDashboardProps> = ({
  verificationStatus,
  references,
  documents
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return 'bg-green-100/80 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200/50 dark:border-green-900/50';
      case 'in_progress':
      case 'pending_verification':
        return 'bg-blue-100/80 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/50';
      case 'failed':
      case 'rejected':
        return 'bg-red-100/80 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-900/50';
      default:
        return 'bg-secondary/40 text-muted-foreground border-border/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'in_progress':
      case 'pending_verification':
        return <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'failed':
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Background Verification Status
            </span>
            <Badge className={getStatusColor(verificationStatus.overall_status)}>
              {verificationStatus.overall_status.charAt(0).toUpperCase() + verificationStatus.overall_status.slice(1)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{verificationStatus.progress_percentage}%</span>
              </div>
              <Progress value={verificationStatus.progress_percentage} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Verification ID:</span>
                <p className="font-medium">#{verificationStatus.verification_id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Started:</span>
                <p className="font-medium">{new Date(verificationStatus.initiated_at).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <p className="font-medium">{new Date(verificationStatus.last_updated).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Est. Completion:</span>
                <p className="font-medium">
                  {verificationStatus.estimated_completion 
                    ? new Date(verificationStatus.estimated_completion).toLocaleDateString()
                    : 'In Progress'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {verificationStatus.checks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-3.5 border border-border/80 bg-muted/10 dark:bg-muted/5 rounded-xl shadow-sm hover:shadow transition-shadow">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <p className="font-bold text-sm text-foreground capitalize">
                      {check.verification_type.replace('_', ' ')}
                    </p>
                    {check.result && (
                      <p className="text-xs text-muted-foreground mt-0.5">{check.result}</p>
                    )}
                  </div>
                </div>
                <Badge className={`${getStatusColor(check.status)} border-transparent font-bold text-[10px] uppercase`}>
                  {check.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* References Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Professional References
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {verificationStatus.references_verified} of {verificationStatus.references_count} references verified
              </span>
              <span className="text-sm font-medium">
                {references.length > 0 
                  ? Math.round((verificationStatus.references_verified / verificationStatus.references_count) * 100)
                  : 0}% Complete
              </span>
            </div>
            
            <div className="space-y-3">
              {references.map((reference) => (
                <div key={reference.id} className="flex items-center justify-between p-3.5 border border-border/80 bg-muted/10 dark:bg-muted/5 rounded-xl shadow-sm hover:shadow transition-shadow">
                  <div>
                    <p className="font-bold text-sm text-foreground">{reference.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{reference.company} • {reference.relationship}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{reference.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getStatusColor(reference.status)} border-transparent font-bold text-[10px] uppercase`}>
                      {reference.status.replace('_', ' ')}
                    </Badge>
                    {reference.verified_at && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Verified {new Date(reference.verified_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {verificationStatus.documents_verified} of {verificationStatus.documents_count} documents verified
              </span>
              <span className="text-sm font-medium">
                {documents.length > 0 
                  ? Math.round((verificationStatus.documents_verified / verificationStatus.documents_count) * 100)
                  : 0}% Complete
              </span>
            </div>
            
            <div className="space-y-4">
              {documents.map((document) => (
                <DocumentValidationCard key={document.id} document={document} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationStatusDashboard;
