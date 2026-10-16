import assert from 'node:assert/strict';
import {flight,FLIGHT_SECONDS} from '../engine.mjs';
import {attitudePower} from '../attitude-jets.mjs';
for(let p=0;p<=.38;p+=.01)assert.equal(flight(p*FLIGHT_SECONDS).roll,0,'lift remains level');
for(let p=.28;p<=.76;p+=.01)assert.equal(flight(p*FLIGHT_SECONDS).height,5.4,'roll stays at peak');
let previous=0;for(let p=.38;p<=.70;p+=.001){const r=flight(p*FLIGHT_SECONDS).roll;assert.ok(r>=previous);previous=r;}assert.ok(Math.abs(flight(.7*FLIGHT_SECONDS).roll-2*Math.PI)<1e-10);
for(let p=.76;p<1;p+=.01)assert.equal(flight(p*FLIGHT_SECONDS).roll,2*Math.PI,'descent remains level');
const h=.00001;for(const p of [.28,.38,.7,.76]){const t=p*FLIGHT_SECONDS;for(const key of ['height','roll'])assert.ok(Math.abs(flight(t+h)[key]-flight(t-h)[key])<.001,'smooth stage transitions');}
for(let t=0;t<FLIGHT_SECONDS;t+=.005){const f=flight(t);assert.ok(f.height>=0&&f.height<=5.4);const jets=attitudePower(t,0);if(f.stage==='360° 横向空翻')assert.ok((jets.left>0)!==(jets.right>0));else assert.equal(jets.left+jets.right,0);}
assert.equal(flight(FLIGHT_SECONDS).height,0);assert.equal(flight(-1).thrust,0);
console.log('PASS: level lift, peak hover and full 360 roll, level vertical descent, smooth transition velocities, bounded height, side jets only alternate during roll.');
