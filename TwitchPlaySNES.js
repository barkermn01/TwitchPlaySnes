var fs = require('fs');
function LetsPlaySNES(accessors){
    // holds the current state
    this.state;
    this.procReady = false;

    this.process;
    this.controls;

    this.messageSender;

    this.inputBuffer;

    /* Allow this application to store state */
    this.getSavedState = (state) => {
        let Process = require("./lib/Process");
        let Controls = require("./lib/Controls");
        let InputBuffer = require("./lib/InputBuffer");

        this.controls = new Controls(state);
        this.process = new Process(state, this.controls);
        this.inputBuffer = new InputBuffer(this.process);
    }

    /* handle reading all messages */
    this.registerTwitchMessageHandler = (handler) => {
        handler((msg) => {
            clearInterval(this.timer);
            this.timer = setInterval(inactiveNotify, 120000);

            if(msg.mod || msg.username.toLowerCase() === accessors.config.get("Twitch").channelName.toLowerCase()){
                if(isModCommand(msg)) return;
            }

            if(msg.username.toLowerCase() !== accessors.config.get("Twitch").username){
                msg.message.split(" ").forEach(element => {
                    let command = this.controls.getKeyForCommand(element);
                    if(command){
                        this.inputBuffer.addCommand(command);
                    }
                });
            }
        });
    }

    this.registerTwitchMessageSender = (messageSender) => {
        this.messageSender = messageSender;
    }

    let getRandomInt = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    let keepAliveMessages = [
        "Hey Chat you there?", 
        "Why not send a command like !up", 
        "Hello, i can't play that game without you.", 
        "Well 2 Mins without anyone playing, the game is feeling left out.",
        "Are you feeling down why not play?",
        "Wonder what the Konami Code does in this game?",
        "!up in the clouds why don't you come !down and play?"
    ];
    let lassMessgae = null;

    let inactiveNotify = () => {
        if(this.messageSender !== undefined && this.controls !== undefined){
            let rand = null
            while(lassMessgae === rand){
                rand = getRandomInt(0, keepAliveMessages.length-1);
            }
            if(this.controls.getEnabledState()){
                this.messageSender(keepAliveMessages[rand]);
            }
            
        }
    };

    let mod_commands = {
        "!reset": (args) => { this.messageSender("Sorry but the !rest command is not ready yet."); return true;},
        "!add_input": (args) => { this.messageSender("Sorry but the !add_input command is not ready yet."); return true; },
        "!del_input": (args) => { this.messageSender("Sorry but the !del_input command is not ready yet."); return true; },
        "!list_games": (args) => { this.messageSender("Sorry but the !list_games command is not ready yet."); return true; },
        "!set_game": (args) => { this.messageSender("Sorry but the !set_game command is not ready yet."); return true; },

        "!disable": (args) => { 
            if(!this.process.isProcessRunning()){
                this.messageSender(`@${msg.username} Snes9x is not running controls are not available.`);
                return true;
            }
            if(!this.process.isProcessReady()){
                this.messageSender(`@${msg.username} Snes9x is not ready controls are not available.`); return true;
            }
            if(this.controls.getEnabledState()){
                this.controls.disable();
                this.inputBuffer.Stop();
                this.messageSender("Sorry TwitchPlays Controls have been disabled.");
                return true;
            }
        },

        "!enable": (args, msg) => { 
            if(!this.process.isProcessRunning()){
                this.messageSender(`@${msg.username} Snes9x is not running yet please !start it and wait a few seconds before enabling the controls.`);
                return true;
            }
            if(!this.process.isProcessReady()){
                this.messageSender(`@${msg.username} Snes9x is not ready yet please wait a few seconds before enabling the controls.`);
                return true;
            }
            if(!this.controls.getEnabledState()){
                this.controls.enable();
                this.inputBuffer.Start();
                this.messageSender("TwitchPlays Controls have been activated have fun!");
                return true;
            }
        },

        "!exit": (args, msg) => { 
            if(!this.process.isProcessRunning()){
                this.messageSender(`@${msg.username} Snes9x is not running`);
                return true;
            }
            this.process.stop();
            this.messageSender("Snes9x has been exited successfully");
            return true;
        },

        "!start": (args, msg) => { 
            if(this.process.isProcessRunning()){
                this.messageSender(`@${msg.username} Snes9x is already running`);
                return true;
            }
            this.process.start();
            this.messageSender("Snes9x has been started successfully");
            return true;
        },

        "!save_state": (args, msg) => { 
            if(typeof args[1] === "undefined" || !( parseInt(args[1]) >= 1 && parseInt(args[1]) <= 9 )){
                this.messageSender(`@${msg.username} please supply a slot between 1 and 9 to save into`); 
                return true;
            }
            let name = "F1" + args[1];
            this.process.simulateKeyPress(name);
            this.messageSender("State saved to slot "+args[1]);
            return true;
        },

        "!load_state":  (args, msg) => { 
            if(typeof args[1] === "undefined" || !(parseInt(args[1]) >= 1 && parseInt(args[1]) <= 9 )){
                this.messageSender(`@${msg.username} please supply a slot between 1 and 9 to load from`); 
                return true;
            }
            let name = "F" + args[1];
            this.process.simulateKeyPress(name);
            this.messageSender("State Loaded from slot "+args[1]);
            return true;
        },

        "!help":  (args, msg) => { 
            if(typeof args[1] === "undefined"){
                this.messageSender(`@${msg.username} commands you can use !help <command>, !disable, !enable, !exit, !start, !save_state <number between 1 and 9>, , !load_state <number between 1 and 9>`); 
                return true;
            }else{
                switch(args[1]){
                    case "!disable":
                        this.messageSender(`@${msg.username} stops the bot accepting input from chat`);
                    return true;
                    case "!enabled":
                        this.messageSender(`@${msg.username} allows the bot to accept input from chat`);
                    return true;
                    case "!exit":
                        this.messageSender(`@${msg.username} exits the emulator`);
                    return true;
                    case "!start":
                        this.messageSender(`@${msg.username} starts the emulator`);
                    return true;
                    case "!save_state":
                        this.messageSender(`@${msg.username} takes argument a number between 1 and 9 tells the emulator to save the state in slot 1 to 9 based on input`);
                    return true;
                    case "!load_state":
                        this.messageSender(`@${msg.username} takes argument a number between 1 and 9tells the emulator to load the state in slot 1 to 9 based on input`);
                    return true;
                    default:
                        this.messageSender(`@${msg.username} commands you can use !help <command>, !disable, !enable, !exit, !start, !save_state <number between 1 and 9>, , !load_state <number between 1 and 9>`); 
                    return true;
                }
            }
        }
    };

    let isModCommand = (msg) => {
        let text = msg.message;
        let args = text.split(" ");
        cmd = args[0];
        if(typeof mod_commands[cmd] !== "undefined"){
            let state = false;
            new Promise((resolve) =>{
                 state = mod_commands[cmd](args, msg)?true:false;
                resolve(state);
            });
            return state;
        }
        return false;
    };

    this.timer = setInterval(inactiveNotify, 120000);
    
    this.registerWebHandlers = (WebServerHandlerRegistration) => {

        // handle static pages
        WebServerHandlerRegistration(new RegExp("LetsPlaySNES\/.*"), (req) => {
            return new Promise((resolve, reject) =>{
                try{
                    let url = require('url').parse(req.url);
                    let path = url.pathname.replace("/LetsPlaySNES/", "");
                    if(path === ""){ path = "index.html"; }
                    if(!fs.existsSync(`${__dirname}\\pages\\build\\${path}`)){
                        resolve({
                            "status":404,
                            "headers":{"content-type":"text/html"},
                            "body":"<!DOCTYPE html><html><body><h1>404 File not found.</h1></body></html>"
                        })
                    }else{
                        fs.readFile(`${__dirname}/pages/build/${path}`, (err, data) => {
                            if(err){ reject(err.message); }
                            resolve({
                                "status":200,
                                "headers":{"content-type":require('mime-types').lookup(`${__dirname}/pages/build/${url.pathname}`)},
                                "body":data
                            });
                        });
                    }
                }catch(err){
                    reject(err);
                }
            })
        });

        // handle getting the list of roms
        WebServerHandlerRegistration(new RegExp("LetsPlaySNES\/roms.json"), (req) => {
            return new Promise((s,f) => {
                s({
                    "status":200,
                    "headers":{"content-type":"application/json"},
                    "body":JSON.stringify(this.process.getRomsForUI())
                });
            });
        });

        // handle getting or setting the currently selected rom
        WebServerHandlerRegistration(new RegExp("LetsPlaySNES\/currentRom.json"), (req) => {
            return new Promise((s,f) => {
                if(req.method === "POST"){
                    req.setEncoding('utf8');
                    req.on('data', (body) => {
                        let data = JSON.parse(body);
                        this.process.selectRom(data.selectedRom);
                        s({
                            "status":200,
                            "headers":{"content-type":"application/json"},
                            "body":JSON.stringify(this.process.getSelectedRom())
                        });
                    });
                }else{
                    s({
                        "status":200,
                        "headers":{"content-type":"application/json"},
                        "body":JSON.stringify(this.process.getSelectedRom())
                    });
                }
            });
        });
        

        // handle starting
        WebServerHandlerRegistration(new RegExp("LetsPlaySNES\/start"), (req) => {
            return new Promise((s,f) => {
                this.process.start();
                s({
                    "status":200,
                    "headers":{"content-type":"text/plain"},
                    "body":"success"
                });
            });
        });

        // handle stopping
        WebServerHandlerRegistration(new RegExp("LetsPlaySNES\/stop"), (req) => {
            return new Promise((s,f) => {
                this.process.stop();
                this.controls.disable();
                s({
                    "status":200,
                    "headers":{"content-type":"text/plain"},
                    "body":"success"
                });
            });
        });

        // handle stopping
        WebServerHandlerRegistration(new RegExp("LetsPlaySNES\/status.json"), (req) => {
            return new Promise((s,f) => {
                s({
                    "status":200,
                    "headers":{"content-type":"application/json"},
                    "body":JSON.stringify({running:this.process.isProcessRunning(), ready:this.process.isProcessReady(), controls:this.controls.getEnabledState()})
                });
            });
        });

        // get a list of bound controls
        WebServerHandlerRegistration(new RegExp("LetsPlaySNES\/controls.json"), (req) => {
            return new Promise((s,f) => {
                s({
                    "status":200,
                    "headers":{"content-type":"application/json"},
                    "body":JSON.stringify(this.controls.getKeysForUI())
                });
            });
        });

        // add a control
        WebServerHandlerRegistration(new RegExp("LetsPlaySNES\/addControl.json"), (req) => {
            return new Promise((s,f) => {
                if(req.method === "POST"){
                    req.setEncoding('utf8');
                    req.on('data', (body) => {
                        let data = JSON.parse(body);
                        this.controls.addControl(data.command, data.key, data.enabled);
                        s({
                            "status":200,
                            "headers":{"content-type":"application/json"},
                            "body":JSON.stringify("success"),
                        });
                    });
                }else{
                    f("Not allowed to do that.")
                }
            });
        });

        // remove a control
        WebServerHandlerRegistration(new RegExp("LetsPlaySNES\/removeControl.json"), (req) => {
            return new Promise((s,f) => {
                if(req.method === "POST"){
                    req.setEncoding('utf8');
                    req.on('data', (body) => {
                        let data = JSON.parse(body);
                        this.controls.rmControl(data.command);
                        s({
                            "status":200,
                            "headers":{"content-type":"application/json"},
                            "body":JSON.stringify("success")
                        });
                    });
                }else{
                    f("Not allowed to do that.")
                }
            });
        });

        // toggle a control
        WebServerHandlerRegistration(new RegExp("LetsPlaySNES\/toggleControl.json"), (req) => {
            return new Promise((s,f) => {
                if(req.method === "POST"){
                    req.setEncoding('utf8');
                    req.on('data', (body) => {
                        let data = JSON.parse(body);
                        this.controls.toggleControl(data.command);
                        s({
                            "status":200,
                            "headers":{"content-type":"application/json"},
                            "body":JSON.stringify("success")
                        });
                    });
                }else{
                    f("Not allowed to do that.")
                }
            });
        });

        // toggle a controls allowed
        WebServerHandlerRegistration(new RegExp("LetsPlaySNES\/toggleControls.json"), (req) => {
            return new Promise((s,f) => {
                this.controls.toggleEnabled();
                if(this.controls.getEnabledState()){
                    this.messageSender("TwitchPlays Controls have been activated have fun!");
                    this.inputBuffer.Start();
                }else{
                    this.messageSender("Sorry TwitchPlays Controls have been disabled.");
                    this.inputBuffer.Stop();
                }
                s({
                    "status":200,
                    "headers":{"content-type":"application/json"},
                    "body":JSON.stringify("success")
                });
            });
        });
    }

    // create the web server handlers
    this.registerWebNavHandler = (registerMenuLink) => {
        registerMenuLink("/LetsPlaySNES/");
    }

    this.unload = () => {
        this.process.stop();

    }

    this.init = () => {
        let path = '\\roms\\'+this.getRom("LoZ-LTTP.smc");
        this.getRomList();
    }
}

module.exports = LetsPlaySNES;