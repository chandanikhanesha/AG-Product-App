import sweetAlertStyle from '../../../assets/jss/material-dashboard-pro-react/views/sweetAlertStyle';

export const deliveriesStyles = (theme) =>
  Object.assign({}, sweetAlertStyle, {
    title: {
      marginTop: 0,
      marginBottom: 40,
    },
    actions: {
      marginRight: 0,
      marginLeft: 'auto',
      float: 'right',
    },
    pdfButton: {
      marginRight: 15,
    },
    reportContainer: {
      marginTop: 90,
    },
    formControl: {
      marginRight: 40,
    },
  });
