import {strokePoints, Coverage, advanceRound} from './core.mjs';
const $ = id => document.getElementById(id);
const canvas=$('dust'), ctx=canvas.getContext('2d');
let width=0,height=0,ratio=1,coverage,strokes=[],state={phase:'intro',remaining:30},priorPhase='ready';
let holding=false,last=null,pointerId=null,keyboard={x:.5,y:.5},lastFrame=performance.now(),audio=null,animation=0,revealTimeout=0;
const radius=()=>Math.min(width,height)*.14;
function random(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
function paintDust(){
  ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,width,height);
  const rng=random(18144),texture=document.createElement('canvas');texture.width=512;texture.height=320;
  const tx=texture.getContext('2d'),pixels=tx.createImageData(512,320);
  for(let i=0;i<pixels.data.length;i+=4){const v=70+rng()*36;pixels.data[i]=v+9;pixels.data[i+1]=v+7;pixels.data[i+2]=v-8;pixels.data[i+3]=248;}
  tx.putImageData(pixels,0,0);ctx.drawImage(texture,0,0,width,height);
  for(let i=0;i<85;i++){
    const x=rng()*width,y=rng()*height,r=(.035+rng()*.18)*Math.min(width,height),g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,`rgba(31,35,23,${.05+rng()*.18})`);g.addColorStop(1,'rgba(31,35,23,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
  }
  ctx.strokeStyle='#c6b99720';ctx.lineWidth=.6;
  for(let i=0;i<75;i++){const x=rng()*width,y=rng()*height;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(rng()-.5)*80,y+15+rng()*90);ctx.stroke();}
}
function erase(point, record=true){
  const r=radius(),x=point.x,y=point.y,g=ctx.createRadialGradient(x,y,r*.68,x,y,r);
  g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.globalCompositeOperation='destination-out';ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r);
  if(record){strokes.push({x:x/width,y:y/height});coverage.wipe(x/width*coverage.width,y/width*coverage.width,r*.79/width*coverage.width);}
}
function resize(){
  if(state.phase==='exited')return;
  const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;ratio=Math.min(devicePixelRatio||1,1.5);
  canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
  coverage=new Coverage(144,Math.max(1,Math.round(144*height/width)));paintDust();
  for(const point of strokes){erase({x:point.x*width,y:point.y*height},false);coverage.wipe(point.x*144,point.y*height/width*144,radius()*.79/width*144);}
  last=null;release();render();
}
function announce(text){$('announcement').textContent=text;}
function release(){holding=false;last=null;$('cloth').classList.remove('wiping');if(audio)audio.rub.gain.setTargetAtTime(0,audio.context.currentTime,.05);}
function locate(x,y){$('cloth').style.left=x+'px';$('cloth').style.top=y+'px';$('cloth').style.display='block';keyboard={x:x/width,y:y/height};}
function wipe(to){
  if(!['ready','playing'].includes(state.phase))return;
  if(state.phase==='ready'){state.phase='playing';lastFrame=performance.now();announce('Cleaning started. Thirty seconds of air.');}
  for(const point of strokePoints(last||to,to,radius()*.3))erase(point);
  last=to;locate(to.x,to.y);$('cloth').classList.add('wiping');
  if(audio)audio.rub.gain.setTargetAtTime(.065,audio.context.currentTime,.03);
  state=advanceRound(state,0,coverage.fraction);if(state.phase==='won')finish();render();
}
function position(event){const rect=canvas.getBoundingClientRect();return{x:Math.max(0,Math.min(width,event.clientX-rect.left)),y:Math.max(0,Math.min(height,event.clientY-rect.top))};}
canvas.addEventListener('pointerdown',event=>{
  if(!['ready','playing'].includes(state.phase)||!event.isPrimary||event.button!==0)return;
  event.preventDefault();canvas.focus({preventScroll:true});canvas.setPointerCapture(event.pointerId);pointerId=event.pointerId;holding=true;wipe(position(event));
});
canvas.addEventListener('pointermove',event=>{if(!['ready','playing'].includes(state.phase))return;const point=position(event);locate(point.x,point.y);if(holding&&pointerId===event.pointerId)wipe(point);});
for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,()=>{release();pointerId=null;});
canvas.addEventListener('pointerleave',()=>{if(!holding)$('cloth').style.display='none';});
canvas.addEventListener('keydown',event=>{
  const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
  if(directions[event.key]&&['ready','playing'].includes(state.phase)){
    event.preventDefault();const [dx,dy]=directions[event.key];const step=radius()*.5;
    const point={x:Math.max(0,Math.min(width,keyboard.x*width+dx*step)),y:Math.max(0,Math.min(height,keyboard.y*height+dy*step))};locate(point.x,point.y);if(holding)wipe(point);
  }else if(event.code==='Space'&&['ready','playing'].includes(state.phase)){event.preventDefault();holding=true;wipe({x:keyboard.x*width,y:keyboard.y*height});}
});
canvas.addEventListener('keyup',event=>{if(event.code==='Space'){event.preventDefault();release();}});
canvas.addEventListener('blur',release);
function render(){
  const active=['ready','playing','paused'].includes(state.phase);$('air').hidden=!active;$('pause').hidden=!['ready','playing'].includes(state.phase);
  $('seconds').textContent=Math.ceil(state.remaining)+'s';$('air-fill').style.width=state.remaining/30*100+'%';$('air').classList.toggle('low',state.remaining<=8);
  $('coverage').textContent=active?`${Math.min(100,Math.floor(coverage.fraction/.85*100))}% CLEAR`:'';
  $('camera-status').textContent=state.phase==='won'?'TRANSMISSION RESTORED':state.phase==='lost'?'AIR DEPLETED':state.phase==='playing'?'CLEANING IN PROGRESS':'SIGNAL OBSCURED';
}
function begin(){
  clearTimeout(revealTimeout);release();strokes=[];state={phase:'ready',remaining:30};$('camera').classList.remove('won');$('intro').hidden=true;$('ending').hidden=true;$('paused').hidden=true;
  $('hint').textContent='Hold and drag to wipe. Keyboard: arrows + Space. P to pause.';resize();canvas.focus({preventScroll:true});announce('Hold and drag to clean. Your air starts with the first wipe.');
}
function finish(){
  release();$('cloth').style.display='none';$('paused').hidden=true;
  const won=state.phase==='won';$('camera').classList.toggle('won',won);
  $('end-eyebrow').textContent=won?'TRANSMISSION RESTORED':'THE AIR IS GONE';$('end-title').textContent=won?'They can see again.':'Just a little more.';
  $('end-message').textContent=won?'For a moment, the world is clear.':'The dust remains. Take a breath and try again.';$('hint').textContent=won?'A clear view. A quiet moment.':'Every wipe brings the outside closer.';
  announce(won?'Lens clear. They can see again.':'Air depleted. Try cleaning again.');
  revealTimeout=setTimeout(()=>{$('ending').hidden=false;$('again').focus({preventScroll:true});},won?1800:250);
}
function pause(){if(!['ready','playing'].includes(state.phase))return;priorPhase=state.phase;state.phase='paused';release();$('cloth').style.display='none';$('paused').hidden=false;$('resume').focus({preventScroll:true});if(audio)audio.context.suspend();render();}
function resume(){state.phase=priorPhase;lastFrame=performance.now();$('paused').hidden=true;if(audio)audio.context.resume();canvas.focus({preventScroll:true});render();}
$('begin').addEventListener('click',begin);$('again').addEventListener('click',begin);$('pause').addEventListener('click',pause);$('resume').addEventListener('click',resume);
document.addEventListener('keydown',event=>{if(event.key.toLowerCase()==='p'||event.key==='Escape'){if(state.phase==='paused')resume();else pause();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
async function toggleSound(){
  if(audio){await audio.context.close();audio=null;$('sound').textContent='Sound off';$('sound').setAttribute('aria-pressed','false');return;}
  try{
    const context=new AudioContext(),buffer=context.createBuffer(1,context.sampleRate*3,context.sampleRate),channel=buffer.getChannelData(0);for(let i=0;i<channel.length;i++)channel[i]=Math.random()*2-1;
    const source=context.createBufferSource();source.buffer=buffer;source.loop=true;
    const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=380;const wind=context.createGain();wind.gain.value=.035;source.connect(filter);filter.connect(wind);wind.connect(context.destination);
    const rubFilter=context.createBiquadFilter();rubFilter.type='bandpass';rubFilter.frequency.value=1200;const rub=context.createGain();rub.gain.value=0;source.connect(rubFilter);rubFilter.connect(rub);rub.connect(context.destination);source.start();
    audio={context,rub};await context.resume();$('sound').textContent='Sound on';$('sound').setAttribute('aria-pressed','true');
  }catch{announce('Sound is unavailable in this browser.');}
}
$('sound').addEventListener('click',toggleSound);
async function exit(){
  state.phase='exited';clearTimeout(revealTimeout);cancelAnimationFrame(animation);release();if(audio){await audio.context.close();audio=null;}
  window.close();
  setTimeout(()=>{const main=document.createElement('main');main.className='signed-off';const box=document.createElement('div'),title=document.createElement('h1'),message=document.createElement('p'),button=document.createElement('button');title.textContent='The feed has ended.';message.textContent='You can close this tab. Nothing is running in the background.';button.textContent='Play again';button.addEventListener('click',()=>location.reload());box.append(title,message,button);main.append(box);document.body.replaceChildren(main);},100);
}
$('exit').addEventListener('click',exit);$('end-exit').addEventListener('click',exit);
function frame(now){
  if(state.phase==='exited')return;
  const elapsed=(now-lastFrame)/1000;lastFrame=now;
  const before=state.phase;state=advanceRound(state,elapsed,coverage.fraction);
  if(before==='playing'&&state.phase==='lost')finish();render();animation=requestAnimationFrame(frame);
}
new ResizeObserver(resize).observe($('camera'));resize();animation=requestAnimationFrame(frame);
