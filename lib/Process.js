var fs = require('fs');
var spawn = require('child_process').spawn;

function Process(state, controls){
    let proc;
    let isRunning = false;
    let procReady = false;
    let romPath = state.get("romPath");

    // holds the Virtual Key mapping for a keyboard
    const VK = require("./KeyMap");
    
    // holds the opcodes for the event emitter
    const WM = require("./Opcodes");

    this.start = () => {
        proc = spawn(`${__dirname}\\..\\exe\\snes9x-x64.exe`,  ['-m', '9', '-hi', '-scale', `${__dirname}/../roms/${romPath}`]); 
        isRunning = true;

        proc.on('exit', () => {
            isRunning = false;
            controls.disable();
        });

        setTimeout(() =>{
            procReady = true;
        }, 10000);
    };

    this.stop = () => {
        if(proc){
            proc.kill();
        }
        isRunning = false;
        procReady = false;
    };

    this.isProcessRunning = () => {
        return isRunning;
    };

    this.isProcessReady = () => {
        return (!isRunning)? false:procReady;
    };

    // use the emitter 
    triggerProcessEvent = (msg, wparam) => {
        spawn(`${__dirname}\\..\\exe\\EventEmitter.exe`, [proc.pid, msg, wparam]);
    };

    this.simulateKeyPress = (key) => {
        return new Promise((resolve) => {
            triggerProcessEvent(WM.KEYDOWN, VK[key]);
            setTimeout(() => {
                triggerProcessEvent(WM.KEYUP, VK[key]);      
                resolve();
            } , 100);
        });
    };

    this.ctrlKeyPress = async (key) => {
        triggerProcessEvent(WM.CONTROL_KEY, VK[key]);
    };

    this.keyPress = async (key) => {
        triggerProcessEvent(WM.KEY, VK[key]);
    };

    this.altKeyPress = async (key) => {
        triggerProcessEvent(WM.ALT_KEY, VK[key]);
    };

    this.shiftKeyPress = async (key) => {
        triggerProcessEvent(WM.SHIFT_KEY, VK[key]);
    };
    

    this.selectRom = (path) => {
        romPath = path;
        state.set("romPath", path);
    };

    this.getSelectedRom = () => {
        return typeof(romPath) === "undefined"? "":romPath;
    };

    // get the list of all roms 
    this.getRomsForUI = () => {
        let roms = [];
        fs.readdirSync(`${__dirname}/../roms/`).forEach(file => {
            roms.push(file);
        })
        return roms;
    };
}

module.exports = Process;