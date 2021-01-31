
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\Hero.svelte generated by Svelte v3.32.1 */

    const file = "src\\components\\Hero.svelte";
    const get_Description_slot_changes = dirty => ({});
    const get_Description_slot_context = ctx => ({});
    const get_Title_slot_changes = dirty => ({});
    const get_Title_slot_context = ctx => ({});

    function create_fragment(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let h1;
    	let t0;
    	let h4;
    	let t1;
    	let img;
    	let img_src_value;
    	let current;
    	const Title_slot_template = /*#slots*/ ctx[2].Title;
    	const Title_slot = create_slot(Title_slot_template, ctx, /*$$scope*/ ctx[1], get_Title_slot_context);
    	const Description_slot_template = /*#slots*/ ctx[2].Description;
    	const Description_slot = create_slot(Description_slot_template, ctx, /*$$scope*/ ctx[1], get_Description_slot_context);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			if (Title_slot) Title_slot.c();
    			t0 = space();
    			h4 = element("h4");
    			if (Description_slot) Description_slot.c();
    			t1 = space();
    			img = element("img");
    			attr_dev(h1, "class", "font-bold text-4xl");
    			add_location(h1, file, 8, 12, 280);
    			attr_dev(h4, "class", "text-xl ");
    			add_location(h4, file, 12, 12, 406);
    			attr_dev(div0, "class", "flex flex-col lg:text-left text-center lg:items-baseline flex-grow  ");
    			add_location(div0, file, 7, 8, 184);
    			if (img.src !== (img_src_value = /*img_link*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "600px");
    			attr_dev(img, "height", "auto");
    			attr_dev(img, "class", " rounded-xl shadow-md ");
    			add_location(img, file, 17, 8, 540);
    			attr_dev(div1, "class", "grid grid-cols-1 lg:grid-cols-2 items-center pb-12 gridbox gap-10");
    			add_location(div1, file, 6, 4, 95);
    			attr_dev(div2, "class", "mx-auto max-w-6xl py-12 ");
    			add_location(div2, file, 5, 0, 51);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);

    			if (Title_slot) {
    				Title_slot.m(h1, null);
    			}

    			append_dev(div0, t0);
    			append_dev(div0, h4);

    			if (Description_slot) {
    				Description_slot.m(h4, null);
    			}

    			append_dev(div1, t1);
    			append_dev(div1, img);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (Title_slot) {
    				if (Title_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(Title_slot, Title_slot_template, ctx, /*$$scope*/ ctx[1], dirty, get_Title_slot_changes, get_Title_slot_context);
    				}
    			}

    			if (Description_slot) {
    				if (Description_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(Description_slot, Description_slot_template, ctx, /*$$scope*/ ctx[1], dirty, get_Description_slot_changes, get_Description_slot_context);
    				}
    			}

    			if (!current || dirty & /*img_link*/ 1 && img.src !== (img_src_value = /*img_link*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(Title_slot, local);
    			transition_in(Description_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(Title_slot, local);
    			transition_out(Description_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (Title_slot) Title_slot.d(detaching);
    			if (Description_slot) Description_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Hero", slots, ['Title','Description']);
    	let { img_link } = $$props;
    	const writable_props = ["img_link"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hero> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("img_link" in $$props) $$invalidate(0, img_link = $$props.img_link);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ img_link });

    	$$self.$inject_state = $$props => {
    		if ("img_link" in $$props) $$invalidate(0, img_link = $$props.img_link);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [img_link, $$scope, slots];
    }

    class Hero extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { img_link: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hero",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*img_link*/ ctx[0] === undefined && !("img_link" in props)) {
    			console.warn("<Hero> was created without expected prop 'img_link'");
    		}
    	}

    	get img_link() {
    		throw new Error("<Hero>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set img_link(value) {
    		throw new Error("<Hero>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Chips.svelte generated by Svelte v3.32.1 */

    const file$1 = "src\\components\\Chips.svelte";

    function create_fragment$1(ctx) {
    	let button;
    	let t;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(/*name*/ ctx[0]);
    			attr_dev(button, "class", button_class_value = "" + (/*clickedColor*/ ctx[2] + " " + /*txt_color*/ ctx[1] + "\r\n    text-xs rounded-full shadow-md py-2 px-4 mx-1 my-0.5  font-semibold  focus:outline-none\r\n    transition duration-500 ease-in-out transform hover:scale-110 hover:bg-blue-500"));
    			add_location(button, file$1, 13, 0, 276);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*clickHandler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t, /*name*/ ctx[0]);

    			if (dirty & /*clickedColor, txt_color*/ 6 && button_class_value !== (button_class_value = "" + (/*clickedColor*/ ctx[2] + " " + /*txt_color*/ ctx[1] + "\r\n    text-xs rounded-full shadow-md py-2 px-4 mx-1 my-0.5  font-semibold  focus:outline-none\r\n    transition duration-500 ease-in-out transform hover:scale-110 hover:bg-blue-500"))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Chips", slots, []);
    	let { name } = $$props;
    	let { bg_color } = $$props;
    	let { txt_color } = $$props;
    	let { hover_color } = $$props; //If you get this to work, tell me
    	let clickedColor = "bg-gray-800";

    	function clickHandler() {
    		$$invalidate(2, clickedColor = bg_color);
    	}

    	const writable_props = ["name", "bg_color", "txt_color", "hover_color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Chips> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("bg_color" in $$props) $$invalidate(4, bg_color = $$props.bg_color);
    		if ("txt_color" in $$props) $$invalidate(1, txt_color = $$props.txt_color);
    		if ("hover_color" in $$props) $$invalidate(5, hover_color = $$props.hover_color);
    	};

    	$$self.$capture_state = () => ({
    		name,
    		bg_color,
    		txt_color,
    		hover_color,
    		clickedColor,
    		clickHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("bg_color" in $$props) $$invalidate(4, bg_color = $$props.bg_color);
    		if ("txt_color" in $$props) $$invalidate(1, txt_color = $$props.txt_color);
    		if ("hover_color" in $$props) $$invalidate(5, hover_color = $$props.hover_color);
    		if ("clickedColor" in $$props) $$invalidate(2, clickedColor = $$props.clickedColor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, txt_color, clickedColor, clickHandler, bg_color, hover_color];
    }

    class Chips extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			name: 0,
    			bg_color: 4,
    			txt_color: 1,
    			hover_color: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chips",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<Chips> was created without expected prop 'name'");
    		}

    		if (/*bg_color*/ ctx[4] === undefined && !("bg_color" in props)) {
    			console.warn("<Chips> was created without expected prop 'bg_color'");
    		}

    		if (/*txt_color*/ ctx[1] === undefined && !("txt_color" in props)) {
    			console.warn("<Chips> was created without expected prop 'txt_color'");
    		}

    		if (/*hover_color*/ ctx[5] === undefined && !("hover_color" in props)) {
    			console.warn("<Chips> was created without expected prop 'hover_color'");
    		}
    	}

    	get name() {
    		throw new Error("<Chips>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Chips>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bg_color() {
    		throw new Error("<Chips>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bg_color(value) {
    		throw new Error("<Chips>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get txt_color() {
    		throw new Error("<Chips>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set txt_color(value) {
    		throw new Error("<Chips>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hover_color() {
    		throw new Error("<Chips>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hover_color(value) {
    		throw new Error("<Chips>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Button.svelte generated by Svelte v3.32.1 */

    const file$2 = "src\\components\\Button.svelte";

    function create_fragment$2(ctx) {
    	let button;
    	let t;
    	let button_class_value;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(/*name*/ ctx[0]);
    			attr_dev(button, "class", button_class_value = "" + (/*bg_color*/ ctx[1] + " " + /*txt_color*/ ctx[2] + "\r\n    rounded shadow-md py-2 px-4 mx-1 my-0.5 font-semibold focus:outline-none\r\n    transition duration-500 ease-in-out transform hover:scale-110 hover:bg-blue-500"));
    			add_location(button, file$2, 11, 0, 171);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t, /*name*/ ctx[0]);

    			if (dirty & /*bg_color, txt_color*/ 6 && button_class_value !== (button_class_value = "" + (/*bg_color*/ ctx[1] + " " + /*txt_color*/ ctx[2] + "\r\n    rounded shadow-md py-2 px-4 mx-1 my-0.5 font-semibold focus:outline-none\r\n    transition duration-500 ease-in-out transform hover:scale-110 hover:bg-blue-500"))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, []);
    	let { name } = $$props;
    	let { bg_color } = $$props;
    	let { txt_color } = $$props;
    	let { hover_color } = $$props; //If you get this to work, tell me
    	const writable_props = ["name", "bg_color", "txt_color", "hover_color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("bg_color" in $$props) $$invalidate(1, bg_color = $$props.bg_color);
    		if ("txt_color" in $$props) $$invalidate(2, txt_color = $$props.txt_color);
    		if ("hover_color" in $$props) $$invalidate(3, hover_color = $$props.hover_color);
    	};

    	$$self.$capture_state = () => ({ name, bg_color, txt_color, hover_color });

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("bg_color" in $$props) $$invalidate(1, bg_color = $$props.bg_color);
    		if ("txt_color" in $$props) $$invalidate(2, txt_color = $$props.txt_color);
    		if ("hover_color" in $$props) $$invalidate(3, hover_color = $$props.hover_color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, bg_color, txt_color, hover_color];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			name: 0,
    			bg_color: 1,
    			txt_color: 2,
    			hover_color: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<Button> was created without expected prop 'name'");
    		}

    		if (/*bg_color*/ ctx[1] === undefined && !("bg_color" in props)) {
    			console.warn("<Button> was created without expected prop 'bg_color'");
    		}

    		if (/*txt_color*/ ctx[2] === undefined && !("txt_color" in props)) {
    			console.warn("<Button> was created without expected prop 'txt_color'");
    		}

    		if (/*hover_color*/ ctx[3] === undefined && !("hover_color" in props)) {
    			console.warn("<Button> was created without expected prop 'hover_color'");
    		}
    	}

    	get name() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bg_color() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bg_color(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get txt_color() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set txt_color(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hover_color() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hover_color(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\CustomCard.svelte generated by Svelte v3.32.1 */

    const file$3 = "src\\components\\CustomCard.svelte";

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let div1_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "mx-6 py-4 ");
    			add_location(div0, file$3, 7, 4, 241);
    			attr_dev(div1, "class", div1_class_value = " " + /*width*/ ctx[0] + " min-" + /*height*/ ctx[1] + " " + /*bg_color*/ ctx[2] + " shadow-md rounded-xl mx-2 my-4 transition duration-500 ease-in-out transform hover:scale-110");
    			add_location(div1, file$3, 6, 0, 96);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*width, height, bg_color*/ 7 && div1_class_value !== (div1_class_value = " " + /*width*/ ctx[0] + " min-" + /*height*/ ctx[1] + " " + /*bg_color*/ ctx[2] + " shadow-md rounded-xl mx-2 my-4 transition duration-500 ease-in-out transform hover:scale-110")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CustomCard", slots, ['default']);
    	let { width } = $$props;
    	let { height } = $$props;
    	let { bg_color } = $$props;
    	const writable_props = ["width", "height", "bg_color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CustomCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("bg_color" in $$props) $$invalidate(2, bg_color = $$props.bg_color);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ width, height, bg_color });

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("bg_color" in $$props) $$invalidate(2, bg_color = $$props.bg_color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [width, height, bg_color, $$scope, slots];
    }

    class CustomCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { width: 0, height: 1, bg_color: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CustomCard",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*width*/ ctx[0] === undefined && !("width" in props)) {
    			console.warn("<CustomCard> was created without expected prop 'width'");
    		}

    		if (/*height*/ ctx[1] === undefined && !("height" in props)) {
    			console.warn("<CustomCard> was created without expected prop 'height'");
    		}

    		if (/*bg_color*/ ctx[2] === undefined && !("bg_color" in props)) {
    			console.warn("<CustomCard> was created without expected prop 'bg_color'");
    		}
    	}

    	get width() {
    		throw new Error("<CustomCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<CustomCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<CustomCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<CustomCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bg_color() {
    		throw new Error("<CustomCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bg_color(value) {
    		throw new Error("<CustomCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Footer.svelte generated by Svelte v3.32.1 */

    const file$4 = "src\\components\\Footer.svelte";

    function create_fragment$4(ctx) {
    	let footer;
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div = element("div");
    			if (default_slot) default_slot.c();
    			add_location(div, file$4, 1, 4, 77);
    			attr_dev(footer, "class", "bg-blue-500 text-white font-light px-10 py-10 text-xs ");
    			add_location(footer, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.32.1 */
    const file$5 = "src\\App.svelte";

    // (14:3) <h1 slot="Title">
    function create_Title_slot(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Header";
    			attr_dev(h1, "slot", "Title");
    			add_location(h1, file$5, 13, 3, 474);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_Title_slot.name,
    		type: "slot",
    		source: "(14:3) <h1 slot=\\\"Title\\\">",
    		ctx
    	});

    	return block;
    }

    // (15:3) <h4 slot="Description">
    function create_Description_slot(ctx) {
    	let h4;

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			h4.textContent = "Say something cool here even though your startup is going to be bankrupt in a year or two";
    			attr_dev(h4, "slot", "Description");
    			add_location(h4, file$5, 14, 3, 506);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_Description_slot.name,
    		type: "slot",
    		source: "(15:3) <h4 slot=\\\"Description\\\">",
    		ctx
    	});

    	return block;
    }

    // (13:2) <Hero img_link="https://upload.wikimedia.org/wikipedia/commons/f/f9/Phoenicopterus_ruber_in_S%C3%A3o_Paulo_Zoo.jpg">
    function create_default_slot_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(13:2) <Hero img_link=\\\"https://upload.wikimedia.org/wikipedia/commons/f/f9/Phoenicopterus_ruber_in_S%C3%A3o_Paulo_Zoo.jpg\\\">",
    		ctx
    	});

    	return block;
    }

    // (39:3) <CustomCard width="w-72" height="h-56" bg_color="bg-blue-500">
    function create_default_slot_5(ctx) {
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Title Text";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed efficitur bibendum massa sit amet pellentesque. Integer tincidunt nulla vitae scelerisque pretium. Sed ornare orci nisi, molestie fermentum neque fringilla ornare. Donec vitae nisl et massa aliquam ultricies vel eu quam. Fusce a nisl vel augue vulputate luctus ornare eu sapien. Mauris nec luctus ex, porta finibus tellus. Proin viverra eu augue a rhoncus. Etiam at imperdiet sem. Praesent vitae ligula pellentesque, efficitur enim id, eleifend lacus.";
    			attr_dev(h1, "class", "font-bold text-xl");
    			add_location(h1, file$5, 40, 4, 1530);
    			add_location(p, file$5, 41, 4, 1580);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(39:3) <CustomCard width=\\\"w-72\\\" height=\\\"h-56\\\" bg_color=\\\"bg-blue-500\\\">",
    		ctx
    	});

    	return block;
    }

    // (45:3) <CustomCard width="w-72" height="h-56" bg_color="bg-green-500">
    function create_default_slot_4(ctx) {
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Title Text";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Other Text";
    			attr_dev(h1, "class", "font-bold text-xl");
    			add_location(h1, file$5, 46, 4, 2218);
    			add_location(p, file$5, 47, 4, 2268);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(45:3) <CustomCard width=\\\"w-72\\\" height=\\\"h-56\\\" bg_color=\\\"bg-green-500\\\">",
    		ctx
    	});

    	return block;
    }

    // (51:3) <CustomCard width="w-72" height="h-56" bg_color="bg-purple-500">
    function create_default_slot_3(ctx) {
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Hover Me";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Other Text";
    			attr_dev(h1, "class", "font-bold text-xl");
    			add_location(h1, file$5, 52, 4, 2405);
    			add_location(p, file$5, 53, 4, 2453);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(51:3) <CustomCard width=\\\"w-72\\\" height=\\\"h-56\\\" bg_color=\\\"bg-purple-500\\\">",
    		ctx
    	});

    	return block;
    }

    // (56:3) <CustomCard width="w-72" height="h-56" bg_color="bg-blue-500">
    function create_default_slot_2(ctx) {
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Title Text";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed efficitur bibendum massa sit amet pellentesque. Integer tincidunt nulla vitae scelerisque pretium. Sed ornare orci nisi, molestie fermentum neque fringilla ornare. Donec vitae nisl et massa aliquam ultricies vel eu quam. Fusce a nisl vel augue vulputate luctus ornare eu sapien. Mauris nec luctus ex, porta finibus tellus. Proin viverra eu augue a rhoncus. Etiam at imperdiet sem. Praesent vitae ligula pellentesque, efficitur enim id, eleifend lacus.";
    			attr_dev(h1, "class", "font-bold text-xl");
    			add_location(h1, file$5, 57, 4, 2587);
    			add_location(p, file$5, 58, 4, 2637);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(56:3) <CustomCard width=\\\"w-72\\\" height=\\\"h-56\\\" bg_color=\\\"bg-blue-500\\\">",
    		ctx
    	});

    	return block;
    }

    // (62:3) <CustomCard width="w-72" height="h-56" bg_color="bg-green-500">
    function create_default_slot_1(ctx) {
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Title Text";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Other Text";
    			attr_dev(h1, "class", "font-bold text-xl");
    			add_location(h1, file$5, 63, 4, 3275);
    			add_location(p, file$5, 64, 4, 3325);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(62:3) <CustomCard width=\\\"w-72\\\" height=\\\"h-56\\\" bg_color=\\\"bg-green-500\\\">",
    		ctx
    	});

    	return block;
    }

    // (75:1) <Footer>
    function create_default_slot(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed efficitur bibendum massa sit amet pellentesque. Integer tincidunt nulla vitae scelerisque pretium. Sed ornare orci nisi, molestie fermentum neque fringilla ornare. Donec vitae nisl et massa aliquam ultricies vel eu quam. Fusce a nisl vel augue vulputate luctus ornare eu sapien. Mauris nec luctus ex, porta finibus tellus. Proin viverra eu augue a rhoncus.";
    			add_location(p, file$5, 75, 2, 3518);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(75:1) <Footer>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let main;
    	let section;
    	let hero;
    	let t0;
    	let div0;
    	let chips0;
    	let t1;
    	let chips1;
    	let t2;
    	let chips2;
    	let t3;
    	let chips3;
    	let t4;
    	let div1;
    	let button0;
    	let t5;
    	let button1;
    	let t6;
    	let button2;
    	let t7;
    	let button3;
    	let t8;
    	let div2;
    	let customcard0;
    	let t9;
    	let customcard1;
    	let t10;
    	let customcard2;
    	let t11;
    	let customcard3;
    	let t12;
    	let customcard4;
    	let t13;
    	let footer;
    	let current;

    	hero = new Hero({
    			props: {
    				img_link: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Phoenicopterus_ruber_in_S%C3%A3o_Paulo_Zoo.jpg",
    				$$slots: {
    					default: [create_default_slot_6],
    					Description: [create_Description_slot],
    					Title: [create_Title_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	chips0 = new Chips({
    			props: {
    				name: "Click Me",
    				bg_color: "bg-purple-500",
    				txt_color: "text-white"
    			},
    			$$inline: true
    		});

    	chips1 = new Chips({
    			props: {
    				name: "Hover Me",
    				bg_color: "bg-blue-500",
    				txt_color: "text-white"
    			},
    			$$inline: true
    		});

    	chips2 = new Chips({
    			props: {
    				name: "Shanghai",
    				bg_color: "bg-blue-500",
    				txt_color: "text-white"
    			},
    			$$inline: true
    		});

    	chips3 = new Chips({
    			props: {
    				name: "London",
    				bg_color: "bg-red-500",
    				txt_color: "text-white"
    			},
    			$$inline: true
    		});

    	button0 = new Button({
    			props: {
    				name: "Click Me",
    				bg_color: "bg-yellow-300",
    				txt_color: "text-black"
    			},
    			$$inline: true
    		});

    	button1 = new Button({
    			props: {
    				name: "Click Me",
    				bg_color: "bg-pink-300",
    				txt_color: "text-black"
    			},
    			$$inline: true
    		});

    	button2 = new Button({
    			props: {
    				name: "Click Me",
    				bg_color: "bg-gray-800",
    				txt_color: "text-white"
    			},
    			$$inline: true
    		});

    	button3 = new Button({
    			props: {
    				name: "Click Me",
    				bg_color: "bg-purple-900",
    				txt_color: "text-white"
    			},
    			$$inline: true
    		});

    	customcard0 = new CustomCard({
    			props: {
    				width: "w-72",
    				height: "h-56",
    				bg_color: "bg-blue-500",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	customcard1 = new CustomCard({
    			props: {
    				width: "w-72",
    				height: "h-56",
    				bg_color: "bg-green-500",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	customcard2 = new CustomCard({
    			props: {
    				width: "w-72",
    				height: "h-56",
    				bg_color: "bg-purple-500",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	customcard3 = new CustomCard({
    			props: {
    				width: "w-72",
    				height: "h-56",
    				bg_color: "bg-blue-500",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	customcard4 = new CustomCard({
    			props: {
    				width: "w-72",
    				height: "h-56",
    				bg_color: "bg-green-500",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	footer = new Footer({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			section = element("section");
    			create_component(hero.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			create_component(chips0.$$.fragment);
    			t1 = space();
    			create_component(chips1.$$.fragment);
    			t2 = space();
    			create_component(chips2.$$.fragment);
    			t3 = space();
    			create_component(chips3.$$.fragment);
    			t4 = space();
    			div1 = element("div");
    			create_component(button0.$$.fragment);
    			t5 = space();
    			create_component(button1.$$.fragment);
    			t6 = space();
    			create_component(button2.$$.fragment);
    			t7 = space();
    			create_component(button3.$$.fragment);
    			t8 = space();
    			div2 = element("div");
    			create_component(customcard0.$$.fragment);
    			t9 = space();
    			create_component(customcard1.$$.fragment);
    			t10 = space();
    			create_component(customcard2.$$.fragment);
    			t11 = space();
    			create_component(customcard3.$$.fragment);
    			t12 = space();
    			create_component(customcard4.$$.fragment);
    			t13 = space();
    			create_component(footer.$$.fragment);
    			add_location(div0, file$5, 17, 2, 637);
    			attr_dev(div1, "class", "mt-8");
    			add_location(div1, file$5, 24, 2, 950);
    			attr_dev(div2, "class", "flex-row flex flex-wrap");
    			add_location(div2, file$5, 36, 2, 1392);
    			attr_dev(section, "class", "flex-grow px-12 py-12");
    			add_location(section, file$5, 10, 1, 311);
    			attr_dev(main, "class", "flex flex-col min-h-screen");
    			add_location(main, file$5, 9, 0, 268);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section);
    			mount_component(hero, section, null);
    			append_dev(section, t0);
    			append_dev(section, div0);
    			mount_component(chips0, div0, null);
    			append_dev(div0, t1);
    			mount_component(chips1, div0, null);
    			append_dev(div0, t2);
    			mount_component(chips2, div0, null);
    			append_dev(div0, t3);
    			mount_component(chips3, div0, null);
    			append_dev(section, t4);
    			append_dev(section, div1);
    			mount_component(button0, div1, null);
    			append_dev(div1, t5);
    			mount_component(button1, div1, null);
    			append_dev(div1, t6);
    			mount_component(button2, div1, null);
    			append_dev(div1, t7);
    			mount_component(button3, div1, null);
    			append_dev(section, t8);
    			append_dev(section, div2);
    			mount_component(customcard0, div2, null);
    			append_dev(div2, t9);
    			mount_component(customcard1, div2, null);
    			append_dev(div2, t10);
    			mount_component(customcard2, div2, null);
    			append_dev(div2, t11);
    			mount_component(customcard3, div2, null);
    			append_dev(div2, t12);
    			mount_component(customcard4, div2, null);
    			append_dev(main, t13);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const hero_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				hero_changes.$$scope = { dirty, ctx };
    			}

    			hero.$set(hero_changes);
    			const customcard0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				customcard0_changes.$$scope = { dirty, ctx };
    			}

    			customcard0.$set(customcard0_changes);
    			const customcard1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				customcard1_changes.$$scope = { dirty, ctx };
    			}

    			customcard1.$set(customcard1_changes);
    			const customcard2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				customcard2_changes.$$scope = { dirty, ctx };
    			}

    			customcard2.$set(customcard2_changes);
    			const customcard3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				customcard3_changes.$$scope = { dirty, ctx };
    			}

    			customcard3.$set(customcard3_changes);
    			const customcard4_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				customcard4_changes.$$scope = { dirty, ctx };
    			}

    			customcard4.$set(customcard4_changes);
    			const footer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				footer_changes.$$scope = { dirty, ctx };
    			}

    			footer.$set(footer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hero.$$.fragment, local);
    			transition_in(chips0.$$.fragment, local);
    			transition_in(chips1.$$.fragment, local);
    			transition_in(chips2.$$.fragment, local);
    			transition_in(chips3.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			transition_in(button3.$$.fragment, local);
    			transition_in(customcard0.$$.fragment, local);
    			transition_in(customcard1.$$.fragment, local);
    			transition_in(customcard2.$$.fragment, local);
    			transition_in(customcard3.$$.fragment, local);
    			transition_in(customcard4.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hero.$$.fragment, local);
    			transition_out(chips0.$$.fragment, local);
    			transition_out(chips1.$$.fragment, local);
    			transition_out(chips2.$$.fragment, local);
    			transition_out(chips3.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			transition_out(button3.$$.fragment, local);
    			transition_out(customcard0.$$.fragment, local);
    			transition_out(customcard1.$$.fragment, local);
    			transition_out(customcard2.$$.fragment, local);
    			transition_out(customcard3.$$.fragment, local);
    			transition_out(customcard4.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(hero);
    			destroy_component(chips0);
    			destroy_component(chips1);
    			destroy_component(chips2);
    			destroy_component(chips3);
    			destroy_component(button0);
    			destroy_component(button1);
    			destroy_component(button2);
    			destroy_component(button3);
    			destroy_component(customcard0);
    			destroy_component(customcard1);
    			destroy_component(customcard2);
    			destroy_component(customcard3);
    			destroy_component(customcard4);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Hero, Chips, Button, CustomCard, Footer });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
