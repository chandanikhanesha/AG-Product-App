import React, { Component } from 'react';
import CustomInput from '../../../../components/material-dashboard/CustomInput/CustomInput';

import { withStyles } from '@material-ui/core';
import { farmRowExtraStyles } from './farm_row_extra.styles';

class FarmRowExtra extends Component {
  constructor(props) {
    super(props);

    this.state = {
      acres: 0,
      seedPerAcre: 0,
      seedOfBags: 0,
      recommendedQty: 0,
      notes: '',
    };
  }

  calculateRecommendedQty = () => {
    const { acres, seedPerAcre, seedOfBags } = this.state;
    if (seedOfBags === 0) {
      return;
    }
    let recommendedQty = (acres * seedPerAcre) / seedOfBags;
    this.setState({ recommendedQty: recommendedQty });
  };

  render() {
    const { shareholders, onAddShareholder, classes } = this.props;
    const { acres, seedPerAcre, seedOfBags, recommendedQty, notes } = this.state;
    return (
      <div>
        <div
        // style={{
        //   display: 'flex',
        //   justifyContent: 'flex-start',
        //   borderTop: '1px solid grey',
        //   paddingTop: 30,
        // }}
        >
          <div style={{ marginTop: '10px' }}>
            {/* <div>
              <span>Shareholders</span>
              <a
                style={{ color: '#38A154', marginLeft: 20 }}
                onClick={() => {
                  onAddShareholder();
                }}
              >
                Add a shareholder
              </a>
            </div>
            <br /> */}
            {shareholders}
          </div>
          {/* <div style={{ width: 600 }}>
            <div style={{ marginBottom: 20 }}>Calculated Required QTY</div>
            <div style={{ display: 'flex' }}>
              <div className={classes.inputLabelStyles}>Acres</div>
              <div className={classes.inputLabelStyles}>Seed/Acre</div>
              <div className={classes.inputLabelStyles}>No. of Seeds/Bag</div>
              <div className={classes.qtyInputLabelStyles}>Recommended Qty</div>
            </div>
            <div>
              <CustomInput
                formControlProps={{
                  classes: {
                    root: classes.acresInputStyles,
                  },
                }}
                inputProps={{
                  type: 'number',
                  className: classes.inputPropsStyles,
                  value: acres || 0,
                  onChange: (e) => {
                    let inputVal = Number.isNaN(Number(e.target.value)) ? 0 : Number(e.target.value);
                    this.setState(
                      {
                        acres: inputVal,
                      },
                      () => this.calculateRecommendedQty(),
                    );
                  },
                }}
              />
              <CustomInput
                formControlProps={{
                  classes: {
                    root: classes.acresInputStyles,
                  },
                }}
                inputProps={{
                  type: 'number',
                  className: classes.inputPropsStyles,
                  value: seedPerAcre || 0,
                  onChange: (e) => {
                    let inputVal = Number.isNaN(Number(e.target.value)) ? 0 : Number(e.target.value);
                    this.setState(
                      {
                        seedPerAcre: inputVal,
                      },
                      () => this.calculateRecommendedQty(),
                    );
                  },
                }}
              />
              <CustomInput
                formControlProps={{
                  classes: {
                    root: classes.acresInputStyles,
                  },
                }}
                inputProps={{
                  type: 'number',
                  className: classes.inputPropsStyles,
                  value: seedOfBags || 0,
                  onChange: (e) => {
                    let inputVal = Number.isNaN(Number(e.target.value)) ? 0 : Number(e.target.value);
                    this.setState(
                      {
                        seedOfBags: inputVal,
                      },
                      () => this.calculateRecommendedQty(),
                    );
                  },
                }}
              />
              <b className={classes.qtyInputStyles}>{recommendedQty} bags</b>
            </div>
          </div>
          <div style={{ width: 100 }}>
            <div>Notes</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '550px' }}>
              <CustomInput
                inputProps={{
                  type: 'text',
                  //className: classes.inputPropsStyles,
                  value: notes,
                  onChange: (e) => {
                    let inputText = e.target.value;
                    this.setState({
                      notes: inputText,
                    });
                  },
                }}
                labelText={'Add your notes'}
              />
            </div>
          </div> */}
          {/* <div
            style={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              paddingLeft: 50,
              paddingRight: 50
            }}
          >
            <CustomInput
              className={{ root: { width: "100%" } }}
              labelText={"Notes"}
              inputProps={{
                placeholder: "Add your notes"
              }}
            />
          </div> */}
        </div>
      </div>
    );
  }
}

export default withStyles(farmRowExtraStyles)(FarmRowExtra);
