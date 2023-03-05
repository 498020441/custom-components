<template>
  <div class="dp-text-ellipsis-wrapper" :style="{'--lineHeight':textLineHeight}">
    <div class="text" :class="textClass" :style="styleObject">
      <label v-if="btnShow" class="btn" @click="handleClick">{{showLabel}}</label>
      <div ref="lineInfo">
        <template v-if="info">{{ info }}</template>
        <slot v-else></slot>
      </div>
    </div>
  </div>
</template>
<script>
// 注意事项，该组件初始时父组件若为不可见状态（display:none）
// 需要在父组件在可见时，重新挂载, 否则该组件styleObject属性将无法计算得到准确值
export default {
  name: 'TextEllipsis',
  props: {
    info: {
      // 文本内容
      type: String,
      default: '',
    },
    lineClamp: {
      // 截断起始行数
      type: Number,
      default: 3,
    },
    hiddenBtn: {
      // 展示收起按钮
      type: Boolean,
      default: true,
    },
    hiddenIcon: {
      // 展示icon
      type: Boolean,
      default: false,
    },
    lineHeight: {
      // 字体行高
      type: Number,
      default: 22,
    },
    hasLabel: {
      // 展示 更多/收起
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      showall: false,
      btnShow: false,
      styleObject: null,
      textHeight: null,
    };
  },
  computed: {
    showLabel() {
      return this.hasLabel ? (!this.showall ? '更多' : '收起') : ' ';
    },
    textClass() {
      let cls = this.showall ? 'showall' : '';
      cls += this.hiddenBtn ? ' hidden-btn' : '';
      cls += this.hiddenIcon ? ' hidden-icon' : '';
      return cls;
    },
    textLineHeight() {
      return `${this.lineHeight}px`;
    },
  },

  watch: {
    info(val) {
      this.showall = false;
      if (val) {
        this.styleObject = this.textStyleObject();
      }
    },
  },
  mounted() {
    this.styleObject = this.textStyleObject();
  },
  updated() {
    this.setBtnShow();
  },
  methods: {
    handleClick() {
      if (this.hasLabel) {
        this.showall = !this.showall;
        this.styleObject = this.textStyleObject();
      }
    },
    setBtnShow() {
      if (this.textHeight <= this.lineClamp * this.lineHeight) {
        this.btnShow = false;
      } else if (this.showall && !this.hiddenBtn) {
        this.btnShow = false;
      } else {
        this.btnShow = true;
      }
    },
    textStyleObject() {
      this.textHeight = this.getTextHeight();
      const textHeight = `${this.textHeight}px`;
      const clampHeight = `${this.getClampHeight()}px`;
      return {
        'max-height': this.showall ? textHeight : clampHeight,
      };
    },
    getClampHeight() {
      const style = window.getComputedStyle(this.$refs.lineInfo);
      const { lineHeight } = style;
      const _lineHeightVal = lineHeight.split('px')[0] || 0;
      return Number(_lineHeightVal) * this.lineClamp;
    },
    getTextHeight() {
      const height = this.$refs.lineInfo.offsetHeight;
      return Number(height);
    },
  },
};
</script>
<style lang="scss">
.dp-text-ellipsis-wrapper {
  display: flex;
  overflow: hidden;
  .text {
    position: relative;
    overflow: hidden;
    text-align: justify;
    text-overflow: ellipsis;
    word-break: break-all;
    // transition: max-height 0.2s linear;
  }
  .text::before {
    float: right;
    height: calc(100% - var(--lineHeight));
    content: '';
  }

  .btn {
    position: relative;
    float: right;
    clear: both;
    margin-left: 10px;
    min-height: var(--lineHeight);
    font-size: 14px;
    // padding: 0 0 0 8px;
    color: #007df1;
    border-radius: 4px;
    cursor: pointer;
    z-index: 3;
  }
  .btn::after {
    font-family: 'sz-iconfont' !important;
    content: '\e67b';
  }

  .text.showall .btn::before {
    visibility: hidden;
  }
  .text.showall .btn::after {
    visibility: hidden;
  }
  .text.showall.hidden-btn .btn::after {
    font-family: 'sz-iconfont' !important;
    content: '\e676';
    visibility: visible;
  }
  .btn::before {
    position: absolute;
    left: 1px;
    color: #333;
    transform: translateX(-100%);
    content: '...';
    cursor: text;
  }

  .text.hidden-icon .btn::after {
    font-family: 'sz-iconfont' !important;
    content: '';
    visibility: visible;
  }
  .text.showall.hidden-icon .btn::after {
    font-family: 'sz-iconfont' !important;
    content: '';
    visibility: visible;
  }
}
</style>
