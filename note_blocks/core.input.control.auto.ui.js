var MAX_DATA = 16384;
var MAX_PARAMETERS = 256;
var voice_data_buffer = new Buffer("voice_data_buffer"); 
var voice_parameter_buffer = new Buffer("voice_parameter_buffer"); 
outlets = 3;
var config = new Dict;
config.name = "config";
var width, height,x_pos,y_pos,w4,h4;
var rows = 4;
var cols = 4;
var block=-1;
var map = new Dict;
map.name = "voicemap";
var blocks = new Dict;
blocks.name = "blocks";
var io = new Dict;
io.name = "io";
var gamutl;
var v_list = [];
var fullscreen = 0;
var endreturns_enabled = 0;
var menucolour,menudark;
var btnhgt = 0.5;
var clicked = 0;

function setup(x1,y1,x2,y2,sw){ 
	// not done - needs to work out which controller it is, get row and column count from config
	menucolour = config.get("palette::menu");
	menudark = [menucolour[0]*0.2, menucolour[1]*0.2, menucolour[2]*0.2];
	gamutl = config.getsize("palette::gamut");
	MAX_DATA = config.get("MAX_DATA");
	MAX_PARAMETERS = config.get("MAX_PARAMETERS");
	width = x2-x1;
	height = y2-y1;
	x_pos = x1;
	y_pos = y1;
	fullscreen = (width > sw * 0.34) + ((sw - x2) < (x2-x1)* 0.3);
	w4=width/cols;
	h4=height/(rows+fullscreen*btnhgt);
	//post(block);
	draw();
}
function draw(){
	if(block>=0){
		update(1);
		drawbuttons();
	}
}

function drawbuttons() {
	if(fullscreen == 0) return 0;
	outlet(0, "custom_ui_element", "mouse_passthrough", x_pos, h4 * rows + y_pos, w4 * 0.5 * cols + x_pos, height + y_pos, 0, 0, 0, block, 0);
	var colour = (clicked == 1) ? menucolour : menudark;
	outlet(1, "framerect", w4 * 0.05 + x_pos, h4 * (rows + 0.05) + y_pos, w4 * (cols / 2 - 0.05) + x_pos, height + y_pos - h4 * 0.05, colour);
	//outlet(0,"setfontsize", 30);
	outlet(1, "moveto", x_pos + w4 * 0.1, y_pos + h4 * (rows + btnhgt - 0.2));
	outlet(1, "write", "zero all");
	outlet(0, "custom_ui_element", "mouse_passthrough", w4 * 0.5 * cols + x_pos, h4 * rows + y_pos, width + x_pos, height + y_pos, 0, 0, 0, block, 0);
	var colour = (clicked == 2) ? menucolour : menudark;
	outlet(1, "framerect", w4 * (cols / 2 + 0.05) + x_pos, h4 * (rows + 0.05) + y_pos, w4 * (cols - 0.05) + x_pos, height + y_pos - h4 * 0.05, colour);
	//outlet(0,"setfontsize", 30);
	outlet(1, "moveto", x_pos + w4 * (cols / 2 + 0.1), y_pos + h4 * (rows + btnhgt - 0.2));
	outlet(1, "write", "store starting positions");
}

