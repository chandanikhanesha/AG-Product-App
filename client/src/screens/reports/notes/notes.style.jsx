import sweetAlertStyle from '../../../assets/jss/material-dashboard-pro-react/views/sweetAlertStyle';

export const notesStyles = (theme) =>
  Object.assign({}, sweetAlertStyle, {
    root: {
      marginTop: 0,
      marginBottom: 40,
    },
    title: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    actions: {
      marginRight: 0,
      marginLeft: 'auto',
      float: 'right',
    },
    pdfButton: {
      marginRight: 15,
    },
    // reportContainer: {
    //   marginTop: 90,
    // },
    formControl: {
      marginRight: 40,
    },
  });
