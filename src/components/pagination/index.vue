<template>
  <div class="pagination-box">
    <Page
      slot="page"
      class-name="minute-page"
      :total="total"
      :current="current"
      :page-size="pageSize"
      :show-sizer="showSizer"
      :show-total="showTotal"
      :show-elevator="showElevator"
      @on-change="onChangePage"
      :page-size-opts="[10, 20, 50, 100]"
      @on-page-size-change="onSizeChange"
    />
  </div>
</template>
<script>
/**
 * 注：传入pageSize，以及current时，需添加sync，以便数据更新
 * 当前页码或是每页条数改变时会触发on-change事件回调
 * @params total 数据总条数
 * @params current 当前页，需添加sync
 * @params pageSize 每页条数，需添加sync
 * @params showSizer 是否分页选择器，默认显示
 * @params showTotal 是否显示总条数，默认显示
 * @params showElevator 是否显示电梯，可快速切换到某一页，默认显示
 */
export default {
  name: 'Pagination',
  props: {
    total: {
      type: Number,
      default: 0,
    },
    current: {
      type: Number,
      default: 1,
    },
    pageSize: {
      type: Number,
      default: 10,
    },
    showSizer: {
      type: Boolean,
      default: true,
    },
    showTotal: {
      type: Boolean,
      default: true,
    },
    showElevator: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    onChangePage(page) {
      this.$emit('update:current', page);
      this.$nextTick(() => {
        this.$emit('on-change', page);
      });
    },
    onSizeChange(size) {
      this.$emit('update:pageSize', size);
      if (this.current === 1) {
        this.onChangePage(1);
      }
    },
  },
};
</script>
<style lang="scss">
@import '@/theme/variants.scss';
@import '@/theme/mixins.scss';
.pagination-box {
  white-space: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  text-align: right;
  .minute-page {
    display: block;
  }
}
.minute-page {
  width: auto;
  .ivu-page-item,
  .ivu-page-prev {
    margin-right: 8px;
  }
  .ivu-page-item {
    width: auto;
  }
}
.ivu-table-wrapper + .pagination-box {
  padding-top: 20px;
}
</style>
