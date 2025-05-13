import request from '@/utils/request'

// 用户关注或取消关注接口
export const followUserService = (id, isFollow) => {
  return request.put(`/user/follow/${id}?isFollow=${isFollow}`)
}

// 获取指定用户的关注列表
export const getUserFollowService = (id) => {
  if (id) {
    return request.get(`/user/follow/${id}`)
  } else {
    // 获取当前登录用户的关注列表
    return request.get('/user/follow/list')
  }
}