export const vertexShader = `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
export const fragmentShader = `
precision highp float;
varying vec2 vUv;
uniform vec2 uResolution, uOrigin, uTarget;
uniform float uTime, uIntensity, uProgress, uWidth, uNoiseScale, uNoiseSpeed;
uniform float uFlicker, uOpacity, uContactIntensity, uChromaticShift, uAfterglow, uLite;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float gaussian(float d, float width) { return exp(-d*d/max(width*width, .01)); }
void main() {
  vec2 p=vec2(vUv.x,1.0-vUv.y)*uResolution;
  vec2 delta=uTarget-uOrigin;
  float len=max(length(delta),1.0);
  vec2 dir=delta/len;
  vec2 q=p-uOrigin;
  float along=dot(q,dir);
  float side=dot(q,vec2(-dir.y,dir.x));
  float travel=len*uProgress;
  // Reject empty pixels before procedural density and optical kernels.
  float maxSpread=6.0+max(along,0.0)*.055;
  if ((along < -3.0 || along > travel+4.0 || abs(side)>maxSpread) && distance(p,uTarget)>90.0) discard;
  float gate=smoothstep(-1.0,2.0,along)*(1.0-smoothstep(travel-4.0,travel+2.0,along));
  float spread=uWidth*(.65+clamp(along/len,0.0,1.0)*.65);
  float core=gaussian(side,spread*.5)*gate;
  float soft=gaussian(side,spread*2.1)*gate;
  float density=uLite>.5 ? 1.0 : .66+.34*noise(vec2(along*uNoiseScale-uTime*uNoiseSpeed,side*.18));
  float wedge=gaussian(side,2.0+max(along,0.0)*.022)*gate*density*.08*(1.0-uLite);
  // Analytical selective bloom: convolution profiles of the emissive core only.
  // No DOM capture, scene-wide blur or additional full-resolution framebuffer.
  float bloom=(gaussian(side,spread*5.0)*.12+gaussian(side,spread*12.0)*.025)*gate*(1.0-uLite*.7);
  vec2 hit=p-uTarget;
  float contact=uContactIntensity*smoothstep(.97,1.0,uProgress);
  float spot=exp(-dot(hit,hit)/95.0)*contact;
  float halo=exp(-dot(hit,hit)/760.0)*contact*.16;
  float streak=gaussian(hit.x,42.0)*gaussian(hit.y,1.2)*contact*.38;
  float fringe=gaussian(side-uChromaticShift,spread*1.7)*gate*.04*(1.0-uLite);
  float flicker=1.0-uFlicker*.5+sin(uTime*43.0)*uFlicker*.5;
  float trail=gaussian(side,spread*4.0)*gate*uAfterglow*.12;
  vec3 light=vec3(.89,.97,1.0)*(core+spot+streak)
    +vec3(.32,.64,.94)*(soft*.3+wedge+bloom+halo+trail)
    +vec3(.43,.36,.68)*fringe;
  light*=uIntensity*flicker;
  float alpha=clamp(max(max(light.r,light.g),light.b)*uOpacity,0.0,.88);
  if(alpha<.001) discard;
  gl_FragColor=vec4(light/max(max(light.r,light.g),max(light.b,.001)),alpha);
}
`;
