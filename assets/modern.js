function toggleEcosystemChat(){
 const chat=document.querySelector('.chat-container');
 const open=chat.classList.contains('chat-open')&&chat.style.display!=='none';
 chat.classList.toggle('chat-open',!open);chat.style.display=open?'none':'flex';
 if(!open)chat.querySelector('input')?.focus();
}
document.querySelector('.chat-close').setAttribute('aria-label','Close Robotcyb chat');
document.querySelector('.chat-input input').setAttribute('aria-label','Message Robotcyb');
document.addEventListener('keydown',event=>{if(event.key==='Escape'){const chat=document.querySelector('.chat-container');chat.classList.remove('chat-open');chat.style.display='none';}});
