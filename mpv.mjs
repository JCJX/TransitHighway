import * as THREE from './vendor/three.module.js';
export function makeMPV(){
function mat(color,metalness=0,roughness=.6){return new THREE.MeshStandardMaterial({color,metalness,roughness});}
const bronze=mat('#795331',.77,.24), champagne=mat('#b4a384',.8,.22),chrome=mat('#c9d0c9',.95,.18),black=mat('#111814',.12,.37),rubber=mat('#101411',.03,.9),glass=mat('#152725',.68,.12),darkChrome=mat('#3b403b',.9,.25);
const led=new THREE.MeshStandardMaterial({color:'#fffbdf',emissive:'#fff1c5',emissiveIntensity:3}),redLED=new THREE.MeshStandardMaterial({color:'#ba291c',emissive:'#ed260e',emissiveIntensity:1.4});
function mesh(geo,material,parent=scene){const m=new THREE.Mesh(geo,material);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function box(parent,w,h,d,x,y,z,material){const m=mesh(new THREE.BoxGeometry(w,h,d),material,parent);m.position.set(x,y,z);return m;}
function line(parent,points,material,r=.012){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(new THREE.TubeGeometry(curve,Math.max(8,points.length*5),r,5,false),material,parent);}
function profile(parent,pts,depth,z,material,bevel=0){const s=new THREE.Shape();pts.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();const m=mesh(new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:bevel>0,bevelSegments:3,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:12}),material,parent);m.position.z=z;return m;}

