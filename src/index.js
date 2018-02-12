import Vue from 'vue'
import { withLifecycle, withUpdate, withRenderer, props as skatePropTypes } from 'skatejs'

// create a Custom Element class from a Vue component
export default
function VueWebComponent( vueComponent, ElementClass ) {
    ElementClass = ElementClass || class extends HTMLElement {}

    // NOTE! This mutates the given component spec, see
    // https://github.com/vuejs/vue/issues/7494. We do this up front (instead of
    // lazily in the element's renderer callback) so that when we're ready to
    // work with the spec it has already been mutated and there won't be any
    // surprises (or uglier code that conditionally checks for both forms of the
    // spec).
    const Component = Vue.extend( vueComponent )

    // map from Vue prop types to SkateJS prop types
    const vuePropTypes = makeVuePropTypes( vueComponent.props )

    // contains scope ID of this element's Vue component as well as sub component
    // IDs
    const scopeIds = getAllScopeIds( vueComponent )

    // this will contain all CSS rules for this element's Vue component and
    // sub-components
    let matchingRules = null

    return class VueWebComponent extends withUpdate( withRenderer( ElementClass ) ) {

        constructor(...args) {
            super(...args)

            this.vue_instance = new Component
            this.vue_instancePromise = null
            this.vue_mounted = false
        }

        /**
         * Define a renderer that mounts a Vue component in this element's shadow
         * root.
         */
        renderer( root, render ) {
            if ( this.vue_mounted ) return

            // mount the component
            this.vue_mountComponent( root )

            // bring in the global styling
            requestAnimationFrame(() => this.vue_applyStyle( root ))
        }

        /**
         * mount a Vue `component` inside the given `container`. This is analgous
         * to ReactDOM.render.
         */
        vue_mountComponent( container ) {

            // `tmp` will get replaced by the DOM generated from the component
            const tmp = document.createElement( 'tmp' )
            tmp.style.display = 'none'
            container.appendChild( tmp )

            this.vue_instance.$mount( tmp )

            this.vue_mounted = true
        }

        /**
         * finds the global style that contains this element's Vue instance's style
         * and style of its sub-components and copies the styles into this
         * element's shadow root, otherwise the global style will not penetrate
         * into the shadow root.
         */
        vue_applyStyle( root ) {

            // if no components have scoped style
            if (! scopeIds.length ) return

            const newStyle = document.createElement( 'style' )

            // WebKit hack, requires appending a text node
            newStyle.appendChild(document.createTextNode('/* Vue styles are inside this element\'s CSSStyleSheet */'))

            // newStyle.sheet won't exist unless the element is first appended
            root.appendChild( newStyle )
            const newSheet = newStyle.sheet
            const newRules = newSheet.cssRules || newSheet.rules

            // we have to initialize this here (not outside the class) because global
            // styles are added to DOM after the first Vue instance is created
            if (! matchingRules ) matchingRules = getMatchingCSSRules( scopeIds )

            for ( const rule of matchingRules )
                newSheet.insertRule(rule.cssText, newRules.length)

            // TODO: make sure this works with conditional content. Maybe
            // conditional content that isn't rendered yet doesn't have it's
            // styles inserted into DOM???

        }

        static get props() { return vuePropTypes }

        updated( prevProps, prevState ) {
            super.updated( prevProps, prevState )

            // pass this.props as first arg, whose keys are iterated on in
            // forChangedProps, otherwise nothing happens the first time
            // because prevProps is empty at first.
            forChangedProps( this.props, prevProps, ( name, oldVal ) => {
                // pass the value along
                this.vue_instance[ name ] = this[ name ]
            })
        }

    }

}

// a hack class used so we don't conflict with Vue's builtin <slot> component. Is there a better way?
class RealSlot extends withLifecycle( withUpdate( HTMLElement ) ) {
    constructor(...args) {
        super(...args)
        this.style.display = 'contents'
    }

    connected() {
        if (this.actualSlot) return
        this.actualSlot = document.createElement('slot')
        this.appendChild(this.actualSlot)
    }

    static get props() {
        return {
            name: Object.assign({}, skatePropTypes.string, {attribute: true} )
        }
    }

    updated(prevProps) {
        if ( this.name && this.name !== prevProps.name )
            this.actualSlot.setAttribute('name', this.name)
    }
}
customElements.define('real-slot', RealSlot)

function makeVuePropTypes( vueProps ) {
    if (! vueProps ) return {}

    const result = {}

    const warn = () => console.warn('vue-web-component: The Vue component that you converted into a custom element will receive only string values from the "'+key+'" attribute. If you\'d like string values from attributes coerced into a certain type, define that type in your Vue component. For example: props: { "'+key+'": Number }')

    function getDefault( vueProp ) {
        // TODO: calling the default value factory and using that single value
        // causes all instanced of the element to use the same cached value for
        // Objects and Arrays. How to fix?
        if (typeof vueProp.default == 'function')
            return Object.freeze(vueProp.default())
        else
            return vueProp.default
    }

    for ( const key in vueProps ) {
        const prop = vueProps[ key ]
        const defaultVal = getDefault(prop)

        if ( prop.type === null ) {
            result[ key ] = skatePropTypes.any
            warn()
            console.warn('vue-web-component: You did not specify a prop type for the attribute mentioned in the previous warning. Any values for this attribute will be passed as a string value to the Vue component.')
        }
        else if ( prop.type === Number )
            result[ key ] = Object.assign({}, skatePropTypes.number, {default:defaultVal})
        else if ( prop.type === String )
            result[ key ] = Object.assign({}, skatePropTypes.string, {default:defaultVal})
        else if ( prop.type === Boolean )
            result[ key ] = Object.assign({}, skatePropTypes.boolean, {default:defaultVal})
        else if ( prop.type === Object )
            result[ key ] = Object.assign({}, skatePropTypes.object, {default:defaultVal})
        else if ( prop.type === Array )
            result[ key ] = Object.assign({}, skatePropTypes.array, {default:defaultVal})
        else {
            result[ key ] = skatePropTypes.any
            warn()
            console.warn('vue-web-component: You specified a type in your Vue component that is currently is not supported by vue-web-component. Any values for the attribute mentioned in the previous warning will be passed as string value to the Vue component.')
        }

    }

    return result

}

function getAllScopeIds( vueComponent ) {

    const result = []

    ~function _getAllScopeIds( vueComponent ) {

        if ( vueComponent._scopeId ) result.push( vueComponent._scopeId )

        for ( const subComponent in vueComponent.components )
            _getAllScopeIds( vueComponent.components[ subComponent ] )

    }( vueComponent )

    return result

}

function getMatchingCSSRules( scopeIds ) {
    const sheets = document.styleSheets

    const result = []

    Array.prototype.forEach.call( sheets, sheet => {
        const rules = sheet.cssRules || sheet.rules

        Array.prototype.forEach.call( rules, rule => {

            if ( scopeIds.some( id => rule.selectorText.indexOf( id ) > -1 ) ) {
                result.push( rule )
            }

        })

    })

    return result
}

function forChangedProps(oldProps, newProps, action) {
    for ( const oldKey in oldProps )
        if ( oldProps[ oldKey ] !== newProps[ oldKey ] )
            action( oldKey, oldProps[ oldKey ] )
}

// IMPORTANT! keep this line as the last line, it is auto-generated from package.json version.
export const version = '1.1.0'
