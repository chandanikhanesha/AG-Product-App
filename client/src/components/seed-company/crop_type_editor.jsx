import * as React from 'react';
import { withStyles, Checkbox, FormGroup, FormControlLabel, FormHelperText } from '@material-ui/core';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PropTypes from 'prop-types';
import CustomInput from '../../components/material-dashboard/CustomInput/CustomInput';
import metadataFields from './metadata_fields.json';

const styles = (theme) => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  none: {
    fontStyle: 'italic',
  },
  fill: {
    width: '100%',
  },
  twoColumns: {
    display: 'flex',
    '& > div': {
      flex: '1 0 50%',
    },
  },
});

const CropTypeEditor = ({ classes, metadata, onChangeBrandName, onChangeMetadata }) => {
  const [brandNames, setBrandNames] = React.useState({});
  const [cropTypes, setCropTypes] = React.useState([]);
  const [expanded, setExpanded] = React.useState(null);

  React.useEffect(() => {
    const cropTypes = Object.keys(metadata);
    setCropTypes(cropTypes);
    let brandNames = {};
    cropTypes.forEach((cropType) => {
      brandNames[cropType] = metadata[cropType].brandName;
    });
    cropTypes.length <= 1 && setExpanded(cropTypes[0]);

    setBrandNames(brandNames);
  }, [metadata]);

  const handlePanel = (panel) => (_, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };

  const handleName = (type) => (event) => {
    onChangeBrandName(type)(event.target.value);
  };

  const handleMeta = (type) => (field) => (event) => {
    onChangeMetadata(type)(field)(event.target.checked);
  };

  return (
    <div className={classes.root}>
      {cropTypes.map((type) => {
        const title = type[0].toUpperCase() + type.slice(1);
        const brandName = brandNames[type];
        const fields = Object.keys(metadata[type]).filter((key) => key !== 'brandName');
        const half = Math.ceil(fields.length / 2);
        return (
          <ExpansionPanel expanded={expanded === type} onChange={handlePanel(type)} key={type} id="expander">
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={type + '-panel-content'}
              id={type + '=panel-header'}
            >
              <Typography className={classes.heading}>{title}</Typography>
              <Typography className={classes.secondaryHeading}>
                {brandNames[type] || <span className={classes.none}>None</span>}
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <FormGroup className={classes.fill}>
                <CustomInput
                  labelText={title + ' brand name'}
                  id={type + '-brand-name'}
                  formControlProps={{
                    fullWidth: true,
                  }}
                  inputProps={{
                    value: brandName,
                    onChange: handleName(type),
                    required: true,
                  }}
                />
                <a>
                  Eg: Dekalb, Asgrow. If you don't have a specific brand name, feel free to reuse the crop type like
                  Corn, Soybean, etc
                </a>
                {brandNames[type] && (
                  <React.Fragment>
                    <FormHelperText>What fields should be included</FormHelperText>
                    <div className={classes.twoColumns}>
                      {[fields.slice(0, half), fields.slice(half)].map((group, i) => (
                        <div key={i}>
                          <FormGroup>
                            {group.map((field) => {
                              const label = metadataFields[field];
                              const checked = metadata[type][field];
                              const handler = handleMeta(type)(field);

                              return (
                                <FormControlLabel
                                  key={field}
                                  control={<Checkbox checked={checked} onChange={handler} />}
                                  label={label}
                                />
                              );
                            })}
                          </FormGroup>
                        </div>
                      ))}
                    </div>
                  </React.Fragment>
                )}
              </FormGroup>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        );
      })}
    </div>
  );
};

CropTypeEditor.displayName = 'CropTypeEditor';
CropTypeEditor.propTypes = {
  classes: PropTypes.object.isRequired,
  metadata: PropTypes.object.isRequired,
  onChangeBrandName: PropTypes.func.isRequired,
  onChangeMetadata: PropTypes.func.isRequired,
};

export default withStyles(styles)(CropTypeEditor);
