
let _stylesDef = `
    [hide-device-cursor]{ cursor : none !important; }

`;

let _styles       = document.createElement('style');
_styles.innerHTML = _stylesDef;
document.body.appendChild(_styles);


const JStick  = {
    rootpath : '',
    status : 1,
    showInfo : true,
    debug : false,

    log(...args){
        if(JStick.debug) console.log(...args);
    },

    updateInfo(){
        // info panel

        document.getElementById('FPS').innerHTML = JStick.gameLoop.fps;
        document.getElementById("scaleInfo").innerHTML = JStick.Viewport.scale.toFixed(2);
        document.getElementById("scrollInfo").innerHTML = ( JStick.Viewport.scrollX << 0 ) +' | '+ ( JStick.Viewport.scrollY << 0 );

        //let b = Map.getBufferIndex(lem.x+lem.w-3,lem.y+lem.h)
        //document.getElementById('mapData').innerHTML= Map.buffer[b+3];
    },


    tick( timestamp=performance.now() ){
        JStick.Viewport.updateZoom();
        JStick.Viewport.updateScroll();
        let input = JStick.Input.getStatus();
        JStick.Loop.update( timestamp, input );
        JStick.Loop.draw( timestamp, input );
        if( JStick.showInfo ) JStick.updateInfo();
        // reset some possible events like mousewheel
        JStick.Input.__update__();
    },


    toggle(){
        if( JStick.status ){
            JStick.status = false;
            JStick.gameLoop.stop();
        }else{
            JStick.status = true;
            JStick.gameLoop.start();

        }
    },
    
    Loop : {
        update(){
            // user provided 
        },
        draw(){
            // user provided 
        }
    }
}




export {JStick};