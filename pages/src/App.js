import React, { Component } from 'react';
import EmulatorState from './Components/EmulatorState'
import ControlMapping from './Components/ControlMapping'

class App extends Component {
  render() {
    return (
      <div className="bp3-body">
        <div className="bp3-container">
          <h2 className="bp3-heading">SNES Emulator Status</h2>
          <EmulatorState />
          <ControlMapping />
        </div>
      </div>
    );
  }
}

export default App;
