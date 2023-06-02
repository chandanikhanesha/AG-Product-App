import React from 'react';

function customer_table_quotes(props) {
  const { classes } = this.props;
  const customer = props.value;
  const quotes = customer.PurchaseOrders.filter((po) => po.isQuote);
  const needsQuote = quotes.length;
  return (
    <div>
      {needsQuote === 0 ? (
        <Tooltip title="Create a new order">
          <Button
            simple={true}
            color="primary"
            className={classes.createQT}
            onClick={this.handleCreatePurchaseOrderDialogOpen(customer.id, true)}
            disabled={isPending(customer)}
          >
            Create Quote
          </Button>
        </Tooltip>
      ) : (
        this.getQuoteLinks(customer.id, quotes)
      )}
    </div>
  );
}

export default customer_table_quotes;
