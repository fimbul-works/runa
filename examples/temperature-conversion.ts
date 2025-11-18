#!/usr/bin/env node

/**
 * Temperature Conversion Example
 *
 * Demonstrates arithmetic transformations for converting between Celsius and Fahrenheit
 * using the bidirectional power of @fimbul-works/runa.
 *
 * This example can be run directly:
 *   npx tsx examples/temperature-conversion.ts
 */

import { runaAdd, runaMultiply } from "../src/index.js";

function temperatureExample() {
  console.log("🌡️  Temperature Conversion Example");
  console.log("=================================");

  // Build the complete temperature conversion pipeline
  // Celsius to Fahrenheit: (C * 1.8) + 32
  const celsiusToFahrenheit = runaMultiply(1.8).chain(runaAdd(32));

  // Test various temperatures
  const testTemperatures = [
    { celsius: 25, description: "Room temperature" },
    { celsius: 0, description: "Freezing point" },
    { celsius: 100, description: "Boiling point" },
    { celsius: -10, description: "Below freezing" },
    { celsius: 37, description: "Body temperature" },
    { celsius: -40, description: "Where Celsius = Fahrenheit" },
  ];

  console.log("Celsius  | Fahrenheit  | Verification");
  console.log("---------|-------------|-------------");

  testTemperatures.forEach(({ celsius, description }) => {
    // Forward transformation
    const fahrenheit = celsiusToFahrenheit.encode(celsius);

    // Reverse transformation
    const restoredCelsius = celsiusToFahrenheit.decode(fahrenheit);

    // Verification
    const isAccurate = Math.abs(restoredCelsius - celsius) < 0.0001;

    console.log(
      `${celsius.toString().padStart(7)}° | ${fahrenheit.toFixed(1).padStart(10)}° | ${isAccurate ? "✅" : "❌"} ${description}`,
    );
  });
}

// Run the example
temperatureExample();
