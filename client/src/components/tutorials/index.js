import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import withStyles from '@material-ui/core/styles/withStyles';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import agridealer from '../../assets/img/agridealer.png';
import CircularProgress from '@material-ui/core/CircularProgress';

import axios from 'axios';
const styles = (theme) =>
  Object.assign(
    {},
    {
      rootContainer: {
        width: '100%',
        padding: '20px',
      },
      primaryColor: {
        color: '#bbb',
      },
      accordion: {
        boxShadow: 'none',
      },
      listContainer: {
        maxHeight: '860px',
        overflowY: 'auto',
        padding: '20px',
      },
      videoContainer: {
        // maxHeight: '860px',
        overflowY: 'auto',
      },
      List: {
        margin: '-10px 0px -20px -10px',
        fontFamily: 'sans-serif',
        lineHeight: '25px',
        wordSpacing: '7px',
        fontWeight: '600',
      },
      textPaperCard: {
        height: '150px',
        padding: '25px',
        fontSize: '16px',
        fontFamily: 'sans-serif',
      },
      videoPaperCard: {
        marginTop: '30px',
        height: '400px',
      },
      ImagePaperCard: {
        marginTop: '30px',
        height: '225px',
        display: 'flex',
        overflow: 'auto',
      },
      imagecontainer: {
        height: '100%',
        width: '100%',
        marginRight: '10px',
      },
      heading: {
        fontSize: '18px',
        textTransform: 'capitalize',
        fontWeight: '900',
      },
      activeOrder: {
        background: '#38a154b3',
        borderRadius: '5px',
      },
    },
  );
class Tutorials extends Component {
  state = {
    expanded: true,
    tutorialData: [],
    currntSubOrder: null,
    isLoading: true,
  };
  componentDidMount = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_BASE}/tutorial`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((res) => {
        this.setState({ tutorialData: res.data, isLoading: false });
      })
      .catch((err) => {
        console.log('err');
      });
  };

  handleChange = (panel) => (event, isExpanded) => {
    this.setState({ expanded: isExpanded ? panel : false });
  };
  render() {
    const { classes } = this.props;
    const { tutorialData, currntSubOrder, isLoading } = this.state;
    if (isLoading) {
      return <CircularProgress />;
    }

    const leftList = [];
    tutorialData.reduce(function (res, value) {
      const pID = value.topicOrder;
      if (!res[pID]) {
        res[pID] = {
          topicName: value.topicName,
          topicOrder: value.topicOrder,
        };
        leftList.push(res[pID]);
      }

      res[pID].List =
        res[pID].List !== undefined
          ? res[pID].List.concat({
              subTopicOrder: value.subTopicOrder,
              subTopicName: value.subTopicName,
            })
          : [
              {
                subTopicOrder: value.subTopicOrder,
                subTopicName: value.subTopicName,
              },
            ];
      return res;
    }, {});

    const rightSide =
      currntSubOrder !== null
        ? tutorialData.find(
            (t) => t.topicOrder == currntSubOrder.topicOrder && t.subTopicOrder == currntSubOrder.subTopicOrder,
          )
        : null;

    return (
      <div className={classes.rootContainer}>
        <Grid container spacing={8}>
          <Grid item xs={4} sm={4} className={classes.listContainer}>
            <Paper style={{ padding: '20px' }}>
              {leftList
                .sort(function (a, b) {
                  return a.topicOrder - b.topicOrder;
                })
                .map((d, i) => {
                  return (
                    <Accordion defaultExpanded={true} className={classes.accordion}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                      >
                        <Typography className={classes.heading}>
                          {d.topicOrder} . {d.topicName}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <ul className={classes.List}>
                          {d.List.sort(function (a, b) {
                            return a.subTopicOrder - b.subTopicOrder;
                          }).map((l, index) => {
                            return (
                              <div
                                className={
                                  rightSide !== null &&
                                  rightSide.topicOrder == d.topicOrder &&
                                  rightSide.subTopicOrder == l.subTopicOrder &&
                                  classes.activeOrder
                                }
                                style={{ cursor: 'pointer', padding: '0px 5px 0px 5px' }}
                                onClick={() => this.setState({ currntSubOrder: { ...l, topicOrder: d.topicOrder } })}
                              >
                                {d.topicOrder}.{l.subTopicOrder} {l.subTopicName}
                              </div>
                            );
                          })}
                        </ul>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
            </Paper>
          </Grid>

          <Grid item xs={8} sm={8} className={classes.videoContainer}>
            <Paper className={classes.textPaperCard}>
              {rightSide !== null ? (
                <div dangerouslySetInnerHTML={{ __html: rightSide.textContent }} />
              ) : (
                'This is the simple tutorials content that given the some basic information to user about the app'
              )}
            </Paper>
            <Paper className={classes.videoPaperCard}>
              {' '}
              <iframe
                src={
                  rightSide !== null
                    ? `https://www.youtube.com/embed/${
                        rightSide.videoLink.split('v=').length > 1
                          ? rightSide.videoLink.split('v=')[1].split('&')[0]
                          : rightSide.videoLink
                      }`
                    : 'https://www.youtube.com/embed/e9GVteVPTgo'
                }
                frameborder="0"
                allow="autoplay; encrypted-media"
                allowfullscreen
                title="video"
                width="100%"
                height="400"
              />
            </Paper>

            <Paper className={classes.ImagePaperCard}>
              {rightSide !== null && rightSide.images !== null ? (
                rightSide.images.length > 0 &&
                rightSide.images.map((i) => {
                  return <img src={i} alt="advanced" className={classes.imagecontainer} />;
                })
              ) : (
                <img
                  src={agridealer}
                  alt="advanced"
                  style={{ background: 'black' }}
                  className={classes.imagecontainer}
                />
              )}
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}
export default withStyles(styles)(Tutorials);
