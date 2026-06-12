import React, { useState, useEffect } from 'react';
import { useDigiLocker } from '../../contexts/DigiLockerContext';
import { useBGV } from '../../contexts/BGVContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Loader2, Download, CheckCircle2, ShieldCheck, HelpCircle, ExternalLink } from 'lucide-react';

interface InlineDigiLockerFetcherProps {
  verificationId: number;
  candidateId: number;
  documentType: 'aadhaar' | 'pan' | 'passport' | 'voterId' | 'drivingLicence' | 'addressProof';
  onDocumentFetched?: (document: any) => void;
}

export const InlineDigiLockerFetcher: React.FC<InlineDigiLockerFetcherProps> = ({
  verificationId,
  candidateId,
  documentType,
  onDocumentFetched,
}) => {
  const { state: digiLockerState, actions: digiLockerActions } = useDigiLocker();
  const { actions: bgvActions } = useBGV();

  const [dlNumber, setDlNumber] = useState('');
  const [addressSource, setAddressSource] = useState<'ADHAR' | 'DRVLC'>('ADHAR');
  const [isFetching, setIsFetching] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map step doc key to DigiLocker doc type
  const getDocDetails = () => {
    switch (documentType) {
      case 'aadhaar':
        return { docType: 'ADHAR', orgId: 'UIDAI', label: 'Aadhaar Card' };
      case 'pan':
        return { docType: 'PANCR', orgId: 'INCOMETAX', label: 'PAN Card' };
      case 'passport':
        return { docType: 'PASSP', orgId: 'MEA', label: 'Passport' };
      case 'voterId':
        return { docType: 'VOTERID', orgId: 'ECI', label: 'Voter ID' };
      case 'drivingLicence':
        return { docType: 'DRVLC', orgId: 'RTO', label: 'Driving License' };
      case 'addressProof':
        if (addressSource === 'ADHAR') {
          return { docType: 'ADHAR', orgId: 'UIDAI', label: 'Aadhaar (Address Proof)' };
        } else {
          return { docType: 'DRVLC', orgId: 'RTO', label: 'Driving License (Address Proof)' };
        }
      default:
        return { docType: '', orgId: '', label: '' };
    }
  };

  const { docType, orgId, label } = getDocDetails();

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      await digiLockerActions.connectWithDigiLocker(verificationId, candidateId);
    } catch (err) {
      console.error('DigiLocker connection failed:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleFetch = async () => {
    if (!digiLockerState.request) {
      setError('Please connect your DigiLocker account first.');
      return;
    }

    const parameters: Array<{ name: string; value: string }> = [];

    // Driving license requires DL_NUMBER parameter
    if (docType === 'DRVLC') {
      if (!dlNumber.trim()) {
        setError('Please enter your Driving License number');
        return;
      }
      parameters.push({ name: 'DL_NUMBER', value: dlNumber.trim() });
    }

    try {
      setIsFetching(true);
      setError(null);

      // 1. Fetch document metadata/URL from DigiLocker Setu API
      const documentResponse = await digiLockerActions.fetchDocument(
        digiLockerState.request.id,
        docType,
        orgId,
        'pdf',
        parameters
      );

      // 2. Download from Setu API and store on backend
      const backendDocType = documentType === 'addressProof' ? 'address_proof' : 
                         documentType === 'voterId' ? 'voter_id' : 
                         documentType === 'drivingLicence' ? 'driving_licence' : documentType;

      const storedDocument = await digiLockerActions.downloadDocument(
        digiLockerState.request.id,
        documentResponse.file_url,
        verificationId,
        backendDocType
      );

      // 3. Link document to the verification draft
      await bgvActions.uploadDocument(
        verificationId,
        new File([new Blob()], storedDocument.file_name, { type: 'application/pdf' }),
        backendDocType,
        `Fetched from DigiLocker: ${label}`,
        true // skip validation since DigiLocker docs are government-verified
      );

      onDocumentFetched?.(storedDocument);
    } catch (err) {
      console.error('Failed to fetch document:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch document');
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="relative border border-slate-100 rounded-xl bg-white shadow-sm overflow-hidden p-5 space-y-4">
      {/* Tricolor Accent Header Strip */}
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="flex-1 bg-[#F97316]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#22C55E]" />
      </div>

      {/* Branded Title Block */}
      <div className="flex items-center justify-between border-b pb-3 pt-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <svg className="h-5.5 w-5.5" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M60 10C32.4 10 10 32.4 10 60C10 74 15.8 86.8 25.2 96L36 85.2C29.8 78.4 26 69.6 26 60C26 41.2 41.2 26 60 26C69.6 26 78.4 29.8 85.2 36L96 25.2C86.8 15.8 74 10 60 10Z" fill="#F97316" />
              <path d="M60 110C87.6 110 110 87.6 110 60C110 46 104.2 33.2 94.8 24L84 34.8C90.2 41.6 94 50.4 94 60C94 78.8 78.8 94 60 94C50.4 94 41.6 90.2 34.8 84L24 94.8C33.2 104.2 46 110 60 110Z" fill="#22C55E" />
              <path d="M60 40C49 40 40 49 40 60C40 71 49 80 60 80C71 80 80 71 80 60C80 49 71 40 60 40Z" fill="#1E40AF" />
              <circle cx="60" cy="55" r="8" fill="#FFFFFF" />
              <path d="M57 60H63V72H57V60Z" fill="#FFFFFF" />
              <path d="M54 68H66V72H54V68Z" fill="#FFFFFF" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
              DigiLocker Instant Import
              <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200 font-medium">
                Recommended
              </span>
            </h4>
            <p className="text-xs text-muted-foreground">Import official government-signed {label}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {digiLockerState.isConnected ? (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="text-slate-500 bg-slate-50">
              Not Linked
            </Badge>
          )}
        </div>
      </div>

      {/* Error Output */}
      {error && (
        <Alert variant="destructive" className="py-2.5">
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Action Content Area */}
      {!digiLockerState.isConnected ? (
        <div className="space-y-3 py-1">
          <p className="text-xs text-slate-500 leading-relaxed">
            Link your secure government DigiLocker account to authorize instant, authenticated retrieval of your verified documents.
          </p>
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting to DigiLocker...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Link DigiLocker Account
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4 py-1">
          {/* Dynamic parameter selection for Address Proof */}
          {documentType === 'addressProof' && (
            <div className="space-y-2.5">
              <Label className="text-xs font-semibold text-slate-700">Select Document Source</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAddressSource('ADHAR')}
                  className={`px-3 py-2 text-xs font-medium border rounded-lg transition-all ${
                    addressSource === 'ADHAR'
                      ? 'bg-blue-50/50 border-blue-500 text-blue-700 shadow-sm'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Aadhaar Card
                </button>
                <button
                  type="button"
                  onClick={() => setAddressSource('DRVLC')}
                  className={`px-3 py-2 text-xs font-medium border rounded-lg transition-all ${
                    addressSource === 'DRVLC'
                      ? 'bg-blue-50/50 border-blue-500 text-blue-700 shadow-sm'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Driving License
                </button>
              </div>
            </div>
          )}

          {/* Form parameter inputs (e.g. DL Number) */}
          {docType === 'DRVLC' && (
            <div className="space-y-2">
              <Label htmlFor={`dl-number-${documentType}`} className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                Driving License Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`dl-number-${documentType}`}
                placeholder="e.g. DL-1420110068745"
                value={dlNumber}
                onChange={(e) => setDlNumber(e.target.value)}
                className="h-9 text-xs focus-visible:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400">Please enter without spaces, matching the format in your RTO record.</p>
            </div>
          )}

          {/* Retrieve Action */}
          <Button
            onClick={handleFetch}
            disabled={isFetching}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {isFetching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Fetching verified document...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Fetch & Import {label}
              </>
            )}
          </Button>

          {/* Trust Banner footer */}
          <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-600 font-medium bg-emerald-50/50 border border-emerald-100 rounded-lg py-1.5 px-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Direct cryptographic verification via Government Setu APIs
          </div>
        </div>
      )}
    </div>
  );
};
