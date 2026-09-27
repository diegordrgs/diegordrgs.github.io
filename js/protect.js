/*
 * Password gate for private case studies.
 *
 * To change the password, open acesso.html in the browser, run
 *   Protect.hashPassword('nova-senha')
 * in the console and paste the printed salt/hash below.
 */
(function(){
  var CFG={
    salt:'f7e9c50306cfccbe4192aff7c6dc4581',
    iterations:150000,
    hash:'e9658e26a569136f355f5dbb095e0b878deff13b4b470f19dd4c868a14b0c2ab',
    cases:{
      'cienty':{page:'case-cienty.html',title:'Cienty'},
      'mi-futuro-auto':{page:'case-mi-futuro-auto.html',title:'Mi Futuro Auto BR — Kavak'},
      'trade-in':{page:'case-trade-in.html',title:'Trade-in UX Research'}
    }
  };
  var KEY='pf-unlock';

  function hex(buf){return Array.from(new Uint8Array(buf)).map(function(b){return b.toString(16).padStart(2,'0')}).join('')}
  function unhex(s){return new Uint8Array(s.match(/../g).map(function(h){return parseInt(h,16)}))}

  async function derive(pw,salt,iterations){
    var key=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveBits']);
    var bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:unhex(salt),iterations:iterations},key,256);
    return hex(bits);
  }

  function isUnlocked(){
    try{return sessionStorage.getItem(KEY)===CFG.hash}catch(e){return false}
  }

  async function unlock(pw){
    if(await derive(pw,CFG.salt,CFG.iterations)!==CFG.hash)return false;
    try{sessionStorage.setItem(KEY,CFG.hash)}catch(e){}
    return true;
  }

  function guard(id){
    if(!isUnlocked())location.replace('acesso.html?case='+encodeURIComponent(id));
  }

  async function hashPassword(pw){
    var salt=hex(crypto.getRandomValues(new Uint8Array(16)));
    var hash=await derive(pw,salt,CFG.iterations);
    console.log("salt:'"+salt+"',\nhash:'"+hash+"',");
    return {salt:salt,hash:hash};
  }

  window.Protect={cases:CFG.cases,isUnlocked:isUnlocked,unlock:unlock,guard:guard,hashPassword:hashPassword};
})();
