import sweetAlertStyle from '../../assets/jss/material-dashboard-pro-react/views/sweetAlertStyle';

export const styles = (theme) =>
  Object.assign(
    {},
    {
      logoContainer: {
        display: 'inline-block',
      },
      logo: {
        maxHeight: '100px',
        maxWidth: '120px',
      },
      syncingContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 64px)',
        width: 300,
        margin: 'auto',
      },
      textCenter: {
        textAlign: 'center',
      },
      secondaryCta: {
        marginLeft: 20,
      },
      contentTitle: {
        lineHeight: '1.333333333333',
        fontSize: 18,
        fontWeight: 400,
        margin: '0 0 6px 0',
        color: '#777',
      },
      companyName: {
        lineHeight: `1.3625`,
        fontSize: 36,
      },
      '@media print': {
        titleContainer: {
          display: 'flex',
          flexDirection: 'row-reverse',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderBottom: 'solid 0.5px #605e5e',
          paddingTop: '20px',
          paddingBottom: '18px',
        },
        contentTitle: {
          fontSize: '20px',
          color: '2d2f33',
          lineHeight: '22.6px',
        },
        companyName: {
          fontSize: '20px',
          color: '2d2f33',
          lineHeight: '22.6px',
        },
      },
    },
    sweetAlertStyle,
  );
