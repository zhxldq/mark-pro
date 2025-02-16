<template>
    <canvas ref="branchLine" class="cat-branch-line"></canvas>
</template>
<script lang="ts">
import { defineComponent, watchEffect, ref, computed } from 'vue-demi';
import { v4 as uuidv4 } from 'uuid';
import { map, omit, reduce, each, ceil, round, findIndex, cloneDeep } from 'lodash-es';
import * as fabric from 'fabric';
import dayjs from 'dayjs';
import { useCssVar, useParentElement, useElementSize, useDebounceFn } from '@vueuse/core';
interface IBranch {
    title: string; // 分支标题
    subTitle: string; // 分支副标题
    top: number;
    m?: boolean; // 是否主分支
}
interface INode {
    p?: 'start' | 'end'; // 时间戳位置 placement，默认居中
    title: string;
    subTitle: string;
    left: number;
    top: number;
}
interface ILine {
    lineLeft: number;
    lineTop: number;
}
interface IArc {
    arcLeft?: number;
    arcTop?: number;
}
export enum NodeStatus {
    start = 0,
    end = 1,
    continue = 2,
    change = 3
}
export enum NodeStatusCN {
    start = '起',
    change = '变',
    continue = '续',
    end = '止'
}

export default defineComponent({
    props: ['list'],
    setup(props) {
        const branchList = computed(() =>
            map(props.list, (it) => {
                const bid = uuidv4().split('-').join('');
                return {
                    ...it,
                    bid,
                    timeline: map(it.timeline, (t) => ({ ...t, bid, tid: uuidv4().split('-').join('') }))
                };
            })
        );
        const timeList = computed(() =>
            reduce(
                branchList.value,
                (r, it) => [...r, ...map(it.timeline, (t) => ({ ...omit(it, 'timeline'), ...t }))],
                [] as any[]
            )
        );
        const branchLine = ref<HTMLCanvasElement | null>(null); // 组件ref
        const cvsInstance = ref<fabric.StaticCanvas | null>(null); // canvas实例
        const branchParent = useParentElement(branchLine);
        const { width: parentWidth } = useElementSize(branchParent);
        // 处理分支标签文字
        const handleText = ({ text = '', width = 0 }: fabric.Text) => {
            if (width > 48) return text.substring(0, ceil((width - 48) / 6)) + '...';
            return text;
        };
        // 绘制分支标签
        const drawBranch = ({ m, title, subTitle, top }: IBranch) => {
            const fill = m ? useCssVar('--color-text-primary').value : useCssVar('--color-text-secondary').value;
            const text = new fabric.Text(title, {
                left: 0,
                top: 0,
                fill,
                fontSize: 12,
                fontFamily: 'PingFang SC'
            });
            const subText = new fabric.Text(subTitle, {
                left: 0,
                top: 16,
                fill,
                fontSize: 10,
                fontFamily: 'PingFang SC'
            });
            text.text = handleText(text);
            subText.text = handleText(subText);
            return new fabric.Group([text, subText], { left: 0, top });
        };
        // 绘制节点
        const drawNode = ({ p, left, top, title, subTitle, isSecondary }: INode & { isSecondary: boolean }) => {
            const fill = isSecondary ? useCssVar('--color-primary-light-7').value : useCssVar('--color-primary').value;
            const circle = new fabric.Circle({
                left: 0,
                top: 0,
                radius: 8,
                fill: useCssVar('--color-primary-light-9').value,
                stroke: fill,
                strokeWidth: 1
            });
            const text = new fabric.Text(title, {
                left: 3,
                top: 2.4,
                fill,
                fontSize: 10,
                fontFamily: 'PingFang SC'
            });
            const place = { left: -17, top: -20 };
            if (p === 'start') place.left = 0;
            if (p === 'end') place.left = -34;
            const subText = new fabric.Text(subTitle, {
                ...place,
                fill: useCssVar('--color-text-secondary').value,
                fontSize: 10,
                fontFamily: 'Roboto'
            });
            return new fabric.Group([circle, text, subText], { left, top });
        };
        // 绘制直线
        const drawLine = ([p1, p2]: Array<ILine & { status: string }>) => {
            const isDash = Number(p1.status) === NodeStatus.change && Number(p2.status) === NodeStatus.end;
            return new fabric.Line([p1.lineLeft, p1.lineTop, p2.lineLeft, p2.lineTop], {
                stroke: isDash ? useCssVar('--color-primary-light-7').value : useCssVar('--color-primary').value,
                strokeWidth: 1,
                strokeDashArray: isDash ? [3, 3] : undefined
            });
        };
        // 绘制弧线
        const drawArc = ([p1, p2]: Array<IArc & { status: string }>) => {
            const isDash = Number(p1.status) === NodeStatus.change && Number(p2.status) === NodeStatus.end;
            const strokeOption = {
                stroke: isDash ? useCssVar('--color-primary-light-7').value : useCssVar('--color-primary').value,
                strokeWidth: 1
            };
            const vertical = new fabric.Line([p1.arcLeft!, p1.arcTop!, p1.arcLeft!, p2.arcTop! - 16], {
                ...strokeOption,
                strokeDashArray: isDash ? [3, 3] : undefined
            });
            const horizontal = new fabric.Line([p1.arcLeft! + 16, p2.arcTop!, p2.arcLeft!, p2.arcTop!], {
                ...strokeOption,
                strokeDashArray: isDash ? [3, 3] : undefined
            });
            const arc = new fabric.Circle({
                ...strokeOption,
                left: p1.arcLeft!,
                top: p2.arcTop! - 36,
                startAngle: Math.PI * -30,
                endAngle: 0,
                radius: 18,
                fill: ''
            });
            arc.rotate(180);
            return new fabric.Group([vertical, horizontal, arc]);
        };
        // 根据时间戳序列计算 Node 位置
        const calcNodePlace = (cvs: fabric.StaticCanvas, branchList: any[], timeList: any[]) => {
            const branchIds = map(branchList, 'bid');
            timeList.sort((a, b) => dayjs(a.time).unix() - dayjs(b.time).unix());
            const cvsWidth = cvs.getWidth() - 80;
            const perNodeLeft = cvsWidth / timeList.length;
            return map(timeList, (it, i) => {
                let p;
                if (i === 0) p = 'start';
                if (i === timeList.length - 1) p = 'end';
                each(branchList, ({ timeline }) => {
                    const nodeI = findIndex(timeline, ['tid', it.tid]);
                    if (nodeI < 1) return;
                    it.isSecondary =
                        timeline[nodeI].status === NodeStatus.end && timeline[nodeI - 1].status === NodeStatus.change;
                });
                return {
                    ...it,
                    p,
                    title: (NodeStatusCN as any)[NodeStatus[it.status]],
                    subTitle: it.time,
                    left: round(perNodeLeft * i, 3) + 70,
                    top: findIndex(branchIds, (id) => id === it.bid) * 50
                };
            });
        };
        // 计算 Line 或 Arc 坐标
        const calcLineOrArcPoint = (branchList: any[], nodeList: any[]) => {
            const lineList: any[] = [];
            const arcList: any[] = [];
            each(branchList, (b, i) => {
                each(b.timeline, (t, ti: number) => {
                    // 直线
                    if (ti === 0) return;
                    const prevNodeI = findIndex(nodeList, ['tid', b.timeline[ti - 1].tid]);
                    const nodeI = findIndex(nodeList, ['tid', t.tid]);
                    if (prevNodeI === -1 || nodeI === -1) return;
                    const node = cloneDeep(nodeList[nodeI]);
                    const prevNode = cloneDeep(nodeList[prevNodeI]);
                    prevNode.lineLeft = prevNode.left + 34 + (prevNodeI === 0 ? -18 : 0);
                    node.lineLeft = node.left + 18 + (nodeI === nodeList.length - 1 ? 16 : 0);
                    prevNode.lineTop = prevNode.top + 27.5;
                    node.lineTop = prevNode.top + 27.5;
                    lineList.push([prevNode, node]);
                    // 曲线
                    const nextLineFirstNodeI = findIndex(nodeList, ['tid', branchList[i + 1]?.timeline[0]?.tid]);
                    if (nextLineFirstNodeI === -1 || prevNode.status !== NodeStatus.change) return;
                    const nextNode = cloneDeep(nodeList[nextLineFirstNodeI]);
                    prevNode.arcLeft = prevNode.lineLeft - 9;
                    prevNode.arcTop = prevNode.lineTop + 9;
                    nextNode.arcLeft = nextNode.left + 18 + (nextLineFirstNodeI === nodeList.length - 1 ? 16 : 0);
                    nextNode.arcTop = nextNode.top + 27.5;
                    arcList.push([prevNode, nextNode]);
                });
            });
            return { lineList, arcList };
        };
        // 设置 canvas 宽度
        const setWidth = useDebounceFn(
            (w) => {
                if (!cvsInstance.value) return;
                cvsInstance.value?.setWidth(w);
            },
            200,
            { maxWait: 1000 }
        );
        // canvas初始化
        watchEffect((onCleanup) => {
            if (!branchLine.value) return;
            if (!parentWidth.value) return;
            const cvs = new fabric.StaticCanvas(branchLine.value, {
                width: parentWidth.value,
                height: branchList.value.length * 50
            });
            const nodeList = calcNodePlace(cvs, branchList.value, timeList.value);
            each(nodeList, (it) => {
                const node = drawNode(it);
                cvs.add(node);
            });
            const { lineList, arcList } = calcLineOrArcPoint(branchList.value, nodeList);
            each(lineList, (p) => {
                const line = drawLine([p[0], p[1]]);
                cvs.add(line);
            });
            each(arcList, (p) => {
                const arc = drawArc([p[0], p[1]]);
                cvs.add(arc);
            });
            each(branchList.value, (it, i) => {
                const branch = drawBranch({
                    title: it.label,
                    subTitle: it.id,
                    top: 15 + i * 50,
                    m: i === branchList.value.length - 1
                });
                cvs.add(branch);
            });
            onCleanup(() => {
                cvsInstance.value?.dispose();
                cvsInstance.value = null;
            });
            cvsInstance.value = cvs;
        });
        // 监听元素大小变化
        watch(parentWidth, (val) => setWidth(val));
        return { branchLine };
    }
});
</script>
