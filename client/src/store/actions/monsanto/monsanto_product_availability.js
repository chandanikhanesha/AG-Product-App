import axios from 'axios';

//data={productList,seedCompanyId}
export const checkProductAvailability = (CustomerMonsantoProducts) => {
  return (dispatch) => {
    return axios
      .post(`${process.env.REACT_APP_API_BASE}/monsanto/product_availability`, CustomerMonsantoProducts, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((response) => {
        return response;
      });
    // .catch((e) => console.log("e: ", e));
  };
};

export const checkinOrderProductAvailability = (data) => {
  return (dispatch) => {
    return axios
      .post(`${process.env.REACT_APP_API_BASE}/monsanto/product_availability/checkinOrder`, data, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((response) => {
        return response;
      });
    // .catch((e) => console.log("e: ", e));
  };
};
export const checkShortProductProductAvailability = (data) => {
  return (dispatch) => {
    return axios
      .post(`${process.env.REACT_APP_API_BASE}/monsanto/product_availability/checkShortProduct`, data, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((response) => {
        return response;
      });
    // .catch((e) => console.log("e: ", e));
  };
};

export const checkInInventoryProductAvailability = (data) => {
  return (dispatch) => {
    return axios
      .post(`${process.env.REACT_APP_API_BASE}/monsanto/product_availability/checkInInventory`, data, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((response) => {
        return response;
      })
      .catch((e) => console.log('e: ', e));
  };
};
