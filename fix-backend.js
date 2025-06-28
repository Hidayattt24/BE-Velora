const fs = require("fs");
const path = require("path");

console.log("🔧 Fixing Backend Routes...");

// Files to fix
const filesToFix = [
  "src/routes/user.js",
  "src/routes/health.js",
  "src/routes/timeline.js",
  "src/routes/gallery.js",
];

filesToFix.forEach((filePath) => {
  const fullPath = path.join(__dirname, filePath);

  if (fs.existsSync(fullPath)) {
    console.log(`📝 Fixing ${filePath}...`);

    let content = fs.readFileSync(fullPath, "utf8");

    // Replace req.user.userId with req.user.id
    const beforeCount = (content.match(/req\.user\.userId/g) || []).length;
    content = content.replace(/req\.user\.userId/g, "req.user.id");
    const afterCount = (content.match(/req\.user\.userId/g) || []).length;

    fs.writeFileSync(fullPath, content);

    console.log(`✅ Fixed ${beforeCount} occurrences in ${filePath}`);
  } else {
    console.log(`⚠️  File ${filePath} not found`);
  }
});

console.log("🎉 Backend fixes completed!");
console.log("\n📋 Next steps:");
console.log(
  "1. Run the SQL fix in Supabase SQL Editor (database/fix-rls-policies.sql)"
);
console.log("2. Test with: node quick-test.js");
console.log("3. Run full tests with: node test-api.js");
