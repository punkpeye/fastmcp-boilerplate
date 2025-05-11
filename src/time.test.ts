import { expect, it } from "vitest";

import { currentTime } from "./time.js";

it("should get the current time", () => {
  expect(currentTime()).toBeDefined();
});

it("should get the current time in a specific timezone", () => {
  expect(currentTime("Asia/Tokyo")).toBeDefined();
});
