// OrniAlleva Clienti: navigation stays on the approved version until the user confirms.
const OB_CACHE="ornialleva-clienti-approved-v34-18-8";
const OB_STATIC=["./","./manifest.webmanifest","./icon-192.png","./icon-512.png","./apple-touch-icon.png","./favicon-32.png","./favicon-16.png","./ornibreed_home_banner_v2.png"];
self.addEventListener("install",event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(OB_CACHE);
    // The first installation preserves the current approved application.
    // Never replace an existing approved HTML document during install.
    if(!(await cache.match("./"))){
      const old=await caches.match("./");
      if(old)await cache.put("./",old);
      else {
        const response=await fetch("./",{cache:"no-store"});
        if(!response.ok)throw new Error("Unable to seed approved version");
        await cache.put("./",response);
      }
    }
    for(const asset of OB_STATIC.slice(1)){
      try{if(!(await cache.match(asset))){const r=await fetch(asset);if(r.ok)await cache.put(asset,r);}}catch(_){}
    }
  })().then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
 event.waitUntil((async()=>{
   // Do not delete the approved cache during worker activation.
   await self.clients.claim();
 })());
});
self.addEventListener("fetch",event=>{
 const req=event.request;if(req.method!=="GET")return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin)return;
 if(req.mode==="navigate"){
   event.respondWith((async()=>{
     const cache=await caches.open(OB_CACHE);
     const target=url.searchParams.get("ob_release");
     const approved=target&&/^\d+\.\d+\.\d+$/.test(target)&&/^\d{10,}$/.test(url.searchParams.get("ob_refresh")||"");
     if(approved){
       try{
         // A manual installation must bypass both the approved offline cache and HTTP cache.
         const installUrl=new URL("./",self.registration.scope);
         installUrl.searchParams.set("ob_install",target);
         installUrl.searchParams.set("ob_refresh",String(Date.now()));
         const fresh=await fetch(installUrl.href,{cache:"no-store",redirect:"follow"});
         if(!fresh.ok)throw new Error("Download HTTP "+fresh.status);
         const html=await fresh.clone().text();
         const meta=html.match(/<meta\\b(?=[^>]*\\bname\\s*=\\s*["']ornibreed-version["'])(?=[^>]*\\bcontent\\s*=\\s*["']V([^"']+)["'])[^>]*>/i);
         if(!meta||meta[1]!==target)throw new Error("Downloaded version does not match "+target);
         // Commit the new HTML only after the exact version was verified.
         await cache.put("./",fresh.clone());
         return fresh;
       }catch(error){
         console.error("[OrniAlleva] Manual update failed:",error);
         // Never report a successful update by silently serving the previous version.
         return new Response("Aggiornamento non completato. Riapri OrniAlleva e riprova. Dettaglio: "+String(error),{status:503,headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"no-store"}});
       }
     }
     return(await cache.match("./"))||fetch(req);
   })());return;
 }
 event.respondWith((async()=>{
   const cache=await caches.open(OB_CACHE);
   const hit=await cache.match(req);if(hit)return hit;
   try{const response=await fetch(req);if(response.ok)cache.put(req,response.clone()).catch(()=>{});return response;}
   catch(e){return Response.error();}
 })());
});
