<template>
  <div class="app">
    <Header />
    <transition name="slide" mode="out-in">
    <router-view></router-view>
    </transition>

  </div>
</template>



<script setup>
import Header from '@/components/Header.vue';
import Calendar from "@/views/Calendar.vue";

</script>

<style>
.app {
  min-height: 100vh;
  background-color: #f6f7f8;
  padding-top: 64px;
}
/* 定义滑动过渡动画的样式 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.8s ease;
}

.slide-enter-from {
  transform: translateX(80%);
}

.slide-leave-to {
  transform: translateX(-80%);
}
html {
  scroll-behavior: smooth;
}

</style> 