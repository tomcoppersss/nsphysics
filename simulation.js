let simulation;

// Canvas initialisation 

let canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Taken from https://medium.com/@doomgoober/understanding-html-canvas-scaling-and-sizing-c04925d9a830. Used to fix canvas blurriness.

    const originalHeight = canvas.height;
    const originalWidth = canvas.width;
    render();

    function render() {
        let dimensions = getObjectFitSize(
            true,
            canvas.clientWidth,
            canvas.clientHeight,
            canvas.width,
            canvas.height
        );

        const dpr = window.devicePixelRatio || 1;
        canvas.width = dimensions.width * dpr;
        canvas.height = dimensions.height * dpr;

        let ratio = Math.min(canvas.clientWidth / originalWidth, canvas.clientHeight / originalHeight);

        ctx.scale(ratio * dpr, ratio * dpr); //adjust this!
        
    }

    // adapted from: https://www.npmjs.com/package/intrinsic-scale
    function getObjectFitSize(
        contains /* true = contain, false = cover */,
        containerWidth,
        containerHeight,
        width,
        height
    ) {
        let doRatio = width / height;
        let cRatio = containerWidth / containerHeight;
        let targetWidth = 0;
        let targetHeight = 0;
        let test = contains ? doRatio > cRatio : doRatio < cRatio;

        if (test) {
            targetWidth = containerWidth;
            targetHeight = targetWidth / doRatio;
        } else {
            targetHeight = containerHeight;
            targetWidth = targetHeight * doRatio;
        }

        return {
            width: targetWidth,
            height: targetHeight,
            x: (containerWidth - targetWidth) / 2,
            y: (containerHeight - targetHeight) / 2
        };
    }

// End of taken code snippet



function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}

function updateCanvas() {
    clearCanvas(ctx, canvas.clientWidth, canvas.clientHeight);
    objects.forEach((value, key) => {
        value.draw(ctx);
    })
}

function clearCanvas(ctx, screenWidth, screenHeight) {
    ctx.clearRect(0, 0, screenWidth, screenHeight);
}

function drawOutline(obj) {
    ctx.strokeStyle = '#d6cb00';
    ctx.strokeRect(obj.x - (obj.radius), obj.y - (obj.radius), (obj.radius*2) + 2, (obj.radius*2) + 2);
}


// Keys are stored as strings in the maps below

// Access objects/forces by their IDs
let objects = new Map();
let forces = new Map();


// Bidirectional hash map for that sweet O(1) lookup 🤑

// Access the forces by OBJECT, not object ID
let objectToForces = new Map();

// objects by FORCE (get it??)
let forceToObjects = new Map();




// Event listeners


window.addEventListener('resize', resizeCanvas());


document.getElementById('objectListContainer').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const obj = objects.get(btn.dataset.id);
    obj[btn.dataset.action]();
});


document.getElementById('newObjectButtonContainer').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    new Projectile(null);
});


document.getElementById('forceListContainer').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const force = forces.get(btn.dataset.id);
    force[btn.dataset.action]();
});

document.getElementById('newForceButtonContainer').addEventListener('click', e => {
    let btn = e.target.closest('button');
    if (!btn) return;
    new Force(null);
});


// Validation functions






class Projectile {
    
    static nextID = 0;

