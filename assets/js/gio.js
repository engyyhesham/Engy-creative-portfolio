/* GIO case study — page-specific interactions.
   Kept separate from main.js so it never collides with the rest of the site. */
(function(){
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fade/slide reveal for .gio-reveal blocks
  var revealEls = document.querySelectorAll('.gio-reveal');
  if(reduceMotion || !('IntersectionObserver' in window)){
    revealEls.forEach(function(el){ el.style.opacity = 1; });
  } else {
    revealEls.forEach(function(el){
      el.style.opacity = 0;
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity .6s ease, transform .6s ease';
    });
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function(el){ io.observe(el); });
  }

  // Subtle hover scale on placeholder/real campaign assets (skip if reduced motion)
  if(!reduceMotion){
    document.querySelectorAll('.gio-m-item .gio-asset, .gio-hero-collage .gio-asset').forEach(function(el){
      el.style.transition = 'transform .3s ease';
      el.addEventListener('mouseenter', function(){ el.style.transform = (el.style.transform || '') + ' scale(1.025)'; });
      el.addEventListener('mouseleave', function(){ el.style.transform = el.style.transform.replace(' scale(1.025)', ''); });
    });
  }

  // Watch Campaign Reel — swap this handler for a real lightbox/video modal
  // once the reel file is available. For now it just prevents a dead link.
  var reelBtn = document.getElementById('gioReelBtn');
  if(reelBtn){
    reelBtn.addEventListener('click', function(e){
      e.preventDefault();
      alert('Wire this up to the real campaign reel video once it is available.');
    });
  }
})();
