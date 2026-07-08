// ============================================
// UI Feedback compartido — public/ui-feedback.js
// Provee confirmaciones y notificaciones (toasts) consistentes
// para todo el panel de administración.
//
// API global:
//   mostrarToast(mensaje, tipo)         tipo: 'ok' | 'error' | 'info' | 'warn'  (por defecto 'ok')
//   confirmarAccion({ titulo, mensaje, textoConfirmar, textoCancelar, peligro }) -> Promise<boolean>
//
// Es autocontenido: inyecta sus propios estilos, no depende de ningún CSS externo.
// ============================================
(function () {
  if (window.__uiFeedbackCargado) return;
  window.__uiFeedbackCargado = true;

  // --- Estilos autocontenidos ---
  const style = document.createElement('style');
  style.textContent = `
    .uf-toast-cont {
      position: fixed; top: 18px; right: 18px; z-index: 99999;
      display: flex; flex-direction: column; gap: 10px;
      font-family: 'Montserrat', system-ui, sans-serif;
      pointer-events: none;
    }
    .uf-toast {
      display: flex; align-items: center; gap: 10px;
      min-width: 260px; max-width: 380px;
      padding: 12px 16px; border-radius: 10px;
      background: #fff; color: #1f2937;
      box-shadow: 0 10px 30px rgba(0,0,0,.18);
      border-left: 4px solid #7494ec;
      font-size: 14px; font-weight: 500;
      transform: translateX(120%); opacity: 0;
      transition: transform .35s cubic-bezier(.22,1,.36,1), opacity .35s;
      pointer-events: auto;
    }
    .uf-toast.uf-visible { transform: translateX(0); opacity: 1; }
    .uf-toast i { font-size: 20px; flex-shrink: 0; }
    .uf-toast.ok    { border-left-color: #059669; }
    .uf-toast.ok i    { color: #059669; }
    .uf-toast.error { border-left-color: #dc2626; }
    .uf-toast.error i { color: #dc2626; }
    .uf-toast.info  { border-left-color: #2563eb; }
    .uf-toast.info i  { color: #2563eb; }
    .uf-toast.warn  { border-left-color: #d97706; }
    .uf-toast.warn i  { color: #d97706; }

    .uf-modal-overlay {
      position: fixed; inset: 0; background: rgba(15,23,42,.55);
      display: flex; align-items: center; justify-content: center;
      z-index: 99998; padding: 20px;
      opacity: 0; transition: opacity .2s;
      font-family: 'Montserrat', system-ui, sans-serif;
    }
    .uf-modal-overlay.uf-visible { opacity: 1; }
    .uf-modal {
      background: #fff; border-radius: 14px; width: 100%; max-width: 420px;
      box-shadow: 0 25px 60px rgba(0,0,0,.3); overflow: hidden;
      transform: scale(.94); transition: transform .2s;
    }
    .uf-modal-overlay.uf-visible .uf-modal { transform: scale(1); }
    .uf-modal-head {
      display: flex; align-items: center; gap: 12px;
      padding: 18px 22px 0;
    }
    .uf-modal-head .uf-ico {
      width: 42px; height: 42px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 24px; flex-shrink: 0;
      background: #eef2ff; color: #7494ec;
    }
    .uf-modal.peligro .uf-modal-head .uf-ico { background: #fee2e2; color: #dc2626; }
    .uf-modal-head h3 { margin: 0; font-size: 17px; font-weight: 600; color: #111827; }
    .uf-modal-body { padding: 12px 22px 4px; color: #4b5563; font-size: 14px; line-height: 1.5; }
    .uf-modal-foot { display: flex; gap: 10px; justify-content: flex-end; padding: 16px 22px 20px; }
    .uf-btn {
      font: inherit; font-weight: 600; font-size: 14px; cursor: pointer;
      padding: 9px 18px; border-radius: 8px; border: 1px solid transparent;
      transition: background .15s, border-color .15s;
    }
    .uf-btn.cancelar { background: #fff; color: #374151; border-color: #e5e7eb; }
    .uf-btn.cancelar:hover { background: #f3f4f6; }
    .uf-btn.confirmar { background: #7494ec; color: #fff; }
    .uf-btn.confirmar:hover { background: #5a7bd4; }
    .uf-modal.peligro .uf-btn.confirmar { background: #dc2626; }
    .uf-modal.peligro .uf-btn.confirmar:hover { background: #b91c1c; }
  `;
  document.head.appendChild(style);

  // --- Contenedor de toasts ---
  let cont = null;
  function getCont() {
    if (!cont) {
      cont = document.createElement('div');
      cont.className = 'uf-toast-cont';
      document.body.appendChild(cont);
    }
    return cont;
  }

  const ICONOS = {
    ok:    'bx-check-circle',
    error: 'bx-x-circle',
    info:  'bx-info-circle',
    warn:  'bx-error',
  };

  window.mostrarToast = function (mensaje, tipo) {
    tipo = ICONOS[tipo] ? tipo : 'ok';
    const el = document.createElement('div');
    el.className = 'uf-toast ' + tipo;
    el.innerHTML = `<i class='bx ${ICONOS[tipo]}'></i><span></span>`;
    el.querySelector('span').textContent = mensaje;
    getCont().appendChild(el);
    requestAnimationFrame(() => el.classList.add('uf-visible'));
    const quitar = () => {
      el.classList.remove('uf-visible');
      setTimeout(() => el.remove(), 400);
    };
    const t = setTimeout(quitar, 3200);
    el.addEventListener('click', () => { clearTimeout(t); quitar(); });
    return el;
  };

  window.confirmarAccion = function (opts) {
    opts = opts || {};
    const {
      titulo = '¿Confirmar acción?',
      mensaje = '',
      textoConfirmar = 'Confirmar',
      textoCancelar = 'Cancelar',
      peligro = false,
    } = opts;

    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'uf-modal-overlay';
      overlay.innerHTML = `
        <div class="uf-modal ${peligro ? 'peligro' : ''}" role="dialog" aria-modal="true">
          <div class="uf-modal-head">
            <div class="uf-ico"><i class='bx ${peligro ? 'bx-error-circle' : 'bx-help-circle'}'></i></div>
            <h3></h3>
          </div>
          <div class="uf-modal-body"></div>
          <div class="uf-modal-foot">
            <button class="uf-btn cancelar" type="button"></button>
            <button class="uf-btn confirmar" type="button"></button>
          </div>
        </div>`;
      overlay.querySelector('h3').textContent = titulo;
      overlay.querySelector('.uf-modal-body').textContent = mensaje;
      const btnCancelar = overlay.querySelector('.cancelar');
      const btnConfirmar = overlay.querySelector('.confirmar');
      btnCancelar.textContent = textoCancelar;
      btnConfirmar.textContent = textoConfirmar;

      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.classList.add('uf-visible'));
      setTimeout(() => btnConfirmar.focus(), 60);

      function cerrar(valor) {
        overlay.classList.remove('uf-visible');
        setTimeout(() => overlay.remove(), 220);
        document.removeEventListener('keydown', onKey);
        resolve(valor);
      }
      function onKey(e) {
        if (e.key === 'Escape') cerrar(false);
        if (e.key === 'Enter') cerrar(true);
      }
      btnCancelar.addEventListener('click', () => cerrar(false));
      btnConfirmar.addEventListener('click', () => cerrar(true));
      overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrar(false); });
      document.addEventListener('keydown', onKey);
    });
  };
})();
