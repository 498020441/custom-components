<template>
  <CustomSteps :stepsList="stepsList" :currentStep="curStep - 1" v-show="curStep < 6"></CustomSteps>
</template>

<script>
import CustomSteps from './widgets';

export default {
  components: { CustomSteps },
  data() {
    return {
      curStep: 1,
      stepsList: [
        { label: '1.应用简况' },
        { label: '2.风险线索' },
        { label: '3.处置规则' },
        { label: '4.模型简况' },
        { label: '5.接入方式' },
      ],
    };
  },
};
</script>

<style></style>
