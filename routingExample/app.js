//knockout view model
function ViewModel() {
	var self=this;
	
	//ko observables
	self.products=ko.observableArray([]);
	self.currentProduct=ko.observable(null);
	self.route=ko.observable("");
	self.skip=ko.observable(0);
	self.total=ko.observable(0);
	self.detailProduct=ko.observable();
	self.isLoading=ko.observable(false);
	
	// a complex observable used for the shopping card
	self.shoppingCard={
		items:ko.observableArray([]),
		total:function() {
			var total=0;
			for(var i=0;i<this.items().length;i++) 
				total+=this.items()[i].Total();
			return(total);
		}
	}
	
	//o.js init
	o().config({
		endpoint:"https://secure.pointsale.de/Service.svc",
		version:3,
		strictMode:true,
		start:function() {
			self.isLoading(true);
		},
		ready:function() {
			self.isLoading(false);
		}
	});

	//get top 3 products on start TODO: At filter for best selling!
	o("Product").take(3).route("",function(data) {
		self.route("Home");
		self.products(data);
	});
	
	//get a product list on product click
	o("Product").take(9).inlineCount().route("Product",function(data) {
		self.route("Product");
		self.products(data);
		self.skip(0);
		self.total(this.inlinecount);
	});
	
	//product pagination
	o("Product").skip(0).take(9).inlineCount().route("Product/Page?",function(data) {
		self.skip(parseInt(this.param[0]));
		self.route("Product");
		self.products(data);
		self.total(this.inlinecount);
	});
	
	//product detail
	o("Product").find(0).route("Product/Detail?",function(data) {
		self.route("Detail");
		self.detailProduct(data);
	});

	//open the shopping card
	o("").route("Card",function(data) {
		self.route("Card");
	});
	
	//add to shopping card
	o("Product").find(0).route("AddToCard?",function(data) {
		//push a temp ProductOrder element into the items. When the order is checked in, we will Post it to the dataservice
		self.shoppingCard.items.push({ 
			Amount:ko.observable(1),
			Product:data,
			Total:function() {
				return(this.Amount()*this.Product.Price);
			},
			Remove:function() {
				var index = self.shoppingCard.items.indexOf(this);
				self.shoppingCard.items.splice(index, 1);
			}
		});
	});
}

//append the viewmodel
ko.applyBindings(new ViewModel());

