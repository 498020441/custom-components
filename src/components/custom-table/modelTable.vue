<template>
  <div :class="[rows.length > 0?'table_wrapper':'empty']">
    <div class="custom_model_table" :key="updateKey+'_updateKey'">
      <div class="model_table_content" v-if="rows.length > 0">
        <div
          v-for="(level1Item,level1Idx) in rows"
          class="custom_table_row_wrapper"
          :key="`row${level1Idx}`"
        >
          <div class="custom_table_row">
            <div class="level1">
              <Icon
                @click="handleExpand(level1Item)"
                type="sz-icon-caret-right"
                :class="['icon_1',level1Item.actived?'actived':'',level1Item[childKey] && level1Item[childKey].length?'':'disabled']"
              ></Icon>
              <span class="index">{{level1Idx+1}}</span>
              <span class="name">
                <Input v-model="level1Item.indexName" type="text" placeholder="请输入一级指标名称"></Input>
              </span>
            </div>
            <span class="score">
              <Stepper
                v-model="level1Item.indexScore"
                placeholder="0000"
                :max="1000"
                :min="-1000"
                unit="分"
              ></Stepper>
            </span>
            <slot name="action" v-bind:row="level1Item"></slot>
          </div>
          <template v-if="level1Item[childKey] && level1Item[childKey].length">
            <div class="level2" v-show="level1Item.actived">
              <template v-for="(level2Item,level2Idx) in level1Item[childKey]">
                <div class="custom_table_row" :key="`row${level1Idx}_${level2Idx}`">
                  <span class="name">
                    <Input v-model="level2Item.indexName" type="text" placeholder="请输入二级指标名称"></Input>
                  </span>
                  <span class="score">
                    <Stepper
                      v-model="level2Item.indexScore"
                      placeholder="0000"
                      :max="1000"
                      :min="-1000"
                      unit="分"
                    ></Stepper>
                  </span>
                  <slot name="action" v-bind:row="level2Item" v-bind:parent="level1Item"></slot>
                </div>
                <template v-if="level2Item[childKey] && level2Item[childKey].length">
                  <div
                    class="level3"
                    :key="`row${level1Idx}_${level2Idx}_level3`"
                    v-show="level1Item.actived"
                  >
                    <template v-for="(level3Item,level3Idx) in level2Item[childKey]">
                      <div
                        class="custom_table_row"
                        :key="`row${level1Idx}_${level2Idx}_${level3Idx}`"
                      >
                        <span class="name">
                          <Input v-model="level3Item.indexName" type="text" placeholder="请输入三级指标名称"></Input>
                        </span>
                        <span class="score">
                          <Stepper
                            v-model="level3Item.indexScore"
                            placeholder="0000"
                            :max="1000"
                            :min="-1000"
                            unit="分"
                          ></Stepper>
                        </span>
                        <slot name="action" v-bind:row="level3Item" v-bind:parent="level2Item"></slot>
                      </div>
                      <template v-if="level3Item[childKey] && level3Item[childKey].length">
                        <div
                          class="level4"
                          :key="`row${level1Idx}_${level2Idx}_${level3Idx}_level4`"
                          v-show="level1Item.actived"
                        >
                          <div
                            class="custom_table_row"
                            v-for="(level4Item,level4Idx) in level3Item[childKey]"
                            :key="`row${level1Idx}_${level2Idx}_${level3Idx}_${level4Idx}`"
                          >
                            <span class="name">
                              <Input
                                v-model="level4Item.indexName"
                                type="text"
                                placeholder="请输入四级指标名称"
                              ></Input>
                            </span>
                            <span class="score">
                              <Stepper
                                v-model="level4Item.indexScore"
                                placeholder="0000"
                                :max="1000"
                                :min="-1000"
                                unit="分"
                              ></Stepper>
                            </span>
                            <slot name="action" v-bind:row="level4Item" v-bind:parent="level3Item"></slot>
                          </div>
                        </div>
                      </template>
                    </template>
                  </div>
                </template>
              </template>
            </div>
          </template>
        </div>
      </div>
      <div v-else class="empty_table">
        <Icon type="sz-icon-error-circle-o" class="icon"></Icon>
        <span class="text">暂无数据</span>
      </div>
      <slot name="add_btn"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    listData: { dafault: [Array, Object] },
    childKey: String,
    deep: { default: 1, type: Number },
  },
  data() {
    return {
      timerId: null,
      rows: [],
      updateKey: 0,
    };
  },
  watch: {
    listData: {
      handler: function () {
        this.rows = this.listData;
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    getStyleObj(item) {
      let _style = {};
      if (item.align) {
        _style['text-align'] = item.align;
      }
      if (item['width']) {
        _style['width'] = item['width'];
      } else {
        if (item['min-width']) {
          _style['min-width'] = item['min-width'];
        }
        if (item['max-width']) {
          _style['max-width'] = item['max-width'];
        }
      }
      if (item['padding-left']) {
        _style['padding-left'] = item['padding-left'];
      }
      if (item['padding-right']) {
        _style['padding-right'] = item['padding-right'];
      }
      return _style;
    },
    getLevelTag(indexLevel) {
      let tag;
      const level = Number(indexLevel);
      switch (level) {
      case 2:
        tag = '二级';
        break;
      case 3:
        tag = '三级';
        break;
      case 4:
        tag = '四级';
        break;
      default:
        break;
      }
      return tag;
    },
    handleExpand(row) {
      if (row[this.childKey] && row[this.childKey].length) {
        row.actived = !row.actived;
        this.updateKey += 1;
      }
    },
  },
};
</script>

<style lang='scss'>
@import './index.scss';
@mixin deco_line() {
  content: '';
  position: absolute;
  top: 0;
  left: 1px;
  min-width: 2px;
  height: 100%;
  background: #edf4ff;
  z-index: 1;
}
@mixin deco_label($text) {
  content: $text;
  position: absolute;
  writing-mode: vertical-lr;
  padding: 4px 4px 4px 1px;
  font-weight: 400;
  font-size: 14px;
  min-height: 44px;
  letter-spacing: 3px;
  line-height: 16px;
  text-align: center;
  color: #007df1;
  background: #edf4ff;
  border-radius: 2px;
  top: 50%;
  left: 1px;
  transform: translate(-50%, -49%);
  z-index: 2;
}
.empty {
  position: relative;
  width: 100%;
  height: 100%;
  .custom_model_table {
    &::before,
    &:after {
      content: '';
      width: 0;
      height: 0;
      border: none;
      padding: 0;
    }
  }
}

.table_wrapper {
  width: 100%;
  height: 100%;
}
.custom_model_table {
  @include commonStyle();

  position: relative;
  width: 100%;
  height: 100%;
  background: #ffffff;
  margin-left: 16px;
  &:before {
    @include deco_label('\6a21\578b\6307\6807');
  }
  &:after {
    @include deco_line();
  }

  .model_table_content {
    height: calc(100% - 60px);
    margin: 0 16px 20px 0;
    overflow: auto;
  }
  .custom_table_row_wrapper {
    border: 1px solid #eeeeee;
    border-radius: 2px;
    padding: 18px;
    margin: 0 0 20px 18px;
  }

  .custom_table_row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    flex: 1;
    .padd-left {
      padding-left: 32px;
    }
  }
  .disabled {
    color: #cccccc;
    pointer-events: none;
  }
  .level1,
  .level2,
  .level3,
  .level4,
  .name {
    flex: 1;
    cursor: unset;
  }

  .level2,
  .level3,
  .level4 {
    position: relative;
    display: block;
    .name {
      padding: 10px 0;
    }
  }
  .name {
    margin-right: 10px;
  }
  .level2 {
    margin-left: 70px;
    padding-left: 25px;
    &:before {
      @include deco_label('\4e8c\7ea7');
    }
    &:after {
      @include deco_line();
    }
  }
  .level3 {
    margin-left: 10px;
    padding-left: 25px;
    &:before {
      @include deco_label('\4e09\7ea7');
    }
    &:after {
      @include deco_line();
    }
  }
  .level4 {
    margin-left: 10px;
    padding-left: 25px;
    &:before {
      @include deco_label('\56db\7ea7');
    }
    &:after {
      @include deco_line();
    }
  }

  .score {
    width: 115px;
    margin-right: 0px;
    .ivu-input-number {
      width: 80px;
    }
  }
}
</style>
