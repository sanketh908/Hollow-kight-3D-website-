async (page) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Performance.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await page.evaluate(() => localStorage.setItem('hk-theme', 'godmaster'));
  await page.reload(); await page.waitForTimeout(3000);
  const get = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
  const diff = (a, b) => ({ layouts: b.LayoutCount - a.LayoutCount, styles: b.RecalcStyleCount - a.RecalcStyleCount, scriptMs: Math.round((b.ScriptDuration - a.ScriptDuration) * 1000), taskMs: Math.round((b.TaskDuration - a.TaskDuration) * 1000) });
  // idle 3s
  let a = await get(); await page.waitForTimeout(3000); const idle = diff(a, await get());
  // real touch-style fling scrolls, ~3s
  a = await get();
  const t0 = Date.now();
  for (let i = 0; i < 4; i++) await cdp.send('Input.synthesizeScrollGesture', { x: 195, y: 400, yDistance: -650, speed: 1400, gestureSourceType: 'mouse', repeatCount: 1 });
  const ms = Date.now() - t0;
  const scroll = { ...diff(a, await get()), ms, y: await page.evaluate(() => scrollY) };
  await cdp.send('Emulation.clearDeviceMetricsOverride');
  await page.evaluate(() => { localStorage.removeItem('hk-theme'); scrollTo(0, 0); });
  return { idle3s: idle, scroll };
}
