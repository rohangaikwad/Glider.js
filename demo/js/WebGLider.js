((window) => {
    let defaults = {
        items: 1, slideBy: 1, autoplayTimeout: 3000, autoslideSpeed: 1000, margin: 0, direction: 'row', draggable: true
    }

    let Init = (target, _settings) => {
        if (typeof target == 'string' && target.trim().length > 0) {
            let elems = document.querySelectorAll(target);
            if (elems.length > 0) {
                elems.forEach(elem => InitSlider(elem, _settings));
            } else {
                console.error(`Target element: '${target}' not found`);
            }
        } else if (target instanceof Element) {
            InitSlider(target, _settings)
        } else if (NodeList.prototype.isPrototypeOf(target)) {
            if (target.length > 0) {
                target.forEach(elem => InitSlider(elem, _settings));
            } else {
                console.error(`Target element: '${target}' not found`);
            }
        } else if (HTMLCollection.prototype.isPrototypeOf(target)) {
            if ([...target].length > 0) {
                [...target].forEach(elem => InitSlider(elem, _settings));
            } else {
                console.error(`Target element: '${target}' not found`);
            }
        } else {
            console.error(`Target element: '${target}' not found`);
        }
    }

    let GetWrappedElement = (target) => {
        let wrapper = document.createElement('div');
        target.parentNode.appendChild(wrapper);
        wrapper.appendChild(target);
        return wrapper;
    }

    let WrapAllItems = (elem) => {
        let wrapper = document.createElement('div');
        wrapper.classList.add('wgl-wrapper');
        elem.appendChild(wrapper);
        elem.querySelectorAll(':scope > .wgl-item').forEach(item => {
            wrapper.appendChild(item);
        });
        return wrapper;
    }

    let InitSlider = (sliderElem, _settings) => {
        let options = { ...defaults, ..._settings };

        sliderElem.classList.add(`wgl-container`);
        sliderElem.classList.add(`wgl-${options.direction}`);

        let { children, offsetWidth } = sliderElem;
        children = [...children]; // HTMLCollection

        [...children].forEach((child, i) => {
            let item = GetWrappedElement(child);
            item.classList.add('wgl-item');
        });

        // calculate width
        let width = (offsetWidth - (options.items * options.margin) + options.margin) / options.items;

        let wrapper = WrapAllItems(sliderElem);
        wrapper.style.width = `${(width * children.length) + (options.margin * children.length) - options.margin}px`;

        sliderElem.querySelectorAll(':scope > .wgl-wrapper > .wgl-item').forEach(elem => {
            elem.style.maxWidth = `${width}px`;
            elem.style.marginRight = `${options.margin}px`;
        })

        wrapper.setAttribute('data-wgl-x', 0);

        CreateControls(sliderElem, options);

        setTimeout(() => {
            Slide(sliderElem, options, 1);
        }, options.autoplayTimeout)
    }

    let Slide = (sliderElem, options, direction) => {
        let target = sliderElem.querySelector(':scope > .wgl-wrapper');

        let x = 0;
        if (target.hasAttribute('data-wgl-x')) {
            x = parseFloat(target.getAttribute('data-wgl-x'));
        }

        let { offsetWidth } = sliderElem;
        let itemWidth = (offsetWidth - (options.items * options.margin) + options.margin) / options.items;

        let offset = (itemWidth + options.margin) * options.slideBy;
        let time = options.autoslideSpeed;
        let start = performance.now();
        let end = start + time;

        requestAnimationFrame(function animate() {
            let progress = (time - (end - performance.now())) / time;
            progress = Math.min(progress, 1);

            //let mul = Math.pow(progress, 4);
            let mul = progress * (2 - progress);
            let transX = x;
            transX += direction == 1 ? offset * mul * -1 : offset * mul;
            target.style.transform = `translateX(${transX}px)`

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                x += direction == 1 ? offset * -1 : offset;
                target.setAttribute('data-wgl-x', x);

                setTimeout(() => {
                    //Slide(target, slideBy, width, margin, time, x);
                }, 1000)
            }
        })
    }

    let CreateControls = (target, options) => {
        let navWrapper = Create('div', 'wgl-nav');
        target.appendChild(navWrapper);

        let prev = Create('button', 'btn-prev');
        prev.innerHTML = 'Prev';
        prev.addEventListener('click', () => Slide(target, options, -1));
        navWrapper.appendChild(prev);

        let next = Create('button', 'btn-next');
        next.innerHTML = 'Next';
        next.addEventListener('click', () => Slide(target, options, 1));
        navWrapper.appendChild(next);
    }

    let Create = (elemType, classes) => {
        let elem = document.createElement(elemType);
        elem.setAttribute('class', classes);
        return elem;
    }

    let Trigger = () => {
        console.log('trigger');
    }

    window.WebGlider = {
        init: Init,
        trigger: Trigger
    };
})(window);