    constructor(projectileToCopy) { // projectileToCopy is not necessarily needed here

        // Add to object maps
        this.ID = String(++Projectile.nextID);
        objects.set(this.ID, this);
        objectToForces.set(this, []);

        this.name = `Object ${this.ID}`;

        if (!projectileToCopy) {

            // Physics properties
            this.x = Number();
            this.y = Number();
            this.Vx = Number();
            this.Vy = Number();
            this.mass = Number();
            this.ax = Number();
            this.ay = Number();
            this.affectedByGravity = Boolean()
            
            // Geometrical properties 
            this.radius = 50;      
            this.colour = '#ff0000';

            // Add HTML to object list container
            let objectListContainer = document.getElementById('objectListContainer');
            let newObjectDiv = document.createElement('div');
            newObjectDiv.style = `width: 100%; height: 20%;`;
            newObjectDiv.className = `objectMenu`;
            newObjectDiv.id = `object${this.ID}Menu`;
            objectListContainer.appendChild(newObjectDiv);
            newObjectDiv.innerHTML = `

                    <div style="background-color: #0F111A;">
                        <div class="title">
                            <p style="margin: 0;">${this.name}</p>
                        </div>
                    </div>
                    
                    <div style="
                        height: 100%;
                        display: flex;
                        background-color: #1E1F2B;">

                        <div style="width: calc(100% / 3);">
                            
                            <button data-action="edit" data-ID="${this.ID}" class="objectPropertyButton">

                            <span class="material-symbols-outlined">edit</span>
                            </button>
                        </div>

                        <div style="width: calc(100% / 3);">
                            
                            <button data-action="copy" data-ID="${this.ID}" class="objectPropertyButton">

                            <span class="material-symbols-outlined">content_paste</span>
                            </button>
                        </div>

                        <div style="width: calc(100% / 3);">
                            
                            <button data-action="delete" data-ID="${this.ID}" class="objectPropertyButton">

                            <span class="material-symbols-outlined">delete</span>
                            </button>
                        </div>

                            `;
        }
        
        else { // constructor for making an identical object from an existing one

            // Physics properties
            this.x = projectileToCopy.x;
            this.y = projectileToCopy.y;
            this.Vx = projectileToCopy.Vx;
            this.Vy = projectileToCopy.Vy;
            this.mass = projectileToCopy.mass;
            this.ax = projectileToCopy.ax;
            this.ay = projectileToCopy.ay;
            this.affectedByGravity = projectileToCopy.affectedByGravity;
            
            // Geometrical properties 
            this.radius = projectileToCopy.radius; 
            this.colour = projectileToCopy.colour;


            // Write HTML directly below current one

            let objectToCopyMenu = document.getElementById(`object${projectileToCopy.ID}Menu`);
            if (document.getElementById(`editObject${projectileToCopy.ID}`)) {
                objectToCopyMenu = document.getElementById(`editObject${projectileToCopy.ID}`)
            }; // prevents new menu from being written in between objectToCopyMenu and its respective edit menu (if the edit menu is open)

            let newObjectDiv = document.createElement('div');
            newObjectDiv.style = `width: 100%; height: 20%;`;
            newObjectDiv.className = `objectMenu`;
            newObjectDiv.id = `object${this.ID}Menu`;

            objectToCopyMenu.insertAdjacentElement("afterend", newObjectDiv);
            newObjectDiv.innerHTML = `
                <div style="background-color: #0F111A;">
                        <div class="title">
                            <p style="margin: 0;">${this.name}</p>
                        </div>
                    </div>
                    
                    <div style="
                        height: 100%;
                        display: flex;
                        background-color: #1E1F2B;">

                        <div style="width: calc(100% / 3);">
                            
                            <button data-action="edit" data-ID="${this.ID}" class="objectPropertyButton">

                            <span class="material-symbols-outlined">edit</span>
                            </button>
                        </div>

                        <div style="width: calc(100% / 3);">
                            
                            <button data-action="copy" data-ID="${this.ID}" class="objectPropertyButton">

                            <span class="material-symbols-outlined">content_paste</span>
                            </button>
                        </div>

                        <div style="width: calc(100% / 3);">
                            
                            <button data-action="delete" data-ID="${this.ID}" class="objectPropertyButton">

                            <span class="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                
                            `;

        }

        this.draw(ctx);

    }

    // Methods 


    // Physics methods: updating and drawing position.

    draw(ctx) {

        ctx.fillStyle = this.colour;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        
    }

