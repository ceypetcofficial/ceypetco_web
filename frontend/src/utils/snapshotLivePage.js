export default function snapshotLivePage(path, wait = 1400) {
  return new Promise((resolve) => {
    let settled = false;
    let timer = null;
    let iframe = null;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
      resolve(result);
    };
    const extract = (doc) => {
      try {
        const main = doc.querySelector("main");
        if (!main) return finish(null);
        const bgUrl = (el) => {
          try {
            const bg = (getComputedStyle(el).backgroundImage || "").match(/url\((["']?)(.*?)\1\)/);
            return bg && bg[2] && bg[2] !== "none" ? bg[2] : "";
          } catch {
            return "";
          }
        };
        const realImage = (el) => {
          if (!el) return "";
          const img = el.querySelector("img");
          if (img) {
            const src = (img.currentSrc || img.src || "").trim();
            if (src && !/^data:/.test(src)) return src;
          }
          return bgUrl(el);
        };
        const eagerAll = () => {
          try {
            main
              .querySelectorAll("img")
              .forEach((img) => {
                try {
                  if (img.dataset.src) img.src = img.dataset.src;
                  if (img.dataset.lazySrc) img.src = img.dataset.lazySrc;
                  if (img.loading === "lazy") img.loading = "eager";
                } catch {
                  /* ignore */
                }
              });
          } catch {
            /* ignore */
          }
        };
        eagerAll();
        setTimeout(() => realExtract(), Math.max(wait - 600, 300));
        function realExtract() {
          const heroNode = main.querySelector(".page-hero,.hero,section");
          const heroTitle =
            heroNode?.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim() || "";
          const heroText =
            heroNode?.querySelector("p:not(.eyebrow)")?.textContent?.replace(/\s+/g, " ").trim() || "";
          let heroImage = realImage(heroNode);
          if (!heroImage) {
            const fallback = main.querySelector("img");
            heroImage = fallback?.src && !/^data:/.test(fallback.src) ? fallback.src : "";
          }
          let nodes = [...main.querySelectorAll(":scope > section, :scope > div > section")];
          if (nodes.length < 2) nodes = [...main.querySelectorAll("section")];
          if (heroNode) nodes = nodes.filter((node) => node !== heroNode);
          if (!nodes.length) nodes = [main];
          const sections = nodes
            .slice(0, 40)
            .map((node) => {
              const title =
                node.querySelector("h2,h1,h3")?.textContent?.replace(/\s+/g, " ").trim() || "Section";
              const eyebrow = node.querySelector(".eyebrow")?.textContent?.replace(/\s+/g, " ").trim() || "";
              const articles = [...node.querySelectorAll("article")].slice(0, 20);
              const paragraphs = [...node.querySelectorAll("p")]
                .filter((p) => !p.classList.contains("eyebrow") && !p.closest("article"))
                .map((p) => p.textContent.replace(/\s+/g, " ").trim())
                .filter(Boolean);
              const image = realImage(node);
              const className = String(node.className || "").toLowerCase();
              const items = articles.map((article) => ({
                title:
                  article.querySelector("h2,h3,h4,strong")?.textContent?.replace(/\s+/g, " ").trim() || "Item",
                text: article.querySelector("p")?.textContent?.replace(/\s+/g, " ").trim() || "",
                image: realImage(article),
              }));
              let type = items.length > 1 ? "cards" : image ? "split" : "content";
              if (/stat|number|figure/.test(className) && items.length) type = "stats";
              return {
                id:
                  typeof crypto !== "undefined" && crypto.randomUUID
                    ? crypto.randomUUID()
                    : `s${Date.now()}-${Math.random().toString(36).slice(2)}`,
                type,
                eyebrow,
                title,
                body: [...new Set(paragraphs)].join("\n\n"),
                image,
                imageAlt: "",
                buttonText: "",
                buttonLink: "",
                items,
              };
            })
            .filter((s) => s.title || s.body || s.image || s.items.length);
          finish({
            hero: { title: heroTitle, subtitle: heroText, image: heroImage },
            sections,
          });
        }
      } catch {
        finish(null);
      }
    };
    timer = setTimeout(() => finish(null), 20000);
    iframe = document.createElement("iframe");
    iframe.style.cssText =
      "position:fixed;left:-99999px;top:-99999px;width:1000px;height:800px;border:0;visibility:hidden;";
    iframe.addEventListener("load", () => {
      setTimeout(() => extract(iframe.contentDocument), 300);
    });
    iframe.src = path;
    document.body.appendChild(iframe);
  });
}