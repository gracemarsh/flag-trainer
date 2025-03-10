import { cn, getFlagUrl, getFlagImageUrl, getFlagSvgUrl } from "./utils";

describe("Utils", () => {
  describe("cn function", () => {
    it("should merge class names correctly", () => {
      expect(cn("class1", "class2")).toBe("class1 class2");
      expect(cn("class1", { class2: true, class3: false })).toBe(
        "class1 class2",
      );
      expect(cn("class1", undefined, "class2")).toBe("class1 class2");
    });
  });

  describe("getFlagUrl function", () => {
    it("should return a fallback for undefined country code", () => {
      expect(getFlagUrl(undefined)).toBe("/placeholder-flag.png");
    });

    it("should return a valid URL for a valid country code", () => {
      expect(getFlagUrl("US")).toContain("flagcdn.com");
      expect(getFlagUrl("US")).toContain("us.png");
    });

    it("should handle size parameter", () => {
      expect(getFlagUrl("US", 640)).toContain("w640");
    });
  });

  describe("getFlagImageUrl function", () => {
    it("should return a fallback for invalid country code", () => {
      expect(getFlagImageUrl("")).toBe("/placeholder-flag.png");
    });

    it("should return a valid URL for a valid country code", () => {
      expect(getFlagImageUrl("US")).toContain("flagcdn.com");
      expect(getFlagImageUrl("US")).toContain("us.png");
    });
  });

  describe("getFlagSvgUrl function", () => {
    it("should return a fallback for invalid country code", () => {
      expect(getFlagSvgUrl("")).toBe("/placeholder-flag.svg");
    });

    it("should return a valid URL for a valid country code", () => {
      expect(getFlagSvgUrl("US")).toContain("flagcdn.com");
      expect(getFlagSvgUrl("US")).toContain("us.svg");
    });
  });
});
