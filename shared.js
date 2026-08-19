/* Grand Slam Entertainment — shared behavior for interior SEO pages.
   Requires site-data.js to be loaded first for status-badge pages. */
function toggleMenu(){
  var m = document.getElementById('mobileMenu');
  if(m) m.classList.toggle('open');
}

function toggleFaq(btn){
  var item = btn.closest('.faq-item');
  var open = item.classList.contains('open');
  item.parentElement.querySelectorAll('.faq-item').forEach(function(i){ i.classList.remove('open'); });
  if(!open) item.classList.add('open');
}

window.addEventListener('scroll', function(){
  var nav = document.getElementById('mainNav');
  if(nav) nav.classList.toggle('scrolled', window.scrollY > 40);
});
