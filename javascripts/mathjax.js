// MathJax v3 configuration for MkDocs Material + pymdownx.arithmatex (generic mode)
// See: https://squidfunk.github.io/mkdocs-material/reference/mathjax/

window.MathJax = {
  tex: {
    inlineMath: [["\\(", "\\)"]],
    displayMath: [["$$", "$$"]],
    processEscapes: true,
  },
  options: {
    ignoreHtmlClass: ".*|",
    processHtmlClass: "arithmatex",
  },
};

// Re-render math on every page change (Material's instant navigation)
document$.subscribe(() => {
  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise();
  }
});

