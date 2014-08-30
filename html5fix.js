if (window.requestAnimationFrame === undefined) {
  if (window.mozRequestAnimationFrame !== undefined) {
    window.requestAnimationFrame = window.mozRequestAnimationFrame;
  }
}

