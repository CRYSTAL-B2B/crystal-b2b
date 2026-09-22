import { AVATAR_CONFIG as config } from './config';
import { parseVideoManifest, type VideoClip, type VideoState } from './videoManifest';
import { trackEvent } from '@/lib/analytics';
export function createVideoController(root:HTMLElement,signal:AbortSignal){
  const videos=Array.from(root.querySelectorAll<HTMLVideoElement>('.avatar-video'));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const cache=new Map<string,Promise<string|null>>();
  // A stale decode must never pause a player already reused by a newer request.
  const owners=[0,0];
  let clips:Partial<Record<VideoState,VideoClip>>={},active=-1,epoch=0,lastChange=-Infinity,blocked=false,destroyed=false,poor=false,ready=false,suspended=false,glinting=false,lastGlint=-Infinity;
  const timers=new Set<ReturnType<typeof setTimeout>>();
  const later=(fn:()=>void,ms:number)=>{const id=setTimeout(()=>{timers.delete(id);fn();},ms);timers.add(id);return id;};
  function staticMode(){glinting=false;epoch++;for(const v of videos){v.pause();v.style.opacity='0';}root.dataset.state='idle';root.dataset.media='static';active=-1;}
  async function asset(clip:VideoClip){
    if(!cache.has(clip.file))cache.set(clip.file,fetch(config.video.base+clip.file,{signal:AbortSignal.any([signal,AbortSignal.timeout(config.video.loadTimeoutMs)])}).then(async response=>{
      if(!response.ok) return null;
      await response.arrayBuffer();if(destroyed||signal.aborted)return null;
      // Native URLs preserve HTTP range seeking and reliable EOS in WebKit.
      // Fetch warms the browser cache; both permanent players share this URL.
      return config.video.base+clip.file;
    }).catch(()=>null));
    return cache.get(clip.file)!;
  }
  async function load(video:HTMLVideoElement,url:string,loop:boolean){
    // Once this clip is requested, Safari must be allowed to decode before play().
    // The idle DOM uses preload=none to avoid any video work in reduced-motion mode.
    video.pause();video.preload='auto';video.src=url;video.muted=true;video.loop=loop;
    await new Promise<void>((resolve,reject)=>{
      const cleanup=()=>{video.removeEventListener('loadeddata',ok);video.removeEventListener('error',fail);clearTimeout(timer);timers.delete(timer);};
      const ok=()=>{cleanup();resolve();},fail=()=>{cleanup();reject(Error('video unavailable'));};
      const timer=later(fail,config.video.loadTimeoutMs);
      video.addEventListener('loadeddata',ok,{once:true});video.addEventListener('error',fail,{once:true});video.load();
      if(video.readyState>=2)ok();
    });
    // Keep one-shots on frame zero until their surface is visible: do not hide the onset.
    if(!loop)return;
    await video.play();
    // Keep the previous surface until the first decoded frame can be presented.
    await new Promise<void>(resolve=>{if(video.requestVideoFrameCallback){video.requestVideoFrameCallback(()=>resolve());later(resolve,180);}else requestAnimationFrame(()=>resolve());});
  }
  async function play(requested:VideoState,force=false){
    if(destroyed||signal.aborted||blocked||suspended||!ready||reduced.matches||poor)return;
    if(!force&&performance.now()-lastChange<config.avatar.minStateDuration)return;
    lastChange=performance.now();const request=++epoch;
    for(const label of [...new Set<VideoState>([requested,'idle'])]){
      const clip=clips[label];if(!clip)continue;
      const url=await asset(clip);if(request!==epoch||destroyed)return;if(!url)continue;
      const slot=active===0?1:0,next=videos[slot],old=active>=0?videos[active]:null;
      owners[slot]=request;next.style.opacity='0';
      try{await load(next,url,clip.loopable);}catch{if(owners[slot]===request)next.pause();if(request!==epoch||destroyed)return;continue;}
      if(request!==epoch||destroyed||blocked||reduced.matches){if(owners[slot]===request)next.pause();return;}
      if(label!=='glint')glinting=false;
      active=slot;next.dataset.source=clip.file;next.style.opacity='1';if(old)old.style.opacity='0';
      root.dataset.state=label;root.dataset.media='video';trackEvent('avatar_state_change',{state:label});
      if(old){
        const oldSlot=videos.indexOf(old),oldOwner=owners[oldSlot];
        later(()=>{if(owners[oldSlot]===oldOwner&&videos[active]!==old)old.pause();},config.video.crossfadeMs);
      }
      let total=0,dropped=0,badSamples=0;
      next.ontimeupdate=()=>{
        if(request!==epoch||destroyed||active!==slot)return;
        const q=next.getVideoPlaybackQuality?.();
        if(!q||q.totalVideoFrames-total<config.video.qualitySampleFrames)return;
        const ratio=(q.droppedVideoFrames-dropped)/(q.totalVideoFrames-total);
        total=q.totalVideoFrames;dropped=q.droppedVideoFrames;
        badSamples=ratio>config.video.droppedFrameLimit?badSamples+1:0;
        if(badSamples>=config.video.qualityBadSamples){poor=true;root.dataset.videoFallback='performance';staticMode();}
      };
      const finish=()=>{
        if(request!==epoch||destroyed||active!==slot)return;
        if(label==='glint')glinting=false;
        if(!clip.loopable)void play('idle',true);
      };
      next.onended=finish;
      // A missed media EOS event must not leave a short click reaction stuck.
      if(!clip.loopable)later(finish,clip.duration*1000+config.video.crossfadeMs);
      next.onerror=()=>{if(request===epoch){cache.delete(clip.file);if(label==='idle')staticMode();else {glinting=false;void play('idle',true);}}};
      if(!clip.loopable)void next.play().catch(()=>{if(request===epoch)void play('idle',true);});
      return;
    }
    if(request===epoch)staticMode();
  }
  function resume(){
    suspended=false;
    const preferred=glinting?'glint':'idle';
    if(active>=0&&root.dataset.state===preferred&&!videos[active].paused)return;
    void play(preferred,true);
  }
  function preference(){if(reduced.matches)staticMode();else resume();}
  reduced.addEventListener('change',preference);
  void fetch(config.video.base+config.video.manifest,{signal:AbortSignal.any([signal,AbortSignal.timeout(config.video.loadTimeoutMs)])}).then(async response=>{
    if(!response.ok)throw Error('manifest unavailable');clips=parseVideoManifest(await response.json());
  }).catch(()=>{}).finally(()=>{
    if(destroyed||signal.aborted)return;ready=true;root.dataset.assets='ready';resume();
    later(()=>{if(blocked||reduced.matches||destroyed)return;
      // Warm the HTTP cache for reactions; idle is already playing.
      for(const state of ['idle','glint'] as VideoState[])if(clips[state])void asset(clips[state]!);
    },config.video.preloadDelayMs);
  });
  return {
    glint(){
      if(blocked||suspended||reduced.matches||poor||performance.now()-lastGlint<config.avatar.minStateDuration)return;
      lastGlint=performance.now();glinting=true;void play('glint',true);
    },
    block(value:boolean){blocked=value;if(value)staticMode();else resume();},
    rest(){suspended=true;staticMode();},resume,
    destroy(){destroyed=true;staticMode();for(const timer of timers)clearTimeout(timer);timers.clear();reduced.removeEventListener('change',preference);for(const v of videos){v.onended=null;v.onerror=null;v.ontimeupdate=null;v.removeAttribute('src');v.load();}},
  };
}
