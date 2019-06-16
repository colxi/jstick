import {Jstick} from '../src/jstick.js';
import {Sprite}    from '../src/components/Sprite.js';
import {Animation} from '../src/components/Animation.js';
import {State}     from '../src/components/State.js';
import {Actor}     from '../src/components/Actor.js';


import {Texture}  from '../src/components/Texture.js';
import {Scene}  from '../src/components/Scene.js';

import './js/game-input.js';
import {myStates}  from './js/actor-states.js';


window.Jstick = Jstick;


let myScene;


(async function(){
    let myBackground    = await new Texture('./maps/map2.png');
    let myfarBackground = await new Texture('./maps/back.jpg');
    
    myScene = new Scene( 1087, 319);
    myScene.addLayer( 'terrain', myBackground , 0);
    myScene.addLayer( 'landscape', myfarBackground , -1);
    myScene.addLayer( 'sprites', null , 1);
    
    Jstick.RenderEngine.setScene( myScene );

    myScene.Camera.zoomAnimation(Jstick.Viewport.height/myScene.height,700,150);

   // console.log(myBackground, myScene, myScene.Camera);

    Jstick.Loop.draw = function(){
        /*
        Jstick.RenderEngine.clear(); // clears all te layers of the scene    
        Jstick.RenderEngine.draw(); // draws all the layers of the scene
        Jstick.RenderEngine.draw( mysprite , x, y, myScene.Layers.sprites );
        Jstick.RenderEngine.draw( myActor , x, y, myScene.Layers.sprites );
        */
    }

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
        
        if(input['arrow-right']) myScene.Camera.scrollAnimation( myScene.Camera.x + 10, myScene.Camera.y );
        if(input['arrow-left']) myScene.Camera.scrollAnimation( myScene.Camera.x - 10, myScene.Camera.y );
        if(input['arrow-up']) myScene.Camera.scrollAnimation( myScene.Camera.x , myScene.Camera.y - 10 );
        if(input['arrow-down']) myScene.Camera.scrollAnimation( myScene.Camera.x , myScene.Camera.y + 10 );
        
        if(input['draw-but']) window.action='draw';
        if(input['erase-but']) window.action='erase';
        
        if(input['mouse-left']) applyAction( input.MOUSEX, input.MOUSEY );

        if(input['mouse-click']) onClick( input.MOUSEX, input.MOUSEY );

    }


   // Jstick.ViewPort.setView( myScene.Camera );
})()


function setZoom( x,y,direction ){
    let newScale= myScene.Camera.zoom + ( 1 * direction );
    myScene.Camera.zoomAnimation(newScale, x , y);
    console.log('setting zoom', newScale, x, y)
}








window.action = 'erase';
let pixelMap;
let Actors
let selectedActor;


(async function(){
return
    Jstick.Viewport.hideDeviceCursor = true;
    //Jstick.Sprite.drawBoundingBoxes  = true;

    // Load the spritesheet
    let spriteSheet  = await Jstick.Image.load( './spritesheet/lemmings.png' );
    // generate walking animation with the walking sprites from spritesheet
    
    let cursorSelected =  await new Sprite( spriteSheet,  133,  0, 14, 14 );
    let cursorRegular  =  await new Sprite( spriteSheet,  148,  0, 14, 14 );

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

    let walkState    = new State( 'walk', walkAnimation, myStates.walk );
    let fallState    = new State( 'fall', walkAnimation, myStates.fall );
    let digState     = new State( 'dig',  walkAnimation, myStates.dig );
    let tunnelState  = new State( 'tunnel', walkAnimation, myStates.tunnel );
    let blockState   = new State( 'block', walkAnimation, myStates.block );

    Actors = [];
    let interval = setInterval( ()=>{
        Actors.push(
            new Actor({
                states : [walkState, fallState, digState, tunnelState, blockState],
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
    
    Jstick.Camera.zoomAnimation(Jstick.Viewport.height/pixelMap.height,700,150);
    

    Jstick.Camera.scrollWidth  =  pixelMap.width;
    Jstick.Camera.scrollHeight =  pixelMap.height;

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
        
        if(input['arrow-right']) Jstick.Camera.scrollAnimation( Jstick.Camera.x + 10, Jstick.Camera.y );
        if(input['arrow-left']) Jstick.Camera.scrollAnimation( Jstick.Camera.x - 10, Jstick.Camera.y );
        if(input['arrow-up']) Jstick.Camera.scrollAnimation( Jstick.Camera.x , Jstick.Camera.y - 10 );
        if(input['arrow-down']) Jstick.Camera.scrollAnimation( Jstick.Camera.x , Jstick.Camera.y + 10 );
        
        if(input['draw-but']) window.action='draw';
        if(input['erase-but']) window.action='erase';
        
        if(input['mouse-left']) applyAction( input.MOUSEX, input.MOUSEY );

        if(input['mouse-click']) onClick( input.MOUSEX, input.MOUSEY );


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

        let mouseAbsCoords = Jstick.Viewport.getAbsoluteCoordinates(input.MOUSEX, input.MOUSEY);
        let coordActors    = actorsAtCoords( input.MOUSEX, input.MOUSEY );
        if( coordActors.length ) Jstick.Sprite.draw( cursorSelected , mouseAbsCoords[0]-7, mouseAbsCoords[1]-7  );
        else Jstick.Sprite.draw( cursorRegular , mouseAbsCoords[0]-7, mouseAbsCoords[1]-7  );

        return;
    }

    

})();

/*
function setZoom( x,y,direction ){
    let newScale= Jstick.Camera.zoom + ( 1 * direction );
    Jstick.Camera.zoomAnimation(newScale, x , y);
}

function actorsAtCoords(x,y, single=false){
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
    if( single && affected.length ) return [ affected[ Math.round( Math.random() * (affected.length -1) ) ] ];
    else return affected;
}

function onClick(x,y){
    if( window.action === 'select' ){
        let affected = actorsAtCoords(x,y, true);
        if( affected.length ){ 
            Jstick.Camera.follow( affected[ 0 ] );
            selectedActor = affected[ 0 ];
        }
        else{ 
            Jstick.Camera.follow( false );
            selectedActor = false;
        }
    }else if( window.action === 'dig'){
        let affected = actorsAtCoords(x,y, true);
        if( affected.length ) affected[ 0 ].setState('dig');
    }else if( window.action === 'tunnel'){
        let affected = actorsAtCoords(x,y, true);
        if( affected.length ) affected[ 0 ].setState('tunnel');
    }else if( window.action === 'block'){
        let affected = actorsAtCoords(x,y, true);
        if( affected.length ) affected[ 0 ].setState('block');
    }
}

function applyAction(x,y){
    if( window.action === 'zoomIn' ){
        Jstick.Camera.zoomAnimation( Jstick.Camera.zoom + 1 , x , y  )
    }else if( window.action === 'zoomOut' ){
        Jstick.Camera.zoomAnimation( Jstick.Camera.zoom - 1 , x , y  )
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


*/
