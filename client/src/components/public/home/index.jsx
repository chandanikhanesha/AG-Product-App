import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import GridContainer from '../../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../../components/material-dashboard/Grid/GridItem';

import { container } from '../../../assets/jss/material-dashboard-pro-react';

const homePageStyle = {
  container,
  content: {
    paddingTop: '18vh',
    minHeight: 'calc(100vh - 80px)',
    position: 'relative',
    zIndex: '4',
  },
};

class Home extends Component {
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.content}>
        <div className={classes.container}>
          <GridContainer justifyContent="center">
            <GridItem xs={12} sm={6} md={4}>
              {/* <h1>home</h1> */}
            </GridItem>
          </GridContainer>
        </div>
      </div>
    );
  }
}

// export default Home
export default withStyles(homePageStyle)(Home);
