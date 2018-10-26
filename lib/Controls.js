function Controls(state){
    let Controls = state.get("controls", {});
    let enabled = false;

    function isEmpty(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    this.addControl= (command, key, enabled) => {
        Controls[command.toLowerCase()] = {
            "enabled":enabled,
            "key":key
        }
        state.set("controls", Controls);
    }

    this.toggleControl = (command) => {
        Controls[command].enabled = !Controls[command].enabled;
        state.set("controls", Controls);
    }

    this.rmControl= (command) => {
        delete Controls[command];
        state.set("controls", Controls);
    }

    this.getKeyForCommand = (command) => {
        if(typeof Controls[command] == "object" && Controls[command].enabled && enabled){
            return Controls[command].key;
        }
        return false;
    }

    this.getKeysForUI = () => {
        let ret = [];
        if(!isEmpty(Controls)){
            Object.keys(Controls).forEach(cmd => {
                let val = Controls[cmd];
                ret.push({
                    command:cmd,
                    key:val.key,
                    enabled:val.enabled
                });
            });
        }
        return ret;
    }

    this.getEnabledState = () => {
        return enabled;
    }

    this.disable = () => {
        enabled = false;
        return enabled;
    }

    this.toggleEnabled =  () => {
        enabled = !enabled;
        return enabled;
    }
}

module.exports = Controls;