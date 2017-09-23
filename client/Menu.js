var palettes = [
	{
		name: "classic",
		colour: [0.0,0.0,0.0]
	},
	{
		name: "inverted",
		colour: [1.0,1.0,1.0]
	},
	{
		name: "infrared",
		colour: [3, 1, -3]
	},
	{
		name: "c64",
		colour: [-0.75, -0.25, 0.25]
	},
	{
		name: "dark-forest",
		colour: [0.03, -1, -0.25]
	},
	{
		name: "pulp",
		colour: [-0.4358186449815582, 0.7842105259376866, 0.7070602956392871]
	},
	{
		name: "vacuum",
		colour: [0.1894904492215712, 0.40649907600077917, -0.35009832345733694]
	},
	{
		name: "shimmer",
		colour: [-100, -100, -100]
	},
	{
		name: "cream",
		colour: [1,0.6,0.6]
	},
	{
		name: "industrial",
		colour: [0.48930425124300214, 5.4162016834965385, 6.912143168052054]
	}
];
var currentPalette = 0;

var mainMenu = [
	{
		text: "Start",
		action: function(){
			menu.deinit();
			menu = null;
			battle = new Battle();
			screen_filter.uniforms.uScanDistort += 200;
			screen_filter.uniforms.uChrAbbSeparation += 100;
		}
	},
	{
		text: "options",
		action: function(){
			menu.setOptions(optionsMenu);
		}
	},
	{
		text: "about",
		action: function(){
			menu.setOptions(aboutMenu);
			menu.deselect(menu.selection);
			menu.selection = menu.options.length-1;
			menu.select(menu.selection);
		}
	}
];

var optionsMenu = [
	{
		text: "Palette",
		action: function(){
			setPalette(currentPalette+1);
			menu.setOptions(optionsMenu);
		}
	},
	{
		text: "palette name",
		action: undefined
	},
	{
		text: "Scaling",
		action: function(){
			if(scaleMode === 1){
				scaleMode = 2;
			}else{
				scaleMode = 1;
			}
			optionsMenu[3].text = scaleModes[scaleMode];
			menu.setOptions(optionsMenu, 2);
			onResize();
		}
	},
	{
		text: "Scale to Fit",
		action: undefined
	},
	{
		text: "Back",
		action: function(){
			menu.setOptions(mainMenu, 1);
		}
	}
];

var aboutMenu = [
	{
		text: "Made for AGBIC2017",
		action: undefined
	},
	{
		text: "by SweetHeart♥Squad",
		action: undefined
	},
	{
		text: "based on famicase cart",
		action: undefined
	},
	{
		text: "by Rogue■Cache",
		action: undefined
	},
	{
		text: "Back",
		action: function(){
			menu.setOptions(mainMenu, 2);
		}
	}
];

function Menu(){
	this.init();
}
Menu.prototype.init = function(){
	this.container = new PIXI.Container();
	this.optionsContainer = new PIXI.Container();
	this.optionsContainer.x = size.x*0.915;
	this.optionsContainer.y = size.y*0.6125;
	this.container.addChild(this.optionsContainer);

	title = text("Rōshigumi", {x:5*4,y:16*4}, 0.25,{x:0,y:0});
	title.x = size.x*0.7;
	title.y = size.y*0.4;
	title.line = new PIXI.Graphics();
	title.line.lineStyle(4,0xFFFFFF,1);
	title.line.moveTo(-title.width/2,title.height/2 + 4);
	title.line.lineTo(title.width/2,title.height/2 + 4);
	title.line.endFill();
	title.addChild(title.line);
	this.container.addChild(title);

	var s = svg("swordsvg",{x:64*2,y:64*2*0.1});
	s.drawCircle(38*2,0,40*2);
	s.drawCircle(38*2,0,44*2);
	s.rotation = Math.PI/2;
	s.y -= 38*2;
	this.thing = new PIXI.Container();
	this.thing.addChild(s);
	this.thing.x = size.x/4;
	this.thing.y = size.y/2;
	this.container.addChild(this.thing);

	this.setOptions(mainMenu);

	scene.addChild(this.container);
};
Menu.prototype.setOptions = function(options, defaultSelection){
	defaultSelection = defaultSelection || 0;
	if(this.options){
		for(var i = 0; i < this.options.length; ++i){
			var o = this.options[i];
			o.parent.removeChild(o);
			o.destroy();
		}
	}
	var textScale = {
		x:8,
		y:10
	};
	this.options = options.slice();
	for(var i = 0; i < this.options.length; ++i){
		var t = text(this.options[i].text, textScale, 0.5,{x:-0.5,y:0});
		t.y += i*textScale.y*1.8;
		this.optionsContainer.addChild(t);
		var a = this.options[i].action;
		this.options[i] = t;
		this.options[i].action = a;
		if(!a){
			this.options[i].alpha = 0.4;
		}
	}

	this.selection = defaultSelection;
	this.select(defaultSelection);
}
Menu.prototype.deinit = function(){
	scene.removeChild(this.container);
	this.container.destroy();
};
Menu.prototype.next = function(){
	do{
		this.move(1);
	}while(!this.options[this.selection].action);
	var s=sounds["menu"].play();
	sounds["menu"].rate(1 + (Math.random()*2-1)*0.1,s);
};
Menu.prototype.prev = function(){
	do{
		this.move(-1);
	}while(!this.options[this.selection].action);
	var s=sounds["menu"].play();
	sounds["menu"].rate(1 + (Math.random()*2-1)*0.1,s);
};
Menu.prototype.move = function(by){
	this.deselect(this.selection);
	this.selection += by;
	while(this.selection >= this.options.length){
		this.selection -= this.options.length;
	}while(this.selection < 0){
		this.selection += this.options.length;
	}
	this.select(this.selection);
}
Menu.prototype.update = function(){
	mouse.update(); /// hack: update mouse to avoid accepting clicks on menu

	// animation
	this.thing.rotation += 0.01;
	this.container.y = Math.sin(game.main.prevTime / 1200)*3;

	// interaction
	var input = getInput();
	if(input.down){
		this.next();
	}else if(input.up){
		this.prev();
	}else if(getJustAction1()){
		this.options[this.selection].action();
		var s =sounds["menu"].play();
	}

	if(Math.random() < 0.005){
		screen_filter.uniforms.uScanDistort += 10*Math.random();
		screen_filter.uniforms.uChrAbbSeparation += 100*Math.random();
	}
};
Menu.prototype.deselect = function(id){
	this.options[id].scale.x = this.options[id].scale.y = 1.0;
};
Menu.prototype.select = function(id){
	this.options[id].scale.x = this.options[id].scale.y = 1.3;
};


function setPalette(palette){
	currentPalette = palette;
	currentPalette %= palettes.length;
	optionsMenu[1].text = palettes[currentPalette].name;
	localStorage.setItem("palette", currentPalette);
}