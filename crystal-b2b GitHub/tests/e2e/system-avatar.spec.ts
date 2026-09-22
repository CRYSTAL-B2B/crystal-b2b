import { expect, test, type Page } from '@playwright/test';
const key='b2b:avatar:dock:v2';
const widget='.system-avatar', panel='.avatar-bubble', handle='.avatar-handle';
async function start(page:Page){await page.goto('/');await expect(page.locator(widget)).toHaveAttribute('data-ready','true');await expect(page.locator(widget)).toHaveAttribute('data-assets','ready');}
async function safe(page:Page,selector=widget){
  const r=await page.locator(selector).boundingBox();expect(r).toBeTruthy();
  const v=await page.evaluate(()=>({w:visualViewport?.width??innerWidth,h:visualViewport?.height??innerHeight,x:visualViewport?.offsetLeft??0,y:visualViewport?.offsetTop??0,header:document.querySelector('.site-header')!.getBoundingClientRect().bottom}));
  expect(r!.x).toBeGreaterThanOrEqual(v.x-1);expect(r!.y).toBeGreaterThanOrEqual(Math.max(v.y,v.header)-1);
  expect(r!.x+r!.width).toBeLessThanOrEqual(v.x+v.w+1);expect(r!.y+r!.height).toBeLessThanOrEqual(v.y+v.h+1);
}
async function drag(page:Page,x:number,y:number){
  const r=(await page.locator(widget).boundingBox())!;
  await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.mouse.move(x,y,{steps:8});await page.mouse.up();
  await expect(page.locator(widget)).toHaveAttribute('data-interaction','idle');await safe(page);
}
async function open(page:Page){await page.locator(handle).focus();await page.keyboard.press('Enter');await expect(page.locator(panel)).toHaveAttribute('aria-hidden','false');await page.waitForTimeout(250);}
async function scrollTo(page:Page,y:number){await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);await page.waitForTimeout(350);}
test.use({viewport:{width:1440,height:900}});

test('initial calm avatar, preserved semantic Hero and no laser',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await start(page);
 await expect(page.locator('h1')).toHaveCount(1);await expect(page.locator('.hero h1')).toHaveText('Маркетинг – это управляемая инвестиция в рост прибыли');
 await expect(page.locator(`${panel} h1, ${panel} h2, .system-avatar canvas, [data-system-target]`)).toHaveCount(0);
 await expect(page.locator(panel)).toHaveAttribute('aria-hidden','true');await expect(page.locator('.avatar-video')).toHaveCount(2);
 expect(await page.locator(widget).evaluate(e=>e.getBoundingClientRect().width)).toBe(282);
 expect(await page.locator('.avatar-poster').evaluate((e:HTMLImageElement)=>e.complete&&e.naturalWidth>0)).toBe(true);await safe(page);expect(errors).toEqual([]);
});

