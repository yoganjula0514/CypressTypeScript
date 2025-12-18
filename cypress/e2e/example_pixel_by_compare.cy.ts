describe("Cypress + TypeScript setup", () => {
  it("loads the example page and checks content", () => {
    cy.visit("/");
    cy.get(`#unity-canvas`).should("exist");
    // cy.get(`#unity-canvas`).should("exist").wait(10000).screenshot("test");

    cy.fixture("Images/test.png", "base64").then(
      (baselineBase64) => {
        cy.get("#unity-canvas")
          .then(($canvas) => {
            const canvasEl = $canvas[0] as HTMLCanvasElement;

            // canvasEl.width = 518;
            // canvasEl.height = 259;
            // canvasEl.style.width = '518px';
            // canvasEl.style.height = '259px';

            cy.window().then((win) => {
              const baselineImg = new Image();
              baselineImg.src = `data:image/png;base64,${baselineBase64}`;

              return new Promise<void>((resolve, reject) => {
                baselineImg.onload = () => {
                  // Ensure same size
                  if (
                    canvasEl.width !== baselineImg.width ||
                    canvasEl.height !== baselineImg.height
                  ) {
                    return reject(
                      `Size mismatch: canvas=${canvasEl.width}x${canvasEl.height}, baseline=${baselineImg.width}x${baselineImg.height}`
                    );
                  }

                  // Draw baseline to offscreen canvas
                  const offCanvas = win.document.createElement("canvas");
                  offCanvas.width = baselineImg.width;
                  offCanvas.height = baselineImg.height;
                  const offCtx = offCanvas.getContext("2d");
                  if (!offCtx) return reject("No 2D context for baseline");

                  offCtx.drawImage(baselineImg, 0, 0);

                  const baselineData = offCtx.getImageData(
                    0,
                    0,
                    offCanvas.width,
                    offCanvas.height
                  ).data;
                  const currentData = (
                    canvasEl.getContext("2d") as CanvasRenderingContext2D
                  ).getImageData(0, 0, canvasEl.width, canvasEl.height).data;

                  // Compare with tolerance
                  const channelTolerance = 10; // per channel
                  let diffPixels = 0;

                  for (let i = 0; i < baselineData.length; i += 4) {
                    const rDiff = Math.abs(baselineData[i] - currentData[i]);
                    const gDiff = Math.abs(
                      baselineData[i + 1] - currentData[i + 1]
                    );
                    const bDiff = Math.abs(
                      baselineData[i + 2] - currentData[i + 2]
                    );
                    const aDiff = Math.abs(
                      baselineData[i + 3] - currentData[i + 3]
                    );

                    if (
                      rDiff > channelTolerance ||
                      gDiff > channelTolerance ||
                      bDiff > channelTolerance ||
                      aDiff > channelTolerance
                    ) {
                      diffPixels++;
                    }
                  }

                  const totalPixels = baselineData.length / 4;
                  const diffPercent = (diffPixels / totalPixels) * 100;

                  // Allow up to 1% difference
                  expect(
                    diffPercent,
                    `Pixel difference: ${diffPercent.toFixed(2)}%`
                  ).to.be.lessThan(1);

                  resolve();
                };

                baselineImg.onerror = reject;
              });
            });
          });
      }
    );
  });
});
