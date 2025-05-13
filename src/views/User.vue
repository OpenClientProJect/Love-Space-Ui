<template>
  <div class="page-background bg-wave">
  <div class="creator-center ">
    <div v-for="(creatorItem, index) in currentCreators" :key="creatorItem.id" class="creator-info" @click="viewProfile(creatorItem.id)">
      <img :src="creatorItem.userPic" alt="Avatar" class="avatar">
      <div class="info-wrapper">
        <div class="name-bio">
          <h2>{{ creatorItem.nickname }}</h2>
        </div>
        <div class="stats">
          <p>粉丝数: {{ creatorItem.followCount }}</p>
          <p>关注数: {{ creatorItem.fansCount }}</p>
        </div>
      </div>
      <button 
        v-if="!isSelf(creatorItem.id)"
        @click.stop="handleFollow(creatorItem.id, index)" 
        class="follow-button"
        :class="{ 'is-following': isFollowingMap[creatorItem.id] }">
        {{ isFollowingMap[creatorItem.id] ? '已关注' : '关注' }}
      </button>
      <div v-else class="self-label">自己</div>
    </div>
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
    </div>
  </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, reactive} from 'vue';
import { useRouter } from 'vue-router';
import '@/assets/styles/common-bg.css'
import {getUserListService} from "@/api/admin/managementUser";
import {followUserService, getUserFollowService} from '@/api/user/userfollow'
import { useTokenStore } from '@/stores/token'
import useUserInfoStore from '@/stores/userInfo'
import { ElMessage } from 'element-plus'
import eventBus from '@/utils/eventBus'

// 模拟多个创作者数据，使用动漫头像、乙女游戏相关名字和简介
const creators = ref([]);
const isFollowingMap = reactive({});

// 获取用户信息
const userInfoStore = useUserInfoStore();
const currentUserInfo = computed(() => userInfoStore.info);

// 检查是否是当前登录用户自己
const isSelf = (userId) => {
  return userId === currentUserInfo.value.id;
};

// 检查是否登录
const tokenStore = useTokenStore();
const isLogin = computed(() => !!tokenStore.token);

const router = useRouter();
const itemsPerPage = 10;
const currentPage = ref(1);

const totalPages = computed(() => Math.ceil(creators.value.length / itemsPerPage));

const currentCreators = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return creators.value.slice(startIndex, endIndex);
});

const viewProfile = (id) => {
  // 跳转到创作者主页
  router.push({name: 'CreatorProfile', params: {id}});
};

// 检查关注状态
const checkFollowStatus = async () => {
  if (!isLogin.value) return;
  
  try {
    // 获取当前登录用户的关注列表
    const result = await getUserFollowService();
    if (result.data) {
      // 重置关注状态
      creators.value.forEach(creator => {
        isFollowingMap[creator.id] = false;
      });
      
      // 更新关注状态 - 处理新的返回数据格式
      result.data.forEach(follow => {
        if (follow.followUserId) {
          isFollowingMap[follow.followUserId] = true;
        }
      });
    }
  } catch (error) {
    console.error('获取关注状态失败:', error);
  }
};

// 处理关注/取关
const handleFollow = async (userId, index) => {
  if (!isLogin.value) {
    eventBus.emit('showLogin');
    return;
  }
  
  // 不能关注自己
  if (isSelf(userId)) {
    return;
  }
  
  try {
    const currentStatus = isFollowingMap[userId] || false;
    await followUserService(userId, !currentStatus);
    
    // 更新关注状态
    isFollowingMap[userId] = !currentStatus;
    
    // 更新粉丝数
    if (isFollowingMap[userId]) {
      creators.value[index].followCount = (creators.value[index].followCount || 0) + 1;
    } else if (creators.value[index].followCount > 0) {
      creators.value[index].followCount = creators.value[index].followCount - 1;
    }
    
    ElMessage.success(isFollowingMap[userId] ? '关注成功' : '已取消关注');
  } catch (error) {
    console.error('关注操作失败:', error);
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};
//获取创造者信息
const fetchCreatorInfo = async () => {
    const response = await getUserListService();
    creators.value = response.data;
    // 获取完创作者信息后检查关注状态
    await checkFollowStatus();
}
//钩子函数
onMounted(() => {
    fetchCreatorInfo();
});
</script>

<style scoped>
.creator-center {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: flex-start;
  width: 80%;
  margin: 0 auto;
}

.creator-info {
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 300px;
  background-color: #fff;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.creator-info:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-wrapper {
  display: flex;
  flex-grow: 1;
  justify-content: space-between;
}

.name-bio {
  flex-basis: 60%;
}

.name-bio h2 {
  margin: 0 0 8px 0;
  color: #333;
}

.stats {
  flex-basis: 30%;
}

.stats p {
  margin: 5px 0;
  color: #666;
}

.follow-button {
  padding: 8px 16px;
  background-color: #6C679B;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.follow-button:hover {
  background-color: #9E96C5;
}

.follow-button.is-following {
  background-color: #f4f4f4;
  color: #666;
  border: 1px solid #ddd;
}

.follow-button.is-following:hover {
  background-color: #ebebeb;
}

.self-label {
  padding: 8px 16px;
  background-color: #f0f0f0;
  color: #999;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 14px;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination button {
  padding: 8px 16px;
  background-color: #6C679B;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pagination button:hover:not([disabled]) {
  background-color: #9E96C5;
}

.pagination button[disabled] {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination span {
  display: flex;
  align-items: center;
  color: #333;
  font-weight: 500;
}
</style>