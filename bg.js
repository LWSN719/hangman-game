// Halo backdrop: Installation 04 over a gas giant, UNSC + Covenant ships, Forerunner Sentinels, and hidden easter eggs (click them!)
const cv=document.getElementById("space"), cx=cv.getContext("2d");
let W,H,stars,scene,T=0,shots=[],confetti=[],rupture=null,pelican=null,eggs=[];
const rnd=(a,b)=>a+Math.random()*(b-a);
const hash=(i,j)=>{const s=Math.sin(i*127.1+j*311.7)*43758.5453;return s-Math.floor(s)};
const noise=(x,k)=>{const i=Math.floor(x),f=x-i,u=f*f*(3-2*f);return hash(i,k)*(1-u)+hash(i+1,k)*u};

// ---------- static scene (rendered once per resize) ----------
function buildScene(){
  scene=document.createElement("canvas");scene.width=W;scene.height=H;const n=scene.getContext("2d");
  n.fillStyle="#02030a";n.fillRect(0,0,W,H);
  [[.15,.2,.55,"60,40,170"],[.85,.3,.5,"20,120,210"],[.5,.9,.6,"90,40,140"],[.05,.8,.4,"20,80,160"]].forEach(([x,y,r,c])=>{
    const g=n.createRadialGradient(x*W,y*H,0,x*W,y*H,r*Math.max(W,H));g.addColorStop(0,`rgba(${c},.28)`);g.addColorStop(1,`rgba(${c},0)`);n.fillStyle=g;n.fillRect(0,0,W,H)});
  const m=Math.min(W,H);

  // Threshold, the gas giant (lit from the right)
  const px=W*.76,py=H*.38,R=m*.16;
  let g=n.createRadialGradient(px,py,R*.9,px,py,R*1.5);g.addColorStop(0,"rgba(90,200,255,.45)");g.addColorStop(1,"rgba(90,200,255,0)");
  n.fillStyle=g;n.beginPath();n.arc(px,py,R*1.5,0,7);n.fill();
  n.save();n.beginPath();n.arc(px,py,R,0,7);n.clip();
  for(let i=0;i<40;i++){const y=py-R+i*(R*2/40);
    n.fillStyle=`hsl(${185+noise(i*.4,3)*35},${45+noise(i*.3,4)*30}%,${30+noise(i*.5,5)*35}%)`;
    n.fillRect(px-R,y+Math.sin(i)*2,R*2,R*2/40+1)}
  g=n.createRadialGradient(px+R*.45,py-R*.25,R*.1,px-R*.1,py,R*1.25);g.addColorStop(0,"rgba(255,255,255,.35)");g.addColorStop(.5,"rgba(0,0,0,0)");g.addColorStop(1,"rgba(0,0,12,.85)");
  n.fillStyle=g;n.fillRect(px-R,py-R,R*2,R*2);n.restore();
  // Basis-like moon
  const mx=px-R*1.45,my=py+R*.9,mr=R*.2;g=n.createRadialGradient(mx+mr*.4,my-mr*.3,1,mx,my,mr);g.addColorStop(0,"#b9c2cc");g.addColorStop(1,"#222a35");
  n.fillStyle=g;n.beginPath();n.arc(mx,my,mr,0,7);n.fill();

  // sun glare, upper right (lights the planet and ring)
  g=n.createRadialGradient(W*.97,H*.06,0,W*.97,H*.06,m*.9);g.addColorStop(0,"rgba(255,250,230,.95)");g.addColorStop(.06,"rgba(255,235,190,.5)");g.addColorStop(.3,"rgba(255,200,120,.12)");g.addColorStop(1,"rgba(255,200,120,0)");
  n.fillStyle=g;n.fillRect(0,0,W,H);

  // Installation 04: the ring as seen from inside the arc, like the Halo CE sky
  const cxr=W*.5,cyr=H*.9,rx=W*.9,ry=H*.78,bw=H*.17,N=640,S=16;
  const fbm=(u,v)=>{let t=0,a=.5,f=1;for(let o=0;o<4;o++){t+=a*noise(u*f+o*17,Math.floor(v*f*3)+o);a*=.5;f*=2.1}return t};
  n.save();n.translate(cxr,cyr);n.rotate(-.12);
  const pt=a=>[Math.cos(a)*rx,Math.sin(a)*ry],th=a=>bw*(.22+.78*Math.abs(Math.sin(a)));
  for(let i=0;i<N;i++){
    const a0=Math.PI+i/N*Math.PI,a1=Math.PI+(i+1)/N*Math.PI,[x0,y0]=pt(a0),[x1,y1]=pt(a1),t0=th(a0),t1=th(a1);
    const lit=.45+.55*((x0/rx+1)/2);
    for(let k=0;k<S;k++){
      const f0=k/S,f1=(k+1)/S,v=(k+.5)/S,u=i/N*14;
      const land=fbm(u*.9,v),ocean=land<.47,cloud=fbm(u*1.6+40,v*1.3+7);
      let col;
      if(ocean)col=[`hsl(${200+land*20},65%,${(20+land*30)*lit}%)`];
      else col=[land>.62?`hsl(${34+land*20},35%,${(26+land*18)*lit}%)`:`hsl(${105+land*25},38%,${(20+land*20)*lit}%)`];
      n.fillStyle=col[0];
      n.beginPath();n.moveTo(x0,y0+t0*f0);n.lineTo(x1,y1+t1*f0);n.lineTo(x1,y1+t1*f1+.8);n.lineTo(x0,y0+t0*f1+.8);n.fill();
      if(cloud>.52){n.fillStyle=`rgba(255,255,255,${Math.min(.85,(cloud-.52)*2.6)*lit})`;n.fill()}
    }
    // atmosphere haze hugging the inner edge
    n.fillStyle=`rgba(140,210,255,${.25*lit})`;n.beginPath();n.moveTo(x0,y0+t0*.86);n.lineTo(x1,y1+t1*.86);n.lineTo(x1,y1+t1+.8);n.lineTo(x0,y0+t0+.8);n.fill();
  }
  // metallic rim walls on both edges
  const edge=(off,w,col,glow)=>{n.shadowColor="#9fe6ff";n.shadowBlur=glow;n.strokeStyle=col;n.lineWidth=w;n.beginPath();
    for(let i=0;i<=N;i++){const a=Math.PI+i/N*Math.PI,[x,y]=pt(a),yy=y+off*th(a);i?n.lineTo(x,yy):n.moveTo(x,yy)}n.stroke();n.shadowBlur=0};
  edge(-.0,7,"rgba(120,135,150,.95)",0);edge(-.01,3,"rgba(235,248,255,.98)",24);
  edge(1,6,"rgba(70,80,95,.95)",0);edge(1.01,2,"rgba(200,225,245,.9)",10);
  // structural ribs every so often, like the ring's support segments
  n.strokeStyle="rgba(210,230,245,.14)";n.lineWidth=1;
  for(let i=0;i<N;i+=16){const a=Math.PI+i/N*Math.PI,[x,y]=pt(a);n.beginPath();n.moveTo(x,y);n.lineTo(x,y+th(a));n.stroke()}
  n.restore();

  // easter egg: "117" in stars, top-left
  n.fillStyle="#cfe9ff";n.strokeStyle="rgba(150,200,255,.25)";n.font="700 "+Math.max(26,m*.05)+"px Orbitron,sans-serif";
  n.globalAlpha=.55;n.fillText("117",W*.06,H*.1);n.globalAlpha=1;
}
function resize(){
  W=cv.width=innerWidth;H=cv.height=innerHeight;
  stars=Array.from({length:280},()=>({x:rnd(0,W),y:rnd(0,H),r:rnd(.3,1.6),s:rnd(.02,.22),p:rnd(0,6)}));
  buildScene();
}
addEventListener("resize",resize);document.fonts&&document.fonts.ready.then(buildScene);resize();

