"""Full source timeline and click-triggered eye glint requested by the owner."""
from pathlib import Path
import subprocess,json,hashlib
root=Path(__file__).resolve().parents[1]
source=root.parent/'b2b-system-cinematic-avatar-spec-v2/system-avatar/Generated Video September 20, 2026 - 4_23PM.mp4'
media=root/'public/system-avatar/motion'
exports=[]
for label,name,start,end,loop in [('idle','avatar-full-loop',0,192,True),('glint','avatar-glint',84,108,False)]:
 output=media/'clips'/f'{name}.mp4'
 subprocess.run(['ffmpeg','-y','-v','error','-i',str(source),'-vf',f'trim=start_frame={start}:end_frame={end},setpts=PTS-STARTPTS,crop=1080:1080:0:420,scale=720:720:flags=lanczos,setsar=1,format=yuv420p','-an','-c:v','libx264','-preset','slow','-crf','21','-movflags','+faststart',str(output)],check=True)
 exports.append(dict(label=label,file=f'clips/{name}.mp4',poster='posters/avatar-idle.webp',start=start/24,end=end/24,duration=(end-start)/24,frame_count=end-start,loopable=loop,sha256=hashlib.sha256(output.read_bytes()).hexdigest(),bytes=output.stat().st_size))
manifest=dict(source=source.name,motion_policy='full-master-with-reactions-v1',approval='User requested all 192 source frames as a continuous loop and a click-triggered eye glint. Heading bubbles must not trigger separate mouth animation.',crop=dict(x=0,y=420,width=1080,height=1080),exports=exports)
(media/'avatar-full-motion-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(exports,indent=2))
