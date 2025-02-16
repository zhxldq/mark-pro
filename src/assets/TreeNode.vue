<template>
    <div class="node-content" :style="{ paddingLeft: `${props.node.level * 16}px` }">
        <img :src="expandIcon" :class="['fs-node-icon', props.isExpanded && 'fs-node-icon__expanded']" />
        <div class="node-label">{{ props.node.label }}</div>
    </div>
</template>

<script setup lang="ts">
import { ITreeNodeProps } from './type';
import expandIcon from '@/assets/expand.svg';
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
