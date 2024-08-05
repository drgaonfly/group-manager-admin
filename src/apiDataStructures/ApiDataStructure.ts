export interface Menu {
  _id: string;
  name: string;
  path: string;
  parent: Menu;
  permission: Permission;
}

export interface Role {
  _id: string;
  name: string;
}

export interface PermissionGroup {
  _id: any;
  name: string;
  path: string;
  action: string;
  parent: PermissionGroup;
}

export interface Permission {
  _id: string;
  name: string;
  path: string;
  action: string;
  permissionGroup: PermissionGroup;
}
