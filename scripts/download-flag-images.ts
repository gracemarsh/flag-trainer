import fs from "fs";
import path from "path";
import https from "https";

// Define the countries data directly to avoid import issues
// This is a simplified list of country codes
const countryCodes = [
  "US",
  "CA",
  "MX",
  "GB",
  "FR",
  "DE",
  "IT",
  "ES",
  "PT",
  "NL",
  "BE",
  "CH",
  "AT",
  "DK",
  "SE",
  "NO",
  "FI",
  "RU",
  "PL",
  "CZ",
  "HU",
  "GR",
  "TR",
  "JP",
  "CN",
  "IN",
  "AU",
  "NZ",
  "BR",
  "AR",
  "CL",
  "CO",
  "PE",
  "ZA",
  "EG",
  "NG",
  "KE",
  "MA",
  "TH",
  "VN",
  "ID",
  "MY",
  "SG",
  "PH",
  "KR",
  "SA",
  "AE",
  "IL",
  "QA",
  "KW",
];

const FLAGS_DIR = path.join(process.cwd(), "public", "flags");

// Ensure the flags directory exists
function ensureFlagsDir() {
  if (!fs.existsSync(FLAGS_DIR)) {
    console.log(`📁 Creating flags directory at ${FLAGS_DIR}`);
    fs.mkdirSync(FLAGS_DIR, { recursive: true });
  }
}

// Download an SVG flag from flagcdn.com
async function downloadFlag(countryCode: string): Promise<boolean> {
  return new Promise((resolve) => {
    const flagUrl = `https://flagcdn.com/${countryCode.toLowerCase()}.svg`;
    const filePath = path.join(FLAGS_DIR, `${countryCode.toLowerCase()}.svg`);

    const file = fs.createWriteStream(filePath);

    https
      .get(flagUrl, (response) => {
        if (response.statusCode !== 200) {
          console.error(
            `❌ Failed to download flag for ${countryCode}: HTTP ${response.statusCode}`,
          );
          file.close();
          fs.unlinkSync(filePath); // Remove the file if download failed
          resolve(false);
          return;
        }

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          resolve(true);
        });
      })
      .on("error", (err) => {
        console.error(
          `❌ Error downloading flag for ${countryCode}:`,
          err.message,
        );
        file.close();
        fs.unlinkSync(filePath); // Remove the file if download failed
        resolve(false);
      });
  });
}

// Main function
async function main() {
  console.log("🚩 Starting flag image download process...");

  // Make sure the flags directory exists
  ensureFlagsDir();

  console.log(
    `📋 Found ${countryCodes.length} countries to download flags for`,
  );

  let successCount = 0;
  let failCount = 0;

  // Download flags with a small delay between requests to be nice to the server
  for (let i = 0; i < countryCodes.length; i++) {
    const code = countryCodes[i];

    process.stdout.write(
      `⏳ Downloading flag for ${code} (${i + 1}/${countryCodes.length})... `,
    );

    const success = await downloadFlag(code);

    if (success) {
      process.stdout.write("✅\n");
      successCount++;
    } else {
      process.stdout.write("❌\n");
      failCount++;
    }

    // Small delay to avoid hammering the server
    if (i < countryCodes.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  console.log("\n📊 Download Summary:");
  console.log(`✅ Successfully downloaded: ${successCount} flags`);

  if (failCount > 0) {
    console.log(`❌ Failed to download: ${failCount} flags`);
  }

  console.log("🏁 Flag download process completed!");
}

// Run the script
main().catch((error) => {
  console.error("❌ Unhandled error:", error);
  process.exit(1);
});