    updatePos() { 

        // Physics

        // dt is 1/60s or ~16ms
        this.ax = this.Fx / this.mass;
        this.Vx += this.ax / 60; 
        let dx = (this.Vx / 60) + (0.5 * this.ax * (1/3600));

        this.ay = -(this.Fy / this.mass); // Canvas by default has (0, 0) in the top left corner so we have to flip the canvas (done in index.html) and any y-variables.
        if (this.affectedByGravity) {this.ay -= 9.81};
        this.Vy += this.ay / 60; 
        let dy = (this.Vy / 60) + (0.5 * this.ay * (1/3600));

        this.x += dx;
        this.y += dy;

    }


    isClicked(mouseX, mouseY) {

        const dx = mouseX - this.x;
        const dy = mouseY - this.y;

        return ((dx**2) + (dy**2) <= (this.radius**2));

    }


    // Used in HTML 


    saveChanges() {
        // Captures inputs from the edit menu and saves them

        document.getElementById(`object${this.ID}PropertyGrid`).querySelectorAll(`input, select`).forEach(element => {
            this[element.name] = element.value;
        });
        
        updateCanvas();
    }

    closeEditMenu() {
        document.getElementById(`editObject${this.ID}`).remove(); // gets the menu for this object and removes it
    }


    edit()  {

        // For when edit button on object menu is clicked 

        if (document.getElementById(`editObject${this.ID}`)) return; // prevents multiple edit menus for the same object

        // Write HTML
        let thisMenu = document.getElementById(`object${this.ID}Menu`);
        let thisEditMenu = document.createElement('div');
        thisEditMenu.id = `editObject${this.ID}`;
        thisEditMenu.style = `display: flex; flex-direction: column; height: 60%;`
        thisEditMenu.innerHTML = `

                    <div style="background-color: #0F111A; width: 100%; height: 10%;">
                        <div class="title">
                            <p style="margin: 0;">Edit object '${this.name}'</p>
                        </div>
                    </div>
                    
                    <div style="height: 80%; display: flex; flex-direction: column;">

                        <div id="object${this.ID}PropertyGrid" class="propertyGrid"; style="width: 90%; height: 100%; align-self: center; justify-self: center;">
                            <label for="editInitialX">X coordinate:</label>
                            <input type="number" id="editInitialX" name="x" value="${this.x}">

                            <label for="editInitialY">Y coordinate:</label>
                            <input type="number" id="editInitialY" name="y" value="${this.y}">

                            <label for="editInitialVx">Initial X velocity:</label>
                            <input type="number" id="editInitialVx" name="Vx" value="${this.Vx}">

                            <label for="editInitialVy">Initial Y velocity:</label>
                            <input type="number" id="editInitialVy" name="Vy" value="${this.Vy}">

                            <label for="editMass">Mass:</label>
                            <input type="number" id="editMass" name="mass" value="${this.mass}">

                            <label for="editAffectedByGravity">Gravity-affected: </label>
                            <select id="editAffectedByGravity" name="affectedByGravity" value="${this.affectedByGravity}">
                                <option>True</option>
                                <option>False</option>
                            </select>

                            <label for="editName">Object name:</label>
                            <input type="text" id="editName" name="name" value="${this.name}">
                            
                            <label for="editXLength">Object radius:</label>
                            <input type="number" id="editRadius" name="radius" value="${this.radius}">

                            <label for="editColour">Object colour: </label>
                            <input type="text" id="editColour" name="colour" value="${this.colour}">
                         </div>
                    </div>
            
                    <div style="height: 10%; display: grid; grid-template-columns: 50% 50%; background-color: #0F111A;">

            

                        <div style="display: flex; justify-content: center; align-items: center; margin: 0;">
                            <button type="button" data-action="saveChanges" data-id="${this.ID}" style="height: 80%; width: 80%;">
                                Save
                            </button>
                        </div>

                        <div style="display: flex; justify-content: center; align-items: center; margin: 0;">
                            <button type="button" data-action="closeEditMenu" data-id="${this.ID}" style="height: 80%; width: 80%;">
                                Close
                            </button>
                        </div>

                    </div>
        `;
        
        thisMenu.insertAdjacentElement(`afterend`, thisEditMenu);

        updateCanvas();
        

    }

