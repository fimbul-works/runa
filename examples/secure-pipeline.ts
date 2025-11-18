#!/usr/bin/env node

/**
 * Secure Data Pipeline Example
 *
 * Demonstrates creating a secure data processing pipeline using AES-GCM encryption
 * with SuperJSON for preserving complex JavaScript objects.
 *
 * This example can be run directly:
 *   npx tsx examples/secure-pipeline.ts
 */

import { runaAesGcm, runaBase64, runaJSON } from "../src/index.js";

interface ComplexData {
  userId: number;
  timestamp: Date;
  metadata: Map<string, string>;
  permissions: Set<string>;
  preferences: { theme: string; notifications: boolean };
}

async function securePipelineExample() {
  console.log("🔐 Secure Data Pipeline Example");
  console.log("===============================");

  // Create sample data with complex JavaScript objects
  const complexData: ComplexData = {
    userId: 12345,
    timestamp: new Date("2023-12-25T10:30:00.000Z"),
    metadata: new Map([
      ["role", "admin"],
      ["clearance", "level-3"],
    ]),
    permissions: new Set(["read", "write", "deploy"]),
    preferences: { theme: "dark", notifications: true },
  };

  console.log("Original Data:");
  console.log(`User ID: ${complexData.userId}`);
  console.log(`Timestamp: ${complexData.timestamp.toISOString()}`);
  console.log(
    `Metadata: ${Array.from(complexData.metadata.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join(", ")}`,
  );
  console.log(`Permissions: ${Array.from(complexData.permissions).join(", ")}`);
  console.log(`Theme: ${complexData.preferences.theme}\n`);

  // Create the secure encryption pipeline using Runa functions
  const securePipeline = runaJSON<ComplexData>()
    .chain(runaBase64())
    .chainAsync(await runaAesGcm("a".repeat(32)));

  // Encrypt the data
  const encrypted = await securePipeline.encode(complexData);
  console.log("Encrypted:");
  console.log(`Size: ${encrypted.length} bytes`);
  console.log(`Type: ${encrypted.constructor.name}\n`);

  // Decrypt the data
  const decrypted = await securePipeline.decode(encrypted);
  console.log("Decrypted:");
  console.log(`User ID: ${decrypted.userId}`);
  console.log(`Timestamp: ${decrypted.timestamp.toISOString()}`);
  console.log(
    `Metadata: ${Array.from(complexData.metadata.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join(", ")}`,
  );
  console.log(`Permissions: ${Array.from(complexData.permissions).join(", ")}`);
  console.log(`Theme: ${decrypted.preferences.theme}\n`);

  // Verify perfect restoration
  const isPerfect =
    complexData.userId === decrypted.userId &&
    complexData.timestamp.getTime() === decrypted.timestamp.getTime() &&
    complexData.metadata.size === decrypted.metadata.size &&
    Array.from(complexData.permissions).sort().join(",") ===
      Array.from(decrypted.permissions).sort().join(",") &&
    complexData.preferences.theme === decrypted.preferences.theme &&
    complexData.preferences.notifications ===
      decrypted.preferences.notifications;

  console.log(`Perfect round-trip: ${isPerfect ? "✅ YES" : "❌ NO"}`);
}

securePipelineExample().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
