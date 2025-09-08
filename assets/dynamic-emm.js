import { sb } from "./sb-init.js";

function qs(s){ return document.querySelector(s); }

function inject(a){
  if (!a) return;
  const title = qs(".cover-title");
  const deck  = qs(".cover-deck");
  const hero  = qs(".hero");
  const body  = qs("#articleBody");
  if (title) title.textContent = a.title || "";
  if (deck)  deck.textContent  = a.subtitle || a.deck || "";
  if (hero && a.hero_url) hero.style.backgroundImage = `url('${a.hero_url}')`;
  if (body && a.body_html) body.innerHTML = a.body_html;
}

async function fetchArticle(){
  const url = new URL(location.href);
  const slug = url.searchParams.get("a");
  let q = sb.from("emm_articles").select("*").eq("status","published");
  if (slug) q = q.eq("slug", slug);
  else q = q.order("published_at", { ascending: false }).limit(1);
  const { data, error } = await q.maybeSingle();
  if (error) { console.error(error); return null; }
  return data;
}

function whitelistContrib(){
  ["openContrib","contribDialog","contribFormContainer","ctName","ctEmail","ctType","ctFile","ctMsg","ctConsent","closeContrib","cancelContrib","submitContrib"]
    .forEach(id => { const el = document.getElementById(id); if (el) el.setAttribute("data-view-allowed",""); });
}

function wireContribForm(){
  const dlg = document.getElementById("contribDialog");
  const send = document.getElementById("submitContrib");
  if (!dlg || !send) return;
  send.addEventListener("click", async () => {
    const get = s => document.querySelector(s);
    const name = get("#ctName")?.value?.trim();
    const email= get("#ctEmail")?.value?.trim();
    const type = get("#ctType")?.value;
    const msg  = get("#ctMsg")?.value?.trim();
    const ok   = get("#ctConsent")?.checked;
    if (!name || !email || !msg || !ok) { alert("Fill Name, Email, Message & consent"); return; }
    const slug = (new URL(location.href)).searchParams.get("a") || null;
    const { error } = await sb.from("emm_contribs").insert({ name,email,type,message:msg, article_slug:slug });
    if (error) { alert("Thanks! If DB isn't set yet, please email your contribution."); }
    dlg.close();
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  whitelistContrib();
  wireContribForm();
  const a = await fetchArticle();
  inject(a);
});
