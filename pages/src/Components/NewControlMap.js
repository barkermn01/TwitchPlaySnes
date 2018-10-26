import React, { Component } from 'react';
import {Grid, Cell} from 'styled-css-grid';
import {Alignment, Switch, Icon} from '@blueprintjs/core';

class NewControlMap extends Component{

    constructor(props){
        super();

        this.state = {
            showForm:false,
            id:props.id,
            notifySave:props.onSave,
            enabled:true,
            command:"",
            virtKey:"",
            keys:{
                BACK: "0x08",
                TAB: "0x09",
                CLEAR:"0x0C",
                RETURN:"0x0D",
                ESCAPE:"0x1B",
                SPACE:"0x20",
                PRIOR:"0x21",
                NEXT:"0x22",
                END:"0x23",
                HOME:"0x24",
                LEFT:"0x25",
                UP:"0x26",
                RIGHT:"0x27",
                DOWN:"0x28",
                SELECT:"0x29",
                PRINT:"0x2A",
                SNAPSHOT:"0x2C",
                INSERT:"0x2D",
                DELETE:"0x2E",
                "0":"0x30",
                "1":"0x31",
                "2":"0x32",
                "3":"0x33",
                "4":"0x34",
                "5":"0x35",
                "6":"0x36",
                "7":"0x37",
                "8":"0x38",
                "9":"0x39",
                A:"0x41",
                B:"0x42",
                C:"0x43",
                D:"0x44",
                E:"0x45",
                F:"0x46",
                G:"0x47",
                H:"0x48",
                I:"0x49",
                J:"0x4A",
                K:"0x4B",
                L:"0x4C",
                M:"0x4D",
                N:"0x4E",
                O:"0x4F",
                P:"0x50",
                Q:"0x51",
                R:"0x52",
                S:"0x53",
                T:"0x54",
                U:"0x55",
                V:"0x56",
                W:"0x57",
                X:"0x58",
                Y:"0x59",
                Z:"0x5A",
                NUBPAD0:"0x60",
                NUBPAD1:"0x61",
                NUBPAD2:"0x62",
                NUBPAD3:"0x63",
                NUBPAD4:"0x64",
                NUBPAD5:"0x65",
                NUBPAD6:"0x66",
                NUBPAD7:"0x67",
                NUBPAD8:"0x68",
                NUBPAD9:"0x69",
            }
        }
    }

    componentWillReceiveProps(props){
        this.setState({
            id:props.id,
            notifySave:props.onSave
        });
    }

    handleSaveClicked(){
        if(this.state.notifySave){
            this.state.notifySave(this.state.command, this.state.virtKey, this.state.enabled);
        }
        this.setState({showForm:false, enabled:true, command:"", virtKey:""});
    }

    enableForm(){
        this.setState({showForm:true})
    }

    disableForm(){
        this.setState({showForm:false})
    }

    handleEnabledChange(){
        this.setState({enabled:!this.state.enabled})
    }

    setCommand(evt){
        this.setState({command:evt.target.value});
    }

    virtKeyChanged(evt){
        this.setState({virtKey:evt.target.value});
    }

    render(){
        if(this.state.showForm){
            return (
                <Grid key={this.state.id} columns={24} className="row">
                    <Cell width={12}>
                        <input  className="bp3-input" type="text" value={this.state.command} onChange={this.setCommand.bind(this)} />
                    </Cell>
                    <Cell width={8}>
                        <div className="bp3-select">
                            <select defaultValue={this.state.virtKey} onChange={this.virtKeyChanged.bind(this)}>
                                <option value=""> -- none -- </option>
                                {Object.keys(this.state.keys).map((name, value) => {
                                    return (<option key={name} value={name}>{name}</option>)
                                })}
                            </select>
                        </div>
                    </Cell>
                    <Cell width={2} className="align-center">
                        <Switch 
                            checked={this.state.enabled} 
                            alignIndicator={Alignment.CENTER} 
                            labelElement={""}
                            onChange={this.handleEnabledChange.bind(this)} 
                        />
                    </Cell>
                    <Cell width={2} className="align-center">
                        <Icon icon="floppy-disk" title="Save Control" onClick={this.handleSaveClicked.bind(this)} />
                        <Icon icon="minus" onClick={this.disableForm.bind(this)}/>
                    </Cell>
                </Grid>
            )
        }else{
            return <Grid key={this.state.id} columns={24} className="row">
                <Cell width={22}>
                      &nbsp;  
                </Cell>
                <Cell width={2} className="align-center">
                    <span onClick={this.enableForm.bind(this)}><Icon icon="plus" /></span>
                </Cell>
            </Grid>
        }
    }
}

export default NewControlMap;