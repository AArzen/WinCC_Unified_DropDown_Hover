const _extensions = ['HMI'];
const _timeout = 30000;

let isDropdownOpen = false;
let optionsContainer = null;
let isMouseOverWrapper = false;
let isMouseOverDropdown = false;

let lastMouseX = 0;
let lastMouseY = 0;
let closeCheckInterval = null;

document.addEventListener("mousemove", (e) => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

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
    let fontSizeRaw = props.FontSize || "15px";
    const fontSize = parseFloat(fontSizeRaw);
    let fontWeight = "normal";
    const borderWidth = props.BorderWidth || 2;
    const borderRadius = props.BorderRadius || 5;

    if (fontSizeRaw.toLowerCase().includes("bold")) { fontWeight = "bold" };


    const fontColor = WebCC?.Properties?.ColorText !== undefined
        ? toColor(WebCC.Properties.ColorText)
        : 'rgba(255, 255, 255, 1)';

    const bgColor = WebCC?.Properties?.ColorBackground !== undefined
        ? toColor(WebCC.Properties.ColorBackground)
        : 'rgba(42, 47, 59, 1)';

    const hoverColor = WebCC?.Properties?.ColorHover !== undefined
        ? toColor(WebCC.Properties.ColorHover)
        : 'rgba(50, 55, 65, 1)';

    const borderColor = WebCC?.Properties?.ColorBorder !== undefined
        ? toColor(WebCC.Properties.ColorBorder)
        : 'rgba(0, 0, 0, 1)';

    root.style.setProperty('--dropdown-width', width + 'px');
    root.style.setProperty('--dropdown-height', height + 'px');
    root.style.setProperty('--dropdown-font-size', fontSize + 'px');
    root.style.setProperty('--dropdown-font-weight', fontWeight);
    root.style.setProperty('--dropdown-bg', bgColor);
    root.style.setProperty('--dropdown-hover-bg', hoverColor);
    root.style.setProperty('--dropdown-text-color', fontColor);
    root.style.setProperty('--dropdown-border-color', borderColor);
    root.style.setProperty('--dropdown-border-width', borderWidth);
    root.style.setProperty('--dropdown-border-radius', borderRadius);

    const wrapper = document.getElementById("selectedItem");
    if (wrapper) {
        wrapper.style.border = `${borderWidth}px solid ${borderColor}`;
        wrapper.style.borderRadius = `${borderRadius}px`;
        wrapper.style.width = width + "px";
        wrapper.style.height = height + "px";
        wrapper.style.fontSize = fontSize + "px";
        wrapper.style.lineHeight = fontSize * 1.2 + "px";
        wrapper.style.fontFamily = "inherit";
    }
}

