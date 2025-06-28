// Simple test untuk memastikan server dan database berfungsi
const axios = require("axios");

const BASE_URL = "http://localhost:5000";

async function testBasicEndpoints() {
  console.log("🧪 Testing basic endpoints...\n");

  // Test health check
  try {
    const health = await axios.get(`${BASE_URL}/health`);
    console.log("✅ Health check:", health.data);
  } catch (error) {
    console.log("❌ Health check failed:", error.message);
  }

  // Test articles endpoint (should be public)
  try {
    const articles = await axios.get(`${BASE_URL}/api/journal/articles`);
    console.log("✅ Articles endpoint:", articles.data);
  } catch (error) {
    console.log("❌ Articles failed:", error.response?.data || error.message);
  }

  // Test dengan user dummy untuk melihat error detail
  try {
    const testUser = {
      fullName: "Test User",
      phone: "081999888777",
      email: "test123@example.com",
      password: "TestPass123",
    };

    const register = await axios.post(
      `${BASE_URL}/api/auth/register`,
      testUser
    );
    console.log("✅ Registration success:", register.data);
  } catch (error) {
    console.log("❌ Registration failed:");
    console.log("Status:", error.response?.status);
    console.log("Data:", error.response?.data);
    console.log("Headers:", error.response?.headers);
  }
}

testBasicEndpoints();
