import {Jstick} from '../src/jstick.js';
import {Sprite}    from '../src/components/Sprite.js';
import {Animation} from '../src/components/Animation.js';
import {State}     from '../src/components/State.js';
import {Actor}     from '../src/components/Actor.js';
import {PixelMap}  from '../src/components/PixelMap.js';

import './js/game-input.js';
import {myStates}  from './js/actor-states.js';




window.Jstick = Jstick;

window.action = 'erase';

let pixelMap;
let Actors
let selectedActor;


(async function(){
    Jstick.Viewport.hideDeviceCursor = true;
    //Jstick.Sprite.drawBoundingBoxes  = true;

    // Load the spritesheet
    let spriteSheet  = await Jstick.Image.load( './spritesheet/lemmings.png' );
    // generate walking animation with the walking sprites from spritesheet
    
    let cursorSelected =  await new Sprite( spriteSheet,  133,  0, 14, 14 );

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
        if( Actors.length > 99 ) clearInterval( interval );
    }, 800);



    // todo: create Scene, add layer (PixelMap) to the scene, pass the scene to the 
    // viewport with config values to allow him to autoadapt 
    pixelMap = await new PixelMap('./maps/map2.png');
    
    Jstick.Viewport.zoomTo(Jstick.Viewport.height/pixelMap.height,700,150);
    

    Jstick.Viewport.scrollWidth  =  pixelMap.width;
    Jstick.Viewport.scrollHeight =  pixelMap.height;

    /** LOOP : UPDATE */
    Jstick.Loop.update = function( deltaTime , input ){
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
        
        if(input['arrow-right']) Jstick.Viewport.scrollAnimation( Jstick.Viewport.scrollX + 10, Jstick.Viewport.scrollY );
        if(input['arrow-left']) Jstick.Viewport.scrollAnimation( Jstick.Viewport.scrollX - 10, Jstick.Viewport.scrollY );
        if(input['arrow-up']) Jstick.Viewport.scrollAnimation( Jstick.Viewport.scrollX , Jstick.Viewport.scrollY - 10 );
        if(input['arrow-down']) Jstick.Viewport.scrollAnimation( Jstick.Viewport.scrollX , Jstick.Viewport.scrollY + 10 );
        
        if(input['draw-but']) window.action='draw';
        if(input['erase-but']) window.action='erase';
        
        if(input['mouse-left']) applyAction( input.MOUSEX, input.MOUSEY );

        if(input['mouse-click']) detectOnClick( input.MOUSEX, input.MOUSEY );


        // iterate all actors and update their States
        for(let i = 0; i < Actors.length; i++){ 
            Actors[i].updateState( pixelMap );
        }
    }
    
    /* LOOP : DRAW */
    Jstick.Loop.draw = function( deltaTime,  input ){
        document.getElementById('actorsCounts').innerHTML = Actors.length;
        Jstick.Viewport.clear();
        pixelMap.draw( );

        // RENDER LAYER :
        for(let i = 0; i < Actors.length; i++) Actors[i].draw();
        // RENDER STAGE :
        if( selectedActor ){ 
            let box = selectedActor.getBoundingBox();
            let x =  box.x - Math.round( (cursorSelected.image.width - box.width) / 2);
            let y =  box.y - Math.round( (cursorSelected.image.height - box.height) / 2);
            
            //console.log(cursorSelected,box, box.x, box.y, x, y)
            Jstick.Sprite.draw( cursorSelected , x, y  );
        }
        Jstick.Viewport.drawCursor( input.MOUSEX, input.MOUSEY );



        return;
    }

    

})();


function setZoom( x,y,direction ){
    let newScale= Jstick.Viewport.scale + ( 1 * direction );
    Jstick.Viewport.zoomTo(newScale, x , y);
}


function detectOnClick(x,y){
    if( window.action !== 'select' ) return;

    let tolerance = 3;
    let affected = [];
    [x,y] = Jstick.Viewport.getAbsoluteCoordinates(x,y);
    for(let i=0; i<Actors.length; i++){
        let actor = Actors[i];
        let box = actor.getBoundingBox();
        if( x >= box.x-tolerance && y >= box.y-tolerance &&  
            x <= box.x+box.width+tolerance && y <= box.y + box.height+tolerance ){ 
                affected.push(actor);
        }
    }
    
    //
    selectedActor = undefined;
    if( affected.length ){
        let random = Math.round( Math.random()  * (affected.length -1) );
        selectedActor = affected[ random ];
        Jstick.Camera.follow( selectedActor );
    }else Jstick.Camera.follow( false );
}

function applyAction(x,y){
    if( window.action === 'zoomIn' ){
        Jstick.Viewport.zoomTo( Jstick.Viewport.scale + 1 , x , y  )
    }else if( window.action === 'zoomOut' ){
        Jstick.Viewport.zoomTo( Jstick.Viewport.scale - 1 , x , y  )
    }else if( window.action === 'erase' ){
        [x , y] = Jstick.Viewport.getAbsoluteCoordinates( x, y );

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
        [x , y] = Jstick.Viewport.getAbsoluteCoordinates( x, y );

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



