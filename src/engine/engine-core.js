const Jstick  = {
    rootpath : '',
    status   : true,
    showInfo : true,
    debug    : false,

    log(...args){
        if(Jstick.debug) console.log(...args);
    },

    updateInfo(){
        // info panel

        document.getElementById('FPS').innerHTML = Jstick.Loop.fps;
        document.getElementById("scaleInfo").innerHTML = Jstick.Viewport.scale.toFixed(2);
        document.getElementById("scrollInfo").innerHTML = ( Jstick.Viewport.scrollX << 0 ) +' | '+ ( Jstick.Viewport.scrollY << 0 );

        //let b = Map.getBufferIndex(lem.x+lem.w-3,lem.y+lem.h)
        //document.getElementById('mapData').innerHTML= Map.buffer[b+3];
    },

}


export {Jstick};