const Router = require('express').Router;
const userModel = require('../models/user.js')
const productModel = require('../models/product.js')
const hmac = require('../util/hmac.js')

const router = Router(); 

/*// 初始化
router.get("/init",(req,res)=>{
	const users = [];
	console.log(users)
	for (var i = 0; i < 100; i++) {
		users.push({
			username:'test'+i,
			password:hmac('test'+i),
			isAdmin:false,
			email:'test' + i + '@huahau.com',
			phone:'15090266' + i
		})
	}
	userModel.create(users)
	.then((result)=>{
		res.end('ok')
	})
})*/

// 注册用户
router.post('/register',(req,res)=>{
	let obj = req.body;
	let result = {
		code:0,
		massage:''
	}
	userModel
	.findOne({username:obj.username})
	.then((user)=>{
		if (user) { // 已经有该用户
			res.send(result = {
				code:1,
				message:'用户已存在'
			})
		} else {
			//插入数据到数据库
			new userModel({
				username:obj.username,
				phone:obj.phone,
				email:obj.email,
				password:hmac(obj.password)
			})
			.save((err)=>{ 
				if(!err){//插入成功
					res.json(result)
				}else{
					result.code = 1;
					result.message = '注册失败'
					res.json(result);
				}
			})
		}
	})
})

// 用户登录
router.post('/login',(req,res)=>{
	let obj = req.body;
	let result = {
		code:0,
		massage:''
	}
	userModel
	.findOne({username:obj.username,password:hmac(obj.password),isAdmin:false})
	.then((user)=>{
		if (user) {
			req.session.userInfo = {
				_id:user._id,
				username:user.username,
				isAdmin:user.isAdmin
			}
			res.json(result);
		} else {
			result.code = 1;
			result.message = '用户名和密码错误';
			res.json(result);
		}
	})
})


router.get('/username',(req,res)=>{
	if (req.userInfo._id) {
		res.json({
			code:0,
			data:{
				username:req.userInfo.username
			}
		})
	} else {
		res.json({
			code:1
		})
	}
})



router.get('/checkUsername',(req,res)=>{
	userModel
	.findOne({username:req.query.username})
	.then((user)=>{
		if (user) {
			res.json({
				code:1,
				message:'用户名已存在'
			})
		} else {
			code = 0
		}
	})
})



router.get('/logout',(req,res)=>{
	let result = {
		code:0,
		massage:''
	}
	req.session.destroy();
	res.json(result);
})

router.get('/productList',(req,res)=>{
	let page = req.query.page;
	let query = {status:0};
	if (req.query.categoryId) {
		// console.log(req.query.categoryId)
		query.category = req.query.categoryId;
	} else {
		query.name = {$regex:new RegExp(req.query.keyword,'i')};
	}

	let projection = 'name _id price images';
	let sort = {order:-1};

	if (req.query.orderBy == 'price_asc') {
		sort = {price:1}
	} else {
		sort = {price:-1}
	}

	productModel
	.getPaginationProducts(page,query,projection,sort)
	.then((result)=>{
		// console.log(result)
		res.json({ 
			code:0,
			data:{
				current:result.current,
				total:result.total,
				list:result.list,
				pageSize:result.pageSize
			}
		});	 
	})
	.catch(e=>{
		res.json({
			code:1,
			message:'查找商品失败'
		})
	});
})

// 获取商品详细信息
router.get('/productDetail',(req,res)=>{
	productModel
	.findOne({status:0,_id:req.query.productId},"-__v -createdAt -updateAt -category")
	.then(product=>{
		res.json({ 
			code:0,
			data:product
		});	
	})
	.catch(e=>{
		res.json({
			code:1,
			message:'获取商品详情失败'
		})
	});
})

// 权限控制
router.use((req,res,next)=>{
	if (req.userInfo._id) {
		next();
	}else{
		res.json({
			code:10
		});
	}
})

router.get('/userInfo',(req,res)=>{
	if (req.userInfo._id) {
		userModel
		.findById(req.userInfo._id,'username phone email')
		.then((user)=>{
			res.json({
				code:0,
				data:user
			})
		})
	} else {
		res.json({
			code:1
		})
	}
})

router.put('/updatePassword',(req,res)=>{
	userModel
	.update({_id:req.userInfo._id},{password:req.body.password})
	.then(raw=>{
		res.json({
			code:0,
			message:'修改密码成功'
		})
	})
	.catch(error=>{
		res.json({
			code:1,
			message:'修改密码失败'
		})
	})
})
module.exports = router;