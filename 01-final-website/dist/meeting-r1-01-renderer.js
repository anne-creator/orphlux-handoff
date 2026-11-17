// Original sharp artwork with fixed geometry. Only smooth illumination changes over time.
export class SilverFlow {
  constructor(canvas, {base='/P-material.webp', controls='/lighting-only.png', period=6}={}) {
    this.canvas=canvas; this.base=base; this.controls=controls; this.period=period;
    this.time=0; this.playing=false; this.destroyed=false; this.amplitude=1;
    this.frameTimes=[]; this.last=0; this.ready=this.init();
  }
  async init() {
    const gl=this.canvas.getContext('webgl2',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power',preserveDrawingBuffer:false});
    if(!gl) throw new Error('WebGL unavailable'); this.gl=gl;
    const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;};
    const vs=compile(gl.VERTEX_SHADER,`#version 300 es
      in vec2 p;out vec2 uv;void main(){uv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}`);
    const fs=compile(gl.FRAGMENT_SHADER,`#version 300 es
      precision highp float;
      in vec2 uv;out vec4 fragColor;
      uniform sampler2D image;uniform sampler2D field;
      uniform float clock;uniform float amount;
      float light(float frame,vec2 p){
        vec2 local=clamp(p,vec2(.5/192.,.5/82.),vec2(1.-.5/192.,1.-.5/82.));
        vec2 q=vec2(local.x,(mod(frame+24.,24.)+local.y)/24.);
        vec2 v=texture(field,q).rg;
        return dot(v,vec2(65280.,255.))/65535.+.5;
      }
      float cubic(float a,float b,float c,float d,float t){return b+.5*t*(c-a+t*(2.*a-5.*b+4.*c-d+t*(3.*(b-c)+d-a)));}
      void main(){
        float phase=mod(clock,6.)*4.;float a=floor(phase);float f=fract(phase);
        float gain=cubic(light(a-1.,uv),light(a,uv),light(a+1.,uv),light(a+2.,uv),f);
        // Sampling coordinates never depend on time. The convergence cannot wobble.
        vec3 color=texture(image,uv).rgb;
        fragColor=vec4(clamp(color*mix(1.,gain,amount),0.,1.),1.);
      }`);
    const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);this.program=program;
    const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const at=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(at);gl.vertexAttribPointer(at,2,gl.FLOAT,false,0,0);
    this.clock=gl.getUniformLocation(program,'clock');this.amount=gl.getUniformLocation(program,'amount');
    const upload=async(url,unit,name)=>{
      const response=await fetch(url);if(!response.ok)throw new Error(url+' '+response.status);
      const blob=await response.blob();
      // Chrome does not decode SVG blobs through createImageBitmap. Image preserves vector resolution.
      const bitmap=blob.type.includes('svg') ? await new Promise((resolve,reject)=>{
        const image=new Image(),url=URL.createObjectURL(blob);
        image.onload=()=>{URL.revokeObjectURL(url);resolve(image);};
        image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('SVG material decode failed'));};image.src=url;
      }) : await createImageBitmap(blob,{premultiplyAlpha:'none',colorSpaceConversion:'none'});
      const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,gl.NONE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,bitmap);
      if(unit===0){gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);}
      gl.uniform1i(gl.getUniformLocation(program,name),unit);bitmap.close?.();
    };
    await Promise.all([upload(this.base,0,'image'),upload(this.controls,1,'field')]);
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(this.canvas);
    this.resize();this.draw();this.canvas.dataset.ready='true';
  }
  resize(){const r=this.canvas.getBoundingClientRect();const dpr=Math.min(devicePixelRatio,2,4096/Math.max(1,r.width));const w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);if(w&&h&&(this.canvas.width!==w||this.canvas.height!==h)){this.canvas.width=w;this.canvas.height=h;this.gl.viewport(0,0,w,h);}this.draw();}
  draw(){if(!this.gl||!this.program)return;this.gl.uniform1f(this.clock,this.time);this.gl.uniform1f(this.amount,this.amplitude);this.gl.drawArrays(this.gl.TRIANGLES,0,6);this.canvas.dataset.time=this.time.toFixed(3);this.onframe?.(this.time);}
  seek(t){this.time=t;this.draw();}
  play(){if(this.playing||this.destroyed)return;this.playing=true;this.last=0;const tick=now=>{if(!this.playing)return;if(this.last){const dt=Math.min((now-this.last)/1000,.1);this.time=(this.time+dt)%this.period;this.frameTimes.push(dt*1000);if(this.frameTimes.length>120)this.frameTimes.shift();if(this.frameTimes.length===120)this.canvas.dataset.fps=(120000/this.frameTimes.reduce((a,b)=>a+b,0)).toFixed(1);}this.last=now;this.draw();this.raf=requestAnimationFrame(tick);};this.raf=requestAnimationFrame(tick);}
  pause(){this.playing=false;cancelAnimationFrame(this.raf);this.last=0;}
  destroy(){this.pause();this.destroyed=true;this.resizeObserver?.disconnect();this.gl?.getExtension('WEBGL_lose_context')?.loseContext();}
}
