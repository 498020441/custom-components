<template>
  <div class="custom-select-wrapper" ref="custom_select">
    <span class="label" :style="{ width: labelWidth + 'px' }" ref="label_ref">{{ label }}</span>
    <div class="tag-wrapper" v-show="showTag" ref="tag_block_ref">
      <div class="content" ref="tag_content">
        <span v-if="cascader">已选择{{ selecedNodeNum() }}个{{ unit || '' }}</span>
        <template v-else>
          <span v-if="cachedCheckGroup.length === 1">{{ cachedCheckGroup[0] }}</span>
          <span v-else-if="cachedCheckGroup.length < optionsCopy.length"
            >已选择{{ cachedCheckGroup.length }}个{{ unit || '' }}</span
          >
          <span v-else>全部{{ cachedCheckGroup.length }}个{{ unit || '' }}</span>
        </template>
      </div>
      <Icon type="sz-icon-close" class="icon" @click.native="clearOptions" ref="clear_icon" />
    </div>
    <div :class="['custom-select', focus ? 'active' : '']" ref="select_ref">
      <Input
        ref="input_ref"
        :placeholder="placeholderContent"
        v-model="query"
        :icon="caretIcon"
        :border="false"
        :class="['custom-input', focus ? 'rotate' : '']"
        :readonly="!filterable"
        @on-focus="handles('focus')"
        @on-change="debounceSearch"
        @on-enter="debounceSearch"
      ></Input>
      <div class="options-block" ref="options_block_ref">
        <div class="checkgroup-wrapper" ref="checkgroup_box_ref">
          <Loading v-show="searchLoading"></Loading>
          <div v-show="queryEmpty" class="empty-tip">
            <Icon type="sz-icon-error-circle" style="margin-right: 6px;" />暂无相关数据
          </div>
          <CheckboxGroup
            v-model="checkAllGroup"
            @on-change="checkAllGroupChange"
            v-if="mode === 'multiple' && !cascader"
          >
            <Checkbox
              v-for="(item, index) in optionList"
              :label="item.label"
              :key="'label_' + index"
            ></Checkbox>
          </CheckboxGroup>
          <div v-else-if="cascader" class="cascader-wrapper">
            <div class="cascader-first-cls">
              <CascaderNode
                v-for="(item, index) in optionList"
                :key="item.value + '_' + index + '_' + updateKey"
                :nodeItem="item"
                :query="query"
                :expanded="curActived === item.value"
                @selectNode="handleSelectNode"
                @hoverNode="handleHoverNode"
              ></CascaderNode>
            </div>
            <div
              :class="['cascader-second-cls', showCascaderSecondCls ? 'show' : '']"
              ref="children_nodes_ref"
              v-if="showCascaderSecondCls"
            >
              <CascaderNode
                v-for="(item, index) in activedChildrenList"
                :key="item.value + '_' + index + '_' + updateKey"
                :query="query"
                :nodeItem="item"
                @selectNode="handleSelectNode"
              ></CascaderNode>
            </div>
          </div>
          <div v-else class="select-wrapper">
            <div
              v-for="(item, index) in optionList"
              :key="'option_' + index"
              class="select-option"
              @click="handleSelect(item)"
            >
              {{ item.label }}
            </div>
          </div>
        </div>
        <div class="select-all-block" v-if="mode === 'multiple'">
          <Checkbox
            v-model="checkAll"
            :indeterminate="indeterminate"
            @on-change="handleCheckAll"
            :key="updateCheckAll"
            :disabled="optionList.length === 0 || defaultValue.length > 0"
          >
            <span v-if="checkAllGroup.length === 0 || checkAllGroup.length === optionsCopy.length"
              >全选</span
            >
            <span v-else>
              已选
              <span class="num">{{ checkAllGroup.length }}</span
              >项
            </span>
          </Checkbox>
          <Button
            type="primary"
            size="small"
            class="btn"
            @click="confirm"
            ref="confirm_btn"
            :disabled="btnDisabled"
            >确定</Button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CascaderNode from './cascaderNode.vue';
