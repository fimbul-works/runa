#!/usr/bin/env node

/**
 * ID Generation Example
 *
 * Demonstrates YouTube-style ID generation using FF1 format-preserving encryption.
 * Shows how to create reversible, non-sequential, and secure ID systems.
 *
 * This example can be run directly:
 *   npx tsx examples/id-generation.ts
 */

import {
  runaFF1,
  runaStringPadStart,
  runaStringToNumber,
} from "../src/index.js";

function idGenerationExample() {
  console.log("🎬 YouTube-Style ID Generation:");
  console.log("==================================");

  // Create YouTube-style ID generator pipeline
  const youtubeIdGen = runaStringToNumber()
    .reversed() // stringToNumber reversed gives numberToString
    .chain(
      runaStringPadStart(10, "0").chain(
        runaFF1(
          "a".repeat(32),
          "b".repeat(32),
          "0123456789abcdefghijklmnopqrstuvwxyz",
          10,
        ),
      ),
    );

  console.log("Sequential → Obfuscated → Restored\n");

  const sequentialNumbers = [1, 42, 1337, 9001, 12345];

  for (const num of sequentialNumbers) {
    const youtubeId = youtubeIdGen.encode(num);
    const originalNum = youtubeIdGen.decode(youtubeId);

    console.log(
      `${num.toString().padStart(10)} → ${youtubeId} → ${originalNum.toString().padStart(5)} ${originalNum === num ? "✅" : "❌"}`,
    );
  }

  // Performance test
  console.log();
  console.log("⚡ Performance Test:");
  console.log("====================\n");

  const testCount = 1000;
  const startTime = performance.now();

  for (let i = 0; i < testCount; i++) {
    youtubeIdGen.encode(i + 1);
  }

  const totalTime = performance.now() - startTime;
  console.log(`Generated ${testCount} IDs in ${Math.floor(totalTime)}ms`);
  console.log(`Rate: ${Math.round((testCount * 1000) / totalTime)} IDs/second`);
}

// Run the example
function main() {
  try {
    idGenerationExample();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
