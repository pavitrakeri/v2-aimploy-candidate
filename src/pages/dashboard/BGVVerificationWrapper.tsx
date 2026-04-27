import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import BGVVerification from './BGVVerification';

const BGVVerificationWrapper: React.FC = () => {
  const { user } = useAuth();
  
  // Get candidate ID from user context
  const candidateId = user?.id || 0;
  
  return <BGVVerification candidateId={candidateId} />;
};

export default BGVVerificationWrapper;
