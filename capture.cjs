const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--enable-unsafe-swiftshader',
      '--no-zygote',
      '--disable-web-security',
      '--allow-file-access-from-files'
    ],
    protocolTimeout: 60000
  });
  const page = await browser.newPage();

  // Forward console logs to the node process
  page.on('console', msg => {
    // console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
  });

  try {
    // Navigate to the page
    await page.goto('http://localhost:8000/index.html', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Wait for the app to initialize and load models
    const pixelData = await page.evaluate(async () => {
      // Helper function to wait for a condition
      const waitFor = (condition, timeout = 30000) => {
        return new Promise((resolve, reject) => {
          const start = Date.now();
          const check = () => {
            if (condition()) resolve();
            else if (Date.now() - start > timeout) reject(new Error('Timeout waiting for condition'));
            else requestAnimationFrame(check);
          };
          check();
        });
      };

      // 1. Wait for app initialization
      if (!window.app) {
        console.log("Waiting for window.app...");
        await waitFor(() => window.app);
      }
      const app = window.app;

      // 2. Wait for monster model to be loaded
      console.log("Waiting for monster model...");
      await waitFor(() => app.monster);

      // 3. Freeze game logic and animation loop logic
      // We overwrite updateGameLogic to stop AI movement and camera shake updates
      app.updateGameLogic = () => {};

      // Stop any other animations that might interfere
      app.controls.autoRotate = false;

      // 4. Setup predictable scene
      // Set solid white background to contrast with the purple monster
      if (app.scene.background && app.scene.background.setHex) {
          app.scene.background.setHex(0xFFFFFF);
      } else {
          // If it's not a color object (e.g. texture), we might have issues, but in app.js it is initialized as Color.
          // However, we can't use new THREE.Color() because THREE is not global.
          // We can try to rely on the fact it is a Color object.
          // If it was null, we would have a problem setting it.
          // But let's assume it is initialized.
      }
      app.scene.fog = null; // Remove fog

      // Hide grass and other elements that might get in the way
      if (app.grassField) app.grassField.visible = false;
      if (app.monsterLightCircle) app.monsterLightCircle.visible = false;
      if (app.bunnyLightCircle) app.bunnyLightCircle.visible = false;
      if (app.bunny) app.bunny.visible = false; // Hide bunny to focus on monster
      if (app.particles) app.particles.forEach(p => p.visible = false);

      // Position Monster at origin
      app.monster.position.set(0, 0, 0);
      app.monster.rotation.set(0, 0, 0);

      // Position Camera directly in front of the monster
      app.camera.position.set(0, 0, 2); // Close enough
      app.camera.lookAt(0, 0, 0);
      app.controls.update(); // Update controls to match camera change

      // 5. Render a frame and read pixels
      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          // Force a render
          app.renderer.render(app.scene, app.camera);

          const gl = app.renderer.getContext();
          const width = gl.drawingBufferWidth;
          const height = gl.drawingBufferHeight;

          // Read center pixel
          const pixel = new Uint8Array(4);
          gl.readPixels(width / 2, height / 2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

          resolve(Array.from(pixel));
        });
      });
    });

    console.log('Pixel data at center:', pixelData);

    // Analyze pixel data
    // White background is [255, 255, 255, 255]
    // Monster is purple-ish, so it should be significantly different from white.
    // We expect R, G, B to be < 250 ideally.

    // Check if the pixel is NOT white (allowing for some tolerance due to lighting/shading)
    const isWhite = pixelData[0] > 240 && pixelData[1] > 240 && pixelData[2] > 240;
    const isTransparent = pixelData[3] === 0;

    let successConditionMet = false;
    let message = '';

    if (isTransparent) {
        message = "Failure: Center pixel is transparent.";
    } else if (isWhite) {
        message = "Failure: Center pixel is white (background color). Monster not visible.";
    } else {
        successConditionMet = true;
        message = "Success: Center pixel is not background color. Object rendered.";
    }

    console.log(message);

    const output = {
      console: [], // We didn't collect all logs to keep it clean, but structure is preserved
      successConditionMet: successConditionMet,
      pixelData: pixelData,
      message: message
    };

    fs.writeFileSync('output.json', JSON.stringify(output, null, 2));
    console.log('Captured output to output.json');

  } catch (e) {
    console.error('Error during capture:', e);
    const output = {
      successConditionMet: false,
      error: e.toString()
    };
    fs.writeFileSync('output.json', JSON.stringify(output, null, 2));
  } finally {
    await browser.close();
  }
})();
