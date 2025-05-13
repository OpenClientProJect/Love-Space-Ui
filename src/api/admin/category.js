import request from "@/utils/request";

//获取分类列表
export const getCategoryListService = () => {
  return request.get("/admin/category/getCategoryList");
};

// 添加主分类
export const addMainCategoryService = (categoryName) => {
  return request.post("/admin/category/addMainCategory", { categoryName });
};

// 添加子分类
export const addSubCategoryService = (mainCategoryId, categoryName) => {
  return request.post("/admin/category/addSubCategory", { 
    mainCategoryId, 
    categoryName 
  });
};

// 更新主分类
export const updateMainCategoryService = (categoryId, categoryName) => {
  return request.post("/admin/category/addMainCategory", {
    categoryId,
    categoryName
  });
};

// 更新子分类
export const updateSubCategoryService = (categoryId, categoryName, mainCategoryId) => {
  return request.post("/admin/category/addSubCategory", {
    categoryId,
    categoryName,
    mainCategoryId
  });
};

// 删除主分类
export const deleteMainCategoryService = (categoryId) => {
  return request.delete(`/admin/category/deleteMainCategory?categoryId=${categoryId}`);
};

// 删除子分类
export const deleteSubCategoryService = (categoryId) => {
  return request.delete(`/admin/category/deleteSubCategory?categoryId=${categoryId}`);
};