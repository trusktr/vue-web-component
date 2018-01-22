import App from './App.vue'
import Foo from './Foo.vue'
import VueWebComponent from '../../src/index'

console.log('App in main:', App)
console.log('Foo in main:', Foo)
console.log('Foo props sync 1', Foo.props)

customElements.define('app-element', VueWebComponent( App ) )
customElements.define('foo-element', VueWebComponent( Foo ) )

console.log('Foo props sync 2', Foo.props)

// finally, test the element, and you can also nest them (take a look at the
// element inspector)
document.body.innerHTML = `
  <app-element>
    <foo-element id="test" message='{"n":555}'></foo-element>
    <app-element></app-element>
  </app-element>
`

console.log('Foo props sync 3', Foo.props)

setTimeout(() => {
  console.log('Foo props async', Foo.props)
  console.log(test.props)
}, 500)

/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

//import App from './App.vue'
//import Vue from 'vue'
//import VueWebComponent from '../../src/index'

//console.log(' ----- App', App)

//document.body.innerHTML = '<div id="root"><app-element></app-element></div>'
//const root = document.querySelector('#root')

////new Vue({
  ////el: root,
  ////components: { appElement: App },
////})

//customElements.define('app-element', VueWebComponent(App))

//console.log(' ----- App 2', App)

/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

//import { props, withComponent } from 'skatejs'
//import VueWebComponent from '../../src/index'

//class MyEl extends withComponent(HTMLElement) {
  //static get props() {
    //return {
      //msg: props.object,
      //bool: props.boolean,
    //}
  //}

  //render() {
    //return `
      //msg: ${this.msg.n}
      //<h1><real-slot></real-slot></h1>
      //<span><real-slot name="foo"></real-slot></span>
    //`
  //}

  //updated(...args) {
    //super.updated(...args)
    //console.log('updated!', this.msg, this.bool)
  //}
//}

//customElements.define('my-el', MyEl)

//document.body.innerHTML = `
  //<my-el id="myel" msg='{"n":57}'><p slot="foo">test</p></my-el>
//`

//setTimeout(() => myel.msg = {n:65}, 2000)
