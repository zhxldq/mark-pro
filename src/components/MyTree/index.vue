<template>
    <div>
        <TreeNode v-for="i in flattenTree" :key="i.key" :node="i"></TreeNode>
    </div>
</template>

<script setup lang="ts">
import { ITreeProps, ITreeItem, ITreeNode, NodeKey } from './type';
import TreeNode from './TreeNode.vue';
const props = withDefaults(defineProps<ITreeProps>(), {
    keyField: 'key',
    labelField: 'label',
    childrenField: 'children'
});
const treeData = ref<ITreeNode[]>([]);
watch(
    () => props.data,
    (newVal) => {
        treeData.value = formatTreeData(newVal, null);
        console.log('data---', treeData.value);
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
            if (node.children) dfs(node.children);
        });
    }
    dfs(treeData.value);
    return res;
});
onMounted(() => {
    console.log('flattenTree---', flattenTree.value);
});
</script>
<style scoped lang="scss"></style>
