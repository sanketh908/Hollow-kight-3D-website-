async (page) => {
  const cdp = await page.context().newCDPSession(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  const out = {};
  for (const id of ['classic', 'hidden-dreams', 'godmaster']) {
    await page.evaluate(id => localStorage.setItem('hk-theme', id), id);
    await page.reload(); await page.waitForTimeout(3000);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    out[id] = await page.evaluate(() => new Promise(res => {
      const frames = []; let last = performance.now(); const start = last; let y = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      const f = (now) => {
        frames.push(now - last); last = now;
        y = Math.min(max, y + 18); window.scrollTo(0, y);
        if (now - start < 4000) requestAnimationFrame(f);
        else {
          frames.sort((a, b) => a - b);
          const n = frames.length;
          res({ fps: +(n / 4).toFixed(1), p50: +frames[n >> 1].toFixed(1), p95: +frames[Math.floor(n * 0.95)].toFixed(1), janky: frames.filter(x => x > 50).length });
        }
      };
      requestAnimationFrame(f);
    }));
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  }
  await cdp.send('Emulation.clearDeviceMetricsOverride');
  await page.evaluate(() => { localStorage.removeItem('hk-theme'); scrollTo(0, 0); });
  return out;
}
