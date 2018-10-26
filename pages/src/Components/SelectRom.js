import React, { Component } from 'react';
import {Spinner, Alignment, Switch} from '@blueprintjs/core';
import Axios from 'axios';

class SelectRom extends Component{

    /* @todo switch loading on */
    constructor(props){
        super();
        this.state = {
            loading:true,
            roms:[],
            selectedRom:"",
            running:props.running
        }
    }

    componentWillReceiveProps(props){
        if(props.running != this.state.running){
            this.setState({running:props.running});
        }
    }

    componentDidMount(){
        Axios.get('http://localhost:8000/LetsPlaySNES/roms.json',{
            withCredentials:true
        }).then(response => {
            this.setState({roms:response.data});

            Axios.get('http://localhost:8000/LetsPlaySNES/currentRom.json',{
                withCredentials:true
            }).then(resp => {
                this.setState({selectedRom:resp.data, loading:false});
            });

        })
    }

    handleSelectChange(evt){
        Axios.post('http://localhost:8000/LetsPlaySNES/currentRom.json',{
            selectedRom:evt.target.value
        },{
            withCredentials:true
        }).then(resp => {
            this.setState({selectedRom:resp.data, loading:false});
        });
    }

    render(){
        if(this.state.loading){
            return <Spinner size={50} />
        }

        return (
            <label className="bp3-control bp3-switch bp3-align-right">
                <span className="bp3-container-width">Select the rom to use.</span>
                <span className="bp3-select select-right-hand">
                    <select defaultValue={this.state.selectedRom} onChange={this.handleSelectChange.bind(this)} disabled={this.state.running}>
                        <option value=""> -- none -- </option>
                        {this.state.roms.map(name => {
                            return (<option key={name} value={name}>{name}</option>)
                        })}
                    </select>
                </span>
            </label>
        )
    }
}

export default SelectRom