import request from "@/utils/request";

/**
 * 发布公告
 */
export const publishAnnouncementService = (data) =>{
    return request.post("/announcement",data);
}

/**
 * 获取公告列表
 */
export const getAnnouncementListService = () =>{
    return request.get("/announcement");
}

/**
 * 删除公告
 */
export const deleteAnnouncementService = (id) =>{
    return request.delete(`/announcement/${id}`);
}

/**
 * 更新公告
 */
export const updateAnnouncementService = (id, data) =>{
    return request.put(`/announcement/${id}`, data);
}