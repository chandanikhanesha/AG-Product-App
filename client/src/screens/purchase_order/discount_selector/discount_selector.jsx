import React, { Component } from 'react';
import Sortable from 'react-sortablejs';
import { withStyles } from '@material-ui/core';

// icons
import DragHandle from '@material-ui/icons/DragHandle';

// core components
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import Discount from '../../../components/discount-editor/discount';

import { discountSelectorStyles } from './discount_selector.styles';

const Transition = (props) => {
  return <Slide direction="up" {...props} />;
};

class DiscountSelector extends Component {
  state = {
    previewOpen: false,
    previewDiscount: null,
  };

  closePreview = () => {
    this.setState({
      previewOpen: false,
      previewDiscount: null,
    });
  };

  openPreview = (id) => {
    const unselectedDiscounts = this.unselectedDiscounts();
    const previewDiscount = unselectedDiscounts.find((discount) => discount.id === id);
    this.setState({
      previewOpen: true,
      previewDiscount,
    });
  };

  updateSelected(selectedDealerDiscounts) {
    this.props.onUpdate(selectedDealerDiscounts);
  }

  selectDiscount = (discount) => {
    const { discounts } = this.props;
    let selected = {
      order: discounts.length,
      DiscountId: discount.id,
    };
    if (discount.discountStrategy === 'Flat Amount Discount' && discount.detail.length === 1) {
      selected.unit = discount.detail[0].unit;
      selected.discountValue = discount.detail[0].discountValue;
    }
    this.updateSelected([...discounts, selected]);
  };

  removeDiscount = (selected) => {
    const { discounts } = this.props;
    this.updateSelected(discounts.filter((dd) => dd !== selected));
  };

  unselectedDiscounts() {
    const { dealerDiscounts, discounts } = this.props;
    const usedDiscountIds = discounts.map((selected) => selected.DiscountId);

    return dealerDiscounts.filter((discount) => {
      return !usedDiscountIds.includes(discount.id);
    });
  }

  onReorder(order, sortable, e) {
    const { discounts } = this.props;
    this.updateSelected(
      order.map((discountId, idx) => {
        const discount = discounts.find((d) => d.DiscountId.toString() === discountId);
        discount.order = idx;
        return discount;
      }),
    );
  }

  onValueChange(event, selected) {
    const { discounts } = this.props;
    const updated = Object.assign({}, selected);
    updated.discountValue = event.target.value;
    this.updateSelected(
      discounts.map((discount) => {
        if (discount.DiscountId !== selected.DiscountId) return discount;
        return updated;
      }),
    );
  }

  onUnitChange(event, selected) {
    const { discounts } = this.props;
    const updated = Object.assign({}, selected);
    updated.unit = event.target.value;
    this.updateSelected(
      discounts.map((discount) => {
        if (discount.DiscountId !== selected.DiscountId) return discount;
        return updated;
      }),
    );
  }

  render() {
    const { previewOpen, previewDiscount } = this.state;
    const { classes, dealerDiscounts, discounts, companies } = this.props;

    if (!dealerDiscounts.length > 0) return <p>No discounts for selected seed type</p>;

    const unselectedDiscounts = this.unselectedDiscounts();

    return (
      <div className="hide-print">
        <h4>Apply Discounts </h4>
        <Sortable
          options={{ handle: `.${classes.discountRowHandle}` }}
          onChange={(order, sortable, e) => this.onReorder(order, sortable, e)}
        >
          {discounts.map((selected, i) => {
            const discount = dealerDiscounts.find((dd) => dd.id === selected.DiscountId);
            if (!discount) return null;
            return (
              <div key={i} data-id={selected.DiscountId} className={classes.discountItemContainer}>
                <Checkbox checked={true} onChange={() => this.removeDiscount(selected)} id={discount.name} />

                <span className={classes.discountRowName}>{discount.name}</span>

                {discount.discountStrategy === 'Flat Amount Discount' && (
                  <span>
                    <TextField
                      className={classes.valueInput}
                      label={'Value'}
                      value={selected.discountValue}
                      onChange={(e) => this.onValueChange(e, selected)}
                    />

                    <Select
                      value={selected.unit}
                      onChange={(e) => this.onUnitChange(e, selected)}
                      select
                      id={`chooseUnit-${discount.name}`}
                    >
                      <MenuItem value={'$'} id="discount$">
                        $
                      </MenuItem>
                      <MenuItem value={'%'} id="discount%">
                        %
                      </MenuItem>
                    </Select>
                  </span>
                )}

                <span className={classes.discountRowHandle}>
                  <DragHandle />
                </span>
              </div>
            );
          })}
        </Sortable>

        <Divider />

        {unselectedDiscounts
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((discount) => {
            return (
              <div key={discount.id} className={classes.discountItemContainer}>
                <Checkbox checked={false} onChange={() => this.selectDiscount(discount)} id={discount.name} />

                <span>{discount.name}</span>
                <Button simple link className={classes.previewBtn} onClick={() => this.openPreview(discount.id)}>
                  Preview
                </Button>
              </div>
            );
          })}
        {previewOpen && (
          <Dialog
            open={previewOpen}
            onClose={() => this.closePreview()}
            TransitionComponent={Transition}
            maxWidth="md"
            classes={{
              paper: classes.paper,
            }}
          >
            <Discount dealerDiscount={previewDiscount} companies={companies} preview={true} />
          </Dialog>
        )}
      </div>
    );
  }
}

export default withStyles(discountSelectorStyles)(DiscountSelector);
