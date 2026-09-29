const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'frontend/src/App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

const targetStr = `    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -45px' },
    );

    targets.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [path]);`;

const replaceStr = `    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -45px' },
    );

    const applyReveal = () => {
      const allTargets = document.querySelectorAll(selectors);
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
  }, [path]);`;

const hookStartStr = `const targets = document.querySelectorAll(`;
content = content.replace(hookStartStr, `const selectors = `);
content = content.replace(`.join(','),\n    );`, `.join(',');\n`);
content = content.replace(`    targets.forEach((element, index) => {\n      element.classList.add('reveal-item');\n      element.style.setProperty('--reveal-delay', \`\${(index % 4) * 70}ms\`);\n    });\n`, ``);

content = content.replace(targetStr, replaceStr);

fs.writeFileSync(appPath, content);
console.log('App.jsx observer patched successfully.');
