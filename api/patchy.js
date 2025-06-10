(() => {
    const setBackgroundInterval = function setBackgroundInterval(fn, time) {
        const requestIdleCallback =
            globalThis.requestIdleCallback ?? globalThis.requestAnimationFrame;
        let running = false;
        return setInterval(() => {
            if (running) return;
            running = true;
            requestIdleCallback(async () => {
                try {
                    await fn();
                } catch (e) {
                    console.warn(e);
                } finally {
                    running = false;
                }
            });
        }, time);
    };

    const updateAttribute = (element, key, value) => (element?.getAttribute?.(key) != value) && element?.setAttribute?.(key, value);

    (() => {
        const _eval = eval;
        globalThis.eval = function eval() {
            try {
                return _eval(...arguments);
            } catch (e) {
                console.warn(e, ...arguments);
            }
        };
    })();

    (() => {
        const xhr = XMLHttpRequest.prototype;
        const _open = xhr.open;
        xhr.open = function open() {
            try {
                arguments[1] &&= String(arguments[1]).replace(RegExp(atob('cG9rZWhlcm9lcy5jb20='), 'gi'), location.host);
            } catch (e) {
                console.warn(this, e, ...arguments);
            }
            return _open.apply(this, arguments);
        };
    })();

    (() => {
        const dateParse = Date.parse;
        Date.parse = function parse() {
            try {
                return dateParse(...arguments) || new Date();
            } catch {
                return new Date();
            }
        };
    })();

    (() => {
        const jsonParse = JSON.parse;
        JSON.parse = function parse() {
            try {
                return jsonParse(...arguments);
            } catch (e) {
                return e;
            }
        };
    })();

    (() => {
        if (window != window.top) return;
        let bkInterval;
        bkInterval = setBackgroundInterval(() => {
            [...document.querySelectorAll(`a[href="//${location.host}"]`) ?? []]?.find?.(x => `${x?.innerText}`.toLowerCase().includes('wiki'))?.setAttribute?.('href', `${location.origin}/wiki/Main_Page`);
            if (document.querySelector('a[href*="/wiki/Main_Page"]')) {
                clearInterval(bkInterval);
                console.log(bkInterval, 'Wiki Link fixed');
            }
        }, 200);
    })();

    (() => {
        function cssHelpers() {
            const html = document.firstElementChild;

            const toKebabCase = x =>
                String(x).replace(/[A-Z]+/g, y => `-${y.toLowerCase()}`).replace(/[^a-z0-9-]/g, '').replace(/[-]+/g, '-').replace(/^-/, '');

            const isString = str => str instanceof String || [typeof str, str?.constructor?.name].some(s => /^string$/i.test(s));

            for (const prop in html) {
                if (html[prop] != null && String(html[prop]).length && !/function|object/.test(html[prop]) && !/\n/.test(html[prop])) {
                    updateAttribute(html, `html-${toKebabCase(prop)}`.replace(/[-]+/g, '-'), html[prop]);
                }
            }

            for (const obj of [document, window, location, navigator, clientInformation.userAgentData]) {
                const prefix = `${obj?.constructor?.name}`.replace(/^html/i, '').toLowerCase();
                for (const prop in obj) {
                    if (obj[prop] != null && String(obj[prop]).length && !/function|object/.test(obj[prop])) {
                        updateAttribute(html, `${toKebabCase(prefix)}-${toKebabCase(prop)}`.replace(/[-]+/g, '-'), obj[prop]);
                    }
                }
            }

            const loc = new URL(location.href);
            for (const [k, v] of loc.searchParams) {
                if (k && v) {
                    updateAttribute(html, `location-search-params-${toKebabCase(k)}`.replace(/[-]+/g, '-'), v);
                }
            }

            const cookies = new URLSearchParams(`?${`${document?.cookie}`.split('; ').join('&')}`);
            for (const [k, v] of cookies) {
                if (k && v) {
                    updateAttribute(html, `cookie-${toKebabCase(k)}`.replace(/[-]+/g, '-'), v);
                }
            }
            html.setAttribute('window-top', window == window.top);
        }
        cssHelpers();
        // setBackgroundInterval(cssHelpers,100);
    })();

    (() => {
        globalThis.requestIdleCallback ??= requestAnimationFrame;

        const DOMInteractive = (fn) => {
            fn ??= () => {};
            if ((globalThis.document?.readyState == 'complete') || (globalThis.document?.readyState == 'interactive')) {
                return fn();
            }
            return new Promise((resolve) => {
                (globalThis.document || globalThis).addEventListener("DOMContentLoaded", () => {
                    try {
                        resolve(fn());
                    } catch (e) {
                        resolve(e);
                    }
                });
            });
        };

        if(window === window.top && ['gts_my_trades','gts_search?type=0','gts_my_offers'].some(x=>location.href.includes(x))){
        	DOMInteractive(()=>{
        		['gts_my_trades','gts_search?type=0','gts_my_offers'].forEach(x=>{
        			if(location.href.includes(x))return;
        			const iframe = document.createElement('iframe');
        			iframe.src = `${location.origin}/${x}`;
        			Object.assign(iframe.style,{
        				width : 0,
        				height :0,
        				opacity : 0,
        			});
        			document.body.appendChild(iframe);
        		});
        	});
        }
        
        
        if(window != window.top && ['gts_my_trades','gts_search?type=0','gts_my_offers'].some(x=>location.href.includes(x))){
        
        		DOMInteractive(()=>{
        			window.top.document.querySelector('#sidebar')?.remove?.();
        			const textBar = document.querySelector('#textbar');
        			(window.top.document.querySelector('#content')?.style??{}).flexDirection = 'column';
        			window.top.document.querySelector('#content')?.appendChild?.(textBar);
        		});
        		
        }




    })();

})();
