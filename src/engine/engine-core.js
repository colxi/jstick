
let _stylesDef = `
    [hide-device-cursor]{ cursor : none !important; }

`;

let _styles       = document.createElement('style');
_styles.innerHTML = _stylesDef;
document.body.appendChild(_styles);


let lastTickTimeStamp = 0;

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

        document.getElementById('FPS').innerHTML = JStick.FPS.value;
        document.getElementById("scaleInfo").innerHTML = JStick.Viewport.scale.toFixed(2);
        document.getElementById("scrollInfo").innerHTML = ( JStick.Viewport.Scroll.x << 0 ) +' | '+ ( JStick.Viewport.Scroll.y << 0 );

        //let b = Map.getBufferIndex(lem.x+lem.w-3,lem.y+lem.h)
        //document.getElementById('mapData').innerHTML= Map.buffer[b+3];
    },

    frame(e){
        if(!this.status) return;
        this.tick();
        requestAnimationFrame( ()=>this.frame() ); // use an arrow function to force the binding
    },

    tick(){
        let now =  performance.now();
        let deltaTime = now - ( lastTickTimeStamp || now ) << 0;
        lastTickTimeStamp = now;

        JStick.Viewport.updateZoom();
        JStick.Viewport.updateScroll();
        let input = JStick.Input.getStatus();
        JStick.Loop.update( deltaTime, input );
        JStick.Loop.draw( deltaTime, input );
        if( JStick.showInfo ) JStick.updateInfo();
        // reset some possible events like mousewheel
        JStick.Input.__update__();
    },


    toggle(){
        JStick.status = !JStick.status;
        if(JStick.status) lastTickTimeStamp = 0;
        JStick.frame();
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