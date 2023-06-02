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
import Button from '../../components/material-dashboard/CustomButtons/Button';

import Discount from './../discount-editor/discount';

const styles = {
  discountRowName: {
    minWidth: 300,
    display: 'inline-block',
  },
  discountRowHandle: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  discountItemContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  previewBtn: {
    fontSize: '10px',
    textTransform: 'capitalize',
    padding: '16px 30px',
    margin: 0,
    lineHeight: 1,
  },
  paper: {
    maxHeight: 435,
  },
};

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
      order.map((discountId) => {
        return discounts.find((d) => d.DiscountId.toString() === discountId);
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
        <h4>Apply Discounts</h4>
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

                <span className={classes.discountRowHandle}>
                  <DragHandle />
                </span>
              </div>
            );
          })}
        </Sortable>

        <Divider />

        {unselectedDiscounts.map((discount) => {
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

export default withStyles(styles)(DiscountSelector);
