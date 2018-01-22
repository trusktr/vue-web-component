
<template>
  <div> foo: {{message.n}} </div>
</template>

<style scoped>
  div {
    background: pink;
  }
</style>

<script>
  export default {
    props: {
      message: {
        type: Object,
        default: () => ({n: 8}),
      }
    },
  }
</script>
