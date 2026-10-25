'use strict';
const researchGigs = Array.isArray(window.GIGS) ? window.GIGS.filter(window.GIG_SECURITY.validGig) : [];
// Website-only editorial cap; calendar and playlist data are not modified.
const allGigs = researchGigs.slice(0,15);
let gigs=allGigs; let quickFilter=null;
const $=s=>document.querySelector(s);
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
function icon(kind='external'){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('width','18');svg.setAttribute('height','18');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');svg.setAttribute('class','ui-icon');const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',kind==='chevron'?'M6 9l6 6 6-6':'M7 17 17 7M7 7h10v10');svg.append(path);return svg;}
const dateLabel=d=>new Date(d+'T12:00:00Z').toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short',timeZone:'UTC'});
const groups=['Metalcore','Heavy metal','Hardcore','Punk','Alternative','Industrial','Tributes'];
const genreKey=g=>group(g).toLowerCase().replace(/ /g,'-');
const group=g=>{/**** Editorial dominant sound; no numeric genre axes. ****/if(/tribute/i.test(g.style))return 'Tributes';if(/Metalcore|Deathcore/i.test(g.style))return 'Metalcore';if(/Doom|Sludge|Extreme|Death/i.test(g.style))return 'Heavy metal';if(/Hardcore|Crust/i.test(g.style))return 'Hardcore';if(/Industrial|Gothic/i.test(g.style))return 'Industrial';if(/Punk/i.test(g.style))return 'Punk';return 'Alternative';};
const summaryPrices={"g01-1": "A$49.90", "g02-1": "A$34.20", "g03-1": "A$24.90", "g04-1": "Waitlist \u00b7 price unconfirmed", "g04-2": "A$50.87 adult", "g05-1": "Price unconfirmed", "g06-1": "A$19.88 incl. fee", "g07-1": "A$25 incl. fees", "g08-1": "Free", "g09-1": "A$15 incl. fees", "g10-1": "Price unconfirmed", "g11-1": "A$15 + booking fee", "g12-1": "A$19.90", "g13-1": "A$20.95", "g14-1": "A$12.50", "g15-1": "A$20 + fees", "g16-1": "A$58", "g16-2": "A$55.05 + A$2.95/order", "g17-1": "A$16.75", "g18-1": "A$15", "g19-1": "Price unconfirmed", "g20-1": "Price unconfirmed", "g20-2": "Price unconfirmed", "g21-1": "A$32.41 standard", "g22-1": "Price unconfirmed", "g23-1": "A$40.27\u201360.66 + fees \u00b7 tier unconfirmed", "g24-1": "Free \u00b7 18+", "g25-1": "Free", "g26-1": "Free", "g27-1": "Free \u00b7 RSVP", "g28-1": "Free \u00b7 RSVP", "g29-1": "A$30", "g30-1": "Price unconfirmed", "g31-1": "A$37.63 standard"};
let selectedId=gigs[0]?.id;let mapWide=false;let openId=null;
function outbound(url,text,cls=''){const safe=window.GIG_SECURITY.safeExternalURL(url);if(!safe)return el('span',cls,text+' (unavailable)');const a=el('a',cls,text);a.href=safe;a.target='_blank';a.rel='noopener noreferrer';a.append(icon());return a;}
function selectGig(id,open=false){const g=gigs.find(v=>v.id===id);if(!g)return;selectedId=id;document.querySelectorAll('[data-gig-id]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.gigId===id)));if(open)openGig(id,false,true);}
function renderList(){const out=$('#gig-list');out.replaceChildren();gigs.forEach((g,i)=>{const row=el('article','gig-row');row.id='show-'+g.id;row.append(el('span','gig-number',String(i+1).padStart(2,'0')));const summary=el('button','gig-summary');summary.setAttribute('aria-expanded','false');summary.setAttribute('aria-controls','details-'+g.id);const heading=el('span','gig-heading');heading.append(el('span','band-name',g.lineup[0]));if(g.lineup.length>1)heading.append(el('span','gig-support',g.lineup.slice(1,4).join(' · ')+(g.lineup.length>4?` + ${g.lineup.length-4} more`:'')));summary.append(heading);const facts=el('span','gig-facts');facts.append(el('strong','',dateLabel(g.date)),el('span','',summaryPrices[g.id]||g.price));const indicator=el('span','expand-icon');indicator.append(icon('chevron'));summary.append(facts,indicator);summary.onclick=()=>{selectGig(g.id);openGig(g.id);};const detail=el('div','gig-details');detail.id='details-'+g.id;detail.hidden=true;row.append(summary,detail);out.append(row);});}
function renderGenres(){const out=$('#genre-map');out.replaceChildren();groups.forEach(name=>{if(!gigs.some(g=>group(g)===name))return;const region=el('section','genre-region');region.dataset.genre=name.toLowerCase().replace(/ /g,'-');region.append(el('h3','',name));const cluster=el('div','genre-gigs');gigs.filter(g=>group(g)===name).forEach(g=>{const b=el('button','genre-gig');b.dataset.genre=genreKey(g);b.dataset.gigId=g.id;b.setAttribute('aria-pressed',String(g.id===selectedId));b.setAttribute('aria-label',`${g.lineup[0]}, ${dateLabel(g.date)}: details`);b.append(el('span','mini-number',gigs.indexOf(g)+1));const text=el('span','',g.lineup[0]);text.append(el('span','mini-date',dateLabel(g.date)));b.append(text);b.onclick=()=>selectGig(g.id,true);cluster.append(b);});region.append(cluster);out.append(region);});}
function project(point,b){return {x:(point.lon-b.west)/(b.east-b.west)*1000,y:(b.north-point.lat)/(b.north-b.south)*620};}
function renderMap(){const geo=window.GIG_GEO;const out=$('#map-markers');const svg=$('#map-lines');out.replaceChildren();svg.replaceChildren();if(!geo)return;const bounds=mapWide?geo.bounds.wide:geo.bounds.city;const width=$('#map-canvas').clientWidth||1000;const height=$('#map-canvas').clientHeight||620;$('#geographic-map').src=mapWide?'sydney-map-wide.svg?v=3e9446cce950':'sydney-map.svg?v=905423e8b8bd';const points=[];const outside=[];const missing=[];gigs.forEach((g,i)=>{const place=geo.venues[g.venue];if(!place){missing.push(g);return;}const p=project(place,bounds);if(p.x<0||p.x>1000||p.y<0||p.y>620){outside.push(g);return;}points.push({g,i,anchorX:p.x,anchorY:p.y,x:p.x/1000*width,y:p.y/620*height});});
// Assign readable label slots near each venue; leaders retain the actual geographic anchor.
const bubbleWidth=184,bubbleHeight=76,gap=12;
const cols=Math.max(1,Math.floor(width/(bubbleWidth+gap))),rows=Math.max(1,Math.floor(height/(bubbleHeight+gap)));
const slots=[];for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)slots.push({x:(c+.5)*width/cols,y:(r+.5)*height/rows,used:false});
points.forEach(p=>{const available=slots.filter(s=>!s.used);if(available.length){const nearest=available.reduce((best,s)=>((s.x-p.x)**2+(s.y-p.y)**2)<((best.x-p.x)**2+(best.y-p.y)**2)?s:best);nearest.used=true;p.x=nearest.x;p.y=nearest.y;}
const line=document.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('x1',p.anchorX);line.setAttribute('y1',p.anchorY);line.setAttribute('x2',p.x/width*1000);line.setAttribute('y2',p.y/height*620);line.setAttribute('class','leader');svg.append(line);
const anchor=document.createElementNS('http://www.w3.org/2000/svg','circle');anchor.setAttribute('cx',p.anchorX);anchor.setAttribute('cy',p.anchorY);anchor.setAttribute('r','4');anchor.setAttribute('class','venue-anchor');svg.append(anchor);
const b=el('button','gig-marker');b.style.left=p.x/width*100+'%';b.style.top=p.y/height*100+'%';b.dataset.genre=genreKey(p.g);b.dataset.gigId=p.g.id;b.setAttribute('aria-pressed',String(p.g.id===selectedId));b.setAttribute('aria-label',`${p.g.lineup[0]}, ${dateLabel(p.g.date)}, ${group(p.g)}, ${p.g.venue}: details`);b.append(el('span','map-band',p.g.lineup[0]),el('span','map-date',dateLabel(p.g.date)));b.onclick=()=>selectGig(p.g.id,true);out.append(b);});}
function renderLegend(){const legend=$('#genre-legend');legend.replaceChildren();groups.filter(name=>gigs.some(g=>group(g)===name)).forEach(name=>{const item=el('span','legend-item');item.dataset.genre=name.toLowerCase().replace(/ /g,'-');item.append(el('span','legend-swatch'),el('span','',name));legend.append(item);});}
function setMapWide(value){mapWide=value;document.querySelectorAll('[data-map-range]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.mapRange==='wide')===value)));renderMap();}
function setView(kind){const map=kind==='map';$('#map-view').hidden=!map;$('#sound-view').hidden=map;$('#map-toggle').setAttribute('aria-pressed',String(map));$('#sound-toggle').setAttribute('aria-pressed',String(!map));if(map)renderMap();}
function loadSpotify(artistUrl,slot){if(!window.GIG_SECURITY.safeSpotifyURL(artistUrl,'artist'))return;const id=new URL(artistUrl).pathname.split('/').pop();const frame=document.createElement('iframe');frame.src=`https://open.spotify.com/embed/artist/${id}?utm_source=generator`;frame.title='Spotify artist player';frame.width='100%';frame.height='352';frame.allow='encrypted-media; fullscreen; picture-in-picture';frame.setAttribute('allowfullscreen','');frame.referrerPolicy='no-referrer';frame.loading='eager';slot.replaceChildren(frame);}
function openGig(id,toggle=true,scroll=false){
 const g=gigs.find(v=>v.id===id);if(!g)return;const same=openId===id;
 document.querySelectorAll('.gig-details').forEach(n=>{n.replaceChildren();n.hidden=true;});
 document.querySelectorAll('.gig-summary').forEach(n=>{n.setAttribute('aria-expanded','false');});
 openId=null;if(same&&toggle)return;openId=id;const row=$('#show-'+id),out=row.querySelector('.gig-details');out.hidden=false;
 row.querySelector('.gig-summary').setAttribute('aria-expanded','true');
 const layout=el('div','detail-layout'),info=el('div','detail-info');
 info.append(el('p','detail-genre',g.style),el('p','detail-time',g.time+' · Sydney time'));
 const mapsURL='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(g.venue+', '+g.suburb+', NSW, Australia');
 info.append(outbound(mapsURL,g.venue+' · '+g.suburb+'','venue-location'));
 if(g.lineup.length>4){const full=el('details','full-lineup');const label=el('summary','','Full line-up');label.append(icon('chevron'));full.append(label,el('p','',g.lineup.join(' · ')));info.append(full);}
 const actions=el('div','detail-actions');actions.append(outbound(g.url,'Tickets / official'));
 const calendar=el('a','','Add to calendar');calendar.href=`calendar/${g.id}.ics`;calendar.download=`${g.id}.ics`;actions.append(calendar);
 const head=(g.artists||[])[0];const lead=head&&head.url&&window.GIG_SECURITY.safeSpotifyURL(head.url,'artist')?head:null;
 if(lead)actions.append(outbound(lead.url,'Open Spotify'));
 info.append(actions);layout.append(info);
 if(lead){const slot=el('div','spotify-slot');layout.append(slot);loadSpotify(lead.url,slot);}
 out.append(layout);
 if(scroll){row.scrollIntoView({block:'nearest',behavior:'auto'});row.querySelector('.gig-summary').focus({preventScroll:true});}
}
$('#map-toggle').onclick=()=>setView('map');$('#sound-toggle').onclick=()=>setView('sound');document.querySelectorAll('[data-map-range]').forEach(b=>b.onclick=()=>setMapWide(b.dataset.mapRange==='wide'));renderList();renderGenres();renderLegend();renderMap();if(selectedId)selectGig(selectedId);

window.addEventListener('resize',()=>{if(!$('#map-view').hidden)renderMap();});

function quickDateRange(kind,now=new Date()){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Australia/Sydney',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const v=t=>parts.find(p=>p.type===t).value;const today=`${v('year')}-${v('month')}-${v('day')}`;
 if(kind==='today')return [today,today];
 const d=new Date(today+'T12:00:00Z'), day=d.getUTCDay();const offset=day===0?-2:day>=5?5-day:5-day;
 d.setUTCDate(d.getUTCDate()+offset);const first=d.toISOString().slice(0,10);d.setUTCDate(d.getUTCDate()+2);return [first,d.toISOString().slice(0,10)];
}
function applyQuickFilter(kind){
 quickFilter=kind==='week'?null:kind;
 const range=quickFilter?quickDateRange(quickFilter):null;
 gigs=allGigs.filter(g=>!range||(g.date>=range[0]&&g.date<=range[1]));openId=null;selectedId=gigs[0]?.id;$('.explorer').hidden=gigs.length===0;
 document.querySelectorAll('[data-quick-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.quickFilter===(quickFilter||'week'))));
 const label=range?`${dateLabel(range[0])}${range[1]!==range[0]?' – '+dateLabel(range[1]):''}`:'26 Oct – 1 Nov';
 $('#quick-range').textContent=label+' · Sydney time';
 renderList();renderGenres();renderLegend();renderMap();if(selectedId)selectGig(selectedId);
 $('#quick-empty').hidden=gigs.length!==0;
 $('#quick-empty').textContent=gigs.length?'':`No featured gigs ${quickFilter==='today'?'today':'this weekend'} (${label}). This selection covers 26 Oct – 1 Nov. Choose Featured week to see the line-up.`;
 $('.explorer').hidden=gigs.length===0;
}
document.querySelectorAll('[data-quick-filter]').forEach(b=>b.onclick=()=>applyQuickFilter(b.dataset.quickFilter));
