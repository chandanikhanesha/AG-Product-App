import { createSeason, updateSeason } from '../../../store/actions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withStyles } from '@material-ui/core';
import styles from './modal.styles';
import Modal from './modal';

const mapDispatchToProps = (dispatch) => bindActionCreators({ createSeason, updateSeason }, dispatch);

export default withStyles(styles)(connect(null, mapDispatchToProps)(Modal));
