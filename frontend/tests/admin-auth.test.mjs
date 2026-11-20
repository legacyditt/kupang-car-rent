import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_ADMIN_CREDENTIALS,
  validateAdminLogin,
  validateAdminRegister,
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

test("validateAdminRegister validates password match/length and allows login with registered account", () => {
  const mismatch = validateAdminRegister(
    "owner@aventra.id",
    "secret123",
    "secret999",
    [DEFAULT_ADMIN_CREDENTIALS]
  );
  assert.equal(mismatch.ok, false);

  const shortPass = validateAdminRegister("owner@aventra.id", "123", "123", [
    DEFAULT_ADMIN_CREDENTIALS,
  ]);
  assert.equal(shortPass.ok, false);

  const registered = validateAdminRegister(
    "owner@aventra.id",
    "kupang2026",
    "kupang2026",
    [DEFAULT_ADMIN_CREDENTIALS]
  );
  assert.equal(registered.ok, true);
  if (registered.ok) {
    const loginRes = validateAdminLogin(
      "owner@aventra.id",
      "kupang2026",
      registered.accounts
    );
    assert.equal(loginRes.ok, true);
  }
});

