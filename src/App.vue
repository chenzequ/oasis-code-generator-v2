<template>
  <div id="app">
    <Home />
  </div>
</template>

<script setup lang="ts">
import Home from './view/Home.vue'
</script>

<style lang="less">
.size {
  width: 100%;
  height: 100%;
}

html,
body {
  .size;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

#app {
  .size;
}
</style>