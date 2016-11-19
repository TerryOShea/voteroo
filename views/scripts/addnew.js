var addOptionBtn = document.querySelector('.add-option-btn'), 
    addnewOptionsBox = document.querySelector('.addnew-options-box'), 
    counter = 2;
addOptionBtn.addEventListener('click', function() {
    let input = document.createElement('input');
    input.type = 'text';
    input.className = 'addnew-option';
    input.name = 'options';
    input.placeholder = 'Option ' + counter;
    addnewOptionsBox.appendChild(input);
    counter += 1;
});
if (counter == 10) {
    
}