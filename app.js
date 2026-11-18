/* ====== 粒子背景 ====== */
const cvs = document.getElementById('canvas');
const ctx = cvs.getContext('2d');
let W, H, DPR;
function resize(){
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = cvs.clientWidth; H = cvs.clientHeight;
  cvs.width = W * DPR; cvs.height = H * DPR;
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
window.addEventListener('resize', resize);
resize();

const PARTS = [];
function initParts(){
  PARTS.length = 0;
  const n = Math.round(Math.min(70, (W*H)/16000));
  for(let i=0;i<n;i++){
    PARTS.push({
      x: Math.random()*W, y: Math.random()*H,
      r: Math.random()*2.2 + 0.6,
      vx: (Math.random()-0.5)*0.22,
      vy: -Math.random()*0.35 - 0.08,
      a: Math.random()*0.45 + 0.18,
      hue: Math.random() < 0.45 ? 345 : 25,
      ph: Math.random()*Math.PI*2
    });
  }
}
initParts();
window.addEventListener('resize', initParts);

let mouseX = -9999, mouseY = -9999;
window.addEventListener('pointermove', e=>{ mouseX = e.clientX; mouseY = e.clientY; });
window.addEventListener('pointerleave', ()=>{ mouseX = -9999; mouseY = -9999; });

const trail = [];
let t = 0;
function loop(){
  t += 0.016;
  ctx.clearRect(0,0,W,H);

  for(const p of PARTS){
    const dx = p.x - mouseX, dy = p.y - mouseY;
    const d2 = dx*dx + dy*dy;
    if(d2 < 14000 && d2 > 1){
      const d = Math.sqrt(d2);
      const f = (118 - d) / 118 * 1.8;
      p.x += (dx/d) * f;
      p.y += (dy/d) * f;
    }
    p.x += p.vx + Math.sin(t + p.ph)*0.12;
    p.y += p.vy;
    if(p.y < -20){ p.y = H + 20; p.x = Math.random()*W; }
    if(p.x < -20) p.x = W + 20;
    if(p.x > W+20) p.x = -20;

    const glow = Math.sin(t*1.6 + p.ph)*0.22 + 0.78;
    ctx.beginPath();
    ctx.fillStyle = 'hsla(' + p.hue + ', 80%, 78%, ' + (p.a*glow) + ')';
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = 'hsla(' + p.hue + ', 90%, 82%, ' + (p.a*glow*0.14) + ')';
    ctx.arc(p.x, p.y, p.r*3.4, 0, Math.PI*2);
    ctx.fill();
  }

  if(mouseX > -999 && trail.length < 50){
    trail.push({x:mouseX, y:mouseY, vx:(Math.random()-0.5)*1.1,
      vy:Math.random()*0.6+0.2, r:Math.random()*3+1.6, life:1,
      hue: Math.random()<0.6?345:20});
  }
  for(let i=trail.length-1;i>=0;i--){
    const m = trail[i];
    m.x += m.vx; m.y += m.vy; m.vy += 0.014; m.life -= 0.018;
    if(m.life <= 0){ trail.splice(i,1); continue; }
    ctx.beginPath();
    ctx.fillStyle = 'hsla(' + m.hue + ', 85%, 80%, ' + (m.life*0.55) + ')';
    ctx.arc(m.x, m.y, m.r*m.life, 0, Math.PI*2);
    ctx.fill();
  }

  requestAnimationFrame(loop);
}
loop();

/* ====== 场景切换 ====== */
const s0 = document.getElementById('s0');
const chapters = document.getElementById('chapters');
const finalScene = document.getElementById('final');
const bgGrad = document.getElementById('bgGrad');

function show(el){
  [s0, chapters, finalScene].forEach(x=>x.classList.remove('active'));
  el.classList.add('active');
}

function ripple(x,y){
  const d = document.createElement('div');
  d.className = 'ripple';
  d.style.left = x+'px'; d.style.top = y+'px';
  d.style.width = '0px'; d.style.height = '0px';
  d.style.marginLeft = '0'; d.style.marginTop = '0';
  document.body.appendChild(d);
  setTimeout(()=>d.remove(), 950);
}

function burst(x, y, count, chars){
  const list = chars ? Array.from(chars) : ['❀','✦','♡','🌸'];
  for(let i=0;i<count;i++){
    const el = document.createElement('div');
    el.textContent = list[Math.floor(Math.random()*list.length)];
    el.style.cssText = 'position:fixed;left:'+x+'px;top:'+y+'px;z-index:40;' +
      'pointer-events:none;font-size:'+(10+Math.random()*16)+'px;will-change:transform,opacity';
    document.body.appendChild(el);
    const ang = Math.random()*Math.PI*2;
    const sp = 60 + Math.random()*160;
    const dx = Math.cos(ang)*sp, dy = Math.sin(ang)*sp - 40;
    el.animate([
      {transform:'translate(0,0) scale(.4) rotate(0deg)', opacity:0},
      {transform:'translate('+(dx*0.42)+'px,'+(dy*0.42)+'px) scale(1) rotate(120deg)', opacity:1, offset:.28},
      {transform:'translate('+dx+'px,'+(dy+90)+'px) scale(.55) rotate(320deg)', opacity:0}
    ], {duration: 1000 + Math.random()*700, easing:'cubic-bezier(.2,.7,.3,1)'})
    .onfinish = ()=> el.remove();
  }
}

/* ====== 开场 ====== */
let started = false;
const gift = document.getElementById('gift');
gift.addEventListener('click', function(e){
  if(started) return;
  started = true;
  burst(e.clientX || W/2, e.clientY || H/2, 26, '🍑');
  ripple(e.clientX || W/2, e.clientY || H/2);
  gift.style.transform = 'scale(0.86)';
  // 点桃子（用户手势）时尝试播放背景音乐
  try{
    if(typeof playBgm === 'function') playBgm();
  }catch(err){}
  setTimeout(function(){
    show(chapters);
    goChapter(0);
    bgGrad.classList.add('warm');
  }, 420);
});

/* ====== 章节 ====== */
const chEls = Array.prototype.slice.call(document.querySelectorAll('.chapter'));
const dotWrap = document.getElementById('progress');
const counter = document.getElementById('counter');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const tapnote = document.getElementById('tapnote');
const backBtn = document.getElementById('backBtn');
let cur = 0;

chEls.forEach(function(){
  const d = document.createElement('div');
  d.className = 'dot';
  dotWrap.appendChild(d);
});
const dots = Array.prototype.slice.call(dotWrap.children);

const notes = [
  '轻轻滑动，或点"下一步"',
  '这些心事，慢慢来',
  '现实没那么可怕',
  '把"现在"握紧一点',
  '最后一句了'
];

function goChapter(i){
  if(i < 0 || i >= chEls.length) return;
  cur = i;
  chEls.forEach(function(el, k){ el.classList.toggle('active', k === i); });
  dots.forEach(function(d, k){ d.classList.toggle('on', k === i); });
  counter.textContent = (i+1) + ' / ' + chEls.length;
  prevBtn.style.visibility = i === 0 ? 'hidden' : 'visible';
  nextBtn.textContent = i === chEls.length-1 ? '看最后一句 →' : '下一步';
  tapnote.textContent = notes[i] || '';

  const active = chEls[i];
  Array.prototype.forEach.call(active.querySelectorAll('.reveal'), function(r, k){
    r.style.animation = 'none';
    void r.offsetWidth;
    r.style.animation = '';
    r.style.animationDelay = (0.12 + k*0.16) + 's';
  });
}

prevBtn.addEventListener('click', function(e){
  if(cur > 0){
    goChapter(cur-1);
    burst(e.clientX, e.clientY, 8, '✦');
  }
});

function createStars(){
  for(let i=0;i<46;i++){
    const el = document.createElement('div');
    el.className = 'star';
    const size = 1 + Math.random()*2;
    el.style.width = size+'px';
    el.style.height = size+'px';
    el.style.left = Math.random()*100 + 'vw';
    el.style.top = Math.random()*100 + 'vh';
    el.style.animationDelay = (Math.random()*2.4)+'s';
    document.body.appendChild(el);
  }
}

function petalShower(n){
  const chars = ['🌸','❀','✿','❁','♡'];
  for(let i=0;i<n;i++){
    setTimeout(function(){
      const el = document.createElement('div');
      el.className = 'petal';
      el.textContent = chars[Math.floor(Math.random()*chars.length)];
      el.style.left = Math.random()*100 + 'vw';
      el.style.fontSize = (10 + Math.random()*14) + 'px';
      el.style.animationDuration = (4 + Math.random()*4) + 's';
      document.body.appendChild(el);
      setTimeout(function(){ el.remove(); }, 9000);
    }, i*160);
  }
}

nextBtn.addEventListener('click', function(e){
  burst(e.clientX, e.clientY, 12, '♡');
  if(cur < chEls.length-1){
    goChapter(cur+1);
  }else{
    show(finalScene);
    bgGrad.classList.add('night');
    createStars();
    petalShower(18);
    // 进入终章：音乐缓缓退到背景，把空间留给心跳
    fadeTo(0.26, 2600);
  }
});

backBtn.addEventListener('click', function(){
  bgGrad.classList.remove('night');
  bgGrad.classList.add('warm');
  show(chapters);
  goChapter(0);
  // 回到正篇，音乐恢复原音量
  fadeTo(0.72, 1400);
});

/* 键盘 */
window.addEventListener('keydown', function(e){
  if(!chapters.classList.contains('active')) return;
  if(e.key === 'ArrowRight' || e.key === ' '){ e.preventDefault(); nextBtn.click(); }
  if(e.key === 'ArrowLeft'){ e.preventDefault(); if(cur>0) goChapter(cur-1); }
});

/* 滑动 */
let touchX = 0, touchY = 0, tracking = false;
chapters.addEventListener('touchstart', function(e){
  touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; tracking = true;
}, {passive:true});
chapters.addEventListener('touchend', function(e){
  if(!tracking) return;
  tracking = false;
  const dx = e.changedTouches[0].clientX - touchX;
  const dy = e.changedTouches[0].clientY - touchY;
  if(Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)*1.5){
    if(dx < 0 && cur < chEls.length-1) goChapter(cur+1);
    if(dx > 0 && cur > 0) goChapter(cur-1);
  }
}, {passive:true});

