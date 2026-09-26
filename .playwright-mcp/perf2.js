async (page) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Performance.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await page.evaluate(() => localStorage.setItem('hk-theme', 'godmaster'));
  await page.reload(); await page.waitForTimeout(3000);
  const get = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
  const a = await get();
  await page.evaluate(() => new Promise(res => {
    let y = 0; const start = performance.now(); const max = document.documentElement.scrollHeight - innerHeight;
    const f = (now) => { y = Math.min(max, y + 18); scrollTo(0, y); if (now - start < 4000) requestAnimationFrame(f); else res(); };
    requestAnimationFrame(f);
  }));
  const b = await get();
  const d = k => +(b[k] - a[k]).toFixed(3);
  const coarse = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
  await cdp.send('Emulation.clearDeviceMetricsOverride');
  await page.evaluate(() => { localStorage.removeItem('hk-theme'); scrollTo(0, 0); });
  return { coarse, layouts: d('LayoutCount'), styleRecalcs: d('RecalcStyleCount'), layoutSec: d('LayoutDuration'), styleSec: d('RecalcStyleDuration'), scriptSec: d('ScriptDuration'), taskSec: d('TaskDuration') };
}
