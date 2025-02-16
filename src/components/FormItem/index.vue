<template>
    <div class="cat-info-item" :style="getGroupStyle">
        <template v-for="(groupItem, gi) in groupItems">
            <div
                v-for="(item, i) in groupItem"
                :key="`${gi}-${i}`"
                :class="item?.end ? '' : 'item'"
                :style="getItemStyle(item, i === 0)"
            >
                <slot name="label" :item="item">
                    <div class="label text-text-secondary text-12px leading-22px">{{ item.label }}</div>
                </slot>
                <slot name="value" :item="item">
                    <div class="value text-text-primary text-14px leading-22px mt-2px">{{ item.value }}</div>
                </slot>
            </div>
        </template>
    </div>
</template>
<script lang="ts" setup>
import { useCssVar, useWindowSize } from '@vueuse/core';
import { max, sumBy } from 'lodash-es';

interface Item {
    label: string;
    value: string;
    end?: boolean; // 是否换行
}

type ExpandItem = Item & { span?: number };

interface Props {
    items: Item[];
    spanWidth?: number;
}

const { width } = useWindowSize();

const props = withDefaults(defineProps<Props>(), {
    spanWidth: 104
});

const resSpanWidth = ref(props.spanWidth);

const { items } = toRefs(props);

const groupItems = computed(() => {
    let newItems: ExpandItem[][] = [];
    let rowItem: any[] = [];
    items.value.forEach((item) => {
        rowItem.push(item);
        if (item?.end) {
            newItems.push(rowItem);
            rowItem = [];
        }
    });
    return newItems;
});

const getGroupStyle = computed(() => {
    let rowMaxSpans = 0;
    for (const items of groupItems.value) {
        for (const item of items) {
            item.span = max([getItemSpan.value(item.value), getItemSpan.value(item.label)]);
        }
        rowMaxSpans = max([rowMaxSpans, sumBy(items, 'span')])!;
    }
    return {
        gridTemplateColumns: `repeat(${rowMaxSpans}, ${resSpanWidth.value}px)`
    };
});

const getItemStyle = (item: ExpandItem, start: boolean) => {
    return {
        gridColumn: `span ${item.span} / span ${item.span}`,
        gridColumnStart: start ? 1 : 'unset'
    };
};

// 获取文本宽度
const getFontWidth = (font: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const body = document.getElementsByTagName('body')[0];
    const fontFamily = useCssVar('font-family', body).value;
    ctx!.font = `14px ${fontFamily}`;
    const { width }: any = ctx?.measureText(font) || {};
    return width;
};
// 获取子元素宽度
const getItemSpan = computed(() => {
    return (font: string) => {
        const fontWidth = getFontWidth(font);
        return Math.ceil(fontWidth / resSpanWidth.value);
    };
});

watch(
    width,
    (value) => {
        if (value >= 1920) resSpanWidth.value = 208;
        else if (value >= 1440) resSpanWidth.value = 156;
        else resSpanWidth.value = 104;
    },
    { immediate: true }
);
</script>

<style lang="less" scoped>
.cat-info-item {
    display: grid;
    row-gap: 24px;
    column-gap: 8px;

    .item {
        position: relative;
        display: flex;
        flex-direction: column;

        &::after {
            content: '';
            display: block;
            width: 1px;
            height: 36px;
            border-left: 1px dashed #e6e8ee;
            position: absolute;
            top: calc(50% - 18px);
            right: 0;
        }
    }
}
</style>
