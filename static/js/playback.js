const SCHRITTE_JE_SEKUNDE = 40;

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

    const letzte = length() - 1;
    if (position() >= letzte) {
      move(0);
    }

    const proSekunde = SCHRITTE_JE_SEKUNDE * speed();
    const begonnen = performance.now();
    const startSchritt = position();

    function frame() {
      const vergangen = (performance.now() - begonnen) / 1000;
      move(Math.min(letzte, startSchritt + Math.floor(vergangen * proSekunde)));
      onFrame();

      if (position() >= letzte) {
        timer = null;
        return;
      }
      timer = setTimeout(frame, 1000 / proSekunde);
    }

    frame();
  }

  return { start, stop, running };
}
