import { verificationAPI, VerificationType } from './verification-api';

// Test function to verify API integration
export const testVerificationAPI = async () => {
  console.log('Testing Verification API...');
  
  try {
    // Test health check
    console.log('Testing health check...');
    const health = await verificationAPI.healthCheck();
    console.log('Health check response:', health);
    
    // Test starting verification (mock data)
    console.log('Testing start verification...');
    const startRequest = {
      candidate_id: 1,
      consent_given: true,
      no_criminal_record: true,
      verification_types: ['identity', 'address', 'education', 'employment', 'reference', 'criminal', 'financial'] as VerificationType[],
      notes: 'Test verification from frontend'
    };
    
    const verification = await verificationAPI.startVerification(startRequest);
    console.log('Started verification:', verification);
    
    // Test getting verification status
    console.log('Testing get verification status...');
    const status = await verificationAPI.getCandidateVerificationStatus(1);
    console.log('Verification status:', status);
    
    // Test getting verification details
    console.log('Testing get verification details...');
    const details = await verificationAPI.getVerification(verification.id);
    console.log('Verification details:', details);
    
    console.log('All API tests passed!');
    return true;
  } catch (error) {
    console.error('API test failed:', error);
    return false;
  }
};

// Export for use in development
if (import.meta.env.DEV) {
  // Auto-run tests in development
  testVerificationAPI();
}
