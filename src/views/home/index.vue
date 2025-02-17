<template>
    <div>
        <MyTree :data="data" key-field="id" @on-select-nodes="handleSelect" @on-check-change="handleCheck" />
    </div>
</template>

<script setup lang="ts">
import data from '@/components/MyTree/data';
import { ITreeNode, ITreeItem } from '@/components/MyTree/type';
const handleSelect = (nodes: ITreeNode[]) => {};
const handleCheck = (node: ITreeItem, checked: boolean) => {
    console.log(node, checked);
};
</script>
<style scoped lang="scss"></style>
