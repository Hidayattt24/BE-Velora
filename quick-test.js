const axios = require("axios");

const BASE_URL = "http://localhost:5000";

async function quickTest() {
  console.log("🚀 Quick API Test");

  try {
    // 1. Health Check
    console.log("\n1. Testing Health Check...");
    const health = await axios.get(`${BASE_URL}/health`);
    console.log("✅ Health check:", health.data);

    // 2. Try Register first
    console.log("\n2. Testing Registration...");
    const registerData = {
      fullName: "Test User Quick",
      phone: "081234567899",
      email: "quicktest@velora.com",
      password: "TestPassword123",
    };

    try {
      const register = await axios.post(
        `${BASE_URL}/api/auth/register`,
        registerData
      );
      console.log("✅ Registration success");
    } catch (regError) {
      if (regError.response?.data?.message?.includes("sudah terdaftar")) {
        console.log("ℹ️  User already exists, continuing...");
      } else {
        throw regError;
      }
    }

    // 3. Try Login
    console.log("\n3. Testing Login...");
    const loginData = {
      nama: "quicktest@velora.com",
      password: "TestPassword123",
    };

    const login = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
    console.log("✅ Login success");
    console.log("Token:", login.data.data.token.substring(0, 50) + "...");

    const token = login.data.data.token;

    // 4. Test Profile with token
    console.log("\n4. Testing Get Profile...");
    const headers = { Authorization: `Bearer ${token}` };

    const profile = await axios.get(`${BASE_URL}/api/users/profile`, {
      headers,
    });
    console.log("✅ Profile:", profile.data.data.user.full_name);

    // 5. Test Articles (public)
    console.log("\n5. Testing Get Articles (public)...");
    const articles = await axios.get(`${BASE_URL}/api/journal/articles`);
    console.log("✅ Articles count:", articles.data.data.articles.length);

    // 6. Test Health Prediction
    console.log("\n6. Testing Health Prediction...");
    const healthData = {
      Age: 25,
      SystolicBP: 120,
      DiastolicBP: 80,
      BS: 7.5,
      BodyTemp: 98.6,
      HeartRate: 72,
    };

    const healthPrediction = await axios.post(
      `${BASE_URL}/api/health/predict`,
      healthData,
      { headers }
    );
    console.log("✅ Health prediction:", healthPrediction.data.data.risk_level);

    console.log("\n🎉 All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    console.error("Status:", error.response?.status);
  }
}

quickTest();
