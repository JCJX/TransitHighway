import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {begin,createState,step,nextLevel,TRAFFIC_TYPES} from '../engine.mjs';
import {collideVehicles} from '../collisions.mjs';
import {makeCrashScene,animateCrashScene,disposeCrashScene} from '../crash-scene.mjs';
import {AttitudeJets,attitudePower} from '../attitude-jets.mjs';
import {makeSilver,makeSUV} from '../models.mjs';
import {makeMPV} from '../mpv.mjs';
import {makeTraffic} from '../traffic.mjs';
const kinds=['rear','suv',...Object.keys(TRAFFIC_TYPES)];
function fresh(){const s=begin(createState());s.nextRear=s.nextSuv=s.nextTraffic=1e6;s.nextBillboardAt=1e9;return s;}
function add(s,kind,x,z,speed=30){const e={id:++s.id,x,z,speed,age:2,warning:1,dropped:true,resolved:false};if(kind==='rear')s.rears.push(e);else if(kind==='suv')s.suvs.push(e);else s.traffic.push({...e,type:kind});}
for(let i=0;i<kinds.length;i++)for(let j=i;j<kinds.length;j++){const s=fresh();add(s,kinds[i],0,-30);add(s,kinds[j],0,-31);collideVehicles(s,.016,33.3);assert.equal(s.wrecks.length,1);assert.equal(s.rears.length+s.suvs.length+s.traffic.length,0);assert.equal(s.events.filter(e=>e.type==='trafficCrash').length,1);const z=s.wrecks[0].z;collideVehicles(s,.05,33.3);assert.equal(s.wrecks.length,1);assert.ok(Math.abs(s.wrecks[0].z-z-1.665)<1e-6);}
let s=fresh();add(s,'rear',-4.4,-25);add(s,'truck',4.4,-25);collideVehicles(s,.05,33);assert.equal(s.wrecks.length,0);
s=fresh();add(s,'rear',0,-15,1000);add(s,'taxi',0,-30,1000);collideVehicles(s,.05,33);assert.equal(s.wrecks.length,1,'swept collision prevents tunneling');
s=fresh();add(s,'suv',0,-30);add(s,'taxi',0,-31);collideVehicles(s,.016,33);add(s,'bus',0,-30);collideVehicles(s,.016,33);assert.equal(s.traffic.length,0);assert.equal(s.wrecks.length,2,'later traffic also crashes into stationary wrecks');s.wrecks.forEach(w=>w.z=100);collideVehicles(s,.016,33);assert.equal(s.wrecks.length,0,'offscreen wrecks are removed');
for(const mode of ['ground','flight','steer']){s=fresh();add(s,'rear',0,-.8);add(s,'bus',0,-1);if(mode==='flight')s.jumpT=1;if(mode==='steer')s.x=5;step(s,.016);assert.equal(s.phase,mode==='ground'?'over':'playing');assert.equal(s.wrecks.length,1);if(mode==='ground')assert.equal(s.events.find(e=>e.type==='hit').kind,'wreck');nextLevel(s);assert.equal(s.wrecks.length,0);}
s=fresh();add(s,'suv',0,-30);add(s,'sprinkler',0,-31);collideVehicles(s,.016,33);const w=s.wrecks[0],rear=makeSUV(),suv=makeSUV(),traffic=new Map(Object.keys(TRAFFIC_TYPES).map(k=>[k,makeTraffic(k)])),v=makeCrashScene(w,{rear,suv,traffic},new T.Texture());for(let i=0;i<200;i++){w.age=i/60;animateCrashScene(v,w);}v.group.updateMatrixWorld(true);v.group.traverse(o=>{assert.ok(Number.isFinite(o.position.x+o.position.y+o.position.z));});disposeCrashScene(v);
const scene=new T.Scene(),roll=new T.Group();scene.add(roll);const jets=new AttitudeJets(scene,roll,new T.Texture());assert.deepEqual(attitudePower(-1,1),{left:0,right:0});for(const steer of [-1,0,1]){let previous=null,changes=0;for(let t=.86;t<1.57;t+=.01){const p=attitudePower(t,steer);assert.ok((p.left>0)!==(p.right>0),'exactly one side fires during rotation');const side=p.left>0?'left':'right';if(previous&&previous!==side)changes++;previous=side;}assert.ok(changes>=3,'left and right alternate repeatedly');}assert.ok(attitudePower(.2,1).left>attitudePower(.2,1).right);assert.ok(attitudePower(.2,-1).right>attitudePower(.2,-1).left);for(let i=0;i<100;i++)jets.update(1/60,{jumpT:1,steer:1},true);assert.equal(jets.particles.length,128);assert.ok(jets.particles.some(p=>p.life>0));const positions=jets.particles.map(p=>p.puff.position.toArray());jets.update(0,{jumpT:1,steer:1},true);assert.deepEqual(jets.particles.map(p=>p.puff.position.toArray()),positions);jets.reset();assert.ok(jets.particles.every(p=>!p.puff.visible));
console.log('PASS: all 21 vehicle pairings collide; separated lanes safe; swept fast impacts; persistent stationary wrecks; one-hit wreck collision, flight and steering avoidance; next-level cleanup; finite fire/smoke; direction-dependent side jets, bounded smoke pool, pause and reset.');

