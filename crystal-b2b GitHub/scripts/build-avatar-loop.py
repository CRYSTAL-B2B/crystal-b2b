"""Reproducible edited loop from approved idle frames; source clips stay intact."""
from pathlib import Path
import subprocess, json, hashlib
root=Path(__file__).resolve().parents[1]
media=root/'public/system-avatar/motion'
source=media/'clips/avatar-idle.mp4'
output=media/'clips/avatar-idle-loop.mp4'
# 0..15,14..1: no duplicated turn/end frames. Two output frames per source frame.
subprocess.run(['ffmpeg','-y','-v','error','-i',str(source),'-filter_complex',
 '[0:v]split[a][b];[a]trim=start_frame=0:end_frame=16,setpts=PTS-STARTPTS[f];'
 '[b]reverse,trim=start_frame=1:end_frame=15,setpts=PTS-STARTPTS[r];'
 '[f][r]concat=n=2:v=1:a=0,setpts=2*PTS,fps=24,format=yuv420p[v]',
 '-map','[v]','-an','-c:v','libx264','-preset','slow','-crf','20','-movflags','+faststart',str(output)],check=True)
m=json.loads((media/'avatar-motion-manifest.json').read_text())
m['runtime_variant']='living-widget-v2'
m['analysis_source']='avatar-motion-manifest.json'
idle=next(e for e in m['exports'] if e['label']=='idle')
idle.update(file='clips/avatar-idle-loop.mp4',duration=2.5,loopable=True,
 construction='palindrome-approved-idle',source_clip='clips/avatar-idle.mp4',
 frame_count=60,notes='Edited forward/reverse loop using approved closed-mouth idle frames only. Two output frames per source frame; no generated face frames. Not a natural source loop.',
 recommended_usage='Muted continuous resting motion; occasional original cooldown blink; reactions return to this loop.',
 bytes=output.stat().st_size,sha256=hashlib.sha256(output.read_bytes()).hexdigest())
(media/'avatar-widget-manifest.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
print(output,output.stat().st_size)
