import {collideVehicles} from './collisions.mjs';
export const ROUND_SECONDS=60,FLIGHT_SECONDS=2.25,JUMP_COOLDOWN=.8,ROAD_LIMIT=5.45;
export const TRAFFIC_TYPES={bus:{width:2.45,length:9.4,height:3.35,label:'公交车'},taxi:{width:2.05,length:4.65,height:1.65,label:'的士'},truck:{width:2.55,length:10.7,height:3.75,label:'大卡车'},sprinkler:{width:2.5,length:7.3,height:2.95,label:'洒水车'}};
export function difficulty(level,remaining=60){const n=Math.max(0,level-1);const surge=remaining<=20,factor=surge?.58:1;return {surge,rearInterval:Math.max(2.2,Math.max(3.8,7.8-n*.65)*factor),suvInterval:Math.max(2.9,Math.max(5,11.4-n*.9)*factor),rearSpeed:30+n*4,suvSpeed:48+n*5,warning:Math.max(.7,1.25-n*.055),speed:120+n*10};}
export function createState(seed=82){return {phase:'intro',surge:false,level:1,remaining:ROUND_SECONDS,totalTime:0,score:0,dodges:0,health:1,x:0,y:0,steer:0,jumpT:-1,cooldown:0,jumpHeld:false,rears:[],suvs:[],batteries:[],traffic:[],billboards:[],wrecks:[],distance:0,nextBillboardAt:120,nextTraffic:5.2,trafficCycle:0,nextRear:4,nextSuv:8.8,transition:0,seed,id:0,events:[]};}
function rand(s){s.seed=(s.seed*16807)%2147483647;return(s.seed-1)/2147483646;}
export function begin(s){Object.assign(s,createState(s.seed));s.phase='playing';return s;}
export function flight(t){if(t<0||t>=FLIGHT_SECONDS)return {height:0,roll:0};const p=t/FLIGHT_SECONDS,ease=v=>v*v*(3-2*v),f=Math.max(0,Math.min(1,(p-.2)/.6));const height=p<.3?5.4*ease(p/.3):p>.65?5.4*(1-ease((p-.65)/.35)):5.4;return {height,roll:Math.PI*2*ease(f)};}
export function nextLevel(s){s.level++;s.surge=false;s.phase='playing';s.remaining=ROUND_SECONDS;s.health=1;s.rears=[];s.suvs=[];s.batteries=[];s.traffic=[];s.billboards=[];s.wrecks=[];s.distance=0;s.nextBillboardAt=120;s.nextTraffic=4.5;s.trafficCycle=0;s.nextRear=2.8;s.nextSuv=6.1;s.jumpT=-1;s.y=0;s.cooldown=0;s.jumpHeld=false;s.events.push({type:'level',level:s.level});}
function hit(s,kind){if(s.phase!=='playing')return;s.health=0;s.phase='over';s.events.push({type:'hit',kind},{type:'over',kind});}
export function step(s,delta,input={}){s.events=[];const dt=Math.max(0,Math.min(delta,.05));if(s.phase==='between'){s.transition-=dt;if(s.transition<=0)nextLevel(s);return s.events;}if(s.phase!=='playing')return s.events;
 s.remaining=Math.max(0,s.remaining-dt);const d=difficulty(s.level,s.remaining);if(d.surge&&!s.surge){s.surge=true;s.nextRear=Math.min(s.nextRear,.8);s.nextSuv=Math.min(s.nextSuv,1.5);s.events.push({type:'surge'});}s.totalTime+=dt;s.cooldown=Math.max(0,s.cooldown-dt);
 const turn=(input.right?1:0)-(input.left?1:0);s.steer+=(turn-s.steer)*Math.min(1,dt*10);s.x=Math.max(-ROAD_LIMIT,Math.min(ROAD_LIMIT,s.x+s.steer*7.6*dt));
 if(input.jump&&!s.jumpHeld&&s.jumpT<0&&s.cooldown===0){s.jumpT=0;s.events.push({type:'jump'});}s.jumpHeld=!!input.jump;
 if(s.jumpT>=0){s.jumpT+=dt;if(s.jumpT>=FLIGHT_SECONDS){s.jumpT=-1;s.y=0;s.cooldown=JUMP_COOLDOWN;s.events.push({type:'land'});}else s.y=flight(s.jumpT).height;}
 s.nextRear-=dt;s.nextSuv-=dt;
 s.distance+=d.speed/3.6*dt;s.nextTraffic-=dt;
 if(s.nextTraffic<=0){const types=Object.keys(TRAFFIC_TYPES),type=types[s.trafficCycle++%types.length];s.traffic.push({id:++s.id,type,x:[-4.4,0,4.4][Math.floor(rand(s)*3)],z:-145,speed:13+rand(s)*5+(s.level-1)*1.3,resolved:false});s.nextTraffic=Math.max(4.8,8-(s.level-1)*.3)+rand(s)*2;}
 if(s.distance>=s.nextBillboardAt){const side=rand(s)>.5?1:-1;s.billboards.push({id:++s.id,side,x:side*3.75,z:-160,width:6.2,bottom:4.65,top:6.65,ad:Math.floor(rand(s)*4),resolved:false});s.nextBillboardAt+=260+rand(s)*120;}
 if(s.nextRear<=0){s.rears.push({id:++s.id,x:s.x,z:48,age:0,warning:d.warning,speed:d.rearSpeed,resolved:false});s.nextRear=d.rearInterval+rand(s)*1.1;s.events.push({type:'rearWarning'});}
 if(s.nextSuv<=0){const side=rand(s)>.5?1:-1;s.suvs.push({id:++s.id,x:Math.max(-4.8,Math.min(4.8,s.x+side*2.6)),z:-115,speed:d.suvSpeed,dropped:false,resolved:false});s.nextSuv=d.suvInterval+rand(s)*1.5;}
 collideVehicles(s,dt,d.speed/3.6);
 for(const w of s.wrecks){const half=w.length/2+2.6;if(w.previousZ<half&&w.z>-half&&Math.abs(w.x-s.x)<w.width/2+1.02&&s.y<w.height){hit(s,'wreck');return s.events;}}
 for(const e of s.rears){const oldZ=e.z;e.age+=dt;if(e.age>e.warning)e.z-=e.speed*dt;else e.z=48-(e.age/e.warning)*4;
  if(e.age-dt<=e.warning&&e.age>e.warning)s.events.push({type:'rearCharge'});
  if(oldZ> -4.8&&e.z<4.8&&Math.abs(e.x-s.x)<2&&s.y<2.9){if(!e.resolved){hit(s,'rear');e.resolved=true;return s.events;}}
  if(e.z< -6&&!e.resolved){e.resolved=true;s.dodges++;s.score+=100;s.events.push({type:'dodge',kind:'rear'});}}
 for(const e of s.suvs){const oldZ=e.z;e.z+=e.speed*dt;if(!e.dropped&&e.z>=-44){e.dropped=true;const target=s.x;s.batteries.push({id:++s.id,x:e.x,startX:e.x,targetX:target,z:Math.min(-40,e.z),y:.3,age:0,resolved:false});s.events.push({type:'batteryDrop'});}
  if(oldZ<4.8&&e.z> -4.8&&Math.abs(e.x-s.x)<1.9&&s.y<2.65&&!e.resolved){hit(s,'suv');e.resolved=true;return s.events;}}
 for(const b of s.batteries){const oldZ=b.z;b.age+=dt;const t=Math.min(1,b.age/.55);b.x=b.startX+(b.targetX-b.startX)*t;b.y=t<1?.3+Math.sin(t*Math.PI)*1.65:.18;b.z+=(d.speed/3.6)*dt;
  if(oldZ<2.9&&b.z> -2.9&&Math.abs(b.x-s.x)<1.75&&s.y<b.y+.75&&!b.resolved){hit(s,'battery');b.resolved=true;return s.events;}
  if(b.z>3.5&&!b.resolved){b.resolved=true;s.dodges++;s.score+=150;s.events.push({type:'dodge',kind:'battery'});}}
 for(const e of s.traffic){const oldZ=e.z;e.z+=e.speed*dt;const shape=TRAFFIC_TYPES[e.type],half=shape.length/2+2.6;if(oldZ<half&&e.z> -half&&Math.abs(e.x-s.x)<shape.width/2+1.02&&s.y<shape.height+.12&&!e.resolved){hit(s,'traffic-'+e.type);e.resolved=true;return s.events;}if(e.z>half&&!e.resolved){e.resolved=true;s.dodges++;s.score+=50;s.events.push({type:'dodge',kind:'traffic'});}}
 for(const b of s.billboards){const oldZ=b.z;b.z+=d.speed/3.6*dt;if(oldZ<2.9&&b.z> -2.9&&Math.abs(b.x-s.x)<b.width/2+1.02&&s.y+1.5>b.bottom&&s.y<b.top&&!b.resolved){hit(s,'billboard');b.resolved=true;return s.events;}if(b.z>3&&!b.resolved){b.resolved=true;s.dodges++;s.score+=75;s.events.push({type:'dodge',kind:'billboard'});}}
 s.rears=s.rears.filter(e=>e.z> -70);s.suvs=s.suvs.filter(e=>e.z<40);s.batteries=s.batteries.filter(b=>b.z<35);
 s.traffic=s.traffic.filter(e=>e.z<55);s.billboards=s.billboards.filter(b=>b.z<50);
 if(s.phase==='playing'&&s.remaining===0){s.phase='between';s.transition=4;s.score+=500;s.events.push({type:'clear',level:s.level});}return s.events;
}
