const express = require('express');
const router = express.Router();
const { getСategoryBySlug, insertCategories }= require('../middlewares/db_connection');
const { check, validationResult } = require('express-validator/check');

// GET routes
router.get('/add', function(req, res, next){
	res.render('add_category', getAddCategoryData({}));
});

// POST routes
router.post('/add',
	check('title').custom(checkIsEmpty).withMessage('Title should not be empty'),
	check('title').custom(checkIsUnique).withMessage('Such category already exists'),
	function(req, res, next){
		const errors = validationResult(req);
		console.log('add cats errors',errors.mapped());
		if (!errors.isEmpty()) {
			res.render('add_category', getAddCategoryData({ 
				errors: errors.mapped(), 
				fields: req.body
			}) );
		}else{
			insertCategories({
				name: req.body.title,
				slug: convertToSlugCategories(req.body.title)
			}, function(err, cat){
				if(err) throw err;
				req.flash('msg', 'Success. Category was added!');
				res.location('/');
				res.redirect('/');
			});
		}
	}
);


module.exports = router;

/* Helpers */

function getAddCategoryData(obj){
	return {
		fields: obj.fields,
		errors: obj.errors
	};
}

// validating if field is empty
function checkIsEmpty(value, args){
	if(!value && value !== 0){
		throw new Error('error');
	}else{
		return true;
	}
}

function convertToSlugCategories(str){
	return str.toLocaleLowerCase().replace(/ /g, '_');
}

// Check if category is unique
function checkIsUnique(value, args){
	return getСategoryBySlug(convertToSlugCategories(value)).then(function(cat) {
		console.log('promise',cat);
		if(cat && (!Array.isArray(cat) || cat.length ) ){
			console.log('Such category already exists');
			throw new Error('Such category already exists');
		}else{
			return true;
		}
	});
}