function update(force){
	var r,b,y,x,c;
	var w = 0.9 - 0.3 * (endreturns_enabled&&fullscreen);
	if(force || voice_data_buffer.peek(1,MAX_DATA*v_list)){
		for(y=0;y<rows;y++){
			for(x=0;x<cols;x++){
				var readindex=(MAX_DATA*v_list+x+y*cols+1)|0;
				r=voice_parameter_buffer.peek(1,(MAX_PARAMETERS*v_list+x+y*cols+2)|0)*1.05;
				r=((12.6 - (r*r*r))%1) * gamutl;
				r|=0;
				//post("\nC is",readindex,r,i,t);
				c=config.get("palette::gamut["+r+"]::colour"); 
				b=voice_data_buffer.peek(1,readindex + rows*cols);
				//post("\n",i,t,readindex,b,c[0]);	
				if(b!=0){
					b=0.2;
					c[0] = (c[0] * b) | 0;
					c[1] = (c[1] * b) | 0;
					c[2] = (c[2] * b) | 0;
				}
				outlet(1,"paintrect",w4*(x+0.05)+x_pos,h4*(y+0.05)+y_pos,w4*(x+0.95)+x_pos,h4*(y+0.95)+y_pos,c[0],c[1],c[2]);
				outlet(0,"custom_ui_element","data_v_scroll",w4*(x+0.1)+x_pos,h4*(y+0.1)+y_pos,w4*(x+w)+x_pos,h4*(y+0.9)+y_pos,c[0],c[1],c[2],readindex);
				if(endreturns_enabled){
					if(fullscreen == 2){
						outlet(0,"custom_ui_element","data_v_scroll",w4*(x+w+0.1)+x_pos,h4*(y+0.1)+y_pos,w4*(x+w+0.1)+x_pos,h4*(y+0.9)+y_pos,c[0],c[1],c[2],readindex+2*rows*cols);
						outlet(0,"custom_ui_element","data_v_scroll",w4*(x+w+0.2)+x_pos,h4*(y+0.1)+y_pos,w4*(x+w+0.2)+x_pos,h4*(y+0.9)+y_pos,c[0],c[1],c[2],readindex+3*rows*cols);
						outlet(0,"custom_ui_element","data_v_scroll",w4*(x+w+0.3)+x_pos,h4*(y+0.1)+y_pos,w4*(x+w+0.3)+x_pos,h4*(y+0.9)+y_pos,c[0],c[1],c[2],readindex+4*rows*cols);	
					} 
					outlet(1,"frgb", 255,255,255);
					var ty = h4*(y+0.1+0.8*voice_data_buffer.peek(1,readindex+2*rows*cols))+y_pos;
					outlet(1,"moveto",w4*(x+0.1)+x_pos,ty);
					outlet(1,"lineto",w4*(x+w + 0.1*fullscreen)+x_pos,ty);
					var ty = h4*(y+0.1+0.8*voice_data_buffer.peek(1,readindex+2*rows*cols))+y_pos;
					outlet(1,"moveto",w4*(x+0.1)+x_pos,ty);
					outlet(1,"lineto",w4*(x+w + 0.2*fullscreen)+x_pos,ty);
					// if end returns enabled, also draw horizontal lines indicating their meaning.TODO
				}
			}
		}
		voice_data_buffer.poke(1,MAX_DATA*v_list,0);
	}
}

function voice_is(v){
	block = v;
	if(block>=0){
		v_list = map.get(block);
		if(typeof v_list!="number") v_list = v_list[0];
		var controllername = blocks.get("blocks["+block+"]::selected_controller");
		if(io.contains("controllers::"+controllername)){
			post("\ngetting controller info for ui");
			rows = io.get("controllers::"+controllername+"::rows");
			cols = io.get("controllers::"+controllername+"::columns");
		}
	}
}

function voice_offset(){}
function loadbang(){
	outlet(0,"getvoice");
}

function mouse(x,y,l,s,a,c,scr){
	if(x<x_pos+0.5*width){
		if(l==1){
			clicked = 1;
		}else{
			clicked = 0;
			//zero all
			//post(" zero");
			for(var i=0;i<rows*cols;i++){
				voice_data_buffer.poke(1,MAX_DATA*v_list+i+1,0);
			}
			voice_data_buffer.poke(1,MAX_DATA*v_list,1);
		}
	}else{
		if(l==1){
			clicked = 2;
		}else{
			clicked = 0;
			//store to dict
			//post(" store");
			var transf_arr = []; 
			transf_arr = voice_data_buffer.peek(1, MAX_DATA*v_list, 1+ rows*cols);
			transf_arr[0] = 1;
			if(blocks.contains("blocks["+block+"]::voice_data::0")){
				var tra2 = [];
				tra2=blocks.get("blocks["+block+"]::voice_data::0");
				if(tra2.length>transf_arr.length){
					for(var i=transf_arr.length;i<tra2.length;i++) transf_arr[i] = tra2[i];
				}
			}
			blocks.replace("blocks["+block+"]::voice_data::0", transf_arr);
		}
	}
}
	
function store(){
	messnamed("to_blockmanager","store_wait_for_me",block);
	//store needs to store some of the data, but not all!
	if(endreturns_enabled){
		// just the end return parameters (3x for each knob)
		var transf_arr = [];
		transf_arr = voice_data_buffer(1, MAX_DATA*v_list, 1+ 4*rows*cols);
		if(blocks.contains("blocks["+block+"]::voice_data::0")){ //copy existing section of data to retain it
			var tra2 = [];
			tra2=blocks.get("blocks["+block+"]::voice_data::0");
			for(var i=1;i<=rows*cols;i++) transf_arr[i]=tra2[i];
		}else{
			for(var i=1;i<=rows*cols;i++) transf_arr[i]=0;
		}
		transf_arr[0] = 1;
		blocks.replace("blocks["+block+"]::voice_data::0", transf_arr);
	}
	messnamed("to_blockmanager","store_ok_done",block);
}


function enabled(){}