import { generateInviteCode, generateTopicPrefix } from "@/utils/invite";

describe("invite utils", () => {
  describe("generateInviteCode", () => {
    it("returns an 8-character alphanumeric string", async () => {
      const code = await generateInviteCode();
      expect(code).toHaveLength(8);
      expect(code).toMatch(/^[a-z0-9]+$/);
    });

    it("generates different codes on subsequent calls", async () => {
      const code1 = await generateInviteCode();
      const code2 = await generateInviteCode();
      // Statistically near-impossible to be equal
      expect(code1).not.toEqual(code2);
    });
  });

  describe("generateTopicPrefix", () => {
    it("returns a string with 'fam_' prefix followed by 6 alphanumeric characters", async () => {
      const topic = await generateTopicPrefix();
      expect(topic).toMatch(/^fam_[a-z0-9]{6}$/);
    });
  });
});
