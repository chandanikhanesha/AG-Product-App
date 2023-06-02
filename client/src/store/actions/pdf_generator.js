import axios from 'axios';
import * as constants from '../constants';
import { _authHeaders } from './helpers';

export const getPdfForPage = (pdfUrl, pdfName = 'Report') => {
  return (dispatch) => {
    return axios
      .post(
        `${process.env.REACT_APP_API_BASE}/create_pdf`,
        {
          clientPath: pdfUrl,
        },
        {
          ..._authHeaders(),
          responseType: 'arraybuffer',
        },
      )
      .then((response) => {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${pdfName} - ${new Date()}.pdf`;
        link.click();

        return dispatch({
          type: constants.PDF_GENERATE_SUCCESS,
          payload: null,
        });
      });
  };
};
