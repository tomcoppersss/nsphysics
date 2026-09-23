// Global variables

let simulationID;
let isRunning = false;


// General sim

// Keys are stored as strings in the maps below

// Access objects/forces by their IDs
let objects = new Map();
let forces = new Map();


// Bidirectional hash map for that sweet O(1) lookup 🤑

// Access the forces by OBJECT, not object ID
let objectToForces = new Map();

// objects by FORCE (get it??)
let forceToObjects = new Map();


// Canvas initialisation 

let canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scale = 4;

let worldWidth = canvas.width / scale;
let worldHeight = canvas.height / scale;

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

        ctx.scale(ratio * dpr, ratio * dpr);
        
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
    console.log('resize');
    ctx.clearRect(0, 0, canvas.width / scale, canvas.height / scale);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    worldWidth = canvas.width / scale;
    worldHeight = canvas.height / scale;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    updateCanvas();
    const forceOverlay = document.getElementsByClassName('addObjectsToForceOverlay')[0];
    if (forceOverlay) {
        forceToObjects.get(forces.get(parseInt(forceOverlay.id))).forEach(object => {
            object.drawOutline();
        })
    }
}
resizeCanvas();


function updateCanvas() {
    clearCanvas();
    objects.forEach((value, key) => {
        value.draw(ctx);
    })
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width / scale, canvas.height / scale);
}

function drawOutline(obj) {
    ctx.strokeStyle = '#d6cb00';
    ctx.strokeRect(obj.current.x - (obj.radius), obj.current.y - (obj.radius), (obj.radius*2) + 2, (obj.radius*2) + 2);
}


// worry later


// const temp = document.getElementById('saveSimReminder');
// const clone = temp.content.cloneNode(true);
// document.body.appendChild(clone);


function initialiseSimulation(selectElement) {

    selectElement.dataset.lastSelected = selectElement.value;

        switch (selectElement.value) {
            case selectElement.dataset.lastSelected:
                break; // do nothing if select same one
            case 'Create your own':
                // initialise empty general sim



                // left

                // <div style="height: 10%; background-color: #191A25;"><p>Object creation</p></div>

                // <div id="objectListContainer" style="height: 80%; max-height: 80%; overflow-y: scroll;">
                    
                // </div>

                // <div id="newObjectButtonContainer" style="width: 100%; height: 10%; background-color: #191A25;">
                // <button style="width: 90%; height: 80%; margin-left: 5%; margin-top: 2.5%;">+ New Object</button>
                // </div>


                // right

                // <div style="height: 10%; background-color: #191A25;">Force creation</div>

                // <div id="forceListContainer" style="height: 80%; max-height: 80%; overflow-y: scroll;">
                // </div>

                // <div id="newForceButtonContainer" style="width: 100%; height: 10%; background-color: #191A25;">
                // <button style="width: 90%; height: 80%; margin-left: 5%; margin-top: 2.5%;">+ New Force</button>
                // </div>

                break;
            case 'Projectile motion':
                // intiialise projectile motion sim

                let leftSidebar = document.getElementById('leftSidebar');
                let rightSidebar = document.getElementById('rightSidebar');

                leftSidebar.innerHTML = `
                


                `;


                break;
            case 'Momentum':
                // momentum
                break;
        }
}

// Event listeners

    window.addEventListener('resize', resizeCanvas);

    document.getElementById('simulationButtonsContainer').addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;
        globalThis[btn.dataset.action]();
    })

    document.getElementById('selectSim').addEventListener('change', e => {
        const selectElement = document.getElementById('selectSim');
        initialiseSimulation(selectElement);
    });



    // Object menus

    document.getElementById('objectListContainer').addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const obj = objects.get(btn.dataset.id);
        obj[btn.dataset.action]();
    });

    document.getElementById('newObjectButtonContainer').addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;
        new GeneralSimObject(null);
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


// Classes


// General sim 

class GeneralSimObject {
    
    static nextID = 0;

