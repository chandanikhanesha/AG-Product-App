import { warningColor, cardTitle, dangerColor } from '../../../assets/jss/material-dashboard-pro-react';

export const deliveryDialogStyles = (theme) => ({
  svg: {
    marginLeft: 8,
    position: 'absolute',
    bottom: '-3px',
  },
  productDelivered: {
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    display: 'inline-block',
    fontSize: 30,
  },
  select: {
    width: 200,
  },
  cardContainer: {
    marginBottom: 0,
    boxShadow: 'none',
  },
  CTABar: {
    marginRight: 20,
  },
  secondaryCta: {
    backgroundColor: '#999',
  },
  paperFullScreen: {
    overflowX: 'hidden',
  },
  cardIconTitle: {
    ...cardTitle,
    marginTop: '15px',
    marginBottom: '0px',
  },
  nameInput: {
    float: 'right',
  },
  deliveryInput: {
    width: 50,
  },
  warning: {
    color: warningColor,
  },
  danger: {
    color: dangerColor,
  },
});
