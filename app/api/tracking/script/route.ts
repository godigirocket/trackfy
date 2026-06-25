import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const siteId = q.get("siteId") ?? "";
  const pixelId = q.get("pixel") ?? "";
  const gaId = q.get("ga") ?? "";
  if (!/^[a-z0-9-]{20,}$/i.test(siteId)) return new Response("", { status: 400 });
  const config = JSON.stringify({ siteId, pixelId: /^\d{8,20}$/.test(pixelId) ? pixelId : "", gaId: /^G-[A-Z0-9]+$/i.test(gaId) ? gaId : "" });
  const script = `(function(){
var c=${config},e='https://tf.digirocket.site/api/tracking/pixel';
if(c.pixelId&&!window.fbq){!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js')}
if(c.pixelId&&typeof fbq==='function')fbq('init',c.pixelId);
if(c.gaId){window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};gtag('js',new Date());gtag('config',c.gaId);var g=document.createElement('script');g.async=true;g.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(c.gaId);document.head.appendChild(g)}
var p=new URLSearchParams(location.search),r=document.referrer||'',a={};try{a=JSON.parse(localStorage.getItem('trackfy_attribution')||'{}')}catch(x){}
var hasUtm=['utm_source','utm_medium','utm_campaign','utm_term','utm_content'].some(function(k){return p.has(k)});
if(a.medium==='referral'&&a.source===location.hostname)a={};
if(hasUtm||!a.source){var h='direct',same=false;try{h=r?new URL(r).hostname:'direct';same=h===location.hostname}catch(x){};a={source:p.get('utm_source')||a.source||(same?'direct':h),medium:p.get('utm_medium')||a.medium||(r&&!same?'referral':'direct'),campaign:p.get('utm_campaign')||a.campaign||'(not set)',term:p.get('utm_term')||a.term||'',content:p.get('utm_content')||a.content||''};try{localStorage.setItem('trackfy_attribution',JSON.stringify(a))}catch(x){}}
function fresh(n,k,ms){var now=Date.now(),key='trackfy_last_'+c.siteId+'_'+n+'_'+k;try{var last=Number(sessionStorage.getItem(key)||0);if(now-last<ms)return false;sessionStorage.setItem(key,String(now))}catch(x){}return true}
function send(n,d){var k=location.pathname+'|'+a.source+'|'+a.medium+'|'+a.campaign;if(!fresh(n,k,n==='page_view'?3000:900))return;var v=Object.assign({siteId:c.siteId,event:n,path:location.pathname,pageUrl:location.href,referrer:r,source:a.source,medium:a.medium,campaign:a.campaign,term:a.term,content:a.content},d||{}),s=new URLSearchParams();Object.keys(v).forEach(function(k){if(v[k]!==undefined&&v[k]!==null)s.set(k,String(v[k]))});var i=new Image();window.__trackfyPixels=window.__trackfyPixels||[];window.__trackfyPixels.push(i);i.src=e+'?'+s.toString();if(typeof gtag==='function')gtag('event',n,v);var m={page_view:'PageView',view_item:'ViewContent',generate_lead:'Lead',begin_checkout:'InitiateCheckout',purchase:'Purchase'};if(typeof fbq==='function'&&m[n])fbq('track',m[n],n==='purchase'?{value:Number(v.value||0),currency:v.currency||'BRL'}:{});}
window.trackfyEvent=send;window.trackfyPurchase=function(o){if(o&&o.transaction_id)send('purchase',{eventId:String(o.transaction_id),value:Number(o.value||0),currency:o.currency||'BRL'})};send('page_view');document.addEventListener('click',function(x){var t=x.target.closest('[data-trackfy-funnel]');if(t)send(t.getAttribute('data-trackfy-funnel')||'trackfy_click')},true);
})();`;
  return new Response(script, { headers: { "content-type": "application/javascript; charset=utf-8", "cache-control": "public, max-age=300" } });
}