    constructor(projectileToCopy) { // projectileToCopy is not necessarily needed here

        // Add to object maps
        this.ID = String(++GeneralSimObject.nextID);
        objects.set(this.ID, this);
        objectToForces.set(this, []);
        this.name = `Object ${this.ID}`;

        this.current = {
            x: Number(),
            y: Number(),
            Vx: Number(),
            Vy: Number(),
            ax: Number(),
            ay: Number(),
            Fx: Number(),
            Fy: Number(),
        };

        if (!projectileToCopy) {

            // Physics properties
            this.initial = {
                x: Number(),
                y: Number(),
                Vx: Number(),
                Vy: Number()
            };
            
            this.mass = 1;
            this.affectedByGravity = true;
            
            // Geometrical properties 
            this.radius = 10;      
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

            this.initial = {
                x: projectileToCopy.initial.x,
                y: projectileToCopy.initial.y,
                Vx: projectileToCopy.initial.Vx,
                Vy: projectileToCopy.initial.Vy,
            };

            this.mass = projectileToCopy.mass;
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

        Object.keys(this.initial).forEach(key => {
            this.current[key] = this.initial[key];
        })

        this.draw(ctx);

    }

    // Methods 


    // Physics methods: updating and drawing position.

    draw(ctx) {

        ctx.fillStyle = this.colour;
        ctx.beginPath();
        ctx.arc(this.current.x, this.current.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        
    }

    updatePos() { 

        // Physics

        // dt is 1/60s or ~16ms
        this.current.ax = this.current.Fx / this.mass;
        this.current.Vx += this.current.ax / 60; 
        const dx = (this.current.Vx / 60) + (0.5 * this.current.ax * (1/3600));
        this.current.x += dx;

        this.current.ay = this.current.Fy / this.mass;
        if (this.affectedByGravity) {this.current.ay -= 9.81};
        this.current.Vy += this.current.ay / 60; 
        const dy = (this.current.Vy / 60) + (0.5 * this.current.ay * (1/3600));
        this.current.y += dy;

    }


    isClicked(mouseX, mouseY) {

        const dx = mouseX - this.current.x;
        const dy = mouseY - this.current.y;

        return ((dx**2) + (dy**2) <= (this.radius**2));

    }


    // Used in HTML 


    saveChanges() {
        // Captures inputs from the edit menu and saves them
        pauseSimulation();
        document.getElementById(`object${this.ID}PropertyGrid`).querySelectorAll(`input, select`).forEach(element => {
            switch (element.name) {
                case 'x': case 'y': case 'Vx': case 'Vy':
                    this.initial[element.name] = Number(element.value);
                    break;
                case 'mass':
                    this.mass = Number(element.value);
                    break;
                case 'radius':
                    this.radius = Number(element.value);
                    break;
                case 'name':
                    this.name = element.value;
                    break;
                case 'colour':
                    this.colour = element.value;
                    break;
                case 'affectedByGravity':
                    this.affectedByGravity = element.value === 'True';
                    break;
        }
    });

        Object.keys(this.initial).forEach(key => {
            this.current[key] = this.initial[key];
        })
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
                            <input type="number" id="editInitialX" name="x" value="${this.initial.x}">

                            <label for="editInitialY">Y coordinate:</label>
                            <input type="number" id="editInitialY" name="y" value="${this.initial.y}">

                            <label for="editInitialVx">Initial X velocity:</label>
                            <input type="number" id="editInitialVx" name="Vx" value="${this.initial.Vx}">

                            <label for="editInitialVy">Initial Y velocity:</label>
                            <input type="number" id="editInitialVy" name="Vy" value="${this.initial.Vy}">

                            <label for="editMass">Mass:</label>
                            <input type="number" id="editMass" name="mass" value="${this.mass}">

                            <label for="editAffectedByGravity">Gravity-affected: </label>
                            <select id="editAffectedByGravity" name="affectedByGravity">
                                <option ${this.affectedByGravity === true ? 'selected' : ''}>True</option>
                                <option ${this.affectedByGravity === false ? 'selected' : ''}>False</option>
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
        new GeneralSimObject(this);
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
                objectToCopyMenu = document.getElementById(`editObject${forceToCopy.ID}`)
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
        pauseSimulation();
        document.getElementById(`force${this.ID}PropertyGrid`).querySelectorAll(`input`).forEach(element => {
            switch (element.type) {
                case 'text':
                    this[element.name] = String(element.value);
                    break;
                case 'number':
                    this[element.name] = Number(element.value);
                    break;
            }
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

        if (document.getElementById(`addObjectsToForce${this.ID}`)) {
            document.getElementById(`addObjectsToForce${this.ID}`).remove();
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
                if ((!(forceToObjects.get(this).includes(value)))) { // this is nested so we fewer comparisons are made. No point checking forceToObjects.get(this).includes(value) when value.isClicked(mouseX, mouseY) is false
                
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


class Projectile {

    constructor(mass, size) {

        this.mass = document.getElementById('editProjectileMass');
        this.size = document.getElementById('editProjectileSize');

    }
}



function detectCollision(a, b) {
    const dx = a.current.x - b.current.x;
    const dy = a.current.y - b.current.y;
    const dist = (dx ** 2) + (dy ** 2);

    const vRel = ((a.Vx - b.Vx) ** 2) + ((a.Vy - b.Vy) ** 2)
    return (dist <= (a.radius + b.radius) ** 2) && (vRel != 0); // simplified Pythagoras since sqrt() is slow 
}

function resolveCollison(a, b) {

    // Perfectly elastic collision
    console.log('collison');
    console.log(a);
    console.log(b);
    const dx = a.current.x - b.current.x;
    const dy = a.current.y - b.current.y;
    const dist = Math.sqrt((dx ** 2) + (dy ** 2));
    if (dist === 0) return;

    const nx = dx/dist;
    const ny = dy/dist;
    const vRel = (a.current.Vx - b.current.Vx) * nx + (a.current.Vy - b.current.Vy) * ny; // dot product

    if (vRel >= 0) return; // objects are moving away from each other, no need to handle collision

    const impulse = (2 * vRel) / (a.mass + b.mass);

    // decreases a and increases b so they move apart

    a.current.Vx -= impulse * b.mass * nx;
    a.current.Vy -= impulse * b.mass * ny;
    b.current.Vx += impulse * a.mass * nx;
    b.current.Vy += impulse * a.mass * ny;

    const overlap = (a.radius + b.radius) - dist;
    if (overlap > 0) {
        const totalMass = a.mass + b.mass;
        const correction = 0.2; // reduces jitter by gradually moving the overlapping objects apart
        a.current.x -= nx * overlap * (b.mass / totalMass) * correction;
        a.current.y -= ny * overlap * (b.mass / totalMass) * correction;
        b.current.x += nx * overlap * (a.mass / totalMass) * correction;
        b.current.y += ny * overlap * (a.mass / totalMass) * correction;
    }

}

function projectileHitWall(projectile) {

    if (projectile.current.x + projectile.radius >= worldWidth) {
        // right side
        projectile.current.x = worldWidth - projectile.radius;
        projectile.current.Vx = -(projectile.current.Vx);
    }
    if (projectile.current.x <= projectile.radius) {
        // left side
        projectile.current.x = projectile.radius;
        projectile.current.Vx = -(projectile.current.Vx);
    }
    if (projectile.current.y + projectile.radius >= worldHeight) {
        // top
        projectile.current.y = worldHeight - projectile.radius;
        projectile.current.Vy = -(projectile.current.Vy);
    }
    if (projectile.current.y <= projectile.radius) {
        // ground
        projectile.current.y = projectile.radius;
        projectile.current.Vy = -(projectile.current.Vy);
    }

}
     
function runSimulation(objects, objectToForces) {

    console.log('run');

    if (objects.size === 0) return; // no point 

    // Localising variables for quicker access
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext("2d");
    ctx.scale(5, 5);
    console.log(ctx.getTransform());
    const objectEntries = Array.from(objects.values()); 

    resizeCanvas();
    isRunning = true;

    const animate = (timestamp) => {

        const secondsElapsed = timestamp / 1000; // timestamp is in ms but time inputs are in s

        // clear canvas
        ctx.clearRect(0, 0, canvas.width / scale, canvas.height / scale);
    
        for (let i = 0; i < objectEntries.length; i++) {
            // sum resultant force
            const object = objectEntries[i];
            object.current.Fx = 0;
            object.current.Fy = 0;
            const forces = objectToForces.get(object);
            if (forces.length != 0) { // without this selection, NaN logic errors can occur if forces.length = 0
                for (let j = 0; j < forces.length; j++) {
                    const force = forces[j];
                    if (force.startTime <= secondsElapsed < force.endTime) {
                        object.current.Fx += force.Fx;
                        object.current.Fy += force.Fy;
                    }
                }
            }
            object.updatePos();
            object.draw(ctx);
            projectileHitWall(object);
        }

        for (let i = 0; i < objectEntries.length; i++) { // brute force O(n^2), works for few objects.
            for (let j = i+1; j < objectEntries.length; j++) {
                if (detectCollision(objectEntries[i], objectEntries[j])) {
                    resolveCollison(objectEntries[i], objectEntries[j]);
                }
            }
        }
        
        
        if (isRunning) {simulationID = requestAnimationFrame(animate)} // 60fps
    }

    simulationID = requestAnimationFrame(animate);
    

}

function playPauseSimulation() {

    if (!isRunning) {
        runSimulation(objects, objectToForces);
    } else {
        pauseSimulation();
    }

}

function pauseSimulation() {
    isRunning = false;
    cancelAnimationFrame(simulationID);
}

function stopSimulation() {
    console.log('stop');
    pauseSimulation();
    clearCanvas();
    objects.forEach(obj => {
        Object.keys(obj.initial).forEach(key => {
            obj.current[key] = obj.initial[key];
        })
        obj.draw(ctx);
    })
}
