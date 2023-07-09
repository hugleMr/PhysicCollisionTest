const g = 999.81;
class Circle extends GameObject {
    constructor(context, x, y, vx, vy, mass) {
        super(context, x, y, vx, vy, mass);

        //Set default width and height
        this.radius = 15;
        this.restitution = 0.9;
    }

    draw() {
        //Draw a simple circle
        this.context.beginPath();
        this.context.fillStyle = this.isColliding ? "#ff8080" : "#0099b0";
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.context.fill();
    }

    update(secondsPassed) {
        // Apply acceleration
        this.vy += g * secondsPassed;

        //Move with set velocity
        this.x += this.vx * secondsPassed;
        this.y += this.vy * secondsPassed;

        // // Calculate the angle (vy before vx)
        // let radians = Math.atan2(this.vy, this.vx);

        // // Convert to degrees
        // let degrees = (180 * radians) / Math.PI;
    }

    changeAngle() {
        // Calculate the angle (vy before vx)
        let radians = Math.atan2(this.vy, this.vx);

        // Convert to degrees
        this.vx = obj1.vx * Math.cos(radians);
        this.vy = obj1.vy * Math.sin(radians);
    }
}
