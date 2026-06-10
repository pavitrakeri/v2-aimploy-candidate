import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const DigiLockerCallback: React.FC = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // API Setu returns 'code' and 'state' in the URL query parameters
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (code && state) {
      // Send success message to parent window
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'DIGILOCKER_CALLBACK',
            success: true,
            errCode: code, // We are passing 'code' through 'errCode' for backward compatibility with the backend routes.py
            request_id: state // state holds the encoded id/v_id/c_id
          },
          window.location.origin
        );
      }
    } else if (error) {
      // Send error message
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'DIGILOCKER_CALLBACK',
            success: false,
            error: error
          },
          window.location.origin
        );
      }
    } else {
      // Just in case it's loaded without parameters
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'DIGILOCKER_CALLBACK',
            success: false,
            error: "Missing callback parameters"
          },
          window.location.origin
        );
      }
    }
    
    // The parent window will close this popup
  }, [searchParams]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <h2 className="text-xl font-semibold text-gray-700">Connecting to DigiLocker...</h2>
        <p className="text-sm text-gray-500">Please wait while we verify your credentials.</p>
      </div>
    </div>
  );
};

export default DigiLockerCallback;
