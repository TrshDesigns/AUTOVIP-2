//declaracion de variables a usar
var urlBase = "https://ha-front-api-proyecto-final.vercel.app";
var urlMarcas = urlBase + "/brands";
var urlModelos = urlBase + "/models";
var urlAutos = urlBase + "/cars";

var selectAño = document.getElementById("año");
var selectMarca = document.getElementById("marca");
var selectModelo = document.getElementById("modelo");
var selectEstado = document.getElementById("estado");

var selectAñoModal = document.getElementById("año-modal");
var selectMarcaModal = document.getElementById("marca-modal");
var selectModeloModal = document.getElementById("modelo-modal");
var selectEstadoModal = document.getElementById("estado-modal");

var botonFiltrarEscritorio = document.querySelector(
  ".sticky-filter-container .btn-warning"
);
var botonFiltrarModal = document.getElementById("aplicar-filtro-modal");
var contenedorAutos = document.getElementById("cars-container");

function llenarSelectsAño() {
  var selects = [selectAño, selectAñoModal];
  for (var i = 0; i < selects.length; i++) {
    if (selects[i]) {
      selects[i].innerHTML = '<option value="">Cualquier año</option>';
      for (var año = 2023; año >= 1900; año--) {
        selects[i].innerHTML +=
          '<option value="' + año + '">' + año + "</option>";
      }
    }
  }
}

function cargarListaMarcas() {
  fetch(urlMarcas)
    .then(function (respuesta) {
      return respuesta.json();
    })
    .then(function (listaMarcas) {
      var selects = [selectMarca, selectMarcaModal];
      for (var i = 0; i < selects.length; i++) {
        if (selects[i]) {
          selects[i].innerHTML = '<option value="">Cualquier marca</option>';
          for (var j = 0; j < listaMarcas.length; j++) {
            selects[i].innerHTML +=
              '<option value="' +
              listaMarcas[j] +
              '">' +
              listaMarcas[j] +
              "</option>";
          }
        }
      }
    })
    .catch(function () {
      alert("No se pudieron cargar las marcas");
    });
}

function cargarListaModelos(marca, selectObjetivo) {
  var otroSelect =
    selectObjetivo == selectModelo ? selectModeloModal : selectModelo;
  if (otroSelect) {
    otroSelect.innerHTML =
      '<option value="">Primero selecciona una marca</option>';
    otroSelect.disabled = true;
  }
  if (!marca) {
    selectObjetivo.innerHTML =
      '<option value="">Primero selecciona una marca</option>';
    selectObjetivo.disabled = true;
    return;
  }
  fetch(urlModelos + "?brand=" + marca)
    .then(function (respuesta) {
      return respuesta.json();
    })
    .then(function (listaModelos) {
      selectObjetivo.innerHTML = '<option value="">Todos los modelos</option>';
      for (var i = 0; i < listaModelos.length; i++) {
        selectObjetivo.innerHTML +=
          '<option value="' +
          listaModelos[i] +
          '">' +
          listaModelos[i] +
          "</option>";
      }
      selectObjetivo.disabled = false;
    })
    .catch(function () {
      selectObjetivo.innerHTML = '<option value="">Error al cargar</option>';
      selectObjetivo.disabled = true;
    });
}

//Load spinner de carga
function cargarTodosLosAutos() {
  contenedorAutos.querySelector(".row").innerHTML =
    '<div class="col-12 text-center py-5"><div class="spinner-border text-primary"></div></div>';
  fetch(urlAutos)
    .then(function (respuesta) {
      return respuesta.json();
    })
    .then(function (listaAutos) {
      mostrarListaAutos(listaAutos);
    })
    .catch(function () {
      alert("Error al cargar autos");
    });
}

function aplicarFiltro() {
  contenedorAutos.querySelector(".row").innerHTML =
    '<div class="col-12 text-center py-5"><div class="spinner-border text-primary"></div></div>';
  var añoSeleccionado = selectAño.value || selectAñoModal.value || "";
  var marcaSeleccionada = selectMarca.value || selectMarcaModal.value || "";
  var modeloSeleccionado = selectModelo.value || selectModeloModal.value || "";
  var estadoSeleccionado = selectEstado.value || selectEstadoModal.value || "";
  var url = urlAutos;
  var parametros = [];
  if (añoSeleccionado) parametros.push("year=" + añoSeleccionado);
  if (marcaSeleccionada) parametros.push("brand=" + marcaSeleccionada);
  if (modeloSeleccionado) parametros.push("model=" + modeloSeleccionado);
  if (estadoSeleccionado) parametros.push("status=" + estadoSeleccionado);
  if (parametros.length > 0) url += "?" + parametros.join("&");
  fetch(url)
    .then(function (respuesta) {
      return respuesta.json();
    })
    .then(function (listaAutos) {
      mostrarListaAutos(listaAutos);
    })
    .catch(function () {
      alert("Error al filtrar");
    });
}

