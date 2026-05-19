import React, { useState } from 'react';
import { useDigiLocker } from '../../contexts/DigiLockerContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Loader2, Wifi, WifiOff, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface DigiLockerConnectProps {
  verificationId: number;
  candidateId: number;
  onConnected?: (userDetails: any) => void;
  onDocumentFetched?: (document: any) => void;
}

export const DigiLockerConnect: React.FC<DigiLockerConnectProps> = ({
  verificationId,
  candidateId,
  onConnected,
  onDocumentFetched,
}) => {
  const { state, actions } = useDigiLocker();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const request = await actions.connectWithDigiLocker(verificationId, candidateId);
      
      if (request.status === 'authenticated' && request.digilocker_user_details) {
        onConnected?.(request.digilocker_user_details);
      }
    } catch (error) {
      console.error('DigiLocker connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    actions.disconnect();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'authenticated':
        return 'bg-green-100 text-green-800';
      case 'unauthenticated':
        return 'bg-yellow-100 text-yellow-800';
      case 'revoked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'authenticated':
        return <CheckCircle className="w-4 h-4" />;
      case 'unauthenticated':
        return <AlertCircle className="w-4 h-4" />;
      case 'revoked':
        return <WifiOff className="w-4 h-4" />;
      default:
        return <Wifi className="w-4 h-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wifi className="w-5 h-5" />
            <span>DigiLocker Integration</span>
          </div>
          {state.request && (
            <Badge className={getStatusColor(state.request.status)}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(state.request.status)}
                <span className="capitalize">{state.request.status}</span>
              </div>
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        {state.isConnected && state.userDetails ? (
          <div className="space-y-3">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="text-green-800">
                <div className="font-medium">Connected to DigiLocker</div>
                <div className="text-sm text-green-700">
                  DigiLocker ID: {state.userDetails.digilockerId}
                </div>
                {state.userDetails.email && (
                  <div className="text-sm text-green-700">
                    Email: {state.userDetails.email}
                  </div>
                )}
                {state.userDetails.phoneNumber && (
                  <div className="text-sm text-green-700">
                    Phone: {state.userDetails.phoneNumber}
                  </div>
                )}
              </div>
            </Alert>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => actions.getAvailableDocuments()}
                disabled={state.loading}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Browse Documents
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisconnect}
                disabled={state.loading}
              >
                <WifiOff className="w-4 h-4 mr-1" />
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Alert>
              <Wifi className="h-4 w-4" />
              <div>
                <div className="font-medium">Connect to DigiLocker</div>
                <div className="text-sm text-gray-600">
                  Securely fetch verified government documents directly from your DigiLocker account.
                  This eliminates the need for manual uploads and provides authentic, pre-verified documents.
                </div>
              </div>
            </Alert>
            
            <Button
              onClick={handleConnect}
              disabled={isConnecting || state.loading}
              className="w-full"
            >
              {isConnecting || state.loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting to DigiLocker...
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4 mr-2" />
                  Connect with DigiLocker
                </>
              )}
            </Button>
          </div>
        )}

        {/* Error Display */}
        {state.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <div>
              <div className="font-medium">Connection Error</div>
              <div className="text-sm">{state.error}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={actions.clearError}
              className="mt-2"
            >
              Clear Error
            </Button>
          </Alert>
        )}

        {/* Available Documents */}
        {state.availableDocuments && state.availableDocuments.documents.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Available Documents</h4>
            <div className="text-sm text-gray-600">
              Found {state.availableDocuments.documents.length} document types in your DigiLocker.
              Use the document fetcher below to retrieve specific documents.
            </div>
            <div className="max-h-32 overflow-y-auto">
              <div className="space-y-1">
                {state.availableDocuments.documents.slice(0, 5).map((doc, index) => (
                  <div key={index} className="text-xs text-gray-500">
                    {doc.description} ({doc.doc_type})
                  </div>
                ))}
                {state.availableDocuments.documents.length > 5 && (
                  <div className="text-xs text-gray-400">
                    ... and {state.availableDocuments.documents.length - 5} more
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fetched Documents */}
        {state.fetchedDocuments.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Fetched Documents</h4>
            <div className="space-y-2">
              {state.fetchedDocuments.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="text-sm">
                    <div className="font-medium">{doc.file_name}</div>
                    <div className="text-gray-500">
                      {(doc.file_size / 1024).toFixed(1)} KB • {doc.file_format}
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
