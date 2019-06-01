import {Jstick} from '../jstick.js';




Jstick.Map = {
    draw( map ){
        let x1 = ( 0 - Jstick.Viewport.scrollX );
        let y1 = ( 0 - Jstick.Viewport.scrollY );
        let x2 = map.width ;
        let y2 = map.height;
        // Draw map data in canvas
        Jstick.Viewport.Layers.map.drawImage( map, x1, y1, x2, y2 );   
    }
};
