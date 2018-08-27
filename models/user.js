const mongoose = require('mongoose');

var BlogSchema = new mongoose.Schema({
	username: {
		type:String
	},
	password: {
		type:String 
	},
	isAdmin: {
		type:Boolean,
		default:false // 默认是普通用户
	},
	email: {
		type:String 
	},
	phone: {
		type:String 
	}
},{
	timestamps:true
});

const BlogModel = mongoose.model('User',BlogSchema);
module.exports = BlogModel;