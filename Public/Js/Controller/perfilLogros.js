'use strict';

/* Perfil - Logros - Tabla  ---------------------------------------*/

let listaMetas = [];


let inputTipoMeta = document.querySelector('#inputNombreMeta');
let inputIndicador = document.querySelector('#inputIndicador');
let inputNombreLogro = document.querySelector('#inputNombreLogro');

let inputMedalla1 = document.querySelector('#tipoMedalla1');
let inputMedalla2 = document.querySelector('#tipoMedalla2');
let inputMedalla3 = document.querySelector('#tipoMedalla3');
let inputMedalla4 = document.querySelector('#tipoMedalla4');
let inputMedalla5 = document.querySelector('#tipoMedalla5');
let inputMedalla6 = document.querySelector('#tipoMedalla6');
let inputMedalla7 = document.querySelector('#tipoMedalla7');
let inputMedalla8 = document.querySelector('#tipoMedalla8');


let btnMeta = document.getElementById('btnMeta');
btnMeta.addEventListener('click', getMeta);



async function GetListaLogros() {
    let result = await ProcessGet('ListarLogros', null);
    if (result != null && result.resultado == true) {
        listaMetas = result.ListaLogrosDB;

        listaMetas = listaMetas.sort(function (a, b) {
            const nameA = a.TipoLogro.toUpperCase(); // ignore upper and lowercase
            const nameB = b.TipoLogro.toUpperCase(); // ignore upper and lowercase
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            // names must be equal
            return 0;
        });
        await ImprimirMetas();
        actualizarMetas();
    } else {
        ImprimirMsjError(result.msj);
        return;
    }
}

async function ImprimirMetas() {
    let tbody = document.querySelector('#datosLogros tbody');
    tbody.innerHTML = '';

    for (let i = 0; i < listaMetas.length; i++) {

        let fila = tbody.insertRow();
        let celdaTipoLogro = fila.insertCell();
        let celdaCondicionLogro = fila.insertCell();
        let celdaNombreLogro = fila.insertCell();
        let celdaMedalla = fila.insertCell();
        let celdaEstado = fila.insertCell();
        let celdaAcciones = fila.insertCell();
        celdaTipoLogro.innerHTML = traductorLogro(listaMetas[i].TipoLogro);
        celdaCondicionLogro.innerHTML = listaMetas[i].CondicionLogro;
        celdaNombreLogro.innerHTML = listaMetas[i].NombredeLogro;
        if (listaMetas[i].Estado == 1) {
            let iconoMedalla = document.createElement('i');
            iconoMedalla.className = traductorIconoMedalla(listaMetas[i].Medalla);
            celdaMedalla.appendChild(iconoMedalla)
        }
        else {
            celdaMedalla.innerHTML = '';
        }
        celdaEstado.innerHTML = traductorEstadoLogro(listaMetas[i].Estado);

        let divButtonEliminar = document.createElement('div');
        divButtonEliminar.className = "buttonEliminar";
        let buttonbuttonEliminar = document.createElement("button");
        buttonbuttonEliminar.type = "button";

        buttonbuttonEliminar.onclick = async function () {
            let confirmacion = false;
            await Swal.fire({
                title: 'Eliminaci??n de registro de meta',
                text: 'Desea eliminar la meta ' + listaMetas[i].TipoLogro + ' con el objetivo ' + listaMetas[i].CondicionLogro + '?',
                icon: 'warning',
                showDenyButton: true,
                denyButtonText: 'Cancelar',
                confirmButtonText: 'Confirmar'
            }).then((res) => {
                confirmacion = res.isConfirmed;
            });

            if (confirmacion == true) {
                let data = {
                    '_id': listaMetas[i]._id
                };
                let result = await ProcessDelete('EliminarLogro', data);
                if (result.resultado == true) {
                    ImprimirMsjSuccess(result.msj);
                } else {
                    ImprimirMsjError(result.msj);
                }
                await GetListaLogros();
            }
        };
        let iButtonEliminar = document.createElement("i");
        iButtonEliminar.className = "fa-solid fa-trash-can";
        buttonbuttonEliminar.appendChild(iButtonEliminar);
        divButtonEliminar.appendChild(buttonbuttonEliminar);
        celdaAcciones.appendChild(divButtonEliminar);
    }
}

