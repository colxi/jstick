
function configureInput( game ){
    game.Input.enableInterface('mouse');
    game.Input.enableInterface('keyboard');

    // register virtual game buttons
    game.Input.registerButton( 'draw-but' );
    game.Input.registerButton( 'erase-but' );
    game.Input.registerButton( 'arrow-up' );
    game.Input.registerButton( 'arrow-down' );
    game.Input.registerButton( 'arrow-left' );
    game.Input.registerButton( 'arrow-right' );
    game.Input.registerButton( 'mouse-left' );
    game.Input.registerButton( 'mouse-right' );
    game.Input.registerButton( 'mouse-click' );
    game.Input.registerButton( 'mouse-wheel-up' );
    game.Input.registerButton( 'mouse-wheel-down' );

    // map the mouse actions to game  virtual buttons
    game.Input.setButtonMapping( 'MOUSECLICK'     , 'mouse-click' );
    game.Input.setButtonMapping( 'MOUSELEFT'      , 'mouse-left' );
    game.Input.setButtonMapping( 'MOUSERIGHT'     , 'mouse-right' );
    game.Input.setButtonMapping( 'MOUSEWHEELUP'   , 'mouse-wheel-up' );
    game.Input.setButtonMapping( 'MOUSEWHEELDOWN' , 'mouse-wheel-down' );
        // map the keyboard buttons to game  virtual buttons
    game.Input.setButtonMapping( 'D'              , 'draw-but' );
    game.Input.setButtonMapping( 'E'              , 'erase-but' );
    game.Input.setButtonMapping( 'ARROWUP'        , 'arrow-up' );
    game.Input.setButtonMapping( 'ARROWDOWN'      , 'arrow-down' );
    game.Input.setButtonMapping( 'ARROWLEFT'      , 'arrow-left' );
    game.Input.setButtonMapping( 'ARROWRIGHT'     , 'arrow-right' );

}

export {configureInput};