import assert from 'node:assert/strict';
import {createState,begin,step,flight,difficulty,FLIGHT_SECONDS,ROAD_LIMIT} from '../engine.mjs';
import {makeSilver,makeSUV} from '../models.mjs';
function fresh(){const s=begin(createState());s.surge=true;s.nextRear=s.nextSuv=s.nextTraffic=1e6;s.nextBillboardAt=1e9;return s;}
function run(s,seconds,input={}){for(let i=0;i<Math.ceil(seconds*60);i++)step(s,1/60,input);}
let s=fresh();step(s,.05,{jump:true});assert.ok(s.y>0);run(s,3.5,{jump:true});assert.equal(s.jumpT,-1);assert.equal(s.y,0);assert.equal(s.cooldown,0);step(s,.05,{jump:false});step(s,.05,{jump:true});assert.ok(s.jumpT>=0);assert.equal(flight(FLIGHT_SECONDS).height,0);assert.ok(Math.abs(flight(FLIGHT_SECONDS*.8).roll-Math.PI*2)<1e-10);
s=fresh();run(s,3,{right:true});assert.equal(s.x,ROAD_LIMIT);run(s,5,{left:true});assert.equal(s.x,-ROAD_LIMIT);
function rear(s){s.rears=[{id:1,x:0,z:1,age:2,warning:1,speed:30,resolved:false}];}
s=fresh();rear(s);step(s,.05);assert.equal(s.health,0);assert.equal(s.phase,'over');
s=fresh();rear(s);s.jumpT=1;s.y=flight(1).height;run(s,.5);assert.equal(s.health,1);assert.equal(s.dodges,1);
s=fresh();rear(s);s.x=4;run(s,.5);assert.equal(s.health,1);
function battery(s){s.batteries=[{id:2,x:0,startX:0,targetX:0,z:-1,y:.18,age:1,resolved:false}];}
s=fresh();battery(s);step(s,.05);assert.equal(s.health,0);assert.equal(s.phase,'over');
s=fresh();battery(s);s.jumpT=1;s.y=flight(1).height;run(s,.5);assert.equal(s.health,1);assert.equal(s.dodges,1);
s=fresh();battery(s);s.x=4;run(s,.5);assert.equal(s.health,1);assert.equal(s.dodges,1);
s=fresh();s.suvs=[{id:3,x:3,z:-45,speed:48,dropped:false,resolved:false}];s.x=-1;step(s,.05);assert.equal(s.batteries.length,1);assert.ok(s.suvs[0].z<0);assert.equal(s.batteries[0].targetX,-1);s.x=4;step(s,.05);assert.equal(s.batteries[0].targetX,-1);
s=fresh();run(s,60.05);assert.equal(s.phase,'between');assert.equal(s.level,1);assert.equal(s.remaining,0);assert.equal(s.score,500);run(s,4.1);assert.equal(s.level,2);assert.equal(s.phase,'playing');assert.ok(s.remaining>59);assert.equal(s.health,1);assert.ok(difficulty(2).rearSpeed>difficulty(1).rearSpeed);assert.ok(difficulty(2).rearInterval<difficulty(1).rearInterval);
s=begin(createState());run(s,45);assert.equal(s.phase,'over');assert.equal(s.health,0);const time=s.remaining;run(s,2);assert.equal(s.remaining,time);
for(const model of [makeSilver(),makeSUV()]){model.traverse(o=>{if(o.isMesh)assert.ok(Array.from(o.geometry.attributes.position.array).every(Number.isFinite));});}
console.log('PASS: one full flip, landing/cooldown and no held-key autojump; bounded steering; rear and battery collisions, flight and steering dodges; SUV ejects before passing and locks battery target; 60-second round, automatic next level, increased difficulty, single-hit failure and finite models.');

