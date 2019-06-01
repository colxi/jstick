const JStick  = {
    rootpath : '',
    status   : true,
    showInfo : true,
    debug    : false,

    log(...args){
        if(JStick.debug) console.log(...args);
    },

    updateInfo(){
        // info panel

        document.getElementById('FPS').innerHTML = JStick.Loop.fps;
        document.getElementById("scaleInfo").innerHTML = JStick.Viewport.scale.toFixed(2);
        document.getElementById("scrollInfo").innerHTML = ( JStick.Viewport.scrollX << 0 ) +' | '+ ( JStick.Viewport.scrollY << 0 );

        //let b = Map.getBufferIndex(lem.x+lem.w-3,lem.y+lem.h)
        //document.getElementById('mapData').innerHTML= Map.buffer[b+3];
    },

}


export {JStick};