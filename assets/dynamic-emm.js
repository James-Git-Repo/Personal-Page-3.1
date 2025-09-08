// assets/dynamic-emm.js
import { sb } from "./sb-init.js";
const $ = s => document.querySelector(s);

function inject(article){
  if (!article) return;
  const title = $(".cover-title");
  const deck  = $(".cover-deck");
  const hero  = $(".hero");
  const body  = $("#articleBody");
  if (title) title.textContent = article.title || "";
  if (deck)  deck.textContent  = article.subtitle || article.deck || "";
  if (hero && article.hero_url) hero.style.backgroundImage = `url('${article.hero_url}')`;
  if (body && article.body_html) body.innerHTML = article.body_html;
}

async function fetchArticle(){
  const url = new URL(location.href);
  const slug = url.searchParams.get("a");
  let q = sb.from("emm_articles").select("*").eq("status","published");
  q = slug ? q.eq("slug", slug) : q.order("published_at", { ascending: false }).limit(1);
  const { data, error } = await q.maybeSingle();
  if (error) { console.error("[emm] fetch", error); return null; }
  return data;
}

// ---- Contribute (viewer-allowed) ----
function whitelistContrib(){
  [
    "openContrib","contribDialog","contribForm",
    "ctName","ctEmail","ctType","ctMsg","ctConsent",
    "cancelContrib","submitContrib"
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.setAttribute("data-view-allowed","");
  });
}

function wireContrib(){
  const dlg = document.getElementById("contribDialog");
  const openBtn = document.getElementById("openContrib");
  const cancelBtn = document.getElementById("cancelContrib");
  const sendBtn = document.getElementById("submitContrib");

  if (openBtn && dlg) {
    openBtn.addEventListener("click", () => {
      if (typeof dlg.showModal === "function") dlg.showModal();
      else dlg.style.display = "block";
    });
  }
  if (cancelBtn && dlg) {
    cancelBtn.addEventListener("click", () => {
      if (typeof dlg.close === "function") dlg.close();
      else dlg.style.display = "none";
    });
  }
  if (sendBtn && dlg) {
    sendBtn.addEventListener("click", async () => {
      const name  = $("#ctName")?.value?.trim();
      const email = $("#ctEmail")?.value?.trim();
      const type  = $("#ctType")?.value || null;
      const msg   = $("#ctMsg")?.value?.trim();
      const ok    = $("#ctConsent")?.checked;

      if (!name || !email || !msg || !ok) {
        alert("Please fill Name, Email, Message and check the consent box.");
        return;
      }

      const slug = (new URL(location.href)).searchParams.get("a") || null;

      const { error } = await sb.from("emm_contribs").insert({
        name, email, type, message: msg, article_slug: slug
      });

      if (error) {
        // DB not ready or RLS misconfigured: fall back to mailto
        try {
          location.href = `mailto:jacopoberton98@gmail.com?subject=EMM%20Contribution&body=${encodeURIComponent(
            `Name: ${name}\nEmail: ${email}\nType: ${type||"-"}\n\n${msg}`
          )}`;
        } catch(_) {}
        alert("Thanks! If the form didn’t send, we opened your email client.");
      } else {
        alert("Thanks for your contribution!");
      }

      if (typeof dlg.close === "function") dlg.close();
      else dlg.style.display = "none";
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  whitelistContrib();
  wireContrib();
  inject(await fetchArticle());
});
