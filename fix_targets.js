const fs = require('fs');
let c = fs.readFileSync('frontend/src/App.jsx', 'utf8');

c = c.replace(/    if \(window\.matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches\) \{\r?\n      targets\.forEach\(\(element\) => element\.classList\.add\('is-visible'\)\);\r?\n      return undefined;\r?\n    \}/, 
`    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;`);

c = c.replace(/    targets\.forEach\(\(element\) => observer\.observe\((element)\)\);\r?\n    return \(\) => observer\.disconnect\(\);\r?\n  }, \[path\]\);/,
`    const applyReveal = () => {
      const allTargets = document.querySelectorAll(selectors.join(','));
      allTargets.forEach((element, index) => {
        if (!element.classList.contains('reveal-item') && !element.classList.contains('is-visible')) {
          if (isReduced) {
            element.classList.add('is-visible');
          } else {
            element.classList.add('reveal-item');
            element.style.setProperty('--reveal-delay', \`\${(index % 4) * 70}ms\`);
            observer.observe(element);
          }
        }
      });
    };

    applyReveal();

    const mutationObserver = new MutationObserver(() => applyReveal());
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [path]);`);

fs.writeFileSync('frontend/src/App.jsx', c);
console.log('Fixed targets reference error!');
