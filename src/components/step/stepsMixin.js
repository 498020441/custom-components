export default {
  data() {
    return {
      stepStatus: 'wait_active',
    };
  },
  props: {
    label: String,
    status: String,
  },
  mounted() {
    if (this.status === 'in_active') {
      this.$nextTick(() => (this.stepStatus = 'in_active'));
    } else {
      this.stepStatus = this.status;
    }
  },
};
