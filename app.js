const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();
app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

let items = [];
let workItems = [];

app.listen(process.env.PORT || 4000, function() {
	console.log("Server running on port 4000");
});

app.get("/", function(req, res){
	const day = date.getDate();
	res.render('list', {listTitle: day, items: items});
});

app.post("/add", function(req, res) {
	const item = req.body.item;

	if (req.body.list === "Work") {
		workItems.push(item);
		res.redirect("/work");
	} else {
		items.push(item);
		res.redirect("/");
	}

});

app.post("/delete", function(req, res) {
	const itemDelete = req.body.itemDelete;

	if (req.body.deleteButton === "Work") {
		workItems.splice(itemDelete, 1);
		res.redirect("/work");
	} else {
		items.splice(itemDelete, 1);
		res.redirect("/");
	}
});

app.get("/work", function(req,res) {
	res.render("list", {listTitle: "Work List", items: workItems});
});

app.get("/about", function(req,res) {
	res.render("about");
});