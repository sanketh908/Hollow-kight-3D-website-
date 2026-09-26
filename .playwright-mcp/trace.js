async (page) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
  await page.evaluate(() => localStorage.setItem('hk-theme', 'godmaster'));
  await page.reload(); await page.waitForTimeout(3000);
  const events = [];
  cdp.on('Tracing.dataCollected', e => events.push(...e.value));
  const done = new Promise(r => cdp.once('Tracing.tracingComplete', r));
  await cdp.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline.stack', transferMode: 'ReportEvents' });
  await cdp.send('Input.synthesizeScrollGesture', { x: 195, y: 400, yDistance: -1500, speed: 1400, gestureSourceType: 'mouse' });
  await cdp.send('Tracing.end'); await done;
  const layouts = events.filter(e => e.name === 'Layout');
  const who = {};
  for (const e of layouts) {
    const st = e.args?.beginData?.stackTrace;
    const k = st && st.length ? st.slice(0, 3).map(f => `${f.functionName || '(anon)'}@${(f.url || '').split('/').pop().slice(0, 40)}:${f.lineNumber}`).join(' < ') : '(no JS stack: rendering pipeline)';
    who[k] = (who[k] || 0) + 1;
  }
  const inval = {};
  for (const e of events.filter(e => e.name === 'LayoutInvalidationTracking' || e.name === 'ScheduleStyleInvalidationTracking' || e.name === 'StyleRecalcInvalidationTracking')) {
    const k = (e.args?.data?.reason || e.name) + ' ' + (e.args?.data?.nodeName || '');
    inval[k] = (inval[k] || 0) + 1;
  }
  await cdp.send('Emulation.clearDeviceMetricsOverride');
  await page.evaluate(() => { localStorage.removeItem('hk-theme'); scrollTo(0, 0); });
  return { layouts: layouts.length, who, errs };
}
