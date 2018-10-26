import React, { Component } from 'react';
import {Grid, Cell} from 'styled-css-grid';
import {Spinner, Alignment, Switch} from '@blueprintjs/core';
import Axios from 'axios';
import SelectRom from './SelectRom';

class EmulatorState extends Component{

    /* @todo switch loading on */
    state = {
        loading:true,
        EmuState:false,
        EmuReady:false,
        inputState:false,
        timeout:null,
        currentRom:"",
    }

    componentDidMount(){       
        this.updateState();
    }

    updateState(){
        Axios.get('http://localhost:8000/LetsPlaySNES/status.json',{
            withCredentials:true
        }).then(response => {
            this.setState({
                EmuState:response.data.running, 
                EmuReady:response.data.ready, 
                inputState:response.data.controls, 
                currentRom:response.data.currentRom,
                loading:false
            });
        })
        this.setState({timeout:setTimeout(() =>{
            this.updateState();
        }, 5000)});
    }

    componentWillUnmount(){
        clearTimeout(this.state.interval);
    }

    handleEmuStateChange(evt){
        let startStop = this.state.EmuState? "stop":"start";
        Axios.get(`http://localhost:8000/LetsPlaySNES/${startStop}`,{
            withCredentials:true
        }).then(response => {
            this.updateState();
        });
    }

    handleInputChange(evt){
        Axios.get(`http://localhost:8000/LetsPlaySNES/toggleControls.json`,{
            withCredentials:true
        }).then(response => {
            this.updateState();
        });
    }

    handleRomChange(){
        this.updateState();
    }

    render(){
        if(this.state.loading){
            return <Spinner size={50} />
        }

        return (
            <div>
                <Switch 
                    checked={this.state.EmuState} 
                    alignIndicator={Alignment.RIGHT} 
                    labelElement={<span className="bp3-container-width">Emulator Running State</span>}
                    onChange={this.handleEmuStateChange.bind(this)}
                    disabled={this.state.currentRom === ""}
                />
                <Switch 
                    checked={this.state.EmuReady} 
                    alignIndicator={Alignment.RIGHT} 
                    labelElement={<span className="bp3-container-width">Is Emulator Ready</span>}
                    disabled
                />
                <Switch 
                    checked={this.state.inputState} 
                    alignIndicator={Alignment.RIGHT} 
                    labelElement={<span className="bp3-container-width">Allow chat to send commands to emulator.</span>}
                    onChange={this.handleInputChange.bind(this)} 
                    disabled={!this.state.EmuReady}
                />
                <SelectRom running={this.state.EmuState} onChange={this.handleRomChange.bind(this)}/>
            </div>
        )
    }
}

export default EmulatorState