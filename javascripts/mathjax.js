/* Configure MathJax and re-typeset on Material's instant navigation */
window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
    tags: 'ams' // \label, \eqref, \tag
  },
  options: {
    skipHtmlTags: ['script','noscript','style','textarea','pre','code']
  }
};
document$.subscribe(() => {  // provided by Material
  if (window.MathJax?.typesetPromise) window.MathJax.typesetPromise();
});

