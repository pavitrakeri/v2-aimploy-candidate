import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useVerification } from '@/contexts/VerificationContext';
import { profileApi } from '@/services/api';
import { CandidateProfile } from '@/services/api';
import VerificationStatusDashboard from '@/components/verification/VerificationStatusDashboard';
import { useNavigate } from 'react-router-dom';

const VerificationManagement: React.FC = () => {
  const navigate = useNavigate();
  const {
    verification,
    verificationStatus,
    references,
    documents,
    isLoading,
    error,
    getVerificationStatus
  } = useVerification();

  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get candidate profile
        const profile = await profileApi.getProfile();
        setCandidateProfile(profile);

        // Get verification status
        await getVerificationStatus(profile.id);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getVerificationStatus]);

  const handleRefresh = async () => {
    if (candidateProfile) {
      await getVerificationStatus(candidateProfile.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100/80 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200/50 dark:border-green-900/50';
      case 'in_progress':
        return 'bg-blue-100/80 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/50';
      case 'pending':
        return 'bg-yellow-100/80 dark:bg-yellow-950/30 text-yellow-750 dark:text-yellow-400 border-yellow-200/50 dark:border-yellow-900/50';
      case 'failed':
        return 'bg-red-100/80 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-900/50';
      default:
        return 'bg-secondary/40 text-muted-foreground border-border/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/dashboard/verification')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Verification
          </Button>
          <h1 className="text-2xl font-bold">Verification Management</h1>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* No Verification Status */}
      {!verificationStatus && !error && (
        <Card>
          <CardHeader>
            <CardTitle>No Active Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You haven't started any background verification yet.
            </p>
            <Button onClick={() => navigate('/dashboard/verification')}>
              Start Verification
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Verification Status */}
      {verificationStatus && (
        <div className="space-y-6">
          {/* Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {getStatusIcon(verificationStatus.overall_status)}
                  Verification Overview
                </span>
                <Badge className={getStatusColor(verificationStatus.overall_status)}>
                  {verificationStatus.overall_status.charAt(0).toUpperCase() + verificationStatus.overall_status.slice(1)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center bg-muted/20 border border-border/50 rounded-xl p-4">
                  <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-450">
                    {verificationStatus.progress_percentage}%
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground mt-1">Progress</div>
                </div>
                <div className="text-center bg-muted/20 border border-border/50 rounded-xl p-4">
                  <div className="text-2xl font-extrabold text-green-600 dark:text-green-450">
                    {verificationStatus.references_verified}/{verificationStatus.references_count}
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground mt-1">References</div>
                </div>
                <div className="text-center bg-muted/20 border border-border/50 rounded-xl p-4">
                  <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-450">
                    {verificationStatus.documents_verified}/{verificationStatus.documents_count}
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground mt-1">Documents</div>
                </div>
                <div className="text-center bg-muted/20 border border-border/50 rounded-xl p-4">
                  <div className="text-2xl font-extrabold text-orange-600 dark:text-orange-450">
                    {verificationStatus.checks.length}
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground mt-1">Total Checks</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Status */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="references">References</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <VerificationStatusDashboard 
                verificationStatus={verificationStatus}
                references={references}
                documents={documents}
              />
            </TabsContent>
            
            <TabsContent value="references" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reference Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {references.length === 0 ? (
                    <p className="text-muted-foreground">No references added yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {references.map((reference) => (
                        <div key={reference.id} className="border border-border/80 bg-muted/10 dark:bg-muted/5 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3 border-b border-border/40 pb-2.5">
                            <h3 className="font-bold text-foreground">{reference.name}</h3>
                            <Badge className={`${getStatusColor(reference.status)} border-transparent font-bold text-[10px] uppercase`}>
                              {reference.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted-foreground">
                            <div>
                              <span className="font-semibold text-foreground">Email:</span> {reference.email}
                            </div>
                            <div>
                              <span className="font-semibold text-foreground">Phone:</span> {reference.phone}
                            </div>
                            <div>
                              <span className="font-semibold text-foreground">Company:</span> {reference.company}
                            </div>
                            <div>
                              <span className="font-semibold text-foreground">Relationship:</span> {reference.relationship}
                            </div>
                          </div>
                          {reference.response_notes && (
                            <div className="mt-3 text-xs italic bg-muted/40 p-2.5 rounded-lg border border-border/30">
                              <span className="font-semibold text-foreground not-italic">Response:</span> "{reference.response_notes}"
                            </div>
                          )}
                          {reference.verification_notes && (
                            <div className="mt-2 text-xs bg-muted/40 p-2.5 rounded-lg border border-border/30">
                              <span className="font-semibold text-foreground">Notes:</span> {reference.verification_notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Document Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {documents.length === 0 ? (
                    <p className="text-muted-foreground">No documents uploaded yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {documents.map((document) => (
                        <div key={document.id} className="border border-border/80 bg-muted/10 dark:bg-muted/5 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3 border-b border-border/40 pb-2.5">
                            <h3 className="font-bold text-foreground">{document.file_name}</h3>
                            <Badge className={`${getStatusColor(document.status)} border-transparent font-bold text-[10px] uppercase`}>
                              {document.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted-foreground">
                            <div>
                              <span className="font-semibold text-foreground">Type:</span> {document.document_type.replace('_', ' ')}
                            </div>
                            <div>
                              <span className="font-semibold text-foreground">Size:</span> {(document.file_size / 1024 / 1024).toFixed(2)} MB
                            </div>
                            <div>
                              <span className="font-semibold text-foreground">Uploaded:</span> {new Date(document.created_at).toLocaleDateString()}
                            </div>
                            {document.verified_at && (
                              <div>
                                <span className="font-semibold text-foreground">Verified:</span> {new Date(document.verified_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          {document.description && (
                            <div className="mt-3 text-xs bg-muted/40 p-2.5 rounded-lg border border-border/30">
                              <span className="font-semibold text-foreground">Description:</span> {document.description}
                            </div>
                          )}
                          {document.verification_notes && (
                            <div className="mt-2 text-xs bg-muted/40 p-2.5 rounded-lg border border-border/30">
                              <span className="font-semibold text-foreground">Notes:</span> {document.verification_notes}
                            </div>
                          )}
                          {document.rejection_reason && (
                            <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-200/50 dark:border-red-900/50">
                              <span className="font-bold">Rejection Reason:</span> {document.rejection_reason}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 relative pl-4 border-l border-border/80 ml-2">
                    <div className="relative">
                      <div className="absolute -left-[22px] top-1.5 w-3 h-3 bg-blue-600 dark:bg-blue-500 rounded-full ring-4 ring-blue-100 dark:ring-blue-950/50"></div>
                      <div>
                        <p className="font-bold text-sm text-foreground">Verification Started</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(verificationStatus.initiated_at).toLocaleDateString()} at {new Date(verificationStatus.initiated_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    {verificationStatus.last_updated !== verificationStatus.initiated_at && (
                      <div className="relative">
                        <div className="absolute -left-[22px] top-1.5 w-3 h-3 bg-green-600 dark:bg-green-500 rounded-full ring-4 ring-green-100 dark:ring-green-950/50"></div>
                        <div>
                          <p className="font-bold text-sm text-foreground">Last Updated</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(verificationStatus.last_updated).toLocaleDateString()} at {new Date(verificationStatus.last_updated).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {verificationStatus.estimated_completion && (
                      <div className="relative">
                        <div className="absolute -left-[22px] top-1.5 w-3 h-3 bg-orange-600 dark:bg-orange-500 rounded-full ring-4 ring-orange-100 dark:ring-orange-950/50"></div>
                        <div>
                          <p className="font-bold text-sm text-foreground">Estimated Completion</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(verificationStatus.estimated_completion).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default VerificationManagement;
