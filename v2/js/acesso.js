(function(){
  const id=new URLSearchParams(location.search).get('case');
  const info=Protect.cases[id];
  const target=info?info.page:'index.html';

  if(Protect.isUnlocked()){location.replace(target);return}

  const form=document.getElementById('gateForm');
  const input=document.getElementById('gatePassword');
  const toggle=document.getElementById('gateToggle');
  const error=document.getElementById('gateError');
  const submit=document.getElementById('gateSubmit');
  const title=document.getElementById('gateTitle');

  if(info){
    title.textContent=info.title;
    title.removeAttribute('data-en');
  }else{
    title.dataset.en='Protected case study';
  }

  const strings={
    pt:{placeholder:'Digite a senha',wrong:'Senha incorreta. Tente novamente.',empty:'Digite a senha para continuar.',show:'Mostrar senha',hide:'Ocultar senha'},
    en:{placeholder:'Enter the password',wrong:'Wrong password. Please try again.',empty:'Enter the password to continue.',show:'Show password',hide:'Hide password'},
  };
  let t=strings.pt;
  let errorKey=null;
  function render(){
    input.placeholder=t.placeholder;
    toggle.setAttribute('aria-label',toggle.classList.contains('showing')?t.hide:t.show);
    error.textContent=errorKey?t[errorKey]:'';
  }
  window.onLangChange=lang=>{t=strings[lang]||strings.pt;render()};

  function fail(key){
    errorKey=key;render();
    form.classList.add('error');
    form.classList.remove('shake');void form.offsetWidth;form.classList.add('shake');
    input.focus();input.select();
  }

  toggle.addEventListener('click',()=>{
    const showing=toggle.classList.toggle('showing');
    input.type=showing?'text':'password';
    render();input.focus();
  });

  input.addEventListener('input',()=>{
    if(!errorKey)return;
    errorKey=null;form.classList.remove('error');render();
  });

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const pw=input.value;
    if(!pw){fail('empty');return}
    submit.disabled=true;
    const ok=await Protect.unlock(pw);
    submit.disabled=false;
    if(ok)location.replace(target);
    else fail('wrong');
  });
})();
