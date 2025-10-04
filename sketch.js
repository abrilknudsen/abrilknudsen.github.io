//---SONIDO---
let monitorear = false;

let FREC_MIN = 120;  //AGUDO-GRAVE
let FREC_MAX = 900;
let FREC;

let AMP_MIN = 0.007; //FUERTE,DEBIL,SUAVE    /////////CHEQUEAR MAÑANA
let AMP_MAX = 0.09;
let AMP;

let mic;
let pitch;
let audioContext;

let gestorAmp;
let gestorPitch;

let haySonido;
let antesHabiaSonido;

const pitchModel = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';

//---TEACHABLE MACHINE---
let classifier;
const options = { probabilityThreshold: 0.7 };
let label;
let soundModel = 'https://teachablemachine.withgoogle.com/models/1wnCX0-l3/';
let chasquidoEjecutandose;

//---CAMINANTES---
let grosorEstablecido = null;
let estado = 0;

let cadenas = [];
let caminantes = [];
let caminanteActual = 0;
let cantidadCadenas = 15; /////Acá cantidad de cadenassss

let inactividadTimeout; // Identificador del temporizador de inactividad

function preload() {
  classifier = ml5.soundClassifier(soundModel + 'model.json', options);
}

function setup() {
 createCanvas(1920, 1080);  
 //createCanvas(windowWidth, windowHeight);

   // Revisar si estaba en fullscreen antes del reload
   if (localStorage.getItem('fullscreen') === 'true') {  
    fullscreen(true); // Restaurar fullscreen
  }

//---SONIDO---
  audioContext = getAudioContext();
  mic = new p5.AudioIn();
  mic.start(startPitch);

  classifier.classify(gotResult);

  gestorAmp =  new GestorSenial( AMP_MIN, AMP_MAX);
  gestorPitch = new GestorSenial( FREC_MIN, FREC_MAX);

  antesHabiaSonido = false;

   // Inicia el temporizador de inactividad
   reiniciarInactividad();
  }


function draw() {
  userStartAudio();

  colorMode(RGB);
  background(200);
  noFill();
  colorMode(HSB);

  console.log("Amplitud:", AMP);

  gestorAmp.actualizar(mic.getLevel()); 
  FREC = gestorPitch.filtrada;
  AMP = gestorAmp.filtrada;
  haySonido = gestorAmp.filtrada > AMP_MIN;
  let inicioSonido = haySonido && !antesHabiaSonido;

  if (haySonido) {
    reiniciarInactividad(); // Resetea el temporizador al detectar sonido
  }

  // Lógica de estados
  if (estado === 0 && inicioSonido) {
      // Definición de grosor de cadenas
      if (AMP < AMP_MAX) {
          grosorEstablecido = 30;
      } else {
          grosorEstablecido = 40;
      }

      for (let i = 0; i < cantidadCadenas; i++) {
          let estaCad = new Cadena();
          estaCad.click(random(-10, width + 10), random(-10, height + 10));
          estaCad.fin();
          estaCad.grosor = grosorEstablecido;
          cadenas.push(estaCad);
      }

      for (let i = 0; i < cadenas.length; i++) {
          // let grafico = createGraphics(1200, height); //ACA SE APLICA HASTA DONDE SE DIBUJA
          let grafico = createGraphics(width, height);
          let estecam = new Caminante(cadenas[i], grosorEstablecido, grafico);
          caminantes.push(estecam);
      }

      estado = 1;
  }

  // Estado 1
  if (estado === 1) {
      if (haySonido) {
        if (caminanteActual >= caminantes.length) {
          caminanteActual = 0; // Reinicia el índice
      }
          if (caminanteActual < caminantes.length) {
              let caminante = caminantes[caminanteActual];
              caminante.dibujar();
              caminante.avanzar();

              if (caminante.termino) {
                  caminanteActual++;
              }
          }
      } else {
          if (caminanteActual < caminantes.length) {
              let caminante = caminantes[caminanteActual];
              if (!caminante.termino) {
                  caminante.reiniciar();
              }
          }
      }
      verificarCaminantes(); 
      for (let i = 0; i < caminantes.length; i++) {
          let caminante = caminantes[i];
          if (!caminante.oculto) { // Solo dibuja caminantes visibles
          // Aplica la opacidad específica de cada caminante usando el color
          // let camColor = color(hue(caminante.color), saturation(caminante.color), brightness(caminante.color), caminante.opacidad); //SE VEN LOS CIRCULITOS
          let camColor = color(hue(caminante.color), saturation(caminante.color), brightness(caminante.color));
          tint(camColor); // Aplica tint con la opacidad
          image(caminante.grafico, 0, 0);
          }
      }

      if (label == "Chasquido" && !chasquidoEjecutandose) {
          chasquidoEjecutandose = true;
          eliminarUno();
      }
      if (label != "Chasquido") {
          chasquidoEjecutandose = false;
      }
  }

  antesHabiaSonido = haySonido;

  if (monitorear) {
      gestorAmp.dibujar(100, 100);
      gestorPitch.dibujar(100, 300);
  }
}

