import React, { Component } from 'react';
import ReactTable from 'react-table';
import { withStyles } from '@material-ui/core';
import { groupBy } from 'lodash';

import { financeMethodStyles } from './finance_method.styles';

class FinanceMethod extends Component {
  state = {
    columns: [
      {
        Header: 'Company Type',
        accessor: 'companyType',
      },
      {
        Header: 'Company Name',
        accessor: 'companyName',
      },
      {
        Header: 'Product',
        accessor: 'productName',
      },
      {
        Header: 'Finance Name',
        accessor: 'financeName',
      },
      {
        Header: 'Interest Method',
        accessor: 'interestMethod',
      },
      {
        Header: 'Interest Rate',
        accessor: 'interestRate',
        headerStyle: {
          textAlign: 'left',
        },
      },
    ],
  };
  componentWillMount = async () => {
    await this.props.listFinanceMethods();
  };

  componentDidMount = () => {
    this.getFinanceData();
  };

  getFinanceData = () => {
    const { financeMethods, purchaseOrder, seedCompanies, companies } = this.props;
    const customerProducts = this.props.customerProducts.filter((cp) => cp.purchaseOrderId === purchaseOrder.id);
    const products = customerProducts.map((customerProduct) => {
      return this.props.products.find((product) => product.id === customerProduct.productId);
    });
    const customerCustomProducts = this.props.customerCustomProducts.filter(
      (cp) => cp.purchaseOrderId === purchaseOrder.id,
    );
    const customProducts = customerCustomProducts.map((customerCustomProduct) => {
      return this.props.customProducts.find(
        (customProduct) => customProduct.id === customerCustomProduct.customProductId,
      );
    });
    const seedCompanyGroups = groupBy(products, (product) => {
      return product && product.seedCompanyId;
    });
    const companyGroups = groupBy(customProducts, (customProduct) => {
      return (customProduct && customProduct.companyId) || [];
    });
    let data = [],
      _seedCompanyProductIds = [],
      _companiesProductIds = [];

    Object.keys(seedCompanyGroups).forEach((seedCompanyId) => {
      const financeMethod = financeMethods.find((financeMethod) =>
        financeMethod.seedCompanyIds.includes(parseInt(seedCompanyId, 10)),
      );
      if (financeMethod) {
        const seedCompany = seedCompanies.find((_seedCompany) => _seedCompany.id === parseInt(seedCompanyId, 10));
        const metadata = JSON.parse(seedCompany.metadata);
        const cropTypes = Object.keys(metadata);
        const { name: financeName, interestMethod, interestRate } = financeMethod;
        seedCompanyGroups[seedCompanyId].forEach((product) => {
          if (_seedCompanyProductIds.includes(product.id)) return;
          const brandName = metadata[product.seedType.toLowerCase()].brandName;
          let productName = `${brandName} / ${product.blend} / ${product.brand} / ${product.treatment}`;
          let productData = {
            companyType: 'Seed Company',
            companyName: seedCompany.name,
            productName,
            financeName,
            interestMethod,
            interestRate,
          };
          _seedCompanyProductIds.push(product.id);
          data.push(productData);
        });
      }
    });

    Object.keys(companyGroups).forEach((companyId) => {
      const financeMethod = financeMethods.find((financeMethod) =>
        financeMethod.companyIds.includes(parseInt(companyId, 10)),
      );
      if (financeMethod) {
        const company = companies.find((_company) => _company.id === parseInt(companyId, 10));
        const { name: financeName, interestMethod, interestRate } = financeMethod;
        companyGroups[companyId].forEach((product) => {
          if (_companiesProductIds.includes(product.id)) return;
          let productData = {
            companyType: 'Company',
            companyName: company.name,
            productName: product.name,
            financeName,
            interestMethod,
            interestRate,
          };
          _companiesProductIds.push(product.id);
          data.push(productData);
        });
      }
    });

    return data;
  };
  render() {
    const tableData = this.getFinanceData();
    if (tableData.length < 1) return null;
    return (
      <div className="invoice-table-wrapper">
        <h4>Finance Method</h4>
        <ReactTable
          sortable={false}
          showPagination={false}
          minRows={1}
          columns={this.state.columns}
          data={tableData}
          className={`${this.props.classes.financeMethodTable} no-white-space financeMethodTable`}
          getTheadTrProps={() => {
            return {
              style: {
                color: '#3C4858',
                background: '#CDDFC8',
                fontWeight: 'bold',
              },
            };
          }}
          getTrProps={(state, rowInfo) => {
            let style = {};
            if (rowInfo.index % 2 === 0) {
              style = {
                background: '#DDDDDD',
              };
            }
            return { style };
          }}
        />
      </div>
    );
  }
}

export default withStyles(financeMethodStyles)(FinanceMethod);
