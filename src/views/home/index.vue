<template>
    <div>
        <MyTree :data="data" key-field="id" @on-select-nodes="handleSelect" multiple-select />
    </div>
</template>

<script setup lang="ts">
import data from '@/components/MyTree/data';
import { ITreeNode } from '@/components/MyTree/type';
const handleSelect = (nodes: ITreeNode[]) => {
    console.log(nodes, 'kkk');
};
</script>
<style scoped lang="scss"></style>
