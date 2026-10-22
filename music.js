(function(){
'use strict';
var audio=document.getElementById('birthday-music'),button=document.getElementById('music-toggle'),status=document.getElementById('music-status');
if(!audio||!button)return;
audio.src=window.CONTENT.music.src;audio.volume=.35;
var awaitingGesture=true;
function update(){var playing=!audio.paused;button.textContent=playing?'♫ 暂停音乐':'♪ 播放音乐';button.setAttribute('aria-pressed',String(playing));}
function stopRetry(){awaitingGesture=false;document.removeEventListener('pointerdown',onGesture);document.removeEventListener('keydown',onGesture);}
function play(manual){if(manual)button.disabled=true;var result=audio.play();if(result&&result.then){result.then(function(){stopRetry();status.textContent='';}).catch(function(){if(manual)status.textContent='音乐暂时无法播放，请再试一次。';}).then(function(){button.disabled=false;update();});}}
function onGesture(e){if(!awaitingGesture||button.contains(e.target))return;if(e.type==='keydown'&&(e.ctrlKey||e.metaKey||e.altKey))return;play(false);}
button.addEventListener('click',function(){stopRetry();if(audio.paused)play(true);else{audio.pause();update();}});
audio.addEventListener('play',function(){stopRetry();update();});audio.addEventListener('pause',update);
audio.addEventListener('error',function(){button.disabled=false;status.textContent='音乐加载失败，请确认音频文件完整。';update();});
document.addEventListener('pointerdown',onGesture,{passive:true});document.addEventListener('keydown',onGesture);
play(false);
})();
