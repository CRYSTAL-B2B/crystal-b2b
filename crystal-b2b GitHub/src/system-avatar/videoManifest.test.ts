import {expect,it} from 'vitest';
import {parseVideoManifest} from './videoManifest';
const idle={label:'idle',file:'clips/avatar-idle.mp4',poster:'posters/avatar-idle.webp',duration:.666667,quality_score:8.9,mouth_score:9.7,stability_score:9.5,loopable:false};
it('accepts only approved calm local clips and preserves non-loopable decisions',()=>{
 expect(parseVideoManifest({exports:[idle]}).idle?.loopable).toBe(false);
 for(const bad of [{...idle,mouth_score:4},{...idle,label:'scan'},{...idle,file:'https://elsewhere/idle.mp4'},{...idle,file:'../clips/avatar-idle.mp4'},{...idle,quality_score:NaN},null]){
  expect(parseVideoManifest({exports:[bad]})).toEqual({});
 }
 expect(parseVideoManifest(null)).toEqual({});
});

it('accepts the explicit edited idle loop without changing original one-shot approval',()=>{
 const loop={...idle,file:'clips/avatar-idle-loop.mp4',construction:'palindrome-approved-idle',duration:2.5,loopable:true};
 expect(parseVideoManifest({exports:[loop]}).idle?.loopable).toBe(true);
 expect(parseVideoManifest({exports:[{...loop,construction:'unknown'}]})).toEqual({});
});

it('accepts full-master reactions only under the explicit owner-requested policy',()=>{
 const master={label:'idle',file:'clips/avatar-full-loop.mp4',poster:'posters/avatar-idle.webp',duration:8,loopable:true};
 const raw={motion_policy:'full-master-with-reactions-v1',exports:[master,{...master,label:'speak',file:'clips/avatar-speak.mp4',duration:1.25},{...master,label:'glint',file:'clips/avatar-glint.mp4',duration:1}]};
 expect(Object.keys(parseVideoManifest(raw))).toEqual(['idle','glint']);expect(parseVideoManifest(raw).glint?.loopable).toBe(false);
 expect(parseVideoManifest({exports:[master]})).toEqual({});
 expect(parseVideoManifest({...raw,exports:[{...master,file:'https://elsewhere/clip.mp4'}]})).toEqual({});
});


it('calm policy rejects the old full timeline and peak-only flash',()=>{
 const idle={label:'idle',file:'clips/avatar-calm-loop.mp4',poster:'posters/avatar-idle.webp',duration:91/24};
 const glint={...idle,label:'glint',file:'clips/avatar-glint-onset.mp4',duration:42/24};
 const raw={motion_policy:'calm-loop-with-glint-v1',exports:[idle,glint]};
 expect(Object.keys(parseVideoManifest(raw))).toEqual(['idle','glint']);
 expect(parseVideoManifest({...raw,exports:[{...idle,file:'clips/avatar-full-loop.mp4'},{...glint,file:'clips/avatar-glint.mp4'}]})).toEqual({});
});
