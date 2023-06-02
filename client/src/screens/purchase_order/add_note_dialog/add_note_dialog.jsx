import React, { Component } from 'react';
import { Dialog, TextField } from '@material-ui/core';
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import { DatePicker } from '@material-ui/pickers';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';

export default class add_note_dialog extends Component {
  render() {
    const { open, onClose, purchaseOrderNote, handleNoteChange, reminderDate, handleDateChange, updateNote } =
      this.props;
    return (
      <Dialog open={open} onClose={onClose}>
        <div style={{ padding: '10px 50px' }}>
          <TextField
            label="Note"
            id="notes"
            fullWidth
            style={{ border: '1px solid black' }}
            inputProps={{
              value: purchaseOrderNote,
              type: 'text',
              onChange: handleNoteChange,
            }}
            multiline
            rows={4}
          />
          <DatePicker
            style={{ marginTop: 30, width: '100%' }}
            label="Reminder Date"
            leftArrowIcon={<NavigateBefore />}
            rightArrowIcon={<NavigateNext />}
            value={reminderDate}
            format="MMMM Do YYYY"
            disablePast={false}
            onChange={handleDateChange}
          />
          <Button
            onClick={() => {
              updateNote();
            }}
          >
            Save
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </Dialog>
    );
  }
}
