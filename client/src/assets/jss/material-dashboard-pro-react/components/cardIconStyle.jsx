import {
  warningCardHeader,
  successCardHeader,
  dangerCardHeader,
  infoCardHeader,
  primaryCardHeader,
  roseCardHeader,
  grayCardHeader,
} from '../../material-dashboard-pro-react';
const cardIconStyle = {
  cardIcon: {
    '&$warningCardHeader,&$successCardHeader,&$dangerCardHeader,&$infoCardHeader,&$primaryCardHeader,&$roseCardHeader,&$grayCardHeader':
      {
        borderRadius: '3px',
        backgroundColor: '#999',
        padding: '15px',
        marginTop: '-20px',
        marginRight: '15px',
        float: 'left',
      },
  },
  warningCardHeader,
  successCardHeader,
  dangerCardHeader,
  infoCardHeader,
  primaryCardHeader,
  roseCardHeader,
  grayCardHeader,
};

export default cardIconStyle;
