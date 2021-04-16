export const UtterancesComments: React.FC = () => (
  <section
    ref={(elem) => {
      if (!elem || elem.childNodes.length) {
        return;
      }

      const scriptElem = document.createElement('script');
      scriptElem.src = 'https://utteranc.es/client.js';
      scriptElem.async = true;
      scriptElem.crossOrigin = 'anonymous';
      scriptElem.setAttribute('repo', 'luizwhite/utterances-blog-comments');
      scriptElem.setAttribute('issue-term', 'pathname');
      scriptElem.setAttribute('label', '💬 comments');
      scriptElem.setAttribute('theme', 'github-dark');
      elem.appendChild(scriptElem);
    }}
  />
);
