import request from '@/utils/request'

// 获取活动公告列表
export function getActivityListService() {
  return request({
    url: '/admin/activity',
    method: 'get'
  })
}

// 获取活动公告详情
export function getActivityDetailService(id) {
  return request({
    url: `/activity/${id}`,
    method: 'get'
  })
} 