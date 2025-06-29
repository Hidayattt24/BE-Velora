// Test upload avatar dengan Supabase Storage
require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

// Test avatar upload to Supabase Storage
async function testAvatarUpload() {
  console.log("Testing avatar upload with Supabase Storage...");

  try {
    // Create a small test image buffer (minimal valid PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0b, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    console.log("Environment check:");
    console.log(
      "- SUPABASE_URL:",
      process.env.SUPABASE_URL ? "✓ Set" : "✗ Missing"
    );
    console.log(
      "- SUPABASE_SERVICE_ROLE_KEY:",
      process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓ Set" : "✗ Missing"
    );
    console.log("");

    // Test direct Supabase Storage upload for avatar
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    console.log("Testing avatar upload to gallery-photos bucket...");

    const testFileName = `avatar-test-${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("gallery-photos")
      .upload(`uploads/${testFileName}`, testImageBuffer, {
        contentType: "image/png",
      });

    if (uploadError) {
      console.log("❌ Avatar upload test failed:", uploadError.message);
      return false;
    } else {
      console.log("✅ Avatar upload successful:", uploadData.path);

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from("gallery-photos")
        .getPublicUrl(`uploads/${testFileName}`);

      console.log("✅ Avatar public URL:", urlData.publicUrl);
      console.log(
        "✅ URL format correct for frontend:",
        urlData.publicUrl.startsWith("https://")
      );

      // Test if URL is accessible (basic validation)
      const isValidUrl =
        urlData.publicUrl && urlData.publicUrl.includes("supabase.co");
      console.log("✅ URL validation:", isValidUrl ? "PASS" : "FAIL");

      // Cleanup
      const { error: deleteError } = await supabaseAdmin.storage
        .from("gallery-photos")
        .remove([`uploads/${testFileName}`]);

      if (deleteError) {
        console.log("⚠️ Cleanup warning:", deleteError.message);
      } else {
        console.log("✅ Test file cleaned up");
      }

      return true;
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    return false;
  }
}

// Run test
testAvatarUpload()
  .then((success) => {
    console.log("\n" + "=".repeat(50));
    console.log("Avatar Upload Test Results:");
    console.log("Status:", success ? "✅ SUCCESS" : "❌ FAILED");
    console.log("Backend ready for avatar uploads:", success ? "YES" : "NO");
    console.log("=".repeat(50));
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Test script error:", error);
    process.exit(1);
  });
