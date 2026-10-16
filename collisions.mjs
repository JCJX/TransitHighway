import {TRAFFIC_TYPES} from './engine.mjs';
export function vehicleShape(kind,type){return kind==='rear'?{width:2.3,length:5.8,height:2.35}:kind==='suv'?{width:2.2,length:5.2,height:2.5}:TRAFFIC_TYPES[type];}
function velocity(e,kind){return kind==='rear'?-(e.age>=e.warning?e.speed:4/e.warning):e.speed;}
function overlaps(a,b,dt){const half=(a.shape.length+b.shape.length)/2,relative=a.e.z-b.e.z,end=relative+(a.v-b.v)*dt;return Math.abs(a.e.x-b.e.x)<(a.shape.width+b.shape.width)/2&&Math.min(relative,end)<half&&Math.max(relative,end)>-half;}
export function collideVehicles(s,dt,roadSpeed){
 const entries=[...s.rears.map(e=>({e,kind:'rear'})),...s.suvs.map(e=>({e,kind:'suv'})),...s.traffic.map(e=>({e,kind:'traffic'}))].map(a=>({...a,shape:vehicleShape(a.kind,a.e.type),v:velocity(a.e,a.kind)}));
 const removed=new Set(),existingWrecks=[...s.wrecks];
 for(let i=0;i<entries.length;i++){const a=entries[i];if(removed.has(a.e.id))continue;for(let j=i+1;j<entries.length;j++){const b=entries[j];if(removed.has(b.e.id)||!overlaps(a,b,dt))continue;
  removed.add(a.e.id);removed.add(b.e.id);const x=(a.e.x+b.e.x)/2,z=(a.e.z+b.e.z)/2;
  const cars=[a,b].map((v,k)=>({kind:v.kind,type:v.e.type,dx:v.e.x-x,dz:v.e.z-z,yaw:k?.24:-.21}));
  const minX=Math.min(a.e.x-a.shape.width/2,b.e.x-b.shape.width/2)-.25,maxX=Math.max(a.e.x+a.shape.width/2,b.e.x+b.shape.width/2)+.25;
  const halfZ=Math.max(...[a,b].map(v=>Math.abs(v.e.z-z)+v.shape.length/2))+.25;
  s.wrecks.push({id:++s.id,x:(minX+maxX)/2,z,visualX:x,width:maxX-minX,length:halfZ*2,height:Math.max(a.shape.height,b.shape.height)+.2,age:0,cars});s.events.push({type:'trafficCrash',x,z});break;
 }}
 for(const a of entries){if(removed.has(a.e.id))continue;for(const w of existingWrecks){const obstacle={e:{x:w.x,z:w.z},shape:{width:w.width,length:w.length},v:roadSpeed};if(!overlaps(a,obstacle,dt))continue;removed.add(a.e.id);s.wrecks.push({id:++s.id,x:a.e.x,visualX:a.e.x,z:a.e.z,width:a.shape.width+.5,length:a.shape.length+.5,height:a.shape.height+.2,age:0,cars:[{kind:a.kind,type:a.e.type,dx:0,dz:0,yaw:.25}]});s.events.push({type:'trafficCrash',x:a.e.x,z:a.e.z});break;}}
 for(const key of ['rears','suvs','traffic'])s[key]=s[key].filter(e=>!removed.has(e.id));
 // A stationary crash scene approaches at road speed as the player drives on.
 for(const w of s.wrecks){w.previousZ=w.z;w.z+=roadSpeed*dt;w.age+=dt;}
 s.wrecks=s.wrecks.filter(w=>w.z-w.length/2<65);
}
