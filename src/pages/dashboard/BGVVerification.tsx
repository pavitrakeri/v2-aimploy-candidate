import React, { useState, useEffect } from 'react';
import { useBGV } from '../../contexts/BGVContext';
import { bgvApi } from '../../services/bgv-api';
import { FileUploadZone } from '../../components/ui/FileUploadZone';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Alert } from '../../components/ui/alert';
import { Progress } from '../../components/ui/progress';
import { CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface BGVVerificationProps {
  candidateId: number;
}

export const BGVVerification: React.FC<BGVVerificationProps> = ({ candidateId }) => {
  const { state, actions } = useBGV();
  const [selectedVerificationTypes, setSelectedVerificationTypes] = useState<string[]>([]);
  const [referenceForm, setReferenceForm] = useState({
    reference_name: '',
    reference_email: '',
    reference_phone: '',
    relationship: '',
    company: '',
    position: '',
    is_current: false,
  });
  const [showReferenceForm, setShowReferenceForm] = useState(false);
  const [notes, setNotes] = useState('');

  const verificationTypes = [
    { id: 'identity', label: 'Identity Verification', description: 'Government ID verification' },
    { id: 'address', label: 'Address Verification', description: 'Current and permanent address' },
    { id: 'education', label: 'Education Verification', description: 'Degree and institution verification' },
    { id: 'employment', label: 'Employment Verification', description: 'Previous employment history' },
    { id: 'criminal', label: 'Criminal Background Check', description: 'Criminal record verification' },
    { id: 'reference', label: 'Reference Check', description: 'Professional reference verification' },
  ];

  const documentTypes = [
    { id: 'identity', label: 'Identity Document', required: true },
    { id: 'address_proof', label: 'Address Proof', required: false },
    { id: 'education_certificate', label: 'Education Certificate', required: false },
    { id: 'experience_letter', label: 'Experience Letter', required: false },
    { id: 'salary_slip', label: 'Salary Slip', required: false },
  ];

  const handleSyncPendingUploads = async () => {
    const result = await actions.syncPendingUploads();
    if (result.successful > 0) {
      alert(`Successfully synced ${result.successful} files`);
    }
    if (result.failed > 0) {
      alert(`Failed to sync ${result.failed} files`);
    }
  };

  // Check for pending uploads
  const getPendingUploads = () => {
    try {
      const pending = JSON.parse(localStorage.getItem('bgv_pending_uploads') || '[]');
      return pending.filter((doc: any) => doc.is_pending && doc.verification_id === state.verification?.id);
    } catch {
      return [];
    }
  };

  const pendingUploads = getPendingUploads();

  useEffect(() => {
    if (candidateId) {
      actions.getCandidateStatus(candidateId);
    }
  }, [candidateId]);

  const handleStartVerification = async () => {
    if (selectedVerificationTypes.length === 0) {
      alert('Please select at least one verification type');
      return;
    }

    await actions.startVerification(candidateId, selectedVerificationTypes, notes);
    setSelectedVerificationTypes([]);
    setNotes('');
  };

  const handleDocumentUpload = async (file: File, documentType: string) => {
    if (!state.verification) {
      alert('Please start verification first');
      return;
    }

    await actions.uploadDocument(
      state.verification.id,
      file,
      documentType,
      `Uploaded ${documentType} document`
    );
  };

  const handleAddReference = async () => {
    if (!state.verification) {
      alert('Please start verification first');
      return;
    }

    await actions.addReference(state.verification.id, referenceForm);
    setReferenceForm({
      reference_name: '',
      reference_email: '',
      reference_phone: '',
      relationship: '',
      company: '',
      position: '',
      is_current: false,
    });
    setShowReferenceForm(false);
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

  const getProgressPercentage = () => {
    if (!state.overallStatus) return 0;
    return state.overallStatus.completion_percentage;
  };

  if (state.loading && !state.verification) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Background Verification</h1>
        <p className="text-gray-600">Complete your background verification process</p>
        
        {state.overallStatus && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-medium text-gray-700">{getProgressPercentage()}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
            <div className="mt-2">
              <Badge className={getStatusColor(state.overallStatus.overall_status)}>
                {state.overall_status.overall_status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        )}
      </div>

      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Start Verification Section */}
      {!state.verification && (
        <Card>
          <CardHeader>
            <CardTitle>Start Background Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Verification Types
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {verificationTypes.map((type) => (
                  <label
                    key={type.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedVerificationTypes.includes(type.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVerificationTypes([...selectedVerificationTypes, type.id]);
                        } else {
                          setSelectedVerificationTypes(selectedVerificationTypes.filter(t => t !== type.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{type.label}</div>
                      <div className="text-sm text-gray-500">{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional information or special requirements..."
              />
            </div>

            <Button
              onClick={handleStartVerification}
              disabled={state.loading || selectedVerificationTypes.length === 0}
              className="w-full"
            >
              {state.loading ? 'Starting...' : 'Start Verification'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Verification Status */}
      {state.verification && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Documents Section */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Documents</CardTitle>
                {pendingUploads.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      <WifiOff className="w-3 h-3 mr-1" />
                      {pendingUploads.length} pending
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSyncPendingUploads}
                      disabled={state.loading}
                    >
                      <Wifi className="w-3 h-3 mr-1" />
                      Sync
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {documentTypes.map((docType) => {
                const uploadedDoc = state.documents.find(doc => doc.document_type === docType.id);
                const pendingDoc = pendingUploads.find(doc => doc.document_type === docType.id);
                
                return (
                  <div key={docType.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{docType.label}</h4>
                        {docType.required && (
                          <span className="text-xs text-red-600">Required</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {uploadedDoc && (
                          <Badge className={getStatusColor(uploadedDoc.validation_status || 'pending')}>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {uploadedDoc.validation_status || 'pending'}
                          </Badge>
                        )}
                        {pendingDoc && (
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            <WifiOff className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {uploadedDoc ? (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                          <div>File: {uploadedDoc.file_name}</div>
                          <div>Size: {(uploadedDoc.file_size / 1024).toFixed(1)} KB</div>
                          {uploadedDoc.validation_score && (
                            <div>Validation Score: {uploadedDoc.validation_score}%</div>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => actions.deleteDocument(uploadedDoc.id)}
                          disabled={state.loading}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : pendingDoc ? (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center text-orange-600">
                            <WifiOff className="w-3 h-3 mr-1" />
                            File saved locally (pending sync)
                          </div>
                          <div>File: {pendingDoc.file_name}</div>
                          <div>Size: {(pendingDoc.file_size / 1024).toFixed(1)} KB</div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSyncPendingUploads}
                            disabled={state.loading}
                          >
                            <Wifi className="w-3 h-3 mr-1" />
                            Sync Now
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              // Remove from pending uploads
                              const pending = JSON.parse(localStorage.getItem('bgv_pending_uploads') || '[]');
                              const updated = pending.filter((p: any) => p.id !== pendingDoc.id);
                              localStorage.setItem('bgv_pending_uploads', JSON.stringify(updated));
                              window.location.reload();
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <FileUploadZone
                        onFileSelect={(file) => handleDocumentUpload(file, docType.id)}
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSize={5 * 1024 * 1024} // 5MB
                      />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* References Section */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>References</CardTitle>
                <Button
                  onClick={() => setShowReferenceForm(!showReferenceForm)}
                  variant="outline"
                  size="sm"
                >
                  Add Reference
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showReferenceForm && (
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Reference Name"
                      value={referenceForm.reference_name}
                      onChange={(e) => setReferenceForm({...referenceForm, reference_name: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="email"
                      placeholder="Reference Email"
                      value={referenceForm.reference_email}
                      onChange={(e) => setReferenceForm({...referenceForm, reference_email: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="tel"
                      placeholder="Reference Phone"
                      value={referenceForm.reference_phone}
                      onChange={(e) => setReferenceForm({...referenceForm, reference_phone: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Relationship"
                      value={referenceForm.relationship}
                      onChange={(e) => setReferenceForm({...referenceForm, relationship: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={referenceForm.company}
                      onChange={(e) => setReferenceForm({...referenceForm, company: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Position"
                      value={referenceForm.position}
                      onChange={(e) => setReferenceForm({...referenceForm, position: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_current"
                      checked={referenceForm.is_current}
                      onChange={(e) => setReferenceForm({...referenceForm, is_current: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="is_current" className="text-sm text-gray-700">
                      Current employer/supervisor
                    </label>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleAddReference} disabled={state.loading}>
                      Add Reference
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowReferenceForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {state.references.length === 0 && !showReferenceForm ? (
                <div className="text-center py-8 text-gray-500">
                  No references added yet. Click "Add Reference" to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {state.references.map((reference) => (
                    <div key={reference.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{reference.reference_name}</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Email: {reference.reference_email}</div>
                            {reference.reference_phone && (
                              <div>Phone: {reference.reference_phone}</div>
                            )}
                            <div>Relationship: {reference.relationship}</div>
                            {reference.company && <div>Company: {reference.company}</div>}
                            {reference.position && <div>Position: {reference.position}</div>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge className={getStatusColor(reference.status)}>
                            {reference.status}
                          </Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => actions.deleteReference(reference.id)}
                            disabled={state.loading}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Refresh Button */}
      {state.verification && (
        <div className="flex justify-center">
          <Button
            onClick={actions.refreshData}
            disabled={state.loading}
            variant="outline"
          >
            {state.loading ? 'Refreshing...' : 'Refresh Status'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BGVVerification;
