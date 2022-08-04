<template>
    <div class="page">
        <div class="page-left">
            <div class="page-left-title">
                <span>代码生成器</span>
                <Button size="small" @click="debug(vm)">
                    <template #icon>
                        <BugOutlined />
                    </template>
                </Button>
            </div>
            <!-- 导入｜新建项目 -->
            <div v-if="!hasProject" class="page-left-project-new">
                <Button type="dashed" @click="doNewProject">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    新增项目
                </Button>
                <Button type="dashed" @click="loadDemo">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    加载案例
                </Button>
                <Upload :multiple="false" :show-upload-list="false" :before-upload="doImportProject">
                    <Button type="dashed">
                        <template #icon>
                            <ImportOutlined />
                        </template>
                        导入项目
                    </Button>
                </Upload>
            </div>
            <!-- 项目快速操作 -->
            <div v-if="hasProject" class="page-left-project">
                <div>
                    <AppstoreAddOutlined />{{ vm.project?.name }}
                </div>
                <Dropdown>
                    <template #overlay>
                        <Menu @click="handleProjectActions">
                            <MenuItem key="edit">
                            <EditOutlined />修改项目..
                            </MenuItem>
                            <MenuItem key="ext">
                            <TagsOutlined />项目扩展..
                            </MenuItem>
                            <MenuItem key="template">
                            <CodeOutlined />代码模版..
                            </MenuItem>
                            <MenuDivider />
                            <MenuItem key="save">
                            <SaveOutlined />保存项目..
                            </MenuItem>
                            <MenuItem key="close">
                            <CloseOutlined /> 关闭项目..
                            </MenuItem>
                        </Menu>
                    </template>
                    <Button size="small" shape="circle">
                        <EllipsisOutlined />
                    </Button>
                </Dropdown>
            </div>
            <!--新增栏-->
            <div v-if="hasProject" class="page-left-add-bar">
                <Button size="small" type="dashed" @click="doNewCategory">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    目录
                </Button>
                <Button size="small" type="dashed" @click="doNewModel">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    模型
                </Button>
            </div>
            <!--目录树-->
            <div v-if="hasProject" class="page-left-tree">
                <Tree v-if="categoryTree && categoryTree.length > 0" :treeData="categoryTree" :selectable="false"
                    @select="handleTreeSelect" showLine draggable defaultExpandAll>
                    <template #title="{ title, isLeaf, node, nodes }">
                        <!--TODO: 需要修改按钮并且移上去就下拉..-->
                        <Dropdown :trigger="['contextmenu', 'hover']">
                            <div :class="{ 'node-active': node === vm.currentModel }" @click="handleNodeClick(node)">
                                {{ title }}
                            </div>
                            <template #overlay>
                                <Menu @click="({ key }) => handleNodeMenuClick(key, node, nodes)">
                                    <MenuItem key="edit">修改..</MenuItem>
                                    <MenuItem key="remove">删除..</MenuItem>
                                    <MenuItem key="new" v-if="!isLeaf">新增模型..</MenuItem>
                                    <MenuItem key="import" v-if="!isLeaf">Java导入..</MenuItem>
                                    <MenuDivider />
                                    <MenuItem key="ext">扩展..</MenuItem>
                                </Menu>
                            </template>
                        </Dropdown>
                    </template>
                </Tree>
                <Empty v-else />
            </div>
        </div>
        <div class="page-content px-2">
            <div v-if="vm.currentModel">
                <PageHeader :title="vm.currentModel.name">
                    <template #tags>
                        <Button size="small" shape="circle" @click="debug(vm.currentModel)">
                            <template #icon>
                                <BugOutlined />
                            </template>
                        </Button>
                    </template>
                    <template #extra>
                        <Space>
                            <DropdownButton @click="handleAddProp">
                                <PlusOutlined />新增属性
                                <template #overlay>
                                    <Menu @click="handlePropMenuClick">
                                        <MenuItem key="copy">
                                        <CopyOutlined /> 复制属性..
                                        </MenuItem>
                                        <MenuItem key="quick">
                                        <PlusOutlined /> 快捷新增..
                                        </MenuItem>
                                        <MenuDivider />
                                        <MenuItem key="import">
                                        <ImportOutlined /> Java导入..
                                        </MenuItem>
                                    </Menu>
                                </template>
                            </DropdownButton>
                            <Button type="dashed" danger @click="handlePropsClear">
                                <template #icon>
                                    <DeleteOutlined />
                                </template>
                                清空
                            </Button>
                            <Button type="primary" @click="handleUIBuild">
                                UI生成..
                            </Button>
                            <Button type="primary" @click="handleCodeBuild">
                                代码生成..
                            </Button>
                        </Space>
                    </template>
                    <Descriptions size="small" :column="3" style="margin-bottom:4px" bordered>
                        <DescriptionsItem label="类名">
                            <Input style="width:100%" v-model:vallue="vm.currentModel.name" />
                        </DescriptionsItem>
                        <DescriptionsItem lable="表名">
                            <Input style="width:100%" v-model:value="vm.currentModel.table" />
                        </DescriptionsItem>
                        <DescriptionsItem lable="描述">
                            <Input style="width:100%" v-model:value="vm.currentModel.desc" />
                        </DescriptionsItem>
                    </Descriptions>
                    <PropPanel v-model="vm.currentModel.properties" />
                </PageHeader>
            </div>
        </div>
        <ProjectModal v-model:visible="visProject" :record="vm.editRecord" @success="onProjectSuccess" />
        <ProjectTemplateModal v-model:visible="visProjectTemplates" :project="vm.project" />
        <ExtModal v-model:visible="vm.visExt" :exts="vm.editExts" />
        <!-- 
        <CategoryModal v-model:visible="visCategory" :children="vm.treeData" :index="vm.editIndex" />
        <ModelModal v-model:visible="visModel" :children="vm.treeData" :index="vm.editIndex" />
        <PropCopyModal v-model:visible="visCopyAddProp" :categoryTree="categoryTree" :currentModel="vm.currentModel"
            @propsAdd="handlePropsCopy" />
        <PropQuickAddModal v-model:visible="visQuickAddProp" @propsAdd="handlePropsCopy" />
       
        <JavaImportModal v-model:visible="visJavaImport" @success="onJavaImportSuccess" />
        <CodeBuildModal v-model:visible="visCodeBuild" :project="vm.project" :model="vm.currentModel" />
        <UIBuildModal v-model:visible="visUIBuild" :project="vm.project" :model="vm.currentModel" /> -->
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { Button, Input, Descriptions, DescriptionsItem, PageHeader, DropdownButton, Empty, Space, Tree, Upload, Dropdown, Menu, MenuItem, MenuDivider } from 'ant-design-vue'
import { BugOutlined, EllipsisOutlined, CopyOutlined, DeleteOutlined, PlusOutlined, EditOutlined, TagsOutlined, CodeOutlined, SaveOutlined, CloseOutlined, ImportOutlined, AppstoreAddOutlined } from '@ant-design/icons-vue'
import { VM } from '@/typings/app'
import { useModel, useProject } from './hooks'
import PropPanel from './property/PropPanel.vue'
import ProjectModal from './project/ProjectModal.vue'
import ProjectTemplateModal from './project/ProjectTemplateModal.vue'
import CategoryModal from './category/CategoryModal.vue'
import ModelModal from './model/ModelModal.vue'
import PropCopyModal from './property/PropCopyModal.vue'
import PropQuickAddModal from './property/PropQuickAddModal.vue'
import ExtModal from './ext/ExtModal.vue'
import JavaImportModal from './import/JavaImportModal.vue'
import CodeBuildModal from './build/code/CodeBuildModal.vue'
import UIBuildModal from './build/ui/UIBuildModal.vue'

