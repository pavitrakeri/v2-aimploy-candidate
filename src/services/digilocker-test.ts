// Simple test for DigiLocker API integration
import { digiLockerApi } from './digilocker-api';

export async function testDigiLockerAPI() {
  console.log('🧪 Testing DigiLocker API Integration...');
  
  try {
    // Test 1: Health Check
    console.log('1. Testing health check...');
    const health = await digiLockerApi.healthCheck();
    console.log('✅ Health check:', health);
    
    // Test 2: Get Available Documents
    console.log('2. Testing available documents...');
    const documents = await digiLockerApi.getAvailableDocuments();
    console.log('✅ Available documents:', documents.documents?.length || 0, 'documents found');
    
    // Test 3: Get BGV Mapping
    console.log('3. Testing BGV mapping...');
    const mapping = await digiLockerApi.getBGVDigiLockerMapping();
    console.log('✅ BGV mapping:', Object.keys(mapping).length, 'verification types mapped');
    
    // Test 4: Generate Redirect URL
    console.log('4. Testing redirect URL generation...');
    const redirectUrl = digiLockerApi.generateRedirectURL(123, 456);
    console.log('✅ Redirect URL:', redirectUrl);
    
    console.log('🎉 All DigiLocker API tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ DigiLocker API test failed:', error);
    return false;
  }
}

// Auto-run in development
if (import.meta.env.DEV) {
  // Wait a bit before running tests to ensure everything is loaded
  setTimeout(() => {
    testDigiLockerAPI();
  }, 1000);
}
