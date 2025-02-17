<template>
    <div>
        <TreeNode
            v-for="node in flattenTree"
            :key="node.key"
            :node="node"
            show-checkbox
            :is-expanded="computedIsExpanded(node)"
            :is-select="computedIsSelected(node)"
            @toggleExpanded="handleToggleExpand"
            @select-node="handleSelectNode"
            @on-check="handleCheckNode"
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
const checkedSet = ref(new Set(props.defaultCheckedKeys));
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
            isChecked:
                item.isChecked !== undefined
                    ? item.isChecked
                    : checkedSet.value.has(item[props.keyField])
                      ? true
                      : false,

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

// 构建树节点map，便于后续查找父节点的操作
const treeMap = computed<Map<NodeKey, ITreeNode>>(() => {
    const map = new Map<NodeKey, ITreeNode>();
    dfs(treeData.value);
    function dfs(data: ITreeNode[]) {
        data.forEach((item) => {
            map.set(item.key, item);
            dfs(item.children);
        });
    }
    return map;
});
// 节点勾选事件处理函数
function handleCheckNode(node: ITreeNode) {
    node.isChecked = !node.isChecked;
    node.isHalfChecked = false;
    checkedSet.value[node.isChecked ? 'add' : 'delete'](node.key);
    handleCheckChildren(node, node.isChecked);
    handleCheckParent(node, node.isChecked);
    emit('onCheckChange', toRaw(node.rawNode), node.isChecked);
}
// 递归勾选子节点

function handleCheckChildren(node: ITreeNode, isCheck: boolean) {
    const children = node.children;
    if (children) {
        children.forEach((node) => {
            node.isChecked = isCheck;
            checkedSet.value[node.isChecked ? 'add' : 'delete'](node.key);
            handleCheckChildren(node, isCheck);
        });
    }
}
// 递归勾选父节点
function handleCheckParent(node: ITreeNode, isCheck: boolean) {
    let parentKey = node.parentKey;
    while (parentKey) {
        const parent = treeMap.value.get(parentKey)!;
        const children = parent.children;
        let isAll = true;
        let isHalf = false;

        if (children) {
            children.forEach((node) => {
                if (!node.isChecked) isAll = false;
                if (node.isChecked || node.isHalfChecked) isHalf = true;
            });
        }
        if (isAll) {
            parent.isHalfChecked = false;
            parent.isChecked = isCheck;
            checkedSet.value[isCheck ? 'add' : 'delete'](parent.key);
        } else {
            parent.isChecked = false;
            checkedSet.value.delete(parent.key);
            parent.isHalfChecked = isHalf;
        }
        parentKey = parent.parentKey;
    }
}
onMounted(() => {});
</script>
<style scoped lang="scss"></style>
