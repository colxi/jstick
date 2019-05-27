import {JStick} from '../src/jstick.js';
import {Sprite}    from '../src/components/Sprite.js';
import {Animation} from '../src/components/Animation.js';
import {State}     from '../src/components/State.js';
import {Actor}     from '../src/components/Actor.js';
import {PixelMap}  from '../src/components/PixelMap.js';

import './js/game-input.js';
import {myStates}  from './js/actor-states.js';




window.JStick = JStick;

window.action = 'erase';

let pixelMap;
let Actors

(async function(){
    JStick.Viewport.hideDeviceCursor = true;
    //JStick.Sprite.drawBoundingBoxes  = true;

    // Load the spritesheet
    let spriteSheet  = await JStick.Image.load( './spritesheet/lemmings.png' );
    // generate walking animation with the walking sprites from spritesheet
    let walkAnimation = new Animation({
        0  : await new Sprite( spriteSheet,  5,  1, 4, 9 ), 
        10 : await new Sprite( spriteSheet, 21,  0, 5, 10 ), 
        20 : await new Sprite( spriteSheet, 36,  1, 6, 9 ), 
        30 : await new Sprite( spriteSheet, 52,  1, 5, 9 ), 
        40 : await new Sprite( spriteSheet, 69,  1, 4, 9 ), 
        50 : await new Sprite( spriteSheet, 85,  0, 5, 10 ), 
        60 : await new Sprite( spriteSheet, 100, 1, 6, 9 ),
        70 : await new Sprite( spriteSheet, 116, 1, 5, 9 ) 
    } , 80 , true ); 

    let walkState = new State( 'walk', walkAnimation, myStates.walk );
    let fallState = new State( 'fall',  walkAnimation, myStates.fall );

    Actors = [];
    let interval = setInterval( ()=>{
        Actors.push(
            new Actor({
                states : [walkState, fallState],
                state  : 'walk',
                x      : 470,
                y      : 102,
                attributes : {
                    direction : 1
                }
            }) 
        );
        if( Actors.length > 100 ) clearInterval( interval );
    }, 800);


    pixelMap = await new PixelMap('./maps/map2.png');
    
    JStick.Viewport.zoomTo(JStick.Viewport.height/pixelMap.height,700,150);
    

    JStick.Viewport.Scroll.width  =  pixelMap.width;
    JStick.Viewport.Scroll.height =  pixelMap.height;

    /** LOOP : UPDATE */
    JStick.Loop.update = function( deltaTime , input ){
        document.getElementById('inputMouseCoords').innerHTML = input['MOUSEX'] + '-' + input['MOUSEY'];
        document.getElementById('inputMouseLeft').innerHTML = input['mouse-left'];
        document.getElementById('inputMouseRight').innerHTML = input['mouse-right'];
        document.getElementById('inputMouseWheelUp').innerHTML = input['mouse-wheel-up'];
        document.getElementById('inputMouseWheelDown').innerHTML = input['mouse-wheel-down'];
        document.getElementById('inputKeybD').innerHTML = input['draw-but'];
        document.getElementById('inputKeybE').innerHTML = input['erase-but'];
        document.getElementById('inputKeybArrowUp').innerHTML = input['arrow-up'];
        document.getElementById('inputKeybArrowDown').innerHTML = input['arrow-down'];
        document.getElementById('inputKeybArrowLeft').innerHTML = input['arrow-left'];
        document.getElementById('inputKeybArrowRight').innerHTML = input['arrow-right'];
        
        if(input['mouse-wheel-up']) setZoom( input.MOUSEX, input.MOUSEY, 1 );
        if(input['mouse-wheel-down']) setZoom( input.MOUSEX, input.MOUSEY, -1 );
        
        if(input['arrow-right']) JStick.Viewport.scrollTo( JStick.Viewport.Scroll.x + 10, JStick.Viewport.Scroll.y );
        if(input['arrow-left']) JStick.Viewport.scrollTo( JStick.Viewport.Scroll.x - 10, JStick.Viewport.Scroll.y );
        if(input['arrow-up']) JStick.Viewport.scrollTo( JStick.Viewport.Scroll.x , JStick.Viewport.Scroll.y - 10 );
        if(input['arrow-down']) JStick.Viewport.scrollTo( JStick.Viewport.Scroll.x , JStick.Viewport.Scroll.y + 10 );
        
        if(input['draw-but']) window.action='draw';
        if(input['erase-but']) window.action='erase';
        
        if(input['mouse-left']) applyAction( input.MOUSEX, input.MOUSEY );


        // iterate all actors and update their States
        for(let i = 0; i < Actors.length; i++){ 
            Actors[i].updateState( pixelMap );
        }
    }
    
    /* LOOP : DRAW */
    JStick.Loop.draw = function( deltaTime,  input ){
        document.getElementById('actorsCounts').innerHTML = Actors.length;
        JStick.Viewport.clear();
        pixelMap.draw( );

        // RENDER LAYER :
        for(let i = 0; i < Actors.length; i++) Actors[i].draw();
        // RENDER STAGE :
        JStick.Viewport.drawCursor( input.MOUSEX, input.MOUSEY );

        return;
    }
    JStick.frame();

})();





function setZoom( x,y,direction ){
    let newScale= JStick.Viewport.scale + ( JStick.Viewport.scaleFactor * direction );
    JStick.Viewport.zoomTo(newScale, x , y);
}

function applyAction(x,y){
    console.log('action',window.action, x,y)
    if( window.action === 'zoomIn' ){
        JStick.Viewport.zoomTo( JStick.Viewport.scale + JStick.Viewport.scaleFactor , x , y  )
    }else if( window.action === 'zoomOut' ){
        JStick.Viewport.zoomTo( JStick.Viewport.scale - JStick.Viewport.scaleFactor , x , y  )
    }else if( window.action === 'erase' ){
        [x , y] = JStick.Viewport.toMapCoordinates( x, y );

        pixelMap.clearPixel(x -1, y -1);
        pixelMap.clearPixel(x +0, y -1);
        pixelMap.clearPixel(x +1, y -1);

        pixelMap.clearPixel(x -1, y +0);
        pixelMap.clearPixel(x +0, y +0);
        pixelMap.clearPixel(x +1, y +0);

        pixelMap.clearPixel(x -1, y +1);
        pixelMap.clearPixel(x +0, y +1);
        pixelMap.clearPixel(x +1, y +1);
    }else if( window.action === 'draw' ){
        [x , y] = JStick.Viewport.toMapCoordinates( x, y );

        pixelMap.setPixel(x -1, y -1, [255,255,255,255]);
        pixelMap.setPixel(x +0, y -1, [255,255,255,255]);
        pixelMap.setPixel(x +1, y -1, [255,255,255,255]);

        pixelMap.setPixel(x -1, y +0, [255,255,255,255]);
        pixelMap.setPixel(x +0, y +0, [255,255,255,255]);
        pixelMap.setPixel(x +1, y +0, [255,255,255,255]);

        pixelMap.setPixel(x -1, y +1, [255,255,255,255]);
        pixelMap.setPixel(x +0, y +1, [255,255,255,255]);
        pixelMap.setPixel(x +1, y +1, [255,255,255,255]);
    }

}



