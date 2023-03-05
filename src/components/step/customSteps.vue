<template>
  <div class="custom_steps">
    <template v-for="(item,index) in stepsList">
      <component
        :is="getView(index)"
        :key="'custom_steps_'+updateKey+'_'+index"
        :label="item.label"
        :status="setStatus(index)"
      ></component>
    </template>
  </div>
</template>

<script>
import StepHead from './stepHead.vue';
import StepBetween from './stepBetween.vue';
import StepTail from './stepTail.vue';

export default {
  name: 'CustomSteps',
  props: {
    stepsList: Array,
    currentStep: Number,
  },
  components: { StepHead, StepBetween, StepTail },
  data() {
    return {
      stepNo: 0,
      updateKey: 0,
    };
  },
  watch: {
    currentStep: {
      immediate: true,
      handler(newVal) {
        this.stepNo = newVal;
        this.updateKey += 1;
      },
    },
  },
  methods: {
    getView(index) {
      if (index === 0) {
        return 'StepHead';
      } else if (index > 0 && index < this.stepsList.length - 1) {
        return 'StepBetween';
      }
      return 'StepTail';
    },
    setStatus(index) {
      const cls =
        this.stepNo === index ? 'in_active' : this.stepNo > index ? 'actived' : 'wait_active';
      return cls;
    },
  },
};
</script>

<style lang='scss' >
@mixin arrow_svg() {
  .upper_arrow_path {
    position: relative;
    z-index: 1;
    transform: scaleX(0);
  }
}
.custom_steps {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 32px;
  .step_item {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;
    color: #333333;

    .label {
      position: relative;
      z-index: 3;
    }
    .arrow {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      z-index: 2;
    }
  }
  .arrow_svg {
    @include arrow_svg();
  }
  .step_head {
    .arrow {
      transform: scaleX(1.02);
      transform-origin: left center;
    }
  }
  .step_between {
    .arrow {
      transform: scaleX(1.05);
      transform-origin: center;
    }
  }
  .step_tail {
    .arrow {
      transform: scaleX(1.02);
      transform-origin: right center;
    }
  }

  .in_active {
    .label {
      font-weight: 600;
      color: #ffffff;
      transition: all 0.1s linear;
      transition-delay: 0.12s;
    }

    .upper_arrow_path {
      fill: #007df1;
      transform: scaleX(1);
      transition: transform 0.3s ease-in-out;
    }
  }

  .actived {
    .upper_arrow_path {
      transform: scaleX(1);
      fill: #e8f3ff;
    }
  }
  .wati_active {
  }
}
</style>
