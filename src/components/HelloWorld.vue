<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>
      This is a <a
        href="https://vuejs.org"
        target="_blank">Vue</a>
      app, intended to (eventually) showcase Vue integration with
      <a
        href="http://oddbird.net/herman/"
        target="_blank">Herman</a>
      automated style guides.
    </p>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: {
      type: String,
      default: '',
    },
  },
};
</script>
