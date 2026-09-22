"""Closed-mouth idle edit plus the eye flash from its actual onset; no generated frames."""
from pathlib import Path
import hashlib
import json
import subprocess
import cv2

root = Path(__file__).resolve().parents[1]
source = root.parent / 'b2b-system-cinematic-avatar-spec-v2/system-avatar/Generated Video September 20, 2026 - 4_23PM.mp4'
media = root / 'public/system-avatar/motion'
capture = cv2.VideoCapture(str(source))
frames = []
while True:
    ok, frame = capture.read()
    if not ok:
        break
    frames.append(cv2.resize(frame[420:1500, 0:1080], (720, 720), interpolation=cv2.INTER_LANCZOS4))
capture.release()
assert len(frames) == 192

def dissolve(a, b):
    return [cv2.addWeighted(x, 1 - (i + 1) / (len(a) + 1), y, (i + 1) / (len(a) + 1), 0)
            for i, (x, y) in enumerate(zip(a, b))]

# Remove the complete flare and mouth-opening interval [63,152).
# Blend six calm frames at each join; both sides have a closed mouth.
joined = frames[:57] + dissolve(frames[57:63], frames[152:158]) + frames[158:192]
idle = joined[6:-6] + dissolve(joined[-6:], joined[:6])
# Begin on the neutral forward gaze (source frame 44), not on a blink.
idle = idle[38:] + idle[:38]
assert len(idle) == 91

def encode(label, name, sequence, **metadata):
    target = media / 'clips' / name
    process = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pixel_format', 'bgr24',
        '-video_size', '720x720', '-framerate', '24', '-i', '-', '-an', '-c:v', 'libx264',
        '-preset', 'slow', '-crf', '21', '-pix_fmt', 'yuv420p', '-g', '24',
        '-movflags', '+faststart', str(target)], stdin=subprocess.PIPE)
    for frame in sequence:
        process.stdin.write(frame.tobytes())
    process.stdin.close()
    assert process.wait() == 0
    return dict(label=label, file=f'clips/{name}', poster='posters/avatar-idle.webp',
        duration=len(sequence)/24, frame_count=len(sequence), loopable=label=='idle',
        sha256=hashlib.sha256(target.read_bytes()).hexdigest(), bytes=target.stat().st_size, **metadata)

exports = [
    encode('idle', 'avatar-calm-loop.mp4', idle, source_spans=[[0,63],[152,192]],
        construction='calm-spans-with-six-frame-dissolves', crossfade_frames=6,
        notes='Closed mouth; no eye flare. All selected source frames play forward; two 250 ms dissolves.'),
    encode('glint', 'avatar-glint-onset.mp4', frames[62:104], start=62/24, end=104/24,
        source_spans=[[62,104]], notes='One neutral frame before the first HUD ignition; full rise to the eye flare, cut before mouth opening.'),
]
manifest = dict(source=source.name, motion_policy='calm-loop-with-glint-v1',
    approval='Idle excludes the eye flare and open mouth. Click plays the flash from its beginning, then returns to the complete calm loop.',
    crop=dict(x=0,y=420,width=1080,height=1080), exports=exports)
(media / 'avatar-calm-motion-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n')
print(json.dumps(exports, indent=2))