// A sculpted, two-tone MPV; all geometry is generated locally.
const car=new THREE.Group();const breakable=[];
const side=new THREE.Shape();side.moveTo(-3.03,.5);side.lineTo(-2.57,.5);side.bezierCurveTo(-2.54,1.53,-1.12,1.53,-1.12,.5);side.lineTo(1.24,.5);side.bezierCurveTo(1.26,1.49,2.63,1.49,2.64,.5);side.lineTo(3.04,.52);side.lineTo(3.08,1.55);side.quadraticCurveTo(2.99,1.76,2.82,1.77);side.lineTo(-1.72,1.73);side.lineTo(-2.85,1.59);side.quadraticCurveTo(-3.09,1.55,-3.03,.5);
const body=mesh(new THREE.ExtrudeGeometry(side,{depth:2,bevelEnabled:true,bevelSegments:4,bevelThickness:.075,bevelSize:.07,steps:1,curveSegments:24}),bronze,car);body.position.z=-1;
profile(car,[[-1.8,1.72],[-.86,2.56],[-.55,2.63],[2.5,2.62],[2.85,2.46],[3.04,1.73]],1.91,-.955,champagne,.08);
// Side glazing, inset into the champagne window surround.
for(const sign of [-1,1]){
 const z=sign*1.037;
 profile(car,[[-1.58,1.78],[-.77,2.48],[-.46,2.53],[2.43,2.52],[2.69,2.4],[2.88,1.78]],.018,z-.009,chrome,.02);
 profile(car,[[-1.45,1.83],[-.72,2.43],[-.44,2.48],[2.38,2.47],[2.63,2.37],[2.79,1.83]],.025,z+sign*.025-.012,glass,.018);
 for(const x of [.03,1.85])box(car,.055,.67,.04,x,2.15,z+sign*.052,black);
 line(car,[[-1.53,1.79,z+sign*.045],[.2,1.79,z+sign*.045],[2.86,1.79,z+sign*.045]],chrome,.018);
 line(car,[[-1.12,.54,z+sign*.065],[.2,.53,z+sign*.065],[1.23,.54,z+sign*.065]],chrome,.027);
 line(car,[[-1.08,1.74,z+sign*.045],[-1.02,1.42,z+sign*.056],[-1.01,.69,z+sign*.056]],darkChrome,.008);
 line(car,[[.08,1.74,z+sign*.045],[.08,1.2,z+sign*.071],[.08,.59,z+sign*.058]],darkChrome,.008);
 line(car,[[2.48,1.72,z+sign*.05],[2.56,1.3,z+sign*.04]],darkChrome,.009);
 for(const x of [-.46,.4]){box(car,.32,.055,.065,x,1.61,z+sign*.07,chrome);box(car,.21,.017,.008,x,1.6,z+sign*.107,black);}
 box(car,.34,.04,.07,1.96,2.64,sign*.79,chrome);
 const mirror=box(car,.35,.16,.24,-1.28,1.94,sign*1.19,champagne);mirror.rotation.z=.1;
 if(sign===1)breakable.push(mirror);
 box(car,.29,.08,.015,-1.26,1.97,sign*1.318,glass);box(car,.27,.016,.018,-1.3,1.917,sign*1.319,led);
}
// Sloped windscreen and panoramic roof.
const windshieldGeometry=new THREE.BufferGeometry();windshieldGeometry.setAttribute('position',new THREE.Float32BufferAttribute([-1.845,1.805,-.885,-1.845,1.805,.885,-.982,2.57,.865,-.982,2.57,-.865],3));windshieldGeometry.setIndex([0,1,2,0,2,3]);windshieldGeometry.computeVertexNormals();const wind=mesh(windshieldGeometry,new THREE.MeshStandardMaterial({color:'#18312e',metalness:.65,roughness:.13,side:THREE.DoubleSide}),car);
box(car,2.53,.022,1.62,.76,2.714,0,glass);box(car,.4,.055,.32,-.68,2.66,0,black);
box(car,1.02,.055,1.93,-2.31,1.707,0,champagne);
box(car,.07,.77,1.84,-3.11,1.19,bronze);box(car,.09,.21,1.96,-3.12,.66,black);
for(const sign of [-1,1]){
 box(car,.08,.63,.145,-3.13,1.17,sign*.94,darkChrome);
 box(car,.085,.027,.29,-3.17,1.58,sign*.82,led);
 box(car,.084,.56,.025,-3.179,1.23,sign*1.008,led);
 for(let j=0;j<4;j++)box(car,.092,.07,.067,-3.18,.99+j*.125,sign*.952,led);
 box(car,.09,.025,.48,-3.183,.713,sign*.665,led);
 box(car,.09,.1,.035,-3.18,.65,sign*.92,chrome);
 box(car,.11,.63,.065,3.13,1.26,sign*.955,redLED);
 line(car,[[3.13,.56,sign*.93],[2.81,.5,sign*1.064],[2.65,.5,sign*1.08]],chrome,.02);
}
breakable.push(box(car,.06,.012,1.99,-3.172,.83,chrome));box(car,.1,.025,1.83,-3.14,.51,chrome);
for(let i=-4;i<=4;i++)box(car,.04,.16,.022,-3.18,.64,i*.14,darkChrome);
const emblem=box(car,.055,.17,.09,-3.18,1.3,0,chrome);emblem.rotation.x=Math.PI/4;
function textTexture(text,w=512,h=128){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.fillStyle='#111b19';ctx.fillRect(0,0,w,h);ctx.fillStyle='#dbd3b7';ctx.font=`${Math.floor(h*.5)}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,w/2,h/2);const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;return tx;}
const plate=mesh(new THREE.PlaneGeometry(.53,.15),new THREE.MeshStandardMaterial({map:textTexture('V · GRAND')}),car);plate.position.set(-3.189,.893,0);plate.rotation.y=-Math.PI/2;
box(car,.025,.16,1.68,3.13,1.59,bronze);box(car,.035,.018,1.73,3.165,1.49,redLED);
const wheels=[];
for(const x of [-1.86,1.94])for(const sign of [-1,1]){
 const wheel=new THREE.Group();wheel.position.set(x,.61,sign*1.03);car.add(wheel);wheels.push(wheel);
 const tire=mesh(new THREE.CylinderGeometry(.605,.605,.31,56),rubber,wheel);tire.rotation.x=Math.PI/2;
 const rimMesh=mesh(new THREE.CylinderGeometry(.456,.456,.326,56),chrome,wheel);rimMesh.rotation.x=Math.PI/2;
 const disk=mesh(new THREE.CylinderGeometry(.365,.365,.335,56),champagne,wheel);disk.rotation.x=Math.PI/2;
 for(let j=0;j<20;j++){const a=j/20*Math.PI*2;const slot=box(wheel,.062,.084,.008,Math.cos(a)*.404,Math.sin(a)*.404,sign*.169,black);slot.rotation.z=a-Math.PI/2;}
 const hub=mesh(new THREE.CylinderGeometry(.116,.116,.36,32),darkChrome,wheel);hub.rotation.x=Math.PI/2;
 const cap=mesh(new THREE.CylinderGeometry(.082,.082,.365,24),chrome,wheel);cap.rotation.x=Math.PI/2;
 for(let j=0;j<5;j++){const a=j/5*Math.PI*2;const bolt=mesh(new THREE.SphereGeometry(.018,6,6),chrome,wheel);bolt.position.set(Math.cos(a)*.135,Math.sin(a)*.135,sign*.174);}
 const torus=mesh(new THREE.TorusGeometry(.518,.009,4,64),darkChrome,wheel);torus.position.z=sign*.16;
}
box(car,4.8,.16,1.64,0,.48,0,black);
return car;
}
