var fs = require('fs');
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
            let command = this.controls.getKeyForCommand(msg.message.split(" ")[0].toLowerCase());
            if(command){
                this.proccess.simulateKeyPress(command);
            }
        });
    }

    this.registerTwitchMessageSender = (messageSender) => {
        this.messageSender = messageSender;
    }
    
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
                    this.messageSender("TwitchPlay Controls have been abled have fun!", err => { console.log(err); });
                }else{
                    this.messageSender("Sorry TwitchPlay Controls have been disabled.", err => { console.log(err); });
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