# notaspoon.com

**notaspoon.com** is a curated collection of one-of-a-kind prints and digital artifacts. Everything you see here is designed to challenge the utility of everyday objects. As the name suggests, none of these are spoons.

## Running Locally

To run this application, you need to serve the files through a local HTTP server. This is because modern browsers have security restrictions that prevent loading JavaScript modules and assets directly from the local file system.

1.  **Start a simple HTTP server:**
    Open your terminal or command prompt, navigate to the root directory of this project, and run the following command (if you have Python installed):
    ```bash
    python -m http.server 8000
    ```
    If port 8000 is in use, you can choose another port (e.g., 8080).

2.  **Open in your browser:**
    Once the server is running, open your web browser and navigate to:
    ```
    http://localhost:8000
    ```
    (If you used a different port, replace `8000` with that port number).

---

## Legacy Game (Easter Egg)

Hidden within the site is the legacy **Monster Chase Game**, a 3D WebGL experience. Access it via the hidden link in the footer (look for the spoon 🥄), or navigate directly to `game.html`.

### Game Description
The game features a "Hot Potato" / "Tag" mechanic where a Monster and a Bunny swap the "It" role upon collision. It includes dynamic lighting, procedural terrain, and AI behaviors.

### WebGL Environmental Notes
- **GPU Access:** Requires hardware acceleration.
- **Environment:** If the monster and grid do not render, ensure your environment supports WebGL.

### Mobile Improvements
- **Optimized UI:** Controls are touch-friendly.
- **Performance:** Automatically adjusts settings for mobile devices.

### Roadmap (Legacy)
The game development followed a phased approach:
1.  **Refactor for Clarity:** Modular code structure.
2.  **Enhance Bunny Model:** Improved 3D model and shaders.
3.  **Enhance Interaction:** Camera controls and basic interaction.
4.  **Advanced Lighting:** Dynamic shadows and environment mapping.
5.  **Expand Scene:** Procedural terrain and additional assets.
