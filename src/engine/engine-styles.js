let styles       = document.createElement('style');
styles.innerHTML = `
    [hide-device-cursor]{ cursor : none !important; }
    
    [viewport-full-screen]{ 
        position: fixed !important;
        width: 100% !important;
        height: 100% !important;
        top: 0px !important;
        bottom: 0px !important; 
        display : block !important;
    }
`;

document.body.appendChild(styles);