// ////////ESTA FUNCION LE BAJA LA OPACIDAD A LOS CAMINANTES 
//   function eliminarUno() {
//     // Verifica si hay caminantes disponibles
//     if (caminantes.length > 0) {
//         // Encuentra el siguiente caminante que tiene opacidad completa (255)
//         for (let i = 0; i < caminantes.length; i++) {
//             if (caminantes[i].opacidad === 0.9) {
//                 // Cambia la opacidad al 50%
//                 caminantes[i].opacidad = 0.1; // 50% de 255
//                 break; // Salimos del bucle después de modificar la opacidad de un caminante
//             }
//         }
//     }


///////////ELIMINA A UN CAMINANTE   //////////////esto esta para cuando esta la funcion caminanteColor, el codigo de abajo es para cuanddo no esyta eso
function eliminarUno() {
  // Verifica si hay caminantes disponibles
  if (caminantes.length > 0) {
      // Encuentra el siguiente caminante con opacidad completa (0.9)
      for (let i = 0; i < caminantes.length; i++) {
          if (caminantes[i].opacidad === 1 && !caminantes[i].oculto) {
            // if (caminantes[i].opacidad === 0.9 && !caminantes[i].oculto) { //SE VEN LOS CIRCULITOS
              // Oculta al caminante
              caminantes[i].oculto = true;
              console.log(`Caminante ${i} oculto.`);
              break; // Salimos del bucle después de ocultar un caminante
          }
      }
  }


    // Crear un nuevo caminante
    let nuevaCadena = new Cadena();
    nuevaCadena.click(random(-100, width + 10), random(-100, height + 10));
    nuevaCadena.fin();
    nuevaCadena.grosor = grosorEstablecido;
    cadenas.push(nuevaCadena);

    let grafico = createGraphics(width, height);  //ACA TAMBIEN CAMBIA ALTURA Y ANCHO DE LAS LINEAS
  let nuevoCaminante = new Caminante(nuevaCadena, grosorEstablecido, grafico);
  //nuevoCaminante.caminanteColor(random()); // Pasa un número aleatorio entre 0 y 1
  nuevoCaminante.caminanteColor(FREC); // Pasa un número aleatorio entre 0 y 1
  caminantes.push(nuevoCaminante);
  console.log('Nuevo caminante creado. Total caminantes:', caminantes.length);

}




