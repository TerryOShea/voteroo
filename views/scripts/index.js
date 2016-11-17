var menu = document.getElementById('menu'), 
    menuBtn = document.getElementById('menu-btn'), 
    showing = false;

menuBtn.addEventListener('click', function() {
    if (showing) {
        menu.style.right = "0px";
        showing = false;
    }
    else {
        menu.style.right = "-200px";
        showing = true;
    }
})