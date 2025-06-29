const { supabase } = require("./src/config/database");

async function testSupabaseStorage() {
  console.log("Testing Supabase Storage setup...");

  try {
    // Test 1: Check if Supabase client is working
    console.log("1. Testing Supabase client...");
    const { data: user, error: authError } = await supabase.auth.getUser();
    console.log("Supabase client status:", authError ? "ERROR" : "OK");
    if (authError) console.log("Auth error:", authError.message);

    // Test 2: List buckets
    console.log("\n2. Listing storage buckets...");
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (bucketsError) {
      console.log("Buckets error:", bucketsError.message);
    } else {
      console.log(
        "Available buckets:",
        buckets.map((b) => b.name)
      );
      const galleryBucket = buckets.find((b) => b.id === "gallery-photos");
      console.log("Gallery-photos bucket exists:", !!galleryBucket);
    }

    // Test 3: Try to access gallery-photos bucket
    console.log("\n3. Testing gallery-photos bucket access...");
    const { data: files, error: filesError } = await supabase.storage
      .from("gallery-photos")
      .list();

    if (filesError) {
      console.log("Gallery bucket access error:", filesError.message);
    } else {
      console.log("Gallery bucket accessible, files count:", files.length);
    }

    // Test 4: Test file upload (small test file)
    console.log("\n4. Testing file upload...");
    const testBuffer = Buffer.from("test file content");
    const testFileName = `test-${Date.now()}.txt`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("gallery-photos")
      .upload(`uploads/${testFileName}`, testBuffer, {
        contentType: "text/plain",
      });

    if (uploadError) {
      console.log("Upload test error:", uploadError.message);
    } else {
      console.log("Upload test successful:", uploadData.path);

      // Test 5: Get public URL
      const { data: urlData } = supabase.storage
        .from("gallery-photos")
        .getPublicUrl(`uploads/${testFileName}`);

      console.log("Public URL:", urlData.publicUrl);

      // Cleanup test file
      await supabase.storage
        .from("gallery-photos")
        .remove([`uploads/${testFileName}`]);
      console.log("Test file cleaned up");
    }
  } catch (error) {
    console.error("Test failed with error:", error.message);
  }
}

// Run test
testSupabaseStorage()
  .then(() => {
    console.log("\nStorage test completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test script error:", error);
    process.exit(1);
  });
