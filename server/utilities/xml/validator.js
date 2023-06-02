const { buildMonsantoRequest, buildXmlPayloadHeader } = require('./common');

module.exports.parseValidationResponse = async (rawResponse) => {
  const envelope = rawResponse['soapenv:Envelope'];
  if (envelope['S:Body']) {
    const errorMessage =
      envelope['S:Body'][0]['ag:outboundData'][0]['ag:xmlPayload'][0]['S:Fault'][0]['faultstring'][0];
    return errorMessage;
  } else {
    return '';
  }
};