for(const [edge,x,y] of [['left',-100,480],['right',1540,480],['top',720,-100],['bottom',720,1000]] as const){
 test(`drag ${edge}, snap and persist`,async({page})=>{await start(page);await drag(page,x,y);await expect(page.locator(widget)).toHaveAttribute('data-edge',edge);
 const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!),key);expect(saved.edge).toBe(edge);expect(saved.offset).toBeGreaterThanOrEqual(0);expect(saved.offset).toBeLessThanOrEqual(1);
 await page.reload();await expect(page.locator(widget)).toHaveAttribute('data-edge',edge);await safe(page);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(200);await safe(page);await expect(page.locator(widget)).toHaveAttribute('data-edge',edge);
 expect(await page.locator(widget).evaluate(e=>e.getBoundingClientRect().width)).toBe(147);
 });
}
test('all corners, rapid movement, pointer cancellation and scroll during drag',async({page})=>{
 await start(page);for(const [x,y]of [[0,0],[1440,0],[0,900],[1440,900]])await drag(page,x,y);
 const r=(await page.locator(widget).boundingBox())!;await page.mouse.move(r.x+20,r.y+20);await page.mouse.down();await page.mouse.move(500,500);await scrollTo(page,200);
 await expect(page.locator(widget)).toHaveAttribute('data-interaction','dragging');await page.mouse.move(-500,-500);await page.mouse.up();await expect(page.locator(widget)).toHaveAttribute('data-interaction','idle');await safe(page);
 const pos=(await page.locator(widget).boundingBox())!;await page.mouse.move(pos.x+30,pos.y+30);await page.mouse.down();await page.mouse.move(pos.x+50,pos.y+50);
 await page.locator(handle).dispatchEvent('pointercancel',{pointerId:1});await page.mouse.up();await expect(page.locator('body')).not.toHaveAttribute('data-avatar-dragging','true');
});
test('click threshold, keyboard docking, close and focus',async({page})=>{
 await start(page);const r=(await page.locator(widget).boundingBox())!;await page.mouse.move(r.x+100,r.y+100);await page.mouse.down();await page.mouse.move(r.x+102,r.y+101);await page.mouse.up();
 await expect(page.locator(panel)).toHaveAttribute('aria-hidden','false');await safe(page,panel);
 await page.getByRole('button',{name:'Закрыть описание'}).focus();await page.keyboard.press('Escape');await expect(page.locator(panel)).toHaveAttribute('aria-hidden','true');await expect(page.locator(handle)).toBeFocused();
 for(const [arrow,edge]of [['ArrowRight','right'],['ArrowDown','bottom'],['ArrowUp','top'],['ArrowLeft','left']]){await page.keyboard.press(arrow);await expect(page.locator(widget)).toHaveAttribute('data-interaction','idle');await expect(page.locator(widget)).toHaveAttribute('data-edge',edge);await safe(page);}
 await page.keyboard.press('Space');await expect(page.locator(panel)).toHaveAttribute('aria-hidden','false');
});
for(const [edge,side]of [['left','right'],['right','left'],['top','below'],['bottom','above']]){
 test(`bubble placement ${edge} → ${side}`,async({page})=>{await page.addInitScript(({key,edge})=>localStorage.setItem(key,JSON.stringify({edge,offset:.5})),{key,edge});await start(page);await open(page);await expect(page.locator(panel)).toHaveAttribute('data-placement',side);await safe(page,panel);});
}
test('Hero stays quiet; manual task picker survives scroll and drag',async({page})=>{
 await start(page);await scrollTo(page,180);await expect(page.locator(panel)).toHaveAttribute('aria-hidden','true');
 await open(page);await expect(page.locator('.avatar-task-option')).toHaveCount(4);
 await screen(page,'#results');await expect(page.locator(panel)).toHaveAttribute('data-mode','question');
 const r=(await page.locator(widget).boundingBox())!;await page.mouse.move(r.x+100,r.y+100);await page.mouse.down();await page.mouse.move(1000,450);await expect(page.locator(panel)).toHaveAttribute('aria-hidden','true');await page.mouse.up();await expect(page.locator(widget)).toHaveAttribute('data-interaction','idle');await expect(page.locator(panel)).toHaveAttribute('aria-hidden','false');await safe(page,panel);
 await page.keyboard.press('Escape');await scrollTo(page,0);await expect(page.locator(panel)).toHaveAttribute('aria-hidden','true');
});
test('mobile, orientation, short viewport, zoom and invalid storage',async({page})=>{
 await page.addInitScript(k=>localStorage.setItem(k,'{"edge":"right","offset":99}'),key);await start(page);
 for(const viewport of [{width:320,height:568},{width:390,height:844},{width:844,height:390}]){await page.setViewportSize(viewport);await page.waitForTimeout(250);await safe(page);if(await page.locator(panel).getAttribute('aria-hidden')==='true')await open(page);await safe(page,panel);}
 await page.setViewportSize({width:1440,height:900});for(const zoom of [1.25,1.5]){await page.evaluate(z=>{document.documentElement.style.zoom=String(z);dispatchEvent(new Event('resize'));},zoom);await page.waitForTimeout(250);await safe(page);await safe(page,panel);}
});
test('unavailable localStorage still allows docking',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('disabled');}});});await start(page);await drag(page,1400,450);await expect(page.locator(widget)).toHaveAttribute('data-edge','right');
});
test('mobile menu and lead modal take precedence',async({page})=>{
 await page.setViewportSize({width:390,height:844});await start(page);await open(page);await page.getByRole('button',{name:'Меню',exact:true}).click();await expect(page.locator(widget)).toBeHidden();await expect(page.locator(panel)).toBeHidden();await page.keyboard.press('Escape');await expect(page.locator(widget)).toBeVisible();
 await page.getByRole('button',{name:'Обсудить задачу',exact:true}).first().click();await expect(page.locator('body')).toHaveAttribute('data-modal-open','true');await expect(page.locator(widget)).toBeHidden();await page.keyboard.press('Escape');await expect(page.locator(widget)).toBeVisible();
});
test('approved states use two permanent players and return to idle without black surface',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(HTMLVideoElement.prototype,'getVideoPlaybackQuality',{value:()=>({totalVideoFrames:24,droppedVideoFrames:0})}));
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await start(page);await page.evaluate(()=>{document.querySelectorAll('.avatar-video').forEach(e=>e.setAttribute('data-instance','original'));});await open(page);
 await expect(page.locator(widget)).toHaveAttribute('data-media','video');await expect(page.locator(widget)).toHaveAttribute('data-state','idle');
 await expect.poll(()=>page.locator('.avatar-video').evaluateAll(es=>es.some(e=>(e as HTMLVideoElement).readyState>=2&&getComputedStyle(e).opacity==='1'))).toBe(true);
 await expect.poll(()=>page.locator('.avatar-video').evaluateAll(es=>es.some(e=>(e as HTMLVideoElement).loop&&!(e as HTMLVideoElement).paused&&getComputedStyle(e).opacity==='1'))).toBe(true);await page.waitForTimeout(400);
 await page.getByRole('button',{name:'Закрыть описание'}).click();await expect(page.locator(widget)).toHaveAttribute('data-state','glint');await expect(page.locator(widget)).toHaveAttribute('data-state','idle');await expect(page.locator('.avatar-video[data-instance=original]')).toHaveCount(2);expect(errors).toEqual([]);
});
test('missing requested state falls back to idle',async({page})=>{
 await page.route('**/avatar-calm-motion-manifest.json',async route=>{const response=await route.fetch();const manifest=await response.json();manifest.exports=manifest.exports.filter((e:{label:string})=>e.label==='idle');await route.fulfill({json:manifest});});await start(page);await open(page);await expect(page.locator(widget)).toHaveAttribute('data-media','video');await expect(page.locator(widget)).toHaveAttribute('data-state','idle');
});
test('failed videos and manifest preserve static portrait and working bubble',async({page})=>{
 await page.route('**/system-avatar/motion/clips/**',route=>route.abort());await start(page);await open(page);await expect(page.locator(widget)).toHaveAttribute('data-media','static');await expect(page.locator('.avatar-poster')).toBeVisible();await safe(page,panel);
 await page.route('**/avatar-calm-motion-manifest.json',route=>route.abort());await page.reload();await expect(page.locator(widget)).toHaveAttribute('data-assets','ready');await open(page);await expect(page.locator(widget)).toHaveAttribute('data-media','static');
});
test('reduced motion skips video requests and retains keyboard/scroll',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});const requests:string[]=[];page.on('request',r=>{if(r.url().includes('/motion/clips/'))requests.push(r.url());});await start(page);await open(page);await page.keyboard.press('ArrowRight');await expect(page.locator(widget)).toHaveAttribute('data-edge','right');await page.waitForTimeout(1500);expect(requests).toEqual([]);await expect(page.locator('.avatar-video[src]')).toHaveCount(0);await safe(page,panel);
});
test('without JavaScript, real Hero and static avatar remain',async({browser,baseURL})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:1440,height:900}});const page=await context.newPage();await page.goto(baseURL!);await expect(page.locator('.hero h1')).toBeVisible();await expect(page.locator('.avatar-poster')).toBeVisible();await expect(page.locator(handle)).toBeDisabled();await expect(page.locator(panel)).toHaveAttribute('aria-hidden','true');await context.close();
});