import { cloneDeep } from 'lodash';

export default {
  name: 'CustomSelect',
  components: { CascaderNode },
  props: {
    // 标签内容
    label: String,
    //标签宽度
    labelWidth: { type: [String, Number] },
    // v-model绑定的值
    value: { type: [Array, Object, String, Number] },
    // 下拉列表数据
    options: Array,
    // 文体占位提示
    placeholder: String,
    // 选中内容的后缀/单位  （条线/地区...）
    unit: String,
    // 是否多选
    multiple: { type: Boolean, default: false },
    // 下拉框内容位级联组件
    cascader: { type: Boolean, default: false },
    // 下拉内容模糊搜索
    filterable: { type: Boolean, default: false },
    // 默认值
    defaultValue: { type: Array, default: () => [] },
    // 返回options列表对象的id
    getId: { type: Boolean, default: true },
  },
  data() {
    return {
      // 储存上一次提交的选项列表
      preOptions: null,
      // 对options参数的深拷贝
      optionsCopy: null,
      // 聚焦状态
      focus: false,
      // 全选框半选中状态
      indeterminate: false,
      // 全选框全新状态
      checkAll: false,
      // 多选模式下 选中的元素列表
      checkAllGroup: [],
      // 缓存的 选中的元素列表
      cachedCheckGroup: [],
      timer: null,
      // 模糊搜索的文本值
      query: '',
      // 搜索加载状态
      searchLoading: false,
      // 搜索结果过滤的 元素列表
      filteredOptions: [],
      // 搜索结果位空
      queryEmpty: false,
      // 用于控制刷新整个组件
      updateKey: 0,
      // 用于控制刷新全选框的状态
      updateCheckAll: 0,
      // 下拉框样式集合
      optionsBlockStyles: {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        maxWidth: 0,
        maxHeight: '236px',
      },
      checkGroupStyles: {
        width: 0,
        height: 0,
        minHeight: 0,
      },
      // 级联模式下，储存二级列表
      activedChildrenList: [],
      curActived: null,
      // 下拉级联模式，使用的对象存储选择的数据结构
      cachedCascaderCheck: {},
      cascaderCheck: {},
    };
  },
  watch: {
    value(newVal) {
      if (newVal) {
        const emptyValue = this.cascader ? !Object.keys(newVal).length : !newVal.length;
        // 监听双向绑定的值，值为空时，清空相关状态
        if (emptyValue) {
          this.checkAll = false;
          this.indeterminate = false;
          this.checkAllGroup = [];
          this.cachedCheckGroup = [];
          this.query = '';
          this.filteredOptions = [];
          this.queryEmpty = '';
          this.cascaderCheck = {};
          this.cachedCascaderCheck = {};
        }
      }
    },
    options: {
      deep: true,
      immediate: true,
      handler(val) {
        this.optionsCopy = cloneDeep(val);
        this.initCascaderData(this.optionsCopy, this.buildPath);
        if (this.optionsCopy.length && this.defaultValue.length && this.cascader) {
          this.defaultValue.forEach((val) => {
            this.optionsCopy.forEach((node) => {
              if (node.value.substr(0, 4) === val) {
                node.path = [node.value];
                node.status = 'checked';
                this.handleSelectNode(node);
              }
            });
          });
          this.confirm();
        }
      },
    },
  },
  computed: {
    placeholderContent() {
      return this.cachedCheckGroup.length || Object.keys(this.cachedCascaderCheck).length
        ? ''
        : this.placeholder;
    },
    showTag() {
      return this.cachedCheckGroup.length || Object.keys(this.cachedCascaderCheck).length;
    },
    showCascaderSecondCls() {
      return this.activedChildrenList.length && !this.searchLoading && !this.queryEmpty;
    },
    btnDisabled() {
      let isDisabled = true;
      const _keysLen = Object.keys(this.cascaderCheck).length;
      const _keysLen1 = Object.keys(this.cachedCascaderCheck).length;
      if (this.cascader) {
        isDisabled = _keysLen > 0 || _keysLen1 > 0 ? false : !this.checkAll && !this.indeterminate;
      } else {
        if (this.cachedCheckGroup.length || this.checkAllGroup.length) {
          isDisabled = false;
        }
      }
      return isDisabled;
    },
    optionList() {
      if (this.query) {
        return this.filteredOptions;
      }
      return this.optionsCopy || [];
    },
    caretIcon() {
      if (this.optionsCopy?.length > 0) {
        return 'sz-icon-caret-down';
      }
      return '';
    },
    mode() {
      if (this.multiple) {
        return 'multiple';
      }
      return 'single';
    },
  },
  created() {
    window.addEventListener('click', this.listenClick);
  },
  mounted() {
    // 设置选项div的定位,宽度
    if (this.$refs.options_block_ref) {
      this.optionsBlockStyles.top = `${this.$refs.select_ref.clientHeight + 10}px`;
      this.optionsBlockStyles.left = `${this.$refs.label_ref.clientWidth + 8}px`;
      this.optionsBlockStyles.height = `${this.optionsCopy.length > 5 ? '236px' : 'fit-content'}`;
      this.optionsBlockStyles.width =
        this.cascader || this.$refs.select_ref.clientWidth > 180
          ? `${this.$refs.select_ref.clientWidth}px`
          : '180px';
      this.$refs.options_block_ref.style.top = this.optionsBlockStyles.top;
      this.$refs.options_block_ref.style.left = this.optionsBlockStyles.left;
      this.$refs.options_block_ref.style.minWidth = this.optionsBlockStyles.width;
      // this.$refs.options_block_ref.style.maxWidth = this.optionsBlockStyles.maxWidth;
    }
    // 设置tag div 位置
    if (this.$refs.tag_block_ref) {
      this.$refs.tag_block_ref.style.left = `${this.$refs.label_ref.clientWidth + 16}px`;
      this.$refs.tag_content.style.maxWidth = `${this.$refs.input_ref.$el.clientWidth * 0.41}px`;
    }
    if (this.$refs.checkgroup_box_ref) {
      if (this.mode === 'single') {
        this.$refs.checkgroup_box_ref.style.height = '100%';
      } else if (this.optionsCopy.length > 5) {
        this.$refs.checkgroup_box_ref.style.height = '196px';
      } else {
        this.$refs.checkgroup_box_ref.style.height = 'auto';
        this.$refs.checkgroup_box_ref.style.minHeight = '50px';
      }
      this.checkGroupStyles.height = this.$refs.checkgroup_box_ref.style.height;
      this.checkGroupStyles.minHeight = this.$refs.checkgroup_box_ref.style.minHeight;
    }
  },
  updated() {
    if (this.showTag) {
      this.$refs.input_ref.$el.style.paddingLeft = `${this.$refs.tag_block_ref.clientWidth + 6}px`;
    } else {
      this.$refs.input_ref.$el.style.paddingLeft = '0px';
    }
  },
  destroyed() {
    window.removeEventListener('click', this.listenClick);
  },
  methods: {
    listenClick(evt) {
      const path = evt.path || (evt.composedPath && evt.composedPath());
      if (!path.includes(this.$refs.custom_select) || path.includes(this.$refs.clear_icon?.$el)) {
        // 点击空白区域 or 点击标签清空按钮
        this.handles('blur');
      } else if (path.includes(this.$refs.confirm_btn?.$el) && !this.btnDisabled) {
        // 点击确认按钮
        this.handles('confirm');
      } else {
        // 点击label, input , select options
        this.handles('focus');
      }
    },
    buildPath(parentNode, children) {
      // 给下级元素新增path(从根元素到当前层级所有的value值）方便追溯
      children.forEach((child) => {
        child.parent = { value: parentNode.value, label: parentNode.label };
        if (parentNode?.path?.length) {
          child.path = [...parentNode.path, child.value];
        } else {
          child.path = [parentNode.value, child.value];
        }
      });
    },
    initCascaderData(arr, fn) {
      arr.forEach((node) => {
        if (this.defaultValue?.length) {
          if (this.defaultValue.includes(node.value.substr(0, 4))) {
            node.status = 'unchecked';
          } else {
            node.status = 'disabled';
          }
        } else {
          node.status = 'unchecked';
        }
        if (node?.children?.length) {
          fn(node, node.children);
          this.initCascaderData(node.children, fn);
        }
      });
    },
    traverseTree(arr, fn = () => {}, fn1 = () => {}) {
      arr.forEach((node) => {
        fn1(node);
        if (node?.children?.length) {
          this.traverseTree(node?.children, fn, fn1);
        } else {
          fn(node);
        }
      });
    },
    pushAllValue(node) {
      const { path = null } = node;
      if (path) {
        if (this.cascaderCheck[path[0]]) {
          // 不存入重复的
          if (this.cascaderCheck[path[0]].indexOf(path[1]) === -1) {
            this.cascaderCheck[path[0]].push(path[1]);
          }
        } else {
          this.cascaderCheck[path[0]] = [path[1]];
        }
      } else {
        this.cascaderCheck[node.value] = [];
      }
    },
    handleSelectNode(item) {
      // 选择级联的node时，更新相应node.checked、父/子node.checked; 将选中/取消的node.value存入cascaderCheck中暂存
      const hasChildren = item?.children?.length > 0; // 一级node
      const parentValue = item.path[0]; // 当前二级node的父级value
      // 选中checkbox
      if (item?.status === 'checked') {
        // 当前选中 存在下一层级时， 下一层及全部选中
        if (hasChildren) {
          this.traverseTree(item.children, this.pushAllValue, (node) => {
            node.status = 'checked';
          });
        } else {
          // 当前层级无子级
          const _list = this.cascaderCheck[parentValue] || [];
          if (!_list.length || _list.indexOf(item.value) === -1) {
            this.cascaderCheck[parentValue] = [..._list, item.value];
          }
        }
      }
      // 取消选中checkbox
      else {
        if (hasChildren) {
          //当前选中 存在下一层级时， 下一层及全部取消
          delete this.cascaderCheck[parentValue];
          this.traverseTree(
            item.children,
            () => {},
            (node) => {
              node.status = 'unchecked';
            },
          );
        } else {
          this.cascaderCheck[parentValue] = this.cascaderCheck[parentValue].filter(
            (element) => element !== item.value,
          );
          if (this.cascaderCheck[parentValue]?.length === 0) {
            delete this.cascaderCheck[parentValue];
          }
        }
      }

      // 被筛选出的选项 在点击全选时，只在此范围全部选中
      if (this.query && this.filteredOptions.length) {
        this.traverseTree(
          this.filteredOptions,
          () => {},
          (node) => {
            // 同步options中相应值
            if (item.value === node.value) {
              node.status = item.status;
            }
            // 一级元素
            if (node.value === parentValue) {
              this.setParentStatus(node, parentValue);
            }
          },
        );
      } else {
        // 为子项时，子项全部选中，父项选中；子项部分选中时，父项interminate状态
        this.traverseTree(
          this.optionsCopy,
          () => {},
          (node) => {
            // 同步options中相应值
            if (item.value === node.value) {
              node.status = item.status;
            }
            // 一级元素
            if (node.value === parentValue) {
              this.setParentStatus(node, parentValue);
            }
          },
        );
      }
      this.updateCheckAllStatus();
      // 强制更新
      this.cascaderCheck = Object.assign({}, this.cascaderCheck);
      this.updateKey += 1;
    },
    selecedNodeNum() {
      let num = 0;
      Object.keys(this.cachedCascaderCheck).forEach((key) => {
        if (key === this.cachedCascaderCheck[key][0]) {
          num += 1;
        } else {
          num += this.cachedCascaderCheck[key].length;
        }
      });
      return num;
    },
    setParentStatus(node, parentValue) {
      // 一级元素
      const selectedChildrenNum = this.cascaderCheck[parentValue]?.length || 0;
      if (selectedChildrenNum === 0) {
        node.status = 'unchecked';
      } else {
        node.status = !node?.children?.length
          ? 'checked'
          : selectedChildrenNum === node?.children?.length
            ? 'checked'
            : 'indeterminate';
        // 当父级node有一个是indeterminate时, 全选框的状态即为indeterminate
        this.indeterminate = node.status === 'indeterminate';
      }
    },
    updateCheckAllStatus() {
      // 更新 全选框的状态
      let _parentCheckNum = 0;
      let _parentInderterminateNum = 0;
      this.optionsCopy.forEach((node) => {
        if (node.status === 'checked') {
          _parentCheckNum += 1;
        } else if (node.status === 'indeterminate') {
          _parentInderterminateNum += 1;
        }
      });
      this.checkAll = _parentCheckNum > 0 && _parentCheckNum === this.optionsCopy.length;
      if (_parentInderterminateNum === 0 && _parentCheckNum === 0) {
        this.indeterminate = false;
      } else {
        this.indeterminate = !this.checkAll;
      }
    },
    handleHoverNode(item) {
      this.curActived = item.value;
      this.activedChildrenList = item.children || [];
    },
    handleCheckAll() {
      const arr =
        this.query && this.filteredOptions.length ? this.filteredOptions : this.optionsCopy;
      if (this.indeterminate) {
        this.checkAll = false;
        this.indeterminate = false;
        this.updateCheckAll += 1;
      }
      if (this.cascader) {
        if (this.checkAll) {
          this.traverseTree(arr, this.pushAllValue, (node) => (node.status = 'checked'));
        } else {
          this.traverseTree(
            arr,
            () => {},
            (node) => (node.status = 'unchecked'),
          );
          this.cascaderCheck = {};
        }
        // this.updateCheckAllStatus();
        this.updateKey += 1;
      } else {
        if (this.checkAll) {
          arr.forEach((item) => {
            this.checkAllGroup.push(item.label);
          });
        } else {
          this.checkAllGroup = [];
        }
      }
    },
    checkAllGroupChange(checkList) {
      if (checkList.length && checkList.length === this.optionsCopy.length) {
        this.indeterminate = false;
        this.checkAll = true;
      } else if (!checkList.length) {
        this.checkAll = false;
        this.indeterminate = false;
      } else {
        this.indeterminate = true;
        this.checkAll = false;
      }
    },
    handles(type) {
      switch (type) {
      case 'focus':
        this.focus = true;
        this.showOptionsBlock(true);
        break;
      case 'blur':
        this.reset();
        this.showOptionsBlock(false);
        break;
      case 'confirm':
        this.focus = false;
        this.showOptionsBlock(false);
        break;
      default:
        break;
      }
    },
    showOptionsBlock(show) {
      if (this.$refs.options_block_ref) {
        if (show) {
          this.$refs.options_block_ref.style.height = this.optionsBlockStyles.height;
          this.$refs.checkgroup_box_ref.style.height = this.checkGroupStyles.height;
        } else {
          if (this.cascader) {
            this.filteredOptions = [];
            this.search();
          }
        }
      }
      if (this.cascader) {
        this.updateCheckAllStatus();
        this.updateKey += 1;
      }
      setTimeout(() => {
        if (this.$refs.options_block_ref) {
          this.$refs.options_block_ref.style.maxHeight = show
            ? this.optionsBlockStyles.maxHeight
            : '0';
        }
      }, 100);
    },
    findDuplicate(arr, item) {
      let res = false;
      arr.forEach((_item) => {
        if (this.cascader) {
          res = _item.value === item.value && _item.label === item.label;
        } else {
          res = _item?.id === item?.id && _item.label === item.label;
        }
      });
      return res;
    },
    debounceSearch(param) {
      // 防抖
      this.searchLoading = param?.data?.length > 0;
      this.queryEmpty = false;
      this.showOptionsBlock(true);
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => {
        this.search();
      }, 500);
      this.$emit('debounceSearch', this.query);
    },
    search() {
      // 需要优化
      this.filteredOptions = [];
      this.activedChildrenList = [];
      if (this.query) {
        const _query = this.query.trim();
        const _matchRule = _query.split(' ').join('|');
        const _reg = _matchRule.indexOf('|') ? _matchRule : new RegExp(`${_matchRule}i`);
        const filter = (node) => {
          const _find = this.findDuplicate(this.filteredOptions, node);
          if (node.label.search(_reg) > -1 && !_find) {
            this.filteredOptions.push(node);
          }
        };
        if (this.cascader) {
          this.traverseTree(this.optionsCopy, () => {}, filter);
        } else {
          this.optionsCopy.forEach((node) => {
            filter(node);
          });
        }
        this.queryEmpty = this.filteredOptions.length === 0;
      } else {
        this.queryEmpty = false;
        this.filteredOptions = [];
      }
      this.searchLoading = false;
    },
    confirm(type) {
      let res = [];
      if (type === 'clear') {
        this.cachedCheckGroup = [];
        this.checkAllGroup = [];
        this.cascaderCheck = {};
        this.cachedCascaderCheck = {};
      } else {
        this.cachedCheckGroup = cloneDeep(this.checkAllGroup);
        this.cachedCascaderCheck = cloneDeep(this.cascaderCheck);
        this.preOptions = cloneDeep(this.optionsCopy);
      }
      // 等待收起下拉框的之后传值出去
      if (this.getId && !this.cascader) {
        this.optionsCopy.forEach((item) => {
          if (this.checkAllGroup.includes(item.label)) {
            res.push(item.id || item.value);
          }
        });
      } else {
        res = this.cascader ? this.cachedCascaderCheck : this.checkAllGroup;
      }
      setTimeout(() => {
        this.$emit('input', res);
        this.query = '';
        this.queryEmpty = false;
        this.filteredOptions = [];
      }, 300);
    },
    handleSelect(item) {
      this.checkAllGroup = [];
      this.checkAllGroup.push(item.label);
      this.confirm();
    },
    clearOptions() {
      this.confirm('clear');
    },
    reset() {
      if (this.cascader) {
        const hasCached = Object.keys(this.cachedCascaderCheck).length;
        if (hasCached) {
          this.cascaderCheck = cloneDeep(this.cachedCascaderCheck);
          this.optionsCopy = cloneDeep(this.preOptions);
        } else {
          this.checkAll = false;
          this.indeterminate = false;
          this.cascaderCheck = {};
          this.preOptions = null;
          this.initCascaderData(this.optionsCopy, () => {});
        }
        this.curActived = '';
        this.activedChildrenList = [];
        this.updateKey += 1;
      } else {
        if (this.cachedCheckGroup.length) {
          this.checkAllGroup = this.cachedCheckGroup;
          this.indeterminate =
            this.checkAllGroup.length && this.checkAllGroup.length !== this.options.length;
          this.checkAll =
            this.checkAllGroup.length && this.checkAllGroup.length === this.options.length;
        } else {
          this.checkAll = false;
          this.indeterminate = false;
          this.checkAllGroup = [];
        }
      }
      this.focus = false;
    },
  },
};
</script>

