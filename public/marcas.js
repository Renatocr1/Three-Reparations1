// ============================================
// Marcas genéricas y sus modelos para los desplegables de "pedir cita".
// El select de Modelo depende de la Marca elegida.
// ============================================
const MARCAS_MODELOS = {
  'Samsung':  ['Galaxy S23', 'Galaxy S22', 'Galaxy A54', 'Galaxy A14', 'Galaxy Note 20', 'Otro'],
  'Apple':    ['iPhone 15', 'iPhone 14', 'iPhone 13', 'iPhone 12', 'MacBook Air', 'MacBook Pro', 'iPad', 'Otro'],
  'Xiaomi':   ['Redmi Note 12', 'Redmi Note 11', 'Poco X5', 'Mi 11', 'Otro'],
  'Motorola': ['Moto G60', 'Moto G54', 'Moto E13', 'Edge 40', 'Otro'],
  'Huawei':   ['P30', 'P40', 'Mate 20', 'Y9', 'Otro'],
  'Lenovo':   ['IdeaPad 3', 'ThinkPad', 'Legion 5', 'Yoga', 'Otro'],
  'HP':       ['Pavilion', 'EliteBook', 'Omen', 'ProBook', 'Otro'],
  'Dell':     ['Inspiron', 'XPS', 'Latitude', 'Otro'],
  'Asus':     ['VivoBook', 'ZenBook', 'ROG', 'Otro'],
  'Acer':     ['Aspire', 'Nitro', 'Swift', 'Otro'],
  'LG':       ['K50', 'G8', 'Velvet', 'Otro'],
  'Otro':     ['Otro'],
};

// Rellena el <select> de marcas y enlaza el de modelos (dependiente de la marca).
function inicializarMarcasModelos(selMarcaId, selModeloId) {
  const selMarca = document.getElementById(selMarcaId);
  const selModelo = document.getElementById(selModeloId);
  if (!selMarca || !selModelo) return;

  selMarca.innerHTML = '<option value="">Selecciona una marca…</option>' +
    Object.keys(MARCAS_MODELOS).map(m => `<option value="${m}">${m}</option>`).join('');
  reiniciarModelos(selModeloId);

  selMarca.addEventListener('change', () => {
    const modelos = MARCAS_MODELOS[selMarca.value] || [];
    if (!modelos.length) { reiniciarModelos(selModeloId); return; }
    selModelo.innerHTML = '<option value="">Selecciona un modelo…</option>' +
      modelos.map(mo => `<option value="${mo}">${mo}</option>`).join('');
    selModelo.disabled = false;
  });
}

// Deja el select de modelos en su estado inicial (deshabilitado).
function reiniciarModelos(selModeloId) {
  const selModelo = document.getElementById(selModeloId);
  if (!selModelo) return;
  selModelo.innerHTML = '<option value="">Elige primero una marca…</option>';
  selModelo.disabled = true;
}
