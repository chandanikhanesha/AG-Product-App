import React, { Component } from 'react';

// material ui components
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

class AddExistingFarmDialog extends Component {
  state = {
    farmId: '',
  };

  addExistingFarm = () => {
    const { addExistingFarm } = this.props;
    const { farmId } = this.state;
    if (!farmId) return;

    addExistingFarm(farmId);

    this.setState({
      farmId: '',
    });
  };

  render() {
    const { showAddExistingFarm, cancelShowAddExistingFarm, farms } = this.props;
    const { farmId } = this.state;

    const purchaseOrder = this.props.items.find((po) => `${po.id}` === `${this.props.match.params.id}`);
    const existingFarmIds = (purchaseOrder.farmData || []).map((d) => d.farmId);
    const farmsNotInPurchaseOrder = farms.filter((farm) => !existingFarmIds.includes(farm.id));

    return (
      <Dialog open={showAddExistingFarm}>
        <DialogTitle>Add Farm</DialogTitle>

        <DialogContent>
          <Select value={farmId} onChange={(e) => this.setState({ farmId: parseInt(e.target.value, 0) })}>
            {farmsNotInPurchaseOrder.map((farm) => {
              return (
                <MenuItem value={farm.id} key={farm.id}>
                  {farm.name}
                </MenuItem>
              );
            })}
          </Select>
        </DialogContent>

        <DialogActions>
          <Button onClick={cancelShowAddExistingFarm} color="primary">
            Cancel
          </Button>
          <Button onClick={this.addExistingFarm} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default AddExistingFarmDialog;
