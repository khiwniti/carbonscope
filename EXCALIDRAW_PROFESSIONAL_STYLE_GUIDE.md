# Excalidraw Professional Style Guide

## Professional Diagram Settings

For clean, production-ready diagrams without handwritten appearance, use these Excalidraw properties:

### Font Settings
```json
{
  "fontFamily": 2,  // Helvetica (professional sans-serif)
  // NOT fontFamily: 1 (Virgil - handwritten)
}
```

### Shape Settings
```json
{
  "roughness": 0,  // Clean, precise lines
  // NOT roughness: 1 (sketchy/handwritten appearance)

  "strokeSharpness": "sharp",  // Clean edges
  "strokeStyle": "solid"  // Solid lines (not dashed)
}
```

### Font Family Reference
- `1` = Virgil (handwritten style) ❌
- `2` = Helvetica (professional sans-serif) ✅
- `3` = Cascadia (monospace)
- `4` = Assistant (modern sans-serif)

### Roughness Reference
- `0` = Clean, professional lines ✅
- `1` = Sketchy, handwritten appearance ❌
- `2` = Very rough, heavily sketched

## Color Palette (Semantic)

```json
{
  "primary": "#dae8fc",      // light-blue - primary components
  "secondary": "#fff2cc",    // light-yellow - secondary/support
  "data": "#d5e8d4",         // light-green - data/state
  "external": "#e1d5e7",     // light-purple - external systems
  "critical": "#f8cecc",     // light-red - errors/critical
  "neutral": "#f5f5f5"       // light-gray - containers
}
```

## Complete Professional Element Template

```json
{
  "type": "rectangle",
  "x": 100,
  "y": 100,
  "width": 200,
  "height": 80,
  "strokeColor": "#000000",
  "backgroundColor": "#dae8fc",
  "fillStyle": "solid",
  "strokeWidth": 2,
  "strokeStyle": "solid",
  "roughness": 0,           // ✅ Professional
  "opacity": 100,
  "strokeSharpness": "sharp",
  "groupIds": [],
  "roundness": { "type": 3 },
  "boundElements": [],
  "updated": 1234567890,
  "link": null,
  "locked": false
}
```

```json
{
  "type": "text",
  "x": 150,
  "y": 125,
  "width": 100,
  "height": 30,
  "fontSize": 16,
  "fontFamily": 2,          // ✅ Helvetica
  "text": "Professional Text",
  "textAlign": "center",
  "verticalAlign": "middle",
  "strokeColor": "#000000",
  "backgroundColor": "transparent",
  "fillStyle": "solid",
  "strokeWidth": 2,
  "strokeStyle": "solid",
  "roughness": 0,           // ✅ Professional
  "opacity": 100,
  "groupIds": [],
  "roundness": null,
  "boundElements": [],
  "updated": 1234567890,
  "link": null,
  "locked": false,
  "containerId": null,
  "originalText": "Professional Text",
  "lineHeight": 1.25
}
```

## Updated Diagrams

All 6 project diagrams have been updated with professional styling:

✅ 01-business-value-user-journey.excalidraw
✅ 02-agent-orchestration.excalidraw
✅ 03-system-architecture.excalidraw
✅ 04-data-flow-certification.excalidraw
✅ 05-technology-stack.excalidraw
✅ 06-deployment-production.excalidraw

**Changes Applied:**
- `fontFamily`: 1 → 2 (Virgil → Helvetica)
- `roughness`: 1 → 0 (sketchy → clean)

## Viewing Updated Diagrams

1. Open any `.excalidraw` file at https://excalidraw.com
2. The diagram will now display with:
   - Clean, professional font (Helvetica)
   - Precise, non-sketchy lines
   - Production-ready appearance

**Note:** If you still see handwritten fonts after opening, try:
1. Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Re-upload the file to Excalidraw.com
