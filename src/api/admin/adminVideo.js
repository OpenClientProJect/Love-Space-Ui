import request from "@/utils/request";

export const getVideoDraftListService = () => {
    return request({
        url: '/admin/video/getVideoList',
        method: 'get'
    })
}