<template>
  <div class="message-center">
    <!-- 左侧菜单 -->
    <div class="message-sidebar">
      <el-menu
        :default-active="activeTab"
        class="message-menu"
        @select="handleMenuSelect"
      >
        <el-menu-item index="mentions">
          <template #title>
            <span>@我的</span>
          </template>
        </el-menu-item>
        <el-menu-item index="likes">
          <template #title>
            <span>点赞</span>
          </template>
        </el-menu-item>
        <el-menu-item index="replies">
          <template #title>
            <span>回复</span>
          </template>
        </el-menu-item>
        <el-menu-item index="system">
          <template #title>
            <span>系统通知</span>
          </template>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 右侧内容区 -->
    <div class="message-content-area">
      <div class="message-header">
        <h2>消息中心</h2>
      </div>

      <el-loading :visible="loading" fullscreen />
      <div class="message-list" v-if="currentMessages.length > 0">
        <div v-for="(message, index) in currentMessages" :key="index" class="message-item">
          <div class="message-avatar">
            <el-avatar :size="50" :src="message.avatar"></el-avatar>
          </div>
          <div class="message-content">
            <div class="message-info">
              <span class="message-username">{{ message.username }}</span>
              <span class="message-time">{{ message.time }}</span>
            </div>
            <div class="message-text">{{ message.content }}</div>
            <div class="message-source" v-if="message.source" @click="message.videoId && goToVideo(message.videoId)">
              <el-card shadow="hover" class="message-source-card" :class="{ 'clickable': message.videoId }">
                <div class="source-content-wrapper">
                  <div class="source-image" v-if="message.source.cover">
                    <img :src="message.source.cover" alt="视频封面" />
                  </div>
                  <div class="source-text">
                    <div class="source-title">{{ message.source.title }}</div>
                    <div class="source-content" v-if="message.source.content">{{ message.source.content }}</div>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无消息"></el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Bell } from '@element-plus/icons-vue'
import { useTokenStore } from '@/stores/token'
import { useRouter } from 'vue-router'
import { getUserMessageListService } from '@/api/user/usermessage'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const router = useRouter()
const tokenStore = useTokenStore()
const activeTab = ref('likes') // 默认显示点赞消息标签页
const loading = ref(false) // 加载状态

// 检查用户是否登录
const isLogin = ref(!!tokenStore.token)
if (!isLogin.value) {
  // 如果未登录，重定向到首页
  router.push('/')
}

// 模拟数据 - 实际项目中应该从API获取
const mentions = ref([
  {
    id: 1,
    username: '用户A',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    time: '2小时前',
    content: '@你 这个视频真不错！',
    source: {
      title: '如何学习前端开发',
      content: '前端开发是一个不断学习的过程...'
    }
  },
  {
    id: 2,
    username: '用户B',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    time: '昨天',
    content: '@你 能分享一下学习资料吗？',
    source: {
      title: 'Vue.js实战教程',
      content: 'Vue.js是一个流行的前端框架...'
    }
  }
])

const likes = ref([])

const replies = ref([
  {
    id: 1,
    username: '用户D',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    time: '1天前',
    content: '这个教程非常有帮助，谢谢分享！',
    source: {
      title: 'CSS布局技巧',
      content: 'CSS布局是前端开发的重要部分...'
    }
  },
  {
    id: 2,
    username: '用户E',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    time: '2天前',
    content: '我按照教程做了，但遇到了一些问题，能帮我看看吗？',
    source: {
      title: 'Vue组件通信',
      content: 'Vue组件之间的通信方式有多种...'
    }
  }
])

const systemNotices = ref([
  {
    id: 1,
    time: '2023-04-15',
    content: '您的账号已完成实名认证，感谢您的配合。'
  },
  {
    id: 2,
    time: '2023-04-10',
    content: '系统将于4月20日进行维护升级，届时可能会影响部分功能的使用。'
  }
])

