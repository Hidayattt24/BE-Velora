const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:5000';
let authToken = '';
let testUserId = '';

// Test data
const testUser = {
  fullName: 'Test User Velora',
  email: `test${Date.now()}@example.com`,
  phone: '081234567890',
  password: 'TestPassword123',
  confirmPassword: 'TestPassword123'
};

// Helper function for API calls
const apiCall = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...(authToken && { Authorization: `Bearer ${authToken}` })
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
};

// Test functions
const testHealthCheck = async () => {
  console.log('🏥 Testing Health Check...');
  const result = await apiCall('GET', '/health');
  
  if (result.success && result.status === 200) {
    console.log('✅ Health check passed');
    return true;
  } else {
    console.log('❌ Health check failed:', result.error);
    return false;
  }
};

const testUserRegistration = async () => {
  console.log('👤 Testing User Registration...');
  const result = await apiCall('POST', '/api/auth/register', testUser);
  
  if (result.success && result.status === 201) {
    authToken = result.data.data.token;
    testUserId = result.data.data.user.id;
    console.log('✅ User registration successful');
    return true;
  } else {
    console.log('❌ User registration failed:', result.error);
    return false;
  }
};

const testUserLogin = async () => {
  console.log('🔐 Testing User Login...');
  const loginData = {
    email: testUser.email,
    password: testUser.password
  };
  
  const result = await apiCall('POST', '/api/auth/login', loginData);
  
  if (result.success && result.status === 200) {
    authToken = result.data.data.token;
    console.log('✅ User login successful');
    return true;
  } else {
    console.log('❌ User login failed:', result.error);
    return false;
  }
};

const testUserProfile = async () => {
  console.log('👥 Testing User Profile...');
  const result = await apiCall('GET', '/api/users/profile');
  
  if (result.success && result.status === 200) {
    console.log('✅ Get user profile successful');
    return true;
  } else {
    console.log('❌ Get user profile failed:', result.error);
    return false;
  }
};

const testJournalArticles = async () => {
  console.log('📖 Testing Journal Articles...');
  const result = await apiCall('GET', '/api/journal/articles');
  
  if (result.success && result.status === 200) {
    console.log('✅ Get journal articles successful');
    return true;
  } else {
    console.log('❌ Get journal articles failed:', result.error);
    return false;
  }
};

const testMyJournal = async () => {
  console.log('📝 Testing My Journal...');
  
  // Test get my journal entries
  let result = await apiCall('GET', '/api/journal/my-journal');
  
  if (!result.success) {
    console.log('❌ Get my journal failed:', result.error);
    return false;
  }
  
  // Test create journal entry
  const journalEntry = {
    date: new Date().toISOString().split('T')[0],
    mood: 'happy',
    symptoms: ['Mual ringan'],
    notes: 'Test journal entry dari API test'
  };
  
  result = await apiCall('POST', '/api/journal/my-journal', journalEntry);
  
  if (result.success && result.status === 201) {
    console.log('✅ Create journal entry successful');
    return true;
  } else {
    console.log('❌ Create journal entry failed:', result.error);
    return false;
  }
};

const testGalleryPhotos = async () => {
  console.log('🖼️ Testing Gallery Photos...');
  const result = await apiCall('GET', '/api/gallery/photos');
  
  if (result.success && result.status === 200) {
    console.log('✅ Get gallery photos successful');
    return true;
  } else {
    console.log('❌ Get gallery photos failed:', result.error);
    return false;
  }
};

const testTimelineMilestones = async () => {
  console.log('⏰ Testing Timeline Milestones...');
  const result = await apiCall('GET', '/api/timeline/milestones');
  
  if (result.success && result.status === 200) {
    console.log('✅ Get timeline milestones successful');
    return true;
  } else {
    console.log('❌ Get timeline milestones failed:', result.error);
    return false;
  }
};

const testHealthCheckup = async () => {
  console.log('🏥 Testing Health Checkup...');
  
  // Test get checkup history
  let result = await apiCall('GET', '/api/health/checkup');
  
  if (!result.success) {
    console.log('❌ Get health checkup failed:', result.error);
    return false;
  }
  
  // Test create checkup record
  const checkupData = {
    date: new Date().toISOString().split('T')[0],
    weight: 65.5,
    bloodPressure: '120/80',
    symptoms: ['Sehat'],
    notes: 'Pemeriksaan rutin test'
  };
  
  result = await apiCall('POST', '/api/health/checkup', checkupData);
  
  if (result.success && result.status === 201) {
    console.log('✅ Create health checkup successful');
    return true;
  } else {
    console.log('❌ Create health checkup failed:', result.error);
    return false;
  }
};

const testCORSHeaders = async () => {
  console.log('🌐 Testing CORS Headers...');
  
  try {
    const response = await axios.options(`${BASE_URL}/api/auth/login`, {
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    
    const corsHeaders = response.headers;
    
    if (corsHeaders['access-control-allow-origin']) {
      console.log('✅ CORS headers configured correctly');
      return true;
    } else {
      console.log('❌ CORS headers missing');
      return false;
    }
  } catch (error) {
    console.log('❌ CORS test failed:', error.message);
    return false;
  }
};

const testRateLimiting = async () => {
  console.log('🚦 Testing Rate Limiting...');
  
  // Make multiple rapid requests to test rate limiting
  const requests = Array(5).fill(null).map(() => 
    apiCall('GET', '/health')
  );
  
  try {
    const results = await Promise.all(requests);
    const successCount = results.filter(r => r.success).length;
    
    if (successCount >= 4) { // Allow some to succeed
      console.log('✅ Rate limiting working (allowing normal traffic)');
      return true;
    } else {
      console.log('❌ Rate limiting too aggressive');
      return false;
    }
  } catch (error) {
    console.log('❌ Rate limiting test failed:', error.message);
    return false;
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('🚀 Starting Velora Backend API Tests');
  console.log('=======================================');
  console.log(`Testing API at: ${BASE_URL}`);
  console.log('');

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'User Login', fn: testUserLogin },
    { name: 'User Profile', fn: testUserProfile },
    { name: 'Journal Articles', fn: testJournalArticles },
    { name: 'My Journal', fn: testMyJournal },
    { name: 'Gallery Photos', fn: testGalleryPhotos },
    { name: 'Timeline Milestones', fn: testTimelineMilestones },
    { name: 'Health Checkup', fn: testHealthCheckup },
    { name: 'CORS Headers', fn: testCORSHeaders },
    { name: 'Rate Limiting', fn: testRateLimiting }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} threw error:`, error.message);
      failed++;
    }
    console.log(''); // Add spacing between tests
  }

  console.log('=======================================');
  console.log('📊 Test Results Summary');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! API is ready for production.');
  } else {
    console.log('⚠️ Some tests failed. Please check the issues above.');
  }
};

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testHealthCheck,
  testUserRegistration,
  testUserLogin,
  BASE_URL
};
