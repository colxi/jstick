import {Jstick} from '../jstick.js';
import {default as MouseInterface} from './input-interfaces/mouse.js';
import {default as KeyboardInterface} from './input-interfaces/keyboard.js';

// TODO : move the private methods to a new module like 'engine-input-state.js'
//        to keep them out of the public API

// Container for loaded/imported interfaces
let INTERFACES = {
    'mouse'    : MouseInterface,
    'keyboard' : KeyboardInterface
};

// List of enabled interfaces
let INTERFACES_ENABLED = [ /* 'mouse' , 'keyboard', ... */ ];

// List of signals from the interfaces
let INTERFACES_SIGNALS = [ /* 'MOUSEUP', 'MOUSEDOWN' , ... */ ];

// Collection of interface signal mappings to virtual buttons 
let INTERFACES_BUTTONS_MAPPINGS = {
    /* interfaceSignal : virtualButtonId */
};

// State of the virtual buttons container 
let VIRTUAL_BUTTONS_STATE = {
    /* buttonId : state */
};

let VIRTUAL_BUTTONS_OLD_STATE = {};

/* 
    PUBLIC API METHODS 
*/
Jstick.Input = {
    /**
     * __interfaceSignal__() : Internal method to recieve signals from the interface modules
     *                         and change the input state
     */
    __interfaceSignal__( interfaceSignal, value, attributeFlag=false ){
        // if is an attribute , set the value
        if(attributeFlag) VIRTUAL_BUTTONS_STATE[ interfaceSignal ] = value;
        // if is not an attribute, assign the value only if the signal is mapped
        // to a virtual button
        else{
            let virtualButtonId = INTERFACES_BUTTONS_MAPPINGS[ interfaceSignal ];
            if( typeof virtualButtonId === 'undefined' ) return false;
            VIRTUAL_BUTTONS_STATE[ virtualButtonId ] = value;
        }
        return true;
    },

    /**
     * __registerInterfaceAttribute__() : Registers a new interface attribute in the
     *                                    Input state object
     */
    __registerInterfaceAttribute__( interfaceAttr, initialValue ){
        VIRTUAL_BUTTONS_STATE[ interfaceAttr ] = initialValue;
        return true;
    },

    /**
     * __unregisterInterfaceAttribute__() : Unregisters an interface attribute from the
     *                                      Input state object
     */
    __unregisterInterfaceAttribute__( interfaceAttr ){
        delete VIRTUAL_BUTTONS_STATE[ interfaceAttr ];
        return true;
    },

     /**
     * __setButtonState__() : Internal method to allow virtual buttons states to be changed 
     *                        programatically
     */
    __setButtonState__( vButton, value){
        if( !VIRTUAL_BUTTONS_STATE.hasOwnProperty( vButton ) ) return false;
        VIRTUAL_BUTTONS_STATE[ vButton ] = value;
        return true;
    },

    /**
     * __update__() : Internal method called by the game loop. Will call each active interface  
     *                .update() method in order to perform internal tasks in each loop cycle
     */
    __update__(){
        VIRTUAL_BUTTONS_OLD_STATE = {...VIRTUAL_BUTTONS_STATE};

        for(let i=0; i<INTERFACES_ENABLED.length; i++){
            let _interface = INTERFACES[ INTERFACES_ENABLED[i] ];
            if( _interface.hasOwnProperty( 'update' ) ) _interface.update();
        }
    },


    /************************************************************************
     * 
     * INPUT INTERFACES
     * 
     * Input Interfaces are the different hardware controllers that can
     * provide input signals : Mouse, keyboard, controllers... 
     * Each Input interface is declared in an individual module. The following 
     * collection of methods allow importing, enabling, disabling, and retrieving
     * info from the input interfaces.
     * 
     ***********************************************************************/

    /**
     * importInterface() : (async) Imports Dynamically the requested interface 
     *                     module and initializes it.
     */
    async importInterface( iface ){
        if( typeof iface !== 'string' || !iface.trim().length ) throw new Error('Interface identifier must be a valid string');
        //if interface has already been imported, return
        if( !Jstick.Input.interfaceExist( iface ) ){
            let ifaceRef = ( await import( './input-interfaces/'+iface ) );
            if( !ifaceRef ) throw new Error('Can\'t find requested interface file: ' + iface );
            if( ifaceRef.hasOwnProperty( 'default') ) throw new Error('Imported interface has bad format : ' + iface );;
            // TODO : check if has 'signals', methods 'enable' and 'disable'...
            INTERFACES[ iface ] = ifaceRef.default;
        }
        return true;
    },

    /**
     * 
     * enableInterface() : Enables the requested interface, and registers
     *                     the interface signals.
     * 
     */
    enableInterface( iface ){
        if( typeof iface !== 'string' || !iface.trim().length ) throw new Error('Interface identifier must be a valid string');
        // block if interface does not exist
        if( !Jstick.Input.interfaceExist( iface ) ) throw new Error('Unknown interface provided : ' + iface);
        // if interface is not already enabled
        if( !Jstick.Input.isInterfaceEnabled( iface ) ){
            // validate interface does not provide duplicate signal identifiers
            for(let i= 0; i<INTERFACES[ iface ].signals.length; i++){
                let currentButton = INTERFACES[ iface ].signals[i];
                if( INTERFACES_SIGNALS.indexOf( currentButton ) !== -1 ){ 
                    throw new Error('Duplicate Interface button name found'); 
                }
            }
            // register interface signal
            INTERFACES_SIGNALS.push( ...INTERFACES[ iface ].signals );
            // set interface as active
            INTERFACES_ENABLED.push( iface );
            // call the interface activator
            INTERFACES[ iface ].enable();
        }
        // done!
        return true;
    },

    /**
     * disableInterface() : Disables the requested interface, and unregisters
     *                      the interface signals.
     */
    disableInterface( iface ){
        if( typeof iface !== 'string' || !iface.trim().length ) throw new Error('Interface identifier must be a valid string');

        // block if interface does not exist
        if( !Jstick.Input.interfaceExist( iface ) ) throw new Error('Unknown interface provided : ' + iface);
        // if interface is active...
        if( Jstick.Input.isInterfaceEnabled( iface ) ){ 
            let ifaceIndex = INTERFACES_ENABLED.indexOf( iface );
            // unregister all interface signals
            for(let i= 0; i<INTERFACES[ iface ].signals.length; i++){
                let currentButton = INTERFACES[ iface ].signals[i];
                let index = INTERFACES_SIGNALS.indexOf( currentButton );
                INTERFACES_SIGNALS.splice( index, 1); 
            }
            // TODO : remove all Button mappings that use any of disable interface button/signals

            // disable interface
            INTERFACES_ENABLED.splice(ifaceIndex, 1);
            // call the interface activator
            INTERFACES[ iface ].disable();
        }
        // done!
        return true;
    },

    /**
     * interfaceExist() : Returns a boolean indicating if the interface exists
     */
    interfaceExist( iface ){
        if( INTERFACES.hasOwnProperty( iface ) ) return true;
        else return false;
    },

    /**
     * isInterfaceEnabled() : Returns a booleans indicating if the interface is enabled
     */
    isInterfaceEnabled( iface ){
        if( INTERFACES_ENABLED.indexOf( iface ) === -1 ) return false;
        else return true;
    }, 

    /**
     * Return an array (copy) with the configured interfaces
     */
    getActiveInterfaces(){ 
        //
        return [...INTERFACES_ENABLED] 
    }, 
    
    /**
     * getInterfaceSignals() : Returns all the signals an interface owns. 
     *                         If no interface is provided returns all available 
     *                         signals
     */
    getInterfaceSignals( iface=false ){
        // of SPECIFIC INTERFACE REQUEST
        if( iface ){
            // if interface does not exist, or is disabled throw an error
            if( !Jstick.Input.interfaceExist( iface ) ) throw new Error('Unknown Interface');
            if( !Jstick.Input.isInterfaceEnabled( iface ) ) throw new Error('Interface is disabled : '+ iface);
            // else return an array (copy) with the interface signals
            return [...INTERFACES[ iface ].signals ];
        }
        // of ALL ACTIVE INTERFACES
        else return [...INTERFACES_SIGNALS];
    },


    /************************************************************************
     * 
     * BUTTONS & MAPPINGS
     * 
     * User must declare the virtual buttons its game is gonna need. This virtual
     * buttons are going to be activated/deactivated throught Interface signals. 
     * The relation betwen the Interfaces signals and the user virtual buttons is set 
     * usign mappings. This collection of methods allows the user to declare
     * buttons, set interface signal mappings, and retrieve the status of the
     * virtual buttons.
     * 
     ***********************************************************************/

    /**
     * registerButton() : Registers a virtual button with a unique id
     */
    registerButton( vButton ){
        if( typeof vButton !== 'string' || !vButton.trim().length ) throw new Error('Button identifier must be a valid string');
        // if button is already registered return false
        if( VIRTUAL_BUTTONS_STATE.hasOwnProperty( vButton ) ) return false;
        // else register the new button
        VIRTUAL_BUTTONS_STATE[ vButton ] = false;
        // done!
        return true;
    },

    /**
     * setButtonMapping() : Assigns to a button an Interface signal that will
     *                      activate it
     */
    setButtonMapping( interfaceSignal, vButton ){
        // error if requested game button does not exist
        if( !VIRTUAL_BUTTONS_STATE.hasOwnProperty( vButton ) ){ 
            throw new Error('Button "'+vButton+'" has not been registered');
        }
        // error if interfaceSignal does not exist
        if( INTERFACES_SIGNALS.indexOf( interfaceSignal ) === -1 ){
            throw new Error('Interface Signal "'+interfaceSignal+'" does not exist');
        }
        INTERFACES_BUTTONS_MAPPINGS[ interfaceSignal ] = vButton;
        return true;
    },

    /**
     * getButtonsMapping() : Returns an object (copy) containing the 
     *                       signal-vbuttons mapppings
     */
    getButtonsMapping(){
        //
        return {...INTERFACES_BUTTONS_MAPPINGS};
    },

    /**
     * hasButtonStateChanged() : Returns a boolean indicating if the requested vButton
     *                           state has changed since last frame. Is usefull to check
     *                           input events that happened in the current frame.
     */
    hasButtonStateChanged( vButton ){
        if( VIRTUAL_BUTTONS_STATE[ vButton ] === VIRTUAL_BUTTONS_OLD_STATE[ vButton ] ) return false;
        else return true;
    },

    /**
     * getStatus() : Returns an object containing the list of virtual buttons and 
     *               their state 
     */
    getStatus(){ 
        // return a clone of the current state garantees it can be 
        // stored by the user without being altered when new input events happen
        return {...VIRTUAL_BUTTONS_STATE}; 
        // ...eventually deep clone ... unnecessary rignt now ( no nested objects )
        // return JSON.parse( JSON.serialize( VIRTUAL_BUTTONS_STATE ) ); 
    }
};




