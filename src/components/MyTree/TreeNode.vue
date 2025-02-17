<template>
    <div
        :class="['node-content', props.isSelect && 'node-content__select']"
        :style="{ paddingLeft: `${props.node.level * 16}px` }"
        @click="handleSelectNode(props.node)"
    >
        <img
            :src="expandIcon"
            :class="['node-icon', props.isExpanded && 'node-icon__expanded', props.node.isLeaf && 'node-icon__leaf']"
            @click="handleToggleExpand(props.node)"
        />
        <div class="node-label">
            <input
                v-if="props.showCheckbox"
                type="checkbox"
                :checked="props.node.isChecked"
                :indeterminate="props.node.isHalfChecked"
                @change="handleCheckChange(props.node)"
            />
            {{ props.node.label }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ITreeNodeProps, ITreeNodeEmit, ITreeNode } from './type';
import expandIcon from '@/assets/expand.svg';
const props = defineProps<ITreeNodeProps>();
const emit = defineEmits<ITreeNodeEmit>();
const handleToggleExpand = (node: ITreeNode) => {
    emit('toggleExpanded', node);
};
const handleSelectNode = (node: ITreeNode) => {
    emit('selectNode', node);
};
const handleCheckChange = (node: ITreeNode) => {
    emit('onCheck', node);
};
onMounted(() => {});
</script>
<style scoped lang="less">
.node-content {
    display: flex;
    align-items: center;
    padding: 5px;
    gap: 5px;
    cursor: pointer;
    &:hover {
        background-color: #f5f7fa;
    }
    .__select {
        background-color: #f5f7fa;
    }
}
.node-icon {
    width: 0.8em;
    height: 0.8em;
}
.node-icon__expanded {
    transform: rotate(90deg);
}
.node-icon__leaf {
    display: none;
}
</style>