test('real touch capture and pinch viewport constraints',async({browser,browserName,baseURL})=>{
 test.skip(browserName!=='chromium','CDP touch injection is Chromium-specific');
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();await page.goto(baseURL!);await expect(page.locator(widget)).toHaveAttribute('data-ready','true');
 const cdp=await context.newCDPSession(page);const r=(await page.locator(widget).boundingBox())!;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+80,y:r.y+80}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:365,y:430}]});await expect(page.locator(widget)).toHaveAttribute('data-interaction','dragging');
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect(page.locator(widget)).toHaveAttribute('data-interaction','idle');await safe(page);
 await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:1.5});await page.waitForTimeout(250);await safe(page);await context.close();
});
test('rapid interactions and hidden document pause video without stale state',async({page})=>{
 // Isolate request ordering from the separately tested dropped-frame fallback.
 await page.addInitScript(()=>Object.defineProperty(HTMLVideoElement.prototype,'getVideoPlaybackQuality',{value:()=>({totalVideoFrames:24,droppedVideoFrames:0})}));
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await start(page);await page.locator(handle).focus();
 for(let i=0;i<6;i++){await page.keyboard.press('Enter');await page.waitForTimeout(370);}
 await expect(page.locator('.avatar-video')).toHaveCount(2);await page.waitForTimeout(1600);await expect(page.locator(widget)).toHaveAttribute('data-state','idle');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
 await expect(page.locator(widget)).toHaveAttribute('data-media','static');expect(await page.locator('.avatar-video').evaluateAll(es=>es.every(e=>(e as HTMLVideoElement).paused))).toBe(true);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));});await open(page);await expect(page.locator(widget)).toHaveAttribute('data-media','video');expect(errors).toEqual([]);
});
test('approved poster failure uses supplied master portrait',async({page})=>{
 await page.route('**/motion/posters/avatar-idle.webp',r=>r.abort());await start(page);await expect(page.locator(widget)).toHaveAttribute('data-image-fallback','true');await expect(page.locator('.avatar-poster')).toHaveAttribute('src','/system-avatar/source/avatar-master.png');expect(await page.locator('.avatar-poster').evaluate((e:HTMLImageElement)=>e.naturalWidth>0)).toBe(true);await open(page);await safe(page,panel);
});

