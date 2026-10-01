/* SubControl landing interactions — vanilla JS, no dependencies */
(function(){
"use strict";
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
var SUBS = {
  netflix: { name:"Netflix", plan:"Premium plan", price:22.99, freq:"month", renew:"October 12", renewIn:"3 days", annual:275.88, bill:"Monthly · Card •• 4242", c1:"#E50914", c2:"#7a0a10", letter:"N" },
  spotify: { name:"Spotify", plan:"Individual", price:11.99, freq:"month", renew:"October 17", renewIn:"8 days", annual:143.88, bill:"Monthly · Card •• 4242", c1:"#1DB954", c2:"#0d5c2a", letter:"S" },
  adobe:   { name:"Adobe", plan:"Creative Cloud", price:59.99, freq:"month", renew:"October 23", renewIn:"14 days", annual:719.88, bill:"Monthly · Card •• 8791", c1:"#5B8CFF", c2:"#2b3f9e", letter:"A" },
  gym:     { name:"Gym Membership", plan:"Monthly", price:39.00, freq:"month", renew:"October 30", renewIn:"21 days", annual:468.00, bill:"Monthly · Bank •• 3310", c1:"#B9AFFF", c2:"#5b54a8", letter:"G" },
  icloud:  { name:"iCloud+", plan:"2TB storage", price:9.99, freq:"month", renew:"November 2", renewIn:"24 days", annual:119.88, bill:"Monthly · Card •• 4242", c1:"#4DE3FF", c2:"#1d6f85", letter:"C" },
  prime:   { name:"Amazon Prime", plan:"Annual", price:139.00, freq:"year", renew:"March 14", renewIn:"5 months", annual:139.00, bill:"Yearly · Card •• 8791", c1:"#FF9900", c2:"#8a5200", letter:"a" }
};
function money(n){ return "$" + n.toFixed(2); }

/* ---------- hero 3D parallax ---------- */
var scene = document.getElementById("scene");
var heroScene = document.getElementById("hero-scene");
if (scene && heroScene && !reduceMotion && window.matchMedia("(pointer:fine)").matches) {
  heroScene.addEventListener("mousemove", function(e){
    var r = heroScene.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width - 0.5;
    var y = (e.clientY - r.top) / r.height - 0.5;
    scene.style.transform = "rotateY(" + (x*10).toFixed(2) + "deg) rotateX(" + (-y*8).toFixed(2) + "deg)";
    scene.querySelectorAll("[data-depth]").forEach(function(el){
      var d = parseFloat(el.getAttribute("data-depth")) || 20;
      el.style.translate = (x*d).toFixed(1) + "px " + (y*d).toFixed(1) + "px";
    });
  });
  heroScene.addEventListener("mouseleave", function(){
    scene.style.transform = "rotateY(0deg) rotateX(0deg)";
    scene.querySelectorAll("[data-depth]").forEach(function(el){ el.style.translate = "0px 0px"; });
  });
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
var rio = new IntersectionObserver(function(entries){
  entries.forEach(function(en){ if (en.isIntersecting) { en.target.classList.add("in"); rio.unobserve(en.target); } });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(function(el){ rio.observe(el); });

/* ---------- mini dashboard ---------- */
var miniList = document.getElementById("mini-list");
if (miniList) {
  ["netflix","spotify","adobe","gym","icloud"].forEach(function(key){
    var s = SUBS[key];
    var b = document.createElement("button");
    b.type = "button"; b.className = "mini-item"; b.setAttribute("data-sub", key);
    b.innerHTML = '<span class="sub-logo" style="--c1:' + s.c1 + ';--c2:' + s.c2 + '">' + s.letter + '</span>' +
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
  document.getElementById("m-logo").textContent = s.letter;
  document.getElementById("m-logo").style.cssText = "--c1:" + s.c1 + ";--c2:" + s.c2;
  document.getElementById("m-name").textContent = s.name;
  document.getElementById("m-plan").textContent = s.plan;
  document.getElementById("m-price").textContent = money(s.price) + "/" + s.freq;
  document.getElementById("m-renew").textContent = s.renew;
  document.getElementById("m-annual").textContent = money(s.annual);
  document.getElementById("m-bill").textContent = s.bill;
  lastFocus = document.activeElement;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  document.getElementById("modal-close").focus();
}
function closeModal(){
  modal.hidden = true;
  document.body.style.overflow = "";
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}
document.querySelectorAll("[data-sub]").forEach(function(el){
  el.addEventListener("click", function(){ openModal(el.getAttribute("data-sub")); });
  el.addEventListener("keydown", function(e){ if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(el.getAttribute("data-sub")); } });
});
document.getElementById("modal-close").addEventListener("click", closeModal);
modal.addEventListener("click", function(e){ if (e.target === modal) closeModal(); });
document.addEventListener("keydown", function(e){ if (e.key === "Escape" && !modal.hidden) closeModal(); });
document.getElementById("m-remind").addEventListener("click", function(){
  document.getElementById("m-note").textContent = "Reminder noted — we'll email you 3 days before renewal at launch.";
});
document.getElementById("m-review").addEventListener("click", function(){
  document.getElementById("m-note").textContent = "Marked for review — SubControl will surface this in your savings check.";
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
})();
