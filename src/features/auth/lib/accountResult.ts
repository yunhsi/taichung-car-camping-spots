export type AccountResultStatus =
  | "login-success"
  | "login-error"
  | "logout-success"
  | "logout-error";

type AccountResultParam = string | string[] | undefined;

interface AccountResultToast {
  title: string;
  description: string;
  variant: "success" | "error";
}

const ACCOUNT_RESULT_STATUSES = new Set<AccountResultStatus>([
  "login-success",
  "login-error",
  "logout-success",
  "logout-error",
]);

export function createAccountResultUrl(status: AccountResultStatus): string {
  return `/auth/result?status=${status}`;
}

export function isAccountResultStatus(
  value: string,
): value is AccountResultStatus {
  return ACCOUNT_RESULT_STATUSES.has(value as AccountResultStatus);
}

function getFirstParamValue(value: AccountResultParam): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function getAccountResultStatus(
  statusParam: AccountResultParam,
  errorParam: AccountResultParam,
): AccountResultStatus | null {
  const status = getFirstParamValue(statusParam);

  if (status && isAccountResultStatus(status)) {
    return status;
  }

  return getFirstParamValue(errorParam) ? "login-error" : null;
}

export function getAccountResultToast(
  status: AccountResultStatus,
): AccountResultToast {
  switch (status) {
    case "login-success":
      return {
        title: "登入成功",
        description: "歡迎回來，現在可以繼續探索景點。",
        variant: "success",
      };
    case "login-error":
      return {
        title: "登入失敗",
        description: "無法完成 Google 登入，請稍後再試。",
        variant: "error",
      };
    case "logout-success":
      return {
        title: "登出成功",
        description: "已安全登出，期待下次再一起探索景點。",
        variant: "success",
      };
    case "logout-error":
      return {
        title: "登出失敗",
        description: "無法完成登出，請稍後再試。",
        variant: "error",
      };
  }
}
