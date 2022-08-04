<template>
    <Modal v-if="props.visible" title="复制新增" :width="800" style="top: 20px" :maskClosable="false" v-model:visible="visComp" :footer="null"
        class="copy-add-modal">
        <div class="prop-copy-panel">
            <Tree :treeData="props.categoryTree" :selectable="false" defaultExpandAll showLine draggable>
                <template #title="{ title, node }">
                    <div :class="{ 'node-disable': node === props.currentModel }" @click="handleNodeClick(node)">
                        {{ title }}
                    </div>
                </template>
            </Tree>
        </div>
        <div class="prop-copy-panel-content">
            <Card size="small" v-if="vm.selectNode" :title="vm.selectNode.name">
                <template #extra>
                    <Button @click="doCopyProps">复制全部</Button>
                </template>
                <table class="sim-table">
                    <thead>
                        <th style="width:120px">名称</th>
                        <th>标题</th>
                        <th style="width:100px">类型</th>
                        <th style="width:40px">必填</th>
                        <th style="width:50px">复制</th>
                    </thead>
                    <tbody>
                        <tr v-for="(prop, i) in vm.selectNode.properties" :key="i">
                            <td>{{ prop.name }}</td>
                            <td>{{ prop.title }}</td>
                            <td>{{ prop.type }}</td>
                            <td>{{ prop.require ? '√' : '' }}</td>
                            <td>
                                <Button size="small" @click="doCopyProp(i)">
                                    <template #icon>
                                        <CopyOutlined />
                                    </template>
                                </Button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </Card>
            <Empty v-else />
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { computed, UnwrapRef, reactive, watch } from 'vue'
import { Modal, Tree, Card, Button, Empty } from 'ant-design-vue'
import { CopyOutlined } from '@ant-design/icons-vue'
import { Model, Property, TreeChild } from '@/typings/meta'

const props = defineProps<{
    visible: boolean
    categoryTree: UnwrapRef<any>
    currentModel?: Model
}>()

const emit = defineEmits<{
    (e: 'update:visible', val: boolean): void
    (e: 'propsAdd', val: Property[]): void
}>()
const visComp = computed<boolean>({
    get() {
        return props.visible
    },
    set(v) {
        emit('update:visible', v)
    },
})

const vm = reactive<{
    selectNode?: Model
}>({
    selectNode: undefined,
})

watch(
    () => props.visible,
    (v) => {
        if (!v) {
            vm.selectNode = undefined
        }
    }
)
const handleNodeClick = (node: TreeChild) => {
    if (node.isLeaf && node !== props.currentModel && node !== vm.selectNode) {
        vm.selectNode = node as Model
    }
}

const doCopyProps = () => {
    const items = [] as Property[]
    vm.selectNode?.properties.forEach((o) => {
        items.push(Object.assign({}, o))
    })
    emit('propsAdd', items)
}
const doCopyProp = (i: number) => {
    emit('propsAdd', [Object.assign({}, vm.selectNode?.properties[i])])
}
</script>

<style lang="less">
.copy-add-panel {
    display: flex;

    .copy-add-panel-body {
        flex: 1;
    }
}

.node-disable {
    color: #999;
}

.prop-copy-panel {
    display: flex;

    &-tree {
        width: 160px;
    }

    &-content {
        flex: 1;
    }
}
</style>