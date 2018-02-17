import '@skatejs/ssr/register' // creates DOM APIs globally
import { mount } from '@skatejs/bore'
import { h } from '@skatejs/val'
import VueWebComponent from '.'

test('testing works', () => {

    // TODO
    console.log(h('div').outerHTML)

    expect(VueWebComponent).toBe(VueWebComponent)
})