// 根据当前选中的标签动态获取消息
const currentMessages = computed(() => {
  switch (activeTab.value) {
    case 'mentions':
      return mentions.value
    case 'likes':
      return likes.value
    case 'replies':
      return replies.value
    case 'system':
      return systemNotices.value
    default:
      return []
  }
})

// 格式化日期
const formatDate = (dateString) => {
  const date = dayjs(dateString)
  const now = dayjs()

  // 如果是今天
  if (date.format('YYYY-MM-DD') === now.format('YYYY-MM-DD')) {
    return date.format('HH:mm')
  }
  // 如果是昨天
  else if (date.format('YYYY-MM-DD') === now.subtract(1, 'day').format('YYYY-MM-DD')) {
    return '昨天 ' + date.format('HH:mm')
  }
  // 如果是今年
  else if (date.format('YYYY') === now.format('YYYY')) {
    return date.format('MM-DD HH:mm')
  }
  // 其他情况
  else {
    return date.format('YYYY-MM-DD HH:mm')
  }
}

// 获取用户视频点赞消息
const getUserMessages = async () => {
  if (!isLogin.value) return

  loading.value = true
  try {
    const res = await getUserMessageListService()
    if (res.code === 200 && res.data) {
      // 处理点赞消息数据
      likes.value = res.data.map(item => ({
        id: item.id,
        username: item.nickname,
        avatar: item.userPic,
        time: formatDate(item.likedAt),
        content: '赞了你的视频',
        videoId: item.videoId,
        source: {
          title: item.title,
          content: '',
          cover: item.cover
        }
      }))
    } else {
      ElMessage.error('获取消息失败：' + res.message)
    }
  } catch (error) {
    console.error('获取消息出错：', error)
    ElMessage.error('获取消息出错，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 跳转到视频详情页
const goToVideo = (videoId) => {
  router.push(`/video/${videoId}`)
}

// 组件挂载时获取消息
onMounted(() => {
  if (isLogin.value) {
    getUserMessages()
  }
})

// 菜单切换事件
const handleMenuSelect = (key) => {
  activeTab.value = key
}
</script>

<style scoped>
.message-center {
  display: flex;
  max-width: 1200px;
  margin: 80px auto 40px;
  padding: 0 20px;
}

.message-sidebar {
  width: 200px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-right: 20px;
}

.message-menu {
  border-right: none;
}

.message-content-area {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.message-header {
  margin-bottom: 24px;
}

.message-header h2 {
  font-size: 24px;
  font-weight: bold;
  color: #18191c;
}

.message-list {
  padding: 20px 0;
}

.message-item {
  display: flex;
  padding: 16px 0;
  border-bottom: 1px solid #f1f2f3;
}

.message-item:last-child {
  border-bottom: none;
}

.message-avatar {
  margin-right: 16px;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
}

.message-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.message-username {
  font-weight: bold;
  color: #18191c;
}

.message-time {
  color: #9499a0;
  font-size: 14px;
}

.message-text {
  margin-bottom: 12px;
  color: #18191c;
  line-height: 1.5;
}

.message-source {
  margin-top: 12px;
}

.message-source-card {
  background-color: #f6f7f8;
  border: none;
}

.source-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #18191c;
}

.source-content {
  color: #61666d;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.source-content-wrapper {
  display: flex;
  align-items: center;
}

.source-image {
  width: 120px;
  height: 70px;
  margin-right: 12px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 4px;
}

.source-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.source-text {
  flex: 1;
  overflow: hidden;
}

.clickable {
  cursor: pointer;
  transition: all 0.3s ease;
}

.clickable:hover {
  background-color: #f0f1f2;
}

.system-message .message-username {
  color: #fb7299;
}

/* 响应式样式 */
@media screen and (max-width: 768px) {
  .message-center {
    flex-direction: column;
  }

  .message-sidebar {
    width: 100%;
    margin-right: 0;
    margin-bottom: 20px;
  }

  .message-content-area {
    width: 100%;
  }
}
</style>