WebCC.start(
    function (ok) {
        if (ok) {
            console.log("✅ WebCC connected");
            unifiedInterfaceInit();
        } else {
            console.error("❌ WebCC connection failed");
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
            VisibleItems: 5
        }
    },
    _extensions,
    _timeout
);
