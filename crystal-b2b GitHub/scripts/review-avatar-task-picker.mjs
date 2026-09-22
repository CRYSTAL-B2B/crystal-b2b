import {chromium,webkit} from '@playwright/test';
import fs from 'node:fs';
import axePlaywright from '@axe-core/playwright';
const AxeBuilder=axePlaywright.default ?? axePlaywright;
const dir='/root/projects/CRYSTAL CUBE/output/avatar-task-picker-qa';
(async()=>{
 const observations=[];
 for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
  const browser=await engine.launch();
  for(const viewport of [{width:1440,height:900},{width:390,height:844},{width:320,height:568}]){
   const context=await browser.newContext({viewport,reducedMotion:'reduce'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:3011/');await page.locator('.system-avatar[data-ready="true"]').waitFor();
   await page.locator('.avatar-handle').click();await page.waitForTimeout(500);
   await page.screenshot({path:`${dir}/${name}-${viewport.width}-question.png`});
   const questionA11y=name==='chromium' ? (await new AxeBuilder({page}).include('.avatar-bubble').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()).violations : [];
   await page.getByRole('button',{name:'Автоматизация бизнеса.',exact:true}).click();await page.getByRole('dialog',{name:'Обсудить задачу'}).waitFor();
   await page.screenshot({path:`${dir}/${name}-${viewport.width}-lead.png`});
   const formA11y=name==='chromium' ? (await new AxeBuilder({page}).include('.modal-dialog').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()).violations : [];
   observations.push({engine:name,viewport,task:await page.locator('#lead-task').inputValue(),errors,questionA11y,formA11y});
   await page.keyboard.press('Escape');
   await page.locator('#results').evaluate(e=>window.scrollTo({top:scrollY+e.getBoundingClientRect().top-innerHeight*.2,behavior:'instant'}));
   await page.locator('.avatar-bubble[data-section="results"]').waitFor();await page.waitForTimeout(350);
   await page.screenshot({path:`${dir}/${name}-${viewport.width}-results.png`});
   await context.close();
  }
  await browser.close();
 }
 fs.writeFileSync(`${dir}/observations.json`,JSON.stringify(observations,null,2));
 if(observations.some(o=>o.errors.length||[...o.questionA11y,...o.formA11y].some(v=>['serious','critical'].includes(v.impact))))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