    copy() {
        new Projectile(this);
    }
    
    delete() {

        // Delete HTML
        let menu = document.getElementById(`object${this.ID}Menu`);
        menu.remove();
        let editMenu = document.getElementById(`editObject${this.ID}`);
        if (editMenu) {
            editMenu.remove();
        }


        // Delete object from maps. It is then deleted as all references to it have been deleted.
        objects.delete(this.ID);

        const forces = objectToForces.get(this);
        if (forces) {
            for (const force of forces) {
                const objects = forceToObjects.get(force);
                if (objects) {
                    objects.delete(obj);
                    if (objects.size === 0) forceToObjects.delete(force);
                }
            }
        }

        objectToForces.delete(this);
        updateCanvas();

    }
    
}


class Force {

    static nextID = 0;

    constructor(forceToCopy) {

        // Add to object maps
        this.ID = String(++Force.nextID);
        forces.set(this.ID, this);
        forceToObjects.set(this, []);
        this.name = `Force ${this.ID}`;
        this.clickObject = (e) => this.addObjectToThisForce(e);
        this.cachedObjects = [];
        this.cachedDeletedObjects = [];

        if (!forceToCopy) {

            this.Fx = Number();
            this.Fy = Number();
            this.startTime = Number();
            this.endTime = Number();


            // Write HTML
            let forceListContainer = document.getElementById('forceListContainer');
            let newForceDiv = document.createElement('div');
            newForceDiv.style = `width: 100%; height: 20%;`;
            newForceDiv.className = `objectMenu`;
            newForceDiv.id = `force${this.ID}Menu`;
            forceListContainer.appendChild(newForceDiv);
            newForceDiv.innerHTML = `
                    <div style="background-color: #0F111A;">
                        <div class="title">
                            <p style="margin: 0;">${this.name}</p>
                        </div>
                    </div>
                    
                    <div style="
                        height: 100%;
                        display: flex;
                        background-color: #1E1F2B;">

                        <div style="width: calc(100% / 3);">
                            
                            <button data-action="edit" data-ID="${this.ID}" class="objectPropertyButton">

                            <span class="material-symbols-outlined">edit</span>
                            </button>
                        </div>

                        <div style="width: calc(100% / 3);">
                            
                            <button data-action="copy" data-ID="${this.ID}" class="objectPropertyButton">

                            <span class="material-symbols-outlined">content_paste</span>
                            </button>
                        </div>

                        <div style="width: calc(100% / 3);">
                            
                            <button data-action="delete" data-ID="${this.ID}" class="objectPropertyButton">

                            <span class="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    </div>
                    `;

        } else {
            this.Fx = forceToCopy.Fx;
            this.Fy = forceToCopy.Fy;
            this.startTime = forceToCopy.startTime;
            this.endTime = forceToCopy.endTime;
            this.ID = String(++Force.nextID);
            this.name = `Force ${this.ID} (copy of '${forceToCopy.name}')`;
            forces.set(this.ID, this);
            
            // Write HTML
            
            let forceToCopyMenu = document.getElementById(`force${forceToCopy.ID}Menu`);
            if (document.getElementById(`editObject${forceToCopy.ID}`)) {
                objectToCopyMenu = document.getElementById(`editObject${projectileToCopy.ID}`)
            }; // prevents new menu from being written in between forceToCopyMenu and its respective edit menu (if the edit menu is open)

            let newForceDiv = document.createElement('div');
            newForceDiv.style = `width: 100%; height: 20%;`;
            newForceDiv.className = `objectMenu`;
            newForceDiv.id = `force${this.ID}Menu`;
            forceToCopyMenu.insertAdjacentElement("afterend", newForceDiv);
            newForceDiv.innerHTML = `
            

                    <div style="background-color: #0F111A;">
                        <div class="title">
                            <p style="margin: 0;">${this.name}</p>
                        </div>
                    </div>
                    
                    <div style="
                        height: 100%;
                        display: flex;
                        background-color: #1E1F2B;">

                        <div style="width: calc(100% / 3);">
                            
                            <button data-action="edit" data-ID="${this.ID}" class="objectPropertyButton">

                            <span class="material-symbols-outlined">edit</span>
                            </button>
                        </div>

                        <div style="width: calc(100% / 3);">
                            
                            <button data-action="copy" data-ID="${this.ID}" class="objectPropertyButton">

                            <span class="material-symbols-outlined">content_paste</span>
                            </button>
                        </div>

                        <div style="width: calc(100% / 3);">
                            
                            <button data-action="delete" data-ID="${this.ID}" class="objectPropertyButton">

                            <span class="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    </div>
                    `;

            }

        }
    

