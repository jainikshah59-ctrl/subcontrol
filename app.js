/* SubControl landing interactions — vanilla JS, no dependencies */
(function(){
"use strict";
/* flag JS availability FIRST — CSS hides the hero only when .js is present,
   so a stale-cached or failed script can never leave the hero blank */
document.documentElement.classList.add("js");
var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- configurable placeholders (never fake live numbers) ---------- */
var CONFIG = {
  socialProofCount: null, // e.g. 1247 once a real waitlist count exists; null hides the number
  socialProofLabel: "people getting early access"
};
(function(){
  var el = document.getElementById("social-proof");
  if (el && typeof CONFIG.socialProofCount === "number" && CONFIG.socialProofCount > 0) {
    el.childNodes[0].textContent = "Join " + CONFIG.socialProofCount.toLocaleString("en-US") + "+ " + CONFIG.socialProofLabel;
  }
})();

/* ---------- mobile nav ---------- */
var toggle = document.querySelector(".nav-toggle");
var mobile = document.querySelector(".nav-mobile");
if (toggle && mobile) {
  toggle.addEventListener("click", function(){
    var open = mobile.hidden;
    mobile.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  });
  mobile.querySelectorAll("a").forEach(function(a){
    a.addEventListener("click", function(){ mobile.hidden = true; toggle.setAttribute("aria-expanded","false"); });
  });
}

/* ---------- demo subscription data ---------- */
var BRANDS = {
  netflix: { svg:"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"m5.398 0 8.348 23.602c2.346.059 4.856.398 4.856.398L10.113 0H5.398zm8.489 0v9.172l4.715 13.33V0h-4.715zM5.398 1.5V24c1.873-.225 2.81-.312 4.715-.398V14.83L5.398 1.5z\"/></svg>", c1:"#232323", c2:"#000000", glyph:"#E50914" },
  spotify: { svg:"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z\"/></svg>", c1:"#1DB954", c2:"#0e7a37", glyph:"#191414" },
  peloton: { svg:"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M17.7283 5.7642l1.7307-3.0066c.5045-.8803.2077-2.0077-.6725-2.5121-.8802-.5044-2.0077-.2077-2.5121.6725l-1.7407 3.0066c-3.699-1.167-7.843.3462-9.8606 3.8473-1.2857 2.2253-1.444 4.7869-.6626 7.032l3.2044-5.5583c.732-1.2759 1.9286-2.1858 3.3528-2.5715 1.4242-.3857 2.9078-.188 4.1836.5539 2.6308 1.523 3.5407 4.9055 2.0176 7.5363-1.523 2.6308-4.8957 3.5407-7.5364 2.0176l1.8396-3.1846c.8803.5044 2.0077.2077 2.5122-.6726.5044-.8802.2076-2.0077-.6726-2.512-.8802-.5045-2.0077-.2078-2.5121.6725l-5.855 10.1572c-.5044.8803-.2077 2.0077.6725 2.5121.8802.5044 2.0077.2077 2.5121-.6725L9.47 20.0754c3.699 1.167 7.843-.3462 9.8606-3.8473 2.0176-3.4913 1.256-7.833-1.6022-10.4639z\"/></svg>", c1:"#1f1f22", c2:"#000000", glyph:"#ffffff" },
  youtube: { svg:"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z\"/></svg>", c1:"#FF0000", c2:"#c40000", glyph:"#ffffff" },
  apple: { svg:"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701\"/></svg>", c1:"#26262b", c2:"#000000", glyph:"#ffffff" },
  hbomax: { svg:"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M3.784 8.716c-.655 0-1.32.29-2.173.946v-.78H0v6.236h1.715V11.24c.749-.592 1.091-.78 1.372-.78.333 0 .551.209.551.729v3.928h1.715V11.23c.748-.582 1.081-.769 1.372-.769.333 0 .55.208.55.728v3.928H8.99v-4.53c0-1.403-.8-1.871-1.57-1.871-.654 0-1.32.27-2.192.936-.28-.697-.894-.936-1.444-.936zm8.689 0c-1.705 0-3.118 1.466-3.118 3.284 0 1.82 1.413 3.285 3.118 3.285.842 0 1.57-.312 2.131-.988v.82h1.632V8.883h-1.632v.822c-.561-.676-1.29-.988-2.131-.988zm4.064.166c.707 1.102 1.507 2.09 2.443 3.077a26.593 26.593 0 0 0-2.443 3.16h2.069a13.603 13.603 0 0 1 1.673-2.183 14.067 14.067 0 0 1 1.632 2.182H24a25.142 25.142 0 0 0-2.432-3.16A23.918 23.918 0 0 0 24 8.883h-2.047a14.65 14.65 0 0 1-1.674 2.11 13.357 13.357 0 0 1-1.674-2.11zm-3.804 1.279c1.018 0 1.84.82 1.84 1.84a1.837 1.837 0 0 1-1.84 1.839c-1.019 0-1.84-.82-1.84-1.84 0-1.018.821-1.84 1.84-1.84zm0 .415c-.78 0-1.414.633-1.414 1.423s.634 1.424 1.413 1.424c.78 0 1.414-.634 1.414-1.424s-.634-1.424-1.414-1.424z\"/></svg>", c1:"#1c1c1f", c2:"#000000", glyph:"#ffffff" },
};
var SUBS = {
  netflix: { name:"Netflix", plan:"Premium plan", price:24.99, freq:"month", renew:"October 12", renewIn:"3 days", annual:299.88, bill:"Monthly · Card •• 4242", brand:"netflix" },
  spotify: { name:"Spotify", plan:"Individual", price:11.99, freq:"month", renew:"October 17", renewIn:"8 days", annual:143.88, bill:"Monthly · Card •• 4242", brand:"spotify" },
  peloton: { name:"Peloton", plan:"All-Access Membership", price:44.00, freq:"month", renew:"October 23", renewIn:"14 days", annual:528.00, bill:"Monthly · Card •• 8791", brand:"peloton" },
  youtube: { name:"YouTube Premium", plan:"Individual", price:13.99, freq:"month", renew:"October 30", renewIn:"21 days", annual:167.88, bill:"Monthly · Card •• 3310", brand:"youtube" },
  icloud:  { name:"iCloud+", plan:"2TB storage", price:9.99, freq:"month", renew:"November 2", renewIn:"24 days", annual:119.88, bill:"Monthly · Card •• 4242", brand:"apple" },
  hbomax:  { name:"HBO Max", plan:"Ad-Free plan", price:16.99, freq:"month", renew:"November 9", renewIn:"31 days", annual:203.88, bill:"Monthly · Card •• 8791", brand:"hbomax" }
};
function money(n){ return "$" + n.toFixed(2); }

/* ---------- hero 3D parallax (lerped for buttery motion) ---------- */
var scene = document.getElementById("scene");
var heroScene = document.getElementById("hero-scene");
if (scene && heroScene && !reduceMotion && window.matchMedia("(pointer:fine)").matches) {
  var depths = [];
  scene.querySelectorAll("[data-depth]").forEach(function(el){
    depths.push({ el: el, d: parseFloat(el.getAttribute("data-depth")) || 20 });
  });
  var tx = 0, ty = 0, cx = 0, cy = 0, parRaf = null;
  function parApply(){
    scene.style.transform = "rotateY(" + (cx*10).toFixed(2) + "deg) rotateX(" + (-cy*8).toFixed(2) + "deg)";
    for (var i = 0; i < depths.length; i++) {
      var o = depths[i];
      /* write to CSS vars consumed by [data-depth]{transform:...} — keeps the
         `translate` property free for the bob keyframes (no layout thrash) */
      o.el.style.setProperty("--px", (cx*o.d).toFixed(1) + "px");
      o.el.style.setProperty("--py", (cy*o.d).toFixed(1) + "px");
    }
  }
  function parLoop(){
    cx += (tx - cx) * 0.085;
    cy += (ty - cy) * 0.085;
    parApply();
    if (Math.abs(tx - cx) > 0.0008 || Math.abs(ty - cy) > 0.0008) { parRaf = requestAnimationFrame(parLoop); }
    else { cx = tx; cy = ty; parApply(); parRaf = null; }
  }
  function parKick(){ if (parRaf === null) parRaf = requestAnimationFrame(parLoop); }
  heroScene.addEventListener("mousemove", function(e){
    var r = heroScene.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5;
    ty = (e.clientY - r.top) / r.height - 0.5;
    parKick();
  });
  heroScene.addEventListener("mouseleave", function(){ tx = 0; ty = 0; parKick(); });
}

/* ---------- count-up ---------- */
function countUp(el){
  var target = parseFloat(el.getAttribute("data-target"));
  var prefix = el.getAttribute("data-prefix") || "";
  var suffix = el.getAttribute("data-suffix") || "";
  var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
  if (reduceMotion) { el.textContent = prefix + target.toFixed(decimals) + suffix; return; }
  var start = null, dur = 1400;
  function fmt(v){ return prefix + v.toFixed(decimals) + suffix; }
  function tick(t){
    if (!start) start = t;
    var p = Math.min((t - start) / dur, 1);
    var e = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(target * e);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
var counted = new WeakSet();
var cio = new IntersectionObserver(function(entries){
  entries.forEach(function(en){
    if (en.isIntersecting && !counted.has(en.target)) { counted.add(en.target); countUp(en.target); cio.unobserve(en.target); }
  });
}, { threshold: 0.5 });
document.querySelectorAll(".count").forEach(function(el){ cio.observe(el); });

/* ---------- reveal on scroll ---------- */
/* section headers get reveals progressively (no-JS still shows them) */
document.querySelectorAll(".section .eyebrow, .section h2, .section .section-lede").forEach(function(el){
  el.classList.add("reveal");
});
var footGrid = document.querySelector(".foot-grid");
if (footGrid) footGrid.classList.add("reveal");

var rio = new IntersectionObserver(function(entries){
  entries.forEach(function(en){ if (en.isIntersecting) { en.target.classList.add("in"); rio.unobserve(en.target); } });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(function(el){
  if (!el.closest("[data-stagger],[data-stagger-fade]")) rio.observe(el);
});

/* ---------- stagger system: grid children rise in sequence ---------- */
(function staggerInit(){
  if (reduceMotion) return;
  document.querySelectorAll("[data-stagger],[data-stagger-fade]").forEach(function(g){
    g.classList.add("pre");
    var step = parseInt(g.getAttribute("data-stagger") || g.getAttribute("data-stagger-fade") || "90", 10);
    var so = new IntersectionObserver(function(es){
      es.forEach(function(en){
        if (!en.isIntersecting) return;
        var items = g.children;
        for (var i = 0; i < items.length; i++) {
          (function(it, idx){
            it.style.transitionDelay = (idx * step) + "ms";
            void it.offsetWidth;
            it.classList.add("in");
            var done = function(e){
              if (e.propertyName === "opacity" || e.propertyName === "transform") {
                it.style.transitionDelay = "";
                it.removeEventListener("transitionend", done);
              }
            };
            it.addEventListener("transitionend", done);
            setTimeout(function(){ it.style.transitionDelay = ""; }, step * items.length + 900);
          })(items[i], i);
        }
        so.unobserve(g);
      });
    }, { threshold: 0.15 });
    so.observe(g);
  });
})();

/* ---------- problem bars grow when visible ---------- */
if (!reduceMotion) {
  document.querySelectorAll(".bars").forEach(function(b){
    var bo = new IntersectionObserver(function(es){
      es.forEach(function(en){ if (en.isIntersecting) { b.classList.add("play"); bo.unobserve(b); } });
    }, { threshold: 0.4 });
    bo.observe(b);
  });
}

/* ---------- donut sweep ---------- */
(function donutInit(){
  var donuts = document.querySelectorAll(".donut");
  if (!donuts.length || reduceMotion) return;
  if (!(window.CSS && CSS.registerProperty)) return;
  try { CSS.registerProperty({ name: "--p", syntax: "<percentage>", inherits: false, initialValue: "100%" }); } catch(e){}
  donuts.forEach(function(d){ d.classList.add("pre"); });
  var dob = new IntersectionObserver(function(es){
    es.forEach(function(en){
      if (en.isIntersecting) { en.target.classList.remove("pre"); dob.unobserve(en.target); }
    });
  }, { threshold: 0.4 });
  donuts.forEach(function(d){ dob.observe(d); });
})();

/* ---------- mini dashboard ---------- */
var miniList = document.getElementById("mini-list");
if (miniList) {
  ["netflix","spotify","peloton","youtube","icloud"].forEach(function(key){
    var s = SUBS[key];
    var b = document.createElement("button");
    b.type = "button"; b.className = "mini-item"; b.setAttribute("data-sub", key);
    var bnd = BRANDS[s.brand];
    b.innerHTML = '<span class="sub-logo brand" style="--c1:' + bnd.c1 + ';--c2:' + bnd.c2 + ';--glyph:' + bnd.glyph + '">' + bnd.svg + '</span>' +
      '<span><strong>' + s.name + '</strong><em>Renews in ' + s.renewIn + '</em></span><b>' + money(s.price) + '</b>';
    b.addEventListener("click", function(){ openModal(key); });
    miniList.appendChild(b);
  });
}

/* ---------- subscription detail modal ---------- */
var modal = document.getElementById("modal");
var lastFocus = null;
function openModal(key){
  var s = SUBS[key]; if (!s) return;
  var mb = BRANDS[s.brand];
  document.getElementById("m-logo").innerHTML = mb.svg;
  document.getElementById("m-logo").classList.add("brand");
  document.getElementById("m-logo").style.cssText = "--c1:" + mb.c1 + ";--c2:" + mb.c2 + ";--glyph:" + mb.glyph;
  document.getElementById("m-name").textContent = s.name;
  document.getElementById("m-plan").textContent = s.plan;
  document.getElementById("m-price").textContent = money(s.price) + "/" + s.freq;
  document.getElementById("m-renew").textContent = s.renew;
  document.getElementById("m-annual").textContent = money(s.annual);
  document.getElementById("m-bill").textContent = s.bill;
  lastFocus = document.activeElement;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  if (!reduceMotion) {
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ modal.classList.add("open"); });
    });
  }
  document.getElementById("modal-close").focus();
}
function closeModal(){
  function finish(){
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (reduceMotion || !modal.classList.contains("open")) { modal.classList.remove("open"); finish(); return; }
  modal.classList.remove("open");
  setTimeout(finish, 300);
}
document.querySelectorAll("[data-sub]").forEach(function(el){
  el.addEventListener("click", function(){ openModal(el.getAttribute("data-sub")); });
  el.addEventListener("keydown", function(e){ if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(el.getAttribute("data-sub")); } });
});
document.getElementById("modal-close").addEventListener("click", closeModal);
modal.addEventListener("click", function(e){ if (e.target === modal) closeModal(); });
document.addEventListener("keydown", function(e){ if (e.key === "Escape" && !modal.hidden) closeModal(); });
document.getElementById("m-remind").addEventListener("click", function(){
  var note = document.getElementById("m-note");
  note.textContent = "SubControl reminds you before every renewal — with time to pause or cancel.";
  if (!reduceMotion && note.animate) note.animate(
    [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }],
    { duration: 300, easing: "ease" }
  );
});
document.getElementById("m-review").addEventListener("click", function(){
  var note = document.getElementById("m-note");
  note.textContent = "Marked for review — SubControl surfaces candidates like this in your savings check.";
  if (!reduceMotion && note.animate) note.animate(
    [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }],
    { duration: 300, easing: "ease" }
  );
});
document.querySelectorAll(".review-card .btn").forEach(function(b){
  b.addEventListener("click", function(){ b.textContent = "Saved ✓"; b.disabled = true; });
});

