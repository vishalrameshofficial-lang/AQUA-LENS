export type UserRole =
  | "ADMIN"
  | "USER"
  | "ADMINISTRATOR"
  | "ANALYST"
  | "FIELD_OFFICER"
  | "VIEWER";

export const ROLE_PERMISSIONS: Record<
  UserRole,
  {
    canManageUsers: boolean;
    canConfigureScoring: boolean;
    canImportData: boolean;
    canCreateInterventions: boolean;
    canUpdateInterventions: boolean;
    canSubmitFieldVerification: boolean;
    canRunSimulations: boolean;
    canExportReports: boolean;
    canAccessAdminPortal: boolean;
  }
> = {
  ADMIN: {
    canManageUsers: true,
    canConfigureScoring: true,
    canImportData: true,
    canCreateInterventions: true,
    canUpdateInterventions: true,
    canSubmitFieldVerification: true,
    canRunSimulations: true,
    canExportReports: true,
    canAccessAdminPortal: true,
  },
  ADMINISTRATOR: {
    canManageUsers: true,
    canConfigureScoring: true,
    canImportData: true,
    canCreateInterventions: true,
    canUpdateInterventions: true,
    canSubmitFieldVerification: true,
    canRunSimulations: true,
    canExportReports: true,
    canAccessAdminPortal: true,
  },
  ANALYST: {
    canManageUsers: false,
    canConfigureScoring: false,
    canImportData: true,
    canCreateInterventions: true,
    canUpdateInterventions: true,
    canSubmitFieldVerification: false,
    canRunSimulations: true,
    canExportReports: true,
    canAccessAdminPortal: true,
  },
  FIELD_OFFICER: {
    canManageUsers: false,
    canConfigureScoring: false,
    canImportData: false,
    canCreateInterventions: false,
    canUpdateInterventions: true,
    canSubmitFieldVerification: true,
    canRunSimulations: false,
    canExportReports: false,
    canAccessAdminPortal: true,
  },
  VIEWER: {
    canManageUsers: false,
    canConfigureScoring: false,
    canImportData: false,
    canCreateInterventions: false,
    canUpdateInterventions: false,
    canSubmitFieldVerification: false,
    canRunSimulations: false,
    canExportReports: false,
    canAccessAdminPortal: false,
  },
  USER: {
    canManageUsers: false,
    canConfigureScoring: false,
    canImportData: false,
    canCreateInterventions: false,
    canUpdateInterventions: false,
    canSubmitFieldVerification: false,
    canRunSimulations: false,
    canExportReports: false,
    canAccessAdminPortal: false,
  },
};

export function hasPermission(
  role: UserRole | string,
  permission: keyof typeof ROLE_PERMISSIONS["ADMIN"]
): boolean {
  let activeRole: UserRole = "USER";
  if (role === "ADMIN" || role === "ADMINISTRATOR") activeRole = "ADMIN";
  else if (role in ROLE_PERMISSIONS) activeRole = role as UserRole;
  return !!ROLE_PERMISSIONS[activeRole]?.[permission];
}
