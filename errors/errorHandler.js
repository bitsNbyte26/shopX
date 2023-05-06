const errorHandler = (err, req, res, next) => {
    res.status(err.code || 500).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};
module.exports = errorHandler;