/* ---------- waitlist ---------- */
var form = document.getElementById("waitlist-form");
var emailInput = document.getElementById("wl-email");
var msg = document.getElementById("wl-msg");
var submitBtn = document.getElementById("wl-submit");
function setMsg(text, ok){
  msg.textContent = text;
  msg.className = "wl-msg " + (ok ? "ok" : "bad");
}
function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
if (form) {
  form.addEventListener("submit", function(e){
    e.preventDefault();
    var email = emailInput.value.trim().toLowerCase();
    emailInput.classList.remove("err");
    if (!validEmail(email)) {
      emailInput.classList.add("err");
      setMsg("Please enter a valid email address.", false);
      emailInput.focus();
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = "Joining…";
    setMsg("", true);
    var ref = null;
    try { ref = new URLSearchParams(window.location.search).get("ref"); } catch(_){}
    fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, source: "landing", ref: ref })
    }).then(function(r){ return r.json().then(function(j){ return { status: r.status, body: j }; }); })
    .then(function(res){
      var j = res.body || {};
      if (res.status === 200 && j.ok) {
        form.hidden = true;
        var s = document.getElementById("wl-success");
        s.hidden = false;
        var sub = document.getElementById("wl-success-sub");
        if (typeof j.position === "number" && j.position > 0) {
          sub.textContent = "You're #" + j.position.toLocaleString("en-US") + " on the SubControl early-access list.";
        }
        if (j.referralCode) {
          var link = window.location.origin + "/?ref=" + encodeURIComponent(j.referralCode);
          document.getElementById("ref-link").textContent = link;
          document.getElementById("wl-referral").hidden = false;
          document.getElementById("ref-copy").addEventListener("click", function(){
            var btn = this;
            function done(){ btn.textContent = "Copied ✓"; setTimeout(function(){ btn.textContent = "Copy"; }, 2000); }
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(link).then(done, done);
            } else { done(); }
          });
        }
      } else if (res.status === 409) {
        setMsg("This email is already on the list — you're in!", true);
      } else {
        setMsg((j && j.error) || "Something went wrong. Please try again.", false);
      }
    }).catch(function(){
      setMsg("Couldn't reach the server. Check your connection and try again.", false);
    }).finally(function(){
      submitBtn.disabled = false;
      submitBtn.textContent = "Join the Waitlist";
    });
  });
}