// ---------- moving things ----------
const ships={
  autumn:{x:-300,v:.45},    // UNSC Pillar of Autumn
  cruiser:{x:W+400,v:-.22}  // Covenant CCS-class cruiser
};
function autumn(){
  const s=ships.autumn;s.x+=s.v;if(s.x>W+360)s.x=-360;
  const k=Math.max(.8,Math.min(1.5,W/1000));
  cx.save();cx.translate(s.x,H*.52+Math.sin(T/350)*5);cx.scale(k,k);
  const poly=(pts,fill,stroke)=>{cx.beginPath();pts.forEach(([x,y],i)=>i?cx.lineTo(x,y):cx.moveTo(x,y));cx.closePath();if(fill){cx.fillStyle=fill;cx.fill()}if(stroke){cx.strokeStyle=stroke;cx.stroke()}};
  cx.lineWidth=1;
  // engine glow
  for(const y of[-9,0,9]){const f=22+Math.random()*10,g=cx.createLinearGradient(-14,0,-14-f-20,0);
    g.addColorStop(0,"rgba(140,235,255,.95)");g.addColorStop(1,"rgba(60,160,255,0)");cx.fillStyle=g;cx.fillRect(-14-f-20,y-3.5,f+20,7)}
  // ventral MAC spine (the ship's main gun runs along the keel)
  poly([[40,14],[225,14],[250,9],[40,9]],"#1d2533","#566a86");
  cx.fillStyle="#0b0f16";cx.fillRect(210,10.5,40,2.5);
  // main hull (blocky Halcyon-class cruiser)
  let g=cx.createLinearGradient(0,-18,0,16);g.addColorStop(0,"#7b8ea8");g.addColorStop(.35,"#4a5970");g.addColorStop(1,"#1f2735");
  poly([[-6,-16],[150,-16],[205,-12],[240,-4],[252,0],[240,5],[205,11],[150,14],[-6,14]],g,"#a9bdd6");
  // panel seams
  cx.strokeStyle="rgba(10,14,22,.65)";for(let x=14;x<235;x+=17){cx.beginPath();cx.moveTo(x,-15);cx.lineTo(x,13);cx.stroke()}
  cx.beginPath();cx.moveTo(-4,-4);cx.lineTo(236,-3);cx.moveTo(-4,6);cx.lineTo(236,5);cx.stroke();
  // scorch marks & hull damage from the Covenant pursuit
  cx.fillStyle="rgba(8,8,10,.45)";cx.beginPath();cx.ellipse(120,-9,16,4,.1,0,7);cx.fill();cx.beginPath();cx.ellipse(70,8,12,3,0,0,7);cx.fill();
  // observation windows
  cx.fillStyle="#ffd66b";for(let r of[-7,0,7])for(let x=30;x<190;x+=9)if(hash(x,r)>.35)cx.fillRect(x,r,3,1.6);
  // bridge superstructure + antenna
  poly([[150,-16],[170,-27],[205,-27],[218,-14]],"#59697f","#b9cde6");
  cx.fillStyle="#9fe6ff";for(let x=176;x<208;x+=6)cx.fillRect(x,-23,3,2);
  cx.strokeStyle="#c8d8ea";cx.beginPath();cx.moveTo(190,-27);cx.lineTo(190,-40);cx.moveTo(185,-36);cx.lineTo(195,-36);cx.stroke();
  // dorsal turret blisters (point-defense)
  for(const x of[60,100])poly([[x,-16],[x+4,-21],[x+14,-21],[x+18,-16]],"#38465b","#9fb4cf");
  // rear engine block with three bells
  poly([[-26,-18],[-6,-20],[-6,18],[-26,16]],"#2b3547","#8aa1bf");
  for(const y of[-9,0,9]){cx.fillStyle="#bdf3ff";cx.fillRect(-27,y-3,4,6)}
  // UNSC hull stripe
  cx.fillStyle="rgba(255,200,61,.8)";cx.fillRect(100,10,50,2);
  // nav lights
  cx.fillStyle=Math.floor(T/30)%2?"#ff3b3b":"#551515";cx.beginPath();cx.arc(-2,-18,2,0,7);cx.fill();
  cx.fillStyle=Math.floor(T/30)%2?"#3bff7a":"#155528";cx.beginPath();cx.arc(250,0,1.8,0,7);cx.fill();
  cx.restore();
}
function cruiser(){
  const s=ships.cruiser;s.x+=s.v;if(s.x<-400)s.x=W+400;
  const k=Math.max(.7,Math.min(1.4,W/1000));
  cx.save();cx.translate(s.x,H*.3+Math.cos(T/500)*6);cx.scale(k,k);
  let g=cx.createRadialGradient(0,18,5,0,18,90);g.addColorStop(0,"rgba(170,90,255,.5)");g.addColorStop(1,"rgba(170,90,255,0)");cx.fillStyle=g;cx.fillRect(-120,-60,240,160);
  cx.fillStyle="#5b3d8f";cx.strokeStyle="#c9a8ff";cx.lineWidth=1;
  cx.beginPath();cx.moveTo(-110,6);cx.quadraticCurveTo(-95,-26,-30,-24);cx.quadraticCurveTo(40,-30,100,-6);cx.quadraticCurveTo(118,4,100,12);
  cx.quadraticCurveTo(40,38,-30,32);cx.quadraticCurveTo(-95,34,-110,6);cx.closePath();cx.fill();cx.stroke();
  cx.strokeStyle="rgba(120,255,230,.8)";cx.lineWidth=1.5;cx.beginPath();cx.moveTo(-95,8);cx.lineTo(95,4);cx.stroke();
  cx.fillStyle="#b58cff";cx.beginPath();cx.ellipse(-100,6,6,10,0,0,7);cx.fill();
  cx.restore();
}
function sentinels(){
  for(let i=0;i<3;i++){
    const x=W*(.2+i*.27)+Math.sin(T/90+i*2)*50,y=H*(.62+i*.04)+Math.cos(T/70+i)*18;
    cx.save();cx.translate(x,y);
    const g=cx.createLinearGradient(0,0,0,70);g.addColorStop(0,"rgba(255,190,60,.45)");g.addColorStop(1,"rgba(255,190,60,0)");
    cx.fillStyle=g;cx.beginPath();cx.moveTo(-3,0);cx.lineTo(3,0);cx.lineTo(16,70);cx.lineTo(-16,70);cx.fill();
    cx.fillStyle="#d6a64a";cx.strokeStyle="#fff2c0";cx.lineWidth=1;
    cx.beginPath();cx.moveTo(-14,0);cx.lineTo(0,-6);cx.lineTo(14,0);cx.lineTo(0,5);cx.closePath();cx.fill();cx.stroke();
    cx.fillStyle="#fff";cx.beginPath();cx.arc(0,0,1.8,0,7);cx.fill();cx.restore();
  }
}
function pelicanFly(){
  if(!pelican&&Math.random()<.0018)pelican={x:-60,y:H*rnd(.2,.6),v:rnd(2.2,3)};
  if(!pelican)return;pelican.x+=pelican.v;const p=pelican;
  cx.save();cx.translate(p.x,p.y);cx.fillStyle="#7b8696";cx.strokeStyle="#c9d4e2";cx.lineWidth=.8;
  cx.beginPath();cx.moveTo(0,0);cx.lineTo(26,-3);cx.lineTo(34,0);cx.lineTo(26,4);cx.closePath();cx.fill();cx.stroke();
  cx.fillRect(8,-8,8,5);cx.fillRect(8,4,8,5);
  cx.fillStyle="rgba(88,225,255,.9)";cx.fillRect(-10,-1.5,10,3);cx.restore();
  if(p.x>W+80)pelican=null;
}
function slipspace(){
  if(!rupture&&Math.random()<.0007)rupture={x:rnd(W*.1,W*.9),y:rnd(H*.1,H*.5),t:0};
  if(!rupture)return;const r=rupture;r.t++;const k=r.t/90;
  cx.save();cx.globalAlpha=Math.max(0,1-k);
  cx.strokeStyle="#c58bff";cx.lineWidth=3;cx.shadowColor="#a05bff";cx.shadowBlur=20;
  cx.beginPath();cx.arc(r.x,r.y,k*120,0,7);cx.stroke();
  cx.fillStyle=`rgba(200,150,255,${Math.max(0,.6-k)})`;cx.beginPath();cx.arc(r.x,r.y,Math.max(0,24-k*30),0,7);cx.fill();cx.restore();
  if(r.t>90)rupture=null;
}

