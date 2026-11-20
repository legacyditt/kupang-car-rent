import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_BUSINESS_PROFILE,
  formatIntlWhatsApp,
  normalizeAdminWhatsApp,
  validateAndNormalizeProfile,
} from "../src/features/business-profile/utils/business-profile.ts";

test("normalizeAdminWhatsApp converts 08xx and +628xx into 628xx", () => {
  assert.equal(normalizeAdminWhatsApp("0812-3898-9891"), "6281238989891");
  assert.equal(normalizeAdminWhatsApp("+62 812 3898 9891"), "6281238989891");
});

test("formatIntlWhatsApp formats 628xxx cleanly", () => {
  assert.equal(formatIntlWhatsApp("6281238989891"), "+62 812-3898-9891");
});

test("validateAndNormalizeProfile rejects empty name or invalid WA", () => {
  const badName = validateAndNormalizeProfile({
    ...DEFAULT_BUSINESS_PROFILE,
    name: "   ",
  });
  assert.equal(badName.ok, false);

  const badPhone = validateAndNormalizeProfile({
    ...DEFAULT_BUSINESS_PROFILE,
    whatsappNumber: "0812",
  });
  assert.equal(badPhone.ok, false);
});

test("validateAndNormalizeProfile normalizes valid input", () => {
  const res = validateAndNormalizeProfile({
    ...DEFAULT_BUSINESS_PROFILE,
    name: "  Aventra Kupang  ",
    whatsappNumber: "0812-3898-9891",
    location: "  Jl. El Tari, Kupang  ",
  });
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.profile.name, "Aventra Kupang");
    assert.equal(res.profile.whatsappNumber, "6281238989891");
    assert.equal(res.profile.whatsappDisplayIntl, "+62 812-3898-9891");
    assert.equal(res.profile.location, "Jl. El Tari, Kupang");
  }
});

