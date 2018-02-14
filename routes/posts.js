var express = require('express');
var router = express.Router();
const {getAllPosts, insertPosts, getAllСategories, getPostsBy, addComment} = require('../middlewares/db_connection');
const { check, validationResult } = require('express-validator/check');

/* GET posts listing. */
router.get('/', addCatsToReq, function(req, res, next){
	getAllPosts(function(err, posts){
		if(err) throw err;
		console.log(req.extra_params.cats);
		res.render('posts', getPostsData({
			title: 'Posts', 
			posts: posts, 
			cats: req.extra_params.cats
		}) );
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

router.get('/show/:id', addCatsToReq, function(req, res, next){
	getPostsBy({_id: req.params.id}, function(err, post){
		if(err) throw err;
		if(post && post.length){
			res.render('post', getPostData({
				post: post[0], 
				cats: req.extra_params.cats,
				success: req.flash('success')
			}) );
		}else{
			req.flash('msg', 'Sorry. Post not found!');
			res.location('/');
			res.redirect('/');
		}
	});
});

router.get('/:category', addCatsToReq, function(req, res, next){
	getPostsBy({
		category: req.params.category
	}, function(err, posts){
		if(err) throw err;
		res.render('posts', getPostsData({
			title: 'Posts by '+res.locals.convertSlugToTitle(req.params.category, req.extra_params.cats), 
			posts: posts, 
			cats: req.extra_params.cats
		}) );
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

router.post('/add_comment', 
	check('name').custom(checkIsEmpty).withMessage('Name should not be empty'),
	check('email').custom(checkIsEmpty).withMessage('Email should not be empty'),
	check('email').isEmail().withMessage('Email must be an email'),
	check('content').custom(checkIsEmpty).withMessage('Content should not be empty'),
	addCatsToReq,
	function(req, res, next){
		const errors = validationResult(req);
		let comment_data = {
			name: req.body.name,
			email: req.body.email,
			content: req.body.content,
			date: Date.now()
		};
		if (!errors.isEmpty()) {
			getPostsBy({_id: req.body.post_id}, function(err, post){
				if(err) throw err;
				if(post && post.length){
					res.render('post', getPostData({
						errors: errors.mapped(), 
						post: post[0], 
						cats: req.extra_params.cats,
						fields_cooment: comment_data
					}) );
				}else{
					req.flash('msg', 'Sorry. Post not found!');
					res.location('/');
					res.redirect('/');
				}
			});
		}else{
			addComment(req.body.post_id, comment_data, function(err, doc){
				if(err) throw err;
				req.flash('success', 'Comment wad added!');
				res.location('/posts/show/'+req.body.post_id);
				res.redirect('/posts/show/'+req.body.post_id);
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

function getPostsData(obj){
	return {
		title: obj.title,
		posts : obj.posts, 
		cats: obj.cats
	};
}

function getPostData(obj){
	return {
		post : obj.post, 
		cats: obj.cats,
		fields_cooment: obj.fields_cooment,
		errors: obj.errors,
		success: obj.success
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
