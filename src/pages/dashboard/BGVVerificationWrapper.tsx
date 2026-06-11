import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Verification from './Verification';

const BGVVerificationWrapper: React.FC = () => {
  const { user } = useAuth();
  
  // Get candidate ID and name from user context
  const candidateId = user?.id || 0;
  const candidateName = user?.full_name || user?.email || 'Candidate';
  
  return <Verification candidateId={candidateId} candidateName={candidateName} />;
};

export default BGVVerificationWrapper;
