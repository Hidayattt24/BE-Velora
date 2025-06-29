// Test script untuk API Velora Backend
// Jalankan dengan: node test-api.js

const axios = require("axios");

const BASE_URL = "http://localhost:5000";
let authToken = "";

// Test data
const testUser = {
  fullName: "Test User Velora",
  phone: "081234567890",
  email: "test@velora.com",
  password: "TestPass123",
};

// Helper function untuk logging
const log = (message, data = null) => {
  console.log(`\n🔍 ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

// Helper function untuk error handling
const handleError = (error, testName) => {
  console.log(`\n❌ ${testName} failed:`);
  if (error.response) {
    console.log("Status:", error.response.status);
    console.log("Data:", error.response.data);
  } else {
    console.log("Error:", error.message);
  }
};

// Test functions
async function testHealthCheck() {
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    log("Health Check - SUCCESS", response.data);
    return true;
  } catch (error) {
    handleError(error, "Health Check");
    return false;
  }
}

async function testRegister() {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/auth/register`,
      testUser
    );
    log("Register - SUCCESS", response.data);
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
    log("Login - SUCCESS", response.data);

    if (response.data.data && response.data.data.token) {
      authToken = response.data.data.token;
      log("Auth token saved for subsequent requests");
    }
    return true;
  } catch (error) {
    handleError(error, "Login");
    return false;
  }
}

async function testGetProfile() {
  try {
    if (!authToken) {
      log("Get Profile - SKIPPED: No auth token available");
      return false;
    }

    const response = await axios.get(`${BASE_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    log("Get Profile - SUCCESS", response.data);
    return true;
  } catch (error) {
    handleError(error, "Get Profile");
    return false;
  }
}

async function testHealthPrediction() {
  try {
    if (!authToken) {
      log("Health Prediction - SKIPPED: No auth token available");
      return false;
    }

    const healthData = {
      Age: 25,
      SystolicBP: 120,
      DiastolicBP: 80,
      BS: 7.5,
      BodyTemp: 98.6,
      HeartRate: 72,
    };

    const response = await axios.post(
      `${BASE_URL}/api/health/predict`,
      healthData,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    log("Health Prediction - SUCCESS", response.data);
    return true;
  } catch (error) {
    handleError(error, "Health Prediction");
    return false;
  }
}

async function testGetArticles() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/journal/articles?page=1&limit=5`
    );
    log("Get Articles - SUCCESS", response.data);
    return true;
  } catch (error) {
    handleError(error, "Get Articles");
    return false;
  }
}

async function testCreateArticle() {
  try {
    const articleData = {
      title: "Test Article from API",
      content:
        "This is a test article created via API. It contains information about pregnancy health and tips for expecting mothers.",
      category: "Test",
      published: true,
    };

    const response = await axios.post(
      `${BASE_URL}/api/journal/articles`,
      articleData,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    log("Create Article - SUCCESS", response.data);
    return true;
  } catch (error) {
    handleError(error, "Create Article");
    return false;
  }
}

async function testGetHealthParameters() {
  try {
    const response = await axios.get(`${BASE_URL}/api/health/parameters`);
    log("Get Health Parameters - SUCCESS", response.data);
    return true;
  } catch (error) {
    handleError(error, "Get Health Parameters");
    return false;
  }
}

async function testPregnancyProfile() {
  try {
    const profileData = {
      due_date: "2024-09-15",
      last_menstrual_period: "2023-12-08",
      current_weight: 65.5,
      pre_pregnancy_weight: 58.0,
      height: 165.0,
    };

    const response = await axios.post(
      `${BASE_URL}/api/timeline/profile`,
      profileData,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    log("Create Pregnancy Profile - SUCCESS", response.data);
    return true;
  } catch (error) {
    handleError(error, "Create Pregnancy Profile");
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log("🚀 Starting Velora Backend API Tests\n");
  console.log("=" * 50);

  const tests = [
    { name: "Health Check", fn: testHealthCheck },
    { name: "User Registration", fn: testRegister },
    { name: "User Login", fn: testLogin },
    { name: "Get User Profile", fn: testGetProfile },
    { name: "Health Risk Prediction", fn: testHealthPrediction },
    { name: "Get Articles", fn: testGetArticles },
    { name: "Create Article", fn: testCreateArticle },
    { name: "Get Health Parameters", fn: testGetHealthParameters },
    { name: "Create Pregnancy Profile", fn: testPregnancyProfile },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`\n🧪 Testing: ${test.name}`);
    console.log("-".repeat(30));

    const result = await test.fn();
    if (result) {
      passed++;
      console.log(`✅ ${test.name} - PASSED`);
    } else {
      failed++;
      console.log(`❌ ${test.name} - FAILED`);
    }

    // Add delay between tests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Test summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);
  console.log(
    `📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`
  );

  if (failed === 0) {
    console.log("\n🎉 All tests passed! Backend API is working correctly.");
  } else {
    console.log(
      "\n⚠️  Some tests failed. Please check the error messages above."
    );
  }
}

// Check if server is running before starting tests
async function checkServerStatus() {
  try {
    await axios.get(`${BASE_URL}/health`);
    console.log("✅ Server is running. Starting tests...");
    return true;
  } catch (error) {
    console.log("❌ Server is not running. Please start the server first:");
    console.log("   npm run dev");
    return false;
  }
}

// Run tests
(async () => {
  const serverRunning = await checkServerStatus();
  if (serverRunning) {
    await runAllTests();
  }
})();

module.exports = {
  testHealthCheck,
  testRegister,
  testLogin,
  testGetProfile,
  testHealthPrediction,
  testGetArticles,
  testCreateArticle,
  testGetHealthParameters,
  testPregnancyProfile,
  runAllTests,
};