//Mostrar los vehiculos en el html usando la fila
function mostrarListaAutos(listaAutos) {
  var fila = contenedorAutos.querySelector(".row");
  if (listaAutos.length == 0) {
    fila.innerHTML =
      '<div class="col-12 text-center py-5"><h5 class="text-muted">No se encontraron vehículos</h5><button class="btn btn-outline-primary mt-3" onclick="limpiarFiltros()">Limpiar filtros</button></div>';
    return;
  }
  var html = "";
  for (var i = 0; i < listaAutos.length; i++) {
    var auto = listaAutos[i];
    var esNuevo = auto.status == 1;
    var precioUsd = auto.price_usd;
    var precioUyu = auto.price_uyu;
    var descripcionCorta = auto.description;
    if (descripcionCorta.length > 200)
      descripcionCorta = descripcionCorta.substring(0, 200) + "...";
    html +=
      '<div class="col-lg-5 col-sm-12 mb-4"><div class="position-relative"><img src="' +
      auto.image +
      '" class="img-fluid border border-secondary-subtle p-1 w-100" alt="' +
      auto.brand +
      " " +
      auto.model +
      '"/>';
    if (esNuevo) {
      html +=
        '<p class="position-absolute top-0 start-0 btn btn-warning m-2 rounded-2 text-white fw-bold">Nuevo</p>';
    } else {
      html +=
        '<p class="position-absolute top-0 start-0 btn btn-success m-2 rounded-2 text-white fw-bold">Usado</p>';
    }
    html +=
      '</div></div><div class="col-lg-7 col-sm-12 mb-4"><div class="row p-2"><div class="col-6"><h3>' +
      auto.brand +
      " " +
      auto.model +
      '</h3></div><div class="col-6 text-end text-md-start fs-6"><p>' +
      auto.year +
      " | USD " +
      precioUsd +
      " / UYU " +
      precioUyu +
      " | " +
      generarEstrellas(auto.rating) +
      '</p></div></div><p class="p-2">' +
      descripcionCorta +
      '</p><div><button class="btn btn-success me-2">Comprar</button><button class="btn btn-outline-secondary me-2">Información</button><button class="btn btn-outline-secondary">Compartir</button></div></div>';
    if (i < listaAutos.length - 1) html += '<hr class="my-4 w-100 hr-style">';
  }
  fila.innerHTML = html;
}

function generarEstrellas(puntuacion) {
  if (!puntuacion) puntuacion = 0;
  puntuacion = Math.round(puntuacion);
  if (puntuacion < 0) puntuacion = 0;
  if (puntuacion > 5) puntuacion = 5;
  var estrellasHtml = "";
  for (var i = 0; i < 5; i++) {
    if (i < puntuacion)
      estrellasHtml += '<i class="bi bi-star-fill text-warning"></i>';
    else estrellasHtml += '<i class="bi bi-star text-warning"></i>';
  }
  return estrellasHtml;
}

function sincronizarFiltros() {
  selectMarca.onchange = selectMarcaModal.onchange = function () {
    var valor = this.value;
    selectMarca.value = valor;
    selectMarcaModal.value = valor;
    var selectDestino = this.id.includes("modal")
      ? selectModeloModal
      : selectModelo;
    cargarListaModelos(valor, selectDestino);
  };
  selectAño.onchange = selectAñoModal.onchange = function () {
    var valor = this.value;
    selectAño.value = valor;
    selectAñoModal.value = valor;
  };
  selectModelo.onchange = selectModeloModal.onchange = function () {
    var valor = this.value;
    selectModelo.value = valor;
    selectModeloModal.value = valor;
  };
  selectEstado.onchange = selectEstadoModal.onchange = function () {
    var valor = this.value;
    selectEstado.value = valor;
    selectEstadoModal.value = valor;
  };
}

function limpiarFiltros() {
  selectAño.value =
    selectMarca.value =
    selectModelo.value =
    selectEstado.value =
      "";
  selectAñoModal.value =
    selectMarcaModal.value =
    selectModeloModal.value =
    selectEstadoModal.value =
      "";
  cargarTodosLosAutos();
}

window.limpiarFiltros = limpiarFiltros;

//Ejecuccion de funciones on window load
window.onload = function () {
  llenarSelectsAño();
  cargarListaMarcas();
  cargarTodosLosAutos();
  sincronizarFiltros();
  botonFiltrarEscritorio.onclick = aplicarFiltro;
  botonFiltrarModal.onclick = function () {
    aplicarFiltro();
    var modal = bootstrap.Modal.getInstance(
      document.getElementById("exampleModal")
    );
    modal.hide();
  };
};
