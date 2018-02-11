// Methods with db
var mongodb = require('mongodb');
var db = require('monk')('localhost/blog');

module.exports.getAllPosts = function(callback){
	let posts = db.get('posts');
	posts.find({}, {}, callback);
}

module.exports.getAllСategories = function(callback){
	let cats = db.get('categories');
	cats.find({}, {}, callback);
}

module.exports.insertPosts = function(data, callback){
	let posts = db.get('posts');
	posts.insert(data, callback);
}