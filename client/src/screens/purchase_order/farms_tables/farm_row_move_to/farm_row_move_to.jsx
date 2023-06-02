import React, { Component } from 'react';
import { Dialog, Button, Select, MenuItem } from '@material-ui/core';

export default class MoveToFarm extends Component {
  state = {
    selectedFarmId: null,
  };

  componentDidMount = () => {
    const { farms, currentFarm } = this.props;
    const displayFarms = farms.filter((farm) => farm.id !== currentFarm.id);

    this.setState({
      selectedFarmId: displayFarms[0].id,
    });
  };

  render() {
    const { farms, currentFarm, onSave, onClose } = this.props;
    const displayFarms = farms.filter((farm) => farm.id !== currentFarm.id);
    const { selectedFarmId } = this.state;
    return (
      <Dialog open={true} onClose={onClose}>
        <div style={{ padding: 30 }}>
          <Select
            value={selectedFarmId}
            onChange={(event) => {
              this.setState({
                selectedFarmId: event.targe.value,
              });
            }}
          >
            {displayFarms.map((farm) => (
              <MenuItem key={farm.id} value={farm.id}>
                {farm.name}
              </MenuItem>
            ))}
          </Select>
        </div>

        <div
          style={{
            padding: 20,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
          }}
        >
          <Button varaint="contained" onClick={onClose}>
            Cancel
          </Button>
          <Button
            varaint="contained"
            color="primary"
            onClick={() => {
              onSave(this.state.selectedFarmId);
            }}
          >
            Confirm Move
          </Button>
        </div>
      </Dialog>
    );
  }
}
