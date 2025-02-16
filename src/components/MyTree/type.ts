export type NodeKey = string | number;
// 数据源
export interface ITreeItem {
    key?: NodeKey;
    label?: NodeKey;
    children?: ITreeItem[];
    isLeaf?: boolean;
    isChecked?: boolean;
    isHalfChecked?: boolean;
    // 默认展开节点的key数组
    defaultExpandedKeys?: NodeKey[];
}
// 组件需要接收的Props
export interface ITreeProps {
    data: ITreeItem[];
    // key、label、children 字段映射
    keyField?: string;
    labelField?: string;
    childrenField?: string;
}
// 组件内部使用的节点数据结构
export interface ITreeNode extends Required<ITreeItem> {
    level: number;
    parentKey: NodeKey | null;
    children: ITreeNode[];
    rawNode: ITreeItem;
}
// 树节点组件的Props
export interface ITreeNodeProps {
    node: ITreeNode;
    // 是否展示勾选
    showCheckbox: boolean;
    // 是否展开
    isExpanded: boolean;
    // 是否选中
    isSelect: boolean;
}
