<template>
  <table class="custom_table" :key="'updateKey_'+updateKey">
    <thead class="custom_table_head">
      <tr>
        <th
          v-for="(item , index) in columns"
          class="custom_th"
          :key="`tableHead${index}`"
          :style="getStyleObj(item)"
        >
          <span>{{item.title}}</span>
        </th>
      </tr>
    </thead>
    <tbody class="custom_tbody" v-if="rows.length > 0">
      <template v-for="(level1Item,level1Idx) in rows">
        <tr class="custom_tr" :key="`row${level1Idx}`">
          <td
            v-for="(element, i) in columns"
            :key="`tr${level1Idx}-td${i}`"
            class="custom_td_item"
            :style="getStyleObj(element)"
          >
            <template v-if="element.slot">
              <slot :name="element.slot" v-bind:row="level1Item"></slot>
            </template>
            <template v-else>
              <div
                v-if="i === 0"
                @click="handleExpand(level1Item)"
                :class="['level1',level1Item[childKey] && level1Item[childKey].length?'':'padd-left']"
              >
                <Icon
                  type="sz-icon-caret-right"
                  :class="['icon_1',level1Item.actived?'actived':'']"
                  v-if="level1Item[childKey] && level1Item[childKey].length"
                ></Icon>
                <span class="index">{{level1Idx+1}}</span>
                <Render :item="level1Item" :config="columns[i]"></Render>
              </div>
              <Render :item="level1Item" :config="columns[i]" v-else></Render>
            </template>
          </td>
        </tr>
        <template v-if="level1Item[childKey] && level1Item[childKey].length">
          <template v-for="(level2Item,level2Idx) in level1Item[childKey] ">
            <tr class="custom_tr" v-show="level1Item.actived" :key="level2Item.modelId">
              <td
                v-for="(element, i) in columns"
                :key="`tr${level2Idx}-td${i}`"
                class="custom_td_item"
                :style="getStyleObj(element)"
              >
                <template v-if="element.slot">
                  <slot :name="element.slot" v-bind:row="level2Item" v-bind:parent="level1Item"></slot>
                </template>
                <template v-else>
                  <div v-if="i === 0" @click="handleExpand(level2Item)" class="level2">
                    <span
                      :class="[level2Item.actived?'expanded':'collapsed']"
                      v-if="level2Item.indexLevel < deep && level2Item[childKey] && level2Item[childKey].length"
                    ></span>
                    <span class="level_tag">{{getLevelTag(level2Item.indexLevel)}}</span>
                    <Render :item="level2Item" :config="columns[i]"></Render>
                  </div>
                  <Render :item="level2Item" :config="columns[i]" v-else></Render>
                </template>
              </td>
            </tr>
            <template v-if="level2Item[childKey] && level2Item[childKey].length">
              <template v-for="(level3Item,level3Idx) in level2Item[childKey]">
                <tr
                  class="custom_tr"
                  v-show="level1Item.actived&&level2Item.actived"
                  :key="level3Item.modelId"
                >
                  <td
                    v-for="(element, i) in columns"
                    :key="`tr${level3Idx}-td${i}`"
                    class="custom_td_item"
                    :style="getStyleObj(element)"
                  >
                    <template v-if="element.slot">
                      <slot :name="element.slot" v-bind:row="level3Item" v-bind:parent="level2Item"></slot>
                    </template>
                    <template v-else>
                      <div v-if="i === 0" @click="handleExpand(level3Item)" class="level3">
                        <span
                          :class="[level3Item.actived?'expanded':'collapsed']"
                          v-if="level3Item.indexLevel < deep && level3Item[childKey] && level3Item[childKey].length"
                        ></span>
                        <span class="level_tag">{{getLevelTag(level3Item.indexLevel)}}</span>
                        <Render :item="level3Item" :config="columns[i]"></Render>
                      </div>
                      <Render :item="level3Item" :config="columns[i]" v-else></Render>
                    </template>
                  </td>
                </tr>
                <template v-if="level3Item[childKey] && level3Item[childKey].length > 0">
                  <template v-for="(level4Item,level4Idx) in level3Item[childKey]">
                    <tr
                      class="custom_tr"
                      v-show="level1Item.actived&&level2Item.actived&&level3Item.actived"
                      :key="level4Item.modelId"
                    >
                      <td
                        v-for="(element, i) in columns"
                        :key="`tr${level4Idx}-td${i}`"
                        class="custom_td_item"
                        :style="getStyleObj(element)"
                      >
                        <template v-if="element.slot">
                          <slot
                            :name="element.slot"
                            v-bind:row="level4Item"
                            v-bind:parent="level3Item"
                          ></slot>
                        </template>
                        <template v-else>
                          <div v-if="i === 0" class="level4">
                            <span class="level_tag">{{getLevelTag(level4Item.indexLevel)}}</span>
                            <Render :item="level4Item" :config="columns[i]"></Render>
                          </div>
                          <Render :item="level4Item" :config="columns[i]" v-else></Render>
                        </template>
                      </td>
                    </tr>
                  </template>
                </template>
              </template>
            </template>
          </template>
        </template>
      </template>
    </tbody>
    <div v-else class="empty_table">
      <Icon type="sz-icon-error-circle-o" class="icon"></Icon>
      <span class="text">暂无数据</span>
    </div>
  </table>
