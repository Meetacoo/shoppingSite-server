const mongoose = require('mongoose');
const productModel = require('./product.js');
const ProductSchema = new mongoose.Schema({
	productId: {
		type:mongoose.Schema.Types.ObjectId,
		ref:'Product'
	},
	price:{
		type:Number
	},
	name:{
		type:String
	},
	images:{
		type:String
	},
	count:{
		type:Number,
		default:1
	},
	totalPrice:{
		type:Number,
		default:0
	}
});
const ShippingSchema = new mongoose.Schema({
	shippingId: {
		type:String
	},
	name: {
		type:String
	},
	province: {
		type:String 
	},
	city: {
		type:String 
	},
	address: {
		type:String 
	},
	phone: {
		type:String 
	},
	zip: {
		type:String 
	}
});

const OrderSchema = new mongoose.Schema({
	// 订单所属
	user: {
		type:mongoose.Schema.Types.ObjectId,
		ref:'User'
	},
	// 订单号
	orderNo: {
		type:String
	},
	// 支付金额
	payment: {
		type:String 
	},
	// 支付方式
	paymentType: {
		type:String,
		enum:["10","20"],//10-支付宝 20-微信
		default:"10"
	},
	// 支付类型描述
	paymentTypeDesc: {
		type:String,
		enum:["支付宝","微信"],//10-支付宝 20-微信
		default:"支付宝"
	},
	paymentTime: {
		type:Date
	},
	status:{
		type:String,
		enum:["10","20","30","40","50"],//10-未支付 20-取消 30-已支付 40-已发货 50-完成 
		default:"10"
	},
	statusDesc:{
		type:String,
		enum:["未支付","取消","已支付","已发货","完成"],
		default:"未支付"
	},
	// 配送信息
	shipping: {
		type:ShippingSchema
	},
	// 商品信息
	productList: {
		type:[ProductSchema],
		default:[]
	}
},{
	timestamps:true
});
OrderSchema.statics.getPaginationOrders = function(page,query={}){
	return new Promise((resolve,reject)=>{
		let options = {
			page: page,//需要显示的页码
			model:this, //操作的数据模型
			query:query, //查询条件
			projection:"-__v", //投影，
			sort:{_id:-1} //排序
		}
		pagination(options)
		.then((data)=>{
			resolve(data); 
		})
	})
 }

const OrderModel = mongoose.model('Order',OrderSchema);
module.exports = OrderModel;