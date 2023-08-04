const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const ejs = require("ejs");

const app = express();
app.use(express.static("public"));
app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// let items = [];
// let workItems = [];

mongoose.connect("mongodb+srv://admin-joao:Test123@cluster0-asuex.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = new mongoose.Schema ({
	name: {
		type: String,
		required: [true, "Please check your data entry, no name specified!"]
	};
});

const listSchema = {
	name: String,
	items: [itemsSchema]
};

const Item = mongoose.model("Item", itemsSchema);

const List = mongoose.model("List", listSchema);

const item1 = new Item({
	name: "item1";
});
const item2 = new Item({
	name: "item2";
});
const item3 = new Item({
	name: "item3";
});

const defaultItems = [item1, item2, item3];

let port = process.env.PORT;
if (port == null || port == "") {
	port = 4000;
}

// app.listen(process.env.PORT || 4000, function() {
app.listen(port, function() {
	console.log("Server started successfully.");
});

app.get("/", function(req, res){
	Item.find({}, function(err, items){
		if (items.length === 0){
			Item.insertMany(defaultItems, function(err){
				if (err){
					console.log(err);
				} else {
					console.log("Default Items successfully added!");
				}
			});
		}

		if (err){
			console.log(err);
		} else {
			res.render('list', {listTitle: "Today", items: items});
		}
	});
});

app.get('/:listName', function(req, res) {
	const listName = _.capitalize(req.params.listName);

	List.findOne({ name: listName }, function (err, list) {
		if (!err) {
			if (!list) {
				const list = new List({
					name: listName,
					items: defaultItems
				});
				list.save();
				res.redirect("/" + listName);
				console.log('Created the list ', list.name);
			} else {
				res.render('list', {listTitle: list.name, items: list.items});
				console.log('Loaded the list ', list.name);
			}
		} else {
			console.log(err);
		}
	});
});

app.post("/add", function(req, res) {
	const item = { name: req.body.item };
	const listName = req.body.list;

	if (listName === "Today") {
		Item.insertMany(item, function(err){
			if (err){
				console.log(err);
			} else {
				console.log("success!");
			}
		});
		res.redirect("/");
	} else {
		List.findOne({name: listName}, function(err, foundList){
			foundList.items.push(item);
			foundList.save();
			res.redirect("/" + listName);
		})
	}
	// const itemName = req.body.newItem;
	// const item = new Item({
	// 	name: itemName;
	// });
	// item.save;
});

app.post("/delete", function(req, res) {
	const listName = req.body.listName;

	if (listName === "Today") {
		Item.findOneAndDelete({_id: req.body.itemDelete}, function(err){
			if (err){
				console.log(err);
			} else {
				console.log("success! Item deleted");
			}
		});
		res.redirect("/");
	} else {
		List.findOneAndUpdate(
				{name: listName},
				{$pull: {items: {_id: req.body.itemDelete}}},
				function(err, foundList) {
					if (err) {
						console.log(err);
					} else {
						console.log("success! Item deleted");
					}
				}
		);
		res.redirect("/" + listName);
	}
});

app.get("/about", function(req,res) {
	res.render("about");
});
