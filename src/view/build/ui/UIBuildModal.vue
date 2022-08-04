<template>
    <Modal v-if="props.visible" title="UI 设计 生成" width="100%" id="code-generator-modal" wrap-class-name="full-modal"
        :maskClosable="false" centered v-model:visible="visComp" :footer="null">
        <Tabs>
            <TabPane key="table" tab="表生成器">
                <TableRenderPanel :data="props.model.properties" />
            </TabPane>
            <TabPane key="form" tab="表生成器">
                <FormRenderPanel :data="props.model.properties" />
            </TabPane>
            <!-- <TabPane key="search" tab="搜索条件生成器"></TabPane> -->
        </Tabs>
    </Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Modal, Tabs, TabPane } from 'ant-design-vue'
import { Project, Model } from '@/typings/meta'
import TableRenderPanel from './TableRenderPanel.vue'
import FormRenderPanel from './FormRenderPanel.vue'

const props = defineProps<{
    visible: boolean
    project?: Project
    model?: Model
}>()

const emit = defineEmits<{
    (e: 'update:visible', val: boolean): void
}>()
const visComp = computed<boolean>({
    get() {
        return props.visible
    },
    set(v) {
        emit('update:visible', v)
    },
})
</script>


<style lang="less">
.select-list-group-item {
    border: 1px solid #999;
    border-radius: 4px;
    text-align: center;
    margin: 4px;
    display: flex;
    //   flex-direction: column;
    line-height: 30px;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    color: #000;

    >div:last-child {
        font-size: 9px;
        color: #999;
        // font-weight: bold;
    }
}

.list-group-item {
    border: 1px solid #999;
    border-radius: 4px;
    text-align: center;
    margin: 4px;
    //   height: 32px;
    line-height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    &-title {
        flex: 1;
    }
}

.list-group-item.active {
    line-height: 24px;
    border: 2px solid #1890ff;
}

.target-content {
    background-color: #fff;
    border: 1px solid #c9c9c9;
    padding: 4px;
    box-sizing: border-box;

    >div {
        min-height: 40px;
    }
}

.design-panel {
    width: 100%;
    height: 100%;
    display: flex;

    &-left {
        width: 200px;
        padding: 4px;

        .ant-tabs-left>.ant-tabs-nav .ant-tabs-tab,
        .ant-tabs-right>.ant-tabs-nav .ant-tabs-tab,
        .ant-tabs-left>div>.ant-tabs-nav .ant-tabs-tab,
        .ant-tabs-right>div>.ant-tabs-nav .ant-tabs-tab {
            padding: 8px;
        }

        .ant-tabs-left>.ant-tabs-content-holder>.ant-tabs-content>.ant-tabs-tabpane,
        .ant-tabs-left>div>.ant-tabs-content-holder>.ant-tabs-content>.ant-tabs-tabpane {
            padding-left: 8px;
        }
    }

    &-right {
        width: 360px;
        padding: 4px;

        .ant-descriptions-bordered.ant-descriptions-small .ant-descriptions-item-label,
        .ant-descriptions-bordered.ant-descriptions-small .ant-descriptions-item-content {
            padding: 4px;
        }
    }

    &-right-form {
        width: 240px;
        padding: 4px;

        .ant-descriptions-bordered.ant-descriptions-small .ant-descriptions-item-label,
        .ant-descriptions-bordered.ant-descriptions-small .ant-descriptions-item-content {
            padding: 4px;
        }
    }

    &-content {
        flex: 1;
        padding: 4px;
        background-color: #f3f3f3;
        display: flex;

        >div {
            width: 100%;
        }
    }
}
</style>