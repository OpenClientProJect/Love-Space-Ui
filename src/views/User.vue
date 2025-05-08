<template>
  <div class="page-background bg-wave">
  <div class="creator-center ">
    <div v-for="creatorItem in currentCreators" :key="creatorItem.id" class="creator-info" @click="viewProfile(creatorItem.id)">
      <img :src="creatorItem.avatar" alt="Avatar" class="avatar">
      <div class="info-wrapper">
        <div class="name-bio">
          <h2>{{ creatorItem.nickname }}</h2>
          <p>{{ creatorItem.bio }}</p>
        </div>
        <div class="stats">
          <p>粉丝数: {{ creatorItem.followerCount }}</p>
          <p>关注数: {{ creatorItem.followingCount }}</p>
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import '@/assets/styles/common-bg.css'

// 模拟多个创作者数据，使用动漫头像、乙女游戏相关名字和简介
const creators = ref([
  {
    id: 1,
    nickname: '萧逸迷妹',
    avatar: 'https://i.pinimg.com/564x/77/46/64/77466495d83996dc199c2f86c29dc738.jpg',
    bio: '超爱《光与夜之恋》的萧逸，分享他的绝美剧情和心动瞬间！',
    followerCount: 2500,
    followingCount: 800,
    field: '光与夜之恋剧情解说',
    workCount: 120
  },
  {
    id: 2,
    nickname: '许墨分析官',
    avatar: 'https://i.pinimg.com/564x/1a/77/8e/1a778e7386f669f8a296dc1c26c99f85.jpg',
    bio: '深入剖析《恋与制作人》许墨的内心世界，感受他的温柔与智慧！',
    followerCount: 1800,
    followingCount: 600,
    field: '恋与制作人角色分析',
    workCount: 90
  },
  {
    id: 3,
    nickname: '叶瑄安利姬',
    avatar: 'https://i.pinimg.com/564x/19/77/6a/19776a7696c897c89596d7c895c8976a.jpg',
    bio: '疯狂安利《时空中的绘旅人》的叶瑄，带你领略他的魅力与深情！',
    followerCount: 2200,
    followingCount: 700,
    field: '时空中的绘旅人角色安利',
    workCount: 110
  },
  {
    id: 4,
    nickname: '陆沉小甜心',
    avatar: 'https://i.pinimg.com/564x/3d/6a/7b/3d6a7b769a8c7d8b9a7c8d9a7b769a8c.jpg',
    bio: '沉迷《光与夜之恋》陆沉的魅力无法自拔，分享他的点点滴滴！',
    followerCount: 2000,
    followingCount: 750,
    field: '光与夜之恋角色分享',
    workCount: 100
  },
  {
    id: 5,
    nickname: '白起守护者',
    avatar: 'https://i.pinimg.com/564x/4e/7c/8d/4e7c8d769a8c7d8b9a7c8d9a7b769a8c.jpg',
    bio: '永远守护《恋与制作人》的白起，为你展现他的热血与担当！',
    followerCount: 1900,
    followingCount: 650,
    field: '恋与制作人角色守护',
    workCount: 95
  },
  {
    id: 6,
    nickname: '艾因探秘者',
    avatar: 'https://i.pinimg.com/564x/5f/8d/9e/5f8d9e769a8c7d8b9a7c8d9a7b769a8c.jpg',
    bio: '探秘《时空中的绘旅人》艾因的神秘世界，一起揭开他的面纱！',
    followerCount: 2100,
    followingCount: 720,
    field: '时空中的绘旅人角色探秘',
    workCount: 105
  },
  {
    id: 7,
    nickname: '查理苏颜粉',
    avatar: 'https://i.pinimg.com/564x/6a/9e/ab/6a9eab769a8c7d8b9a7c8d9a7b769a8c.jpg',
    bio: '被《光与夜之恋》查理苏的颜值狠狠拿捏，分享他的帅气时刻！',
    followerCount: 2300,
    followingCount: 820,
    field: '光与夜之恋角色颜值分享',
    workCount: 125
  },
  {
    id: 8,
    nickname: '李泽言鉴赏家',
    avatar: 'https://i.pinimg.com/564x/7b/ab/bc/7babbc769a8c7d8b9a7c8d9a7b769a8c.jpg',
    bio: '用心鉴赏《恋与制作人》李泽言的魅力，感受他的成熟稳重！',
    followerCount: 1850,
    followingCount: 620,
    field: '恋与制作人角色鉴赏',
    workCount: 92
  },
  {
    id: 9,
    nickname: '罗夏陪伴者',
    avatar: 'https://i.pinimg.com/564x/8c/bc/cd/8cbccd769a8c7d8b9a7c8d9a7b769a8c.jpg',
    bio: '一直陪伴《时空中的绘旅人》的罗夏，见证他的成长与蜕变！',
    followerCount: 2050,
    followingCount: 730,
    field: '时空中的绘旅人角色陪伴',
    workCount: 102
  },
  {
    id: 10,
    nickname: '齐司礼仰慕者',
    avatar: 'https://i.pinimg.com/564x/9d/cd/de/9dcdde769a8c7d8b9a7c8d9a7b769a8c.jpg',
    bio: '仰慕《光与夜之恋》齐司礼的才华与温柔，分享他的动人之处！',
    followerCount: 2400,
    followingCount: 850,
    field: '光与夜之恋角色仰慕分享',
    workCount: 130
  }
]);

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