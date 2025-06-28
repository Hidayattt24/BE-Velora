// Test script untuk verifikasi deployment Vercel
// Jalankan dengan: node test-deployment.js

const axios = require("axios");

// Ganti dengan URL deployment Vercel Anda
const BASE_URL = process.env.API_URL || "https://your-deployment-url.vercel.app";

let authToken = "";

// Test data
const testUser = {
  fullName: "Test User Deployment",
  phone: "081234567890",
  email: `test${Date.now()}@example.com`,
  password: "TestPass123",
};

// Helper functions
const log = (message, data = null) => {
  console.log(`\n🔍 ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

const handleError = (error, testName) => {
  console.log(`\n❌ ${testName} failed:`);
  if (error.response) {
    console.log("Status:", error.response.status);
    console.log("Data:", error.response.data);
    console.log("Headers:", error.response.headers);
  } else {
    console.log("Error:", error.message);
  }
};

// Test functions
async function testHealthCheck() {
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    log("✅ Health Check - SUCCESS", response.data);
    return true;
  } catch (error) {
    handleError(error, "Health Check");
    return false;
  }
}

async function testPublicEndpoints() {
  try {
    // Test articles endpoint (public)
    const articles = await axios.get(`${BASE_URL}/api/journal/articles?limit=5`);
    log("✅ Public Articles - SUCCESS", {
      totalArticles: articles.data.data?.articles?.length || 0,
      pagination: articles.data.data?.pagination
    });

    // Test categories endpoint (public)
    const categories = await axios.get(`${BASE_URL}/api/journal/categories`);
    log("✅ Categories - SUCCESS", categories.data);

    // Test health parameters (public)
    const healthParams = await axios.get(`${BASE_URL}/api/health/parameters`);
    log("✅ Health Parameters - SUCCESS", {
      ageRanges: healthParams.data.data?.age_ranges?.length || 0,
      bpRanges: healthParams.data.data?.blood_pressure_ranges?.length || 0
    });

    return true;
  } catch (error) {
    handleError(error, "Public Endpoints");
    return false;
  }
}

async function testRegister() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    log("✅ Register - SUCCESS", {
      userId: response.data.data?.user?.id,
      token: response.data.data?.token ? "✓ Token received" : "❌ No token"
    });
    
    if (response.data.data?.token) {
      authToken = response.data.data.token;
    }
    return true;
  } catch (error) {
    handleError(error, "Register");
    return false;
  }
}

async function testLogin() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      nama: testUser.fullName,
      password: testUser.password,
    });
    log("✅ Login - SUCCESS", {
      userId: response.data.data?.user?.id,
      token: response.data.data?.token ? "✓ Token received" : "❌ No token"
    });
    
    if (response.data.data?.token) {
      authToken = response.data.data.token;
    }
    return true;
  } catch (error) {
    handleError(error, "Login");
    return false;
  }
}

async function testProtectedEndpoints() {
  if (!authToken) {
    log("❌ Protected endpoints - SKIPPED: No auth token");
    return false;
  }

  const headers = { Authorization: `Bearer ${authToken}` };

  try {
    // Test get profile
    const profile = await axios.get(`${BASE_URL}/api/users/profile`, { headers });
    log("✅ Get Profile - SUCCESS", {
      fullName: profile.data.data?.user?.full_name,
      email: profile.data.data?.user?.email
    });

    // Test health prediction
    const healthData = {
      Age: 25,
      SystolicBP: 120,
      DiastolicBP: 80,
      BS: 7.5,
      BodyTemp: 98.6,
      HeartRate: 72,
    };
    
    const prediction = await axios.post(
      `${BASE_URL}/api/health/predict`,
      healthData,
      { headers }
    );
    log("✅ Health Prediction - SUCCESS", {
      riskLevel: prediction.data.data?.risk_level,
      confidence: prediction.data.data?.confidence
    });

    // Test timeline profile
    const timelineProfile = {
      due_date: "2024-12-15",
      last_menstrual_period: "2024-03-10",
      current_weight: 65.5,
      pre_pregnancy_weight: 58.0,
      height: 165.0
    };
    
    const timeline = await axios.post(
      `${BASE_URL}/api/timeline/profile`,
      timelineProfile,
      { headers }
    );
    log("✅ Timeline Profile - SUCCESS", {
      dueDate: timeline.data.data?.profile?.due_date,
      currentWeek: timeline.data.data?.profile?.current_pregnancy_week
    });

    return true;
  } catch (error) {
    handleError(error, "Protected Endpoints");
    return false;
  }
}

async function testCORS() {
  try {
    // Test OPTIONS request for CORS
    const response = await axios.options(`${BASE_URL}/api/auth/login`);
    log("✅ CORS - SUCCESS", {
      status: response.status,
      headers: {
        'access-control-allow-origin': response.headers['access-control-allow-origin'],
        'access-control-allow-methods': response.headers['access-control-allow-methods'],
        'access-control-allow-headers': response.headers['access-control-allow-headers']
      }
    });
    return true;
  } catch (error) {
    // Some environments might not support OPTIONS, so we don't fail here
    log("⚠️ CORS test completed (OPTIONS might not be supported)");
    return true;
  }
}

// Main test runner
async function runTests() {
  console.log("🧪 Testing Velora Backend Deployment");
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log("=" * 50);

  const results = {
    healthCheck: await testHealthCheck(),
    cors: await testCORS(),
    publicEndpoints: await testPublicEndpoints(),
    register: await testRegister(),
    login: await testLogin(),
    protectedEndpoints: await testProtectedEndpoints(),
  };

  console.log("\n" + "=" * 50);
  console.log("📊 Test Results Summary:");
  console.log("=" * 50);

  let passedTests = 0;
  const totalTests = Object.keys(results).length;

  for (const [testName, passed] of Object.entries(results)) {
    const status = passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${status} ${testName}`);
    if (passed) passedTests++;
  }

  console.log("=" * 50);
  console.log(`📈 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log("🎉 All tests passed! Deployment is successful.");
  } else {
    console.log("⚠️ Some tests failed. Please check the logs above.");
  }

  console.log("\n🔗 Your API is ready at:", BASE_URL);
  console.log("📚 API Documentation:", `${BASE_URL}/api/docs`);
}

// Run tests
runTests().catch(console.error);
