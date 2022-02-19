export enum Permissions {
  None = 0,
  ReadPermissions = 1 << 0,
  WritePermissions = 1 << 1,
  ReadContent = 1 << 2,
  WriteContent = 1 << 3,
  GitClone = 1 << 4,
  Admin = ReadPermissions | WritePermissions | ReadContent | WriteContent | GitClone
}

export const permissionToBitString = (p: Permissions) => {
  const result = p.toString(2);
  return `${"0".repeat(5 - result.length)}${result}`;
};
