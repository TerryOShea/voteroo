var menu = document.querySelector('.menu'), 
    menuBtn = document.querySelector('.menu-btn'), 
    closeMenuBtn = document.querySelector('.close-menu-btn');

menuBtn.addEventListener('click', function() { menu.style.right = "0px"; });
closeMenuBtn.addEventListener('click', function() { menu.style.right = "-680px" });