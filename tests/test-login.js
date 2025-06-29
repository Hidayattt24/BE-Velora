// Quick test for login API
const testLogin = async () => {
  const testData = {
    email: "tes@gmail.com", // Email dari screenshot yang Anda berikan
    password: "test123", // Password sederhana untuk test
  };

  try {
    console.log("Testing login with:", testData);

    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    console.log("Response status:", response.status);
    console.log("Response data:", result);

    if (result.success) {
      console.log("✅ Login successful!");
      console.log("User:", result.data.user);
      console.log("Token:", result.data.token.substring(0, 20) + "...");
    } else {
      console.log("❌ Login failed:", result.message);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

// Test juga dengan email yang ada di screenshot
const testLoginWithScreenshotData = async () => {
  const testData = {
    email: "tes@gmail.com",
    password: "$2a$12$aK.bpH", // Ini bukan password asli, tapi hash
  };

  try {
    console.log("Testing login with screenshot data:", {
      email: testData.email,
    });

    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: testData.email,
        password: "test123", // Password sederhana yang mungkin digunakan saat register
      }),
    });

    const result = await response.json();

    console.log("Response status:", response.status);
    console.log("Response data:", result);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

// Run tests
console.log("🔍 Testing Login API...");
testLogin();

console.log("\n🔍 Testing with screenshot data...");
testLoginWithScreenshotData();
