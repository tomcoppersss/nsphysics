let root = document.querySelector(':root');
let btn = document.getElementById('changeTheme');
let mode = 0;


btn.addEventListener('click', e => {
    
    if (mode === 0) {
        // change to dark mode
        root.style = `
            /* dark mode */
            --primary-bg: #1E1F2B;
            --primary-text: #F2F3F7;
            --header: #14151F;
            --canvas: #14151F;
            --input-colour: #2D3142; 
        `;
    } else {
        // light mode
        root.style = `
            
        `;
    }

    mode = 1 - mode;
});