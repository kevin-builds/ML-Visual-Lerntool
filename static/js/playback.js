const STEPS_PER_SECOND = 40;

export function createPlayback({ length, position, move, onFrame, speed }) {
  let timer = null;

  function stop() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function running() {
    return timer !== null;
  }

  function start() {
    stop();

    const last = length() - 1;
    if (position() >= last) {
      move(0);
    }

    const perSecond = STEPS_PER_SECOND * speed();
    const startedAt = performance.now();
    const startStep = position();

    function frame() {
      const elapsed = (performance.now() - startedAt) / 1000;
      move(Math.min(last, startStep + Math.floor(elapsed * perSecond)));
      onFrame();

      if (position() >= last) {
        timer = null;
        return;
      }
      timer = setTimeout(frame, 1000 / perSecond);
    }

    frame();
  }

  return { start, stop, running };
}
