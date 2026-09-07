import test from 'node:test';
import assert from 'node:assert/strict';
import {Coverage,strokePoints,advanceRound} from '../companion/core.mjs';
test('overlapping wipes never double-count coverage',()=>{
 const mask=new Coverage(100,60);mask.wipe(40,30,15);const first=mask.fraction;
 mask.wipe(40,30,15);assert.equal(mask.fraction,first);
 mask.wipe(60,30,15);assert.ok(mask.fraction>first);assert.ok(mask.fraction<first*2);
});
test('edge wipes stay bounded and sweeping can clear the whole lens',()=>{
 const mask=new Coverage(100,60);mask.wipe(-20,-20,5);assert.equal(mask.fraction,0);
 for(let y=0;y<=60;y+=10)for(let x=0;x<=100;x+=10)mask.wipe(x,y,10);
 assert.equal(mask.fraction,1);
});
test('fast pointer strokes interpolate without gaps',()=>{
 const points=strokePoints({x:0,y:0},{x:100,y:0},10);
 assert.equal(points[0].x,0);assert.equal(points.at(-1).x,100);
 for(let i=1;i<points.length;i++)assert.ok(Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y)<=10.001);
});
test('air does not drain before first wipe or during pause',()=>{
 for(const phase of ['intro','ready','paused','won','lost'])assert.equal(advanceRound({phase,remaining:30},20,0).remaining,30);
});
test('clearing 85 percent wins; elapsed air loses and clamps at zero',()=>{
 assert.equal(advanceRound({phase:'playing',remaining:2},1,.85).phase,'won');
 assert.deepEqual(advanceRound({phase:'playing',remaining:2},5,.6),{phase:'lost',remaining:0});
});
