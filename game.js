const MAX_HINTS = 3, HINT_COST = 25, PARTS = 6;
const DIFF = {easy:{lives:6, base:100, ok:w=>w.length<=7}, hard:{lives:4, base:200, ok:w=>w.length>=8}};
let diff = "easy", MAX_WRONG = 6;
const save = (k,v)=>{try{localStorage.setItem(k,v)}catch{}}, load = k=>{try{return localStorage.getItem(k)}catch{return null}};
const $ = id => document.getElementById(id);
const S = {mission:0, score:0, streak:0, hints:MAX_HINTS, pool:[], word:"", cat:"", guessed:new Set(), wrong:0, over:true, hinted:new Set(), usedHints:0};

// --- sound (WebAudio, no assets) ---
let ac;
function beep(f, d=.12, type="square", v=.05){
  try{ ac ||= new AudioContext(); const o=ac.createOscillator(), g=ac.createGain();
    o.type=type; o.frequency.value=f; g.gain.value=v; g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime+d);
    o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime+d);}catch{}
}
const sfx = {hit:()=>beep(880,.12,"sine"), miss:()=>beep(110,.25,"sawtooth"), hint:()=>{beep(520,.1);setTimeout(()=>beep(780,.15),100)},
  win:()=>[523,659,784,1046].forEach((f,i)=>setTimeout(()=>beep(f,.25,"triangle"),i*120)),
  lose:()=>[330,262,196,131].forEach((f,i)=>setTimeout(()=>beep(f,.3,"sawtooth"),i*180))};

// --- game flow ---
function show(id){["start","game","end"].forEach(x=>$(x).hidden=x!==id);}
function newRun(){MAX_WRONG=DIFF[diff].lives;$("diffTag").textContent=diff.toUpperCase();S.mission=0;S.score=0;S.streak=0;S.hints=MAX_HINTS;S.pool=[];$("hud").hidden=false;nextWord();}
function nextWord(){
  if(!S.pool.length) S.pool=WORDS.filter(w=>DIFF[diff].ok(w[0])).sort(()=>Math.random()-.5);
  [S.word,S.cat,S.fact]=S.pool.pop();
  S.mission++;S.guessed=new Set();S.hinted=new Set();S.usedHints=0;S.wrong=0;S.over=false;
  $("category").textContent="CLASSIFICATION: "+S.cat.toUpperCase();
  $("msg").textContent="Pick a letter, Spartan.";
  const k=$("keys");k.innerHTML="";
  for(const c of "ABCDEFGHIJKLMNOPQRSTUVWXYZ"){const b=document.createElement("button");b.className="key";b.textContent=c;b.id="k"+c;b.onclick=()=>guess(c);k.append(b)}
  document.querySelectorAll(".part").forEach(p=>p.classList.remove("on"));
  render();show("game");
}
function render(){
  $("word").innerHTML=[...S.word].map(c=>{const on=S.guessed.has(c)||S.over&&S.wrong>=MAX_WRONG;
    return `<div class="ch${on?" show":""}${S.hinted.has(c)&&on?" hint":""}">${on?c:""}</div>`}).join("");
  $("mission").textContent=S.mission;$("score").textContent=S.score;$("streak").textContent=S.streak;
  $("hintsLeft").textContent=S.hints;$("hintCount").textContent=S.hints;$("hintBtn").disabled=S.hints<=0||S.over;
  const pct=(MAX_WRONG-S.wrong)/MAX_WRONG*100, b=$("shieldBar");b.style.width=pct+"%";
  b.style.background=pct<=34?"linear-gradient(90deg,#ff2d2d,#ff8a3d)":"";
}
function guess(c, viaHint=false){
  if(S.over||S.guessed.has(c))return;
  S.guessed.add(c);const k=$("k"+c);k.disabled=true;
  if(S.word.includes(c)){
    k.classList.add("hit");sfx.hit();
    $("msg").textContent=viaHint?"Intel decrypted.":"Direct hit!";
    if([...S.word].every(x=>S.guessed.has(x)))return win();
  }else{
    k.classList.add("miss");sfx.miss();S.wrong++;
    // Easy: one part per miss. Hard (4 misses): head, body, both arms, both legs.
    const stages=MAX_WRONG===PARTS?[[1],[2],[3],[4],[5],[6]]:[[1],[2],[3,4],[5,6]];
    stages.slice(0,S.wrong).flat().forEach(i=>$("p"+i).classList.add("on"));
    $("msg").textContent="Shields taking damage!";
    document.querySelector(".stage").classList.remove("shake");void document.querySelector(".stage").offsetWidth;document.querySelector(".stage").classList.add("shake");
    if(S.wrong>=MAX_WRONG)return lose();
  }
  render();
}
function hint(){
  if(S.hints<=0||S.over)return;
  const left=[...new Set(S.word)].filter(c=>!S.guessed.has(c));
  if(left.length<=1){$("msg").textContent="Final letter — you've got this.";return}
  const c=left[Math.floor(Math.random()*left.length)];
  S.hints--;S.usedHints++;S.hinted.add(c);sfx.hint();guess(c,true);
}
function finish(win,pts=0){
  S.over=true;render();
  const e=$("end");e.className="panel center "+(win?"win":"lose");
  $("endTitle").textContent=win?"MISSION ACCOMPLISHED":"GAME OVER";
  $("endWord").textContent=(win?"Transmission decoded: ":"The word was: ")+S.word;
  $("fact").textContent=win?S.fact:"";$("fact").hidden=!win;
  const key="best-"+diff, best=+load(key)||0;
  if(S.score>best)save(key,S.score);
  $("endStats").innerHTML=win
    ?`+${pts} pts${S.usedHints?` (${S.usedHints} hint${S.usedHints>1?"s":""} × -${HINT_COST})`:" (no hints — full marks!)"}<br>Total ${S.score} · Hints left ${S.hints}`
    :`Mission failed. Final score ${S.score} · Missions cleared ${S.mission-1}<br>Returning to the beginning...`;
  $("endBtn").textContent=win?"NEXT MISSION":"RETURN TO BASE";
  $("endBtn").onclick=win?nextWord:toTitle;
  setTimeout(()=>show("end"),win?600:1400);
}
function win(){
  const pts=Math.max(0,DIFF[diff].base-HINT_COST*S.usedHints);
  S.score+=pts;S.streak++;sfx.win();finish(true,pts);
}
function lose(){S.streak=0;sfx.lose();$("msg").textContent="Shields down!";finish(false)}
function toTitle(){$("hud").hidden=true;showBest();show("start")}
function showBest(){const b=+load("best-"+diff)||0;$("best").textContent=b?`BEST (${diff.toUpperCase()}): ${b}`:""}
document.querySelectorAll(".diffBtn").forEach(b=>b.onclick=()=>{
  diff=b.dataset.d;document.querySelectorAll(".diffBtn").forEach(x=>x.classList.toggle("sel",x===b));showBest()});
showBest();

$("startBtn").onclick=newRun;$("hintBtn").onclick=hint;
addEventListener("keydown",e=>{if(!$("game").hidden&&/^[a-z]$/i.test(e.key))guess(e.key.toUpperCase())});
