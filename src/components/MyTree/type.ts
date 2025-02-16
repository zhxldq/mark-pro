export type NodeKey = string | number;
// 数据源
export interface ITreeItem {
    key?: NodeKey;
    label?: NodeKey;
    children?: ITreeItem[];
    isLeaf?: boolean;
    isChecked?: boolean;
    isHalfChecked?: boolean;
}
// 组件需要接收的Props
export interface ITreeProps {
    data: ITreeItem[];
    // key、label、children 字段映射
    keyField?: string;
    labelField?: string;
    childrenField?: string;
    // 默认展开节点的key数组
    defaultExpandedKeys?: NodeKey[];
    // 默认勾选节点
    defaultCheckedKeys?: NodeKey[];
    // 是否展示勾选框
    showCheckbox?: boolean;
    // 是否可以选择节点
    selectable?: boolean;
    // 是否支持多选
    multipleSelect?: boolean;
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
export interface IFsTreeEmitter {
    // 点击选择节点事件
    (e: 'onSelectNodes', nodes: ITreeNode[]): void;
    // 勾选节点事件
    (e: 'onCheckChange', node: ITreeItem, checked: boolean): void;
}
// 自定义事件类型
export interface ITreeNodeEmit {
    // 展开自定义事件
    (e: 'toggleExpanded', node: ITreeNode): void;
    // 选中自定义事件
    (e: 'selectNode', node: ITreeNode): void;
    // 勾选自定义事件
    (e: 'onCheck', node: ITreeNode): void;
}
