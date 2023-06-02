import React, { Component } from 'react';
import axios from 'axios';
import { CircularProgress } from '@material-ui/core';
import { sortBy } from 'lodash';
export default class checkNumber extends Component {
  state = {
    columns: [],
    poData: [],
    gposData: [],
    deliveryData: [],
  };

  componentDidMount() {
    console.log(this.props.match.params.orgId, '-------');
    axios
      .get(`http://localhost:3001/test/getQueryData/${this.props.match.params.orgId}`)
      .then((res) => {
        if (res.data) {
          this.setState({
            poData: res.data.poData,
            gposData: res.data.gposData,
            deliveryData: res.data.deliveryData,
          });
        }
      })
      .catch((err) => {
        console.log(err, 'err');
      });
  }

  getDifference(array1, array2) {
    return array1.filter((object1) => {
      return !array2.some((object2) => {
        return object1.purchaseOrderId === object2.purchaseOrderId;
      });
    });
  }

  getDifferenceGpos(array1, array2) {
    return array1.filter((object1) => {
      return !array2.some((object2) => {
        return object1.purchaseOrderId === object2.purchaseorderid;
      });
    });
  }

  render() {
    const { poData, gposData, deliveryData } = this.state;
    // console.log(poData, gposData, deliveryData);

    if (poData.length <= 0 && gposData.length <= 0 && deliveryData.length <= 0) return <CircularProgress />;

    let groupedData = [];
    console.log(poData, 'poData');
    Array.isArray(poData) &&
      poData.reduce(function (res, value) {
        const mID = value.monsantoProductId;
        const pID = value.purchaseOrderId;
        if (!res[pID] && !res[mID]) {
          res[pID] = {
            purchaseOrderId: value.purchaseOrderId,
            monsantoProductId: value.monsantoProductId,
            orderQty: 0,
            totalQty: 0,
            isSent: value.isSent,
            name: value.name,
            productDetail: value.productDetail,
          };
          groupedData.push(res[pID]);
        }
        res[pID].orderQty += String(` ${value.orderQty} ,`);
        res[pID].totalQty += Number(value.orderQty);

        return res;
      }, {});
    const GPOSdifference = [...this.getDifferenceGpos(groupedData, gposData)];
    const Deliverydifference = [...this.getDifference(groupedData, deliveryData)];

    return (
      <div>
        <h4>Check GPOS Number</h4>
        <h5>Not found PO length in GPOS Data : {GPOSdifference.length}</h5>
        <h5>Not found PO length in Delivery Data : {Deliverydifference.length}</h5>

        {groupedData.map((d) => {
          let groupGpos = [];
          let groupDelivery = [];
          gposData
            .filter((g) => d.purchaseOrderId === g.purchaseorderid)
            .reduce(function (res, value) {
              const pID = value.purchaseorderid;
              if (!res[pID]) {
                res[pID] = {
                  purchaseOrderId: value.purchaseorderid,
                  streportedname: value.streportedname,
                  productreportedquantity: 0,
                  totalGposQty: 0,
                };
                groupGpos.push(res[pID]);
              }
              res[pID].productreportedquantity += `${value.productreportedquantity} ,`;
              res[pID].totalGposQty += parseFloat(value.productreportedquantity);

              return res;
            }, {});

          deliveryData
            .filter((g) => d.purchaseOrderId == g.purchaseOrderId && d.monsantoProductId == g.monsantoProductId)
            .reduce(function (res, value) {
              const mID = value.monsantoProductId;
              const pID = value.purchaseOrderId;
              if (!res[pID] && !res[mID]) {
                res[pID] = {
                  purchaseOrderId: value.purchaseOrderId,
                  monsantoProductId: value.monsantoProductId,
                  amountDelivered: 0,
                  totalDelivery: 0,
                };
                groupDelivery.push(res[pID]);
              }
              res[pID].amountDelivered += String(`${value.amountDelivered},`);
              res[pID].totalDelivery += Number(value.amountDelivered);

              return res;
            }, {});

          return (
            <div>
              <table style={{ border: '1px solid gray' }}>
                <th className="number_th">
                  POID :<br></br>
                  {d.purchaseOrderId}
                </th>
                <th className="number_th">
                  CustomerName [PO] :<br></br> {d.name}
                </th>
                <th className="number_th">
                  CustomerName [GPOS] : <br></br>
                  {groupGpos.length > 0 ? groupGpos[0].streportedname : 'No GPOS Record'}
                </th>
                <th className={d.isSent == false ? 'isbackground number_th' : 'number_th'}>
                  isSent : {d.isSent == true ? 'true' : 'false'}
                </th>
                <th className="number_th">ProductDescription </th>
                <th className="number_th">MonsantoID</th>

                <tr>
                  <td></td>
                  <td>
                    <div style={{ marginLeft: '20px', display: 'flex', flexDirection: 'column' }}>
                      <p>Ordered : {`(${d.orderQty.slice(1, -1)})`}</p>
                      <p>TotalOrdered : {d.totalQty}</p>
                    </div>
                  </td>
                  <td>
                    <p>
                      GPOS : {`(${groupGpos.length > 0 ? groupGpos[0].productreportedquantity.slice(1, -1) : '0'})`}
                    </p>
                    <p>TotalGPOS : {groupGpos.length > 0 ? groupGpos[0].totalGposQty : '0'}</p>
                    <p>
                      {groupGpos.length > 0 ? (
                        parseFloat(groupGpos[0].totalGposQty) == parseFloat(d.totalQty) ? (
                          <p> GPOS Total Match with Ordered Total</p>
                        ) : (
                          <p style={{ backgroundColor: '#ff000026' }}>GPOS Total Does Not Match with Ordered Total</p>
                        )
                      ) : (
                        <p style={{ backgroundColor: '#34843530' }}>No Record Found with this PO {d.purchaseOrderId}</p>
                      )}
                    </p>
                  </td>
                  <td>
                    <p>
                      Delivered :{' '}
                      {`(${groupDelivery.length > 0 ? groupDelivery[0].amountDelivered.slice(1, -1) : '0'})`}
                    </p>
                    <p>TotalDelivered : {groupDelivery.length > 0 ? groupDelivery[0].totalDelivery : '0'}</p>
                    <p>
                      {groupDelivery.length > 0 ? (
                        parseFloat(groupDelivery[0].totalDelivery) == parseFloat(d.totalQty) ? (
                          <p> Delivery Total Match with Ordered Total</p>
                        ) : (
                          <p style={{ backgroundColor: '#ff000026' }}>
                            Delivery Total Does Not Match with Ordered Total
                          </p>
                        )
                      ) : (
                        <p style={{ backgroundColor: '#34843530' }}>
                          {' '}
                          No Record Found with this PO {d.purchaseOrderId}
                        </p>
                      )}
                    </p>
                  </td>

                  <td>{d.productDetail}</td>

                  <td> {d.monsantoProductId}</td>
                </tr>
              </table>
            </div>
          );
        })}
      </div>
    );
  }
}
