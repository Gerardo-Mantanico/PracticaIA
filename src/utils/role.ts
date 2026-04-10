type RoleLike =
  | string
  | number
  | null
  | undefined
  | {
      id?: number | string;
      name?: string;
      roleId?: number | string;
    };

const ROLE_ID_TO_NAME: Record<number, string> = {
  1: "ADMIN",
  2: "STUDENT",
};

export const getRoleName = (value: RoleLike): string => {
  if (typeof value === "string") {
    return value.trim().toUpperCase();
  }

  if (typeof value === "number") {
    return ROLE_ID_TO_NAME[value] || String(value).toUpperCase();
  }

  if (!value) {
    return "";
  }

  const roleName = value.name?.trim();
  if (roleName) {
    return roleName.toUpperCase();
  }

  const roleId = Number(value.roleId ?? value.id);
  if (!Number.isNaN(roleId) && ROLE_ID_TO_NAME[roleId]) {
    return ROLE_ID_TO_NAME[roleId];
  }

  return "";
};

export const isAdminRole = (value: RoleLike): boolean => getRoleName(value).includes("ADMIN");

export const isStudentRole = (value: RoleLike): boolean => {
  const roleName = getRoleName(value);
  return roleName.includes("STUDENT") || roleName.includes("ESTUDIANTE");
};

export const resolveDashboardPath = (role: RoleLike): string => {
  if (isAdminRole(role)) {
    return "/admin";
  }

  if (isStudentRole(role)) {
    return "/student";
  }

  return "/home";
};