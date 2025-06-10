// app.js
document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURACIÓN DE CURSOS ---
    // Define aquí los cursos, los archivos JS asociados y la variable global que contendrán.
    const CURSOS_CONFIG = [
        { id: "PCA", nombreDisplay: "Piloto Comercial de Avión", archivo: "datos_PCA.js", dataVariable: "CURSO_PCA_MATERIAS" },
        { id: "IFR", nombreDisplay: "Habilitación de Vuelo por Instrumentos (IFR)", archivo: "datos_IFR.js", dataVariable: "CURSO_IFR_MATERIAS" },
        { id: "PPA", nombreDisplay: "Piloto Privado de Avión", archivo: "datos_PPA.js", dataVariable: "CURSO_PPA_MATERIAS" }, // Ejemplo para PPL
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

// app.js
// ... (constantes de DOM y CURSOS_CONFIG como estaban) ...

    // --- Test State ---
    let cursoSeleccionadoActual = null; 
    let datosMateriasCursoCargado = null; 
    let materiaSeleccionadaKey = '';    
    
    let preguntasSeleccionadasGlobal = []; 
    let respuestasUsuarioGlobal = []; 
    let preguntasOmitidasIndices = []; 
    let indicePreguntaActual = 0;
    let indicePreguntaOmitidaActual = 0;

    let scriptsCargados = {}; // Para rastrear si un script ya fue cargado y su promesa

    // Boton para mostrar detalle en resumen final
    function toggleDetalleEspecifico(container, button, tipo) {
        if (container.style.display === 'none') {
            container.style.display = 'block';
            button.textContent = `Ocultar Detalle ${tipo}`;
        } else {
            container.style.display = 'none';
            button.textContent = `Ver Detalle ${tipo}`;
        }
    }

    // --- Initialization ---
    function inicializarApp() {
        console.log("Inicializando App...");
        poblarSelectorCursos(); // 1. Poblar cursos

        // 2. Añadir event listeners
        cursoSelect.addEventListener('change', handleCursoChange);
        materiaSelect.addEventListener('change', handleMateriaChange);
        cantidadPreguntasInput.addEventListener('input', checkFormHabilitarBotones);
        cantidadPreguntasInput.addEventListener('change', checkFormHabilitarBotones);

        btnEmpezarTest.addEventListener('click', () => prepararYEjecutarAccion('test'));
        btnGenerarDocumento.addEventListener('click', () => prepararYEjecutarAccion('documento'));
        
        // ... (otros listeners como estaban) ...
        btnSiguientePregunta.addEventListener('click', procesarSiguientePregunta);
        btnOmitirPregunta.addEventListener('click', omitirPreguntaActual);
        btnTerminarTest.addEventListener('click', terminarTestConfirmacion);
        btnSiguientePreguntaOmitida.addEventListener('click', procesarSiguientePreguntaOmitida);
        btnVerResultados.addEventListener('click', calcularYMostrarResultados);
        btnTerminarTestOmitidas.addEventListener('click', terminarTestConfirmacion);
        btnVerDetalleIncorrectas.addEventListener('click', () => toggleDetalleEspecifico(detalleIncorrectasContainerDiv, btnVerDetalleIncorrectas, "Incorrectas"));
        btnVerDetalleCorrectas.addEventListener('click', () => toggleDetalleEspecifico(detalleCorrectasContainerDiv, btnVerDetalleCorrectas, "Correctas"));
        btnReiniciarTest.addEventListener('click', reiniciarAplicacion);
        
        // 3. Establecer estado inicial de la UI
        resetearConfiguracionUI(); 
        console.log("App inicializada.");
    }

    function poblarSelectorCursos() {
        console.log("Poblando selector de cursos...");
        // Limpiar opciones existentes excepto la primera (placeholder que ya está en HTML)
        while (cursoSelect.options.length > 1) {
            cursoSelect.remove(1);
        }
        CURSOS_CONFIG.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.id; 
            option.textContent = curso.nombreDisplay; 
            cursoSelect.appendChild(option);
        });
        console.log("Selector de cursos poblado.");
    }

    function resetearConfiguracionUI() {
        console.log("Reseteando UI de configuración...");
        cursoSelect.value = ""; // Seleccionar la opción por defecto "Elegir curso..."
        materiaSelect.innerHTML = '<option value="">Primero elige un curso...</option>';
        materiaSelect.disabled = true;
        cantidadPreguntasInput.value = "";
        cantidadPreguntasInput.placeholder = "Elige curso y materia";
        cantidadPreguntasInput.disabled = true;
        maxPreguntasMateriaSpan.textContent = "0";
        
        // Llamar a checkFormHabilitarBotones al final para asegurar estado correcto de botones
        checkFormHabilitarBotones(); 
        console.log("UI de configuración reseteada.");
    }

    // Callback que será llamado por los scripts de datos
    window.registrarDatosCurso = function(nombreVariableGlobal, datos) {
        console.log(`Datos registrados para ${nombreVariableGlobal} via callback.`);
        window[nombreVariableGlobal] = datos; 
        if (scriptsCargados[nombreVariableGlobal] && scriptsCargados[nombreVariableGlobal].resolve) {
            scriptsCargados[nombreVariableGlobal].resolve(datos);
        }
        scriptsCargados[nombreVariableGlobal].cargado = true; 
    };

    function cargarScriptDatosCurso(nombreArchivoScript, nombreVariableGlobal) {
        // Si la variable global ya existe y el script está marcado como cargado
        if (scriptsCargados[nombreVariableGlobal] && scriptsCargados[nombreVariableGlobal].cargado && typeof window[nombreVariableGlobal] !== 'undefined') {
            console.log(`Datos para ${nombreVariableGlobal} ya disponibles (reutilizando).`);
            return Promise.resolve(window[nombreVariableGlobal]);
        }

        // Si ya existe una promesa para este script y no está resuelta, la retornamos
        if (scriptsCargados[nombreVariableGlobal] && !scriptsCargados[nombreVariableGlobal].cargado && scriptsCargados[nombreVariableGlobal].promise) {
            console.log(`Reutilizando promesa existente para ${nombreVariableGlobal}.`);
            return scriptsCargados[nombreVariableGlobal].promise;
        }
        
        console.log(`Iniciando carga para ${nombreVariableGlobal} desde ${nombreArchivoScript}`);
        let resolvePromise, rejectPromise;
        const promise = new Promise((resolve, reject) => {
            resolvePromise = resolve;
            rejectPromise = reject;
        });

        scriptsCargados[nombreVariableGlobal] = { 
            promise: promise, 
            resolve: resolvePromise, 
            reject: rejectPromise,
            cargado: false 
        };

        const scriptId = `script-datos-${nombreVariableGlobal}`;
        let scriptExistente = document.getElementById(scriptId);
        
        if (scriptExistente) {
            console.log(`Script ${scriptId} existía, removiendo para recargar.`);
            scriptExistente.remove();
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = nombreArchivoScript;
        script.async = true; 
        
        script.onload = () => {
            console.log(`${nombreArchivoScript} descargado (evento onload). Esperando registro de datos vía callback.`);
            // El resolve ahora se maneja en window.registrarDatosCurso
            // Podemos poner un timeout para detectar si el callback NUNCA se llama.
            setTimeout(() => {
                if (!scriptsCargados[nombreVariableGlobal].cargado && scriptsCargados[nombreVariableGlobal].reject) {
                    console.error(`Timeout: ${nombreVariableGlobal} no fue registrado por su script después de la carga.`);
                    scriptsCargados[nombreVariableGlobal].reject(`Timeout esperando el registro de ${nombreVariableGlobal}.`);
                }
            }, 5000); // Aumentado a 5 segundos para dar más margen
        };
        
        script.onerror = (event) => {
            console.error(`Error al cargar el script de datos: ${nombreArchivoScript}. Evento:`, event);
            if (scriptsCargados[nombreVariableGlobal] && scriptsCargados[nombreVariableGlobal].reject) {
                scriptsCargados[nombreVariableGlobal].reject(`Error al cargar el script de datos: ${nombreArchivoScript}.`);
            }
        };
        console.log(`Añadiendo script ${nombreArchivoScript} al head.`);
        document.head.appendChild(script);

        return promise;
    }
    
    async function handleCursoChange() {
        console.log("handleCursoChange disparado. Valor del select: ", cursoSelect.value);
        const cursoIdSeleccionado = cursoSelect.value;
        cursoSeleccionadoActual = CURSOS_CONFIG.find(c => c.id === cursoIdSeleccionado);

        // Resetear campos dependientes
        materiaSelect.innerHTML = '<option value="">Cargando materias...</option>';
        materiaSelect.disabled = true;
        cantidadPreguntasInput.value = "";
        cantidadPreguntasInput.placeholder = "Elige curso y materia";
        cantidadPreguntasInput.disabled = true;
        maxPreguntasMateriaSpan.textContent = "0";
        datosMateriasCursoCargado = null; // Limpiar datos del curso anterior
        materiaSeleccionadaKey = "";   // Limpiar materia seleccionada

        if (cursoSeleccionadoActual) {
            try {
                console.log(`Intentando cargar datos para curso: ${cursoSeleccionadoActual.nombreDisplay}, archivo: ${cursoSeleccionadoActual.archivo}, variable: ${cursoSeleccionadoActual.dataVariable}`);
                datosMateriasCursoCargado = await cargarScriptDatosCurso(cursoSeleccionadoActual.archivo, cursoSeleccionadoActual.dataVariable);
                console.log(`Datos cargados para ${cursoSeleccionadoActual.dataVariable}. Materias:`, datosMateriasCursoCargado);
                
                if (datosMateriasCursoCargado && typeof datosMateriasCursoCargado === 'object' && Object.keys(datosMateriasCursoCargado).length > 0) {
                    poblarSelectorMaterias();
                    materiaSelect.disabled = false;
                } else {
                    materiaSelect.innerHTML = '<option value="">No hay materias definidas</option>';
                    console.warn("El objeto de materias cargado está vacío o no es un objeto:", datosMateriasCursoCargado);
                }
            } catch (error) {
                console.error(`Error en handleCursoChange al cargar datos para ${cursoSeleccionadoActual.nombreDisplay}:`, error);
                materiaSelect.innerHTML = '<option value="">Error al cargar materias</option>';
                alert(`Error cargando datos para ${cursoSeleccionadoActual.nombreDisplay}. Detalles en consola.`);
            }
        } else { // Si se selecciona "Elegir curso..."
             resetearConfiguracionUI(); // Llama a la función completa de reseteo
        }
        checkFormHabilitarBotones(); // Llamar siempre para actualizar estado de botones
    }

    function poblarSelectorMaterias() {
        console.log("Poblando selector de materias. Datos del curso actual:", datosMateriasCursoCargado);
        materiaSelect.innerHTML = '<option value="">Elegir materia...</option>'; 
        if (!datosMateriasCursoCargado || !cursoSeleccionadoActual) {
            console.warn("No hay datos de materias cargados o curso no seleccionado para poblar selector de materias.");
            resetearCamposMateriaCantidad();
            return;
        }

        Object.keys(datosMateriasCursoCargado).sort().forEach(claveMateriaEnDatos => {
            const option = document.createElement('option');
            option.value = claveMateriaEnDatos; 
            option.textContent = claveMateriaEnDatos; // Ya es el nombre limpio
            materiaSelect.appendChild(option);
        });
        console.log("Selector de materias poblado.");
        // No llamar a handleMateriaChange aquí directamente para evitar bucles o ejecuciones prematuras
        // El usuario seleccionará una materia, lo que disparará handleMateriaChange
        // Pero sí actualizamos el estado del input de cantidad por si la primera materia ya está seleccionada (aunque no debería)
        if (materiaSelect.value === "") { // Si sigue en "Elegir materia..."
            resetearCamposCantidad();
        }
        checkFormHabilitarBotones();
    }

    function resetearCamposCantidad() {
        maxPreguntasMateriaSpan.textContent = "0";
        cantidadPreguntasInput.max = "0";
        cantidadPreguntasInput.value = "";
        cantidadPreguntasInput.placeholder = "Elegir número de preguntas";
        cantidadPreguntasInput.disabled = true;
    }
    
    function handleMateriaChange() {
        materiaSeleccionadaKey = materiaSelect.value; 
        console.log(`handleMateriaChange: materiaSeleccionadaKey = "${materiaSeleccionadaKey}"`);
        
        if (materiaSeleccionadaKey && datosMateriasCursoCargado && datosMateriasCursoCargado[materiaSeleccionadaKey]) {
            const totalPreguntas = datosMateriasCursoCargado[materiaSeleccionadaKey].length;
            maxPreguntasMateriaSpan.textContent = totalPreguntas;
            cantidadPreguntasInput.max = totalPreguntas;
            cantidadPreguntasInput.placeholder = `Máx ${totalPreguntas} (ej: 10)`;
            cantidadPreguntasInput.disabled = false;
            cantidadPreguntasInput.value = ""; // Vaciar para mostrar placeholder al cambiar materia
            
        } else {
            resetearCamposCantidad();
        }
        checkFormHabilitarBotones();
    }

    function checkFormHabilitarBotones() {
        const cursoOK = cursoSelect.value !== "";
        const materiaOK = materiaSelect.value !== "" && !materiaSelect.disabled;
        const cantidadTexto = cantidadPreguntasInput.value.trim();
        const cantidadNum = parseInt(cantidadTexto);
        let maxNum = 0;
        if (materiaOK && materiaSeleccionadaKey && datosMateriasCursoCargado && datosMateriasCursoCargado[materiaSeleccionadaKey]) {
            maxNum = datosMateriasCursoCargado[materiaSeleccionadaKey].length;
        }
        const cantidadEsValida = cantidadTexto !== "" && !isNaN(cantidadNum) && cantidadNum >= 1 && (maxNum === 0 || cantidadNum <= maxNum);
        
        const habilitar = cursoOK && materiaOK && cantidadEsValida;

        console.log(`CheckForm: cursoOK=${cursoOK}, materiaOK=${materiaOK}, cantidadEsValida=${cantidadEsValida} (val: ${cantidadTexto}, num: ${cantidadNum}, max: ${maxNum}), HABILITAR=${habilitar}`);

        btnEmpezarTest.disabled = !habilitar;
        btnGenerarDocumento.disabled = !habilitar;
    }

    // --- FIN DE PARTE 1 de app.js ---
    // --- INICIO DE PARTE 2 de app.js ---
// (Asegúrate de que esto se pegue DESPUÉS del final de la PARTE 1)

    function prepararYEjecutarAccion(tipoAccion) {
        if (!cursoSeleccionadoActual || !datosMateriasCursoCargado) {
            alert("Los datos del curso no se han cargado correctamente. Por favor, selecciona un curso nuevamente.");
            return;
        }
        
        materiaSeleccionadaKey = materiaSelect.value; 

        if (!materiaSeleccionadaKey || !datosMateriasCursoCargado[materiaSeleccionadaKey]) {
            alert("Por favor, selecciona una materia válida.");
            return;
        }

        let cantidadDeseada;
        const cantidadTexto = cantidadPreguntasInput.value.trim();
        const preguntasDisponiblesMateria = datosMateriasCursoCargado[materiaSeleccionadaKey];
        const maxDisp = preguntasDisponiblesMateria.length;

        if (cantidadTexto === "" || isNaN(parseInt(cantidadTexto))) {
            cantidadDeseada = Math.min(10, maxDisp);
            alert(`Número de preguntas no especificado o inválido. Se usarán ${cantidadDeseada} preguntas.`);
            cantidadPreguntasInput.value = cantidadDeseada; 
        } else {
            cantidadDeseada = parseInt(cantidadTexto);
            if (cantidadDeseada <= 0) {
                alert("Por favor, ingresa un número positivo de preguntas.");
                cantidadPreguntasInput.value = Math.min(10, maxDisp); 
                return;
            }
            if (cantidadDeseada > maxDisp) {
                alert(`El número de preguntas (${cantidadDeseada}) excede las disponibles (${maxDisp}). Se usarán todas las ${maxDisp} preguntas.`);
                cantidadDeseada = maxDisp;
                cantidadPreguntasInput.value = cantidadDeseada;
            }
        }
        
        preguntasSeleccionadasGlobal = [...preguntasDisponiblesMateria].sort(() => 0.5 - Math.random()).slice(0, cantidadDeseada);

        respuestasUsuarioGlobal = new Array(preguntasSeleccionadasGlobal.length).fill(null).map((_, i) => ({
            preguntaOriginal: preguntasSeleccionadasGlobal[i],
            respuestaUsuario: null, 
            esCorrecta: null
        }));
        preguntasOmitidasIndices = [];
        indicePreguntaActual = 0;
        indicePreguntaOmitidaActual = 0;

        if (tipoAccion === 'test') {
            configurarEIniciarTestInteractivo();
        } else if (tipoAccion === 'documento') {
            generarDocumentoTexto();
        }
    }
    
    function configurarEIniciarTestInteractivo() {
        configuracionTestDiv.style.display = 'none';
        areaResultadosDiv.style.display = 'none';
        areaOmitidasDiv.style.display = 'none';
        areaTestDiv.style.display = 'block';
        
        tituloMateriaTestH2.textContent = `Curso: ${cursoSeleccionadoActual.nombreDisplay} | Materia: ${materiaSeleccionadaKey}`;
        
        mostrarPreguntaActual();
    }

    function generarDocumentoTexto() { 
        if (preguntasSeleccionadasGlobal.length === 0) {
            alert("No hay preguntas seleccionadas para generar el documento.");
            return;
        }

        let contenidoDocumento = `CURSO: ${cursoSeleccionadoActual.nombreDisplay}\n`;
        contenidoDocumento += `MATERIA: ${materiaSeleccionadaKey}\n`; 
        contenidoDocumento += `CANTIDAD DE PREGUNTAS: ${preguntasSeleccionadasGlobal.length}\n\n`;
        contenidoDocumento += "------------------------------------\n";
        contenidoDocumento += "PREGUNTAS\n";
        contenidoDocumento += "------------------------------------\n\n";

        const letrasOpciones = ['A', 'B', 'C', 'D', 'E', 'F'];
        preguntasSeleccionadasGlobal.forEach((pregunta, index) => {
            contenidoDocumento += `${index + 1}. (ID: ${pregunta.idOriginal}) ${pregunta.texto}\n`;
            pregunta.opciones.forEach((opcion, i) => {
                if (opcion && opcion.trim() !== "") {
                    contenidoDocumento += `   ${letrasOpciones[i]}) ${opcion}\n`;
                }
            });
            contenidoDocumento += "\n"; 
        });

        for (let i = 0; i < 5; i++) { 
            contenidoDocumento += "\n\n\n\n\n\n\n\n\n\n"; 
        }
        
        contenidoDocumento += "------------------------------------\n";
        contenidoDocumento += "RESPUESTAS CORRECTAS Y FEEDBACK\n";
        contenidoDocumento += "------------------------------------\n\n";

        preguntasSeleccionadasGlobal.forEach((pregunta, index) => {
            contenidoDocumento += `${index + 1}. (ID: ${pregunta.idOriginal})\n`;
            contenidoDocumento += `   Respuesta Correcta: ${pregunta.correcta}\n`;
            if (pregunta.feedback && pregunta.feedback.trim() !== "") {
                contenidoDocumento += `   Feedback: ${pregunta.feedback}\n`;
            }
            contenidoDocumento += "\n";
        });

        const nombreArchivo = `Evaluacion_${cursoSeleccionadoActual.nombreDisplay.replace(/[^a-z0-9]/gi, '_')}_${materiaSeleccionadaKey.replace(/[^a-z0-9]/gi, '_')}.txt`;
        
        const blob = new Blob([contenidoDocumento], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = nombreArchivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href); 

        alert(`Documento "${nombreArchivo}" generado y descarga iniciada.`);
    }

    function mostrarPreguntaActual() {
        if (indicePreguntaActual < preguntasSeleccionadasGlobal.length) {
            const preguntaObj = preguntasSeleccionadasGlobal[indicePreguntaActual];
            progresoPreguntaP.textContent = `Pregunta ${indicePreguntaActual + 1} de ${preguntasSeleccionadasGlobal.length}`;
            textoPreguntaP.textContent = `(ID: ${preguntaObj.idOriginal}) ${preguntaObj.texto}`;
            
            alternativasContainerDiv.innerHTML = '';
            const letrasOpciones = ['A', 'B', 'C', 'D', 'E', 'F'];
            preguntaObj.opciones.forEach((opcionTexto, i) => {
                if (opcionTexto && opcionTexto.trim() !== "") { 
                    const btn = document.createElement('button');
                    btn.textContent = `${letrasOpciones[i]}) ${opcionTexto}`;
                    btn.dataset.opcionLetra = letrasOpciones[i];
                    btn.addEventListener('click', () => seleccionarAlternativaActual(btn, alternativasContainerDiv));
                    alternativasContainerDiv.appendChild(btn);
                }
            });
            const respuestaPrevia = respuestasUsuarioGlobal[indicePreguntaActual].respuestaUsuario;
            if (respuestaPrevia) {
                const btnSeleccionado = alternativasContainerDiv.querySelector(`button[data-opcion-letra="${respuestaPrevia}"]`);
                if (btnSeleccionado) btnSeleccionado.classList.add('seleccionada');
            }
            btnOmitirPregunta.style.display = 'inline-block'; 
            btnSiguientePregunta.disabled = respuestaPrevia === null;
            btnOmitirPregunta.disabled = respuestaPrevia !== null;
        } else {
            pasarARondaOmitidasOResultados();
        }
    }
    
    function seleccionarAlternativaActual(botonClickeado, container) {
        container.querySelectorAll('button').forEach(b => b.classList.remove('seleccionada'));
        botonClickeado.classList.add('seleccionada');
        respuestasUsuarioGlobal[indicePreguntaActual].respuestaUsuario = botonClickeado.dataset.opcionLetra;
        btnSiguientePregunta.disabled = false;
        btnOmitirPregunta.disabled = true; 
    }

    function procesarSiguientePregunta() {
        // La respuesta ya se guardó en seleccionarAlternativaActual
        indicePreguntaActual++;
        mostrarPreguntaActual();
    }

    function omitirPreguntaActual() {
        if (!preguntasOmitidasIndices.includes(indicePreguntaActual)) {
            preguntasOmitidasIndices.push(indicePreguntaActual);
        }
        respuestasUsuarioGlobal[indicePreguntaActual].respuestaUsuario = null; 
        alternativasContainerDiv.querySelectorAll('button.seleccionada').forEach(b => b.classList.remove('seleccionada'));
        btnOmitirPregunta.disabled = true; 
        btnSiguientePregunta.disabled = false; 
        
        indicePreguntaActual++;
        mostrarPreguntaActual();
    }
    
    function pasarARondaOmitidasOResultados() {
        btnOmitirPregunta.style.display = 'none';
        const omitidasReales = preguntasOmitidasIndices.filter(idx => respuestasUsuarioGlobal[idx].respuestaUsuario === null);
        preguntasOmitidasIndices = omitidasReales; 

        if (preguntasOmitidasIndices.length > 0) {
            indicePreguntaOmitidaActual = 0; 
            areaTestDiv.style.display = 'none';
            areaOmitidasDiv.style.display = 'block';
            mostrarPreguntaOmitidaActual();
        } else {
            calcularYMostrarResultados();
        }
    }
    
    function mostrarPreguntaOmitidaActual() {
        if (indicePreguntaOmitidaActual < preguntasOmitidasIndices.length) {
            const indiceOriginal = preguntasOmitidasIndices[indicePreguntaOmitidaActual];
            const preguntaObj = preguntasSeleccionadasGlobal[indiceOriginal];

            progresoPreguntaOmitidaP.textContent = `Pregunta Omitida ${indicePreguntaOmitidaActual + 1} de ${preguntasOmitidasIndices.length}`;
            textoPreguntaOmitidaP.textContent = `(ID: ${preguntaObj.idOriginal}) ${preguntaObj.texto}`;
            
            alternativasContainerOmitidaDiv.innerHTML = '';
            const letrasOpciones = ['A', 'B', 'C', 'D', 'E', 'F'];
            preguntaObj.opciones.forEach((opcionTexto, i) => {
                 if (opcionTexto && opcionTexto.trim() !== "") {
                    const btn = document.createElement('button');
                    btn.textContent = `${letrasOpciones[i]}) ${opcionTexto}`;
                    btn.dataset.opcionLetra = letrasOpciones[i];
                    btn.addEventListener('click', () => seleccionarAlternativaOmitida(btn, alternativasContainerOmitidaDiv)); 
                    alternativasContainerOmitidaDiv.appendChild(btn);
                }
            });
            
            const respuestaPreviaOmitida = respuestasUsuarioGlobal[indiceOriginal].respuestaUsuario;
            if (respuestaPreviaOmitida) {
                 const btnSeleccionado = alternativasContainerOmitidaDiv.querySelector(`button[data-opcion-letra="${respuestaPreviaOmitida}"]`);
                if (btnSeleccionado) btnSeleccionado.classList.add('seleccionada');
            }
            btnSiguientePreguntaOmitida.disabled = respuestaPreviaOmitida === null;

            if (indicePreguntaOmitidaActual === preguntasOmitidasIndices.length - 1) {
                btnVerResultados.style.display = 'inline-block';
                btnSiguientePreguntaOmitida.style.display = 'none';
            } else {
                btnVerResultados.style.display = 'none';
                btnSiguientePreguntaOmitida.style.display = 'inline-block';
            }
        } else {
            calcularYMostrarResultados();
        }
    }
    
    function seleccionarAlternativaOmitida(botonClickeado, container) {
        container.querySelectorAll('button').forEach(b => b.classList.remove('seleccionada'));
        botonClickeado.classList.add('seleccionada');
        const indiceReal = preguntasOmitidasIndices[indicePreguntaOmitidaActual];
        respuestasUsuarioGlobal[indiceReal].respuestaUsuario = botonClickeado.dataset.opcionLetra;
        btnSiguientePreguntaOmitida.disabled = false;
    }

    function procesarSiguientePreguntaOmitida() {
        const indiceOriginalPregunta = preguntasOmitidasIndices[indicePreguntaOmitidaActual];
        if (respuestasUsuarioGlobal[indiceOriginalPregunta].respuestaUsuario === null) { 
            alert("Por favor, selecciona una alternativa para esta pregunta omitida.");
            return;
        }
        
        indicePreguntaOmitidaActual++;
        if (indicePreguntaOmitidaActual >= preguntasOmitidasIndices.length) {
             calcularYMostrarResultados();
        } else {
            mostrarPreguntaOmitidaActual();
        }
    }
    
    function calcularYMostrarResultados() {
        // ... (Esta función es larga, pero su lógica interna no debería cambiar mucho respecto a la última versión)
        // Asegúrate de que `cursoSeleccionadoActual.nombreDisplay` y `materiaSeleccionadaKey` se usen para los títulos.
        // El resto del cálculo y la creación de elementos de detalle debería seguir funcionando.
        let correctas = 0;
        let incorrectas = 0;
        let omitidasAlFinal = 0;
        let respondidasCount = 0;
        let idsIncorrectas = [];
        let idsCorrectas = [];

        detalleCorrectasContainerDiv.innerHTML = '';
        detalleIncorrectasContainerDiv.innerHTML = '';
        resumenIdsCorrectasDiv.innerHTML = 'IDs: ';
        resumenIdsIncorrectasDiv.innerHTML = 'IDs: ';

        respuestasUsuarioGlobal.forEach((respuestaItem, index) => {
            const preg = respuestaItem.preguntaOriginal;
            const numeroPreguntaEnTest = index + 1; 

            if (respuestaItem.respuestaUsuario !== null && respuestaItem.respuestaUsuario !== undefined) {
                respondidasCount++;
                if (respuestaItem.respuestaUsuario === preg.correcta) {
                    correctas++;
                    respuestaItem.esCorrecta = true;
                    idsCorrectas.push(preg.idOriginal);
                    detalleCorrectasContainerDiv.appendChild(crearElementoDetalle(respuestaItem, numeroPreguntaEnTest -1));
                } else {
                    incorrectas++;
                    respuestaItem.esCorrecta = false;
                    idsIncorrectas.push(preg.idOriginal);
                    detalleIncorrectasContainerDiv.appendChild(crearElementoDetalle(respuestaItem, numeroPreguntaEnTest-1));
                }
            } else {
                omitidasAlFinal++;
                respuestaItem.esCorrecta = null;
            }
        });

        idsCorrectas.sort((a,b) => String(a).localeCompare(String(b), undefined, {numeric: true})).forEach(id => { 
            const span = document.createElement('span');
            span.textContent = id;
            resumenIdsCorrectasDiv.appendChild(span);
        });
        idsIncorrectas.sort((a,b) => String(a).localeCompare(String(b), undefined, {numeric: true})).forEach(id => { 
            const span = document.createElement('span');
            span.textContent = id;
            resumenIdsIncorrectasDiv.appendChild(span);
        });

        if (idsCorrectas.length === 0) resumenIdsCorrectasDiv.innerHTML = 'IDs: Ninguna';
        if (idsIncorrectas.length === 0) resumenIdsIncorrectasDiv.innerHTML = 'IDs: Ninguna';

        contadorCorrectasSpan.textContent = correctas;
        contadorIncorrectasSpan.textContent = incorrectas;

        resCursoSpan.textContent = cursoSeleccionadoActual ? cursoSeleccionadoActual.nombreDisplay : 'N/A'; 
        resMateriaSpan.textContent = materiaSeleccionadaKey; 
        resTotalSeleccionadasSpan.textContent = preguntasSeleccionadasGlobal.length;
        resRespondidasSpan.textContent = respondidasCount;
        resCorrectasSpan.textContent = correctas;
        resIncorrectasSpan.textContent = incorrectas;
        resOmitidasFinalSpan.textContent = omitidasAlFinal;
        
        const porcentaje = respondidasCount > 0 ? ((correctas / respondidasCount) * 100).toFixed(1) : "0.0";
        resPorcentajeSpan.textContent = `${porcentaje}%`;
        
        areaTestDiv.style.display = 'none';
        areaOmitidasDiv.style.display = 'none';
        configuracionTestDiv.style.display = 'none'; 
        areaResultadosDiv.style.display = 'block';

        detalleCorrectasContainerDiv.style.display = 'none';
        btnVerDetalleCorrectas.textContent = 'Ver Detalle Correctas';
        detalleIncorrectasContainerDiv.style.display = 'none';
        btnVerDetalleIncorrectas.textContent = 'Ver Detalle Incorrectas';
    }

    function crearElementoDetalle(respuestaItem, numeroPreguntaEnTest) { 
        const preg = respuestaItem.preguntaOriginal;
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('detalle-item');
        
        let resultadoTexto = '';
        let claseResultado = '';

        if (respuestaItem.respuestaUsuario === null || respuestaItem.respuestaUsuario === undefined) {
            resultadoTexto = 'Omitida / Sin respuesta';
            claseResultado = 'respuesta-omitida-texto';
        } else if (respuestaItem.esCorrecta) {
            resultadoTexto = 'Correcto';
            claseResultado = 'respuesta-correcta-texto';
        } else {
            resultadoTexto = 'Incorrecto';
            claseResultado = 'respuesta-incorrecta-texto';
        }
        
        itemDiv.innerHTML = `
            <p class="pregunta-detalle"><strong>${numeroPreguntaEnTest + 1}. (ID: ${preg.idOriginal}) ${preg.texto}</strong></p>
            <p>Tu respuesta: ${respuestaItem.respuestaUsuario ? respuestaItem.respuestaUsuario : '<em>No respondida</em>'}</p>
            <p>Respuesta Correcta: ${preg.correcta}</p>
            <p class="${claseResultado}">Resultado: ${resultadoTexto}</p>
            ${(preg.feedback && preg.feedback.trim() !== "") ? `<p class="feedback-texto"><em>Feedback: ${preg.feedback}</em></p>` : ''}
        `;
        return itemDiv;
    }
    
    function terminarTestConfirmacion() {
        if (confirm("¿Estás seguro de que deseas terminar la evaluación? Tu progreso actual no se guardará y no se mostrarán resultados.")) {
            reiniciarAplicacion();
        }
    }

    function reiniciarAplicacion() {
        // Resetear estado global
        cursoSeleccionadoActual = null;
        datosMateriasCursoCargado = null;
        materiaSeleccionadaKey = '';
        preguntasSeleccionadasGlobal = [];
        respuestasUsuarioGlobal = [];
        preguntasOmitidasIndices = [];
        indicePreguntaActual = 0;
        indicePreguntaOmitidaActual = 0;

        // Ocultar secciones de test/resultados y mostrar configuración
        areaTestDiv.style.display = 'none';
        areaOmitidasDiv.style.display = 'none';
        areaResultadosDiv.style.display = 'none';
        configuracionTestDiv.style.display = 'block';
        
        resetearConfiguracionUI(); // Llama a la función de reseteo de la UI de configuración
        
        // Limpiar también los contenedores de detalle de resultados
        detalleCorrectasContainerDiv.innerHTML = '';
        detalleCorrectasContainerDiv.style.display = 'none';
        btnVerDetalleCorrectas.textContent = 'Ver Detalle Correctas';
        resumenIdsCorrectasDiv.innerHTML = 'IDs: Ninguna';

        detalleIncorrectasContainerDiv.innerHTML = '';
        detalleIncorrectasContainerDiv.style.display = 'none';
        btnVerDetalleIncorrectas.textContent = 'Ver Detalle Incorrectas';
        resumenIdsIncorrectasDiv.innerHTML = 'IDs: Ninguna';
        
        contadorCorrectasSpan.textContent = '0';
        contadorIncorrectasSpan.textContent = '0';
    }

    // Iniciar la aplicación
    inicializarApp();
});
// --- FIN DE PARTE 2 de app.js ---