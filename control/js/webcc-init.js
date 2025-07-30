WebCC.start(
    function (ok) {
        if (ok) {
            console.log(`✅ WebCC connected - DropDown`);
            unifiedInterfaceInit();
        } else {
            console.error(`❌ WebCC connection failed - DropDown`);
            const frame = window.frameElement;
            if (frame) {
                frame.style.display = "none";
            }
        }
    },
    {
        methods: {},
        events: ["selected"],
        properties: {
            rows: "[]",
            current: "",
            Width: 250,
            Height: 30,
            FontSize: "15px",
            ColorBackground: 4280090643,
            ColorHover: 4281608376,
            ColorText: 4294967295,
            ColorBorder: 4278190080,
            BorderWidth: 2,
            BorderRadius: 5,
            VisibleItems: 5
        }
    },
    _extensions,
    _timeout
);
