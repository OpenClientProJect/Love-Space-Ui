import request from "@/utils/request";

//获取用户列表
export const getUserListService = (data) => {
  return request.get("/admin/managementUser", { params: data });
};

// 更新用户状态
export const updateUserStatusService = (userId) => {
  return request.put(`/admin/managementUser/${userId}`);
};

// 更新用户角色
export const updateUserRoleService = (userId) => {
  return request.put(`/admin/managementUser/role/${userId}`);
};

// 获取用户详情
export const getUserDetailService = (userId) => {
  return request.get(`/admin/managementUser/${userId}`);
};