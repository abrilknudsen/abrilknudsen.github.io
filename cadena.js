class Cadena {

    constructor() {
        this.lista = [];
        this.x = -30;
        this.y = random(0, height);
        this.radio = 800;
        this.estado = "primero";
        this.grosor = 30;
    }

    click(x_, y_){
        if (this.estado === "espera") {
            this.x = x_;
            this.y = y_;
            this.estado = "primero";
        } else if (this.estado === "primero") {
            let curva = new Curva(this.x, this.y, x_, y_, this.radio);
            this.lista.push(curva);
            this.estado = "siguientes";
            this.x = x_;
            this.y = y_;
        } else if (this.estado === "siguientes") {
            let ultimo = this.lista[this.lista.length - 1];
            let curva = new Curva(this.x, this.y, x_, y_, this.radio);
            curva.setAngulo1(ultimo.angulo2 + PI);
            this.lista.push(curva);
            this.x = x_;
            this.y = y_;
        } 
    }

    fin() {
        if(this.lista.length > 0){
            let ultimo = this.lista[this.lista.length - 1]
            let curva = new Curva(this.x, this.y, width + 100, random(0, height - 100), this.radio);
            curva.setAngulo1(ultimo.angulo2 + PI);
            this.lista.push(curva);
        }
    }
}