    saveChanges() {
        // Captures inputs from the edit menu and saves them

        document.getElementById(`force${this.ID}PropertyGrid`).querySelectorAll(`input, select`).forEach(element => {
            this[element.name] = element.value;

    })}

    closeEditMenu() {
        document.getElementById(`editForce${this.ID}`).remove(); // gets the menu for this object and removes it
    }

    edit() {

        if (document.getElementById(`editForce${this.ID}`)) return; // prevents multiple edit menus for the same object

        // Write HTML
        let thisMenu = document.getElementById(`force${this.ID}Menu`);
        let thisEditMenu = document.createElement('div');

        thisEditMenu.id = `editForce${this.ID}`;
        thisEditMenu.style = `display: flex; flex-direction: column; height: 60%;`
        thisEditMenu.innerHTML = `

                    <div style="background-color: #0F111A; width: 100%; height: 10%;">
                        <div class="title">
                            <p style="margin: 0;">Edit force '${this.name}'</p>
                        </div>
                    </div>
                    
                    <div style="height: 80%; display: flex; flex-direction: column;">

                        <div id="force${this.ID}PropertyGrid" class="propertyGrid"; style="width: 90%; height: 100%; align-self: center; justify-self: center;">
                            <label>Force X:</label>
                            <input type="number" name="Fx" value="${this.Fx}">

                            <label>Force Y:</label>
                            <input type="number" name="Fy" value="${this.Fy}">

                            <label>Start time:</label>
                            <input type="number" name="startTime" value="${this.startTime}">

                            <label>End time:</label>
                            <input type="number" name="endTime" value="${this.endTime}">

                            <label>Name:</label>
                            <input type="text" name="name" value="${this.name}">

                            <label>Select objects:</label>
                            <button type="button" data-ID="${this.ID}" data-action="addAffectedObjects">Click</button>
                         </div>
                    </div>
            
                    <div style="height: 10%; display: grid; grid-template-columns: 50% 50%; background-color: #0F111A;">

            

                        <div style="display: flex; justify-content: center; align-items: center; margin: 0;">
                            <button type="button" data-action="saveChanges" data-ID="${this.ID}" style="height: 80%; width: 80%;">
                                Save
                            </button>
                        </div>

                        <div style="display: flex; justify-content: center; align-items: center; margin: 0;">
                            <button type="button" data-action="closeEditMenu" data-ID="${this.ID}" style="height: 80%; width: 80%;">
                                Close
                            </button>
                        </div>

                    </div>`;

        thisMenu.insertAdjacentElement(`afterend`, thisEditMenu);
    }

    copy() {
        new Force(this);
    }

    delete() {

        // Delete HTML

        const menu = document.getElementById(`force${this.ID}Menu`);
        menu.remove();
        const editMenu = document.getElementById(`editForce${this.ID}`);
        if (editMenu) {
            editMenu.remove();
        }

        if (document.getElementById('addObjectsToForce${this.Id}')) {
            document.getElementById('addObjectsToForce${this.Id}').remove();
        }


        forces.delete(this.ID);

        forceToObjects.delete(this);

        const objects = forceToObjects.get(this);
        if (!objects) return;

        for (const obj of objects) {
            const forces = objectToForces.get(obj);
            if (forces) {
                forces.delete(this);
                if (forces.size === 0) objectToForces.delete(obj);
            }
        }
        
    }

