import axios from 'axios';

export const makeProductOrderBooking = (data) => {
  console.log(data, 'data');
  return (dispatch) => {
    return axios
      .post(`${process.env.REACT_APP_API_BASE}/monsanto/product_booking`, data, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((response) => {
        return response;
      });
    // .catch((e) => console.log("e: ", e));
  };
};