/* ====== 终章 ====== */
const heartBtn = document.getElementById('heartBtn');
const beatCount = document.getElementById('beatCount');
let beats = 0;

function flyHearts(n){
  const chars = ['💗','💖','🌸','✨','❣️'];
  for(let i=0;i<n;i++){
    setTimeout(function(){
      const el = document.createElement('div');
      el.className = 'flyheart';
      el.textContent = chars[Math.floor(Math.random()*chars.length)];
      el.style.left = (8 + Math.random()*84) + 'vw';
      el.style.top  = (58 + Math.random()*26) + 'vh';
      el.style.setProperty('--dx', (Math.random()*160-80)+'px');
      el.style.setProperty('--rot', (Math.random()*200-100)+'deg');
      el.style.fontSize = (14 + Math.random()*20) + 'px';
      document.body.appendChild(el);
      setTimeout(function(){ el.remove(); }, 2600);
    }, i*90);
  }
}

heartBtn.addEventListener('click', function(e){
  beats++;
  beatCount.textContent = beats;
  burst(e.clientX, e.clientY, 20, '💗💖❣️');
  ripple(e.clientX, e.clientY);
  flyHearts(5);

  /* 心跳的"压一下"：音乐短暂下沉，再慢慢浮回来 */
  if(!bgm.paused){
    fadeTo(0.15, 260);
    setTimeout(function(){ fadeTo(0.26, 1100); }, 300);
  }

  heartBtn.animate([
    {transform:'scale(1)'},
    {transform:'scale(1.22)'},
    {transform:'scale(0.94)'},
    {transform:'scale(1)'}
  ], {duration:520, easing:'cubic-bezier(.3,1.5,.5,1)'});

  if(beats % 10 === 0){
    burst(window.innerWidth/2, window.innerHeight/2, 46, '💗💖✨🌸');
    petalShower(24);
  }
});

