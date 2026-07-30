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

window.addEventListener('resize', () => {
    let objectMenus = document.getElementsByClassName('objectMenu');
    let objectContainer = document.getElementById('objectCreation');

})

// Validation functions





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
        this.ID = objectArray.filter(item => item !== undefined && item !== null).length + 1; // Returns the no. items in the array that are not null/undefined
        objectArray.push(this);

        this.name = `Object ${this.ID}`;

        // Add HTML to object list container
        let objectListContainer = document.getElementById('objectListContainer');
        let newObjectDiv = document.createElement('div');
        objectListContainer.appendChild(newObjectDiv);
        newObjectDiv.innerHTML = `
        
    <div id="object${this.ID}Container" style="width: 100%; height: 20%;">
    
                <div id="object${this.ID}Menu" class="objectMenu">

                    <div id="object${this.ID}MenuTitle" class="objectMenuTitle">

                        <!-- Title div below -->
                        <div style="
                            height: 100%;
                            display: grid;
                            align-items: center;
                            justify-items: start; 
                            padding-left: 20%;
                        ">
                            <p id="object${this.ID}Title" style="margin: 0;">${this.name}</p>
                        </div>
                    </div>

                    <div id="object${this.ID}MenuBody" class="objectMenuBody">

                        <div style="width: calc(100% / 3);  background-color: bisque;">
                            
                            <button id="editObject${this.ID}" onclick="" class="objectPropertyButton">

                            <span class="material-symbols-outlined">edit</span>
                            </button>
                        </div>

                        <div style="width: calc(100% / 3);">
                            
                            <button id="copyObject${this.ID}" onclick="" class="objectPropertyButton">
                            <span class="material-symbols-outlined">content_paste</span>
                            </button>

                        </div>

                        <div style="width: calc(100% / 3);">
                            
                            <button id="deleteObject${this.ID}" onclick="" class="objectPropertyButton">
                            <span class="material-symbols-outlined">delete</span>
                            </button>

                        </div>
                    </div>
            </div>
            `;


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
