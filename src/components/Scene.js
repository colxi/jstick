import {Camera}  from './Camera.js';


const Scene = function( width, height ){
    // handle requests performed without using the keyword 'new'
    // otherwhise the Constructor will fail for the lack of own context (this)
    if( !this ) return new Scene( width, height );

    this.Layers = {};

    this.width  = width;
    this.height = height;


    this.addLayer = function( name, texture , index ){
        this.Layers[name] = {
            texture : texture,
            index   : index,
            name    : name
        };
        return true;
    }

    this.Camera = new Camera( this );

    return this;
}


export {Scene};