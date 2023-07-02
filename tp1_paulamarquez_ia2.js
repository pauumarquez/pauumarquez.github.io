//Version final, entrega 3 de julio - Paula Marquez - IA2- UNA - 2023 - TP1

let formas = [];
let tamano = 15;
let margen = 2;
let numFilas, numColumnas;
let miImagenActual, miImagenSiguiente;
let matrizColoresActual = [];
let matrizColoresSiguiente = [];
let imagenCargadaActual = false;
let imagenCargadaSiguiente = false;

let imagenActual = 0;
let images = [
  "assets/gradient1.jpg",
  "assets/gradient2.jpg",
  "assets/gradient3.jpg",
  "assets/gradient4.jpg"
];

let transicion = false;
let transicionProgreso = 0;
let transicionVelocidad = 0.007;

let mic;
let fft;

let haySonido = false;

function preload() {
  // Cargar la imagen actual
  miImagenActual = loadImage(images[imagenActual], () => {
    imagenCargadaActual = true;
    imagenActual++;
  });

  // Cargar la siguiente imagen
  miImagenSiguiente = loadImage(images[imagenActual], () => {
    imagenCargadaSiguiente = true;
  });
}

function setup() {
  createCanvas(600, 600);
  mic = new p5.AudioIn();
  mic.start(); 
 // Inicializa el objeto FFT
 fft = new p5.FFT();
 fft.setInput(mic);
 

  // Verificar que las imágenes se hayan cargado antes de continuar
  if (!imagenCargadaActual || !imagenCargadaSiguiente) {
    return;
  }

  // Calcular el número de filas y columnas
  numFilas = floor((height - margen) / (tamano + margen));
  numColumnas = floor((width - margen) / (tamano + margen));

  // Crear matrices de colores para la imagen actual y siguiente
  miImagenActual.loadPixels();
  for (let y = 0; y < miImagenActual.height; y++) {
    let fila = [];
    for (let x = 0; x < miImagenActual.width; x++) {
      let indice = (x + y * miImagenActual.width) * 4;
      let r = miImagenActual.pixels[indice];
      let g = miImagenActual.pixels[indice + 1];
      let b = miImagenActual.pixels[indice + 2];
      let a = miImagenActual.pixels[indice + 3];
      fila.push(color(r, g, b, a));
    }
    matrizColoresActual.push(fila);
  }

  miImagenSiguiente.loadPixels();
  for (let y = 0; y < miImagenSiguiente.height; y++) {
    let fila = [];
    for (let x = 0; x < miImagenSiguiente.width; x++) {
      let indice = (x + y * miImagenSiguiente.width) * 4;
      let r = miImagenSiguiente.pixels[indice];
      let g = miImagenSiguiente.pixels[indice + 1];
      let b = miImagenSiguiente.pixels[indice + 2];
      let a = miImagenSiguiente.pixels[indice + 3];
      fila.push(color(r, g, b, a));
    }
    matrizColoresSiguiente.push(fila);
  }

  // Crear formas
  for (let fila = 0; fila < numFilas; fila++) {
    for (let columna = 0; columna < numColumnas; columna++) {
      let forma = {
        x: columna * (tamano + margen) + margen,
        y: fila * (tamano + margen) + margen,
        tamano: tamano,
        tipoAnterior: random(["cuadrado", "circulo"]),
        tipoActual: "",
        colorActual: null,
        colorSiguiente: null,
      };
      formas.push(forma);
    }
  }

  // Asignar colores y tipos a las formas
  for (let i = 0; i < formas.length; i++) {
    let forma = formas[i];
    let x = floor(
      map(forma.x + forma.tamano / 2, 0, width, 0, miImagenActual.width)
    );
    let y = floor(
      map(forma.y + forma.tamano / 2, 0, height, 0, miImagenActual.height)
    );
    forma.colorActual = matrizColoresActual[y][x];
    forma.colorSiguiente = matrizColoresSiguiente[y][x];
    if (forma.tipoAnterior === "cuadrado") {
      forma.tipoActual = "circulo";
    } else {
      forma.tipoActual = "cuadrado";
    } 
  } 

}

