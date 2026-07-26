import assert from "node:assert/strict";
import test from "node:test";

import {
  createAccountResultUrl,
  getAccountResultStatus,
  getAccountResultToast,
  isAccountResultStatus,
} from "@/features/auth/lib/accountResult";

test("帳號操作結果會建立對應的 Toast", () => {
  assert.deepEqual(getAccountResultToast("login-success"), {
    title: "登入成功",
    description: "歡迎回來，現在可以繼續探索景點。",
    variant: "success",
  });
  assert.deepEqual(getAccountResultToast("logout-success"), {
    title: "登出成功",
    description: "已安全登出，期待下次再一起探索景點。",
    variant: "success",
  });
  assert.equal(getAccountResultToast("login-error").variant, "error");
  assert.equal(getAccountResultToast("logout-error").variant, "error");
});

test("只接受已知的帳號操作結果", () => {
  assert.equal(isAccountResultStatus("login-success"), true);
  assert.equal(isAccountResultStatus("logout-success"), true);
  assert.equal(isAccountResultStatus("unknown"), false);
  assert.equal(
    createAccountResultUrl("logout-error"),
    "/auth/result?status=logout-error",
  );
  assert.equal(
    getAccountResultStatus("login-success", undefined),
    "login-success",
  );
  assert.equal(
    getAccountResultStatus(undefined, "Configuration"),
    "login-error",
  );
  assert.equal(getAccountResultStatus("unknown", undefined), null);
});
