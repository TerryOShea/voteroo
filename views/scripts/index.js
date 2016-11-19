var menu = document.getElementById('menu'), 
    menuBtn = document.getElementById('menu-btn'), 
    closeMenuBtn = document.getElementById('close-menu-btn');

menuBtn.addEventListener('click', function() { menu.style.right = "0px"; });
closeMenuBtn.addEventListener('click', function() { menu.style.right = "-680px" });

//if screen widened, menu goes away
//click on dark to close