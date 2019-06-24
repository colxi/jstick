import {Jstick} from '../../src/jstick.js';

function configureInput(){
    Jstick.Input.enableInterface('mouse');
    Jstick.Input.enableInterface('keyboard');

    // register virtual game buttons
    Jstick.Input.registerButton( 'draw-but' );
    Jstick.Input.registerButton( 'erase-but' );
    Jstick.Input.registerButton( 'arrow-up' );
    Jstick.Input.registerButton( 'arrow-down' );
    Jstick.Input.registerButton( 'arrow-left' );
    Jstick.Input.registerButton( 'arrow-right' );
    Jstick.Input.registerButton( 'mouse-left' );
    Jstick.Input.registerButton( 'mouse-right' );
    Jstick.Input.registerButton( 'mouse-click' );
    Jstick.Input.registerButton( 'mouse-wheel-up' );
    Jstick.Input.registerButton( 'mouse-wheel-down' );

    // map the mouse actions to game  virtual buttons
    Jstick.Input.setButtonMapping( 'MOUSECLICK'     , 'mouse-click' );
    Jstick.Input.setButtonMapping( 'MOUSELEFT'      , 'mouse-left' );
    Jstick.Input.setButtonMapping( 'MOUSERIGHT'     , 'mouse-right' );
    Jstick.Input.setButtonMapping( 'MOUSEWHEELUP'   , 'mouse-wheel-up' );
    Jstick.Input.setButtonMapping( 'MOUSEWHEELDOWN' , 'mouse-wheel-down' );
        // map the keyboard buttons to game  virtual buttons
    Jstick.Input.setButtonMapping( 'D'              , 'draw-but' );
    Jstick.Input.setButtonMapping( 'E'              , 'erase-but' );
    Jstick.Input.setButtonMapping( 'ARROWUP'        , 'arrow-up' );
    Jstick.Input.setButtonMapping( 'ARROWDOWN'      , 'arrow-down' );
    Jstick.Input.setButtonMapping( 'ARROWLEFT'      , 'arrow-left' );
    Jstick.Input.setButtonMapping( 'ARROWRIGHT'     , 'arrow-right' );

}

export {configureInput};