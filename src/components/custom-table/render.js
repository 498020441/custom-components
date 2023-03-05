export default {
  functional: true,
  props: {
    item: { type: [Object, String] },
    config: Object,
  },
  render: (h, ctx) => {
    if (ctx.props.config.render) {
      return ctx.props.config.render(h, ctx.props);
    }
    return h('span', ctx.props.item[ctx.props.config.key] || '-');
  },
};
