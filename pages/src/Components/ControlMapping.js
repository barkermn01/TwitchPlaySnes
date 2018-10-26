import React, { Component } from 'react';
import {Grid, Cell} from 'styled-css-grid';
import {Spinner, Alignment, Switch, Icon} from '@blueprintjs/core';
import ControlMap from './ControlMap';
import NewControlMap from './NewControlMap';
import Axios from 'axios';

class ControlMapping extends Component{

    /* @todo switch loading on */
    state = {
        loading:true,
        controls:[]
    }

    componentDidMount(){
        this.updateControls();
    }

    updateControls(){
        Axios.get('http://localhost:8000/LetsPlaySNES/controls.json',{
            withCredentials:true
        }).then(response => {
            this.setState({controls:response.data, loading:false});
        });
    }

    controlEnabledStateChanged(control_id){ 
        Axios.post('http://localhost:8000/LetsPlaySNES/toggleControl.json',{
            command:this.state.controls[control_id].command
        },{
            withCredentials:true
        }).then(() => {
            this.updateControls();
        });
    }

    controlDeleted(control_id){
        Axios.post('http://localhost:8000/LetsPlaySNES/removeControl.json',{
            command:this.state.controls[control_id].command
        },{
            withCredentials:true
        }).then(() => {
            this.updateControls();
        });
    }

    addControl(command, virtKey, enabled) {
        Axios.post('http://localhost:8000/LetsPlaySNES/addControl.json',{
            command:command,
            key:virtKey,
            enabled:enabled
        },{
            withCredentials:true
        }).then(() => {
            this.updateControls();
        });
    }

    render(){
        if(this.state.loading){
            return <Spinner size={50} />
        }

        return (
            <div className="controls">
                <h3>Emulator Virtal Key Mappings</h3>
                <Grid columns={24} className="headings">
                    <Cell width={12}>
                        <span>Command</span>
                    </Cell>
                    <Cell width={8}>
                        <span>Virtal Key</span>
                    </Cell>
                    <Cell width={2} className="align-center">
                        <span>Enabled</span>
                    </Cell>
                    <Cell width={2} className="align-center">
                        <span>Delete</span>
                    </Cell>
                </Grid>
                {this.state.controls.map((binding, idx) => {
                    return <ControlMap 
                        key={idx}
                        id={idx}
                        enabled={binding.enabled} 
                        virtKey={binding.key} 
                        command={binding.command}
                        onEnabledChange={this.controlEnabledStateChanged.bind(this)}
                        onDelete={this.controlDeleted.bind(this)}
                    />
                })}
                <NewControlMap onSave={this.addControl.bind(this)} />
            </div>
        )
    }
}

export default ControlMapping