import React, { Component } from 'react';
import {Grid, Cell} from 'styled-css-grid';
import {Alignment, Switch, Icon} from '@blueprintjs/core';

class ControlMap extends Component{

    constructor(props){
        super();

        this.state = {
            id:props.id,
            virtKey:props.virtKey,
            enabled:props.enabled,
            command:props.command,
            notifyEnabledChange:props.onEnabledChange,
            notifyDelete:props.onDelete
        }
    }

    componentWillReceiveProps(props){
        this.setState({
            id:props.id,
            virtKey:props.virtKey,
            enabled:props.enabled,
            command:props.command,
            notifyEnabledChange:props.onEnabledChange,
            notifyDelete:props.onDelete
        });
    }

    handleEnabledChange(state){
        if(this.state.notifyEnabledChange){
            this.state.notifyEnabledChange(this.state.id, !this.state.enabled);
        }
    }

    handleDeleteClicked(){
        if(this.state.notifyDelete){
            this.state.notifyDelete(this.state.id);
        }
    }


    render(){
        return (
            <Grid key={this.state.id} columns={24} className="row">
                <Cell width={12}>
                    <span>{this.state.command}</span>
                </Cell>
                <Cell width={8}>
                    <span>{this.state.virtKey}</span>
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
                    <Icon icon="cross" title="Delete Control" onClick={this.handleDeleteClicked.bind(this)} />
                </Cell>
            </Grid>
        )
    }
}

export default ControlMap;