<template>
    <div class="design-panel">
        <div class="design-panel-left">
            <Tabs tab-position="left" :style="{ minHeight: '300px' }">
                <TabPane key="property" tab="属性">
                    <draggable :list="vm.props" :group="{ name: 'form', pull: 'clone', put: false }" :clone="propsClone"
                        :sort="false" item-key="name">
                        <template #item="{ element }">
                            <div class="select-list-group-item">
                                <div>{{ element.title }}</div>
                                <div>{{ element.name }}</div>
                            </div>
                        </template>
                    </draggable>
                    <Divider />
                    <Space style="width: 100%" direction="vertical">
                        <Button @click="propsAllClone" style="width: 100%" type="primary">添加全部</Button>
                        <Button @click="clearAll" style="width: 100%" danger>清空</Button>
                    </Space>
                </TabPane>
                <TabPane key="element" tab="组件">
                    <draggable :list="vm.elements" :group="{ name: 'form', pull: 'clone', put: false }"
                        :clone="elementClone" :sort="false" item-key="name">
                        <template #item="{ element }">
                            <div class="select-list-group-item">
                                <div>{{ element.title }}</div>
                                <div>{{ element.name }}</div>
                            </div>
                        </template>
                    </draggable>
                </TabPane>
            </Tabs>
        </div>
        <div class="design-panel-content flex flex-col">
            <div class="p-1">
                <Button type="primary" @click="renderCodeRef = true" :disabled="vm.target.length === 0">代码生成..
                </Button>
            </div>
            <div class="target-content flex-1">
                <draggable :list="vm.target" group="form" item-key="name">
                    <template #item="{ index, element }">
                        <FormGridElement v-if="element.type === 'grid'" :vm="vm" :item="element" @remove-item="
                            (index) => removeRenderItem(element.children, index)
                        " @remove-grid="removeRenderItem(vm.target, index)" @active-item="selectItem" />
                        <FormItemElement v-else :item="element" :active="vm.current === element"
                            @remove-item="removeRenderItem(vm.target, index)" @active-item="selectItem" />
                    </template>
                </draggable>
            </div>
        </div>
        <div class="design-panel-right">
            <div v-if="vm.current">
                <Descriptions size="small" bordered :column="1" title="基础属性">
                    <DescriptionsItem label="绑定">
                        <Input v-model:value="vm.current.name" :disabled="vm.current.type !== 'template'" />
                    </DescriptionsItem>
                    <DescriptionsItem label="标题">
                        <Input v-model:value="vm.current.title" />
                    </DescriptionsItem>
                    <DescriptionsItem label="colspan">
                        <InputNumber v-model:value="vm.current.colspan" min="1" max="4" />
                    </DescriptionsItem>
                    <DescriptionsItem label="必填">
                        <Checkbox v-model:checked="vm.current.require" />
                    </DescriptionsItem>
                    <DescriptionsItem label="类型">
                        <Select style="width: 100%" v-model:value="vm.current.control" @change="onTypeChange">
                            <SelectOption v-for="o in supportTypesComp" :key="o.name" :value="o.name">{{ o.name }}
                            </SelectOption>
                        </Select>
                    </DescriptionsItem>
                </Descriptions>
                <Descriptions size="small" bordered :column="1" title="附加属性" v-if="typeParamsComp">
                    <DescriptionsItem v-for="(o, i) in typeParamsComp" :key="i" :label="o.title">
                        <Input v-if="o.type === 'text'" allowClear v-model:value="vm.current.params[o.key]" />
                        <InputNumber v-else-if="o.type === 'number'" allowClear
                            v-model:value="vm.current.params[o.key]" />
                        <Textarea v-else-if="o.type === 'textarea'" :rows="8" allowClear
                            v-model:value="vm.current.params[o.key]" />
                        <Checkbox v-else-if="o.type === 'boolean'" v-model:checked="vm.current.params[o.key]" />
                        <Select style="width: 100%" v-else-if="o.type === 'enum'" allowClear
                            v-model:value="vm.current.params[o.key]">
                            <SelectOption v-for="opt in o.options.split('|')" :key="opt" :value="opt">
                                {{ opt }}
                            </SelectOption>
                        </Select>
                    </DescriptionsItem>
                </Descriptions>
            </div>
            <Empty v-else />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Property } from '@/typings/meta.js'
