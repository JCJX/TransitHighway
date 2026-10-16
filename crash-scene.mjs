import * as T from './vendor/three.module.js';
import {box,mesh,material} from './models.mjs';
export function makeCrashScene(w,templates,smokeMap){const group=new T.Group(),owned=new Set(),flames=[],smoke=[];
 for(const car of w.cars){const source=car.kind==='traffic'?templates.traffic.get(car.type):templates[car.kind],body=source.clone(true),pivot=new T.Group();pivot.add(body);group.add(pivot);pivot.rotation.set(.04,car.yaw,car.kind==='rear'?.13:-.09);pivot.position.set(car.dx,0,car.dz);
 body.traverse(o=>{if(!o.isMesh)return;const burn=m=>{const n=m.clone();n.color?.multiplyScalar(.23);if(n.emissive)n.emissive.set('#000000');if('roughness'in n)n.roughness=.93;owned.add(n);return n;};o.material=Array.isArray(o.material)?o.material.map(burn):burn(o.material);});pivot.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(pivot);pivot.position.y+=.03-bounds.min.y;
 }
 const scorch=mesh(new T.CircleGeometry(Math.max(2.1,w.width*.7),32),new T.MeshBasicMaterial({color:'#100e0c',transparent:true,opacity:.7,depthWrite:false}),group);scorch.rotation.x=-Math.PI/2;scorch.position.y=.024;scorch.scale.y=Math.min(2.1,w.length/w.width);scorch.castShadow=false;scorch.userData.ownedGeometry=true;owned.add(scorch.material);
 const flameGeo=new T.ConeGeometry(.45,2.1,7);for(let i=0;i<12;i++){const m=new T.MeshBasicMaterial({color:i%2?'#ffb83e':'#ff4c0c',transparent:true,opacity:.88,depthWrite:false,blending:T.AdditiveBlending});owned.add(m);const flame=mesh(flameGeo,m,group);flame.position.set(Math.sin(i*9)*w.width*.32,1.15+(i%3)*.2,Math.cos(i*7)*Math.min(3,w.length*.3));flame.castShadow=false;flames.push(flame);}
 for(let i=0;i<14;i++){const m=new T.SpriteMaterial({map:smokeMap,color:'#393b40',transparent:true,opacity:.38,depthWrite:false});owned.add(m);const puff=new T.Sprite(m);group.add(puff);smoke.push(puff);}
 const debrisGeo=new T.BoxGeometry(.28,.13,.5),debrisMat=material('#272b30');owned.add(debrisMat);for(let i=0;i<9;i++){const d=mesh(debrisGeo,debrisMat,group);d.position.set(Math.sin(i*3)*w.width*.57,.09,Math.cos(i*5)*w.length*.43);d.rotation.y=i;}
 return {group,owned,flameGeo,debrisGeo,flames,smoke};}
export function animateCrashScene(v,w){v.group.position.set(w.visualX,0,w.z);for(let i=0;i<v.flames.length;i++){v.flames[i].scale.set(1, .8+Math.sin(w.age*19+i)*.27,1);}
 for(let i=0;i<v.smoke.length;i++){const p=(w.age*.27+i/14)%1,puff=v.smoke[i];puff.position.set(Math.sin(i*8)*1.1+p*1.2,1.3+p*7.5,Math.cos(i*4)*2+p*.8);puff.scale.setScalar(1.1+p*3.4);puff.material.opacity=.46*(1-p);}}
export function disposeCrashScene(v){for(const m of v.owned)m.dispose();v.flameGeo.dispose();v.debrisGeo.dispose();v.group.traverse(o=>{if(o.userData.ownedGeometry)o.geometry.dispose();});}
