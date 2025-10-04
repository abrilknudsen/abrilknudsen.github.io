class Caminante {

    constructor(cadena_, grosor, grafico) {
        this.cadena = cadena_;
        this.grosor = grosor;
        this.grafico = grafico;
        this.cantidadPasos = 30; ////MENOS PASOS MÁS RAPIDO, MÁS PASOS MÁS LENTO
        this.paso = 0;
        this.contTramo = 0;
        this.anteX = -1;
        this.anteY = -1;
        // this.opacidad = 0.9;  //se ven los circulitos 
        this.opacidad = 1;
        this.color = color(random(1, 360), random(40, 70), random(60, 85), this.opacidad);
        //this.color = this.asignarColorAleatorio(); // Asigna un color al azar
        this.termino = false;
    }


    avanzar() {
        this.paso++;
        if(this.paso > this.cantidadPasos){
            this.paso = 0;
            this.contTramo++;
        }
        this.caminanteTermino();
    }

    reiniciar() {
        if(this.paso > 0) {
            this.grafico.clear();
        }

        this.paso = 0;
        this.contTramo = 0;
        this.anteX = 0;
        this.anteY = 0;
        this.termino = false;
    }

    dibujar() { 
        if(this.contTramo < this.cadena.lista.length) {
            let c = this.cadena.lista[this.contTramo];
            let pos = map(this.paso, 0, this.cantidadPasos, 0.0, 1, 0);

            let esteX = bezierPoint(c.x1_, c.x2_, c.x3_, c.x4_, pos);
            let esteY = bezierPoint(c.y1_, c.y2_, c.y3_, c.y4_, pos);

            if(this.anteX != -1){
                this.grafico.strokeWeight(this.grosor);
                this.grafico.stroke(this.color);
                this.grafico.line(this.anteX, this.anteY, esteX, esteY);
            }

            this.anteX = esteX;
            this.anteY = esteY;
        }
    }

    caminanteTermino() {
        if(this.contTramo >= this.cadena.lista.length) {
            this.contTramo = this.cadena.lista.length - 1;
            this.paso = this.cantidadPasos;
            this.termino = true;
        }
    }

    // caminanteColor(numero) {
    //     if (numero > 0.5) { // Cambia a 0.5 para hacer la decisión
    //         let hue = random(0, 150); // Color cálido
    //         let saturation = random (50, 60);
    //         let brightness = random(70, 80);
    //         this.color = color(hue, saturation, brightness, this.opacidad);
    //         console.log("Color cálido");
    //     } else {
    //         this.color = color(random(151, 360), random(50, 60), random(70, 80), this.opacidad); // Color frío
    //         console.log("Color frío");
    //     }
    // }
    

    caminanteColor(frecuencia) {
        let hue, saturation, brightness;

        // Rango de frecuencia conocido (ajusta según tu caso)
    const frecuenciaMin = 20;  // Frecuencia mínima (baja)
    const frecuenciaMax = 2000; // Frecuencia máxima (alta)

    // Normalizar frecuencia a un rango entre 0 y 1
    let frecuenciaNormalizada = map(frecuencia, frecuenciaMin, frecuenciaMax, 0, 1);

        
        //if (numero > 0.5) { // Decisión para colores cálidos
         if (frecuenciaNormalizada > 0.5) { // Decisión para colores cálidos
            hue = random(0, 180); // Cubre colores cálidos (rojo a amarillo-verdoso)
            console.log("Color cálido");
        } else {
            hue = random(180, 360); // Cubre colores fríos (verde-azulado a rojo-violeta)
            console.log("Color frío");
        }
    
        // Saturación y brillo en rangos moderados para evitar tonos neón u opacos
        saturation = random(40, 70); // Moderada saturación, evita tonos muy apagados o brillantes
        brightness = random(60, 85); // Suficiente brillo para evitar colores muy oscuros o deslumbrantes
    
        // Asigna el color al caminante
        this.color = color(hue, saturation, brightness, this.opacidad);
    }
    


}
