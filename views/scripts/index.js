var menu = document.querySelector('.menu'), 
    menuBtn = document.querySelector('.menu-btn'), 
    closeMenuBtn = document.querySelector('.close-menu-btn'), 
    container = document.querySelector('.container'), 
    showing = false;

function toggleMenu() {
    if (showing) {
        menu.style.right = "-680px";
        container.style.right = "0px";
        showing = false;
    }
    else {
        menu.style.right = "0px"; 
        container.style.right = "250px";
        showing = true;
    }
}

menuBtn.addEventListener('click', toggleMenu);

window.addEventListener('resize', function() {
    if (showing) {
        toggleMenu();
    }
});