console.log("simulation.js loaded successfully!");

// Global variables

const canvas = document.getElementById("canvas");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientWidth * 9 / 16; // 16:9 aspect ratio
console.log(canvas.width, canvas.height);

const ctx = canvas.getContext("2d");
ctx.fillStyle = "#ff0000";
let simulation = null;
let objectArray = Array(10);

let objectHTMLTemplate = // using ` in place of " or ' allows for multi-line strings
``;

// Event listeners

document.addEventListener('DOMContentLoaded', () => {
    let canvas = document.getElementById('canvas');
    let objectCreation = document.getElementById('objectCreation');
    let canvasContainer = document.getElementById('canvasContainer');
    console.log(canvasContainer.height, objectCreation.height);
    objectCreation.height = canvasContainer.height;
    console.log("done");
    console.log(canvasContainer.height, objectCreation.height);
})



class Projectile {
    
    constructor(x, y, Vx, Vy, Fx, Fy, mass) {

        // Physics properties
        this.x = x;
        this.y = y;
        this.Vx = Vx; 
        this.Vy = Vy; 
        this.Fx = Fx;
        this.Fy = Fy; 
        this.mass = mass; 
        this.ax = Number();
        this.ay = Number();
        
        // Geometrical properties 
        this.length = 100; 
        this.height = 100;      
        this.colour = '#ff0000';
        
        // Add to array
        this.ID = Number(objectArray.length) + 1;
        objectArray.push(this);

        this.name = `Object ${this.ID}`;

        // Add HTML to object list
        let objectListContainer = document.getElementById('objectListContainer');
        let newObjectDiv = document.createElement('div')
        objectListContainer.appendChild(newObjectDiv);
        newObjectDiv.innerHTML = `
        
        <div id="objectContainer" style="width: 100%;">
    
                <div id="objectMenu" style="
                    width: 100%; 
                    height: 80px; 
                    background-color: #fefefe;
                    display: grid;
                    grid-template-columns: auto;
                    grid-template-rows: 25px 50px;
                    outline: 1px solid #000000">

                    <div id="objectMenuTitle" style="
                        background-color: brown;
                        display: grid;
                        grid-template-columns: 125px 25px;
                        ">
                        <div style="
                            height: 25px;
                            display: grid;
                            align-items: center;
                            justify-items: start; 
                            padding-left: 5px;
                        ">
                            <p id="objectTitle" style="margin: 0;">Name</p>
                        </div>
                    </div>

                    <div id="objectMenuBody" style="
                        height: 100%;
                        display: flex;">

                        <div style="width: calc(100% / 3);">
                            
                            <button id="editObject" onclick="" style="
                                width: 80%;
                                height: 80%;
                                margin-left: 10%;
                                margin-top: 10%;
                                ">

                            <span class="material-symbols-outlined">edit</span>
                            </button>
                        </div>

                        <div style="width: calc(100% / 3);  height: 100%;">
                            
                            <button id="editObject" onclick="" style="
                                width: 80%;
                                height: 80%;
                                margin-left: 10%;
                                margin-top: 10%;
                                ">

                            <span class="material-symbols-outlined">content_paste</span>
                            </button>
                        </div>

                        <div style="width: calc(100% / 3); height: 100%;">
                            
                            <button id="editObject" onclick="" style="
                                width: 80%;
                                height: 80%;
                                margin-left: 10%;
                                margin-top: 10%;
                                ">

                            <span class="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    </div>
            </div>
            `;
            
            document.getElementById('objectTitle').innerHTML = this.name;

    }

    // Methods 

    updatePos(ctx, dt) { 

        console.log("function called");
        // physics
        this.ax = this.Fx / this.mass;
        this.Vx += this.ax * dt; 
        let dx = (this.Vx * dt) + (0.5 * this.ax * (dt ** 2));

        this.ay = -(this.Fy / this.mass);
        this.Vy += this.ay * dt; 
        let dy = (this.Vy * dt) + (0.5 * this.ay * (dt ** 2));

        // render 

        this.x += dx 
        this.y += dy 
        ctx.fillRect(this.x, this.y, this.length, this.height)
    }

    }





function clearCanvas(ctx, screenWidth, screenHeight) {
    ctx.clearRect(0, 0, screenWidth, screenHeight);
}

function stopSimulation(simulation) {
    clearInterval(simulation);
    clearCanvas(ctx, canvas.width, canvas.height);
    }   




     

// Main program

function runSimulation() {


    const dt = document.getElementById("dt").value; // Timestamp in s
    stopSimulation(simulation);

    // Get the values from the input fields
    let projectile = new Projectile(
        Number(document.getElementById("initialX").value),
        Number(document.getElementById("initialY").value),
        Number(document.getElementById("initialVx").value),
        - Number(document.getElementById("initialVy").value),
        Number(document.getElementById("FrX").value),
        - Number(document.getElementById("FrY").value),
        Number(document.getElementById("mass").value),
    )


    // Main loop, 10s limit will be used for now


    console.log(projectile);
    simulation = setInterval(() => {
        clearCanvas(ctx, canvas.width, canvas.height);
        projectile.updatePos(ctx, dt);
    }, dt * 1000);  

    }