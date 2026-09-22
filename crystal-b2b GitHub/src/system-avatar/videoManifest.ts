import { AVATAR_CONFIG as config } from './config';
export type VideoState = 'idle' | 'track-right' | 'alert' | 'cooldown' | 'glint';
export type VideoClip = {label:VideoState;file:string;poster:string;loopable:boolean;duration:number};
const allowed:VideoState[]=['idle','track-right','alert','cooldown'];
export function parseVideoManifest(raw:unknown):Partial<Record<VideoState,VideoClip>> {
  if(!raw||typeof raw!=='object'||!('exports' in raw)||!Array.isArray(raw.exports))return {};
  const full='motion_policy' in raw && raw.motion_policy==='full-master-with-reactions-v1';
  const calm='motion_policy' in raw && raw.motion_policy==='calm-loop-with-glint-v1';
  const fullFiles:Partial<Record<VideoState,string>>=calm
    ?{idle:'clips/avatar-calm-loop.mp4',glint:'clips/avatar-glint-onset.mp4'}
    :{idle:'clips/avatar-full-loop.mp4',glint:'clips/avatar-glint.mp4'};
  const clips:Partial<Record<VideoState,VideoClip>>={};
  for(const item of raw.exports){
    if(full||calm){
      if(!item||typeof item.label!=='string'||!Object.hasOwn(fullFiles,item.label)||item.file!==fullFiles[item.label as VideoState]||item.poster!=='posters/avatar-idle.webp'||!Number.isFinite(item.duration)||item.duration<=0||item.duration>8)continue;
      clips[item.label as VideoState]={label:item.label,file:item.file,poster:item.poster,duration:item.duration,loopable:item.label!=='glint'};
      continue;
    }
    if(!item||!allowed.includes(item.label)||!Number.isFinite(item.quality_score)||item.quality_score<config.video.minQuality||!Number.isFinite(item.mouth_score)||item.mouth_score<config.video.minMouth||!Number.isFinite(item.stability_score)||item.stability_score<config.video.minStability)continue;
    const editedIdle=item.label==='idle'&&item.file==='clips/avatar-idle-loop.mp4'&&item.construction==='palindrome-approved-idle'&&item.loopable===true;
    if((!editedIdle&&item.file!==`clips/avatar-${item.label}.mp4`)||item.poster!==`posters/avatar-${item.label}.webp`||!Number.isFinite(item.duration)||item.duration<=0||item.duration>3)continue;
    clips[item.label as VideoState]={label:item.label,file:item.file,poster:item.poster,loopable:item.loopable===true,duration:item.duration};
  }
  return clips;
}