/* ====== 初始化 ====== */
goChapter(0);

/* ====== 音乐播放器 ====== */
const bgm = document.getElementById('bgm');
const musicFab = document.getElementById('musicFab');
const musicPanel = document.getElementById('musicPanel');
const mpClose = document.getElementById('mpClose');
const mpPlayLocal = document.getElementById('mpPlayLocal');
const mpTip = document.getElementById('mpTip');
const mpOpen = document.getElementById('mpOpenQishui');

let bgmReady = false;       // 本地音频是否存在
let bgmTried = false;       // 是否已尝试加载
let fadeTimer = null;

// 检测本地 bgm.mp3 是否可加载
function checkBgm(cb){
  if(bgmTried){ cb(bgmReady); return; }
  bgmTried = true;
  const done = function(ok){
    bgmReady = ok;
    cb(ok);
  };
  // 若 already loaded 有 duration
  if(bgm.readyState >= 1 && bgm.duration > 0){ done(true); return; }
  const t = setTimeout(function(){ done(false); }, 2500);
  bgm.addEventListener('loadedmetadata', function(){
    clearTimeout(t);
    done(bgm.duration > 0 && isFinite(bgm.duration));
  }, {once:true});
  bgm.addEventListener('error', function(){
    clearTimeout(t);
    done(false);
  }, {once:true});
  try{ bgm.load(); }catch(e){ clearTimeout(t); done(false); }
}

