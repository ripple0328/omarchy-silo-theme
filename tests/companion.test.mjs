import test from 'node:test';
import assert from 'node:assert/strict';
import {newShift,start,pause,tick,restoreShift,plant,stable} from '../companion/core.mjs';
test('shift uses deadline across suspended tabs and reload, not interval count',()=>{
 const s=start(newShift(25),1000);assert.equal(restoreShift(JSON.parse(JSON.stringify(s)),61000).remaining,1440000);
 assert.equal(tick(s,2000000).phase,'complete');assert.equal(tick(s,2000000).remaining,0);
});
test('pause freezes remaining time and resume establishes a new deadline',()=>{
 const s=pause(start(newShift(15),1000),61000);assert.equal(s.remaining,840000);assert.equal(tick(s,9999999).remaining,840000);
 assert.equal(start(s,2000000).endsAt,2840000);
});
test('pausing after deadline completes instead of resurrecting the timer',()=>{assert.equal(pause(start(newShift(1),0),60001).phase,'complete');});
test('corrupt persisted timer recovers safely',()=>{
 for(const bad of [null,{}, {phase:'running',duration:60000,remaining:60000,endsAt:'bad'},{phase:'paused',duration:-1,remaining:3}]) assert.equal(restoreShift(bad,0).phase,'idle');
});
test('all load orders have feasible settings; unsafe controls fail',()=>{
 for(const [demand,steam,cooling] of [[64,60,50],[48,49,40],[78,70,55]])assert.ok(stable(plant(steam,cooling),demand));
 assert.equal(stable(plant(0,100),64),false);assert.equal(stable(plant(100,0),64),false);
});
