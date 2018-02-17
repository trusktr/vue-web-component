import { mount } from '@skatejs/bore'
import { h } from '@skatejs/val'
import VueWebComponent from '.'

const template = h('div', {}, '{{msg}} {{name}}!')

const TestVue = {
    template,
    props: {
        name: {
            type: String,
            default: 'World',
        },
    },
    data: () => (console.log('SET UP THE DATA'), {
        msg: 'Hello'
    }),
}

const TestElement = VueWebComponent( TestVue )
customElements.define('test-element', TestElement)

test('VueWebComponent props', done => {
    const el = document.createElement('test-element')

    setTimeout(() => {
        console.log('TestElement content:', el.outerHTML)
        expect( el.nodeName.toLowerCase() ).toBe( 'test-element' )
        done()
    }, 1000)
})
