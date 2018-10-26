var fs = require('fs');
var spawn = require('child_process').spawn;

function Proccess(state, controls){
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
    }

    this.stop = () => {
        if(proc){
            proc.kill();
        }
        isRunning = false;
        procReady = false;
    }

    this.isProccessRunning = () => {
        return isRunning;
    }

    this.isProccessReady = () => {
        return (!isRunning)? false:procReady;
    }

    // use the emitter 
    triggerProccessEvent = (msg, wparam) => {
        spawn(`${__dirname}\\..\\exe\\EventEmitter.exe`, [proc.pid, msg, wparam]);
    }

    this.simulateKeyPress = async (key) => {
        triggerProccessEvent(WM.KEYDOWN, VK[key]);
        setTimeout(() => {
            triggerProccessEvent(WM.KEYUP, VK[key]);
        } , 100)
    }
    

    this.selectRom = (path) => {
        romPath = path;
        state.set("romPath", path);
    }

    this.getSelectedRom = () => {
        return typeof(romPath) === "undefined"? "":romPath;
    }

    // get the list of all roms 
    this.getRomsForUI = () => {
        let roms = [];
        fs.readdirSync(`${__dirname}/../roms/`).forEach(file => {
            roms.push(file);
        })
        return roms;
    }
}

module.exports = Proccess;