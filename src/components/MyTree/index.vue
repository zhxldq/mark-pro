<template>
    <div>
        <TreeNode
            v-for="node in flattenTree"
            :key="node.key"
            :node="node"
            :is-expanded="computedIsExpanded(node)"
            :is-select="computedIsSelected(node)"
            @toggleExpanded="handleToggleExpand"
            @select-node="handleSelectNode"
        ></TreeNode>
    </div>
</template>

<script setup lang="ts">
import { ITreeProps, ITreeItem, ITreeNode, NodeKey, IFsTreeEmitter } from './type';
import TreeNode from './TreeNode.vue';
const props = withDefaults(defineProps<ITreeProps>(), {
    keyField: 'key',
    labelField: 'label',
    childrenField: 'children',
    defaultCheckedKeys: () => [],
    selectable: true,
    multipleSelect: false
});
const emit = defineEmits<IFsTreeEmitter>();
const treeData = ref<ITreeNode[]>([]);
const expandedSet = ref(new Set(props.defaultExpandedKeys));
const slectNodesMap = ref<Map<NodeKey, ITreeNode>>(new Map()); // 存储选中节点的map，key为节点id, value为节点对象
const computedIsSelected = computed(() => (node: ITreeNode) => slectNodesMap.value.has(node.key)); // 是否选中节点的计算属性

const computedIsExpanded = computed(() => (node: ITreeNode) => expandedSet.value.has(node.key));
watch(
    () => props.data,
    (newVal) => {
        treeData.value = formatTreeData(newVal, null);
    },
    {
        immediate: true
    }
);
function formatTreeData(data: ITreeItem[], parent: ITreeNode | null): ITreeNode[] {
    return data.map((item) => {
        const children = item[props.childrenField] || [];
        const treeNode: ITreeNode = {
            key: item[props.keyField],
            label: item[props.labelField],
            children: [],
            level: parent ? parent.level + 1 : 0,
            parentKey: parent ? parent.key : null,
            isChecked: item.isChecked !== undefined ? item.isChecked : false,
            isHalfChecked: item.isHalfChecked !== undefined ? item.isHalfChecked : false,
            isLeaf: item.isLeaf !== undefined ? item.isLeaf : children.length === 0,
            rawNode: item
        };
        if (children.length) treeNode.children = formatTreeData(children, treeNode);
        return treeNode;
    });
}
const flattenTree = computed(() => {
    const res: ITreeNode[] = [];
    function dfs(tree: ITreeNode[]) {
        tree.forEach((node) => {
            res.push(node);
            //if (node.children) dfs(node.children);
            // 当前节点属于展开状态再深度遍历
            if (expandedSet.value.has(node.key)) dfs(node.children);
        });
    }
    dfs(treeData.value);
    return res;
});
function handleToggleExpand(node: ITreeNode) {
    expandedSet.value.has(node.key) ? expandedSet.value.delete(node.key) : expandedSet.value.add(node.key);
}
// 选择节点事件处理函数
function handleSelectNode(node: ITreeNode) {
    if (!props.selectable) return;
    if (slectNodesMap.value.has(node.key)) {
        slectNodesMap.value.delete(node.key);
    } else {
        if (!props.multipleSelect) slectNodesMap.value.clear();
        slectNodesMap.value.set(node.key, node);
    }
    const nodes = [...slectNodesMap.value].map(([_, node]) => toRaw(node));
    console.log(nodes, 'hhh');
    emit('onSelectNodes', nodes);
}
onMounted(() => {});
</script>
<style scoped lang="scss"></style>