function draw() {
  verificarSonido();
  
  // Dibujar formas
  noStroke();
  for (let i = 0; i < formas.length; i++) {
    let forma = formas[i];
    let colorActual = forma.colorActual;
    let colorSiguiente = forma.colorSiguiente;
    let colorInterpolado = lerpColor(
      colorActual,
      colorSiguiente,
      transicionProgreso
    );
    colorInterpolado.setAlpha(10); // Ajustar la opacidad aquí
    fill(colorInterpolado);
    if (forma.tipoActual === "cuadrado") {
      rect(forma.x, forma.y, forma.tamano, forma.tamano);
    } else {
      ellipse(
        forma.x + forma.tamano / 2,
        forma.y + forma.tamano / 2,
        forma.tamano,
        forma.tamano
      );
    }  
  } 

 
  if (haySonido){
   
  if (transicion) {
    transicionProgreso += transicionVelocidad;
    if (transicionProgreso >= 1) {
      transicionProgreso = 0;
      cargarSiguienteImagen();
    }
  }
  determinarTipoSonido();
  ajustarTonos();
}
}



function verificarSonido() {
  let level = mic.getLevel(); // Asigno la captura de sonido a partir del nivel y eso dispara la transicion

  if (!transicion && level > 0.01) {
    transicion = true;
    haySonido = true;
  } else if (transicion && level < 0.01) {
    transicion = false;
  } 
}

  

function cargarSiguienteImagen() {
  if (imagenActual === images.length - 1) {
    imagenActual = 0;
  } else {
    imagenActual++;
  }
  miImagenActual = miImagenSiguiente;
  miImagenSiguiente = loadImage(images[imagenActual], () => {
    imagenCargadaSiguiente = true;
    matrizColoresActual = matrizColoresSiguiente;
    matrizColoresSiguiente = [];
    miImagenSiguiente.loadPixels();
    for (let y = 0; y < miImagenSiguiente.height; y++) {
      let fila = [];
      for (let x = 0; x < miImagenSiguiente.width; x++) {
        let indice = (x + y * miImagenSiguiente.width) * 4;
        let r = miImagenSiguiente.pixels[indice];
        let g = miImagenSiguiente.pixels[indice + 1];
        let b = miImagenSiguiente.pixels[indice + 2];
        let a = miImagenSiguiente.pixels[indice + 3];
        fila.push(color(r, g, b, a));
      }
      matrizColoresSiguiente.push(fila);
    }
    for (let i = 0; i < formas.length; i++) {
      let forma = formas[i];
      let x = floor(
        map(forma.x + forma.tamano / 2, 0, width, 0, miImagenSiguiente.width)
      );
      let y = floor(
        map(forma.y + forma.tamano / 2, 0, height, 0, miImagenSiguiente.height)
      );
      forma.colorActual = matrizColoresActual[y][x];
      forma.colorSiguiente = matrizColoresSiguiente[y][x];
    }
    transicion = false;
  });
}





function determinarTipoSonido() {
// Analiza el espectro de frecuencia del sonido del micrófono
let spectrum = fft.analyze();

// Encuentra la frecuencia dominante
let dominantFrequency = findDominantFrequency(spectrum);

// Comprueba si la frecuencia es grave o aguda
if (dominantFrequency < 500) {
  // El sonido es grave
  return 'grave';
} else {
  // El sonido es agudo
  return 'agudo';
}
}
// Función para encontrar la frecuencia dominante en el espectro
function findDominantFrequency(spectrum) {
  let maxAmplitude = -Infinity;
  let dominantIndex = -1;

  for (let i = 0; i < spectrum.length; i++) {
    let amplitude = spectrum[i];

    if (amplitude > maxAmplitude) {
      maxAmplitude = amplitude;
      dominantIndex = i;
    }
  }

  // Calcula la frecuencia correspondiente al índice dominante
  let dominantFrequency = map(dominantIndex, 0, spectrum.length, 0, sampleRate() / 2);

  return dominantFrequency;
}

function ajustarTonos() {
  // Verificar si el sonido detectado es grave
  let tipoSonido = determinarTipoSonido();
  let esSonidoGrave = tipoSonido === "grave";
  let esSonidoAgudo = tipoSonido === "agudo";

  // Recorrer todas las formas y ajustar los colores
  for (let i = 0; i < formas.length; i++) {
    let forma = formas[i];
    let colorActual = forma.colorActual;

    // Ajustar la componente de color rojo (R) para un tono más frío si es sonido agudo
    if (esSonidoAgudo) {
      let r = max(0, red(colorActual) - 1); // Disminuir la componente de color rojo
      let g = green(colorActual);
      let b = blue(colorActual);
      let a = alpha(colorActual);
      forma.colorActual = color(r, g, b, a);
    }

    // Aumentar la componente de color rojo (R) si es sonido grave
    if (esSonidoGrave) {
      let r = min(255, red(colorActual) + 1); // Aumentar la componente de color rojo
      let g = green(colorActual);
      let b = blue(colorActual);
      let a = alpha(colorActual);
      forma.colorActual = color(r, g, b, a);
    }
  }
}