import draggable from 'vuedraggable'
import { TabPane, Tabs, message, Button, Divider, Space, Empty, Select, SelectOption, Descriptions, DescriptionsItem } from 'ant-design-vue'
import { useFormDataHook } from './FormDataHook'


const renderCodeRef = ref(false)

const props = defineProps<{
    data: Array<PropertyMeta>
}>()

const {
    vm,
    supportTypesComp,
    typeParamsComp,
    propsClone,
    propsAllClone,
    elementClone,
    elementChange,
    clearAll,
    selectItem,
    removeRenderItem,
    onTypeChange,
} = useFormDataHook(props.data)

const tpl = `<% 
    var cols=1
    data.forEach(o=>{
        if(o.type==='grid'){
            let tmpCols=0
            o.children.forEach(e=>{ tmpCols+=e.colspan })
            if(tmpCols>cols){ cols=tmpCols }
        }
    })

    function renderItem(o,inGrid){
        let props='inTable'
        if(inGrid){
            if(o.colspan && o.colspan>1){
                props+=' colspan="'+o.colspan+'"'
            }
        }else{
            if(cols>1){
                 props+=' colspan="'+cols+'"'
            }
        }
        props+=' label="'+o.title+'"'
        if(o.require){
            props+=' :bindRule="validateInfos.'+o.name+'"'
        }

        let params=''
        for(let p in o.params){
            if(o.params[p]!==undefined && o.params[p]!==null){
                if( typeof(o.params[p]) === 'string' ){
                    params+=' '+p+'="'+o.params[p]+'"'
                }else{
                    params+=' '+p+'='+o.params[p]
                }
            }
        }

        switch(o.control){
            case 'input':
                return '  <FormItemInput '+props+' v-model:value="'+o.name+'"'+params+'/>'
            case 'textarea':
                return '  <FormItemSelect '+props+' v-model:value="'+o.name+'"'+params+'/>'
            case 'number':
                return '  <FormItemInputNumber '+props+' v-model:value="'+o.name+'"'+params+'/>'
            case 'select':
                return '  <FormItemSelect '+props+' v-model:value="'+o.name+'"'+params+'/>'
            case 'checkbox':
                return '  <FormItemCheckbox '+props+' v-model:checked="'+o.name+'"'+params+'/>'
            case 'switch':
                return '  <FormItemSelect '+props+' v-model:value="'+o.name+'"'+params+'/>'
            case 'datetime':
                return '  <FormItemSelect '+props+' v-model:value="'+o.name+'"'+params+'/>'
            case 'upload':
                return '  <FormItemUploadImage props v-model:value="'+o.name+'"'+params+'/>'
            default :
                return '  <FormItemTemplate '+props+'>'+o.params.content+'</FromItemTemplate>'
        }
    }
%><FormTable>
<%for(let i=0;i<data.length;i++){
    const el=data[i]%>  <tr>
    <%if(el.type==='grid'){
        for(let j=0;j<el.children.length;j++){
            const child=el.children[j]%><%-renderItem(child,true)%>
    <%}}else{%><%-renderItem(el)%><%}%>   
  </tr>
<%}%></FormTable>


const  rules=[
    <%for(let i=0;i<data.length;i++){
    const el=data[i]
    if(el.require){%>
         <%=el.name%>: [{ required: true, message: '[<%=el.title%>] 必填' <%-el.control==='select'||el.control==='datetime'?", trigger: 'change'":''%>}],<%}}%>
]`
</script>

<style lang="less">
.list-group-item-layout-title {
    width: 40px;
}
</style> 