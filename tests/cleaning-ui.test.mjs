import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {Coverage,strokePoints,advanceRound} from '../companion/core.mjs';
function mount(){
 const elements=new Map(),timers=[];
 const context2d={globalCompositeOperation:'source-over',clearRect(){},setTransform(){},drawImage(){},putImageData(){},fillRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},createRadialGradient(){return{addColorStop(){}};},createImageData(w,h){return{data:new Uint8ClampedArray(w*h*4)};}};
 function element(id){if(elements.has(id))return elements.get(id);const events={};const e={id,events,hidden:false,textContent:'',style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(k,fn){events[k]=fn;},focus(){},getContext(){return context2d;},getBoundingClientRect(){return{width:1000,height:562.5,left:0,top:0};},setPointerCapture(){},append(){}};elements.set(id,e);return e;}
 const document={hidden:false,body:{replaceChildren(){}},getElementById:element,createElement:element,addEventListener(k,fn){this[k]=fn;}};
 let closed=false;
 const sandbox={Coverage,strokePoints,advanceRound,document,window:{close(){closed=true;}},devicePixelRatio:1,performance:{now:()=>100},requestAnimationFrame:()=>1,cancelAnimationFrame(){},ResizeObserver:class{observe(){}},setTimeout(fn){timers.push(fn);return timers.length;},clearTimeout(){},location:{reload(){}},Uint8ClampedArray,Uint8Array,Math};
 vm.createContext(sandbox);vm.runInContext(fs.readFileSync(new URL('../companion/app.mjs',import.meta.url),'utf8').replace(/^import .*;\n/,''),sandbox);
 return{elements,document,sandbox,timers,get closed(){return closed;},click(id){elements.get(id).events.click();},event(id,type,value){elements.get(id).events[type](value);},flush(){while(timers.length)timers.shift()();}};
}
test('round can start, clear via real pointer handlers, show ending, and replay',()=>{
 const app=mount();app.click('begin');assert.equal(app.elements.get('intro').hidden,true);
 const down={clientX:0,clientY:0,isPrimary:true,button:0,pointerId:1,preventDefault(){}};
 app.event('dust','pointerdown',down);
 for(let y=0;y<=562.5;y+=55){const reverse=Math.round(y/55)%2;for(let i=0;i<=20;i++)app.event('dust','pointermove',{...down,clientX:reverse?1000-i*50:i*50,clientY:y});}
 app.flush();assert.equal(app.elements.get('end-title').textContent,'They can see again.');assert.equal(app.elements.get('ending').hidden,false);
 app.click('again');assert.equal(app.elements.get('ending').hidden,true);assert.equal(app.elements.get('seconds').textContent,'30s');
});
test('switching away pauses, resume restores ready round, exit stops game',async()=>{
 const app=mount();app.click('begin');app.document.hidden=true;app.document.visibilitychange();assert.equal(app.elements.get('paused').hidden,false);
 app.click('resume');assert.equal(app.elements.get('paused').hidden,true);
 await app.elements.get('exit').events.click();assert.ok(app.closed);app.flush();
 vm.runInContext('resize()',app.sandbox); // A detached ResizeObserver must not restart the game.
});