/* ---------- page-load entrance ---------- */
requestAnimationFrame(function(){
  requestAnimationFrame(function(){ document.body.classList.add("loaded"); });
});

/* ---------- nav scroll state + hero parallax on scroll ---------- */
var topnav = document.getElementById("topnav");
var heroBg = document.querySelector(".hero-bg");
var heroSec = document.querySelector(".hero");
var scrollTick = false;
function onScrollMotion(){
  var y = window.scrollY || window.pageYOffset;
  if (topnav) topnav.classList.toggle("scrolled", y > 24);
  if (!reduceMotion && heroBg && heroSec && y < heroSec.offsetHeight) {
    heroBg.style.transform = "translateY(" + (y * 0.12).toFixed(1) + "px)";
  }
  scrollTick = false;
}
window.addEventListener("scroll", function(){
  if (!scrollTick) { scrollTick = true; requestAnimationFrame(onScrollMotion); }
}, { passive: true });
onScrollMotion();

/* ---------- active nav link ---------- */
(function activeNav(){
  var map = {};
  document.querySelectorAll(".nav-links a").forEach(function(a){
    var h = a.getAttribute("href");
    if (h && h.charAt(0) === "#") map[h.slice(1)] = a;
  });
  var ids = Object.keys(map);
  if (!ids.length) return;
  var sao = new IntersectionObserver(function(es){
    es.forEach(function(en){
      if (en.isIntersecting) {
        ids.forEach(function(k){ map[k].classList.remove("active"); });
        if (map[en.target.id]) map[en.target.id].classList.add("active");
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  ids.forEach(function(id){ var s = document.getElementById(id); if (s) sao.observe(s); });
})();
})();
