// Methods with db
var mongodb = require('mongodb');
var db = require('monk')('localhost/blog');

// Get Functions
module.exports.getAllPosts = function(callback){
	let posts = db.get('posts');
	posts.find({}, {}, callback);
}

module.exports.getPostsBy = function(obj, callback){
	let posts = db.get('posts');
	posts.find(obj, {sort: {title: 1}}, callback);
}

module.exports.getAllСategories = function(callback){
	let cats = db.get('categories');
	cats.find({}, {}, callback);
}

module.exports.getСategoryBySlug = function(slug){
	let cats = db.get('categories');
	return cats.find({slug: slug}, {});
}

// Insert functions
module.exports.insertPosts = function(data, callback){
	let posts = db.get('posts');
	posts.insert(data, callback);
}

module.exports.insertCategories = function(data, callback){
	let cats = db.get('categories');
	cats.insert(data, callback);
}