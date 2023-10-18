class InputBuffer{

    #buffer = [];
    #isProcessing = false;
    #stopping = false;
    #process;

    constructor(process){
        this.#process = process;
    }

    addCommand = (command) => {
        this.#buffer.push(command);
    };

    Start = async () => {
        this.clearBuffer();
        this.#isProcessing = true;
        while(!this.#stopping){
            let cmd = this.#buffer.shift();
            await this.#process.simulateKeyPress(cmd);
        }
        this.#isProcessing = false;
    };

    Stop = () => {
        this.#stopping = true;
    };

    #sleep = (delayMS) => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, delayMS);
        });

    };

    hasStopped = async () => {
        while(this.#isProcessing){
            await this.#sleep(100);
        }
        return true;
    };

    clearBuffer = () => {
        this.#buffer = [];
    }
}

module.exports = InputBuffer;