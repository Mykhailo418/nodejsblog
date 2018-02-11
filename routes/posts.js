var express = require('express');
var router = express.Router();
const {getAllPosts, insertPosts, getAllСategories} = require('../middlewares/db_connection');
const { check, validationResult } = require('express-validator/check');

/* GET posts listing. */
router.get('/', function(req, res, next){
	getAllPosts(function(err, posts){
		if(err) throw err;
		res.render('posts', {posts : posts});
	});
});

router.get('/add', function(req, res, next){
	getAllСategories(function(err, cats){
		if(err) throw err;
		console.log(cats);
		res.render('add_post', getAddPostData({
			cats: cats
		}));
	});
});

/* POST posts listing. */
router.post('/add', 
	check('title').custom(checkIsEmpty).withMessage('Title should not be empty'),
	check('content').custom(checkIsEmpty).withMessage('Content should not be empty'),
	addCatsToReq,
	function(req, res, next){
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			//console.log(errors.mapped());
			console.log(req.body);
			res.render('add_post', getAddPostData({ 
				errors: errors.mapped(), 
				fields: req.body, 
				cats: req.extra_params.cats
			}) );
		}else{
			insertPosts({
				title: req.body.title,
				category: req.body.category,
				content: req.body.content,
				author: req.body.author,
				date: Date.now(),
			},function(err, post){
				if(err) throw err;
				req.flash('msg', 'Success. Post was created!');
				res.location('/');
				res.redirect('/');
			});
		}
	}
);

module.exports = router;

/* Helpers */

function getAddPostData(obj){
	return {
		fields: obj.fields,
		errors: obj.errors,
		cats: obj.cats
	};
}

// validating if field is empty
function checkIsEmpty(value,args){
	if(!value && value !== 0){
		throw new Error('error');
	}else{
		return true;
	}
}

// add categories to req

function addCatsToReq(req, res, next){
	getAllСategories(function(err, cats){
		if(err) throw err;
		req.extra_params = {
			cats
		};
		next();
	});
}