// ---------- clickable easter eggs ----------
const QUOTES={
  spark:["Greetings! I am the Monitor of Installation 04. I am 343 Guilty Spark.","You are the Reclaimer. I have been waiting for you!"],
  cortana:["Wake me when you need me.","Finish the fight, Chief.","Don't make a girl a promise if you know you can't keep it."],
  skull:["SKULL FOUND — Grunt Birthday Party. Headshots now release confetti!"],
  s117:["Spartan-117. \"I need a weapon.\""]
};
const toast=document.createElement("div");toast.id="toast";document.body.append(toast);let toastT;
function say(k){const q=QUOTES[k];toast.textContent=q[Math.floor(Math.random()*q.length)];toast.classList.add("on");clearTimeout(toastT);toastT=setTimeout(()=>toast.classList.remove("on"),3800)}
function party(x,y){for(let i=0;i<90;i++)confetti.push({x,y,vx:rnd(-4,4),vy:rnd(-7,-1),c:`hsl(${Math.random()*360},90%,60%)`,l:0})}
function drawEggs(){
  const m=Math.min(W,H);eggs=[];
  // 343 Guilty Spark: floating Monitor
  let x=W*.9+Math.sin(T/60)*6,y=H*.7+Math.cos(T/50)*8,r=m*.025+8;
  cx.save();cx.translate(x,y);let g=cx.createRadialGradient(0,0,0,0,0,r*2.4);g.addColorStop(0,"rgba(90,190,255,.55)");g.addColorStop(1,"rgba(90,190,255,0)");
  cx.fillStyle=g;cx.beginPath();cx.arc(0,0,r*2.4,0,7);cx.fill();
  cx.fillStyle="#e8f1f8";cx.strokeStyle="#7fa5c4";cx.lineWidth=1.5;cx.beginPath();cx.arc(0,0,r,0,7);cx.fill();cx.stroke();
  cx.fillStyle="#0b1a33";cx.beginPath();cx.arc(0,0,r*.5,0,7);cx.fill();cx.fillStyle="#58e1ff";cx.beginPath();cx.arc(Math.sin(T/40)*r*.15,0,r*.28,0,7);cx.fill();cx.restore();
  eggs.push({id:"spark",x,y,r:r*1.6});
  // Cortana: holographic figure
  x=W*.05;y=H*.72+Math.sin(T/70)*5;
  cx.save();cx.translate(x,y);cx.strokeStyle="rgba(120,200,255,.9)";cx.shadowColor="#58e1ff";cx.shadowBlur=12;cx.lineWidth=1.2;
  for(let i=0;i<14;i++){const yy=-34+i*5,w=Math.sin((i/14)*Math.PI)*12+3;cx.globalAlpha=.45+.4*Math.sin(T/10+i);cx.beginPath();cx.ellipse(0,yy,w,2.2,0,0,7);cx.stroke()}
  cx.restore();eggs.push({id:"cortana",x,y:y-8,r:34});
  // Oddball / Grunt Birthday Party skull
  x=W*.5+Math.sin(T/120)*W*.04;y=H*.9+Math.cos(T/45)*4;
  cx.save();cx.translate(x,y);cx.globalAlpha=.8;cx.fillStyle="#ffc83d";cx.shadowColor="#ffc83d";cx.shadowBlur=10;
  cx.beginPath();cx.arc(0,-3,9,0,7);cx.fill();cx.fillRect(-5,3,10,6);cx.fillStyle="#02030a";cx.beginPath();cx.arc(-3.5,-3,2.2,0,7);cx.arc(3.5,-3,2.2,0,7);cx.fill();
  cx.fillRect(-3,4,1.5,5);cx.fillRect(1.5,4,1.5,5);cx.restore();
  eggs.push({id:"skull",x,y,r:20});
  eggs.push({id:"s117",x:W*.06+28,y:H*.1-8,r:38});
}
function drawConfetti(){
  confetti=confetti.filter(c=>c.l<120);
  for(const c of confetti){c.l++;c.x+=c.vx;c.y+=c.vy;c.vy+=.18;cx.fillStyle=c.c;cx.fillRect(c.x,c.y,5,3)}
}
function hit(e){const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;return eggs.find(g=>Math.hypot(g.x-x,g.y-y)<g.r)}
addEventListener("click",e=>{if(e.target.closest&&e.target.closest("button"))return;const g=hit(e);if(!g)return;say(g.id);if(g.id==="skull")party(g.x,g.y);sfxEgg()});
addEventListener("mousemove",e=>{document.body.style.cursor=hit(e)?"pointer":""});
function sfxEgg(){try{typeof beep==="function"&&(beep(660,.1,"sine"),setTimeout(()=>beep(990,.2,"sine"),90))}catch{}}

// ---------- main loop ----------
function frame(){
  T++;cx.drawImage(scene,0,0);
  for(const s of stars){s.y+=s.s;if(s.y>H){s.y=0;s.x=rnd(0,W)}
    cx.fillStyle=`rgba(210,232,255,${.3+.45*Math.abs(Math.sin(T/60+s.p))})`;cx.beginPath();cx.arc(s.x,s.y,s.r,0,7);cx.fill()}
  cruiser();autumn();sentinels();pelicanFly();slipspace();
  if(Math.random()<.005)shots.push({x:rnd(0,W),y:rnd(0,H*.4),l:0});
  shots=shots.filter(s=>s.l<40);for(const s of shots){s.l++;s.x+=12;s.y+=5;
    const g=cx.createLinearGradient(s.x,s.y,s.x-70,s.y-29);g.addColorStop(0,"rgba(255,255,255,.9)");g.addColorStop(1,"rgba(255,255,255,0)");
    cx.strokeStyle=g;cx.lineWidth=2;cx.beginPath();cx.moveTo(s.x,s.y);cx.lineTo(s.x-70,s.y-29);cx.stroke()}
  drawEggs();drawConfetti();
  requestAnimationFrame(frame);
}
frame();
