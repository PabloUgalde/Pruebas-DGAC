// app.js
document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURACIÓN DE CURSOS ---
    const CURSOS_CONFIG = [
        { id: "PCA", nombreDisplay: "Piloto Comercial de Avión", archivo: "datos_PCA.js", dataVariable: "CURSO_PCA_MATERIAS" },
        { id: "IFR", nombreDisplay: "Habilitación de Vuelo por Instrumentos (IFR)", archivo: "datos_IFR.js", dataVariable: "CURSO_IFR_MATERIAS" },
        { id: "PPA", nombreDisplay: "Piloto Privado de Avión", archivo: "datos_PPA.js", dataVariable: "CURSO_PPA_MATERIAS" },
    ];

    // --- DOM Elements ---
    const cursoSelect = document.getElementById('curso-select');
    const materiaSelect = document.getElementById('materia-select');
    const cantidadPreguntasInput = document.getElementById('cantidad-preguntas-input');
    const maxPreguntasMateriaSpan = document.getElementById('max-preguntas-materia');
    const btnEmpezarTest = document.getElementById('btn-empezar-test');
    const btnGenerarDocumento = document.getElementById('btn-generar-documento');
    const configuracionTestDiv = document.getElementById('configuracion-test');
    const areaTestDiv = document.getElementById('area-test');
    const tituloMateriaTestH2 = document.getElementById('titulo-materia-test');
    const progresoPreguntaP = document.getElementById('progreso-pregunta');
    const textoPreguntaP = document.getElementById('texto-pregunta');
    const alternativasContainerDiv = document.getElementById('alternativas-container');
    const btnOmitirPregunta = document.getElementById('btn-omitir-pregunta');
    const btnSiguientePregunta = document.getElementById('btn-siguiente-pregunta');
    const btnTerminarTest = document.getElementById('btn-terminar-test');
    const areaOmitidasDiv = document.getElementById('area-omitidas');
    const progresoPreguntaOmitidaP = document.getElementById('progreso-pregunta-omitida');
    const textoPreguntaOmitidaP = document.getElementById('texto-pregunta-omitida');
    const alternativasContainerOmitidaDiv = document.getElementById('alternativas-container-omitida');
    const btnSiguientePreguntaOmitida = document.getElementById('btn-siguiente-pregunta-omitida');
    const btnVerResultados = document.getElementById('btn-ver-resultados');
    const btnTerminarTestOmitidas = document.getElementById('btn-terminar-test-omitidas');
    const areaResultadosDiv = document.getElementById('area-resultados');
    const resCursoSpan = document.getElementById('res-curso');
    const resMateriaSpan = document.getElementById('res-materia');
    const resTotalSeleccionadasSpan = document.getElementById('res-total-seleccionadas');
    const resRespondidasSpan = document.getElementById('res-respondidas');
    const resCorrectasSpan = document.getElementById('res-correctas');
    const resIncorrectasSpan = document.getElementById('res-incorrectas');
    const resOmitidasFinalSpan = document.getElementById('res-omitidas-final');
    const resPorcentajeSpan = document.getElementById('res-porcentaje');
    const contadorIncorrectasSpan = document.getElementById('contador-incorrectas');
    const resumenIdsIncorrectasDiv = document.getElementById('resumen-ids-incorrectas');
    const btnVerDetalleIncorrectas = document.getElementById('btn-ver-detalle-incorrectas');
    const detalleIncorrectasContainerDiv = document.getElementById('detalle-incorrectas-container');
    const contadorCorrectasSpan = document.getElementById('contador-correctas');
    const resumenIdsCorrectasDiv = document.getElementById('resumen-ids-correctas');
    const btnVerDetalleCorrectas = document.getElementById('btn-ver-detalle-correctas');
    const detalleCorrectasContainerDiv = document.getElementById('detalle-correctas-container');
    const btnReiniciarTest = document.getElementById('btn-reiniciar-test');
    const btnModoEstudio = document.getElementById('btn-modo-estudio');
    const opcionesModoEstudioDiv = document.getElementById('opciones-modo-estudio');
    const btnEstudioOrdenado = document.getElementById('btn-estudio-ordenado');
    const btnEstudioAleatorio = document.getElementById('btn-estudio-aleatorio');
    const btnVolverConfiguracion = document.getElementById('btn-volver-configuracion');
    const areaEstudioDiv = document.getElementById('area-estudio');
    const tituloMateriaEstudioH2 = document.getElementById('titulo-materia-estudio');
    const progresoEstudioP = document.getElementById('progreso-estudio');
    const textoPreguntaEstudioP = document.getElementById('texto-pregunta-estudio');
    const alternativasContainerEstudioDiv = document.getElementById('alternativas-container-estudio');
    const feedbackContainerEstudioDiv = document.getElementById('feedback-container-estudio');
    const btnAccionEstudio = document.getElementById('btn-accion-estudio');
    const btnSalirEstudio = document.getElementById('btn-salir-estudio');
    const controlesEstudioDiv = document.getElementById('controles-estudio');
    
    // ======== NUEVO ELEMENTO DEL DOM PARA RESUMEN DE ESTUDIO ========
    const resumenEstudioContainer = document.getElementById('resumen-estudio-container');


    // --- Test State (Estado del Test Interactivo) ---
    let cursoSeleccionadoActual = null;
    let datosMateriasCursoCargado = null;
    let materiaSeleccionadaKey = '';
    let preguntasSeleccionadasGlobal = [];
    let respuestasUsuarioGlobal = [];
    let preguntasOmitidasIndices = [];
    let indicePreguntaActual = 0;
    let indicePreguntaOmitidaActual = 0;
    
    // --- Estado del Modo Estudio ---
    let preguntasEstudioActual = [];
    let indicePreguntaEstudioActual = 0;
    let respuestaEstudioSeleccionada = null;
    let enModoVerificacionEstudio = false;
    
    // ======== NUEVA VARIABLE PARA REGISTRAR RESULTADOS DE ESTUDIO ========
    let resultadosEstudio = [];

    let scriptsCargados = {};

    // --- Funciones de Utilidad ---
    function toggleDetalleEspecifico(container, button, tipo) { if (container.style.display === 'none') { container.style.display = 'block'; button.textContent = `Ocultar Detalle ${tipo}`; } else { container.style.display = 'none'; button.textContent = `Ver Detalle ${tipo}`; } }
    const barajarArray = (array) => { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[array[i], array[j]] = [array[j], array[i]]; } };
    const convertirLetraAIndice = (letra) => { return letra.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0); };

    // --- Initialization ---
    function inicializarApp() {
        poblarSelectorCursos();
        cursoSelect.addEventListener('change', handleCursoChange);
        materiaSelect.addEventListener('change', handleMateriaChange);
        cantidadPreguntasInput.addEventListener('input', checkFormHabilitarBotones);
        cantidadPreguntasInput.addEventListener('change', checkFormHabilitarBotones);
        btnEmpezarTest.addEventListener('click', () => prepararYEjecutarAccion('test'));
        btnGenerarDocumento.addEventListener('click', () => prepararYEjecutarAccion('documento'));
        btnModoEstudio.addEventListener('click', mostrarOpcionesEstudio);
        btnSiguientePregunta.addEventListener('click', procesarSiguientePregunta);
        btnOmitirPregunta.addEventListener('click', omitirPreguntaActual);
        btnTerminarTest.addEventListener('click', terminarTestConfirmacion);
        btnSiguientePreguntaOmitida.addEventListener('click', procesarSiguientePreguntaOmitida);
        btnVerResultados.addEventListener('click', calcularYMostrarResultados);
        btnTerminarTestOmitidas.addEventListener('click', terminarTestConfirmacion);
        btnVerDetalleIncorrectas.addEventListener('click', () => toggleDetalleEspecifico(detalleIncorrectasContainerDiv, btnVerDetalleIncorrectas, "Incorrectas"));
        btnVerDetalleCorrectas.addEventListener('click', () => toggleDetalleEspecifico(detalleCorrectasContainerDiv, btnVerDetalleCorrectas, "Correctas"));
        btnReiniciarTest.addEventListener('click', reiniciarAplicacion);
        btnEstudioOrdenado.addEventListener('click', () => iniciarModoEstudio(false));
        btnEstudioAleatorio.addEventListener('click', () => iniciarModoEstudio(true));
        btnVolverConfiguracion.addEventListener('click', volverAConfiguracionDesdeEstudio);
        btnAccionEstudio.addEventListener('click', manejarAccionEstudio);
        btnSalirEstudio.addEventListener('click', terminarEstudioConfirmacion);
        document.addEventListener('keydown', manejarTeclaEnter);
        resetearConfiguracionUI();
    }
    // Añade esta función completa en tu app.js

    function manejarTeclaEnter(event) {
        // Si no es la tecla "Enter", no hacemos nada.
        if (event.key !== 'Enter') {
            return;
        }

        // Evita la acción por defecto de la tecla Enter (como enviar un formulario)
        event.preventDefault();

        // Comprobar qué área está visible y actuar en consecuencia

        // 1. Modo Estudio
        if (areaEstudioDiv.style.display !== 'none') {
            // Solo simula el clic si el botón de acción está habilitado
            if (!btnAccionEstudio.disabled) {
                btnAccionEstudio.click();
            }
            return; // Termina la función para no seguir comprobando
        }

        // 2. Modo Test Interactivo
        if (areaTestDiv.style.display !== 'none') {
            // En el test, la acción principal es "Siguiente Pregunta"
            if (!btnSiguientePregunta.disabled) {
                btnSiguientePregunta.click();
            }
            return;
        }

        // 3. Modo Preguntas Omitidas
        if (areaOmitidasDiv.style.display !== 'none') {
            // Aquí hay dos posibles botones de acción. Damos prioridad a "Siguiente".
            if (btnSiguientePreguntaOmitida.style.display !== 'none' && !btnSiguientePreguntaOmitida.disabled) {
                btnSiguientePreguntaOmitida.click();
            } else if (btnVerResultados.style.display !== 'none' && !btnVerResultados.disabled) {
                // Si el botón de siguiente no está, probamos con "Ver Resultados"
                btnVerResultados.click();
            }
            return;
        }
    }
    // --- Lógica de Configuración y Carga (SIN CAMBIOS) ---
    // ... (Las funciones poblarSelectorCursos, resetearConfiguracionUI, registrarDatosCurso, cargarScriptDatosCurso, handleCursoChange, poblarSelectorMaterias, resetearCamposCantidad, handleMateriaChange, checkFormHabilitarBotones se mantienen igual)
    function poblarSelectorCursos() { while (cursoSelect.options.length > 1) { cursoSelect.remove(1); } CURSOS_CONFIG.forEach(curso => { const option = document.createElement('option'); option.value = curso.id; option.textContent = curso.nombreDisplay; cursoSelect.appendChild(option); }); }
    function resetearConfiguracionUI() { cursoSelect.value = ""; materiaSelect.innerHTML = '<option value="">Primero elige un curso...</option>'; materiaSelect.disabled = true; cantidadPreguntasInput.value = ""; cantidadPreguntasInput.placeholder = "Elige curso y materia"; cantidadPreguntasInput.disabled = true; maxPreguntasMateriaSpan.textContent = "0"; checkFormHabilitarBotones(); }
    window.registrarDatosCurso = function(nombreVariableGlobal, datos) { window[nombreVariableGlobal] = datos; if (scriptsCargados[nombreVariableGlobal] && scriptsCargados[nombreVariableGlobal].resolve) { scriptsCargados[nombreVariableGlobal].resolve(datos); } scriptsCargados[nombreVariableGlobal].cargado = true; };
    function cargarScriptDatosCurso(nombreArchivoScript, nombreVariableGlobal) { if (scriptsCargados[nombreVariableGlobal] && scriptsCargados[nombreVariableGlobal].cargado && typeof window[nombreVariableGlobal] !== 'undefined') { return Promise.resolve(window[nombreVariableGlobal]); } if (scriptsCargados[nombreVariableGlobal] && !scriptsCargados[nombreVariableGlobal].cargado && scriptsCargados[nombreVariableGlobal].promise) { return scriptsCargados[nombreVariableGlobal].promise; } let resolvePromise, rejectPromise; const promise = new Promise((resolve, reject) => { resolvePromise = resolve; rejectPromise = reject; }); scriptsCargados[nombreVariableGlobal] = { promise, resolve: resolvePromise, reject: rejectPromise, cargado: false }; const script = document.createElement('script'); script.src = nombreArchivoScript; script.async = true; script.onload = () => { setTimeout(() => { if (!scriptsCargados[nombreVariableGlobal].cargado) { rejectPromise('Timeout'); } }, 5000); }; script.onerror = () => { rejectPromise('Error loading script'); }; document.head.appendChild(script); return promise; }
    async function handleCursoChange() { const cursoIdSeleccionado = cursoSelect.value; cursoSeleccionadoActual = CURSOS_CONFIG.find(c => c.id === cursoIdSeleccionado); materiaSelect.innerHTML = '<option value="">Cargando materias...</option>'; materiaSelect.disabled = true; cantidadPreguntasInput.value = ""; cantidadPreguntasInput.placeholder = "Elige curso y materia"; cantidadPreguntasInput.disabled = true; maxPreguntasMateriaSpan.textContent = "0"; datosMateriasCursoCargado = null; materiaSeleccionadaKey = ""; if (cursoSeleccionadoActual) { try { datosMateriasCursoCargado = await cargarScriptDatosCurso(cursoSeleccionadoActual.archivo, cursoSeleccionadoActual.dataVariable); if (datosMateriasCursoCargado && typeof datosMateriasCursoCargado === 'object' && Object.keys(datosMateriasCursoCargado).length > 0) { poblarSelectorMaterias(); materiaSelect.disabled = false; } else { materiaSelect.innerHTML = '<option value="">No hay materias definidas</option>'; } } catch (error) { materiaSelect.innerHTML = '<option value="">Error al cargar materias</option>'; } } else { resetearConfiguracionUI(); } checkFormHabilitarBotones(); }
    function poblarSelectorMaterias() { materiaSelect.innerHTML = '<option value="">Elegir materia...</option>'; if (!datosMateriasCursoCargado) return; Object.keys(datosMateriasCursoCargado).sort().forEach(claveMateria => { const option = document.createElement('option'); option.value = claveMateria; option.textContent = claveMateria; materiaSelect.appendChild(option); }); resetearCamposCantidad(); checkFormHabilitarBotones(); }
    function resetearCamposCantidad() { maxPreguntasMateriaSpan.textContent = "0"; cantidadPreguntasInput.max = "0"; cantidadPreguntasInput.value = ""; cantidadPreguntasInput.placeholder = "Elegir número de preguntas"; cantidadPreguntasInput.disabled = true; }
    function handleMateriaChange() { materiaSeleccionadaKey = materiaSelect.value; if (materiaSeleccionadaKey && datosMateriasCursoCargado && datosMateriasCursoCargado[materiaSeleccionadaKey]) { const totalPreguntas = datosMateriasCursoCargado[materiaSeleccionadaKey].length; maxPreguntasMateriaSpan.textContent = totalPreguntas; cantidadPreguntasInput.max = totalPreguntas; cantidadPreguntasInput.placeholder = `Máx ${totalPreguntas}`; cantidadPreguntasInput.disabled = false; cantidadPreguntasInput.value = ""; } else { resetearCamposCantidad(); } checkFormHabilitarBotones(); }
    function checkFormHabilitarBotones() { const cursoOK = cursoSelect.value !== ""; const materiaOK = materiaSelect.value !== "" && !materiaSelect.disabled; const cantidadTexto = cantidadPreguntasInput.value.trim(); const cantidadNum = parseInt(cantidadTexto); let maxNum = 0; if (materiaOK && materiaSeleccionadaKey && datosMateriasCursoCargado && datosMateriasCursoCargado[materiaSeleccionadaKey]) { maxNum = datosMateriasCursoCargado[materiaSeleccionadaKey].length; } const cantidadEsValidaParaTest = cantidadTexto !== "" && !isNaN(cantidadNum) && cantidadNum >= 1 && (maxNum === 0 || cantidadNum <= maxNum); btnEmpezarTest.disabled = !cantidadEsValidaParaTest; btnGenerarDocumento.disabled = !cantidadEsValidaParaTest; btnModoEstudio.disabled = !(cursoOK && materiaOK); }
    
    // --- Lógica del Test Interactivo (SIN CAMBIOS) ---
    // ... (Las funciones prepararYEjecutarAccion, configurarEIniciarTestInteractivo, generarDocumentoTexto, mostrarPreguntaActual, etc., hasta reiniciarAplicacion se mantienen igual)
    function prepararYEjecutarAccion(tipoAccion) { if (!cursoSeleccionadoActual || !datosMateriasCursoCargado) { alert("Error: datos del curso no cargados."); return; } materiaSeleccionadaKey = materiaSelect.value; if (!materiaSeleccionadaKey || !datosMateriasCursoCargado[materiaSeleccionadaKey]) { alert("Por favor, selecciona una materia válida."); return; } let cantidadDeseada; const cantidadTexto = cantidadPreguntasInput.value.trim(); const preguntasDisponiblesMateria = datosMateriasCursoCargado[materiaSeleccionadaKey]; const maxDisp = preguntasDisponiblesMateria.length; if (cantidadTexto === "" || isNaN(parseInt(cantidadTexto))) { cantidadDeseada = Math.min(10, maxDisp); alert(`Número de preguntas no especificado o inválido. Se usarán ${cantidadDeseada} preguntas.`); cantidadPreguntasInput.value = cantidadDeseada; } else { cantidadDeseada = parseInt(cantidadTexto); if (cantidadDeseada <= 0 || cantidadDeseada > maxDisp) { alert(`Número de preguntas inválido. Se usarán ${Math.min(maxDisp, 10)}.`); cantidadDeseada = Math.min(maxDisp, 10); cantidadPreguntasInput.value = cantidadDeseada; } } preguntasSeleccionadasGlobal = [...preguntasDisponiblesMateria].sort(() => 0.5 - Math.random()).slice(0, cantidadDeseada); respuestasUsuarioGlobal = new Array(preguntasSeleccionadasGlobal.length).fill(null).map((_, i) => ({ preguntaOriginal: preguntasSeleccionadasGlobal[i], respuestaUsuario: null, esCorrecta: null })); preguntasOmitidasIndices = []; indicePreguntaActual = 0; indicePreguntaOmitidaActual = 0; if (tipoAccion === 'test') { configurarEIniciarTestInteractivo(); } else if (tipoAccion === 'documento') { generarDocumentoTexto(); } }
    function configurarEIniciarTestInteractivo() { configuracionTestDiv.style.display = 'none'; areaResultadosDiv.style.display = 'none'; areaOmitidasDiv.style.display = 'none'; areaTestDiv.style.display = 'block'; tituloMateriaTestH2.textContent = `Curso: ${cursoSeleccionadoActual.nombreDisplay} | Materia: ${materiaSeleccionadaKey}`; mostrarPreguntaActual(); }
    function generarDocumentoTexto() { if (preguntasSeleccionadasGlobal.length === 0) { alert("No hay preguntas seleccionadas."); return; } let contenido = `CURSO: ${cursoSeleccionadoActual.nombreDisplay}\nMATERIA: ${materiaSeleccionadaKey}\nCANTIDAD: ${preguntasSeleccionadasGlobal.length}\n\nPREGUNTAS\n\n`; const letras = ['A', 'B', 'C', 'D', 'E', 'F']; preguntasSeleccionadasGlobal.forEach((p, i) => { contenido += `${i + 1}. (ID: ${p.idOriginal}) ${p.texto}\n`; p.opciones.forEach((op, j) => { if (op && op.trim() !== "") contenido += `   ${letras[j]}) ${op}\n`; }); contenido += "\n"; }); contenido += "\n\n\nRESPUESTAS CORRECTAS Y FEEDBACK\n\n"; preguntasSeleccionadasGlobal.forEach((p, i) => { contenido += `${i + 1}. (ID: ${p.idOriginal})\n   Respuesta: ${p.correcta}\n`; if (p.feedback) contenido += `   Feedback: ${p.feedback}\n`; contenido += "\n"; }); const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `Evaluacion_${cursoSeleccionadoActual.id}_${materiaSeleccionadaKey}.txt`; link.click(); URL.revokeObjectURL(link.href); }
    function mostrarPreguntaActual(){ if (indicePreguntaActual < preguntasSeleccionadasGlobal.length) { const preguntaObj = preguntasSeleccionadasGlobal[indicePreguntaActual]; progresoPreguntaP.textContent = `Pregunta ${indicePreguntaActual + 1} de ${preguntasSeleccionadasGlobal.length}`; textoPreguntaP.textContent = `(ID: ${preguntaObj.idOriginal}) ${preguntaObj.texto}`; alternativasContainerDiv.innerHTML = ''; const letrasOpciones = ['A', 'B', 'C', 'D', 'E', 'F']; preguntaObj.opciones.forEach((opcionTexto, i) => { if (opcionTexto && opcionTexto.trim() !== "") { const btn = document.createElement('button'); btn.textContent = `${letrasOpciones[i]}) ${opcionTexto}`; btn.dataset.opcionLetra = letrasOpciones[i]; btn.addEventListener('click', () => seleccionarAlternativaActual(btn, alternativasContainerDiv)); alternativasContainerDiv.appendChild(btn); } }); const respuestaPrevia = respuestasUsuarioGlobal[indicePreguntaActual].respuestaUsuario; if (respuestaPrevia) { const btnSeleccionado = alternativasContainerDiv.querySelector(`button[data-opcion-letra="${respuestaPrevia}"]`); if (btnSeleccionado) btnSeleccionado.classList.add('seleccionada'); } btnOmitirPregunta.style.display = 'inline-block'; btnSiguientePregunta.disabled = respuestaPrevia === null; btnOmitirPregunta.disabled = respuestaPrevia !== null; } else { pasarARondaOmitidasOResultados(); } }
    function seleccionarAlternativaActual(boton, container) { container.querySelectorAll('button').forEach(b => b.classList.remove('seleccionada')); boton.classList.add('seleccionada'); respuestasUsuarioGlobal[indicePreguntaActual].respuestaUsuario = boton.dataset.opcionLetra; btnSiguientePregunta.disabled = false; btnOmitirPregunta.disabled = true; }
    function procesarSiguientePregunta() { indicePreguntaActual++; mostrarPreguntaActual(); }
    function omitirPreguntaActual() { if (!preguntasOmitidasIndices.includes(indicePreguntaActual)) { preguntasOmitidasIndices.push(indicePreguntaActual); } respuestasUsuarioGlobal[indicePreguntaActual].respuestaUsuario = null; alternativasContainerDiv.querySelectorAll('button.seleccionada').forEach(b => b.classList.remove('seleccionada')); btnOmitirPregunta.disabled = true; btnSiguientePregunta.disabled = false; indicePreguntaActual++; mostrarPreguntaActual(); }
    function pasarARondaOmitidasOResultados() { const omitidasReales = preguntasOmitidasIndices.filter(idx => respuestasUsuarioGlobal[idx].respuestaUsuario === null); preguntasOmitidasIndices = omitidasReales; if (preguntasOmitidasIndices.length > 0) { indicePreguntaOmitidaActual = 0; areaTestDiv.style.display = 'none'; areaOmitidasDiv.style.display = 'block'; mostrarPreguntaOmitidaActual(); } else { calcularYMostrarResultados(); } }
    function mostrarPreguntaOmitidaActual() { if (indicePreguntaOmitidaActual < preguntasOmitidasIndices.length) { const indiceOriginal = preguntasOmitidasIndices[indicePreguntaOmitidaActual]; const preguntaObj = preguntasSeleccionadasGlobal[indiceOriginal]; progresoPreguntaOmitidaP.textContent = `Pregunta Omitida ${indicePreguntaOmitidaActual + 1} de ${preguntasOmitidasIndices.length}`; textoPreguntaOmitidaP.textContent = `(ID: ${preguntaObj.idOriginal}) ${preguntaObj.texto}`; alternativasContainerOmitidaDiv.innerHTML = ''; const letrasOpciones = ['A', 'B', 'C', 'D', 'E', 'F']; preguntaObj.opciones.forEach((opcionTexto, i) => { if (opcionTexto && opcionTexto.trim() !== "") { const btn = document.createElement('button'); btn.textContent = `${letrasOpciones[i]}) ${opcionTexto}`; btn.dataset.opcionLetra = letrasOpciones[i]; btn.addEventListener('click', () => seleccionarAlternativaOmitida(btn, alternativasContainerOmitidaDiv)); alternativasContainerOmitidaDiv.appendChild(btn); } }); const respuestaPreviaOmitida = respuestasUsuarioGlobal[indiceOriginal].respuestaUsuario; if (respuestaPreviaOmitida) { const btnSeleccionado = alternativasContainerOmitidaDiv.querySelector(`button[data-opcion-letra="${respuestaPreviaOmitida}"]`); if (btnSeleccionado) btnSeleccionado.classList.add('seleccionada'); } btnSiguientePreguntaOmitida.disabled = respuestaPreviaOmitida === null; if (indicePreguntaOmitidaActual === preguntasOmitidasIndices.length - 1) { btnVerResultados.style.display = 'inline-block'; btnSiguientePreguntaOmitida.style.display = 'none'; } else { btnVerResultados.style.display = 'none'; btnSiguientePreguntaOmitida.style.display = 'inline-block'; } } else { calcularYMostrarResultados(); } }
    function seleccionarAlternativaOmitida(boton, container) { container.querySelectorAll('button').forEach(b => b.classList.remove('seleccionada')); boton.classList.add('seleccionada'); const indiceReal = preguntasOmitidasIndices[indicePreguntaOmitidaActual]; respuestasUsuarioGlobal[indiceReal].respuestaUsuario = boton.dataset.opcionLetra; btnSiguientePreguntaOmitida.disabled = false; }
    function procesarSiguientePreguntaOmitida() { indicePreguntaOmitidaActual++; if (indicePreguntaOmitidaActual >= preguntasOmitidasIndices.length) { calcularYMostrarResultados(); } else { mostrarPreguntaOmitidaActual(); } }
    function calcularYMostrarResultados() { let correctas = 0, incorrectas = 0, omitidasAlFinal = 0, respondidasCount = 0; let idsIncorrectas = [], idsCorrectas = []; detalleCorrectasContainerDiv.innerHTML = ''; detalleIncorrectasContainerDiv.innerHTML = ''; resumenIdsCorrectasDiv.innerHTML = 'IDs: '; resumenIdsIncorrectasDiv.innerHTML = 'IDs: '; respuestasUsuarioGlobal.forEach((item, index) => { if (item.respuestaUsuario !== null) { respondidasCount++; item.esCorrecta = item.respuestaUsuario === item.preguntaOriginal.correcta; if (item.esCorrecta) { correctas++; idsCorrectas.push(item.preguntaOriginal.idOriginal); detalleCorrectasContainerDiv.appendChild(crearElementoDetalle(item, index)); } else { incorrectas++; idsIncorrectas.push(item.preguntaOriginal.idOriginal); detalleIncorrectasContainerDiv.appendChild(crearElementoDetalle(item, index)); } } else { omitidasAlFinal++; } }); idsCorrectas.sort((a,b) => String(a).localeCompare(String(b), undefined, {numeric: true})).forEach(id => { const span = document.createElement('span'); span.textContent = id; resumenIdsCorrectasDiv.appendChild(span); }); idsIncorrectas.sort((a,b) => String(a).localeCompare(String(b), undefined, {numeric: true})).forEach(id => { const span = document.createElement('span'); span.textContent = id; resumenIdsIncorrectasDiv.appendChild(span); }); if (idsCorrectas.length === 0) resumenIdsCorrectasDiv.innerHTML = 'IDs: Ninguna'; if (idsIncorrectas.length === 0) resumenIdsIncorrectasDiv.innerHTML = 'IDs: Ninguna'; contadorCorrectasSpan.textContent = correctas; contadorIncorrectasSpan.textContent = incorrectas; resCursoSpan.textContent = cursoSeleccionadoActual ? cursoSeleccionadoActual.nombreDisplay : 'N/A'; resMateriaSpan.textContent = materiaSeleccionadaKey; resTotalSeleccionadasSpan.textContent = preguntasSeleccionadasGlobal.length; resRespondidasSpan.textContent = respondidasCount; resCorrectasSpan.textContent = correctas; resIncorrectasSpan.textContent = incorrectas; resOmitidasFinalSpan.textContent = omitidasAlFinal; const porcentaje = respondidasCount > 0 ? ((correctas / respondidasCount) * 100).toFixed(1) : "0.0"; resPorcentajeSpan.textContent = `${porcentaje}%`; areaTestDiv.style.display = 'none'; areaOmitidasDiv.style.display = 'none'; configuracionTestDiv.style.display = 'none'; areaResultadosDiv.style.display = 'block'; detalleCorrectasContainerDiv.style.display = 'none'; btnVerDetalleCorrectas.textContent = 'Ver Detalle Correctas'; detalleIncorrectasContainerDiv.style.display = 'none'; btnVerDetalleIncorrectas.textContent = 'Ver Detalle Incorrectas'; }
    function crearElementoDetalle(item, index) { const preg = item.preguntaOriginal; const itemDiv = document.createElement('div'); itemDiv.classList.add('detalle-item'); let resultadoTexto = item.esCorrecta ? 'Correcto' : 'Incorrecto'; let claseResultado = item.esCorrecta ? 'respuesta-correcta-texto' : 'respuesta-incorrecta-texto'; if (item.respuestaUsuario === null) { resultadoTexto = 'Omitida'; claseResultado = 'respuesta-omitida-texto'; } itemDiv.innerHTML = `<p class="pregunta-detalle"><strong>${index + 1}. (ID: ${preg.idOriginal}) ${preg.texto}</strong></p><p>Tu respuesta: ${item.respuestaUsuario || '<em>No respondida</em>'}</p><p>Respuesta Correcta: ${preg.correcta}</p><p class="${claseResultado}">Resultado: ${resultadoTexto}</p>${(preg.feedback) ? `<p class="feedback-texto"><em>Feedback: ${preg.feedback}</em></p>` : ''}`; return itemDiv; }
    function terminarTestConfirmacion() { if (confirm("¿Estás seguro de que deseas terminar la evaluación?")) { reiniciarAplicacion(); } }
    function reiniciarAplicacion() { cursoSeleccionadoActual = null; datosMateriasCursoCargado = null; materiaSeleccionadaKey = ''; preguntasSeleccionadasGlobal = []; respuestasUsuarioGlobal = []; preguntasOmitidasIndices = []; indicePreguntaActual = 0; indicePreguntaOmitidaActual = 0; areaTestDiv.style.display = 'none'; areaOmitidasDiv.style.display = 'none'; areaResultadosDiv.style.display = 'none'; opcionesModoEstudioDiv.style.display = 'none'; areaEstudioDiv.style.display = 'none'; configuracionTestDiv.style.display = 'block'; resetearConfiguracionUI(); detalleCorrectasContainerDiv.innerHTML = ''; detalleCorrectasContainerDiv.style.display = 'none'; btnVerDetalleCorrectas.textContent = 'Ver Detalle Correctas'; resumenIdsCorrectasDiv.innerHTML = 'IDs: Ninguna'; detalleIncorrectasContainerDiv.innerHTML = ''; detalleIncorrectasContainerDiv.style.display = 'none'; btnVerDetalleIncorrectas.textContent = 'Ver Detalle Incorrectas'; resumenIdsIncorrectasDiv.innerHTML = 'IDs: Ninguna'; contadorCorrectasSpan.textContent = '0'; contadorIncorrectasSpan.textContent = '0'; }


    // ===================================================================================
    // ======================== LÓGICA ACTUALIZADA PARA MODO ESTUDIO =======================
    // ===================================================================================

    function mostrarOpcionesEstudio() {
        configuracionTestDiv.style.display = 'none';
        opcionesModoEstudioDiv.style.display = 'block';
    }

    function volverAConfiguracionDesdeEstudio() {
        opcionesModoEstudioDiv.style.display = 'none';
        configuracionTestDiv.style.display = 'block';
    }

    // ======== MODIFICADO: iniciarModoEstudio ========
    function iniciarModoEstudio(esAleatorio) {
        materiaSeleccionadaKey = materiaSelect.value;
        const preguntasMateria = datosMateriasCursoCargado[materiaSeleccionadaKey];
        if (!preguntasMateria || preguntasMateria.length === 0) {
            alert("No hay preguntas disponibles para esta materia.");
            return;
        }

        let cantidadDeseada;
        const cantidadTexto = cantidadPreguntasInput.value.trim();
        const maximoPreguntas = preguntasMateria.length;

        if (cantidadTexto !== "" && !isNaN(parseInt(cantidadTexto)) && parseInt(cantidadTexto) > 0) {
            cantidadDeseada = parseInt(cantidadTexto);
            if (cantidadDeseada > maximoPreguntas) {
                alert(`El número solicitado (${cantidadDeseada}) excede el máximo disponible (${maximoPreguntas}). Se usarán todas las ${maximoPreguntas} preguntas.`);
                cantidadDeseada = maximoPreguntas;
            }
        } else {
            cantidadDeseada = maximoPreguntas;
        }
        
        let preguntasTemporales = [...preguntasMateria];
        if (esAleatorio) {
            barajarArray(preguntasTemporales);
        }
        preguntasEstudioActual = preguntasTemporales.slice(0, cantidadDeseada);

        // Se resetea el registro de resultados
        resultadosEstudio = [];
        indicePreguntaEstudioActual = 0;
        
        opcionesModoEstudioDiv.style.display = 'none';
        areaEstudioDiv.style.display = 'block';
        resumenEstudioContainer.style.display = 'none'; // Asegurarse de ocultar el resumen al inicio
        tituloMateriaEstudioH2.textContent = `Modo Estudio | ${materiaSeleccionadaKey}`;

        mostrarPreguntaEstudio();
    }

    // ======== NUEVA FUNCIÓN: mostrarResumenEstudio ========
    function mostrarResumenEstudio() {
        let correctas = 0;
        resultadosEstudio.forEach(resultado => {
            if (resultado.esCorrecta) {
                correctas++;
            }
        });
        const totalEstudiadas = resultadosEstudio.length;
        const incorrectas = totalEstudiadas - correctas;

        // ================== NUEVO CÁLCULO DE PORCENTAJES ==================
        let porcentajeCorrectas = "0.0";
        let porcentajeIncorrectas = "0.0";

        // Evitar división por cero si no se estudió ninguna pregunta
        if (totalEstudiadas > 0) {
            porcentajeCorrectas = ((correctas / totalEstudiadas) * 100).toFixed(1);
            porcentajeIncorrectas = ((incorrectas / totalEstudiadas) * 100).toFixed(1);
        }
        // ================================================================

        // Construir el HTML para el resumen
        // MODIFICADO: Añadir los porcentajes al HTML
        resumenEstudioContainer.innerHTML = `
            <h3>Resumen del Estudio</h3>
            <p class="resultado-destacado">✔️ Correctas: <span>${correctas}</span> (${porcentajeCorrectas}%)</p>
            <p class="resultado-destacado">❌ Incorrectas: <span>${incorrectas}</span> (${porcentajeIncorrectas}%)</p>
            <hr>
            <p>Total de preguntas estudiadas: <span>${totalEstudiadas}</span></p>
        `;
        
        // Mostrar el contenedor del resumen
        resumenEstudioContainer.style.display = 'block';
    }

    // ======== MODIFICADO: mostrarPreguntaEstudio ========
    function mostrarPreguntaEstudio() {
        if (indicePreguntaEstudioActual >= preguntasEstudioActual.length) {
            // --- SECCIÓN DE FIN DEL ESTUDIO ---
            textoPreguntaEstudioP.style.display = 'none';
            progresoEstudioP.textContent = `Fin del estudio.`;
            alternativasContainerEstudioDiv.innerHTML = "¡Has completado todas las preguntas de esta materia!";
            feedbackContainerEstudioDiv.style.display = 'none';
            
            // Llamar a la nueva función para mostrar el resumen
            mostrarResumenEstudio();
            
            // Configurar el botón para volver
            controlesEstudioDiv.innerHTML = ''; 
            const btnVolver = document.createElement('button');
            btnVolver.textContent = 'Volver a la Configuración';
            btnVolver.classList.add('secondary');
            btnVolver.onclick = reiniciarAplicacion;
            controlesEstudioDiv.appendChild(btnVolver);
            
            return;
        }

        // --- SECCIÓN PARA MOSTRAR UNA NUEVA PREGUNTA ---
        textoPreguntaEstudioP.style.display = 'block'; // Asegurarse que el texto de la pregunta sea visible
        enModoVerificacionEstudio = false;
        respuestaEstudioSeleccionada = null;
        feedbackContainerEstudioDiv.style.display = 'none';
        feedbackContainerEstudioDiv.innerHTML = '';
        
        controlesEstudioDiv.innerHTML = '';
        controlesEstudioDiv.appendChild(btnAccionEstudio);
        controlesEstudioDiv.appendChild(btnSalirEstudio);
        
        btnAccionEstudio.textContent = 'Verificar';
        btnAccionEstudio.disabled = true;
        btnAccionEstudio.style.display = 'inline-block';
        btnSalirEstudio.style.display = 'inline-block';

        const pregunta = preguntasEstudioActual[indicePreguntaEstudioActual];
        progresoEstudioP.textContent = `Pregunta ${indicePreguntaEstudioActual + 1} de ${preguntasEstudioActual.length}`;
        textoPreguntaEstudioP.textContent = `(ID: ${pregunta.idOriginal}) ${pregunta.texto}`;
        
        alternativasContainerEstudioDiv.innerHTML = '';
        const letrasOpciones = ['A', 'B', 'C', 'D', 'E', 'F'];
        pregunta.opciones.forEach((opcionTexto, i) => {
            if (opcionTexto && opcionTexto.trim() !== "") {
                const btn = document.createElement('button');
                btn.textContent = `${letrasOpciones[i]}) ${opcionTexto}`;
                btn.dataset.indiceOpcion = i;
                btn.addEventListener('click', () => seleccionarAlternativaEstudio(btn, i));
                alternativasContainerEstudioDiv.appendChild(btn);
            }
        });
    }
    
    function seleccionarAlternativaEstudio(botonClickeado, indiceSeleccionado) {
        if (enModoVerificacionEstudio) return;
        alternativasContainerEstudioDiv.querySelectorAll('button').forEach(b => b.classList.remove('seleccionada'));
        botonClickeado.classList.add('seleccionada');
        respuestaEstudioSeleccionada = indiceSeleccionado;
        btnAccionEstudio.disabled = false;
    }

    function manejarAccionEstudio() {
        if (enModoVerificacionEstudio) {
            indicePreguntaEstudioActual++;
            mostrarPreguntaEstudio();
        } else {
            verificarRespuestaEstudio();
            if (indicePreguntaEstudioActual === preguntasEstudioActual.length - 1) {
                btnAccionEstudio.textContent = 'Finalizar Estudio';
                btnSalirEstudio.style.display = 'none';
            } else {
                btnAccionEstudio.textContent = 'Siguiente Pregunta';
            }
        }
    }

    // ======== MODIFICADO: verificarRespuestaEstudio ========
    function verificarRespuestaEstudio() {
        enModoVerificacionEstudio = true;
        const preguntaActual = preguntasEstudioActual[indicePreguntaEstudioActual];
        const indiceCorrecto = convertirLetraAIndice(preguntaActual.correcta);
        const esCorrecta = respuestaEstudioSeleccionada === indiceCorrecto;

        // Registrar el resultado
        resultadosEstudio.push({ esCorrecta: esCorrecta });
        
        const botonesAlternativa = alternativasContainerEstudioDiv.querySelectorAll('button');
        botonesAlternativa.forEach(btn => {
            btn.disabled = true;
            const indiceBoton = parseInt(btn.dataset.indiceOpcion);
            if (indiceBoton === indiceCorrecto) {
                btn.classList.add('correcta');
            } else if (indiceBoton === respuestaEstudioSeleccionada) {
                btn.classList.add('incorrecta');
            }
        });

        feedbackContainerEstudioDiv.innerHTML = `
            <p class="feedback-titulo">${esCorrecta ? '✔️ ¡Correcto!' : '❌ Incorrecto'}</p>
            ${!esCorrecta ? `<p><strong>La respuesta correcta es:</strong> ${preguntaActual.opciones[indiceCorrecto]}</p>` : ''}
            <p><strong>Explicación:</strong> ${preguntaActual.feedback || 'No hay feedback disponible para esta pregunta.'}</p>
        `;
        feedbackContainerEstudioDiv.className = `feedback-container ${esCorrecta ? 'feedback-correcto' : 'feedback-incorrecto'}`;
        feedbackContainerEstudioDiv.style.display = 'block';
        
        btnAccionEstudio.disabled = false;
    }

    function terminarEstudioConfirmacion() {
        if (confirm("¿Estás seguro de que quieres salir del Modo Estudio?")) {
            preguntasEstudioActual = [];
            indicePreguntaEstudioActual = 0;
            resultadosEstudio = []; // También limpiar el registro de resultados
            areaEstudioDiv.style.display = 'none';
            configuracionTestDiv.style.display = 'block';
        }
    }

    // Iniciar la aplicación al cargar la página
    inicializarApp();
});