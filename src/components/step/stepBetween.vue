<template>
  <div :class="['step_item', 'step_between', stepStatus]">
    <span class="label">{{label}}</span>
    <div class="arrow">
      <svg
        class="arrow_svg"
        width="100%"
        height="100%"
        viewBox="0 0 240 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none meet"
      >
        <path
          class="lower_arrow_path"
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M0 0L20 20L0 40H220L240 20L220 0H0Z"
          fill="#F2F3F5"
        />
        <path
          class="upper_arrow_path"
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M0 0L20 20L0 40H220L240 20L220 0H0Z"
          fill="#F2F3F5"
        />
      </svg>
    </div>
  </div>
</template>

<script>
import stepsMixin from './stepsMixin';
export default {
  mixins: [stepsMixin],
};
</script>