test('poor playback quality deliberately falls back to static',async({page})=>{
 await page.addInitScript(()=>{let total=0;Object.defineProperty(HTMLVideoElement.prototype,'getVideoPlaybackQuality',{value:()=>({totalVideoFrames:total+=120,droppedVideoFrames:total*.6})});});await start(page);await open(page);await expect(page.locator(widget)).toHaveAttribute('data-media','static');await expect(page.locator('.avatar-poster')).toBeVisible();await expect(page.locator(panel)).toHaveAttribute('aria-hidden','false');
});

for(const viewport of [{width:1440,height:900},{width:1366,height:768},{width:1024,height:600},{width:390,height:844},{width:375,height:667},{width:320,height:568},{width:844,height:390}]){
 test(`Hero fits first viewport ${viewport.width}x${viewport.height}`,async({page})=>{
  await page.setViewportSize(viewport);await start(page);await expect(page.locator('.hero')).toHaveAttribute('data-fitted','true');
  await page.waitForTimeout(300);
  const box=await page.locator('.hero').boundingBox();expect(box!.height).toBeLessThanOrEqual(viewport.height+1);
  for(const selector of ['.hero h1','.hero-supporting','.hero-lede','.hero-actions','.hero-actions .button','.hero-actions .text-link']){const r=(await page.locator(selector).boundingBox())!;expect(r.y+r.height).toBeLessThanOrEqual(viewport.height-12);expect(r.x+r.width).toBeLessThanOrEqual(viewport.width);expect(r.y).toBeGreaterThan(60);}
  await safe(page);
 });
}
test('idle loops across its boundary and reactions return to loop',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(HTMLVideoElement.prototype,'getVideoPlaybackQuality',{value:()=>({totalVideoFrames:24,droppedVideoFrames:0})}));await start(page);
 await expect(page.locator(widget)).toHaveAttribute('data-media','video');
 await page.evaluate(async()=>{const v=[...document.querySelectorAll<HTMLVideoElement>('.avatar-video')].find(v=>v.loop)!;await new Promise<void>(resolve=>{v.addEventListener('seeked',()=>resolve(),{once:true});v.currentTime=v.duration-.12;});});
 await expect.poll(()=>page.locator('.avatar-video').evaluateAll(es=>es.some(e=>(e as HTMLVideoElement).loop&&!(e as HTMLVideoElement).paused&&(e as HTMLVideoElement).currentTime<1))).toBe(true);
 await page.locator(handle).click();await expect(page.locator(widget)).toHaveAttribute('data-state','glint');await expect(page.locator(widget)).toHaveAttribute('data-state','idle');
});
const screens=[['system','#system'],['results','#results'],['offer','#offer'],['flow','.flow-scene'],['cases','#cases'],['contact','#contact']] as const;
async function screen(page:Page,selector:string){
 await page.locator(selector).evaluate(e=>window.scrollTo({top:scrollY+e.getBoundingClientRect().top-innerHeight*.2,behavior:'instant'}));
 await page.waitForTimeout(600);
}
test('only six screens show contextual explanations and CTA, including backscroll',async({page})=>{
 await start(page);
 for(const [id,selector] of [...screens,...[...screens].reverse()]){
  await screen(page,selector);await expect(page.locator(panel)).toHaveAttribute('data-section',id);
  await expect(page.locator(panel)).toHaveAttribute('aria-hidden','false');
  await expect(page.locator('.avatar-bubble-primary')).not.toBeEmpty();
  await expect(page.locator('.avatar-bubble-secondary')).toBeHidden();
  await expect(page.locator('.avatar-context-cta')).toBeVisible();await expect(page.locator('.avatar-question-options')).toBeHidden();await safe(page,panel);
 }
 const excluded=await page.locator('main h2').evaluateAll(headings=>headings.filter(h=>!h.closest('#system,#results,#offer,.flow-scene,#cases,#contact')).map(h=>h.closest('section')?.className).filter(Boolean));
 expect(excluded.length).toBeGreaterThan(4);
 for(const className of excluded){await screen(page,'section.'+className!.trim().split(/\s+/).join('.'));await expect(page.locator(panel)).toHaveAttribute('aria-hidden','true');}
 await scrollTo(page,0);await expect(page.locator(panel)).toHaveAttribute('aria-hidden','true');
});
test('section CTA opens lead modal and dismissal lasts until leaving the screen',async({page})=>{
 await start(page);await screen(page,'#system');await expect(page.locator(panel)).toHaveAttribute('data-mode','section');
 await page.locator('.avatar-context-cta').click();await expect(page.getByRole('dialog',{name:'Обсудить задачу'})).toBeVisible();
 await page.keyboard.press('Escape');await expect(page.locator(handle)).toBeFocused();await expect(page.locator(panel)).toHaveAttribute('aria-hidden','true');
 await scrollTo(page,0);await screen(page,'#system');await expect(page.locator(panel)).toHaveAttribute('aria-hidden','false');
 await page.locator(handle).click();await expect(page.locator(panel)).toHaveAttribute('data-mode','question');
});
for(const viewport of [{width:1440,height:900},{width:320,height:568}]){
 test(`four tasks prefill the existing lead form and preserve drafts ${viewport.width}`,async({page})=>{
  await page.setViewportSize(viewport);await start(page);
  const tasks=['Сформировать стратегию.','Настроить лидогенерацию.','Построить систему привлечения.','Автоматизация бизнеса.'];
  for(let i=0;i<tasks.length;i++){
   await page.locator(handle).click();await expect(page.locator(panel)).toHaveAttribute('data-mode','question');await safe(page,panel);
   await page.getByRole('button',{name:tasks[i],exact:true}).click();
   const dialog=page.getByRole('dialog',{name:'Обсудить задачу'});await expect(dialog).toBeVisible();await expect(page.locator(widget)).toBeHidden();
   await expect(dialog.locator('#lead-task')).toHaveValue(tasks[i]+(i?'\n\nНужна интеграция с CRM.':''));
   if(i===0){await dialog.locator('#lead-name').fill('Тестовый посетитель');await dialog.locator('#lead-task').fill(tasks[i]+'\n\nНужна интеграция с CRM.');}
   else await expect(dialog.locator('#lead-name')).toHaveValue('Тестовый посетитель');
   await page.keyboard.press('Escape');await expect(dialog).toBeHidden();await expect(page.locator(handle)).toBeFocused();await expect(page.locator(panel)).toHaveAttribute('aria-hidden','true');
  }
  await screen(page,'#results');await expect(page.locator(panel)).toHaveAttribute('data-section','results');
  expect(await page.locator('.avatar-bubble-surface').evaluate(e=>e.scrollTop)).toBe(0);
 });
}
test('touch opens task picker and leads to capture form with reduced motion',async({browser,baseURL})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const page=await context.newPage();await page.goto(baseURL!);await expect(page.locator(widget)).toHaveAttribute('data-ready','true');
 await page.locator(handle).tap();await expect(page.locator(panel)).toHaveAttribute('data-mode','question');
 await page.getByRole('button',{name:'Автоматизация бизнеса.',exact:true}).tap();await expect(page.getByRole('dialog',{name:'Обсудить задачу'})).toBeVisible();await expect(page.locator('#lead-task')).toHaveValue('Автоматизация бизнеса.');
 await context.close();
});

