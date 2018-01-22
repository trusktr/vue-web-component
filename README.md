
vue-web-component
-----------------

Generate custom elements from [Vue](https://vuejs.org) component definitions.

### What?

`vue-web-component` generates Web Components (Custom Elements) that are
consumable in any sort of web application and can be manipulated by any view
library like Vue, React, Angular, and others. Custom Elements are user-defined
elements that the browser knows how to work with just like with builtin
elements.

Plus, it's just easy to write Web Components this way!

`vue-web-component` takes the authoring of Custom Elements one step further by
letting you define a Vue component from which to render the content of your
Custom Element. Attribute changes on the generated custom element are
automatically propagated to the underlying Vue component instance, and the
elements are composable with ShadowDOM.

Behind the scenes, utilities offered by [SkateJS](http://skatejs.netlify.com/)
are used in wiring up the functionality. SkateJS provides a set of powerfully
simple mixins that make defining custom elements super simple and convenient,
on top of the browser's native Web Components APIs.

#### Pros:

1. Using Vue makes it easy to describe how the DOM content of your custom
   element will change depending on attribute.
1. Morphing your DOM will be automatically fast thanks to Vue's dom diffing.
1. Modifying properties (attributes) of your element will re-render your
   component DOM content automatically, it's nice!
1. Vue single-file-component files are super nice to work with, and support a
   variety of languages like Pug, CoffeeScript, TypeScript, Sass, Less, Stylus,
   and more.
1. For a wide variety of elements, using this approach makes it dirt simple to
   write custom elements.
1. There's awesome tooling around Vue like loaders and syntax plugins for
   various editors, that make working with Vue magical.
1. There's many ways to define a Vue component, all of which work with
   `vue-web-component`. For example, see [7 Ways to Define a Component Template
   in
   VueJS](https://medium.com/js-dojo/7-ways-to-define-a-component-template-in-vuejs-c04e0c72900d).

#### Cons:

1. Not all custom elements need a view layer for describing how their inner DOM
   changes. It can be leaner to just define the static DOM yourself in this
   case yourself, and [SkateJS](https://github.com/skatejs/skatejs/) is a great
   tool for that. Though, doing it with Vue will still be simple!
1. When writing a Vue-based component, you have less control of the Web
   Components APIs. Usually that's okay, but sometimes you may want more
   control.  Well, the good thing is the that the output from `VueWebComponent`
   is a SkateJS class with useful methods and properties that you can set and
   override. See below for more detail.
1. A component doesn't always need DOM content. It might be a pure-JavaScript
   component. In that case using vanilla Web Components APIs can be preferable
   rather than loading a `new Vue`, but it depends on your case.

### But, [`vue-custom-element`](https://github.com/karol-f/vue-custom-element) already exists. Why another one?

`vue-custom-element` didn't meet some requirements. I needed the following:

1. Elements are instantiated only once
1. Elements are nestable and composable
1. Elements distribute as expected with ShadowDOM.

See here for details on [why `vue-custom-element` didn't meet these
requirements](https://github.com/karol-f/vue-custom-element/issues/74).

Requirements
============

- You'll need a Web Component polyfill to run this in older browsers that don't
  yet have Custom Elements and/or ShadowDOM.
- The source is not transpiled for older browsers so you may have to transpile
  this in your own build setup.

Basic Usage
===========

You can import a Vue component then make a custom element out of it:

```js
import Foo from './Foo.vue'
import VueWebComponent from 'vue-web-component'

// define a custom element with the Vue component
customElements.define('foo-element', VueWebComponent( Foo ) )

// now use it with regular DOM APIs
document.body.innerHTML = `
    <foo-element></foo-element>
`
```

You can also define the custom element inline, using an object literal of the
same format as a Vue component:

```js
import VueWebComponent from 'vue-web-component'

// define a custom element using an object literal
customElements.define('foo-element', VueWebComponent( {
    props: {
        // ...
    },
    data: () => ({
        // ...
    }),
    methods: {
        // ...
    },
    mounted() {
        // ...
    },
    // etc
} ) )

// now use it with regular DOM APIs
document.body.innerHTML = `
    <foo-element></foo-element>
`
```

Usage inside other Vue components
=================================

Whether you create a Custom Element from a Vue component or not is your choice.
You can use the Vue component inside another component without using it in the
custom element form. The following example shows usage of both forms inside a
Vue component, where the result is the same for all uses of the Foo component:


```vue
<template>
  <div class="app">
    <!-- Foo as a Vue component, the value for `message` gets passed as an object literally -->
    <foo :message="{n: 999}"></foo>

    <!-- Foo as a custom element, the value for `message` gets deserialized first, then passed to the underlying Vue component -->
    <!-- The element will be passed the literal attribute value, the string '{"n": 111}', and then deserialize it. -->
    <foo-element message='{"n": 111}'></foo-element>

    <!-- Foo as a custom element, the value for `message` gets deserialized first, then passed to the underlying Vue component -->
    <!-- Vue will calculate the value of the attribute (it'll be the string `{"n": 111}`) then pass that string to the element which will deserialize it. -->
    <foo-element v-bind:message='`{"n": 111}`'></foo-element>
  </div>
</template>

<script>
  import Foo from './Foo'
  import VueWebComponent from 'vue-web-component'

  // We'll use Foo as a custom element...
  customElements.define('foo-element', VueWebComponent(Foo))

  export default {

    // ...and we'll use Foo as a Vue component directly too
    components: { Foo }
  }
</script>
```

Scoped styles
=============

Scoped styles (using `<style scoped>`) should work as expected. If not, please
file a bug.

In fact, scoped styles work better with elements made with `vue-web-components`
because styles can not leak into deeper shadow roots!!!  This is a win!!
Scoped styles with plain Vue components, on the other hand, will effect all
content of sub-components in the element where the style is
defined](https://github.com/vuejs/vue-loader/issues/957). This means that you
can use `vue-web-component` to create style boundaries in your application when
otherwise you cannot do this with Vue alone.

`vue-web-component` copies global styles generated by Vue and injects them into
the generated element's shadow root because global styles otherwise would not
have any effect on the content of the generated elements, due to the rules of
how ShadowDOM works.

Props from Attributes
=====================

Props that you define in your Vue component will be available as attributes on
the generated custom element.

For example, in the Vue component:

```vue
<!-- FooBar.vue -->
<template> <span> {{ msg }} </span> </template>
<script>
    export default {
        props: {
            msg: Number
        },
    }
</script>
```

you can use the attributes to set values, as expected:

```js
import FooBar from './FooBar.vue'
import VueWebComponent from 'vue-web-component'

customElements.define( 'foo-bar', VueWebComponent( FooBar ) )

document.body.innerHTML = `
    <foo-bar msg="42"></foo-bar>
`

document.querySelector('foo-bar').setAttribute('msg', 2.71828)
```

In that example, because the type of `msg` is `Number`, the attribute value on
the element will be deserialized into a number with `parseFloat`, thanks to some
convenient features of SkateJS. Keep in mind that if you do something like
`msg="asdf35"`, then this will yield a `NaN` just as expected from
`parseFloat`.

Supported prop types are `Number`, `String`, `Boolean`, `Object`, `Array`, and `null`
(`null` is the default in Vue, which is basically like `any` in Typescript,
which means the values can be anything).

TODO: `Symbol` type. If you really need that, please open an issue or PR. Thanks!

### caveats with prop from attributes

The following caveats apply only if you use the component as an element
generated with `vue-web-component`. Otherwise, using it as a Vue component inside
another component does not have these caveats.

Custom constructor types are not supported. We don't have a way (yet) to
deserialize a string into a specific constructor. See below, and PRs welcome!

At the moment, `vue-web-component` supports only simple prop types, like the
ones that were just listed in the previous paragraph. If you use more complex
prop types, like custom validators, `Function`, and OR types, for example

```js
props: {
    msg: [String, Number] // String OR Number
}
```

that won't work well, and the prop will be treated like `any` in TypeScript,
and what this means in practice is that the string value of the generated
element's `msg` attribute will not be deserialized, and the string value will be
passed to the inner Vue component to do whatever it wants with the string
value.

To get the best use out of the runtime type system, see the following example
to get an idea of what may and may not work well:

```vue
<!-- FooBar.vue -->
<template> ... </template>
<script>
    export default {
        props: {
            foo: Number, // works fine
            bar: String, // works fine
            baz: Object, // works fine
            lorem: Boolean, // works fine
            ipsum: null, // works fine, any type
            barbaz: Array, // works fine
            foobar: Function // won't work, usually you can emit events instead
            blah: { // works fine, just like others, its just using the object form
                type: Number,
                default: 5,
            },
            boing: { // works fine
                type: Object,
                default: () => ({foo: 'bar'}),
            },
            lala: { // may not work
                validator: function(value) {
                    typeof value === 'string' // always true
                }
            }
            something: CustomConstructor, // won't work
        },

        // or

        props: [ 'foo', 'bar', 'baz' ], // may not work well
    }
</script>
```

It's key to note that element attributes are always strings. Therefore, string
values get deserialized into their appropriate types. If a prop doesn't have a type
then the attribute value will be left as-is: a string.

SkateJS (and Custom Elements by default) does not yet have a tool for passing non-string values to elements
(like A-Frame does), at least for now.

With this in mind, here's how the the following would work based on the above props types:

```html
<!-- Number: The string "5" will be converted into a Number then passed to the Vue component -->
<foo-bar foo="5"></foo-bar>
<foo-bar blah="5"></foo-bar>

<!-- String: The string "5" will be passed as is -->
<foo-bar bar="5"></foo-bar>

<!-- Object: The string '{"n":123}' will be converted into an object with JSON.parse()
and passed to the Vue component -->
<foo-bar baz='{"n":123}'></foo-bar>
<foo-bar boing='{"n":123}'></foo-bar>

<!-- Boolean: Boolean attributes are not based on their value. Instead, if the
attribute exists, the value passed to the Vue component is `true` regardless
of the attribute value. If the attribute doesn't exist, then `false` is passed.  -->
<!-- In all of the following, Vue receives a value of `true`: -->
<foo-bar lorem></foo-bar>
<foo-bar lorem="false"></foo-bar>
<foo-bar lorem="true"></foo-bar>
<foo-bar lorem="blah blah"></foo-bar>
<!-- Only in the following does the Vue component receive `false` for lorem: -->
<foo-bar></foo-bar>

<!-- null ("any"): When props is an array like `props:['foo','bar','baz']`, or the
value is `null`, the attributes are treated the same as String, and their values are
passed as-is. The string "anything" is passed as-is: -->
<foo-bar ipsum="anything"></foo-bar>

<!-- Array: The string '[1,2,3]' will be converted into an Array with JSON.parse()
and passed to the Vue component -->
<foo-bar barbaz='[1,2,3]'></foo-bar>

<!-- Function: This doesn't work. There's (currently) no meaningful way to convert a string to a function.
Usually this use case is for parents to pass functions to children, but this means a parent element
would have to convert the function to a string, then it would need to be converted back to a function in the child
which means all variable scope is lost, so this would be pointless for most cases. The type will be treated as
String, and the attribute value will be passed as a string to the Vue component. -->
<foo-bar foobar="function() { this is basically pointless! (for now) }"></foo-bar>

<!-- Custom validator: Props with a custom validator will be treated as String and passed as-is to the Vue component.
The validator function will therefore receive the string value. Then this is only good with string values! -->
<foo-bar lala="I am a string passed to the validator function"></foo-bar>

<!-- CustomConstructor: This currently will not work. PRs Welcome! The attribute value will be treated as String
and be sent as-is to the Vue component. -->
<foo-bar something="I am a string that gets passed on, no instance of CustomConstructor will be created"></foo-bar>
```

Props from instance properties
==============================

Not only can you set attributes on the generated elements, but you can also set
matching properties on the instances.

For example, given the following Vue component,

```vue
<!-- FooBar.vue -->
<template> <span> {{ msg }} </span> </template>
<script>
    export default {
        props: {
            msg: Number
        },
    }
</script>
```

you can set properties on the element instance directly, similarly to how we
can do on Vue component instances:

```js
import FooBar from './FooBar.vue'
import VueWebComponent from 'vue-web-component'

customElements.define( 'foo-bar', VueWebComponent( FooBar ) )

document.body.innerHTML = `
    <foo-bar msg="42"></foo-bar>
`

const el = document.querySelector('foo-bar')
el.msg = 2.71828
```

Using the property method, you can skip many (if not all) of the caveats
mentioned in the previous section regarding props from attributes, because you
can pass any value you want from JavaScript and it will go directly to the Vue
component instance.

Nesting and composition
=======================

Elements generated with `vue-web-component` from Vue components are fully
nestable and composable. For example, given that we've generated the elements
`<foo-bar>` and `<lorem-ipsum>` out of Vue components, we can compose them in
the DOM and they will appear that way in the DOM when you look at the inspector
(as expected, but this was not the case with `vue-custom-element`):

```js
document.body.innerHTML = `
    <foo-bar>
        <lorem-ipsum>
            <foo-bar></foo-bar>
        </lorem-ipsum>
        <foo-bar>
            <lorem-ipsum></lorem-ipsum>
        </foo-bar>
    </foo-bar>
    <lorem-ipsum></lorem-ipsum>
`
```

Use with ShadowDOM
==================

Elements generated by `vue-web-component` have a ShadowDOM root by default. A
special element, `<real-slot>` is registered for you by `vue-web-component` that
you can use to define **_real_** ShadowDOM `<slot>` elements. Using `<slot>`
instead of `<real-slot>` won't work as you expect because those will be treated
as Vue's virtual slots when Vue renders it's template, which won't work with
actual ShadowDOM.

Given the following code,

```vue
<!-- FooBar.vue -->
<template>
    <div>
        <real-slot></real-slot>
    </div>
<template>
```

```vue
<!-- LoremIpsum.vue -->
<template>
    <p>
        <real-slot></real-slot>
    </p>
<template>
```

```js
import FooBar from './FooBar'
import LoremIpsum from './LoremIpsum'
import VueWebComponent from 'vue-web-component'

customElements.define('foo-bar', VueWebComponent(FooBar))
customElements.define('lorem-ipsum', VueWebComponent(LoremIpsum))

document.body.innerHTML = `
    <foo-bar id="foo">
        <lorem-ipsum id="lorem">Hello</lorem-ipsum>
    </foo-bar>
`
```

then the DOM will contain the following (take a look in the element inspector):

```html
<foo-bar id="foo">
    <#shadow-root>
        <div>
            <real-slot>
                <slot>
                    ↳ <lorem-ipsum id="lorem"> // distributed node
                </slot>
            </real-slot>
        </div>
    </#shadow-root>
    <lorem-ipsum id="lorem">
        <#shadow-root>
            <p>
                <real-slot>
                    <slot>
                        ↳ "Hello" // distributed node
                    </slot>
                </real-slot>
            </p>
        </#shadow-root>
        Hello
    </lorem-ipsum>
</foo-bar>
```

The "composed tree" (an internal tree based on the composition of shadow roots
in the DOM that determines the final content that the browser will render) will
look like this:

```html
<foo-bar id="foo">
    <div>
        <real-slot>
            <lorem-ipsum id="lorem">
                <p>
                    <real-slot>
                        Hello
                    </real-slot>
                </p>
            </lorem-ipsum>
        </real-slot>
    </div>
</foo-bar>
```

Note, the `<real-slot>` elements remain as part of the composed tree, and they
behave like inline elements. Feel free to style them as needed.

In the near future (or perhaps now depending on when you read this), browsers
will have a `display: contents` CSS property that will make an element render
only it's content and an element with `display:contents` will render as if it
was not in the tree and only its children were in its place. The `<real-slot>`
elements are given this styling, and when this style is supported, the
"composed tree" will be more like this:

```html
<foo-bar id="foo">
    <div>
        <lorem-ipsum id="lorem">
            <p>
                Hello
            </p>
        </lorem-ipsum>
    </div>
</foo-bar>
```

TODO
====

- [ ] Add API that allows Vue component authors to be able to more easily work
  around edge cases when they detect that their component is used as a custom
  element.
