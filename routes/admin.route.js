const express =  require("express");
const upload = require("../middleware/fileupload");
const {authorization} = require("../middleware/authorization")
const { addproduct, updateproduct,deleteproduct, orderlist, filterorders, changestatus, searchOrder } = require("../controllers/admin.controller");
const asyncWrapper = require("../utils/asyncWrapper");
const { createCustomError } = require("../errors/customAPIError");

const router = express.Router();
const adminValidator = asyncWrapper(async(req,res,next)=>{
    if(req.user.details.role!='Admin') next(createCustomError("User is not Admin",401));
    else next();
})
// admin
router.route("/addproduct").post(authorization, upload.array( 'image', 5 ), addproduct);
router.route("/updateproduct").patch( authorization,upload.array( 'image', 5 ),updateproduct);
router.route("/deleteproduct/:productid").delete( authorization,adminValidator,deleteproduct);
router.route("/orderlist").get( authorization,orderlist);

router.route("/filterorder").get( authorization,filterorders);
router.route("/updatestatus").patch( authorization,changestatus);

    

module.exports = router;
