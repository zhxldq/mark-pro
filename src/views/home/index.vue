<template>
    <div>
        <MyTree :data="data" key-field="id" />
    </div>
</template>

<script setup lang="ts">
import data from '@/components/MyTree/data';
</script>
<style scoped lang="scss"></style>
