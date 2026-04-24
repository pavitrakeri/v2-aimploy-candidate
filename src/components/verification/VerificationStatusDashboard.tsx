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
        return 'bg-green-100 text-green-800';
      case 'in_progress':
      case 'pending_verification':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
      case 'pending_verification':
        return <Clock className="h-4 w-4" />;
      case 'failed':
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <p className="font-medium capitalize">
                      {check.verification_type.replace('_', ' ')}
                    </p>
                    {check.result && (
                      <p className="text-sm text-muted-foreground">{check.result}</p>
                    )}
                  </div>
                </div>
                <Badge className={getStatusColor(check.status)}>
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
            
            <div className="space-y-2">
              {references.map((reference) => (
                <div key={reference.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{reference.name}</p>
                    <p className="text-sm text-muted-foreground">{reference.company} • {reference.relationship}</p>
                    <p className="text-sm text-muted-foreground">{reference.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(reference.status)}>
                      {reference.status.replace('_', ' ')}
                    </Badge>
                    {reference.verified_at && (
                      <p className="text-xs text-muted-foreground mt-1">
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
