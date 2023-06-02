import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { notesStyles } from './notes.style';
import moment from 'moment';
// core components
import SweetAlert from 'react-bootstrap-sweetalert';
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import Card from '../../../components/material-dashboard/Card/Card';
import CardHeader from '../../../components/material-dashboard/Card/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import ReactTable from 'react-table';
// icons
import Print from '@material-ui/icons/Print';
import CircularProgress from '@material-ui/core/CircularProgress';

import { isUnloadedOrLoading } from '../../../utilities';
import { Link } from 'react-router-dom';

class Notes extends Component {
  state = { deleteDialog: null };
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
      Header: 'Reminder Date',
      show: true,
      accessor: 'remindAt',
    },
    {
      Header: 'Link',
      show: true,
      id: 'link',
      accessor: (d) => d,
      Cell: (props) => {
        const { link } = props.value;
        return (
          <Link to={link.link} className={this.props.classes.fullWidth}>
            {link.name}
          </Link>
        );
      },
    },
    {
      Header: 'Customer Name',
      show: true,
      accessor: 'customerName',
    },
    {
      Header: 'Note',
      show: true,
      accessor: 'note',
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
          <Button
            onClick={() => {
              this.deleteNote(noteId);
            }}
          >
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

    notes.forEach((note) => {
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
    const { deleteDialog } = this.state;
    if (this.isLoading) return <CircularProgress />;
    const rows = this.getNotesData();
    return (
      <div className={classes.root}>
        <div className={classes.title}>
          <h3>Notes Reporting</h3>
          <div className={classes.actions}>
            {/* <Button
            className={`${classes.pdfButton} hide-print`}
            color="info"
            onClick={this.savePageAsPdf}
          >
            Save as PDF
          </Button> */}
            <Button className="hide-print" onClick={this.print} color="info">
              <Print />
            </Button>
          </div>
        </div>
        <div className={classes.reportContainer}>
          <Card>
            <CardHeader>{/* <h4>Notes Report</h4> */}</CardHeader>
            <CardContent>
              <ReactTable data={rows} columns={this.headers} minRows={1} resizable={false} showPagination={false} />
            </CardContent>
          </Card>
        </div>
        {deleteDialog}
      </div>
    );
  }
}

export default withStyles(notesStyles)(Notes);
