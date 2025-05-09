import request from "@/utils/request";

/**
 * 获取草稿列表
 */
export const getVideoDraftListService = () => {
    return request({
        url: '/admin/video/getVideoList',
        method: 'get'
    })
}

/**
 * 审核视频
 * @param {number} id 视频ID
 * @param {boolean} review 审核结果，true为通过，false为拒绝
 */
export const AuditVideo = (id, review) => {
    return request.post(`/admin/video/auditVideo?id=${id}&review=${review}`)
}