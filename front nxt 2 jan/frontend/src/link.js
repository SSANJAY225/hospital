import fs from "fs";
import path from "path";

/**
 * Matches:
 * axios.get("https://...")
 * axios.post("https://...")
 * axios.put("https://...")
 * axios.delete("https://...")
 */
const axiosRegex =
  /axios\.(get|post|put|delete)\s*\(\s*["'`](https:\/\/[^"'`]+)["'`]/gi;

/**
 * Matches:
 * fetch("https://...", { method: "POST" })
 * fetch("https://...")
 */
const fetchRegex =
  /fetch\s*\(\s*["'`](https:\/\/[^"'`]+)["'`]\s*(?:,\s*\{[\s\S]*?method\s*:\s*["'`](GET|POST|PUT|DELETE)["'`])?/gi;

const results = [];

function scanDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith(".js") || file.endsWith(".jsx")) {
      const content = fs.readFileSync(fullPath, "utf8");

      let match;

      // axios
      while ((match = axiosRegex.exec(content)) !== null) {
        results.push({
          method: match[1].toUpperCase(),
          url: match[2],
          source: fullPath
        });
      }

      // fetch
      while ((match = fetchRegex.exec(content)) !== null) {
        results.push({
          method: match[2] ? match[2].toUpperCase() : "GET",
          url: match[1],
          source: fullPath
        });
      }
    }
  }
}

scanDir("../src");

fs.writeFileSync(
  "../httpsRequests.json",
  JSON.stringify(results, null, 2)
);

console.log("✅ HTTPS requests with methods extracted");