</template>

<script>
import Render from './render.js';

export default {
  components: { Render },
  name: 'CustomTable',
  props: {
    listData: { dafault: [Array, Object] },
    columns: { default: Array },
    childKey: String,
    deep: { default: 1, type: Number },
  },
  data() {
    return {
      rows: [],
      updateKey: 0,
    };
  },
  watch: {
    listData: {
      handler: function () {
        this.rows = this.listData;
        this.updateKey += 1;
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
<style lang="scss" >
@import './index.scss';
.custom_table_head,
.custom_tbody,
.custom_tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

.custom_table {
  @include commonStyle();
  position: relative;
  width: 100%;
  height: 100%;
  border-collapse: collapse;

  .custom_table_head {
    position: absolute;
    top: 0;
    z-index: 10;
    text-align: center;
    width: 100%;
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;
    text-align: left;
    color: #333;
    background: #f5f6f8;
    box-shadow: inset 0px -1px 0px #eeeeee;

    .custom_th {
      padding: 10px 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      &:first-child {
        padding-left: 42px;
      }
    }
  }
  .custom_tbody {
    display: block;
    height: calc(100% - 44px);
    width: 100%;
    margin-top: 44px;
    overflow: auto;
  }
  .custom_tr {
    .custom_td_item {
      padding: 10px 14px;
      font-weight: 400;
      font-size: 14px;
      line-height: 22px;
      color: #333333;
      text-align: left;
      border-bottom: 1px solid #eeeeee;
    }
  }

  .padd-left {
    padding-left: 32px;
  }

  .level2 {
    padding-left: 31px;
  }
  .level3 {
    padding-left: 60px;
  }
  .level4 {
    padding-left: 88px;
  }

  .icon_2 {
    // display: inline-flex;
    // height: 100%;
    // align-items: center;
    margin-right: 12px;
  }
  .collapsed {
    position: relative;
    min-height: 16px;
    min-width: 16px;
    background: #f2f3f5;
    border-radius: 2px;
    margin-right: 12px;

    &:after {
      content: ' ';
      position: absolute;
      min-width: 7px;
      min-height: 2px;
      background: #4e5969;
      border-radius: 0.5px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(90deg);
    }
    &:before {
      content: ' ';
      position: absolute;
      min-width: 7px;
      min-height: 2px;
      background: #4e5969;
      border-radius: 0.5px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
  .expanded {
    position: relative;
    min-height: 16px;
    min-width: 16px;
    background: #f2f3f5;
    border-radius: 2px;
    margin-right: 12px;

    &:after {
      content: '';
      position: absolute;
      min-width: 7px;
      min-height: 2px;
      background: #4e5969;
      border-radius: 0.5px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
}
</style>
