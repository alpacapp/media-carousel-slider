const $slider = document.querySelector('#_BLOCK_ media-carousel-slider');
const $slides = [...$slider.querySelectorAll('media-carousel-slide')];
const $dots = [...$slider.querySelectorAll('slider-dot')];
const $prev = document.querySelector('#_BLOCK_ slider-prev');
const $next = document.querySelector('#_BLOCK_ slider-next');
const $videos = [...$slider.querySelectorAll('video')];
let currentSlide = 1;
let nSlides = $slides.length;
const setSlide = (idx=1)=>{
  currentSlide = idx;
  $slider.style.setProperty('--current-slide', idx);
  $slides.forEach(($s, i)=>$s.setAttribute('alpacapp-element', 'slide'+(i+1===idx?' slide-current':'')));
  $dots?.forEach(($c, i)=>$c.setAttribute('alpacapp-element', 'dot'+(i+1===idx?' dot-current':'')));
  if(currentSlide==1) {
    $prev?.setAttribute('alpacapp-element', 'arrow arrow-disabled');
  } else {
    $prev?.setAttribute('alpacapp-element', 'arrow');
  }
  if(currentSlide==nSlides) {
    $next?.setAttribute('alpacapp-element', 'arrow arrow-disabled');
  } else {
    $next?.setAttribute('alpacapp-element', 'arrow');
  }
  $videos.forEach($v=>{$v.pause();$v.currentTime=0;$v.muted=true;});
  let $video = $slides[idx-1].querySelector('video');
  if($video) {
    $video.play();
    $video.muted = false;
  }
};

let bypassClick = false;
let timer;
const autoSlide = ()=>{
  setSlide((currentSlide % nSlides) + 1);
  timer = setTimeout(autoSlide, {{ duration | json }}*1000);
}
const stopAutoSlide = ()=>clearTimeout(timer);
{% if autoslide %}
timer = setTimeout(autoSlide, {{ duration | json }}*1000);
{% endif %}

$dots.forEach($dot=>$dot.addEventListener('click', (e)=>{
  setSlide($dots.indexOf(e.target)+1);
  stopAutoSlide();
}));
$slides.forEach($slide=>$slide.addEventListener('click', (e)=>{
  if(bypassClick)
    return;
  let idx = $slides.indexOf($slide)+1;
  if(idx==currentSlide) {
    let url = $slide.getAttribute('data-link');
    if(url && !e.target.closest('a')) {
      if((new URL(url, window.baseURI)).host!=document.location.host) {
        window.open(url, '_blank');
      } else {
        document.location = url;
      }
    }
    if($slide.querySelector('video')) {
      $slide.querySelector('video').currentTime = 0;
    }
  } else {
    setSlide(idx);
  }
  stopAutoSlide();
}));
$next?.addEventListener('click', ()=>{
  if(currentSlide < nSlides)
    setSlide(currentSlide + 1);
  stopAutoSlide();
});
$prev?.addEventListener('click', ()=>{
  if(currentSlide > 1)
    setSlide(currentSlide - 1);
  stopAutoSlide();
});


$slider.addEventListener('pointerdown', (e) => {
  stopAutoSlide();
  $slider.style.setProperty('--delta-x', '0px');
  $slider.setAttribute('data-swiping', '');
  let startX = e.clientX;
  let lastX = e.clientX;
  let lastTime = performance.now();
  const updateX = (e) => {
    let lastX = e.clientX;
    let lastTime = performance.now();
    $slider.style.setProperty('--delta-x', (e.clientX - startX)+'px');
  };
  document.addEventListener('pointermove', updateX);
  document.addEventListener('pointerup', (e)=>{
    let velocity = (e.clientX-lastX)/Math.max(0.01, performance.now() - lastTime);
    $slider.removeAttribute('data-swiping');
    document.removeEventListener('pointermove', updateX);
    e.stopImmediatePropagation();
    let endX = e.clientX + velocity * 250;
    let deltaSlide = Math.round((endX - startX) / (Math.min(window.innerWidth, {{ width }}) + {{ gap }}));
    if(deltaSlide!=0) {
      bypassClick = true;
      setTimeout(()=>{
        bypassClick = false;
      }, 0);
      setSlide(Math.max(1, Math.min(nSlides, currentSlide - deltaSlide)));
    }
  }, {once:true});
});