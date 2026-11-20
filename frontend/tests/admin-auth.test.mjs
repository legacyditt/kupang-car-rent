import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_ADMIN_CREDENTIALS,
  validateAdminLogin,
} from "../src/features/admin-auth/utils/admin-auth.ts";

test("validateAdminLogin rejects empty identifier or password", () => {
  assert.equal(validateAdminLogin("", "secret").ok, false);
  assert.equal(
    validateAdminLogin(DEFAULT_ADMIN_CREDENTIALS.email, "").ok,
    false
  );
});

test("validateAdminLogin rejects wrong credentials", () => {
  const res = validateAdminLogin("admin@aventrarental.id", "salah123");
  assert.equal(res.ok, false);
});

test("validateAdminLogin accepts registered email or username with valid password", () => {
  const byEmail = validateAdminLogin(
    "  ADMIN@aventrarental.id ",
    DEFAULT_ADMIN_CREDENTIALS.password
  );
  assert.equal(byEmail.ok, true);
  if (byEmail.ok) {
    assert.equal(byEmail.session.email, DEFAULT_ADMIN_CREDENTIALS.email);
  }

  const byUsername = validateAdminLogin(
    "admin",
    DEFAULT_ADMIN_CREDENTIALS.password
  );
  assert.equal(byUsername.ok, true);
});

