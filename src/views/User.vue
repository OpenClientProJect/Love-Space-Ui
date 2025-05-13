<template>
  <div class="page-background bg-wave">
  <div class="creator-center ">
    <div v-for="creatorItem in currentCreators" :key="creatorItem.id" class="creator-info" @click="viewProfile(creatorItem.id)">
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
      <button @click="toggleFollow(creators.value, $event)" class="follow-button">
        {{ isFollowing[creators.value] ? '已关注' : '关注' }}
      </button>
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
import {ref, computed, onMounted} from 'vue';
import { useRouter } from 'vue-router';
import '@/assets/styles/common-bg.css'
import {getUserListService} from "@/api/admin/managementUser";

// 模拟多个创作者数据，使用动漫头像、乙女游戏相关名字和简介
const creators = ref([]);

const isFollowing = ref(creators.value.map(() => false));
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

const toggleFollow = (index, event) => {
  event.stopPropagation();
  isFollowing.value[index] = !isFollowing.value[index];
  if (isFollowing.value[index]) {
    creators.value[index].followerCount++;
  } else {
    creators.value[index].followerCount--;
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
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}

.info-wrapper {
  display: flex;
  flex-grow: 1;
  justify-content: space-between;
}

.name-bio {
  flex-basis: 60%;
}

.stats {
  flex-basis: 30%;
}

.follow-button {
  padding: 8px 16px;
  background-color: #6C679B;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.follow-button:hover {
  background-color: #9E96C5;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}
</style>