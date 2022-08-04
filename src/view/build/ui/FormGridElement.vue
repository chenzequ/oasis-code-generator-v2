<template>
    <div class="grid-panel w-full bg-gray-50">
        <draggable class="dragArea" :list="props.item.children" group="form" item-key="name" ghostClass="child-ghost"
            @change="elementChange">
            <template #item="{ element, index }">
                <Col :span="(24 / totalColsComp) * element.colspan">
                <FormItemElement :active="props.vm.current === element" :item="element"
                    @remove-item="removeElement(index)" @active-item="emit('activeItem', element)" />
                </Col>
            </template>
        </draggable>
        <Button class="grid-remove" danger @click.stop="emit('removeGrid')" type="text" size="small" shape="circle">
            <template #icon>
                <DeleteOutlined />
            </template>
        </Button>
    </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import { message, Button, Col } from 'ant-design-vue'
import { DeleteOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
    item: {}
    vm: {}
}>()
const emit = defineEmits<{
    (e: 'activeItem', val: FormItem): void
    (e: 'removeItem', val: number): void
    (e: 'removeGrid'): void
}>()
const LAYOUT_MAX_ITEM = 4
const elementChange = (target) => {
    if (target.added) {
        if (target.added.element.type === 'layout') {
            message.warn(`目前容器不支持嵌套容器`)
            // 删除最后一个
            props.item.children.splice(target.added.newIndex, 1)
            return
        }
        if (props.item.children.length > LAYOUT_MAX_ITEM) {
            message.warn(`容器当前最多支持${LAYOUT_MAX_ITEM}个`)
            // 删除最后一个
            props.item.children.splice(target.added.newIndex, 1)
            return
        }
    }
}

const totalColsComp = computed(() => {
    let total = 0
    props.item.children.forEach((e) => {
        total += e.colspan
    })
    return total
})
const test = (item) => {
    console.log('click', item)
}
const removeElement = (index: number) => {
    emit('removeItem', index)
}
</script>


<style lang="less">
.grid-panel {
    padding-bottom: 8px;
    padding-top: 4px;
    height: 72px;
    position: relative;

    .grid-remove {
        position: absolute;
        top: -2px;
        left: 0;
    }
}

.dragArea {
    min-height: 60px;
    // outline: 1px dashed;
    display: flex;
}

.child-ghost {
    width: 160px;
    height: 50px;
    display: inline-block;
    background-color: #fff;
    border: 1px solid #999;
}
</style>