// 音量渐入
function fadeIn(target, ms){
  if(fadeTimer) clearInterval(fadeTimer);
  target = target || 0.75;
  ms = ms || 1800;
  bgm.volume = 0;
  const step = target / (ms / 60);
  fadeTimer = setInterval(function(){
    if(bgm.volume + step >= target){
      bgm.volume = target;
      clearInterval(fadeTimer); fadeTimer = null;
    }else{
      bgm.volume = Math.min(target, bgm.volume + step);
    }
  }, 60);
}

function setPlayingUI(on){
  musicFab.classList.toggle('playing', !!on);
  musicPanel.classList.toggle('spinning', !!on);
}

/* 音量平滑过渡到目标值 */
function fadeTo(target, ms){
  if(fadeTimer){ clearInterval(fadeTimer); fadeTimer = null; }
  if(bgm.paused) return;
  ms = ms || 1800;
  const from = bgm.volume;
  const steps = Math.max(1, Math.round(ms / 60));
  let i = 0;
  fadeTimer = setInterval(function(){
    i++;
    const k = i / steps;
    // easeInOut
    const e = k < 0.5 ? 2*k*k : 1 - Math.pow(-2*k + 2, 2) / 2;
    bgm.volume = Math.max(0, Math.min(1, from + (target - from) * e));
    if(i >= steps){
      bgm.volume = target;
      clearInterval(fadeTimer); fadeTimer = null;
    }
  }, 60);
}

function playBgm(){
  const p = bgm.play();
  if(p && p.catch){
    p.then(function(){
      setPlayingUI(true);
      fadeIn(0.72, 2000);
    }).catch(function(){
      setPlayingUI(false);
    });
  }else{
    setPlayingUI(true);
    fadeIn(0.72, 2000);
  }
}

function pauseBgm(){
  bgm.pause();
  setPlayingUI(false);
}

// 点击悬浮按钮
musicFab.addEventListener('click', function(){
  checkBgm(function(ok){
    if(ok){
      if(bgm.paused) playBgm();
      else pauseBgm();
    }else{
      musicPanel.classList.add('open');
    }
  });
});

// 面板：播放本地
mpPlayLocal.addEventListener('click', function(){
  checkBgm(function(ok){
    if(ok){
      playBgm();
      musicPanel.classList.remove('open');
    }else{
      // 本地没有音频 → 引导去汽水音乐
      mpTip.innerHTML = '没有检测到本地音频文件。<br>' +
        '<span>把它导出成 <b>bgm.mp3</b> 放进本文件夹，就能在这里直接播了。</span>';
      mpTip.style.color = '#ff7b9c';
    }
  });
});

// 关闭面板
mpClose.addEventListener('click', function(){ musicPanel.classList.remove('open'); });
musicPanel.addEventListener('click', function(e){
  if(e.target === musicPanel) musicPanel.classList.remove('open');
});

// 页面可见性：切走自动暂停
document.addEventListener('visibilitychange', function(){
  if(document.hidden && !bgm.paused) bgm.pause();
});

// 预检一次
checkBgm(function(ok){
  if(!ok){
    // 没本地音频：给悬浮按钮加个小角标提示，引导用户点击
    musicFab.setAttribute('data-tip', '1');
    musicFab.title = '点这里放歌';
  }else{
    musicFab.title = '播放 / 暂停背景音乐';
  }
});