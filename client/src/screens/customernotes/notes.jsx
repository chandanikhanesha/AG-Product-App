import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { notesStyles } from './notes.style';
import moment from 'moment';
// core components
import SweetAlert from 'react-bootstrap-sweetalert';
import Button from '../../components/material-dashboard/CustomButtons/Button';
import ReactTable from 'react-table';
import { DatePicker } from '@material-ui/pickers';
import TextField from '@material-ui/core/TextField';

// icons
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';

import CircularProgress from '@material-ui/core/CircularProgress';

import { isUnloadedOrLoading } from '../../utilities';

class Notes extends Component {
  state = { deleteDialog: null, updateDialog: null, updateNoteTxt: '', updateNoteReminderDate: '', updateNoteId: '' };
  componentDidMount = () => {
    this.props.listNotes();
  };

  reload = async () => {
    await this.props.listNotes();
    this.setState({
      notes: this.props.notes,
    });
  };

  get isLoading() {
    const { isOnline, notesStatus } = this.props;
    return isOnline && [notesStatus].some(isUnloadedOrLoading);
  }

  headers = [
    // {
    //   Header: "ID",
    //   show: true,
    //   accessor: "noteId",
    // },
    {
      Header: 'Created',
      show: true,
      accessor: 'createdAt',
    },
    {
      Header: 'Reminder',
      show: true,
      accessor: 'remindAt',
    },
    {
      Header: 'Note',
      show: true,
      accessor: 'note',
    },
    {
      Header: 'Edit',
      show: true,
      id: 'Edit',
      headerStyle: { textAlign: 'left' },
      accessor: (d) => d,
      Cell: (props) => {
        const { noteId, note, remindAt } = props.value;
        return (
          <Button
            size="sm"
            onClick={() =>
              this.setState({
                updateDialog: true,
                updateNoteTxt: note,
                updateNoteReminderDate: remindAt,
                updateNoteId: noteId,
              })
            }
            startIcon={<EditIcon />}
          >
            Edit
          </Button>
        );
      },
    },
    {
      Header: 'Resolve',
      show: true,
      id: 'action',
      headerStyle: { textAlign: 'left' },
      accessor: (d) => d,
      Cell: (props) => {
        const { noteId } = props.value;
        return (
          <Button onClick={() => this.deleteNote(noteId)} startIcon={<DeleteIcon />} size="sm">
            Resolve
          </Button>
        );
      },
    },
  ];

  deleteNote = (noteId) => {
    const { classes, deleteNote } = this.props;
    this.setState({
      deleteDialog: (
        <SweetAlert
          warning
          showCancel
          title={`Delete Note #${noteId}`}
          onConfirm={async () => {
            await deleteNote(noteId);
            this.reload();
            this.setState({ deleteDialog: null });
          }}
          onCancel={() => {
            this.setState({
              deleteDialog: null,
            });
          }}
          confirmBtnCssClass={classes.button + ' ' + classes.success}
          cancelBtnCssClass={classes.button + ' ' + classes.danger}
        >
          Are you sure you want to delete this Note?
        </SweetAlert>
      ),
    });
  };

  getNotesData = () => {
    const { notes = [], customers, purchaseOrders } = this.props;
    let rows = [];

    notes
      .filter((c) => c.customerId === this.props.customerId)
      .forEach((note) => {
        if (note.relatedType === 'customer') {
          const customer = customers.find((_customer) => _customer.id === note.customerId);
          rows.push({
            createdAt: moment.utc(note.createdAt).format('MMMM DD, YYYY'),
            remindAt: note.reminderDate ? moment.utc(note.reminderDate).format('MMMM DD, YYYY') : '-',
            link: { link: '', name: customer.name },
            customerName: customer.name,
            note: note.note,
            noteId: note.id,
          });
        } else if (note.relatedType === 'purchase order') {
          const customer = customers.find((_customer) => _customer.id === note.customerId);
          const purchaseOrder = purchaseOrders.find((_purchaseOrder) => _purchaseOrder.id === note.purchaseOrderId);
          rows.push({
            createdAt: moment.utc(note.createdAt).format('MMMM DD, YYYY'),
            remindAt: note.reminderDate ? moment.utc(note.reminderDate).format('MMMM DD, YYYY') : '-',
            link: {
              link: `/app/customers/${customer.id}/${purchaseOrder.isQuote ? 'quote' : 'purchase_order'}/${
                purchaseOrder.id
              }`,
              name: `${purchaseOrder.isQuote ? 'Quote' : 'Purchase Order'} #${purchaseOrder.id} #${purchaseOrder.name}`,
            },
            customerName: customer.name,
            note: note.note,
            noteId: note.id,
          });
        }
      });
    return rows;
  };

  print = () => {
    setTimeout(() => {
      window.print();
    }, 500);
  };

  render() {
    const { classes } = this.props;
    const { deleteDialog, updateDialog, updateNoteTxt, updateNoteId, updateNoteReminderDate } = this.state;
    if (this.isLoading) return <CircularProgress />;
    const rows = this.getNotesData();

    return (
      <div className={classes.reportContainer}>
        <ReactTable data={rows} columns={this.headers} minRows={1} resizable={false} showPagination={false} />
        {deleteDialog}
        {updateDialog && (
          <SweetAlert
            showCancel
            title="Update Note"
            onConfirm={async () => {
              await this.props.updateNote(updateNoteId, {
                note: updateNoteTxt,
                reminderDate: updateNoteReminderDate,
              });
              this.reload();
              this.setState({ updateDialog: null });
            }}
            onCancel={() =>
              this.setState({
                updateDialog: null,
              })
            }
            confirmBtnCssClass={classes.button + ' ' + classes.success}
            cancelBtnCssClass={classes.button + ' ' + classes.danger}
          >
            <TextField
              label="Note"
              fullWidth
              value={updateNoteTxt}
              onChange={(e) => this.setState({ updateNoteTxt: e.target.value })}
              multiline
              rows={4}
            />
            <div style={{ marginBottom: '15px' }} />
            <DatePicker
              className={classes.datePicker}
              label="Reminder Date"
              style={{ width: '100%', padding: 0 }}
              leftArrowIcon={<NavigateBefore />}
              rightArrowIcon={<NavigateNext />}
              value={updateNoteReminderDate}
              format="MMMM Do YYYY"
              disablePast={false}
              onChange={(date) =>
                this.setState({ updateNoteReminderDate: moment.utc(date).format('YYYY-MM-DD') + 'T00:00:00.000Z' })
              }
            />
          </SweetAlert>
        )}
      </div>
    );
  }
}

export default withStyles(notesStyles)(Notes);
