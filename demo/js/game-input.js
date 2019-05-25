import {JStick} from '../../src/jstick.js';

JStick.Input.enableInterface('mouse');
JStick.Input.enableInterface('keyboard');

// register virtual game buttons
JStick.Input.registerButton( 'draw-but' );
JStick.Input.registerButton( 'erase-but' );
JStick.Input.registerButton( 'arrow-up' );
JStick.Input.registerButton( 'arrow-down' );
JStick.Input.registerButton( 'arrow-left' );
JStick.Input.registerButton( 'arrow-right' );
JStick.Input.registerButton( 'mouse-left' );
JStick.Input.registerButton( 'mouse-right' );
JStick.Input.registerButton( 'mouse-wheel-up' );
JStick.Input.registerButton( 'mouse-wheel-down' );

// map the mouse actions to game  virtual buttons
JStick.Input.setButtonMapping( 'MOUSELEFT'      , 'mouse-left' );
JStick.Input.setButtonMapping( 'MOUSERIGHT'     , 'mouse-right' );
JStick.Input.setButtonMapping( 'MOUSEWHEELUP'   , 'mouse-wheel-up' );
JStick.Input.setButtonMapping( 'MOUSEWHEELDOWN' , 'mouse-wheel-down' );
    // map the keyboard buttons to game  virtual buttons
JStick.Input.setButtonMapping( 'D'              , 'draw-but' );
JStick.Input.setButtonMapping( 'E'              , 'erase-but' );
JStick.Input.setButtonMapping( 'ARROWUP'        , 'arrow-up' );
JStick.Input.setButtonMapping( 'ARROWDOWN'      , 'arrow-down' );
JStick.Input.setButtonMapping( 'ARROWLEFT'      , 'arrow-left' );
JStick.Input.setButtonMapping( 'ARROWRIGHT'     , 'arrow-right' );