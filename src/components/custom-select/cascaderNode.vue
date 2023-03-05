<template>
  <div
    :class="['cascaderNode-wrapper', actived ? 'cascader-hovered' : '', status]"
    @click="handleClick"
    @mouseover="handleMouseOver"
  >
    <div class="checkbox-label-wrapper">
      <span
        :class="[
          'styled-checkbox',
          status !== 'unchecked' ? `checkbox-${status}` : '',
        ]"
      ></span>
      <span class="node-label"
        >{{ parentLabel ? `${parentLabel} / ` : '' }}{{ nodeItem.label }}</span
      >
    </div>
    <Icon
      type="sz-icon-right"
      class="icon"
      v-if="nodeItem.children && !query"
    />
  </div>
</template>
<script>
export default {
  name: 'CascaderNode',
  props: {
    nodeItem: Object,
    expanded: { type: Boolean, default: false },
    query: String,
  },
  data() {
    return {
      actived: this.expanded,
      status: 'unchecked',
      timerId: 0,
    };
  },
  created() {
    this.status = this.nodeItem.status;
  },
  computed: {
    parentLabel() {
      if (this.query) {
        return this.nodeItem?.parent?.label || '';
      }
      return '';
    },
  },
  watch: {
    expanded(val) {
      this.actived = val;
    },
  },
  methods: {
    handleMouseOver() {
      if (!this.query) {
        if (this.timerId) {
          clearInterval(this.timerId);
        }
        this.timerId = setTimeout(() => {
          this.debounceHandler();
        }, 20);
      }
    },
    debounceHandler() {
      this.$emit('hoverNode', this.nodeItem);
    },
    handleClick() {
      switch (this.status) {
      case 'checked':
      case 'indeterminate':
        this.status = 'unchecked';
        break;
      case 'unchecked':
        this.status = 'checked';
        break;
      case 'disabled':
        return;
      default:
        break;
      }
      this.nodeItem.status = this.status;
      const path = this.nodeItem?.path ? this.nodeItem?.path : [this.nodeItem.value];
      const res = { ...this.nodeItem, path };
      this.$emit('selectNode', res);
    },
  },
};
</script>

<style lang='scss'>
.cascader-hovered {
  background: #f2f8fe;
  .styled-checkbox {
    border: 1px solid #007df1;
  }
}

.cascaderNode-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 12px;
  min-width: 160px;
  width: auto;
  cursor: pointer;
  &:hover {
    background: #f2f8fe;
    .styled-checkbox {
      border: 1px solid #007df1;
    }
  }

  .checkbox-label-wrapper {
    line-height: 22px;
    vertical-align: text-top;
    word-break: break-all;
  }
  .styled-checkbox {
    display: inline-block;
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 2px;
    margin-right: 8px;
    border: 1px solid #dddddd;
    vertical-align: inherit;
  }
  .checkbox-checked {
    background: #007df1;
    position: relative;
    transition: all 0.2s ease-in-out;

    &::after {
      content: '';
      position: absolute;
      display: table;
      left: 5px;
      top: 2px;
      width: 4px;
      height: 8px;
      border: 2px solid #fff;
      border-top: 0;
      border-left: 0;
      transform: rotate(45deg) scale(1);
    }
  }
  .checkbox-disabled {
    pointer-events: none;
    background: #f3f3f3;
  }
  .checkbox-indeterminate {
    background: #007df1;
    position: relative;
    transition: all 0.2s ease-in-out;
    &::after {
      content: '';
      position: absolute;
      display: table;
      left: 2px;
      top: 6px;
      width: 10px;
      height: 1px;
      border: 2px solid #fff;
      border: 2px solid #fff;
      border-top: 0;
      border-left: 0;
      transform: scale(1);
    }
  }
}
.cascaderNode-wrapper.disabled {
  background: #f3f3f3;
  cursor: not-allowed;
  &:hover {
    .styled-checkbox {
      border: 1px solid #dddddd;
    }
  }
}
</style>
