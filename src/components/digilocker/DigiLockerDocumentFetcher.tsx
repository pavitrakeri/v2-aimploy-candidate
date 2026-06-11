import React, { useState, useEffect } from 'react';
import { useDigiLocker } from '../../contexts/DigiLockerContext';
import { useBGV } from '../../contexts/BGVContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert } from '../ui/alert';
import { Loader2, Download, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface DigiLockerDocumentFetcherProps {
  verificationId: number;
  candidateId: number;
  documentType: string;
  onDocumentFetched?: (document: any) => void;
}

export const DigiLockerDocumentFetcher: React.FC<DigiLockerDocumentFetcherProps> = ({
  verificationId,
  candidateId,
  documentType,
  onDocumentFetched,
}) => {
  const { state: digiLockerState, actions: digiLockerActions } = useDigiLocker();
  const { actions: bgvActions } = useBGV();
  
  const [isFetchingId, setIsFetchingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch available documents when connected
  useEffect(() => {
    if (digiLockerState.isConnected && digiLockerState.request?.id && !digiLockerState.availableDocuments) {
      digiLockerActions.getAvailableDocuments(digiLockerState.request.id).catch(err => {
        console.error("Failed to fetch available documents", err);
      });
    }
  }, [digiLockerState.isConnected, digiLockerState.request?.id, digiLockerState.availableDocuments]);

  const handleFetchDocument = async (uri: string, name: string) => {
    if (!digiLockerState.request) {
      setError('Please connect to DigiLocker first');
      return;
    }

    try {
      setIsFetchingId(uri);
      setError(null);

      // Download and store the document
      const storedDocument = await digiLockerActions.downloadDocument(
        digiLockerState.request.id,
        uri,
        verificationId,
        documentType
      );

      // We do not need to call uploadDocument with a dummy file anymore since the backend handles it.
      // We just need to refresh BGV status.
      await bgvActions.getCandidateStatus(candidateId);

      onDocumentFetched?.(storedDocument);
      
    } catch (error) {
      console.error('Failed to fetch document:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch document');
    } finally {
      setIsFetchingId(null);
    }
  };

  const refreshDocuments = () => {
    if (digiLockerState.request?.id) {
      digiLockerActions.getAvailableDocuments(digiLockerState.request.id);
    }
  };

  if (!digiLockerState.isConnected) {
    return null;
  }

  const documents = digiLockerState.availableDocuments?.documents || [];

  return (
    <Card className="mt-6 border-indigo-100 dark:border-indigo-900/30 w-full shadow-sm">
      <CardHeader className="pb-3 border-b border-indigo-50 dark:border-indigo-900/20 bg-indigo-50/50 dark:bg-indigo-900/10 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center text-indigo-900 dark:text-indigo-300">
          <FileText className="h-5 w-5 mr-2 text-indigo-500" />
          Fetch Document from DigiLocker
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={refreshDocuments} className="text-indigo-600 hover:text-indigo-800" disabled={digiLockerState.loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${digiLockerState.loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <div className="ml-2 font-medium">{error}</div>
          </Alert>
        )}

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Your Issued Documents</h3>
          
          {digiLockerState.loading && !digiLockerState.availableDocuments ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
              <p className="text-sm text-gray-500">Loading documents from your DigiLocker...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600 mb-1">No issued documents found</p>
              <p className="text-xs text-gray-500">
                You haven't issued any documents to your DigiLocker account yet. 
                Please add them to your DigiLocker first.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750 transition-colors shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg mt-1">
                      <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white leading-tight mb-1">{doc.name}</p>
                      <div className="flex flex-col text-xs text-gray-500 gap-1">
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full w-fit">
                          {doc.description || doc.doctype || doc.type}
                        </span>
                        {doc.date && <span className="text-gray-400 mt-0.5">Issued: {doc.date}</span>}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleFetchDocument(doc.uri, doc.name)}
                    disabled={isFetchingId === doc.uri}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[110px] ml-4 transition-all"
                  >
                    {isFetchingId === doc.uri ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Fetching...</>
                    ) : (
                      <><Download className="h-4 w-4 mr-2" /> Download</>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