    addObjectToThisForce(e) {
        // for when an object is clicked
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = canvas.clientHeight - (e.clientY - rect.top);


        objects.forEach((value) => {
            if (value.isClicked(mouseX, mouseY)) { // Brute force O(n) method 🥱 works for few objects
                if ((!(forceToObjects.get(this).includes(value))) && (!(this.cachedObjects.includes(value)))) { // this is nested so we fewer comparisons are made. No point checking forceToObjects.get(this).includes(value) when value.isClicked(mouseX, mouseY) is false
                
                    console.log(`Force '${this.name}' was added to object '${value.name}'`);
                    
                    forceToObjects.get(this).push(value);
                    objectToForces.get(value).push(this);

                    // draw outline to show which objects are affected
                    drawOutline(value);

                } else { // object is clicked and it is affected by the force, in which case it is removed.
                    
                    forceToObjects.get(this).splice(forceToObjects.get(this).indexOf(value), 1);
                    objectToForces.get(value).splice(objectToForces.get(value).indexOf(this), 1);
            
                    // Update canvas by removing the outline from the object that was removed

                    updateCanvas();
                    forceToObjects.get(this).forEach(object => (drawOutline(object)));

                }
            } 
        })
    }



    addAffectedObjects() {

        
        if (document.getElementsByClassName('addObjectsToForceOverlay')[0]) {
            document.getElementsByClassName('addObjectsToForceOverlay')[0].remove();
        };

        let addObjectsToForceOverlay = document.createElement('div');
        addObjectsToForceOverlay.className = 'addObjectsToForceOverlay';
        addObjectsToForceOverlay.id = 'addObjectsToForce${this.Id}';
        addObjectsToForceOverlay.innerHTML = `<h2>Click on an object to have force '${this.name}' act on it or click it again to remove it.</h2>`;
        document.querySelector('body').appendChild(addObjectsToForceOverlay);

        let btn = document.getElementById(`force${this.ID}PropertyGrid`).querySelector('button');
        if (btn.innerHTML === "Click") {
            btn.innerHTML = "Save";
            canvas.addEventListener('click', this.clickObject);
            forceToObjects.get(this).forEach(obj => {drawOutline(obj)});

        } else {
            // Done

            btn.innerHTML = "Click";
            document.getElementsByClassName('addObjectsToForceOverlay')[0].remove();

            updateCanvas(); // to remove outlines
               
            canvas.removeEventListener('click', this.clickObject)


        };



    }
}


function detectCollision(a, b) {
    const dist = ((a.x - b.x) ** 2) + ((a.y - b.y) ** 2);
    return dist ** 2 <= (a.radius + b.radius) ** 2 // modified Pythagoras since sqrt() is slow 
}

function handleCollison(a, b) {
    
}



function animate(timestamp) {
    simulation = requestAnimationFrame(animate); // 60fps

    // clear canvas
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    objects.forEach(obj => {

        // physics
        const forces = objForces.get(obj);
        obj.Fx = 0;
        obj.Fy = 0;
        forces.forEach(element => {
            // determine resultant force
            if (element.startTime <= timestamp * 1000 < element.endTime) {
                obj.Fx += element.Fx;
                obj.Fy += element.Fy;
            }
        })

        obj.updatePos();

        obj.draw(ctx);

    })
}

function stopSimulation() {
    cancelAnimationFrame(simulation);
}
     

// Main program

function runSimulation() {


    // Localising variables for quicker access
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext("2d");

    let objectList = objects;
    let forceList = forces;
    let objForces = objectToForces;
    let forceObjs = forceToObjects;

    let simulation;

}
