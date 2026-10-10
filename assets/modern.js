function toggleEcosystemChat(){
 const chat=document.querySelector('.chat-container');
 const open=chat.classList.contains('chat-open')&&chat.style.display!=='none';
 chat.classList.toggle('chat-open',!open);chat.style.display=open?'none':'flex';
 if(!open)chat.querySelector('input')?.focus();
}
document.querySelector('.chat-close').setAttribute('aria-label','Close Robotcyb chat');
document.querySelector('.chat-input input').setAttribute('aria-label','Message Robotcyb');
document.addEventListener('keydown',event=>{if(event.key==='Escape'){const chat=document.querySelector('.chat-container');chat.classList.remove('chat-open');chat.style.display='none';}});
for(const selector of ['.security-links','.buy-links','.market-links'])document.getElementById('tokenLinks').append(document.querySelector(selector));
for(const link of document.querySelectorAll('a[target="_blank"]'))link.rel='noopener noreferrer';
document.querySelector('[data-copy-contract]').addEventListener('click',async event=>{try{await navigator.clipboard.writeText('8WZiguAp8NyFnwm8Z97k6sCbSRCWaW1YYXKeCTpupump');event.target.textContent='Copied!';setTimeout(()=>event.target.textContent='Copy contract',1600);}catch{event.target.textContent='Select the contract to copy';}});
document.querySelectorAll('[data-prompt]').forEach(button=>button.addEventListener('click',()=>{const input=document.querySelector('.chat-input input');input.value=window.FarmI18n?.t(button.dataset.prompt)||button.dataset.prompt;chatManager.sendMessage();}));
document.addEventListener('visibilitychange',()=>{const sound=document.getElementById('ambientSound');if(document.hidden)sound.pause();else if(audioManager.isAmbientEnabled)sound.play().catch(()=>{});});
document.querySelector('#themeToggle').setAttribute('aria-label','Change theme');document.querySelector('#ambientToggle').setAttribute('aria-label','Toggle ambient sound');

document.addEventListener("farm-language-change",()=>{const greeting=document.querySelector("[data-greeting]");if(greeting)greeting.textContent=window.FarmI18n.t("Hello! I'm your agent. How can I help you today?");});
