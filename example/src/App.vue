<template>
  <div class="app">
    <foo :message="{n: 999}"></foo>
    <foo-element message='{"n": 111}'></foo-element>
    <img src="./assets/logo.png">
    <h1>{{ msg }}</h1>
    <real-slot></real-slot>
  </div>
</template>

<script>
  import Foo from './Foo'

  console.log(' Foo in App ', Foo)

  export default {
    name: 'app',
    data () {
      return {
        msg: 'Welcome to Your Vue.js App'
      }
    },
    components: { Foo }
  }
</script>

<style scoped>
  .app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
    border: solid 2px teal;
    padding: 10px;
  }

  h1, h2 {
    font-weight: normal;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: inline-block;
    margin: 0 10px;
  }

  a {
    color: #42b983;
  }
</style>