test('calm loop excludes flare and speech; bubbles preserve playback and clicks start the flash',async({page})=>{
 const speechRequests:string[]=[];page.on('request',r=>{if(r.url().includes('avatar-speak.mp4'))speechRequests.push(r.url());});
 await page.addInitScript(()=>Object.defineProperty(HTMLVideoElement.prototype,'getVideoPlaybackQuality',{value:()=>({totalVideoFrames:24,droppedVideoFrames:0})}));await start(page);
 const manifest=await page.request.get('/system-avatar/motion/avatar-calm-motion-manifest.json').then(r=>r.json());expect(manifest.exports.find((e:{label:string})=>e.label==='idle').frame_count).toBe(91);
 expect(manifest.exports.find((e:{label:string})=>e.label==='idle').source_spans).toEqual([[0,63],[152,192]]);
 expect(manifest.exports.find((e:{label:string})=>e.label==='glint').start).toBe(62/24);
 await expect(page.locator(widget)).toHaveAttribute('data-media','video');
 expect(await page.locator('.avatar-video').evaluateAll(es=>es.some(e=>Math.abs((e as HTMLVideoElement).duration-91/24)<.01&&(e as HTMLVideoElement).loop))).toBe(true);
 await page.evaluate(()=>{
  document.querySelectorAll('.avatar-video').forEach(v=>v.addEventListener('loadstart',()=>v.setAttribute('data-reloaded','true')));
  const section=document.querySelector('#system')!.getBoundingClientRect();
  window.scrollTo({top:scrollY+section.top-innerHeight*.2,behavior:'instant'});
 });
 await expect(page.locator(panel)).toHaveAttribute('aria-hidden','false');await expect(page.locator(widget)).toHaveAttribute('data-state','idle');
 await expect(page.locator('.avatar-video[data-reloaded]')).toHaveCount(0);
 await page.keyboard.press('Escape');await scrollTo(page,0);
 await open(page);await expect(page.locator(widget)).toHaveAttribute('data-state','idle');
 await page.locator('.hero h1').click();await expect(page.locator(widget)).toHaveAttribute('data-state','glint');await expect(page.locator('.avatar-video[data-source="clips/avatar-glint-onset.mp4"]')).toHaveCount(1);
 // Recover even if the native player stalls and never emits ended.
 await page.locator('.avatar-video[data-source="clips/avatar-glint-onset.mp4"]').evaluate((v:HTMLVideoElement)=>{v.onended=null;v.pause();});
 await expect(page.locator(widget)).toHaveAttribute('data-state','idle');await page.keyboard.press('Escape');await expect(page.locator(widget)).toHaveAttribute('data-state','idle');
 expect(speechRequests).toEqual([]);
});
test('background overscan shrinks while preserving coverage at both parallax extremes',async({page})=>{
 await start(page);
 for(const viewport of [{width:1440,height:900},{width:1024,height:600},{width:390,height:844}]){
  await page.setViewportSize(viewport);await page.waitForTimeout(200);
  for(const point of [[0,0],[viewport.width,viewport.height]]){
   await page.locator('.hero-media').dispatchEvent('pointermove',{pointerType:'mouse',clientX:point[0],clientY:point[1]});await page.waitForTimeout(450);
   const coverage=await page.locator('.hero-media').evaluate(e=>{const a=e.getBoundingClientRect(),b=e.querySelector('.hero-image')!.getBoundingClientRect();return{left:b.left<=a.left+.5,top:b.top<=a.top+.5,right:b.right>=a.right-.5,bottom:b.bottom>=a.bottom-.5,scale:Number((e as HTMLElement).style.getPropertyValue('--hero-cover-scale'))};});
   expect(coverage.left&&coverage.right&&coverage.top&&coverage.bottom).toBe(true);expect(coverage.scale).toBeLessThan(1.055);
  }
 }
 await page.setViewportSize({width:1440,height:900});
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect.poll(()=>page.locator('.hero-media').evaluate(e=>Number((e as HTMLElement).style.getPropertyValue('--hero-cover-scale')))).toBeCloseTo(1.0125,4);
 await expect(page.locator('.hero-image').first()).toHaveCSS('animation-name','none');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await expect.poll(()=>page.locator('.hero-media').evaluate(e=>Number((e as HTMLElement).style.getPropertyValue('--hero-cover-scale')))).toBeCloseTo(1.022222,4);
});