async function getMeta() {
    let sTipoMeta = inputTipoMeta.value;
    let nIndicador = inputIndicador.value;
    let sNombreMeta = inputNombreLogro.value;
    let optionMedalla = revisarMedalla();
    let estadoPrueba = revisarEstadoPrueba(sTipoMeta, nIndicador);


    let result = null;

    if (validarMeta(sTipoMeta, nIndicador, sNombreMeta, optionMedalla, estadoPrueba) == true) {
        return;
    }

    //Acomodo para enviar el json con la informaci??n a la DB

    let data = {
        TipoLogro: sTipoMeta,
        CondicionLogro: nIndicador,
        NombredeLogro: sNombreMeta,
        Medalla: optionMedalla,
        Estado: estadoPrueba
    };

    result = await ProcessPost('RegistrarLogro', data, null);

    if (result == null || result == undefined) {
        ImprimirMsjError('Ocurri?? un error, intente de nuevo');
    } else if (result.resultado == false) {
        ImprimirMsjError(result.msj);
        console.log(result);
    } else {
        swal.fire({
            title: 'Excelente!',
            text: result.msj,
            icon: 'success',
            confirmButtonText: 'Ok'
        }).then(res => {
            cerrarFormularioLogrosFunc();
            GetListaLogros();
        });
    }

    //Resetear valores en form
    inputTipoMeta.value = "";
    inputIndicador.value = "";
    inputNombreLogro.value = "";

    inputMedalla1.unchecked;
    inputMedalla2.unchecked;
    inputMedalla3.unchecked;
    inputMedalla4.unchecked;
    inputMedalla5.unchecked;
    inputMedalla6.unchecked;
    inputMedalla7.unchecked;
    inputMedalla8.unchecked;
}


//Validar meta valida


function validarMeta(psTipoMeta, pnIndicador, psNombreMeta, pOptionMedalla, pEstadoPrueba) {

    if (psTipoMeta == '' || psTipoMeta == null || psTipoMeta == undefined) {
        document.getElementById("inputNombreMeta").focus();
        Swal.fire({ icon: 'error', title: 'Informaci??n requerida', text: 'Seleccione un tipo de meta' });
        return true;
    }
    else if (pnIndicador == '' || pnIndicador == null || pnIndicador == 0) {
        document.getElementById("inputIndicador").focus();
        Swal.fire({ icon: 'error', title: 'Informaci??n faltante', text: 'Ingrese un numero para la condici??n de la meta' });
        return true;
    }
    else if (pnIndicador <= 0) {
        document.getElementById("inputIndicador").focus();
        Swal.fire({ icon: 'error', title: 'Informaci??n invalida', text: 'Ingrese un numero real para la condici??n de la meta' });
        return true;
    }
    else if (psNombreMeta == '' || psNombreMeta == null || psNombreMeta == undefined) {
        document.getElementById("inputNombreLogro").focus();
        Swal.fire({ icon: 'error', title: 'Informaci??n faltante', text: 'Ingrese un nombre para la meta' });
        return true;
    }
    else if (pOptionMedalla == '' || pOptionMedalla == 0 || pOptionMedalla == null || pOptionMedalla == undefined) {
        document.getElementById("tipoMedalla1").focus();
        Swal.fire({ icon: 'error', title: 'Informaci??n faltante', text: 'Seleccione un tipo de medalla' });
        return true;
    }
    else {
        return false;
    }
}

