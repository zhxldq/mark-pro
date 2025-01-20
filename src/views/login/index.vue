<template>
    <div>hello,{{ userStore.$state.username }}</div>
</template>
<script lang="ts" setup>
import { useUserStore } from '@/store/user';
const userStore = useUserStore();
</script>
<style scoped lang="scss"></style>
