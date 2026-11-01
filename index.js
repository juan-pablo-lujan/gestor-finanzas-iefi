import Transaccion from "./classes/Transaccion.js";

const form = document.getElementById("form-transaccion");
const listaTransacciones = document.getElementById("lista-transacciones");
const resumenCategorias = document.getElementById("resumen-categorias");
const elIngresos = document.getElementById("ingresos-totales");
const elGastos = document.getElementById("gastos-totales");
const elBalance = document.getElementById("balance-neto");

function formatearMoneda(valor) {
    return valor.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS"
    });
}

function calcularTotales() {
    let ingresos = 0;
    let gastos = 0;

    for (let i = 0; i < Transaccion.historial.length; i++) {
        const t = Transaccion.historial[i];
        if (t.tipo === "ingreso") {
            ingresos += t.monto;
        } else {
            gastos += t.monto;
        }
    }

    return { ingresos, gastos, balance: ingresos - gastos };
}

function agruparPorCategoria() {
    const grupos = {};

    Transaccion.historial.forEach((t) => {
        const signo = t.tipo === "ingreso" ? 1 : -1;
        grupos[t.categoria] = (grupos[t.categoria] || 0) + signo * t.monto;
    });

    return grupos;
}

function actualizarPanelBalance() {
    const { ingresos, gastos, balance } = calcularTotales();

    elIngresos.textContent = formatearMoneda(ingresos);
    elGastos.textContent = formatearMoneda(gastos);
    elBalance.textContent = formatearMoneda(balance);

    elBalance.classList.toggle("text-red-600", balance < 0);
    elBalance.classList.toggle("text-emerald-600", balance >= 0);
}

function actualizarResumenCategorias() {
    resumenCategorias.replaceChildren();

    const grupos = agruparPorCategoria();
    const categorias = Object.keys(grupos);

    if (categorias.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "col-span-full text-sm text-slate-950";
        vacio.textContent = "Todavía no hay movimientos.";
        resumenCategorias.appendChild(vacio);
        return;
    }

    categorias.forEach((categoria) => {
        const total = grupos[categoria];

        const tarjeta = document.createElement("div");
        tarjeta.className = "bg-stone-100 p-3 rounded-lg border border-slate-200";

        const nombre = document.createElement("p");
        nombre.className = "text-xs font-semibold text-slate-950 uppercase";
        nombre.textContent = categoria;

        const monto = document.createElement("p");
        monto.className =
            "text-base font-bold mt-1 " +
            (total < 0 ? "text-red-600" : "text-emerald-600");
        monto.textContent = formatearMoneda(total);

        tarjeta.append(nombre, monto);
        resumenCategorias.appendChild(tarjeta);
    });
}

function actualizarFilaVacia() {
    const filaVacia = document.getElementById("fila-vacia");
    const hayFilas = Transaccion.historial.length > 0;

    if (hayFilas && filaVacia) {
        filaVacia.remove();
    } else if (!hayFilas && !filaVacia) {
        const tr = document.createElement("tr");
        tr.id = "fila-vacia";
        const td = document.createElement("td");
        td.colSpan = 5;
        td.className = "py-8 px-4 text-center text-slate-500";
        td.textContent = "No hay movimientos registrados.";
        tr.appendChild(td);
        listaTransacciones.appendChild(tr);
    }
}

function actualizarResumenes() {
    actualizarPanelBalance();
    actualizarResumenCategorias();
    actualizarFilaVacia();
}

function crearCelda(clases) {
    const td = document.createElement("td");
    td.className = clases;
    return td;
}

function agregarFilaAlHistorial(transaccion) {
    const esIngreso = transaccion.tipo === "ingreso";

    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-50 transition";
    tr.dataset.id = transaccion.id;

    const tdDescripcion = crearCelda("py-3.5 px-4 font-medium text-slate-800");
    tdDescripcion.textContent = transaccion.descripcion;

    const tdCategoria = crearCelda("py-3.5 px-4");
    const badgeCategoria = document.createElement("span");
    badgeCategoria.className =
        "bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full border border-slate-200";
    badgeCategoria.textContent = transaccion.categoria;
    tdCategoria.appendChild(badgeCategoria);

    const tdTipo = crearCelda("py-3.5 px-4");
    const badgeTipo = document.createElement("span");
    badgeTipo.className =
        "text-xs px-2 py-0.5 rounded font-semibold " +
        (esIngreso ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-600");
    badgeTipo.textContent = esIngreso ? "Ingreso" : "Gasto";
    tdTipo.appendChild(badgeTipo);

    const tdMonto = crearCelda(
        "py-3.5 px-4 text-right font-semibold " +
        (esIngreso ? "text-emerald-800" : "text-red-600")
    );
    tdMonto.textContent = (esIngreso ? "+" : "-") + formatearMoneda(transaccion.monto);

    const tdAcciones = crearCelda("py-3.5 px-4 text-center");
    const btnEliminar = document.createElement("button");
    btnEliminar.type = "button";
    btnEliminar.className = "text-red-500 hover:text-red-700 transition px-2 py-1";
    btnEliminar.title = "Eliminar";
    btnEliminar.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    btnEliminar.addEventListener("click", () => eliminarTransaccion(transaccion.id));
    tdAcciones.appendChild(btnEliminar);

    tr.append(tdDescripcion, tdCategoria, tdTipo, tdMonto, tdAcciones);
    listaTransacciones.prepend(tr);
}


function renderizarHistorialCompleto() {
    listaTransacciones.replaceChildren();
    Transaccion.historial.forEach((t) => {
        agregarFilaAlHistorial(t);
    });
}


function eliminarTransaccion(id) {
    Transaccion.eliminar(id);

    const fila = listaTransacciones.querySelector(`tr[data-id="${id}"]`);
    if (fila) fila.remove();

    actualizarResumenes();
}

form.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const datos = new FormData(form);
    const descripcion = datos.get("descripcion").trim();
    const monto = parseFloat(datos.get("monto"));
    const tipo = datos.get("tipo");
    const categoria = datos.get("categoria");

    if (!descripcion || !(monto > 0) || !tipo || !categoria) return;

    const id = Date.now();

    const nueva = Transaccion.crear({ id, tipo, descripcion, monto, categoria });

    agregarFilaAlHistorial(nueva);
    actualizarResumenes();
    form.reset();
    document.getElementById("descripcion").focus();
});

renderizarHistorialCompleto();
actualizarResumenes();