<template>
  <div class="custom-table-wrapper">
    <Table v-bind="$attrs" :columns="columns" ref="tableRef">
      <template v-for="ele in slotList" :slot="ele.slot" slot-scope="{ row }">
        <slot :name="ele.slot" v-bind:row="row"></slot>
      </template>
    </Table>
    <Pagination
      :total="total"
      :current.sync="curr"
      :pageSize.sync="size"
      @on-change="getTableData"
    ></Pagination>
    <CustomTooltip
      v-if="showTooltip"
      ref="toolTipBox"
      transferTo="body"
      :customStyle="tooltipConfig.customStyle"
    >
      {{ tooltipConfig.content }}
    </CustomTooltip>
  </div>
</template>

<script>
import { debounce } from 'lodash';
import Pagination from '../pagination';
import CustomTooltip from '../tooltip';

const initStyle = { opacity: 0, transform: 'translate(-100%,-100%)' };
export default {
  components: { Pagination, CustomTooltip },
  props: {
    showTooltip: { default: false, type: Boolean },
    columns: { default: () => [], type: Array },
    total: { default: 0, type: Number },
    current: { default: 0, type: Number },
    pageSize: { default: 0, type: Number },
  },
  data() {
    return {
      onHoverTooltip: false,
      tooltipConfig: {
        content: '',
        customStyle: { ...initStyle },
      },
    };
  },
  mounted() {
    if (this.$refs.tableRef && this.showTooltip) {
      this.$refs.toolTipBox.$el.addEventListener('mousemove', (e) =>
        this.handleMousemoveTooltip(e)
      );
      this.$refs.toolTipBox.$el.addEventListener('mouseout', (e) => this.handleMouseoutTooltip(e));
      this.$refs.tableRef.$el.addEventListener('mousemove', (e) => this.handleMousemove(e));
      this.$refs.tableRef.$el.addEventListener('mouseout', (e) => this.handleMouseout(e));
    }
  },
  beforeDestroy() {
    if (this.showTooltip) {
      this.$refs.toolTipBox.$el.removeEventListener('mousemove', (e) =>
        this.handleMousemoveTooltip(e)
      );
      this.$refs.toolTipBox.$el.removeEventListener('mouseout', (e) =>
        this.handleMouseoutTooltip(e)
      );
      this.$refs.tableRef.$el.removeEventListener('mousemove', (e) => this.handleMousemove(e));
      this.$refs.tableRef.$el.removeEventListener('mouseout', (e) => this.handleMouseout(e));
    }
  },
  computed: {
    slotList() {
      return this.columns.filter((item) => item.slot);
    },
    curr: {
      get() {
        return this.current;
      },
      set(val) {
        this.$emit('update:current', val);
      },
    },
    size: {
      get() {
        return this.pageSize;
      },
      set(val) {
        this.$emit('update:pageSize', val);
      },
    },
  },
  methods: {
    getTableData(page) {
      this.$emit('on-change', page);
    },
    isTruncate(target) {
      const { offsetWidth, scrollWidth } = target;
      return scrollWidth > offsetWidth;
    },
    handleMousemove: debounce(function handleMove(e) {
      const { target, clientX, clientY } = e;
      const needTooltip = target?._prevClass?.includes('text-truncate');
      if (needTooltip) {
        const _isTruncate = this.isTruncate(target);
        if (_isTruncate) {
          this.tooltipConfig.content = target.textContent.trim();
          const domRect = target.getBoundingClientRect();
          this.$nextTick(() => {
            const { clientWidth = 80, clientHeight = 34 } = this.$refs.toolTipBox.$el;
            this.tooltipConfig.customStyle.opacity = 1;
            this.tooltipConfig.customStyle.transform = `translate(${
              domRect.left - clientWidth / 4
            }px, ${domRect.top - clientHeight}px)`;
          });
        }
      }
    }, 200),
    handleMouseout: debounce(function handleOut({ target }) {
      if (!this.onHoverTooltip) {
        this.tooltipConfig.content = '';
        this.tooltipConfig.customStyle = { ...initStyle };
      }
    }, 200),
    handleMousemoveTooltip: debounce(function handlemove(e) {
      this.onHoverTooltip = true;
    }, 20),
    handleMouseoutTooltip: debounce(function handleout(e) {
      this.onHoverTooltip = false;
    }, 200),
  },
};
</script>

<style lang="scss">
@import '@/theme/mixins.scss';

.custom-table-wrapper {
  .text-truncate {
    line-height: 48px;
    height: 100%;
    @include textEllipsis();
  }
  .ivu-table-cell {
    display: flex;
    align-items: center;
    height: 100%;
  }
}
</style>
