const API_BASE = "https://ha-front-api-proyecto-final.vercel.app";
const BRANDS_URL = `${API_BASE}/brands`;
const MODELS_URL = `${API_BASE}/models`;
const CARS_URL = `${API_BASE}/cars`;

const añoSelect = document.getElementById("año");
const marcaSelect = document.getElementById("marca");
const modeloSelect = document.getElementById("modelo");
const estadoSelect = document.getElementById("estado");

const añoModal = document.getElementById("año-modal");
const marcaModal = document.getElementById("marca-modal");
const modeloModal = document.getElementById("modelo-modal");
const estadoModal = document.getElementById("estado-modal");

const filtrarBtnDesktop = document.querySelector(
  "form.d-none.d-md-block .btn-warning"
);
const aplicarFiltroModal = document.getElementById("aplicar-filtro-modal");
const carsContainer = document.getElementById("cars-container");

let allCars = [];

function popularAños() {
  const selects = [añoSelect, añoModal];
  selects.forEach((sel) => {
    if (!sel) return;
    sel.innerHTML = '<option value="">Seleccionar Año</option>';
    for (let y = 2023; y >= 1900; y--) sel.add(new Option(y, y));
  });
}

async function cargarMarcas() {
  try {
    const res = await fetch(BRANDS_URL);
    if (!res.ok) throw new Error();
    const marcas = await res.json();

    const selects = [marcaSelect, marcaModal];
    selects.forEach((sel) => {
      if (!sel) return;
      sel.innerHTML = '<option value="">Seleccionar Marca</option>';
      marcas.forEach((b) => sel.add(new Option(b, b)));
    });
  } catch (e) {
    console.error("Error brands:", e);
    showAlert("No se pudieron cargar las marcas.", "danger");
  }
}

async function cargarModelos(brand, targetSelect) {
  if (!brand || !targetSelect) {
    targetSelect.innerHTML = '<option value="">Selecciona marca</option>';
    targetSelect.disabled = true;
    return;
  }

  try {
    const res = await fetch(`${MODELS_URL}?brand=${encodeURIComponent(brand)}`);
    if (!res.ok) throw new Error();
    const models = await res.json();

    targetSelect.innerHTML = '<option value="">Todos los modelos</option>';
    models.forEach((m) => targetSelect.add(new Option(m, m)));
    targetSelect.disabled = false;
  } catch (e) {
    console.error("Error models:", e);
    targetSelect.innerHTML = '<option value="">Error al cargar</option>';
    targetSelect.disabled = true;
  }
}

async function cargarTodosLosAutos() {
  try {
    const res = await fetch(CARS_URL);
    if (!res.ok) throw new Error();
    allCars = await res.json();
    renderCars(allCars);
  } catch (e) {
    console.error("Error cars:", e);
    showAlert("No se pudieron cargar los autos.", "danger");
  }
}

async function aplicarFiltro() {
  const year = añoSelect?.value || añoModal?.value || "";
  const brand = marcaSelect?.value || marcaModal?.value || "";
  const model = modeloSelect?.value || modeloModal?.value || "";
  const status = estadoSelect?.value || estadoModal?.value || "";

  let url = CARS_URL;
  const params = [];
  if (year) params.push(`year=${year}`);
  if (brand) params.push(`brand=${encodeURIComponent(brand)}`);
  if (model) params.push(`model=${encodeURIComponent(model)}`);
  if (status) params.push(`status=${status}`);

  if (params.length) url += `?${params.join("&")}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const cars = await res.json();
    renderCars(cars);
  } catch (e) {
    console.error("Error filtro:", e);
    showAlert("Error al filtrar.", "warning");
  }
}

function renderCars(cars) {
  const row = carsContainer.querySelector(".row");
  row.innerHTML = "";

  if (!cars.length) {
    cargarTodosLosAutos();
    showAlert(
      "No hemos encontrado el vehiculo que estas buscando! , intentalo denuevo",
      "success"
    );
    return;
  }

  cars.forEach((car, i) => {
    const isNew = car.status === 1;
    const usd = car.price_usd.toLocaleString();
    const uyu = car.price_uyu.toLocaleString();
    const desc =
      car.description.length > 200
        ? car.description.substring(0, 200) + "..."
        : car.description;

    row.innerHTML += `
      <div class="col-lg-5 col-sm-12 mb-4">
        <div class="position-relative">
          <img src="${
            car.image
          }" class="img-fluid border border-secondary-subtle p-1 w-100"
               alt="${car.brand} ${car.model}" />
          ${
            isNew
              ? '<p class="position-absolute top-0 start-0 btn btn-warning m-2 rounded-2 text-white fw-bold">Nuevo</p>'
              : ""
          }
        </div>
      </div>

      <div class="col-lg-7 col-sm-12 mb-4">
        <div class="row p-2">
          <div class="col-6"><h3>${car.brand} ${car.model}</h3></div>
          <div class="col-6 text-end text-md-start fs-6">
            <p>${car.year} | USD ${usd} / UYU ${uyu} | ${getStars(
      car.rating
    )}</p>
          </div>
        </div>
        <p class="p-2">${desc}</p>
        <div>
          <button class="btn btn-success me-2"><i class="bi bi-cart-fill"></i> Comprar</button>
          <button class="btn btn-outline-secondary me-2"><i class="bi bi-plus-square"></i> Información</button>
          <button class="btn btn-outline-secondary"><i class="bi bi-box-arrow-up-right"></i> Compartir</button>
        </div>
      </div>
      ${i < cars.length - 1 ? '<hr class="my-4 w-100">' : ""}
    `;
  });
}

function getStars(r) {
  return Array.from({ length: 5 }, (_, i) =>
    i < r
      ? '<i class="bi bi-star-fill text-warning"></i>'
      : '<i class="bi bi-star text-warning"></i>'
  ).join("");
}

function showAlert(msg, type = "info") {
  const existing = carsContainer.querySelector(".alert");
  if (existing) existing.remove();

  carsContainer.insertAdjacentHTML(
    "afterbegin",
    `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${msg}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `
  );
}

function sincronizarFiltros() {
  [marcaSelect, marcaModal].forEach((sel) => {
    sel?.addEventListener("change", () => {
      const val = sel.value;
      [marcaSelect, marcaModal].forEach(
        (s) => s && s !== sel && (s.value = val)
      );
      const target = sel.id.includes("modal") ? modeloModal : modeloSelect;
      cargarModelos(val, target);
    });
  });

  ["año", "modelo", "estado"].forEach((field) => {
    const desk = document.getElementById(field);
    const mob = document.getElementById(field + "-modal");
    [desk, mob].forEach((sel) => {
      sel?.addEventListener("change", () => {
        const val = sel.value;
        [desk, mob].forEach((s) => s && s !== sel && (s.value = val));
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  popularAños();
  cargarMarcas();
  cargarTodosLosAutos();
  sincronizarFiltros();

  // Botones filtrar
  filtrarBtnDesktop?.addEventListener("click", aplicarFiltro);
  aplicarFiltroModal?.addEventListener("click", () => {
    aplicarFiltro();
    bootstrap.Modal.getInstance(document.getElementById("exampleModal")).hide();
  });
});
