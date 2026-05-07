import express from "express";

// Import controllers from
import { errorUser, getUsers } from "@/controllers/user-controller";
import { verify } from "@/middleware/auth-middleware";
import { register } from "@/controllers/auth.controller";
import {getLocalOrderBook} from '../controllers/orderbook.controller'
import {placeOrder} from '../controllers/placeorder.controller';

// Setup router
const router = express.Router();



router.get("/trade",getLocalOrderBook);
router.post('/orders',placeOrder)


// Export router; should always export as default
export default router;