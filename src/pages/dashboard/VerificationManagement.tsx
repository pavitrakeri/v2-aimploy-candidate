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
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {verificationStatus.progress_percentage}%
                  </div>
                  <div className="text-sm text-muted-foreground">Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {verificationStatus.references_verified}/{verificationStatus.references_count}
                  </div>
                  <div className="text-sm text-muted-foreground">References</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {verificationStatus.documents_verified}/{verificationStatus.documents_count}
                  </div>
                  <div className="text-sm text-muted-foreground">Documents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {verificationStatus.checks.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Checks</div>
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
                        <div key={reference.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{reference.name}</h3>
                            <Badge className={getStatusColor(reference.status)}>
                              {reference.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Email:</span> {reference.email}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Phone:</span> {reference.phone}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Company:</span> {reference.company}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Relationship:</span> {reference.relationship}
                            </div>
                          </div>
                          {reference.response_notes && (
                            <div className="mt-2 text-sm">
                              <span className="text-muted-foreground">Response:</span> {reference.response_notes}
                            </div>
                          )}
                          {reference.verification_notes && (
                            <div className="mt-2 text-sm">
                              <span className="text-muted-foreground">Notes:</span> {reference.verification_notes}
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
                        <div key={document.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{document.file_name}</h3>
                            <Badge className={getStatusColor(document.status)}>
                              {document.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Type:</span> {document.document_type.replace('_', ' ')}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Size:</span> {(document.file_size / 1024 / 1024).toFixed(2)} MB
                            </div>
                            <div>
                              <span className="text-muted-foreground">Uploaded:</span> {new Date(document.created_at).toLocaleDateString()}
                            </div>
                            {document.verified_at && (
                              <div>
                                <span className="text-muted-foreground">Verified:</span> {new Date(document.verified_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          {document.description && (
                            <div className="mt-2 text-sm">
                              <span className="text-muted-foreground">Description:</span> {document.description}
                            </div>
                          )}
                          {document.verification_notes && (
                            <div className="mt-2 text-sm">
                              <span className="text-muted-foreground">Notes:</span> {document.verification_notes}
                            </div>
                          )}
                          {document.rejection_reason && (
                            <div className="mt-2 text-sm text-red-600">
                              <span className="text-muted-foreground">Rejection Reason:</span> {document.rejection_reason}
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
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      <div>
                        <p className="font-medium">Verification Started</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(verificationStatus.initiated_at).toLocaleDateString()} at {new Date(verificationStatus.initiated_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    {verificationStatus.last_updated !== verificationStatus.initiated_at && (
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                        <div>
                          <p className="font-medium">Last Updated</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(verificationStatus.last_updated).toLocaleDateString()} at {new Date(verificationStatus.last_updated).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {verificationStatus.estimated_completion && (
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                        <div>
                          <p className="font-medium">Estimated Completion</p>
                          <p className="text-sm text-muted-foreground">
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
