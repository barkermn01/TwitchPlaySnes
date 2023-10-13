var fs = require('fs');
const KeyMap = require('./lib/KeyMap');
function LetsPlaySNES(accessors){
    // holds the current state
    this.state;
    this.procReady = false;

    this.proccess;
    this.controls;

    this.messageSender;

    /* Allow this application to store state */
    this.getSavedState = (state) => {
        let Proccess = require("./lib/Proccess");
        let Controls = require("./lib/Controls");

        this.controls = new Controls(state);
        this.proccess = new Proccess(state, this.controls);
    }

    /* handle reading all messages */
    this.registerTwitchMessageHandler = (handler) => {
        handler((msg) => {

            if(msg.channel.toLowerCase().substr(1, msg.channel.toLowerCase().length) !== msg.username.toLowerCase()){
                clearInterval(this.timer);
                this.timer = setInterval(inactiveNotify, 120000);

                let handled = false;

                if(msg.user_type === "mod"){
                    handled = isModCommand(msg);
                }

                msg.message.split(" ").forEach(element => {
                    let command = this.controls.getKeyForCommand(element);
                    if(command){
                        this.proccess.simulateKeyPress(command);
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
        "!reset": (args) => { this.messageSender("Sorry but the !rest command is not ready yet."); },
        
        "!disable": (args) => { 
            if(this.controls.getEnabledState()){
                this.controls.disable();
                this.messageSender("Sorry TwitchPlays Controls have been disabled.");
            }
        },

        "!enable": (args) => { 
            if(!this.controls.getEnabledState()){
                this.controls.enable();
                this.messageSender("TwitchPlays Controls have been activated have fun!");
            }
        },

        "!add_input": (args) => { this.messageSender("Sorry but the !add_input command is not ready yet."); },
        "!del_input": (args) => { this.messageSender("Sorry but the !del_input command is not ready yet."); },
        "!list_games": (args) => { this.messageSender("Sorry but the !list_games command is not ready yet."); },

        "!exit": (args) => { 
            if(!this.proccess.isProccessRunning()){
                this.messageSender(`@${msg.username} Snes9x is not running`); 
            }
            this.proccess.stop();
            this.messageSender("Snes9x has been exited successfully");
        },
        "!set_game": (args) => { this.messageSender("Sorry but the !set_game command is not ready yet."); },

        "!start": (args) => { 
            if(!this.proccess.isProccessRunning()){
                this.messageSender(`@${msg.username} Snes9x is already running`); 
            }
            this.proccess.start();
            this.messageSender("Snes9x has been started successfully");
        },

        "!save_state": (args) => { 
            if(typeof args[1] !== "undefined" && parseInt(args[1]) >= 1 && parseInt(args[1]) <= 9 ){
                this.messageSender(`@${msg.username} please supply a slot between 1 and 9 to save into`); 
                return;
            }
            let name = "FUNCTION" + args[1];
            this.proccess.shiftKeyPress(KeyMap[name]);
            this.messageSender("State saved to slot 1"); 
        },

        "!load_state":  (args) => { 
            if(typeof args[1] !== "undefined" && parseInt(args[1]) >= 1 && parseInt(args[1]) <= 9 ){
                this.messageSender(`@${msg.username} please supply a slot between 1 and 9 to load from`); 
                return;
            }
            let name = "FUNCTION" + args[1];
            this.proccess.KeyPress(KeyMap[name]);
            this.messageSender("State saved to slot 1"); 
            }
    };

    let isModCommand = (msg) => {
        let text = msg.message;
        let words = text.split(" ");
        cmd = words[0];
        if(typeof mod_commands[cmd] !== "undefined"){
            new Promise((resolve) =>{
                mod_commands[cmd](args);
                resolve(true);
            });
            return true;
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
                    "body":JSON.stringify(this.proccess.getRomsForUI())
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
                        this.proccess.selectRom(data.selectedRom);
                        s({
                            "status":200,
                            "headers":{"content-type":"application/json"},
                            "body":JSON.stringify(this.proccess.getSelectedRom())
                        });
                    });
                }else{
                    s({
                        "status":200,
                        "headers":{"content-type":"application/json"},
                        "body":JSON.stringify(this.proccess.getSelectedRom())
                    });
                }
            });
        });
        

        // handle starting
        WebServerHandlerRegistration(new RegExp("LetsPlaySNES\/start"), (req) => {
            return new Promise((s,f) => {
                this.proccess.start();
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
                this.proccess.stop();
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
                    "body":JSON.stringify({running:this.proccess.isProccessRunning(), ready:this.proccess.isProccessReady(), controls:this.controls.getEnabledState()})
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
                }else{
                    this.messageSender("Sorry TwitchPlays Controls have been disabled.");
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
        this.terminateProc();
    }

    this.init = () => {
        let path = '\\roms\\'+this.getRom("LoZ-LTTP.smc");
        this.getRomList();
    }
}

module.exports = LetsPlaySNES;