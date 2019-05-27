import {JStick} from '../jstick.js';




JStick.Map = {
    draw( map ){
        let x1 = ( 0 - JStick.Viewport.Scroll.x );
        let y1 = ( 0 - JStick.Viewport.Scroll.y );
        let x2 = map.width ;
        let y2 = map.height;
        // Draw map data in canvas
        JStick.Viewport.Layers.map.drawImage( map, x1, y1, x2, y2 );   
    }
};
