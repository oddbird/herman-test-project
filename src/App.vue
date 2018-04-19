<template>
  <div id="app">
    <img src="./../images/oddlogo.png">
    <HelloWorld msg="Greetings, World."/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue';

export default {
  name: 'App',
  components: {
    HelloWorld,
  },
};
</script>

<style>
#app {
  margin-top: 60px;
}
</style>
