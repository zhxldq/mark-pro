<template>
    <div>
        <TreeNode
            v-for="node in flattenTree"
            :key="node.key"
            :node="node"
            :is-expanded="computedIsExpanded(node)"
            @toggleExpanded="handleToggleExpand"
        ></TreeNode>
    </div>
</template>

<script setup lang="ts">
import { ITreeProps, ITreeItem, ITreeNode, NodeKey } from './type';
import TreeNode from './TreeNode.vue';
const props = withDefaults(defineProps<ITreeProps>(), {
    keyField: 'key',
    labelField: 'label',
    childrenField: 'children',
    defaultCheckedKeys: () => []
});
const treeData = ref<ITreeNode[]>([]);
const expandedSet = ref(new Set(props.defaultExpandedKeys));

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
    console.log(expandedSet.value, 'expandedSet.value');
}
onMounted(() => {});
</script>
<style scoped lang="scss"></style>
