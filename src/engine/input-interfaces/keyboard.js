export default {
    name    : 'keyboard',
    signals : [
        ' ', 'TAB', 'CAPSLOCK', 'SHIFT', 'CONTROL', 'META', 'ALT', 'ALTGRAPH', 'ENTER', 'BACKSPACE', 
        'ARROWLEFT', 'ARROWUP', 'ARROWRIGHT', 'ARROWDOWN', 
        'º', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 
        'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 
        'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ', 'Ç', 
        'Z', 'X', 'C', 'V', 'B', 'N', 'M',
        //',', '.', '-', '_', ';', ':', '´', '¨', '{', '}', '`', '^', '[', ']', '*', '+',
        //'ª', '!', '"', '·', '$', '%', '&', '/', '(', ')', '=', '?', '¿', '¡', '\'', '\\',
        //'|', '@', '#', '~', '€', '¬'
    ],
    enable(){
        window.addEventListener( 'keyup', keyUp, false);
        window.addEventListener( 'keydown', keyDown, false );
        return true;
    },
    disable(){
        window.removeEventListener( 'keyup', keyUp, false);
        window.removeEventListener( 'keydown', keyDown ,false);
        return true;
    }
};

function keyDown(e){
    e.preventDefault();
    let key = e.key.toUpperCase();
    JStick.Input.__interfaceSignal__( key , true ); 
    return;
}

function keyUp(e){
    e.preventDefault();
    let key = e.key.toUpperCase();
    JStick.Input.__interfaceSignal__( key , false ); 
    return;
}
