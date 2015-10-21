//// Constants ////
var minPriceAdjustment = 1;
var maxPriceAdjustment = 50;

var timeInterval = 15000;

var minFruitPrice = 0.50;
var maxFruitPrice = 9.99;

var startingPrice = 5.00;
var startingCash = 100.00;

var gameLength = 300000;

var avgPriceText = " Avg Price Paid: "

var fruits = ['Apples', 'Oranges', 'Bananas', 'Pears'];

var player = {
	cash : startingCash
};

var globalInterval;
var globalGameLength;
var gameLengthCounter = 0;

var pricingObject = {};

///////////////////////////////////////
////////// Core Application ///////////
///////////////////////////////////////

$(document).ready(function(){
	init();
});

function init(){
	for(var i = 0; i < fruits.length; i++){
		var newFruit = new Fruit(fruits[i].toLowerCase(), fruits[i], startingPrice);
		fruits[i] = newFruit;
		appendFruitButton(fruits[i]);
		player["num" + fruits[i].name] = 0;
		player["avg" + fruits[i].name] = [];
		$("#playerInformation").append("<div class='col-md-2 sellContainer'></div>");
		var $el = $("#playerInformation").children().last();
		$el.append("<p class='avg" + newFruit.name + "''>" + avgPriceText + "0</p>");
		$el.append("<div id='" + newFruit.fruit + "'>" + newFruit.name + "</div>");
		

		var $child = $el.children().last();
		$child.addClass("btn btn-success");
		$child.addClass("fruitSellButton");
		$child.data('fruit', newFruit.fruit);
	}
	
	updatePlayerInfo();
	enable();
}	

function enable(){
	globalInterval = setInterval(interval, timeInterval);
	globalGameLength = setInterval(gameClock, 1000);
	interval();
	$("#purchaseBlock").on('click', '.buy-button', clickBuyFruit);
	$("#playerInformation").on('click', '.fruitSellButton', clickSellFruit);
}

function disable(){
	clearInterval(globalInterval);
	clearInterval(globalGameLength);
	$("#purchaseBlock").off('click', '.buy-button', clickBuyFruit);
	$("#playerInformation").off('click', '.fruitSellButton', clickSellFruit);
}

function clickBuyFruit(){
	var whichFruit = $(this).data("fruit");
		for(var i = 0; i < fruits.length; i++){
			if(whichFruit == fruits[i].fruit){
				var fruitObject = fruits[i];

				if(player.cash >= fruitObject.price){
					player.cash -= fruitObject.price;
					player["num" + fruitObject.name]++;
					player["avg" + fruits[i].name].push(fruitObject.price);
					averageFruitPrices();
					updatePlayerInfo();
				}
			}
	}
}

function clickSellFruit(){
	var clickedFruit = $(this).data('fruit');
	for(var i = 0 ; i < fruits.length ; i++){
		if(fruits[i].fruit == clickedFruit){
			if(player['num' + fruits[i].name] > 0){
				player['num' + fruits[i].name]--;
				player["avg" + fruits[i].name].pop();
				player.cash += fruits[i].price;
				averageFruitPrices();
				updatePlayerInfo();
			}
		}
	}
}

function averageFruitPrices(){
	for(var i = 0; i < fruits.length; i++){
		averageFruitArray(player["avg" + fruits[i].name]);
	}

	updatePlayerInfo();
}

function averageFruitArray(array){
	var sum = 0;
	for(var i = 0; i < array.length; i++){
		sum += array[i];
	}
	sum = sum/array.length;
	sum = (sum * 100) / 100;
	for(i = 0; i < array.length; i++){
		array[i] = sum;
	}
	console.log("Averaging Fruits: ", array);
}

function interval(){
	for(var i = 0; i < fruits.length; i++){
		fruits[i].updatePrice();
		var price = fruits[i].price.toString();
		price = checkAddZero(price);
		$("#fruitButton" + fruits[i].name).children(".fruit-price").text(price);
	}

	updatePlayerInfo();
}

function gameClock(){
	gameLengthCounter += 1000;
	if(gameLengthCounter > gameLength){
		endGame();
	}
}

function endGame(){
	disable();
	sellAllFruit();
	var totalEarnings = player.cash - 100;
	totalEarnings = (Math.round(totalEarnings * 100))/100;
	$("#totalCash").text("You made: $" +  (updatePlayerDollars(totalEarnings)));
}

function sellAllFruit(){
	for(var i = 0; i < fruits.length; i++){
		if(player['num' + fruits[i].name] > 0){
			player.cash += (fruits[i].price * player['num' + fruits[i].name]);
			player['num' + fruits[i].name] = 0;
			updatePlayerInfo();
		}
	}
}

//// Constructor Function(s) ////
function Fruit(fruit, name, price) {
  this.fruit = fruit;
  this.name = name;
  this.price = price;

  this.updatePrice = function() {
  	var priceAdjustment = (randomNumber(minPriceAdjustment,maxPriceAdjustment));
  	priceAdjustment = (Math.round(priceAdjustment)) / 100;
  	var positiveAdjustment = randomNumber(0,1);
  	if(positiveAdjustment == 0){
  		priceAdjustment = -priceAdjustment;
  	} 
  	this.price += priceAdjustment; 
  	this.price = Math.floor(this.price * 100)/100;

  	if(this.price > maxFruitPrice) this.price = maxFruitPrice;
  	if(this.price < minFruitPrice) this.price = minFruitPrice;
  }
}

//// DOM Methods ////
function updatePlayerInfo(){
	var playerCash = Math.round(player.cash * 100)/100;
	$("#totalCash").text("Player Cash: $" + updatePlayerDollars(playerCash));

	for(var i = 0; i < fruits.length; i++){
		var fruitObject = fruits[i]
		$("#" + fruitObject.fruit).text(fruitObject.name + ": " + player["num" + fruitObject.name]);

		var avgPrice = player["avg" + fruits[i].name][0];
		if(avgPrice != undefined){
			avgPrice = (Math.round(avgPrice * 100))/100;
		} else {
			avgPrice = 0;
		}

		$(".avg" + fruitObject.name).text(fruits[i].name + avgPriceText + avgPrice.toFixed(2));
		
	}
}

function updatePlayerDollars(number){
	console.log(number.toFixed(2));
	return number.toFixed(2);
}

function appendFruitButton(object){
	var el = "<div class='btn btn-info buy-button' id='fruitButton" + object.name + "'>" + 
				"<div class='fruit-image " + object.fruit + "'></div>" + 
				"<div class='fruit-name'>" + object.name + "</div>" + 
				"<div class='fruit-price'>" + object.price + "</div>" + 
			 "</div>" ;

	$("#purchaseBlock").append(el);

	var $parent = $("#purchaseBlock").children().last();
	$parent.data('fruit', object.fruit);
}

//// Utility Function(s) ////
function randomNumber(min, max){
	return Math.floor(Math.random() * (1 + max - min) + min);
}

function checkAddZero(string){
	if(string.length == 3){
			string = string + 0;
	}
	return(string);
}

