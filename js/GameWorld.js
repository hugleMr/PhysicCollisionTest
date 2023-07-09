// Define the edges of the canvas
const canvasWidth = 750;
const canvasHeight = 400;

// Set a restitution, a lower value will lose more energy when colliding
const restitution = 0.8;

class GameWorld {
    constructor(canvasId) {
        this.canvas = null;
        this.context = null;
        this.secondsPassed = 0;
        this.oldTimeStamp = 0;
        this.gameObjects = [];
        this.lines = [];
        this.resetCounter = 0;
        this.init(canvasId);
    }

    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext("2d");

        this.createWorld();

        // Request an animation frame for the first time
        // The gameLoop() function will be called as a callback of this request
        window.requestAnimationFrame((timeStamp) => {
            this.gameLoop(timeStamp);
        });
    }

    createWorld() {
        this.context.beginPath();
        this.gameObjects = [
            new Circle(this.context, 150, 50, 0, 50, 1),
            // new Circle(this.context, 250, 300, 0, -50, 1),
            // new Circle(this.context, 200, 0, 50, 50, 1),
            // new Circle(this.context, 250, 150, 50, 50, 1),
            // new Circle(this.context, 300, 75, -50, 50, 1),
            // new Circle(this.context, 300, 300, 50, -50, 1),
            // new Circle(this.context, 150, 50, 0, 50, 1),
            // new Circle(this.context, 150, 200, 0, -50, 1),
            // new Circle(this.context, 100, 0, 50, 50, 1),
            // new Circle(this.context, 150, 250, 50, 50, 1),
            // new Circle(this.context, 200, 175, -50, 50, 1),
            // new Circle(this.context, 200, 100, 50, -50, 1),
        ];

        this.lines = [new Line(this.context, 100, 350, 250, 320, 1)];
    }

    gameLoop(timeStamp) {
        // Calculate how much time has passed
        this.secondsPassed = (timeStamp - this.oldTimeStamp) / 1000;
        this.oldTimeStamp = timeStamp;

        // Loop over all game objects to update
        for (let i = 0; i < this.gameObjects.length; i++) {
            this.gameObjects[i].update(this.secondsPassed);
        }

        this.detectCollisions();
        this.detectEdgeCollisions();

        this.clearCanvas();

        // Loop over all game objects to draw
        for (let i = 0; i < this.gameObjects.length; i++) {
            this.gameObjects[i].draw();
        }

        //Loop over all game objects to draw
        for (let i = 0; i < this.lines.length; i++) {
            this.lines[i].draw();
        }

        // The loop function has reached it's end
        // Keep requesting new frames
        window.requestAnimationFrame((timeStamp) => this.gameLoop(timeStamp));
    }

    detectCollisions() {
        for (let i = 0; i < this.gameObjects.length; i++) {
            this.gameObjects[i].isColliding = false;
        }

        for (let i = 0; i < this.gameObjects.length; i++) {
            let obj1 = this.gameObjects[i];
            for (let line of this.lines) {
                let isCollide = this.circleLineIntersect(obj1, line);
                if (isCollide) {
                    obj1.isColliding = true;
                    // // Calculate the angle (vy before vx)
                    // let radians = Math.atan2(obj1.vy, obj1.vx);

                    // Convert to degrees
                    // obj1.vx = obj1.vx * Math.sin(radians);
                    // obj1.vy = obj1.vy * Math.cos(radians);
                }
            }
            for (let j = i + 1; j < this.gameObjects.length; j++) {
                let obj2 = this.gameObjects[j];

                if (
                    this.circleIntersect(
                        obj1.x,
                        obj1.y,
                        obj1.radius,
                        obj2.x,
                        obj2.y,
                        obj2.radius
                    )
                ) {
                    obj1.isColliding = true;
                    obj2.isColliding = true;

                    let vCollision = { x: obj2.x - obj1.x, y: obj2.y - obj1.y };
                    let distance = Math.sqrt(
                        (obj2.x - obj1.x) * (obj2.x - obj1.x) +
                            (obj2.y - obj1.y) * (obj2.y - obj1.y)
                    );
                    let vCollisionNorm = {
                        x: vCollision.x / distance,
                        y: vCollision.y / distance,
                    };
                    let vRelativeVelocity = {
                        x: obj1.vx - obj2.vx,
                        y: obj1.vy - obj2.vy,
                    };
                    let speed =
                        vRelativeVelocity.x * vCollisionNorm.x +
                        vRelativeVelocity.y * vCollisionNorm.y;

                    // Apply restitution to the speed
                    speed *= Math.min(obj1.restitution, obj2.restitution);

                    if (speed < 0) {
                        break;
                    }

                    let impulse = (2 * speed) / (obj1.mass + obj2.mass);
                    obj1.vx -= impulse * obj2.mass * vCollisionNorm.x;
                    obj1.vy -= impulse * obj2.mass * vCollisionNorm.y;
                    obj2.vx += impulse * obj1.mass * vCollisionNorm.x;
                    obj2.vy += impulse * obj1.mass * vCollisionNorm.y;
                }
            }
        }
    }

    rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
        // Check x and y for overlap
        if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2) {
            return false;
        }

        return true;
    }

    circleIntersect(x1, y1, r1, x2, y2, r2) {
        // Calculate the distance between the two circles
        let squareDistance = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);

        // When the distance is smaller or equal to the sum
        // of the two radius, the circles touch or overlap
        return squareDistance <= (r1 + r2) * (r1 + r2);
    }

    circleLineIntersect(circle, line) {
        let centrex = circle.x;
        let centrey = circle.y;
        let radius = circle.radius;
        let circleAngle = Math.atan2(circle.vy, circle.vx);
        let v1x = line.x1;
        let v1y = line.y1;
        let v2x = line.x2;
        let v2y = line.y2;

        let c1x = centrex - v1x;
        let c1y = centrey - v1y;

        let radiusSqr = radius * radius;
        let c1sqr = c1x * c1x + c1y * c1y - radiusSqr;

        //Circle centre within triangle
        //Calculate edges
        let e1x = v2x - v1x;
        let e1y = v2y - v1y;

        //Circle intersects edge
        //first edge
        let k = c1x * e1x + c1y * e1y;

        if (k > 0) {
            let len = e1x * e1x + e1y * e1y; // squared len

            if (k < len) {
                if (c1sqr * len <= k * k) {
                    let radians = Math.atan2(e1y, e1x);
                    let newAngle = Math.PI - circleAngle - radians;
                    circle.vx = circle.vx * Math.cos(circleAngle);
                    circle.vy = -1 * circle.vy * Math.sin(circleAngle);
                    console.log("111");
                    return true;
                }
            }
        }

        // We're done, no intersection
        return false;
    }

    circleTriangleIntersect(circle, triangle) {
        let centrex = circle.x;
        let centrey = circle.y;
        let radius = circle.radius;
        let v1x = triangle.x1;
        let v1y = triangle.y1;
        let v2x = triangle.x2;
        let v2y = triangle.y2;
        let v3x = triangle.x3;
        let v3y = triangle.y3;

        let c1x = centrex - v1x;
        let c1y = centrey - v1y;

        let radiusSqr = radius * radius;
        let c1sqr = c1x * c1x + c1y * c1y - radiusSqr;

        // if (c1sqr <= 0) return true;

        let c2x = centrex - v2x;
        let c2y = centrey - v2y;
        let c2sqr = c2x * c2x + c2y * c2y - radiusSqr;

        // if (c2sqr <= 0) return true;

        let c3x = centrex - v3x;
        let c3y = centrey - v3y;

        let c3sqr = radiusSqr; //reference to radiusSqr
        c3sqr = c3x * c3x + c3y * c3y - radiusSqr;

        // if (c3sqr <= 0) return true;

        //Circle centre within triangle
        //Calculate edges
        let e1x = v2x - v1x;
        let e1y = v2y - v1y;

        let e2x = v3x - v2x;
        let e2y = v3y - v2y;

        let e3x = v1x - v3x;
        let e3y = v1y - v3y;

        // if (
        //     e1y * c1x - e1x * c1y >= 0 &&
        //     e2y * c2x - e2x * c2y >= 0 &&
        //     e3y * c3x - e3x * c3y >= 0
        // )
        //     return true;

        //Circle intersects edge
        //first edge
        let k = c1x * e1x + c1y * e1y;

        if (k > 0) {
            let len = e1x * e1x + e1y * e1y; // squared len

            if (k < len) {
                if (c1sqr * len <= k * k) {
                    let radians = Math.atan2(e1y - c1y, e1x - c1x);
                    circle.vx = circle.vx * Math.sin(radians);
                    circle.vy = circle.vy * Math.cos(radians);
                    console.log("111");
                    return true;
                }
            }
        }

        // Second edge
        k = c2x * e2x + c2y * e2y;

        if (k > 0) {
            let len = e2x * e2x + e2y * e2y;

            if (k < len) {
                if (c2sqr * len <= k * k) {
                    let radians = Math.PI - Math.atan2(e2y, e2x);
                    circle.vx = circle.vx * Math.sin(radians);
                    circle.vy = circle.vy * Math.cos(radians);
                    console.log("222");
                    return true;
                }
            }
        }

        // Third edge
        k = c3x * e3x + c3y * e3y;

        if (k > 0) {
            let len = e3x * e3x + e3y * e3y;

            if (k < len) {
                if (c3sqr * len <= k * k) {
                    let radians = Math.atan2(e3y - c3y, e3x - c3x);
                    circle.vx = circle.vx * Math.sin(radians);
                    circle.vy = circle.vy * Math.sin(radians);
                    console.log("333");
                    return true;
                }
            }
        }

        // We're done, no intersection
        return false;
    }

    detectEdgeCollisions() {
        let obj;
        for (let i = 0; i < this.gameObjects.length; i++) {
            obj = this.gameObjects[i];

            // Check for left and right
            if (obj.x < obj.radius) {
                obj.vx = Math.abs(obj.vx) * restitution;
                obj.x = obj.radius;
            } else if (obj.x > canvasWidth - obj.radius) {
                obj.vx = -Math.abs(obj.vx) * restitution;
                obj.x = canvasWidth - obj.radius;
            }

            // Check for bottom and top
            if (obj.y < obj.radius) {
                obj.vy = Math.abs(obj.vy) * restitution;
                obj.y = obj.radius;
            } else if (obj.y > canvasHeight - obj.radius) {
                obj.vy = -Math.abs(obj.vy) * restitution;
                obj.y = canvasHeight - obj.radius;
            }
        }
    }

    clearCanvas() {
        // Clear the canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
