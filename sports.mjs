import * as T from './vendor/three.module.js';
const material=(color,metalness=0,roughness=.5)=>new T.MeshStandardMaterial({color,metalness,roughness});
function mesh(g,m,p,name=''){const v=new T.Mesh(g,m);v.name=name;v.castShadow=true;v.receiveShadow=true;p.add(v);return v;}
function box(p,w,h,d,x,y,z,m,name=''){const v=mesh(new T.BoxGeometry(w,h,d),m,p,name);v.position.set(x,y,z);return v;}
function tube(p,points,m,r=.012){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(a=>new T.Vector3(...a))),32,r,6,false),m,p);}
function surface(p,points,m,name=''){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));const index=[];for(let i=1;i<points.length-1;i++)index.push(0,i,i+1);g.setIndex(index);g.computeVertexNormals();return mesh(g,m,p,name);}
function sculpt(p,rings,m,name){const data=[],index=[];for(const [x,bottom,belt,top,width,topWidth] of rings){data.push(x,bottom,-width*.86,x,bottom+.08,-width,x,belt,-width,x,top,-topWidth,x,top,topWidth,x,belt,width,x,bottom+.08,width,x,bottom,width*.86);}for(let i=0;i<rings.length-1;i++)for(let j=0;j<8;j++){const a=i*8+j,b=i*8+(j+1)%8,c=(i+1)*8+j,d=(i+1)*8+(j+1)%8;index.push(a,d,b,a,c,d);}for(let j=1;j<7;j++)index.push(0,j,j+1);const last=(rings.length-1)*8;for(let j=1;j<7;j++)index.push(last,last+j+1,last+j);for(let i=0;i<index.length;i+=3)[index[i+1],index[i+2]]=[index[i+2],index[i+1]];const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(data,3));g.setIndex(index);g.computeVertexNormals();const out=mesh(g,m,p,name);return out;}
export function makeSportsCar(){const p=new T.Group();p.name='silver-one-sport';
 const silver=new T.MeshPhysicalMaterial({color:'#b9c6d2',metalness:.88,roughness:.23,clearcoat:1,clearcoatRoughness:.16});
 const carbon=material('#101923',.55,.28),dark=material('#17232e',.5,.32),glass=new T.MeshPhysicalMaterial({color:'#101d2b',metalness:.65,roughness:.13,clearcoat:1,side:T.DoubleSide}),chrome=material('#a4bac9',.95,.18),rubber=material('#090e14',.02,.88),brake=material('#c62d37',.48,.3);
 const white=new T.MeshStandardMaterial({color:'#d9f6ff',emissive:'#a1ddff',emissiveIntensity:3}),tail=new T.MeshStandardMaterial({color:'#fc284c',emissive:'#e21539',emissiveIntensity:3});
 sculpt(p,[[-2.61,.25,.51,.64,.89,.82],[-2.38,.25,.65,.78,1.02,.89],[-1.82,.28,.72,.89,1.10,.94],[-1.15,.28,.75,.96,1.04,.91],[-.3,.28,.75,.98,1.01,.87],[.6,.29,.76,.98,1.05,.9],[1.52,.31,.8,1.04,1.13,.96],[2.12,.32,.76,.9,1.08,.98],[2.53,.35,.7,.78,.99,.94]],silver,'body');
 sculpt(p,[[-1.13,.91,.95,.97,.88,.86],[-.4,.98,1.24,1.43,.86,.7],[.26,1.0,1.28,1.48,.87,.7],[.8,.99,1.22,1.39,.88,.74],[1.55,.95,.99,1.04,.9,.87]],silver,'canopy');
 surface(p,[[-1.2,.96,-.85],[-1.2,.96,.85],[-.4,1.45,.68],[-.4,1.45,-.68]],glass,'windshield');
 surface(p,[[.36,1.51,-.67],[.36,1.51,.67],[.82,1.425,.73],[.82,1.425,-.73]],glass,'rear-glass');
 surface(p,[[.82,1.425,-.73],[.82,1.425,.73],[1.5,1.09,.84],[1.5,1.09,-.84]],glass);
 surface(p,[[-.39,1.46,-.67],[-.39,1.46,.67],[.35,1.50,.67],[.35,1.50,-.67]],glass);
 const hood=new T.Group();hood.name='hood';p.add(hood);surface(hood,[[-2.33,.792,-.62],[-2.33,.792,.62],[-1.18,.974,.68],[-1.18,.974,-.68]],silver);for(const sign of [-1,1])tube(hood,[[-2.32,.802,sign*.5],[-1.9,.887,sign*.43],[-1.18,.981,sign*.53]],chrome,.008);
 const front=new T.Group();front.name='front-bumper';p.add(front);box(front,.08,.18,1.73,-2.64,.43,0,carbon);box(front,.21,.045,2.01,-2.55,.25,0,carbon);for(const sign of [-1,1]){box(front,.045,.029,.59,-2.673,.625,sign*.61,white);box(front,.04,.075,.024,-2.677,.58,sign*.893,white);box(front,.06,.08,.4,-2.69,.42,sign*.57,dark);}
 box(p,.07,.19,1.88,2.57,.77,0,carbon);box(p,.025,.027,1.83,2.615,.805,0,tail);box(p,.025,.013,.8,2.618,.837,0,tail);box(p,.14,.37,1.67,2.56,.43,0,carbon);for(const z of [-.7,-.35,0,.35,.7])box(p,.48,.21,.035,2.43,.27,z,carbon);
 for(const z of [-.57,-.19,.19,.57]){const exhaust=mesh(new T.TorusGeometry(.071,.014,8,24),chrome,p);exhaust.rotation.y=Math.PI/2;exhaust.position.set(2.655,.47,z);const inner=mesh(new T.CylinderGeometry(.059,.059,.04,20),carbon,p);inner.rotation.z=Math.PI/2;inner.position.set(2.633,.47,z);}
 box(p,.035,.18,.36,2.632,.675,0,chrome);
 for(const sign of [-1,1]){
  surface(p,[[-.99,1.01,sign*.901],[-.33,1.4,sign*.738],[.33,1.43,sign*.742],[1.21,1.05,sign*.898]],glass,`side-glass-${sign}`);
  tube(p,[[-1.06,1.01,sign*.92],[-.39,1.45,sign*.72],[.3,1.49,sign*.72],[1.4,1.035,sign*.91]],chrome,.011);
  tube(p,[[.36,1.43,sign*.75],[.44,1.04,sign*.905]],dark,.018);
  tube(p,[[-.99,.99,sign*1.045],[-.83,.56,sign*1.06],[-.7,.35,sign*1.05],[.85,.35,sign*1.07],[1.12,.63,sign*1.105]],dark,.006);
  box(p,3.7,.075,.11,-.05,.27,sign*1.08,carbon);box(p,.27,.025,.035,.4,.92,sign*1.06,chrome);
  const mirror=new T.Group();mirror.name=`mirror-${sign}`;p.add(mirror);tube(mirror,[[-.66,1.03,sign*.92],[-.71,1.07,sign*1.2]],carbon,.018);box(mirror,.25,.085,.15,-.72,1.09,sign*1.23,silver);box(mirror,.22,.045,.012,-.7,1.09,sign*1.31,glass);
  surface(p,[[.77,.7,sign*1.086],[1.16,.76,sign*1.115],[1.1,.43,sign*1.115],[.78,.44,sign*1.085]],carbon);for(let i=0;i<3;i++)tube(p,[[.81,.48+i*.062,sign*1.102],[1.08,.51+i*.062,sign*1.128]],chrome,.008);
  for(const center of [-1.66,1.66]){const points=[];for(let j=0;j<=18;j++){const a=j/18*Math.PI;points.push([center+Math.cos(a)*.531,.47+Math.sin(a)*.531,sign*1.13]);}tube(p,points,carbon,.027);}
 }
 const wing=new T.Group();wing.name='rear-wing';p.add(wing);box(wing,.17,.035,1.98,2.45,.865,0,carbon);
 for(const x of [-1.66,1.66])for(const sign of [-1,1]){
  const wheel=new T.Group();wheel.name=`wheel-${x<0?'front':'rear'}-${sign}`;wheel.position.set(x,.47,sign*1.07);wheel.userData.wheel=true;p.add(wheel);
  mesh(new T.TorusGeometry(.365,.105,12,48),rubber,wheel);for(const offset of [-.077,.077]){const t=mesh(new T.TorusGeometry(.397,.007,5,48),dark,wheel);t.position.z=offset;}
  const disc=mesh(new T.CylinderGeometry(.286,.286,.035,40),chrome,wheel);disc.rotation.x=Math.PI/2;disc.position.z=sign*.04;const rim=mesh(new T.TorusGeometry(.329,.022,8,48),chrome,wheel);rim.position.z=sign*.113;
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2;for(const fork of [-1,1]){const branch=box(wheel,.025,.25,.035,Math.sin(a+fork*.11)*.185,Math.cos(a+fork*.11)*.185,sign*.118,chrome);branch.rotation.z=-(a+fork*.18);}const bolt=mesh(new T.SphereGeometry(.014,6,6),chrome,wheel);bolt.position.set(Math.sin(a)*.065,Math.cos(a)*.065,sign*.143);}
  const hub=mesh(new T.CylinderGeometry(.087,.087,.275,24),dark,wheel);hub.rotation.x=Math.PI/2;box(wheel,.085,.17,.06,-.22,.02,sign*.075,brake);
 }
 for(const sign of [-1,1])for(const x of [-1.55,1.5]){const n=mesh(new T.CylinderGeometry(.085,.115,.12,16),carbon,p);n.position.set(x,.23,sign*.72);}
 return p;
}
