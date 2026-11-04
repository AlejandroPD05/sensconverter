import { describe, expect, it } from "vitest";
import { safeNext } from "./auth";

describe("safeNext (redirecciones tras iniciar sesión)", () => {
  it("acepta rutas internas", () => {
    expect(safeNext("/account")).toBe("/account");
    expect(safeNext("/my-sensitivities?tab=fav")).toBe("/my-sensitivities?tab=fav");
    expect(safeNext(["/global", "/otra"])).toBe("/global");
  });

  it.each([
    ["https://evil.example"],
    ["//evil.example"],
    ["/\\evil.example"],
    ["\\\\evil.example"],
    ["/\tevil"],
    ["/\nLocation: https://evil.example"],
    ["javascript:alert(1)"],
    ["evil.example"],
    [""],
  ])("rechaza %j y vuelve al inicio", (value) => {
    expect(safeNext(value)).toBe("/");
  });

  it("sin valor vuelve al inicio", () => {
    expect(safeNext(undefined)).toBe("/");
  });
});
