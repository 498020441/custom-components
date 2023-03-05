<template>
  <div :class="['step_item', 'step_tail', stepStatus]">
    <span class="label">{{label}}</span>
    <div class="arrow">
      <svg
        class="arrow_svg"
        width="100%"
        height="100%"
        viewBox="0 0 220 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none meet"
      >
        <path
          class="lower_arrow_path"
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M20 20L0 0H216C218.209 0 220 1.79086 220 4V36C220 38.2091 218.209 40 216 40H0L20 20Z"
          fill="#F2F3F5"
        />
        <path
          class="upper_arrow_path"
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M20 20L0 0H216C218.209 0 220 1.79086 220 4V36C220 38.2091 218.209 40 216 40H0L20 20Z"
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
