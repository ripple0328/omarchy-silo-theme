import {clamp, plant, stable, newShift, tick, start, pause, restoreShift} from './core.mjs';
const $ = id => document.getElementById(id);
const SHIFT = 'silo.shift.v1', NOTES = 'silo.notes.v1', DRAFT = 'silo.draft.v1';
function storageError() { $('storage-warning').hidden = false; $('storage-warning').textContent = 'Browser storage is unavailable or full. This session still works, but new changes may not survive closing it. Export your notes before leaving.'; }
function read(key, fallback) {try {return JSON.parse(localStorage.getItem(key)) ?? fallback;} catch {storageError(); return fallback;}}
function write(key, value) {try {localStorage.setItem(key, JSON.stringify(value)); return true;} catch {storageError(); return false;}}
let shift = restoreShift(read(SHIFT, null), Date.now());
const restored = shift.phase;
let notes = read(NOTES, []);
function cleanNotes(value) {return Array.isArray(value) ? value.filter(n => n && typeof n.id === 'string' && typeof n.text === 'string' && Number.isFinite(n.at) && Number.isFinite(new Date(n.at).getTime())) : [];}
notes = cleanNotes(notes);
const draft = read(DRAFT, ''); $('note').value = typeof draft === 'string' ? draft : '';
$('note').addEventListener('input', () => write(DRAFT, $('note').value));
function saveShift(){write(SHIFT, shift);}
function renderShift(){
  const previous = shift.phase; shift = tick(shift, Date.now());
  if (previous !== shift.phase) {saveShift(); $('shift-announcement').textContent = 'Shift complete. Record your handover when you are ready.';}
  const sec = Math.ceil(shift.remaining / 1000);
  $('timer').textContent = `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
  $('shift-progress').style.width = `${100 * (1 - shift.remaining / shift.duration)}%`;
  const labels = {idle:['AWAITING OPERATOR','Take your station. Work at your own pace.','Begin shift'],running:['SHIFT IN PROGRESS','Steady work keeps the Silo running.','Pause shift'],paused:['SHIFT PAUSED','Your station will be here when you return.','Resume shift'],complete:['SHIFT COMPLETE','Good work. Leave a handover for what comes next.','Begin another shift']};
  const [state, caption, button] = labels[shift.phase];
  $('shift-state').textContent = state; $('shift-caption').textContent = caption; $('start-shift').textContent = button;
  $('duration').disabled = ['running','paused'].includes(shift.phase);
  $('duration').value = String(shift.duration / 60000);
}
$('start-shift').addEventListener('click', () => {
  if (shift.phase === 'running') shift = pause(shift, Date.now());
  else {if (shift.phase === 'complete') shift = newShift(shift.duration / 60000); shift = start(shift, Date.now());}
  saveShift();renderShift();
});
$('reset-shift').addEventListener('click', () => {shift = newShift(shift.duration / 60000); saveShift();renderShift();});
$('duration').addEventListener('change', () => {shift = newShift(Number($('duration').value));saveShift();renderShift();});
function renderNotes(){
  $('notes').replaceChildren(); $('export').disabled = !notes.length;
  if (!notes.length) {const p = document.createElement('p');p.className='empty';p.textContent='No handovers recorded. Every shift leaves a trace.';$('notes').append(p);return;}
  for (const note of [...notes].sort((a,b)=>b.at-a.at)) {
    const article = document.createElement('article');article.className='entry';const time = document.createElement('time');time.dateTime=new Date(note.at).toISOString();time.textContent=new Date(note.at).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});const p=document.createElement('p');p.textContent=note.text;article.append(time,p);$('notes').append(article);
  }
}
$('note-form').addEventListener('submit', event => {
  event.preventDefault();const text=$('note').value.trim();if(!text)return;
  const stored = cleanNotes(read(NOTES, []));
  notes = [...new Map([...stored,...notes].map(n=>[n.id,n])).values(),{id:crypto.randomUUID(),at:Date.now(),text}];
  const saved=write(NOTES,notes);$('note-status').textContent=saved?'Handover recorded locally.':'Kept for this session. Export notes to save them.';
  if(saved){$('note').value='';write(DRAFT,'');}renderNotes();
});
$('export').addEventListener('click', () => {
  const blob=new Blob([JSON.stringify({format:'silo-handover-v1',notes},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='silo-handovers.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
window.addEventListener('storage',event=>{
  if(event.key===SHIFT){shift=restoreShift(read(SHIFT,null),Date.now());renderShift();}
  if(event.key===NOTES){notes=cleanNotes(read(NOTES,[]));renderNotes();}
});
const orders=[{name:'Residential demand',demand:64},{name:'Night circulation',demand:48},{name:'Mechanical surge',demand:78}];
let round=0, held=0, accepted=false, previousFrame=performance.now();
let values=plant(40,30);
function announce(text){$('game-announcement').textContent=text;}
function renderPlant(dt){
  const target=plant(Number($('steam').value),Number($('cooling').value));const smooth=1-Math.exp(-dt/1.3);
  for(const key of Object.keys(values))values[key]+=(target[key]-values[key])*smooth;
  const demand=orders[round].demand;const safe=stable(values,demand);
  if(!accepted){held=safe?Math.min(8,held+dt):0;if(held>=8){accepted=true;announce(round===2?'All load orders complete. Generator certified.':'Load order accepted. Next order is ready.');}}
  for(const [key,min,max] of [['power',demand-5,demand+5],['pressure',45,62],['heat',60,76]]){
    $(key).textContent=String(Math.round(values[key]));$(key+'-bar').style.width=`${clamp(values[key],0,100)}%`;$(key).closest('.meter').classList.toggle('safe',values[key]>=min&&values[key]<=max);
  }
  $('steam-value').textContent=$('steam').value+'%';$('cooling-value').textContent=$('cooling').value+'%';
  $('plant-status').textContent=accepted?(round===2?'DUTY CERTIFIED':'ORDER ACCEPTED'):safe?'HOLD STEADY':'ADJUST OUTPUT';$('plant-status').classList.toggle('good',safe||accepted);
  $('hold-bar').style.width=held/8*100+'%';$('hold-label').textContent=`STABILITY HOLD / ${held.toFixed(1)}s`;
  $('steam').disabled=accepted; $('cooling').disabled=accepted;
  $('next-order').disabled=!accepted;$('next-order').textContent=round===2?'Start new inspection ↻':'Next load order ↗';
}
$('next-order').addEventListener('click',()=>{round=(round+1)%3;held=0;accepted=false;$('load-name').textContent=orders[round].name;$('round-number').textContent=String(round+1).padStart(2,'0');$('demand-label').textContent='DEMAND '+orders[round].demand;announce('New load order: '+orders[round].name);});
// Simulation advances only while visible; elapsed focus time always uses the persisted wall-clock deadline.
setInterval(()=>{const now=performance.now();const dt=document.hidden?0:Math.min((now-previousFrame)/1000,.25);previousFrame=now;if(!document.hidden)renderPlant(dt);renderShift();$('wall-clock').textContent=new Date().toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'});},100);
document.addEventListener('visibilitychange',()=>{previousFrame=performance.now();renderShift();});
let audio=null;
$('sound').addEventListener('click',async()=>{
  if(audio){await audio.close();audio=null;$('sound').setAttribute('aria-pressed','false');$('sound').lastElementChild.textContent='OFF';return;}
  try{audio=new AudioContext();const gain=audio.createGain();gain.gain.value=.025;gain.connect(audio.destination);for(const hz of [55,82.4]){const oscillator=audio.createOscillator();oscillator.type='sine';oscillator.frequency.value=hz;oscillator.connect(gain);oscillator.start();}await audio.resume();$('sound').setAttribute('aria-pressed','true');$('sound').lastElementChild.textContent='ON';}
  catch {if(audio)await audio.close().catch(()=>{});audio=null;announce('Ambience is unavailable in this browser.');}
});
if(restored==='complete')saveShift();renderShift();renderNotes();renderPlant(0);
