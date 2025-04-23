import request from '@/utils/request'

// 获取活动公告列表
export function getActivityListService() {
  return request({
    url: '/admin/activity',
    method: 'get',
  })
}


// 创建新活动公告
export function createActivityService(data) {
  return request({
    url: '/admin/activity',
    method: 'post',
    data
  })
}

// 更新活动公告
export function updateActivityService(data) {
  return request({
    url: '/admin/activity',
    method: 'put',
    data
  })
}

// 删除活动公告
export function deleteActivityService(activityId) {
  return request({
    url: `/admin/activity?activityId=`+ activityId,
    method: 'delete'
  })
}

// 更改活动公告状态
export function changeActivityStatusService(id, status) {
  return request({
    url: '/admin/activity/status',
    method: 'put',
    data: { id, status }
  })
} 