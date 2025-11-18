#!/usr/bin/env node

/**
 * Configuration Versioning Example
 *
 * Demonstrates configuration management with versioning and complex data structures.
 * Shows how to handle configuration evolution, backward compatibility, and migration
 * between different configuration formats using bidirectional transformations.
 *
 * This example can be run directly:
 *   npx tsx examples/config-versioning.ts
 */

import { createRuna } from "../src/index.js";

// Configuration types for different versions
interface AppConfigV1 {
  databaseUrl: string;
  apiKey: string;
  debug: boolean;
  timeout: number;
}

interface AppConfigV2 {
  database: {
    url: string;
    maxConnections: number;
  };
  api: {
    key: string;
    version: string;
  };
  features: {
    debug: boolean;
    analytics: boolean;
  };
  performance: {
    timeout: number;
    retries: number;
  };
}

function versioningExample() {
  console.log("📦 Configuration Versioning");
  console.log("============================");

  // Create transformations between different configuration versions
  const v1ToV2 = createRuna(
    (v1Config: AppConfigV1): AppConfigV2 => ({
      database: {
        url: v1Config.databaseUrl,
        maxConnections: 10, // Default value for new field
      },
      api: {
        key: v1Config.apiKey,
        version: "v1", // Default API version
      },
      features: {
        debug: v1Config.debug,
        analytics: false, // Default value for new feature
      },
      performance: {
        timeout: v1Config.timeout,
        retries: 3, // Default value for new field
      },
    }),
    (v2Config: AppConfigV2): AppConfigV1 => ({
      databaseUrl: v2Config.database.url,
      apiKey: v2Config.api.key,
      debug: v2Config.features.debug,
      timeout: v2Config.performance.timeout,
    }),
  );

  // Sample V1 configuration
  const v1Config: AppConfigV1 = {
    databaseUrl: "postgresql://localhost:5432/myapp",
    apiKey: "sk-1234567890abcdef",
    debug: true,
    timeout: 30000,
  };

  console.log("Original V1 Configuration:");
  console.log(JSON.stringify(v1Config, null, 2));

  // Upgrade to V2
  const v2Config = v1ToV2.encode(v1Config);
  console.log("\nUpgraded to V2 Configuration:");
  console.log(JSON.stringify(v2Config, null, 2));

  // Downgrade back to V1
  const restoredV1 = v1ToV2.decode(v2Config);
  console.log("\nDowngraded back to V1:");
  console.log(JSON.stringify(restoredV1, null, 2));

  // Verify perfect round-trip
  const isPerfectRoundTrip =
    JSON.stringify(v1Config) === JSON.stringify(restoredV1);
  console.log(
    `\nPerfect round-trip: ${isPerfectRoundTrip ? "✅ YES" : "❌ NO"}`,
  );
}

versioningExample();
