import React from 'react';
// nodejs library that concatenates classes
import classNames from 'classnames';
// nodejs library to set properties for components
import PropTypes from 'prop-types';

// material-ui components
import withStyles from '@material-ui/core/styles/withStyles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AddIcon from '@material-ui/icons/Add';
// core components
import Card from '../../../components/material-dashboard/Card/Card';
import CardBody from '../../../components/material-dashboard/Card/CardBody';
import CardHeader from '../../../components/material-dashboard/Card/CardHeader';

import customTabsStyle from '../../../assets/jss/material-dashboard-pro-react/components/customTabsStyle';

const styles = Object.assign(
  {},
  {
    headerFitContentWidth: {
      alignSelf: 'flex-start',
      minWidth: 389,
    },
  },
  customTabsStyle,
);

class CustomTabs extends React.Component {
  handleChange = (event, value) => {
    if (value >= this.props.tabs.length) return;
    this.props.onTabChange && this.props.onTabChange(value);
  };

  render() {
    const { classes, headerColor, plainTabs, tabs, title, rtlActive, print, showPlus, onClickPlus } = this.props;
    const cardTitle = classNames({
      [classes.cardTitle]: true,
      [classes.cardTitleRTL]: rtlActive,
    });
    return (
      <Card plain={plainTabs}>
        <CardHeader
          color={headerColor}
          plain={plainTabs}
          className={`${classes.headerFitContentWidth} ${print ? 'hide-print' : ''}`}
        >
          {title !== undefined ? <div className={cardTitle}>{title}</div> : null}
          <Tabs
            value={this.props.selectedTab}
            onChange={this.handleChange}
            classes={{
              root: classes.tabsRoot,
              indicator: classes.displayNone,
            }}
          >
            {tabs.map((prop, key) => {
              var icon = {};
              if (prop.tabIcon) {
                icon = {
                  icon: <prop.tabIcon />,
                };
              }
              return (
                <Tab
                  id={prop.tabName}
                  classes={{
                    root: classes.tabRootButton,
                    labelContainer: classes.tabLabelContainer,
                    label: classes.tabLabel,
                    selected: classes.tabSelected,
                    wrapper: classes.tabWrapper,
                  }}
                  key={key}
                  id={prop.tabName}
                  label={prop.tabName}
                  {...icon}
                />
              );
            })}
            {showPlus && (
              <Tab
                classes={{
                  root: classes.tabRootButton,
                  labelContainer: classes.tabLabelContainer,
                  label: classes.tabLabel,
                  selected: classes.tabSelected,
                  wrapper: classes.tabWrapper,
                }}
                key="plus"
                icon={<AddIcon style={{ color: '#999999' }} />}
                onClick={(e) => {
                  const noop = () => {};
                  (onClickPlus || noop)(e);
                  e.preventDefault();
                }}
              />
            )}
          </Tabs>
        </CardHeader>
        <CardBody>
          {tabs.map((prop, key) => {
            if (key === this.props.selectedTab) {
              return <div key={key}>{prop.tabContent}</div>;
            }
            return null;
          })}
        </CardBody>
      </Card>
    );
  }
}

CustomTabs.propTypes = {
  classes: PropTypes.object.isRequired,
  headerColor: PropTypes.oneOf(['warning', 'success', 'danger', 'info', 'primary', 'rose', 'gray']),
  title: PropTypes.string,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      tabName: PropTypes.string.isRequired,
      tabIcon: PropTypes.func,
      tabContent: PropTypes.node.isRequired,
    }),
  ),
  rtlActive: PropTypes.bool,
  plainTabs: PropTypes.bool,
  selectedTab: PropTypes.number,
  onTabChange: PropTypes.func,
  showPlus: PropTypes.bool,
  onClickPlus: PropTypes.func,
};

export default withStyles(styles)(CustomTabs);
