class Triangle {
    constructor(context, x1, y1, x2, y2, x3, y3, mass) {
        this.context = context;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.x3 = x3;
        this.y3 = y3;
        this.mass = mass;

        this.isColliding = false;
    }

    draw() {
        //Draw a simple square
        this.context.fillStyle = this.isColliding ? "#ff8080" : "#0099b0";
        this.context.beginPath();
        this.context.moveTo(this.x1, this.y1);
        this.context.lineTo(this.x2, this.y2);
        this.context.lineTo(this.x3, this.y3);
        this.context.fill();
    }
}