function verificarCaminantes() {
  // Contar los caminantes visibles
  let caminantesVisibles = caminantes.filter(caminante => !caminante.oculto);

  // Si no hay caminantes visibles ni ocultos, crear nuevos
  if (caminantesVisibles.length === 0 && caminantes.length === 0) {
      for (let i = 0; i < cantidadCadenas; i++) {
          let nuevaCadena = new Cadena();
          nuevaCadena.click(random(-100, width + 10), random(-100, height + 10));
          nuevaCadena.fin();
          nuevaCadena.grosor = grosorEstablecido;

          let grafico = createGraphics(width, height);
          let nuevoCaminante = new Caminante(nuevaCadena, grosorEstablecido, grafico);
           //nuevoCaminante.caminanteColor(random()); // Generar un color aleatorio
           nuevoCaminante.caminanteColor(FREC); // Generar un color aleatorio
          caminantes.push(nuevoCaminante);
      }
      console.log("Se han creado nuevos caminantes.");
  }

  // Si hay menos de 6 caminantes visibles, reactivar los ocultos
  if (caminantesVisibles.length < 15) { /////////////ACA CAMBIAR CANTIDAD DE CAMINANTES
      for (let i = 0; i < caminantes.length; i++) {
          if (caminantes[i].oculto) {
              caminantes[i].oculto = false; // Reactiva al caminante
              console.log(`Caminante ${i} reactivado.`);
              break; // Reactiva un caminante por iteración
          }
      }
  }
}


  //DETECCION DE FRECUENCIA
  function startPitch() {
    pitch = ml5.pitchDetection(pitchModel, audioContext , mic.stream, modelLoaded);
  }
  
  function modelLoaded() {
    getPitch();
  }
  
  function getPitch() {
    pitch.getPitch(function(err, frequency) {
      if (frequency) {
        gestorPitch.actualizar(frequency);
        frec = gestorPitch.filtrada;
      } else {
      }
      getPitch();
    })
  }

  //CLASIFICADOR

  function gotResult(error, results) {
    // Display error in the console
    if (error) {
      console.error(error);
    }
    // The results are in an array ordered by confidence.
    console.log(results);
    label = results[0].label;
    //console.log(label);
    
  }

  // Reinicia el sistema
function reiniciarSistema() {
  estado = 0;
  cadenas = [];
  caminantes = [];
  caminanteActual = 0;
  console.log("Sistema reiniciado por inactividad.");
}

// Reinicia el temporizador de inactividad
function reiniciarInactividad() {
  if (inactividadTimeout) {
      clearTimeout(inactividadTimeout);
  }
  inactividadTimeout = setTimeout(reiniciarSistema, 7000); // 20 segundos ACÁ TIEMPO EN EL QUE SE TIENE QUE REINICIAR
}

  function mousePressed() {
    eliminarUno();
  }


  function windowResized() {  /////////////////ACÁ DELIMITAR EL TAMAÑO DE LA PANTALLA 
    resizeCanvas(windowWidth, windowHeight); // Ajusta el canvas al tamaño actual de la ventana

    // Recalcula los gráficos de cada caminante
  caminantes.forEach(caminante => {
    caminante.grafico = createGraphics(windowWidth, windowHeight);   /////////////////ACÁ DELIMITAR EL TAMAÑO DE LA PANTALLA
  });
  }
  
  // function keyPressed() {
  //   if (key === 'f' || key === 'F') { // Presiona 'F' para pantalla completa
  //     let fs = fullscreen();
  //     fullscreen(!fs); // Alterna entre pantalla completa y normal
  //   }
  // }

////////////////// F PARA VER EN FULLSCREEN Y R PARA REFRESCAR LA PAGINA SIN QUE SE SALGA DE FULLSCREEN
  function keyPressed() {
    if (key === 'r' || key === 'R') { // Presiona 'R' para refrescar
      // Guardar estado de fullscreen antes del reload
      localStorage.setItem('fullscreen', fullscreen());
      location.reload(); // Refrescar la página
    }
  
    if (key === 'f' || key === 'F') { // Alternar fullscreen con 'F'
      let fs = fullscreen();
      fullscreen(!fs);
      // Opcional: Guardar estado actual en localStorage
      localStorage.setItem('fullscreen', !fs);
    }
  }

  function mousePressed() {
  userStartAudio();
}