function createDropdown(props, selectedWrapper, selectedEl, arrow) {

    // Clean old dropdown
    document.querySelectorAll(".dropdown-options").forEach(el => {
        const frame = window.frameElement;
        if (!frame || !frame.ownerDocument.body.contains(el)) {
            el.remove();
        }
    });

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

    // Max Height
    const maxVisible = props.VisibleItems || 5;
    const verticalPadding = 5 * 2;
    const lineHeightRatio = 1.2;
    const oneItemHeight = scaleFixFontSize * lineHeightRatio + verticalPadding;
    totalHeight = (maxVisible * oneItemHeight) + scaleFixHeight;

    dropdown.style.backgroundColor = bgColor;
    dropdown.style.color = textColor;
    dropdown.style.fontSize = scaleFixFontSize + "px";
    dropdown.style.fontFamily = getComputedStyle(selectedWrapper).fontFamily;
    dropdown.style.paddingLeft = getComputedStyle(selectedWrapper).paddingLeft;
    dropdown.style.paddingRight = getComputedStyle(selectedWrapper).paddingRight;
    dropdown.style.boxSizing = getComputedStyle(selectedWrapper).boxSizing;
    dropdown.style.width = `${scaleFixWidth}px`;
    dropdown.style.maxWidth = `${scaleFixWidth}px`;
    dropdown.style.borderRadius = getComputedStyle(selectedWrapper).borderRadius || "5px";
    dropdown.style.border = "2px solid black";
    dropdown.style.maxHeight = `${totalHeight}px`;
    dropdown.style.overflowY = "auto";
    dropdown.style.overflowX = "hidden";

    let rows = [];
    try {
        rows = typeof props.rows === "string" ? JSON.parse(props.rows) : props.rows;
    } catch { }


    // Create filter input
    const filterInput = document.createElement("input");
    filterInput.placeholder = "";
    filterInput.className = "dropdown-filter-input";
    filterInput.style.backgroundColor = bgColor;
    filterInput.style.color = textColor;
    filterInput.style.fontSize = scaleFixFontSize + "px";
    filterInput.style.fontFamily = getComputedStyle(selectedWrapper).fontFamily;
    filterInput.style.width = `${scaleFixWidth}px`;
    filterInput.style.maxWidth = `${scaleFixWidth}px`;
    filterInput.style.border = "none";
    filterInput.style.outline = "none";
    filterInput.style.height = `${scaleFixHeight}px`;
    filterInput.style.lineHeight = `${scaleFixHeight}px`;
    filterInput.style.boxSizing = "border-box";
    filterInput.style.padding = "0px 10px";
    dropdown.appendChild(filterInput);


    // Filter logic
    let currentRows = [...rows];
    function renderOptions(filteredRows) {
        // Remove old options
        dropdown.querySelectorAll(".dropdown-option").forEach(opt => opt.remove());

        filteredRows.forEach(row => {
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

                if (closeCheckInterval) {
                    clearInterval(closeCheckInterval);
                    closeCheckInterval = null;
                }
            });

            dropdown.appendChild(option);
        });
    }

    // Filter on input
    filterInput.addEventListener("input", () => {
        const text = filterInput.value.toLowerCase();
        const filtered = rows.filter(r => r.Text?.toLowerCase().includes(text));
        renderOptions(filtered);
    });

    // Initial render
    renderOptions(currentRows);


    const estimatedDropdownHeight = Math.min(maxVisible * oneItemHeight, rows.length * oneItemHeight);

    const rect = selectedWrapper.getBoundingClientRect();
    const iframeRect = window.frameElement?.getBoundingClientRect() || { top: 0, left: 0 };
    const scrollTop = window.parent.scrollY || 0;
    const localScaleFixHeight = rect.height * (frameRect?.height / frame.offsetHeight);
    const scaleFixTop = rect.top * (frameRect?.height / frame.offsetHeight);
    //const globalTop = scaleFixTop + localScaleFixHeight + iframeRect.top + scrollTop - 5;
    const globalTop = scaleFixTop + iframeRect.top + scrollTop;
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

    // Listner for mouse
    selectedWrapper.addEventListener("mouseenter", () => {
        isMouseOverWrapper = true;
    });
    selectedWrapper.addEventListener("mouseleave", () => {
        isMouseOverWrapper = false;
    });

    dropdown.addEventListener("mouseenter", () => {
        isMouseOverDropdown = true;
    });
    dropdown.addEventListener("mouseleave", () => {
        isMouseOverDropdown = false;
    });

    //console.log("Dropdown OPENED");

    // frobid more internal at the same time
    if (closeCheckInterval) {
        clearInterval(closeCheckInterval);
        closeCheckInterval = null;
    }

    closeCheckInterval = setInterval(() => {
        /*console.log("Interval Check (hover flags):", {
            isMouseOverWrapper,
            isMouseOverDropdown
        });*/

        if (!isMouseOverWrapper && !isMouseOverDropdown) {
            //console.log("Dropdown CLOSED (hover flags)");
            dropdown.remove();
            optionsContainer = null;
            isDropdownOpen = false;
            arrow?.classList.remove("open");

            clearInterval(closeCheckInterval);
            closeCheckInterval = null;
        }
    }, 100);


    // close when click outside
    const onClickOutside = (e) => {
        const target = e.target;
        if (
            !dropdown.contains(target) &&
            !selectedWrapper.contains(target)
        ) {
            //console.log("Dropdown CLOSED (outside click)");

            dropdown.remove();
            optionsContainer = null;
            isDropdownOpen = false;
            arrow?.classList.remove("open");

            if (closeCheckInterval) {
                clearInterval(closeCheckInterval);
                closeCheckInterval = null;
            }

            document.removeEventListener("mousedown", onClickOutside);
        }
    };

    document.addEventListener("mousedown", onClickOutside);

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

    selectedWrapper.addEventListener("click", (e) => {
        if (!e.isTrusted) return;
        e.stopPropagation();
        createDropdown(props, selectedWrapper, selectedEl, arrow);
    });
}


var UnifiedInterface = (function () {
    function initialize() {
        // console.log("DropDown: UnifiedInterface initialized");
        updateDropDown(WebCC.Properties);
    }

    function setProps(data) {
        // console.log("DropDown: Property changed:", data.key, "=", data.value);
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
            //console.log("DropDown: removing the old dropdown from the DOM");
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
                //console.log("DropDown: closed due to onDestroy");
            }
        });
    }

    if (WebCC && WebCC.onScreenChanged) {
        WebCC.onScreenChanged.subscribe(() => {
            if (optionsContainer && optionsContainer.parentNode) {
                optionsContainer.remove();
                optionsContainer = null;
                isDropdownOpen = false;
                //console.log("DropDown: closed due to onScreenChanged");
            }
        });
    }

    //console.log("DropDown: initialized with properties", WebCC.Properties);
}
