import Transaccion from "./classes/Transaccion.js";

const form = document.getElementById("form-transaccion");
const listaTransacciones = document.getElementById("lista-transacciones");
const elIngresos = document.getElementById("ingresos-totales");
const elGastos = document.getElementById("gastos-totales");
const elBalance = document.getElementById("balance-neto");

// Instancias globales para los gráficos
let barChartInstance = null;
let lineChartInstance = null;

// Establecer la fecha de hoy por defecto en el input de fecha
document.addEventListener("DOMContentLoaded", () => {
    const inputFecha = document.getElementById("fecha");
    if (inputFecha) {
        inputFecha.value = dayjs().format("YYYY-MM-DD");
    }
});

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

function actualizarPanelBalance() {
    const { ingresos, gastos, balance } = calcularTotales();

    elIngresos.textContent = formatearMoneda(ingresos);
    elGastos.textContent = formatearMoneda(gastos);
    elBalance.textContent = formatearMoneda(balance);

    elBalance.classList.toggle("text-red-600", balance < 0);
    elBalance.classList.toggle("text-white", balance >= 0);
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
        td.colSpan = 6; // Actualizado a 6 por la nueva columna de fecha
        td.className = "py-8 px-4 text-center text-stone-500";
        td.textContent = "No hay movimientos registrados.";
        tr.appendChild(td);
        listaTransacciones.appendChild(tr);
    }
}

function crearCelda(clases) {
    const td = document.createElement("td");
    td.className = clases;
    return td;
}

function agregarFilaAlHistorial(transaccion) {
    const esIngreso = transaccion.tipo === "ingreso";

    const tr = document.createElement("tr");
    tr.className = "hover:bg-stone-50 transition";
    tr.dataset.id = transaccion.id;

    const tdFecha = crearCelda("py-3.5 px-4 text-stone-600 font-medium");
    tdFecha.textContent = dayjs(transaccion.fecha).format("DD/MM/YYYY");

    const tdDescripcion = crearCelda("py-3.5 px-4 font-medium text-stone-800");
    tdDescripcion.textContent = transaccion.descripcion;

    const tdCategoria = crearCelda("py-3.5 px-4");
    const badgeCategoria = document.createElement("span");
    badgeCategoria.className =
        "bg-stone-100 text-stone-600 text-xs px-2.5 py-1 rounded-full border border-stone-200";
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

    tr.append(tdFecha, tdDescripcion, tdCategoria, tdTipo, tdMonto, tdAcciones);
    listaTransacciones.prepend(tr);
}

function renderizarGraficos() {
    const categoriasTotales = {};
    Transaccion.historial.forEach(t => {
        const signo = t.tipo === "ingreso" ? 1 : -1;
        categoriasTotales[t.categoria] = (categoriasTotales[t.categoria] || 0) + (t.monto * signo);
    });

    const ctxBar = document.getElementById("chartCategorias").getContext("2d");
    if (barChartInstance) barChartInstance.destroy();

    const coloresBarras = Object.values(categoriasTotales).map(val => val >= 0 ? '#065f46' : '#dc2626');

    barChartInstance = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: Object.keys(categoriasTotales),
            datasets: [{
                label: 'Monto Neto por Categoría',
                data: Object.values(categoriasTotales),
                backgroundColor: coloresBarras,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Gráfico de Líneas Evolución Temporal basada en fechas
    const transaccionesOrdenadas = [...Transaccion.historial].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    const fechasLabels = [];
    const ingresosAcumulados = [];
    const gastosAcumulados = [];
    const balanceAcumulado = [];

    let sumIngresos = 0;
    let sumGastos = 0;

    transaccionesOrdenadas.forEach(t => {
        fechasLabels.append ? null : fechasLabels.push(dayjs(t.fecha).format("DD/MM/YYYY"));
        if (t.tipo === "ingreso") sumIngresos += t.monto;
        else sumGastos += t.monto;

        ingresosAcumulados.push(sumIngresos);
        gastosAcumulados.push(sumGastos);
        balanceAcumulado.push(sumIngresos - sumGastos);
    });

    const fechasUnicas = [...new Set(transaccionesOrdenadas.map(t => dayjs(t.fecha).format("DD/MM/YYYY")))];

    const ctxLine = document.getElementById("chartEvolucion").getContext("2d");
    if (lineChartInstance) lineChartInstance.destroy();

    lineChartInstance = new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: fechasUnicas,
            datasets: [
                { label: 'Ingresos', data: ingresosAcumulados, borderColor: '#059669', backgroundColor: '#059669', tension: 0.1 },
                { label: 'Gastos', data: gastosAcumulados, borderColor: '#dc2626', backgroundColor: '#dc2626', tension: 0.1 },
                { label: 'Balance Neto', data: balanceAcumulado, borderColor: '#4f46e5', backgroundColor: '#4f46e5', tension: 0.1 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function actualizarResumenes() {
    actualizarPanelBalance();
    actualizarFilaVacia();
    renderizarGraficos();
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
    const fecha = datos.get("fecha");

    if (!descripcion || !(monto > 0) || !tipo || !categoria || !fecha) return;

    const id = Date.now();
    Transaccion.crear({ id, tipo, descripcion, monto, categoria, fecha });

    form.reset();
    document.getElementById("fecha").value = dayjs().format("YYYY-MM-DD");

    renderizarHistorialCompleto();
    actualizarResumenes();

    document.getElementById("descripcion").focus();
});

renderizarHistorialCompleto();
actualizarResumenes();