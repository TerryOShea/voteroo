var addOptionBtn = document.querySelector('.add-option-btn'), 
    addnewOptionsBox = document.querySelector('.addnew-options-box'), 
    removeOptionBtn = document.querySelector('.remove-option-btn'), 
    counter = 2;
    
function addOption() {
    if (counter < 10) {
        counter += 1;
        let input = document.createElement('input');
        input.type = 'text';
        input.className = 'addnew-option';
        input.name = 'options';
        input.placeholder = 'Option ' + counter;
        input.id = 'option-' + counter;
        input.maxlength = '30';
        addnewOptionsBox.appendChild(input);
    }
}

function removeOption() {
    if (counter > 2) {
        let option = document.getElementById('option-' + counter);
        option.parentElement.removeChild(option);
        counter -= 1;
    }
}

addOptionBtn.addEventListener('click', addOption);
removeOptionBtn.addEventListener('click', removeOption);