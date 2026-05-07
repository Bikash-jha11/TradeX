// Interface for custom class ApiError
export interface ApiError extends Error {
  success: boolean;
  message: string;
  statusCode: number;
  data: [] | {};
}




export interface TreeNode{
  keys?:Number,
  t?:Number,
  children?:Node,
  n?:Number,
  leaf?:boolean,
  next?:Node
}

export interface Order {
  id: string;
  userId: string;
  price: number;
  quantity: number;
  side: 'BUY' | 'SELL';
  symbol: string;
  status:'PENDING' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELLED' 
}

