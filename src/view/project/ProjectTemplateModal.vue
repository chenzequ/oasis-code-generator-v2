<template>
    <Modal v-if="props.visible" title="项目模版管理" style="top: 20px" width="700px" :maskClosable="false"
        v-model:visible="visComp" class="project-setting-modal">
        <template #footer>
            <Space>
                <Button @click="doNew">添加新模版</Button>
            </Space>
        </template>
        <table v-if="props.project" class="sim-table">
            <thead>
                <th class="table-drag-cell">
                    <DragOutlined />
                </th>
                <th style="width: 200px">键</th>
                <th style="width: 200px">配置前缀</th>
                <th>生成代码</th>
                <th style="width: 80px">操作</th>
            </thead>
            <draggable v-model="props.project.templates" tag="tbody" item-key="ts" handle=".drag-handle">
                <template #item="{ element, index }">
                    <tr>
                        <!-- 拖动 -->
                        <td>
                            <div class="drag-handle">
                                <DragOutlined />
                            </div>
                        </td>
                        <td>{{ element.name }}</td>
                        <td>
                            <Tag v-for="(prefix, i) in element.keyPrefix?.split('|')" :key="i">
                                {{ prefix }}
                            </Tag>
                        </td>
                        <td>
                            {{
                                    element.template?.length > 20
                                        ? element.template?.substring(0, 20) + '...'
                                        : element.template
                            }}
                        </td>
                        <td>
                            <Space>
                                <Button size="small" @click="doEdit(index)"><template #icon>
                                        <EditOutlined />
                                    </template></Button>
                                <Popconfirm title="确定要删除吗?" placement="topRight" @confirm="doRemove(index)">
                                    <Button danger size="small"><template #icon>
                                            <DeleteOutlined />
                                        </template></Button>
                                </Popconfirm>
                            </Space>
                        </td>
                    </tr>
                </template>
            </draggable>
        </table>
        <ProjectTemplateEditModal v-model:visible="vm.visEditRef" :record="vm.record" @success="onEditSuccess" />
    </Modal>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { Modal, Space, Button, Popconfirm, Tag } from 'ant-design-vue'
import { EditOutlined, DragOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import draggable from 'vuedraggable'
import { EJSTemplate, Project } from '@/typings/meta'
import ProjectTemplateEditModal from './ProjectTemplateEditModal.vue'

const props = defineProps<{
    visible: boolean
    project?: Project
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

const vm = reactive<{
    visEditRef: boolean
    record?: EJSTemplate
    index: number
}>({
    visEditRef: false,
    record: undefined,
    index: -1,
})

const doNew = () => {
    vm.record = undefined
    vm.index = -1
    vm.visEditRef = true
}
const doEdit = (i: number) => {
    vm.record = props.project?.templates?.[i]
    vm.index = i
    vm.visEditRef = true
}
const onEditSuccess = (tpl: EJSTemplate) => {
    if (vm.index !== -1) {
        props.project?.templates?.splice(vm.index, 1, { ...tpl })
    } else {
        props.project?.templates?.push({ ...tpl })
    }
}
const doRemove = (i: number) => {
    props.project?.templates?.splice(i, 1)
}
</script>