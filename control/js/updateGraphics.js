const _extensions = ['HMI'];
const _timeout = 1000;

let isDropdownOpen = false;
let optionsContainer = null;

function toColor(num) {
    num >>>= 0;
    const b = num & 0xff,
        g = (num >>> 8) & 0xff,
        r = (num >>> 16) & 0xff,
        a = ((num >>> 24) & 0xff) / 255;
    return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
}

function applyStyles(props) {
    const root = document.documentElement;

    const width = props.Width || 250;
    const height = props.Height || 30;
    const fontSize = parseFloat(props.FontSize || '15');

    const fontColor = WebCC?.Properties?.ColorText !== undefined
        ? toColor(WebCC.Properties.ColorText)
        : 'rgba(255, 255, 255, 1)';

    const bgColor = WebCC?.Properties?.ColorBackground !== undefined
        ? toColor(WebCC.Properties.ColorBackground)
        : 'rgba(42, 47, 59, 1)';

    const hoverColor = WebCC?.Properties?.ColorHover !== undefined
        ? toColor(WebCC.Properties.ColorHover)
        : 'rgba(50, 55, 65, 1)';

    root.style.setProperty('--dropdown-width', width + 'px');
    root.style.setProperty('--dropdown-height', height + 'px');
    root.style.setProperty('--dropdown-font-size', fontSize + 'px');
    root.style.setProperty('--dropdown-bg', bgColor);
    root.style.setProperty('--dropdown-hover-bg', hoverColor);
    root.style.setProperty('--dropdown-text-color', fontColor);

    const wrapper = document.getElementById("selectedItem");
    if (wrapper) {
        wrapper.style.width = width + "px";
        wrapper.style.height = height + "px";
        wrapper.style.fontSize = fontSize + "px";
        wrapper.style.lineHeight = fontSize * 1.2 + "px";
        wrapper.style.fontFamily = "inherit";
    }
}

function createDropdown(props, selectedWrapper, selectedEl, arrow) {
    if (isDropdownOpen && optionsContainer) return;

    const dropdown = document.createElement("div");
    dropdown.className = "dropdown-options";
    dropdown.style.opacity = "0";
    dropdown.style.transform = "translateY(-10px)";
    dropdown.style.transition = "opacity 150ms ease, transform 150ms ease";

    const bgColor = toColor(props.ColorBackground);
    const textColor = toColor(props.ColorText);
    const hoverColor = toColor(props.ColorHover);

    const baseFontSize = parseFloat(props.FontSize || '15');
    const frame = window.frameElement;
    const frameRect = frame?.getBoundingClientRect();
    const wrapperRect = selectedWrapper.getBoundingClientRect();
    const scaleFixWidth = wrapperRect.width * (frameRect?.width / frame.offsetWidth);
    const scaleFixHeight = wrapperRect.height * (frameRect?.height / frame.offsetHeight);
    const scaleFixFontSize = baseFontSize * (frameRect?.height / frame.offsetHeight);

    dropdown.style.backgroundColor = bgColor;
    dropdown.style.color = textColor;
    dropdown.style.fontSize = scaleFixFontSize + "px";
    dropdown.style.fontFamily = getComputedStyle(selectedWrapper).fontFamily;
    dropdown.style.width = `${scaleFixWidth}px`;
    dropdown.style.borderRadius = getComputedStyle(selectedWrapper).borderRadius || "5px";

    const maxVisible = props.VisibleItems || 5;
    const verticalPadding = 5 * 2;
    const lineHeightRatio = 1.2;
    const oneItemHeight = scaleFixFontSize * lineHeightRatio + verticalPadding;
    dropdown.style.maxHeight = `${maxVisible * oneItemHeight}px`;
    dropdown.style.overflowY = "auto";

    let rows = [];
    try {
        rows = typeof props.rows === "string" ? JSON.parse(props.rows) : props.rows;
    } catch { }

    rows.forEach(row => {
        const option = document.createElement("div");
        option.className = "dropdown-option";
        option.textContent = row.Text;
        option.dataset.value = JSON.stringify(row);
        option.style.backgroundColor = bgColor;
        option.style.color = textColor;
        option.style.fontSize = scaleFixFontSize + "px";
        option.style.fontFamily = getComputedStyle(selectedWrapper).fontFamily;
        option.style.whiteSpace = "normal";
        option.style.wordBreak = "break-word";

        option.addEventListener("mouseover", () => {
            option.style.backgroundColor = hoverColor;
        });
        option.addEventListener("mouseout", () => {
            option.style.backgroundColor = bgColor;
        });

        option.addEventListener("click", () => {
            WebCC.Properties.current = JSON.stringify(row);
            WebCC.Events.fire("selected", JSON.stringify(row));
            selectedEl.textContent = row.Text;
            dropdown.remove();
            optionsContainer = null;
            isDropdownOpen = false;
            arrow?.classList.remove("open");
        });

        dropdown.appendChild(option);
    });

    const rect = selectedWrapper.getBoundingClientRect();
    const iframeRect = window.frameElement?.getBoundingClientRect() || { top: 0, left: 0 };
    const scrollTop = window.parent.scrollY || 0;
    const localScaleFixHeight = rect.height * (frameRect?.height / frame.offsetHeight);
    const scaleFixTop = rect.top * (frameRect?.height / frame.offsetHeight);
    const globalTop = scaleFixTop + localScaleFixHeight + iframeRect.top + scrollTop;
    const globalLeft = rect.left + iframeRect.left;

    dropdown.style.position = "absolute";
    dropdown.style.left = `${globalLeft}px`;
    dropdown.style.top = `${globalTop}px`;
    dropdown.style.zIndex = "999999";

    try {
        window.parent.document.body.appendChild(dropdown);
    } catch {
        document.body.appendChild(dropdown);
    }

    setTimeout(() => {
        dropdown.classList.add("open");
        dropdown.style.opacity = "1";
        dropdown.style.transform = "translateY(0)";
    }, 10);

    optionsContainer = dropdown;
    isDropdownOpen = true;
    arrow?.classList.add("open");

    let hoverTimeout;

    function tryCloseDropdown() {
        hoverTimeout = setTimeout(() => {
            const isOverWrapper = selectedWrapper.matches(':hover');
            const isOverDropdown = dropdown.matches(':hover');

            if (!isOverWrapper && !isOverDropdown) {
                dropdown.remove();
                optionsContainer = null;
                isDropdownOpen = false;

                if (arrow) {
                    arrow.classList.remove("open");
                }
            } else {
                if (arrow) {
                    arrow.classList.add("open");
                }
            }
        }, 50);
    }

    selectedWrapper.addEventListener("mouseleave", tryCloseDropdown);
    dropdown.addEventListener("mouseleave", tryCloseDropdown);

    selectedWrapper.addEventListener("mouseenter", () => {
        clearTimeout(hoverTimeout);
    });
    dropdown.addEventListener("mouseenter", () => {
        clearTimeout(hoverTimeout);
    });

}

