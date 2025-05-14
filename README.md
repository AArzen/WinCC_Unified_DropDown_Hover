# DropDown_Hover ![Preview](./assets/Drop_Down.png)

**DropDown_Hover** is a lightweight and customizable **Custom Web Control** designed for use in [WinCC Unified](https://support.industry.siemens.com/cs/document/109784439/). It provides a styled dropdown menu that can trigger events and adapt its appearance via properties.

---

## 🚀 Features

- Configurable width, height, font size, background color, text color, and hover color.
- Emits a `selected` event when an item is selected.
- Dynamic population of dropdown items and current selection via properties.
- Clean modular structure: `updateGraphics.js`, `webcc-init.js`, and `style.css` separated for maintainability.

---

## ⚠️ Limitations

- **Not suitable for touch screens**: The control relies on hover events, which are not supported on touch devices.
- **Requires WinCC Unified environment**: The control depends on the `WebCC` object and will not function correctly when opened directly in a browser without WinCC Unified.

---

## 📁 Project Structure

```
project-root/
│
├── control/
│ ├── index.html
│ ├── css/
│ │ └── style.css
│ └── js/
│ ├── updateGraphics.js
│ ├── webcc.min.js
│ └── webcc-init.js
├── assets/
│ ├── Drop_Down.ico
│ ├── Drop_Down.png
│ └── Drop_Down.svg
├── {FC5B3189-154C-4525-B9FE-7B933236BB2D}.zip
└── manifest.json

```

---

## 📦 How to Use in WinCC Unified

To integrate the control into your **TIA Portal WinCC Unified project**, follow these steps:

1. Locate the folder:
   ```
   <ProjectFolder>/UserFiles/CustomControls/
   ```

2. Copy the following file into it:
   ```
   {FC5B3189-154C-4525-B9FE-7B933236BB2D}.zip
   ```

3. Open the TIA Portal and the control will be available under **Custom Controls** in the toolbox after refresh.

---

## ⚙️ Handling the `selected` Event

Example event handler in WinCC Unified JavaScript:

```javascript
export function DropDown_1_Onselected(item, rowId) {
try {
 HMIRuntime.Trace("Data: " + rowId);
 rowId = JSON.parse(rowId);
 HMIRuntime.Trace("Data ID: " + rowId.ID + " Data Text: " + rowId.Text);
} catch (e) {
 HMIRuntime.Trace("Error: " + e);
}
}
```

---

## 🔄 Dynamically Updating the Dropdown

To update the dropdown items and set the current selection via a button in WinCC Unified, use the following script:

```javascript
export function Button_7_OnTapped(item, x, y, modifiers, trigger) {
  try {
    let json = JSON.stringify([
      { ID: "1", Text: "Element D" },
      { ID: "2", Text: "Element E" },
      { ID: "3", Text: "Element F" }
    ]);

    HMIRuntime.UI.SysFct.SetPropertyValue("DropDown_1", "Properties.rows", json);

    json = JSON.stringify(
      { ID: "2", Text: "Element E" }
    );
    HMIRuntime.UI.SysFct.SetPropertyValue("DropDown_1", "Properties.current", json);
  } catch (e) {
    HMIRuntime.Trace("Error: " + e);
  }
}
```

---

## 🧪 Testing Outside WinCC

You can test the control by simply opening index.html in a browser. However, please note that the control relies on the WebCC object provided by WinCC Unified. Therefore, full functionality is only available within the WinCC Unified environment.

---

## 🆓 License

This project is provided **free of charge** with **no license restrictions**. You are free to use, modify, and distribute it without limitations.