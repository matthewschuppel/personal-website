export const AUTH_COOKIE = "personal-os-authenticated";

export function getDashboardPassword() {
  return process.env.DASHBOARD_PASSWORD ?? "change-this-password";
}
