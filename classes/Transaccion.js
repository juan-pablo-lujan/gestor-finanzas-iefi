export default class Transaccion {
    id;
    tipo;
    descripcion;
    monto;
    categoria;
    fecha;

    static historial = [];

    static {
        this.#cargarDesdeLocalStorage();
    }

    constructor(id, tipo, descripcion, monto, categoria, fecha) {
        this.id = id;
        this.tipo = tipo;
        this.descripcion = descripcion;
        this.monto = monto;
        this.categoria = categoria;
        this.fecha = fecha;
    }

    static crear({ id, tipo, descripcion, monto, categoria, fecha }) {
        const transaccion = new this(id, tipo, descripcion, monto, categoria, fecha);
        Transaccion.agregar(transaccion);
        return transaccion;
    }

    static agregar(transaccion) {
        Transaccion.historial.push(transaccion);
        Transaccion.#guardarEnLocalStorage();
    }

    static eliminar(id) {
        Transaccion.historial = Transaccion.historial.filter(
            (t) => t.id !== id
        );
        Transaccion.#guardarEnLocalStorage();
    }

    // localstorage:
    static #guardarEnLocalStorage() {
        localStorage.setItem("gestor_finanzas_historial", JSON.stringify(Transaccion.historial));
    }

    static #cargarDesdeLocalStorage() {
        const datosGuardados = localStorage.getItem("gestor_finanzas_historial");
        if (datosGuardados === null) {
            Transaccion.historial = [];
        } else {
            const datosPlanos = JSON.parse(datosGuardados);
            Transaccion.historial = datosPlanos.map((t) => new Transaccion(
                t.id,
                t.tipo,
                t.descripcion,
                t.monto,
                t.categoria,
                t.fecha
            ));
        }
    }
}
