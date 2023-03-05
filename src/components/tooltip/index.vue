<template>
  <div class="irs-custom-tooltip-wrapper" ref="tooltipRef" :style="customStyle">
    <div class="irs-tooltip-box">
      <span v-if="content">{{ content }}</span>
      <slot v-else></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    customStyle: { type: Object, default: () => {} },
    content: { type: String, default: '' },
    transferTo: { type: String, default: 'app' },
  },
  data() {
    return {
      tooltipRef: null,
      root: null,
    };
  },
  beforeMount() {
    this.root = document.getElementById(this.transferTo) || document.querySelector(this.transferTo);
  },
  mounted() {
    this.root.appendChild(this.$el);
  },
  beforeDestroy() {
    this.root.removeChild(this.$el);
  },
};
</script>

<style lang="scss">
.irs-custom-tooltip-wrapper {
  position: absolute;
  min-width: 80px;
  min-height: 34px;
  top: 0;
  left: 0;
  z-index: 9999;
  .irs-tooltip-box {
    position: relative;
    max-width: 400px;
    min-height: 34px;
    color: #ffffff;
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;
    background: rgba(70, 76, 91, 0.9);
    border-radius: 4px;
    padding: 8px 12px;
    text-align: center;
    word-break: break-all;
    &:after {
      display: block;
      content: '';
      position: absolute;
      width: 8px;
      height: 8px;
      left: calc(50% - 4px);
      top: 100%;
      bottom: 4px;
      background: rgba(70, 76, 91, 0.9);
      transform: translateY(-50%) rotate(45deg);
    }
  }
}
</style>