function revisarMedalla() {
    let option;
    if (inputMedalla1.checked) {
        option = inputMedalla1.value;
    } else if (inputMedalla2.checked) {
        option = inputMedalla2.value;
    } else if (inputMedalla3.checked) {
        option = inputMedalla3.value;
    }
    else if (inputMedalla4.checked) {
        option = inputMedalla4.value;
    }
    else if (inputMedalla5.checked) {
        option = inputMedalla5.value;
    }
    else if (inputMedalla6.checked) {
        option = inputMedalla6.value;
    }
    else if (inputMedalla7.checked) {
        option = inputMedalla7.value;
    }
    else if (inputMedalla8.checked) {
        option = inputMedalla8.value;
    } else {
        option = 0;
    }
    return option;
}


function revisarEstadoPrueba(psTipoMeta, pnIndicador) {


    let estadoPrueba = 0;
    let sumaHoras = 0;
    let ayunoCompletados = 0;




    if (listaPeso.length < 1) {
    }
    else {
        for (let i = 0; i < listaAyunos.length; i++) {
            sumaHoras += Number(listaAyunos[i].HorasAyunos);
        }
        for (let i = 0; i < listaAyunos.length; i++) {
            if (listaAyunos[i].EstadoAyuno == "Logrado") {
                ayunoCompletados += 1;
            }
        }

        if (psTipoMeta == "peso") {
            if (Number(listaPeso[0].Peso) <= Number(pnIndicador)) {
                estadoPrueba = 1;
            }
            else {
                estadoPrueba = 0;
            }
        }
        if (psTipoMeta == "imc") {
            if (Number(listaPeso[0].IMC) <= Number(pnIndicador)) {
                estadoPrueba = 1;
            }
            else {
                estadoPrueba = 0;
            }
        }
        if (psTipoMeta == "cantidadHoras") {

            if (Number(sumaHoras) >= Number(pnIndicador)) {
                estadoPrueba = 1;
            }
            else {
                estadoPrueba = 0;
            }
        }
        if (psTipoMeta == "diasAyuno") {
            if (Number(ayunoCompletados) >= Number(pnIndicador)) {
                estadoPrueba = 1;
            }
            else {
                estadoPrueba = 0;
            }
        }




        return estadoPrueba;
    }

}

async function actualizarMetas() {
    if (listaMetas.length > 0) {
        for (let i = 0; i < listaMetas.length; i++) {
            let sTipoMeta = listaMetas[i].TipoLogro;
            let nIndicador = listaMetas[i].CondicionLogro;
            let sNombreMeta = listaMetas[i].NombredeLogro;
            let optionMedalla = listaMetas[i].Medalla;
            let estadoPrueba = revisarEstadoPrueba(sTipoMeta, nIndicador);
            let s_id = listaMetas[i]._id;
            let data = {
                _id: s_id,
                TipoLogro: sTipoMeta,
                CondicionLogro: nIndicador,
                NombredeLogro: sNombreMeta,
                Medalla: optionMedalla,
                Estado: estadoPrueba
            };
            let result = await ProcessPut('ModificarLogros', data, null);
        }
    }
}

// ABRIR Y CERRAR FORMULARIOS
const abrirFormularioLogros = document.querySelector('#btnRegistroAbrirLogro');
const fondoNegroLogros = document.querySelector('.fondoNegro');
const xCerrarFormularioLogros = document.querySelector('#xFormularioLogros');

abrirFormularioLogros.addEventListener('click', abrirFormularioLogrosFunc);
fondoNegroLogros.addEventListener('click', cerrarFormularioLogrosFunc);
xCerrarFormularioLogros.addEventListener('click', cerrarFormularioLogrosFunc);

function abrirFormularioLogrosFunc() {
    document.querySelector('#ingresoDatosLogrosObjetivos').style.display = 'block';
    document.querySelector('.fondoNegro').style.display = 'block';
    document.querySelector('body').style.overflowY = 'hidden';

}

function cerrarFormularioLogrosFunc() {
    document.querySelector('#ingresoDatosLogrosObjetivos').style.display = 'none';
    document.querySelector('.fondoNegro').style.display = 'none';
    document.querySelector('body').style.overflowY = 'initial';
}