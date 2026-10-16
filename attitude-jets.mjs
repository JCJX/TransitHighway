import * as T from './vendor/three.module.js';
import {FLIGHT_SECONDS} from './engine.mjs';
export function attitudePower(jumpT,steer){
 if(jumpT<0)return {left:0,right:0};
 if(jumpT>FLIGHT_SECONDS*.38&&jumpT<FLIGHT_SECONDS*.70){const left=Math.floor((jumpT-FLIGHT_SECONDS*.38)/.18)%2===0,power=.72+.2*Math.abs(steer);return {left:left?power:0,right:left?0:power};}
 return {left:Math.max(0,steer)*.85,right:Math.max(0,-steer)*.85};
}
export class AttitudeJets{
 constructor(scene,roll,map){this.scene=scene;this.roll=roll;this.ports=[];this.particles=[];this.cursor=0;this.clock=0;this.budget=0;const geo=new T.ConeGeometry(.13,1,10,1,true),nozzleGeo=new T.CylinderGeometry(.09,.12,.13,10),nozzleMat=new T.MeshStandardMaterial({color:'#324657',metalness:.8,roughness:.3});
  for(const sign of [-1,1])for(const z of [-1.65,1.45]){const g=new T.Group();g.position.set(sign*1.04,-.26,z);roll.add(g);const nozzle=new T.Mesh(nozzleGeo,nozzleMat);nozzle.rotation.z=Math.PI/2;g.add(nozzle);const plume=new T.Mesh(geo,new T.MeshBasicMaterial({color:'#edfaff',transparent:true,opacity:.8,depthWrite:false,blending:T.AdditiveBlending}));plume.rotation.z=-sign*Math.PI/2;plume.position.x=sign*.6;g.add(plume);this.ports.push({sign,z,g,plume,power:0});}
  for(let i=0;i<128;i++){const puff=new T.Sprite(new T.SpriteMaterial({map,color:'#dae9eb',transparent:true,opacity:0,depthWrite:false}));puff.visible=false;scene.add(puff);this.particles.push({puff,life:0,max:1,velocity:new T.Vector3()});}
 }
 reset(){for(const p of this.particles){p.life=0;p.puff.visible=false;}for(const p of this.ports)p.g.visible=false;this.budget=0;}
 emit(position,direction,power){const p=this.particles[this.cursor++%this.particles.length];p.life=p.max=.4+Math.random()*.4;p.puff.position.copy(position);p.puff.visible=true;p.velocity.copy(direction).multiplyScalar(1.4+power*1.8);p.velocity.x+=(Math.random()-.5)*.8;p.velocity.y+=(Math.random()-.5)*.7;p.velocity.z+=1.4;}
 update(dt,state,active){this.clock+=dt;const power=attitudePower(active?state.jumpT:-1,state.steer);for(const p of this.ports){p.power=p.sign<0?power.left:power.right;p.g.visible=p.power>.01;p.plume.scale.y=(.25+p.power*.45)*(1+Math.sin(this.clock*43+p.z)*.11);p.plume.position.x=p.sign*p.plume.scale.y*.5;p.plume.material.opacity=.55+p.power*.35;}
  if(active&&dt>0){this.roll.updateWorldMatrix(true,false);this.budget+=dt*90;while(this.budget>=1){this.budget--;for(const port of this.ports){if(port.power<=0)continue;const origin=new T.Vector3(port.sign*1.12,-.26,port.z).applyMatrix4(this.roll.matrixWorld),dir=new T.Vector3(port.sign,0,0).transformDirection(this.roll.matrixWorld);this.emit(origin,dir,port.power);}const x=this.cursor%2?.72:-.72,z=this.cursor%3?1.5:-1.5;this.emit(new T.Vector3(x,-.8,z).applyMatrix4(this.roll.matrixWorld),new T.Vector3(0,-1,0),.8);}}
  for(const p of this.particles){if(p.life<=0)continue;p.life-=dt;if(p.life<=0){p.puff.visible=false;continue;}const age=1-p.life/p.max;p.puff.position.addScaledVector(p.velocity,dt);p.puff.position.y=Math.max(.08,p.puff.position.y);p.velocity.multiplyScalar(Math.exp(-dt*1.2));p.velocity.y+=dt*.7;p.puff.scale.setScalar(.18+age*.9);p.puff.material.opacity=.46*Math.sin(Math.PI*age)*(1-age*.45);}
 }
}
