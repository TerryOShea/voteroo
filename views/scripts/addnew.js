var addOptionBtn = document.querySelector('.add-option-btn'), 
    addnewOptionsBox = document.querySelector('.addnew-options-box'), 
    counter = 3;
    
function addOption() {
    let input = document.createElement('input');
    input.type = 'text';
    input.className = 'addnew-option';
    input.name = 'options';
    input.placeholder = 'Option ' + counter;
    input.maxlength = '30';
    addnewOptionsBox.appendChild(input);
    counter += 1;
}

addOptionBtn.addEventListener('click', addOption);

if (counter == 10) {
    addOptionBtn.removeEventListener('click', addOption);
}