function updateDropDown(props) {
    applyStyles(props);

    const selectedEl = document.getElementById("selectedText");
    const selectedWrapper = document.getElementById("selectedItem");
    const arrow = document.getElementById("dropdownArrow");

    let rows = [];
    try {
        rows = typeof props.rows === "string" ? JSON.parse(props.rows) : props.rows;
    } catch { }

    let current = {};
    try {
        current = typeof props.current === "string" ? JSON.parse(props.current) : props.current;
    } catch { }

    let matchedItem = null;

    if (current && Array.isArray(rows)) {
        if (current.ID !== undefined && current.Text !== undefined) {
            matchedItem = rows.find(row => row.ID === current.ID && row.Text === current.Text);
        } else if (current.ID !== undefined) {
            matchedItem = rows.find(row => row.ID === current.ID);
        } else if (current.Text !== undefined) {
            matchedItem = rows.find(row => row.Text === current.Text);
        }
    }

    selectedEl.textContent = matchedItem ? matchedItem.Text : "";

    if (selectedWrapper.dataset.listenerSet) return;
    selectedWrapper.dataset.listenerSet = "true";

    selectedWrapper.addEventListener("mouseenter", () => {
        createDropdown(props, selectedWrapper, selectedEl, arrow);
    });
}


var UnifiedInterface = (function () {
    function initialize() {
        console.log("DropDown: UnifiedInterface initialized");
        updateDropDown(WebCC.Properties);
    }

    function setProps(data) {
        console.log("DropDown: Property changed:", data.key, "=", data.value);
        if (WebCC.Properties.hasOwnProperty(data.key)) {
            WebCC.Properties[data.key] = data.value;
        }
        updateDropDown(WebCC.Properties);
    }

    return {
        Local: {
            initialize: initialize,
            setProps: setProps
        }
    };
})();

function unifiedInterfaceInit() {
    try {
        const oldDropdowns = window.parent.document.querySelectorAll('.dropdown-options');
        oldDropdowns.forEach(el => {
            console.log("DropDown: removing the old dropdown from the DOM");
            el.remove();
        });
    } catch (err) {
        console.warn("DropDown: could not access parent DOM", err);
    }

    UnifiedInterface.Local.initialize();

    if (WebCC && WebCC.onPropertyChanged) {
        WebCC.onPropertyChanged.subscribe(UnifiedInterface.Local.setProps);
    }

    if (WebCC && WebCC.onDestroy) {
        WebCC.onDestroy.subscribe(() => {
            if (optionsContainer && optionsContainer.parentNode) {
                optionsContainer.remove();
                optionsContainer = null;
                isDropdownOpen = false;
                console.log("DropDown: closed due to onDestroy");
            }
        });
    }

    if (WebCC && WebCC.onScreenChanged) {
        WebCC.onScreenChanged.subscribe(() => {
            if (optionsContainer && optionsContainer.parentNode) {
                optionsContainer.remove();
                optionsContainer = null;
                isDropdownOpen = false;
                console.log("DropDown: closed due to onScreenChanged");
            }
        });
    }

    console.log("DropDown: initialized with properties", WebCC.Properties);
}