const vm = reactive<VM>({
    project: undefined,
    editRecord: undefined,
    editExts: undefined,
    currentModel: undefined,
    treeData: undefined,
    visExt: false
})
const debug = (target: any) => console.log(target)

const loadDemo = () => {
    console.log('加载 demo..')
}

const {
    visProject,
    visProjectTemplates,
    hasProject,
    categoryTree,
    doNewProject,
    doImportProject,
    onProjectSuccess,
    handleProjectActions,
} = useProject(vm)

const {
    visCategory,
    visModel,
    visJavaImport,
    visCopyAddProp,
    visQuickAddProp,
    visCodeBuild,
    visUIBuild,
    doNewCategory,
    doNewModel,
    handleNodeMenuClick,
    handleNodeClick,
    handleTreeSelect,
    onJavaImportSuccess,
    handleAddProp,
    handlePropMenuClick,
    handlePropsClear,
    handleUIBuild,
    handleCodeBuild,
    handlePropsCopy,
} = useModel(vm)
</script>

<style lang="less">
.page {
    display: flex;
    height: 100vh;
    overflow: hidden;

    &-left {
        width: 200px;
        background-color: #efefef;
        display: flex;
        flex-direction: column;

        &-title {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 8px;

            >span {
                font-size: 18px;
                margin-right: 4px;
            }
        }

        &-project-new {
            background-color: #00000011;
            display: flex;
            flex-direction: column;
            justify-items: center;
            align-content: center;
            padding: 8px 16px;
            margin: 0 16px;
            border-radius: 4px;

            button {
                margin: 8px;
            }
        }

        &-project {
            background-color: #00000011;
            height: 36px;
            margin: 0 8px;
            padding: 4px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        &-add-bar {
            display: flex;
            padding: 8px;
            margin: 8px;
            background-color: #00000011;
            justify-content: space-evenly;
        }

        &-tree {
            flex: 1;
            padding: 8px;
            overflow: auto;
        }
    }

    &-content {
        flex: 1;
    }
}

.node-active {
    padding: 0 2px;
    border: 1px solid #1890ff;
    color: #1890ff;
}
</style>