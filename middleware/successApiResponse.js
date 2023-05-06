
const sendSuccessApiResponse = (data, statusCode = 200) => {
    const message  = "success";
    return {
        message,
        error : false,
        code : statusCode,
        data
    };
};

module.exports = { sendSuccessApiResponse};
