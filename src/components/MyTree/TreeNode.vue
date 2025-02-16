<template>
    <div class="node-content" :style="{ paddingLeft: `${props.node.level * 16}px` }">
        <div class="node-label">{{ props.node.label }}</div>
    </div>
</template>

<script setup lang="ts">
import { ITreeNodeProps } from './type';
const props = defineProps<ITreeNodeProps>();
onMounted(() => {});
</script>
<style scoped lang="less">
.node-content {
    display: flex;
    align-items: center;
    padding: 5px;
    gap: 5px;
    cursor: pointer;
}
</style>
