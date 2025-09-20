// greeting.test.ts
import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { getGreeting } from "./greeting.ts";

Deno.test("getGreeting should return the correct greeting", () => {
  const result = getGreeting("World");
  assertEquals(result, "Hello, World!");
});