<style lang="scss">
.custom-select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  .label {
    width: 56px;
    text-align: right;
  }
  .custom-select {
    background: #ffffff;
    border: 1px solid #eeeeee;
    border-radius: 2px;
    margin-left: 8px;
    flex: 1;
  }
  .active {
    border: 1px solid #007df1;
    box-shadow: 0px 0px 4px rgba(10, 42, 97, 0.2);
  }
  .tag-wrapper {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0px 4px;
    height: 20px;
    font-size: 10px;
    line-height: 20px;
    color: #333333;
    background: #f2f3f5;
    border-radius: 2px;
    z-index: 99;
    .content {
      width: auto;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
    .icon {
      font-size: 10px;
      color: #666666;
      margin-left: 6px;
      cursor: pointer;
    }
  }
  .custom-input {
    position: relative;
    flex: 1;
    display: inline-flex;
    align-items: center;
    .ivu-icon {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      margin-right: 8px;
      &:before {
        transition: transform 0.4s linear;
      }
    }
  }
  .rotate {
    .ivu-icon:before {
      transform: rotate(180deg);
    }
  }
  .options-block {
    position: absolute;
    min-width: 180px;
    display: flex;
    flex-direction: column;
    max-height: 0;
    background: #ffffff;
    box-shadow: 0px 2px 8px rgba(200, 201, 204, 0.5);
    border-radius: 2px;
    overflow: hidden;
    z-index: 999;
    transition: max-height 0.2s linear;
    .select-all-block {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 40px;
      width: 100%;
      padding: 8px 12px;
      bottom: 0;
      left: 0;
      background: #fff;
      border-top: 1px solid #eeeeee;
      .ivu-checkbox-wrapper {
        font-size: 14px;
      }
      .num {
        color: #007df1;
        margin-right: 4px;
      }
      .btn {
        font-size: 14px;
        background: #007df1;
        border-radius: 2px;
        &:disabled {
          background: rgba(0, 125, 241, 0.2);
          color: #fff;
        }
      }
    }
    .checkgroup-wrapper {
      position: relative;
      overflow-y: auto;
      overflow-x: hidden;
      min-width: 180px;
    }
    .ivu-checkbox-group {
      padding: 8px 2px 8px 12px;
    }
    .ivu-checkbox {
      margin-right: 8px;
    }
    .empty-tip {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      font-size: 14px;
      color: #666666;
      text-align: center;
      .ivu-icon {
        font-size: 16px;
      }
    }
    .ivu-checkbox-group-item {
      display: block;
      font-weight: 400;
      font-size: 14px;
      line-height: 22px;
      color: #333333;
      // white-space: nowrap;
      margin-bottom: 10px;
      &:last-child {
        margin-bottom: 0;
      }
    }
    .select-wrapper {
      .select-option {
        cursor: pointer;
        margin: 4px 0;
        padding: 0 8px;
        &:hover {
          background-color: rgba(0, 125, 241, 0.1);
        }
      }
    }
  }
  .cascader-wrapper {
    display: flex;
    height: 196px;
  }
  .cascader-first-cls {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    min-width: 180px;
  }
  .cascader-second-cls {
    min-width: 180px;
    flex: 1;
    max-width: 0;
    background: #fff;
    z-index: 99;
    overflow-y: auto;
    overflow-x: hidden;
    transition: max-height 0.2s linear;
    border-left: 1px solid #eeeeee;
  }
  .show {
    max-width: none;
  }
  &:hover {
    ::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
    }
  }
  ::-webkit-scrollbar {
    height: 32px;
    width: 4px;
  }
  /* 滚动槽 */
  ::-webkit-scrollbar-track {
    box-shadow: none;
  }
  /* 滚动条滑块 */
  ::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: transparent;
  }
  ::-webkit-scrollbar-thumb:window-inactive {
    background: rgba(0, 0, 0, 0.1);
  }
}
</style>
