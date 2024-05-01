function click_clear(index,type){
	if(usermouse.left_button) return 1;
	//post("\nwiping click matrix");
	view_changed = true;
	click_rectangle(0,0,mainwindow_width,mainwindow_height,index,type); // wipe click matrix
}
function click_oval(x1,y1,x2,y2,index,type){
	click_rectangle(x1,y1,x2,y2,index,type); //sorry, i lied. TODO draw ovals here
}
// click-zone takes care of whether it needs to be drawn, increments the counter whatever
function click_zone(action,parameters,values,x1,y1,x2,y2,index,type){
	if(view_changed===true){
		mouse_click_actions[index] = action;
		mouse_click_parameters[index] = parameters;
		mouse_click_values[index] = values;
		click_rectangle(x1,y1,x2,y2,index,type);
	}
	mouse_index++;
}

function click_rectangle(x1,y1,x2,y2,index,type){
	x1=Math.max(0,x1) >> click_b_s;
	x2 = x2 >> click_b_s;
	if(x2 <= x1) return 0;
	y2 = y2 >> click_b_s;
	y1=Math.max(0,y1>>click_b_s);
	type &= 15;
	index &= 4095;
	var w = x2-x1+1;
	var c = (type<<12)+index;
	for(var y=y1;y<=y2;y++){
		var ty=y<<click_b_w;
		ty+=x1;
		for(var e=w;e--;ty++){
			click_i[ty] = c;
		}
	}
}

function draw_block_texture(block){
	var block_label = blocks.get("blocks["+block+"]::label");
	if(block_label!==null){
		var block_mute = blocks.get("blocks["+block+"]::mute");
		var block_bypass = blocks.get("blocks["+block+"]::bypass");
		var ts = block_label + block_mute + block_bypass + record_arm[block];
		//post("mute is",block_mute);
		//var ts = "m"+block_mute +"-"+ block_label;
		//post("\n\nTS IS ",ts);
		if(blocks_tex_sent[block]!=ts){
			//post("drawing texture:",block," label is ",block_label, "ts is ",ts," last sent was ",blocks_tex_sent[block]);
			blocks_tex_sent[block]=ts;
			//post("now its  ",blocks_tex_sent[block]);
			messnamed("texture_generator","block",block);
			var bln = block_label.split(".",4);
			var block_colour = blocks.get("blocks["+block+"]::space::colour");
			lcd_block_textures.message("brgb",block_colour);
			lcd_block_textures.message("clear");
			if(block_mute){
				lcd_block_textures.message("frgb",128,128,128);
				lcd_block_textures.message("paintpoly", 8,8, 8, 32, 96, 120, 120, 120, 120, 96, 32, 8, 8,8);
				lcd_block_textures.message("paintpoly", 120, 8, 120, 32, 32, 120, 8, 120, 8, 96, 96, 8, 120, 8);
			}else if(block_bypass){
				lcd_block_textures.message("frgb",128,128,128);
				lcd_block_textures.message("paintpoly", 8,8, 8, 32, 96, 120, 120, 120, 120, 96, 32, 8, 8,8);
				lcd_block_textures.message("paintpoly", 64, 120, 120, 120, 120, 64, 64, 120);
			}
			if(record_arm[block]){
				lcd_block_textures.message("frgb",255,255,255);
				lcd_block_textures.message("paintoval", 94,6,122,34);
				lcd_block_textures.message("frgb",255,58,50);
				lcd_block_textures.message("paintoval", 96,8,120,32);
			}
			lcd_block_textures.message("frgb",255,255,255);
			lcd_block_textures.message("font",mainfont,(bln.length>0)?16:25);
			lcd_block_textures.message("textface","normal");
			for(var t=0;t<bln.length;t++){
				lcd_block_textures.message("moveto",5, 28+t*29);
				lcd_block_textures.message("write",bln[t].replace(/_/g," "));
				if(t==0){
					lcd_block_textures.message("font",mainfont,25);
					lcd_block_textures.message("textface","bold");		
				}
			}
			lcd_block_textures.message("bang");
		}
	}
}

function block_texture_is(i,tex){
	blocks_cube_texture[i] = tex;
	if(Array.isArray(blocks_cube[i])){
		//post("received texture for existing block ",i,"it is",tex);
		if(blocks_cube[i].length){
			blocks_cube[i][0].texture = tex;
		}
	}
}

function menu_block_texture_is(i,tex){
	blocks_menu_texture[i] = tex;
	//post("\nreceived texture", i,tex,"... ");
	if(blocks_menu[i]!== undefined){
		//post("... for existing menu block ",i,"it is",tex);
		blocks_menu[i].texture = tex;
	}
}

function gain_display(gain){
	if(config.get("gain_display_format")=="x"){
		var s;
		s = gain.toPrecision(2)+"x";
		return s;
	}else{
		var s;
		if(gain===0){
			s="-inf";
		}else{
			var g = f_to_db(Math.abs(gain));
			s = g.toPrecision(2)+"dB";
			if(gain<0) s = "(inverted) "+s;
		}
		return s; 
	}
}

function draw_cpu_meter(){
	var pk = 9 + fontheight*(100-cpu_meter.peak[cpu_meter.pointer])*0.01;
	var avg = 9 + fontheight*(100-cpu_meter.avg[cpu_meter.pointer])*0.01;
	lcd_main.message("frgb", backgroundcolour_current);
	lcd_main.message("moveto", 5, 9);
	lcd_main.message("lineto", 5, 9+fontheight);
	lcd_main.message("frgb", 2.55*cpu_meter.peak[cpu_meter.pointer], Math.min(2.55*(120-cpu_meter.peak[cpu_meter.pointer]),255),55);
	lcd_main.message("moveto", 5, avg);
	lcd_main.message("lineto", 5, pk);
}

function setfontsize(size){
	if(cur_font_size!=size){
		cur_font_size=size;
		lcd_main.message("font",mainfont,size);
	}
}

function clear_sidebar_paramslider_details(){
	if(displaymode=="panels"){
		for(var i=0;i<=MAX_PARAMETERS;i++){
			paramslider_details[i]=[];
		}
	}else{
		paramslider_details = [];
	}
}

function draw_v_slider(x1,y1,x2,y2,r,g,b,index,value){
	lcd_main.message("paintrect",x1,y1,x2,y2,r*bg_dark_ratio,g*bg_dark_ratio,b*bg_dark_ratio);
	click_rectangle(x1,y1,x2,y2,index,2);
	var ly;
 	if(value>=0) {
		if(value>=1){
			var m = 1 - (value % 1)*0.9;
			lcd_main.message("paintrect",x1,y1,x2,y2,(r*m),(g*m),(b*m));
		}
		ly = y1 + (y2 - y1) * (1-(value%1));
		lcd_main.message("paintrect",x1,ly,x2,y2,r,g,b);
	}else{
		if(value<=-1){
			var m = 1 - (value % 1)*0.9;
			lcd_main.message("paintrect",x1,y1,x2,y2,(r*m),(g*m),(b*m));
		}
		ly = y1 + (y2-y1)*(1+(value%1));
		lcd_main.message("paintrect",x1,y1,x2,ly,r,g,b);
	}
}

function draw_button(x1,y1,x2,y2,r,g,b,index,label,value){
	var rat = bg_dark_ratio*2;
	if((usermouse.clicked2d==index)||(value>0.5)) rat = 1 - rat;
	lcd_main.message("paintrect",x1,y1,x2,y2,r*rat,g*rat,b*rat);
	lcd_main.message("framerect",x1,y1,x2,y2,r,g,b);
	rat = (usermouse.clicked2d != index) * 2;
	lcd_main.message("frgb",r*rat,g*rat,b*rat);
	if((y2-y1)>fontheight*0.7){
		label = label.split("_");
	}else{
		if(!Array.isArray(label)) label = [label];
	}
	for(var i=0;i<label.length;i++){
		lcd_main.message("moveto",x1+5,y1+fontheight*(0.4*(i+1)));
		lcd_main.message("write",label[i]);
	}
	if(view_changed===true) click_rectangle(x1,y1,x2,y2,index,1);
}

function parameter_button(p){
	var pv = voice_parameter_buffer.peek(1,MAX_PARAMETERS*paramslider_details[p][11]+paramslider_details[p][9]);
	var statecount = (paramslider_details[p][17].length - 1) / 2;
	var pv2 = Math.floor(pv * statecount * 0.99999) * 2  + 1;
	//post("\ndrawing param button, values", statecount, pv, MAX_PARAMETERS*paramslider_details[p][8]+paramslider_details[p][9], paramslider_details[p][17], pv2, paramslider_details[p][17][pv2])
	draw_button(paramslider_details[p][0],paramslider_details[p][1],paramslider_details[p][2],paramslider_details[p][3],paramslider_details[p][4],paramslider_details[p][5],paramslider_details[p][6],paramslider_details[p][7], paramslider_details[p][17][pv2],pv);
	mouse_click_values[paramslider_details[p][7]] = [paramslider_details[p][17][0],paramslider_details[p][17][pv2+1], MAX_PARAMETERS*paramslider_details[p][8]+paramslider_details[p][9], (pv+(1/statecount)) % 1];
}

function parameter_menu_b(p){
	//this is sort of incomplete - this type doesn't expect to be modulated so just asks for a redraw if it is
	//this fn doesn't calculate colour (requires a lookup of param details)
	var pv = voice_parameter_buffer.peek(1,MAX_PARAMETERS*paramslider_details[p][11]+paramslider_details[p][9]);
	var statecount = (paramslider_details[p][17].length);
	var pv2 = Math.floor(pv * statecount * 0.99999);
	//post("\nbutton, list is",paramslider_details[p][17],"pv2 is",pv2,"and label is",paramslider_details[p][17][pv2]);
	//post("\ndrawing param button, values", statecount, pv, MAX_PARAMETERS*paramslider_details[p][8]+paramslider_details[p][9], paramslider_details[p][17], pv2, paramslider_details[p][17][pv2], (pv+(1.1/statecount)) % 1)
	draw_button(paramslider_details[p][0],paramslider_details[p][1],paramslider_details[p][2],paramslider_details[p][3],paramslider_details[p][4],paramslider_details[p][5],paramslider_details[p][6],paramslider_details[p][7], paramslider_details[p][17][pv2],pv);
	mouse_click_values[paramslider_details[p][7]] = [paramslider_details[p][17][0],paramslider_details[p][17][pv2+1], MAX_PARAMETERS*paramslider_details[p][8]+paramslider_details[p][9], (pv+(1.1/statecount)) % 1];
}

function parameter_menu_l(p){
	var mi = paramslider_details[p][7];
	var statecount = (paramslider_details[p][17].length);// - 1) / 2;
	var pv = voice_parameter_buffer.peek(1, MAX_PARAMETERS*paramslider_details[p][15]+paramslider_details[p][9]); //
	var pv2 = Math.floor(pv * statecount * 0.99999);
	var colmod = -Math.floor(-statecount / paramslider_details[p][11]);
	var ys = (fontheight*paramslider_details[p][16] + fo1)/(colmod);
	var valcol = paramslider_details[p][4];
	var vc;
	var bx=0;by=0;bw = (paramslider_details[p][2]-paramslider_details[p][0]+fo1)/paramslider_details[p][11];
	for(var bl=statecount-1;bl>=0;bl--){
		if(valcol.length==1){
			vc = valcol[0];
		}else{
			vc = valcol[bl];
		}
		if(bl==pv2){
		}else{
			vc = [0.3*vc[0], 0.3*vc[1], 0.3*vc[2]];
		}
		draw_button(paramslider_details[p][0]+bx*bw,paramslider_details[p][1]+by*ys,paramslider_details[p][0]+((bx+1)*bw)-fo1,paramslider_details[p][1]+(by+1)*ys-fo1,vc[0],vc[1],vc[2],mi, paramslider_details[p][17][bl],0);
		mouse_click_actions[mi] = send_button_message;
		mouse_click_parameters[mi] = paramslider_details[p][8];
		mouse_click_values[mi] = ["param","",MAX_PARAMETERS*paramslider_details[p][8]+paramslider_details[p][9], (bl+0.2)/statecount];
		mi++;
		bx++;
		if(bx>=paramslider_details[p][11]){
			by++; bx=0;
		}
	}
	return mi;
}
function labelled_parameter_v_slider(sl_no){
	var p_type=paramslider_details[sl_no][13];

	var click_to_step = 0;
	if((p_type == "menu_b")||(p_type == "menu_i")||(p_type == "menu_f")||(p_type=="menu_l")){
		//if it's a menu_b or menu_i store the slider index + 1 in mouse-values
		click_to_step = sl_no+1;
	}								
	
	parameter_v_slider(paramslider_details[sl_no][0], paramslider_details[sl_no][1], paramslider_details[sl_no][2], paramslider_details[sl_no][3],paramslider_details[sl_no][4], paramslider_details[sl_no][5], paramslider_details[sl_no][6], paramslider_details[sl_no][7],paramslider_details[sl_no][8], paramslider_details[sl_no][9], paramslider_details[sl_no][10],click_to_step);
	
	if(paramslider_details[sl_no][16] == 0){ //if overlaid, the text is twice as bright
		lcd_main.message("frgb",paramslider_details[sl_no][4]*2, paramslider_details[sl_no][5]*2, paramslider_details[sl_no][6]*2);
	}else{
		lcd_main.message("frgb",paramslider_details[sl_no][4], paramslider_details[sl_no][5], paramslider_details[sl_no][6]);
	}
	setfontsize(fontsmall);
	namelabely=paramslider_details[sl_no][12];
	for(var c = 0;c<paramslider_details[sl_no][11].length;c++){
		lcd_main.message("moveto",paramslider_details[sl_no][0]+fo1,namelabely);
		lcd_main.message("write",paramslider_details[sl_no][11][c]);				
		namelabely+=0.4*fontheight;
	}
	
	var pv,ov=-11.11;

	var vo = voicemap.get(paramslider_details[sl_no][8]);
	if(!Array.isArray(vo)) vo = [vo];
	var w = paramslider_details[sl_no][2] - paramslider_details[sl_no][0];
	var ww = w / vo.length;
	var x = paramslider_details[sl_no][0]+fo1;
	var maskx = -1;
	for(var i=0;i<vo.length;i++){
		if(((sidebar.selected_voice>=0) && (sidebar.selected_voice!=i) &&(!(paramslider_details[sl_no][10]&4)))){
			x+=ww;
		}else{
			pv = voice_parameter_buffer.peek(1,MAX_PARAMETERS*vo[i]+paramslider_details[sl_no][9]);	
			pv = Math.min(1,Math.max(0,pv));
			if((pv!=ov)&&(x>maskx)){
				var p_values= blocktypes.get(paramslider_details[sl_no][15]+"::parameters["+paramslider_details[sl_no][9]+"]::values");
				var wrap = paramslider_details[sl_no][14];
				var label = get_parameter_label(p_type,wrap,pv,p_values);
				maskx = x + fontheight*0.2*label.length;
				lcd_main.message("moveto",x,namelabely);
				lcd_main.message("write",label);
				if(!(paramslider_details[sl_no][10]&2))ov=pv;
			}
			x+=ww;
		}
	}
	return(namelabely+4);
}

function get_parameter_label(p_type,wrap,pv,p_values){
	var pvp="";
	if(p_type == "menu_f"){
		var pv2;
		if(wrap){
			pv *= (p_values.length-0.0001);
			pv = Math.floor(pv);
			pv2 = (pv+1) % (p_values.length);
			pv = pv % (p_values.length);											
		}else{
			pv *= (p_values.length-1);
			pv = Math.floor(pv);
			pv2 = Math.min(pv+1,p_values.length-1);
			pv = Math.min(pv,p_values.length-1);											
		}
		if(pv==pv2){
			pvp = p_values[pv];	
		}else{
			pvp = p_values[pv]+ "-"+ p_values[pv2];
		}	
	}else if((p_type == "menu_i")||(p_type == "menu_b")||(p_type=="menu_l")){
		pv *= (p_values.length-0.0001);
		pv = Math.min(Math.floor(pv),p_values.length-1);
		pvp = p_values[pv];
	}else if((p_type == "wave")){
		pv *= (MAX_WAVES-0.0001);
		pv = Math.floor(pv+1);
		var wnam = "-";
		if(waves_dict.contains("waves["+pv+"]::name")) wnam = waves_dict.get("waves["+pv+"]::name");
		pvp = pv+" "+wnam;
	}else if((p_type == "float") || (p_type == "int") || (p_type=="float4") || (p_type=="note")){
		if(p_values[3] == "exp"){
			if(p_values[0] == "uni"){
				pv = Math.pow(2, pv) - 1;
			}else{
				pv -=0.5;
				pv *=2;
				if(pv>=0){
					pv = Math.pow(2, pv) - 1;
				}else{
					pv = -(Math.pow(2, -pv) - 1);
				}
				pv += 1;
				pv *= 0.5;
			}
		}else if(p_values[3] == "exp10"){
			if(p_values[0] == "uni"){
				pv = (Math.pow(10, pv) - 1)*0.11111111111111111111111111111111;
			}else{
				pv -=0.5;
				pv *=2;
				if(pv>=0){
					pv = (Math.pow(10, pv) - 1)*0.11111111111111111111111111111111;
				}else{
					pv = -0.11111111111111111111111111111111*(Math.pow(10, -pv) - 1);
				}
				pv += 1;
				pv /= 2;
			}
			//pv = p_values[1] + (p_values[2]-p_values[1])*pv;
		}else if(p_values[3] == "exp100"){
			if(p_values[0] == "uni"){
				pv = (Math.pow(100, pv) - 1)*0.01010101010101010101010101010101;
			}else{
				pv -=0.5;
				pv *=2;
				if(pv>=0){
					pv = (Math.pow(100, pv) - 1)*0.01010101010101010101010101010101;
				}else{
					pv = -0.01010101010101010101010101010101*(Math.pow(100, -pv) - 1);
				}
				pv += 1;
				pv /= 2;
			}
			//pv = p_values[1] + (p_values[2]-p_values[1])*pv;
		}else if(p_values[3] == "exp1000"){
			if(p_values[0] == "uni"){
				pv = (Math.pow(1000, pv) - 1)*0.001001001001001001001001001001;
			}else{
				pv -=0.5;
				pv *=2;
				if(pv>=0){
					pv = (Math.pow(1000, pv) - 1)*0.001001001001001001001001001001;
				}else{
					pv = -0.001001001001001001001001001001*(Math.pow(1000, -pv) - 1);
				}
				pv += 1;
				pv /= 2;
			}
			//pv = p_values[1] + (p_values[2]-p_values[1])*pv;
		}else if(p_values[3] == "exp.1"){
			if(p_values[0] == "uni"){
				pv = -1.1111111111111111111111111111111*(Math.pow(.1, pv) - 1);
			}else{
				pv -=0.5;
				pv *=2;
				if(pv>=0){
					pv = -1.1111111111111111111111111111111*(Math.pow(0.1, pv) - 1);
				}else{
					pv = 1.1111111111111111111111111111111*(Math.pow(0.1, -pv) - 1);
				}
				pv += 1;
				pv /= 2;
			}
			pv = p_values[1] + (p_values[2]-p_values[1])*pv;
		}else if(p_values[3] == "exp.01"){
			if(p_values[0] == "uni"){
				pv = -1.010101010101010101010101010101*(Math.pow(0.01, pv) - 1);
			}else{
				pv -=0.5;
				pv *=2;
				if(pv>=0){
					pv = -1.010101010101010101010101010101*(Math.pow(0.01, pv) - 1);
				}else{
					pv = 1.010101010101010101010101010101*(Math.pow(0.01, -pv) - 1);
				}
				pv += 1;
				pv /= 2;
			}
			//pv = p_values[1] + (p_values[2]-p_values[1])*pv;
		}else if(p_values[3] == "exp.001"){
			if(p_values[0] == "uni"){
				pv = -1.001001001001001001001001001001*(Math.pow(0.001, pv) - 1);
			}else{
				pv -=0.5;
				pv *=2;
				if(pv>=0){
					pv = -1.001001001001001001001001001001*(Math.pow(0.001, pv) - 1);
				}else{
					pv = 1.001001001001001001001001001001*(Math.pow(0.001, -pv) - 1);
				}
				pv += 1;
				pv /= 2;
			}
			//pv = p_values[1] + (p_values[2]-p_values[1])*pv;
		}else if(p_values[3] == "s"){
			if(p_values[0] == "uni"){
				pv = 0.5 - 0.5 * Math.cos(pv*PI);
			}else{
				pv -=0.5;
				pv *=2;
				pv = 0.5 - 0.5 * Math.cos(pv*PI);
				pv += 1;
				pv /= 2;
			}
			//pv = p_values[1] + (p_values[2]-p_values[1])*pv;
		}
		pvp = p_values[1] + (p_values[2]-p_values[1]-0.0001)*pv;
		//pv = p_values[1] + (p_values[2]-p_values[1])*pv;
		if(p_type == "int"){
			pvp = Math.floor(p_values[1] + (0.99+p_values[2]-p_values[1])*pv);
		}else if(p_type == "note"){
			pvp = note_names[Math.floor(pvp)];
		}else if(p_type == "float4"){
			pv = p_values[1] + (p_values[2]-p_values[1])*pv;
			pvp = pv.toPrecision(4);
		}else{
			pv = p_values[1] + (p_values[2]-p_values[1])*pv;
			var pre=2;
			if(pv>=1){
				pre=3;
				if(pv>999){
					pre=4;
					if(pv>9999){
						pre=5;
					}
				}
			}
			pvp = pv.toPrecision(pre);
		}
	}
	//lcd_main.message("write", pvp);
	return pvp;
}

function parameter_v_slider(x1,y1,x2,y2,r,g,b,index,blockno,paramno,flags,click_to_step){
		// flags
		// &= 1 - bipolar not unipolar
		// &= 2 - onepervoice
		// &= 4 - no per voice modulation on this one
		// 
	lcd_main.message("paintrect",x1,y1,x2,y2,r*bg_dark_ratio,g*bg_dark_ratio,b*bg_dark_ratio);
	var vlist = voicemap.get(blockno); 
	var ly, value;
	value = parameter_value_buffer.peek(1,MAX_PARAMETERS*blockno+paramno);
	var w = x2-x1; //-2;
	if(!Array.isArray(vlist)) vlist = [vlist];
	var ww = (w + 2*(flags&2))/vlist.length;
	var ww2 = ww - 2*(flags&2);
	var pvm = (((blockno == sidebar.selected)&&(sidebar.selected_voice >=0))||(flags&2)) &&(!(flags&4));
	if(view_changed===true) click_rectangle(x1,y1,x2/*+fo1*/,y2,index+pvm,2);
	for(var i=0;i<vlist.length;i++){
		var tvalue = value+parameter_static_mod.peek(1,vlist[i]*MAX_PARAMETERS+paramno);
		if(tvalue > 1) tvalue = 1;
		if(tvalue < 0) tvalue = 0;
		if(flags & 1) tvalue = (2*tvalue)-1; //bipolar
		var mu=0.33; //post("\ndrawing slider",sl_no,blockno,paramno);
		if(tvalue>=0) {
			ly = y1  + (y2 - y1) * (1-tvalue);
			if(((i==sidebar.selected_voice)||(flags & 2))&&(pvm)){ 
				if(view_changed===true){
					click_rectangle(x1+ww*i-click_b_s,y1-1,x1+ww*(i+1)+1+click_b_s,y2+1,index,2);
					mouse_click_actions[index] = static_mod_adjust;
					mouse_click_parameters[index] = [paramno, blockno, vlist[i]];
					mouse_click_values[index] = "";
					if(click_to_step>0)mouse_click_values[index]=click_to_step;
				}
				mouse_index++;
				index++;
				mu=0.57;
			}
			lcd_main.message("paintrect",x1+ww*i,ly,x1+ww*i+ww2,y2,r*mu,g*mu,b*mu);
		}else{
			ly = y1 + (y2-y1)*(-tvalue);
			if(((i==sidebar.selected_voice)||(flags & 2))&&(pvm)){
				if(view_changed===true) {
					click_rectangle(x1+ww*i-click_b_s,y1-1,x1+ww*(i+1)+1+click_b_s,y2+1,index,2);
					mouse_click_actions[index] = static_mod_adjust;
					mouse_click_parameters[index] = [paramno, blockno, vlist[i]];
					mouse_click_values[index] = "";
					if(click_to_step>0)mouse_click_values[index]=click_to_step;
				}
				mouse_index++;
				index++;
				mu=0.5;				
			}
			lcd_main.message("paintrect",x1+ww*i,y1,x1+ww*i+ww2,ly,r*mu,g*mu,b*mu);
		}
	}

	ww2 -= 2;
	lcd_main.message("frgb",r,g,b);
	for(var i=0;i<vlist.length;i++){
		value = voice_parameter_buffer.peek(1,MAX_PARAMETERS*(vlist[i])+paramno);
		if(flags & 1){ //bipolar
			value = (2*value)-1;
			value = Math.min(Math.max(-1,value),1);
		}else{
			value = Math.min(Math.max(0,value),1);
		}
		if(value>=0){
			ly = y1 + (y2 - y1-2) * (1-value);		
		}else{
			ly = y1 + (y2 - y1-2)*(-value);
		}
		lcd_main.message("moveto",x1+(ww*i),ly);
		lcd_main.message("lineto",x1+(ww*i)+ww2,ly);
	}
}

function draw_h_slider(x1,y1,x2,y2,r,g,b,index,value){
	lcd_main.message("paintrect",x1,y1,x2,y2,r*bg_dark_ratio,g*bg_dark_ratio,b*bg_dark_ratio);
	if(view_changed===true) click_rectangle(x1,y1,x2,y2,index, 2);
	var lx;
 	if(value>=0) {
		if(value>=1){
			var m = 1 - (value % 1)*0.6;
			lcd_main.message("paintrect",x1,y1,x2,y2,(r*m),(g*m),(b*m));
		}
		lx = x1 +  (x2 - x1) * (value % 1);
		lcd_main.message("paintrect",x1,y1,lx,y2,r>>1,g>>1,b>>1);
	}else{
		if(value<=-1){
			var m = 1 - ((-value) % 1)*0.6;
			lcd_main.message("paintrect",x1,y1,x2,y2,(r*m),(g*m),(b*m));
		}
		lx = x1 + (x2 - x1) * (1-((-value) % 1));
		lcd_main.message("paintrect",lx,y1,x2,y2,r>>1,g>>1,b>>1);
	}
}

function clear_wave_graphic(n,newl){
	if(!Array.isArray(draw_wave[n-1])) draw_wave[n-1]=[[],[],[],[]];
	var i = 0;
	while(i<4){
		if(!Array.isArray(draw_wave[n-1][i])) draw_wave[n-1][i] = [];
		var t = 0;
		while(t<newl){
			draw_wave[n-1][i][t]=0;
			t++;
		}  
		i++;
	}
}

function draw_waveform(x1,y1,x2,y2,r,g,b,buffer,index,highlight){
	lcd_main.message("paintrect",x1,y1,x2,y2,r*bg_dark_ratio,g*bg_dark_ratio,b*bg_dark_ratio);
	var w = Math.floor((x2-x1-1)/2);
	var i,t,ch,s,dl,d,st;
	var hls;
	var hle ;
	var wmin,wmax;
	var subsamples = 2; //for the stochastic rendering
	if(view_changed===true){
		click_rectangle(x1,y1,x2,y2,index, 3);
	}
	if(!Array.isArray(draw_wave[buffer-1])){
		draw_wave[buffer-1] = [[],[],[],[]];
		subsamples = 20;
	}
	if(w!=draw_wave[buffer-1][0].length) {
		if(isNaN(draw_wave[buffer-1][0].length)){ 
			draw_wave[buffer-1][0] = [];
		}
		draw_wave[buffer-1][0].length = w;
		clear_wave_graphic(buffer,w);
		subsamples = 20;
	}
	var length = waves_dict.get("waves["+buffer+"]::length");
	st = Math.floor(waves_dict.get("waves["+buffer+"]::start")*w);
	d = Math.floor(waves_dict.get("waves["+buffer+"]::divisions")*(MAX_WAVES_SLICES-0.0001))+1;
	dl = waves_dict.get("waves["+buffer+"]::end") - waves_dict.get("waves["+buffer+"]::start");
	dl /= d;
	hls = w*(highlight);
	hle = w*(highlight+dl);
	var chunk = length/w;
	var chans = waves_dict.get("waves["+buffer+"]::channels");
	var h = 0.5*(y2-y1)/chans;
	dl *= w;
/*	lcd_main.message("frgb",90,90,90);
	if(w>250){
		for(t=0;t<d;t++){
			i = Math.floor(t*dl+st);
			lcd_main.message("moveto",x1+i+i,y1);
			lcd_main.message("lineto",x1+i+i,y2-fo1);
		}
		lcd_main.message("frgb",255,255,255);
		lcd_main.message("moveto",x1+st+st,y1);
		lcd_main.message("lineto",x1+st+st,y2-fo1);
		i=Math.floor(waves_dict.get("waves["+buffer+"]::end")*w);
		lcd_main.message("moveto",x1+i+i,y1);
		lcd_main.message("lineto",x1+i+i,y2-fo1);	
	}*/
	for(ch=0;ch<chans;ch++){
		var curc=1;
		if(highlight<1){ 
			lcd_main.message("frgb", r>>1,g>>1,b>>1);
			curc=0;
		}else{
			lcd_main.message("frgb",r,g,b);		
		}
		for(i=0;i<w;i++){
			wmin = draw_wave[buffer-1][ch*2][i];
			wmax = draw_wave[buffer-1][ch*2+1][i];
			t=subsamples;
			/*if(isNaN(wmin)){ wmin=1; }
			if(isNaN(wmax)){ wmax=-1; }*/
			for(;t>=0;t--){
				s=waves_buffer[buffer-1].peek(ch+1,Math.floor((i+Math.random())*chunk));
				if(s>wmax) wmax=s;
				if(s<wmin) wmin=s;
			}
			draw_wave[buffer-1][ch*2][i] = wmin;
			draw_wave[buffer-1][ch*2+1][i] = wmax;
			if((i>=hls)&&(i<=hle)&&(curc==0)){
				lcd_main.message("frgb",r,g,b);
				curc=1;
			}else if((i>hle)&&(curc==1)){
				curc=0;
				lcd_main.message("frgb", r>>1,g>>1,b>>1);
			}
			lcd_main.message("moveto",x1+i+i,y1+h*(1+wmin+2*ch)-1);
			lcd_main.message("lineto",x1+i+i,y1+h*(1+wmax+2*ch)+1);
			//post("\n",i,x1+i+i,"dw len",draw_wave[buffer-1][ch*2].length,wmin,wmax);
		}
	}
}


function draw_zoomable_waveform(x1,y1,x2,y2,r,g,b,buffer,index,highlight,zoom_offset,zoom_amount){
	if(zoom_amount==null){
		zoom_offset=-1;
		zoom_amount=1;
	}
	lcd_main.message("paintrect",x1,y1,x2,y2,r*bg_dark_ratio,g*bg_dark_ratio,b*bg_dark_ratio);
	if(view_changed===true) click_rectangle(x1,y1,x2,y2,index, 3);
	var i,t,ch,s,dl,d,st;
	var hls;
	var hle ;
	var wmin,wmax;
	var w = Math.floor((x2-x1-1)/2);
	if(!Array.isArray(draw_wave[buffer-1])){
		draw_wave[buffer-1] = [[],[],[],[]];
	}
	if(w!=draw_wave[buffer-1][0].length) {
		//post("\nclearing because W!=",w, draw_wave[buffer-1][0].length);
		draw_wave[buffer-1][0].length = w;
		clear_wave_graphic(buffer,w);
	}
	var length = waves_dict.get("waves["+buffer+"]::length");
	st = waves_dict.get("waves["+buffer+"]::start");//*w);
	d = Math.floor(waves_dict.get("waves["+buffer+"]::divisions")*(MAX_WAVES_SLICES-0.0001))+1;
	dl = waves_dict.get("waves["+buffer+"]::end") - waves_dict.get("waves["+buffer+"]::start");
	dl /= d;
	hls = w*(highlight);
	hle = w*(highlight+dl);
	var chunk = (waves.zoom_end-waves.zoom_start)*length/w;
	var chunkstart = waves.zoom_start*length / chunk;
	var chans = waves_dict.get("waves["+buffer+"]::channels");
	var h = 0.5*(y2-y1)/chans;
	if(w>250){
		lcd_main.message("frgb",40,40,40);
		for(t=0;t<d;t++){
			i = Math.floor(w*((t*dl+st)-waves.zoom_start)/(waves.zoom_end-waves.zoom_start));
			if((i>0)&&(i<w)){
				lcd_main.message("moveto",x1+i+i,y1);
				lcd_main.message("lineto",x1+i+i,y2-fo1);
			}
		}
/*		lcd_main.message("frgb",255,255,255);
		lcd_main.message("moveto",x1+st+st,y1);
		lcd_main.message("lineto",x1+st+st,y2-fo1);
		i=Math.floor(waves_dict.get("waves["+buffer+"]::end")*w);
		lcd_main.message("moveto",x1+i+i,y1);
		lcd_main.message("lineto",x1+i+i,y2-fo1);	*/	
	}
	for(ch=0;ch<chans;ch++){
		var curc=1;
		if(highlight<1){ 
			lcd_main.message("frgb", r>>1,g>>1,b>>1);
			curc=0;
		}else{
			lcd_main.message("frgb",r,g,b);		
		}
		for(i=0;i<w;i++){
			/*wmin = draw_wave[buffer-1][ch*2][i]|0;
			wmax = draw_wave[buffer-1][ch*2+1][i]|0;
			if(isNaN(wmin))wmin=0;
			if(isNaN(wmax))*/wmin=1; wmax=-1;
			for(t=0;t<20;t++){
				s=waves_buffer[buffer-1].peek(ch+1,Math.floor((i+chunkstart+Math.random())*chunk));
				if(s>wmax) wmax=s;
				if(s<wmin) wmin=s;
			}
			//draw_wave[buffer-1][ch*2][i] = wmin;
			//draw_wave[buffer-1][ch*2+1][i] = wmax;
			if((i>=hls)&&(i<=hle)&&(curc==0)){
				lcd_main.message("frgb",r,g,b);
				curc=1;
			}else if((i>hle)&&(curc==1)){
				curc=0;
				lcd_main.message("frgb", r>>1,g>>1,b>>1);
			}
			lcd_main.message("moveto",x1+i+i,y1+h*(1+wmin+2*ch)-1);
			lcd_main.message("lineto",x1+i+i,y1+h*(1+wmax+2*ch)+1);
			//post("\n",i,x1+i+i,"dw len",draw_wave[buffer-1][ch*2].length,wmin,wmax);
		}
	}
}

function draw_stripe(x1,y1,x2,y2,r,g,b,buffer,index){
	lcd_main.message("paintrect",x1,y1,x2,y2,r*bg_dark_ratio,g*bg_dark_ratio,b*bg_dark_ratio);
	if(view_changed===true) click_rectangle(x1,y1,x2,y2,index, 3);
	if(!Array.isArray(draw_wave[buffer-1])){
		draw_wave[buffer-1] = [[],[],[],[]];
	}
	var i,t,ch,s,dl,d,st;
	var wmin,wmax;
	var w = x2-x1;
//	post("\nok so",buffer,index,x1,waves.zoom_start,w);
	var zms=-1;zme=-1; ra = 1; rra=1;
	if(waves.selected == buffer-1){
		zms = Math.floor(waves.zoom_start*w*0.5);
		zme = Math.floor(waves.zoom_end*w*0.5);
		ra = (0.8-0.5*Math.abs(waves.zoom_end-waves.zoom_start));
		rra = 1/(0.1 + 0.8*Math.pow(waves.zoom_end-waves.zoom_start,2));
		lcd_main.message("paintrect", x1+zms*2, y1, x1+2*zme,y2, r*ra,g*ra,b*ra);
		zme++;
	}
	w = Math.floor((w-1)/2);
	var chunk = waves_dict.get("waves["+buffer+"]::length")/w;
	var chans = waves_dict.get("waves["+buffer+"]::channels");
	var h = 0.5*(y2-y1)/chans;
	for(ch=0;ch<chans;ch++){
		st = waves_dict.get("waves["+buffer+"]::start");
		d = Math.floor(waves_dict.get("waves["+buffer+"]::divisions")*(MAX_WAVES_SLICES-0.0001))+1;
		dl = waves_dict.get("waves["+buffer+"]::end") - st;
		st = Math.floor(st*w);
		dl /= d;
		dl *= w;
		if(!(waves.selected == buffer-1)||(dl!=1)){			
			lcd_main.message("frgb",60,60,60);
			for(t=0;t<d;t++){
				i = Math.floor(t*dl+st);
				lcd_main.message("moveto",x1+i+i,y1+h*2*ch);
				lcd_main.message("lineto",x1+i+i,y1+h*2*(ch+1));
			}
		}
		lcd_main.message("frgb",90,90,90);
		lcd_main.message("moveto",x1+st+st,y1+h*2*ch);
		lcd_main.message("lineto",x1+st+st,y1+h*2*(ch+1));
		i=Math.floor(waves_dict.get("waves["+buffer+"]::end")*w);
		lcd_main.message("moveto",x1+i+i,y1+h*2*ch);
		lcd_main.message("lineto",x1+i+i,y1+h*2*(ch+1));
		lcd_main.message("frgb",r,g,b);
		for(i=0;i<w;i++){
			wmin = draw_wave[buffer-1][ch*2][i];
			wmax = draw_wave[buffer-1][ch*2+1][i];
			if(isNaN(wmin))wmin=0;
			if(isNaN(wmax))wmax=0;
			for(t=0;t<20;t++){
				s=waves_buffer[buffer-1].peek(ch+1,Math.floor((i+Math.random())*chunk));
				if(s>wmax) wmax=s;
				if(s<wmin) wmin=s;
			}
			draw_wave[buffer-1][ch*2][i] = wmin;
			draw_wave[buffer-1][ch*2+1][i] = wmax;
			if(i==zms) lcd_main.message("frgb", r*rra,g*rra,b*rra);
			if(i==zme) lcd_main.message("frgb", r,g,b);
			lcd_main.message("moveto",x1+i+i,y1+h*(1+wmin+2*ch)-1);
			lcd_main.message("lineto",x1+i+i,y1+h*(1+wmax+2*ch)+1);
		}
	}
}



function draw_h_slider_labelled(x1,y1,x2,y2,r,g,b,index,value){
	lcd_main.message("paintrect",x1,y1,x2,y2,r*bg_dark_ratio,g*bg_dark_ratio,b*bg_dark_ratio);
	if(view_changed===true) click_rectangle(x1,y1,x2,y2,index, 2);
	var lx;
 	if(value>=0) {
		if(value>=1){
			var m = 1 - (value % 1)*0.6;
			lcd_main.message("paintrect",x1,y1,x2,y2,(r*m),(g*m),(b*m));
		}
		lx = x1 +  (x2 - x1) * (value % 1);
		lcd_main.message("paintrect",x1,y1,lx,y2,r>>1,g>>1,b>>1);
		lcd_main.message("moveto", (x1+2*fo1), (y2-2*fo1));
		if(value>0.3) {
			lcd_main.message("frgb", 0,0,0);
		}else{
			lcd_main.message("frgb" , r,g,b);
		}
		lcd_main.message("write", gain_display(value));
	}else{
		if(value<=-1){
			var m = 1 - ((-value) % 1)*0.6;
			lcd_main.message("paintrect",x1,y1,x2,y2,(r*m),(g*m),(b*m));
		}
		lx = x1 + (x2 - x1) * (1-((-value) % 1));
		lcd_main.message("paintrect",lx,y1,x2,y2,r>>1,g>>1,b>>1);
		lcd_main.message("moveto", (x1+2*fo1), (y2-2*fo1));
		if(value<-0.7) {
			lcd_main.message("frgb", 0,0,0);
		}else{
			lcd_main.message("frgb", r,g,b);
		}
		lcd_main.message("write", gain_display(value));
	}
}

function draw_2d_slider(x1,y1,x2,y2,r,g,b,index,value_x,value_y){
	lcd_main.message("paintrect",x1,y1,x2,y2,r*bg_dark_ratio,g*bg_dark_ratio,b*bg_dark_ratio);
	if(view_changed===true) click_rectangle(x1,y1,x2,y2,index, 4);
	var lx = x1 + 8 + (x2-x1-16)*value_x;
	var ly = y1 + 8 + (y2-y1-16)*(1-value_y);
	lcd_main.message("paintrect",(lx-4),(ly-4),(lx+4),(ly+4) ,r,g,b);
}

function draw_vector(x1,y1,x2,y2,r,g,b,index,angle){
	lcd_main.message("paintrect",x1,y1,x2,y2,r*bg_dark_ratio,g*bg_dark_ratio,b*bg_dark_ratio);
	lcd_main.message("paintoval",x1,y1,x2,y2,0,0,0);
	lcd_main.message("frgb",r,g,b);
	if(view_changed===true) click_rectangle(x1,y1,x2,y2,index, 2);
	lcd_main.message("moveto",((x1+x2)/2),((y1+y2)/2));
	lcd_main.message("lineto",(((x1+x2)/2)+Math.sin(6.28*angle)*(x2-x1-16)/2),(((y1+y2)/2)-Math.cos(6.28*angle)*(y2-y1-16)/2));
}

function draw_spread_levels(x1,y1,x2,y2,r,g,b,index,vector,offset,v1,v2,scale){
	if((v1==1)&&(v2==1)) return;
	var cx,cy,l;
	var ux = (x2-x1)/v1;
	var uy = (y2-y1)/v2;
	var minl=99,maxl=-99;
	for(cx=v1-1;cx>=0;cx--){
		for(cy=0;cy<v2;cy++){
			l = Math.abs(scale)*spread_level(cx, cy, offset,vector, v1, v2);
			lcd_main.message("paintrect",x1+cx*ux,y1+cy*uy,x1+(cx+1)*ux,y1+(cy+1)*uy,r*l,g*l,b*l);
			if(l<minl)minl=l;
			if(l>maxl)maxl=l;
		}
	}
	if(sidebar.mode != "connections"){
		setfontsize(fontsmall);
		if(minl!=maxl){ //TODO THIS IS MESSY, WHOLE UI AROUND SPREAD NEEDS A LOT MORE EXPLAINING
			//setfontsize( Math.min(uy,ux)*0.4);
			if(Math.min(uy,ux)*0.4>=fontsmall){
				lcd_main.message("frgb", menucolour);
				for(cx=v1-1;cx>=0;cx--){
					for(cy=0;cy<v2;cy++){
						l = scale*spread_level(cx, cy, offset,vector, v1, v2);
						lcd_main.message("moveto",x1+(cx+0.05)*ux,y1+(cy+0.95)*uy);
						lcd_main.message("write",l.toPrecision(2));				
					}
				}
			}
		}else{
			//maxl*=scale;
			lcd_main.message("frgb",0,0,0);
			lcd_main.message("moveto",(x1+5),(y1+(y2-y1)*0.95));
			lcd_main.message("write","x"+maxl.toPrecision(3));
		}
	}
	if(view_changed===true) click_rectangle(x1,y1,x2,y2,index, 4);
}

function wipe_midi_meters(){
	for(i = meters_updatelist.midi.length-1; i>=0; i--){
		var block=meters_updatelist.midi[i][0];
		var voice=meters_updatelist.midi[i][1];
		if(blocks_meter[block][voice] !== 'undefined'){
			var polyvoice = meters_updatelist.midi[i][2];
			if(polyvoice === null){
				post("\n\n\n\n unsafe poke");
				sughstghldfjsl
				return 0;
			}
			midi_meters_buffer.poke(1,polyvoice, [1,0,0,0,0,0,0]);
		}
	}
	meters_updatelist.midi = [];
}


function draw_spread(x1,y1,x2,y2,r,g,b,index,angle,amount,v1,v2){
	t = (1-amount)*(x2-x1-8)/2;
	lcd_main.message("paintrect",x1,y1,x2,y2,r/6,g/6,b/6);
	lcd_main.message("paintoval",x1,y1,x2,y2,0,0,0);
	lcd_main.message("frameoval",x1,y1,x2,y2,r/2,g/2,b/2);
	lcd_main.message("frameoval",(x1+t),(y1+t),(x2-t),(y2-t),r,g,b);
	if(view_changed===true) click_rectangle(x1,y1,x2,y2,index, 4);
	var cx = (x1+x2)/2;
	var cy = (y1+y2)/2;
	var r1 = (x2-x1)/2;
	var w = r1*0.1;
	var i=0;
	var col=[r,g,b];
	for(i=0;i<v1;i++){
		lcd_main.message("paintrect",(cx-w+r1*Math.sin(6.28*i/v1)),(cy-w-r1*Math.cos(6.28*i/v1)),(cx+w+r1*Math.sin(6.28*i/v1)),(cy+w-r1*Math.cos(6.28*i/v1)),col);
		if(i==0) col = [r/2,g/2,b/2];
	}
	r1 -= t;
	col=[r,g,b];
	for(i=0;i<v2;i++){
		lcd_main.message("paintrect",(cx-w+r1*Math.sin(6.28*(angle + i/v2))),(cy-w-r1*Math.cos(6.28*(angle + i/v2))),(cx+w+r1*Math.sin(6.28*(angle + i/v2))),(cy+w-r1*Math.cos(6.28*(angle + i/v2))),col);
		if(i==0) col = [r/2,g/2,b/2];
	}
}

function custom_ui_element(type,x1,y1,x2,y2,r,g,b,dataindex,paramindex,highlight,xp1,xp2,xp3,xp4){
	if(type=="data_v_scroll"){
		draw_v_slider(x1,y1,x2,y2,r,g,b,mouse_index,voice_data_buffer.peek(1,dataindex));
		mouse_click_actions[mouse_index] = data_edit;
		mouse_click_parameters[mouse_index] = [dataindex,0];
		mouse_click_values[mouse_index] = 0;
		if(paramindex==1){
			mouse_click_parameters[mouse_index] = [dataindex,1,y1,y2];
		}else if(paramindex==2){
			mouse_click_parameters[mouse_index] = [dataindex,2,x1,x2];
		} //for datasliders this holds the click_to_set value
		mouse_index++;			
	}else if(type=="data_h_scroll"){
		draw_h_slider(x1,y1,x2,y2,r,g,b,mouse_index,voice_data_buffer.peek(1,dataindex));
		mouse_click_actions[mouse_index] = data_edit;
		mouse_click_parameters[mouse_index] = [dataindex,0];
		mouse_click_values[mouse_index] = 0;
		if(paramindex==1){
			mouse_click_parameters[mouse_index] = [dataindex,1,y1,y2];
		}else if(paramindex==2){
			mouse_click_parameters[mouse_index] = [dataindex,2,x1,x2];
		} //for datasliders this holds the click_to_set value
		mouse_index++;			
	}else if(type=="param_v_scroll"){//0=block,1=paramno
		draw_v_slider(x1,y1,x2,y2,r,g,b,mouse_index,parameter_value_buffer.peek(1,MAX_PARAMETERS*dataindex+paramindex));
		mouse_click_actions[mouse_index] = sidebar_parameter_knob;
		mouse_click_parameters[mouse_index] = [paramindex, dataindex];
		mouse_click_values[mouse_index] = "";
		mouse_index++;
	}else if(type=="param_toggle"){//0=block,1=paramno
		draw_v_slider(x1,y1,x2,y2,r,g,b,mouse_index,parameter_value_buffer.peek(1,MAX_PARAMETERS*dataindex+paramindex)>0.5);
		mouse_click_actions[mouse_index] = sidebar_parameter_knob;
		mouse_click_parameters[mouse_index] = [paramindex, dataindex];
		mouse_click_values[mouse_index] = "";
		mouse_index++;
	}else if(type=="mouse_passthrough"){
		click_rectangle( x1,y1,x2,y2, mouse_index, 7);
		mouse_click_actions[mouse_index] = custom_mouse_passthrough;
		mouse_click_parameters[mouse_index] = dataindex+1; //custom_block+1;
		mouse_click_values[mouse_index] = 0;//[x1,y1,x2,y2];
		mouse_index++;
	}else if(type=="direct_mouse_passthrough"){
		click_rectangle( x1,y1,x2,y2, mouse_index, 7);
		mouse_click_actions[mouse_index] = custom_direct_mouse_passthrough;
		mouse_click_parameters[mouse_index] = paramindex; //custom_block+1;
		mouse_click_values[mouse_index] = [r,g,b,dataindex,highlight,x1,y1,x2,y2];
		mouse_index++;
	}else if(type =="waveform_slice_highlight"){
		draw_waveform(x1,y1,x2,y2,r,g,b,paramindex,mouse_index,highlight)
		mouse_click_actions[mouse_index] = custom_mouse_passthrough;
		mouse_click_parameters[mouse_index] = dataindex;//+1; //custom_block+1;
		mouse_click_values[mouse_index] = 0;
		mouse_index++;		
	}else if(type =="direct_button"){ // draw the button yourself so you can get your text nice, leaves r,g,b free to carry target(type),target(number),message
		// so far only used on stretch looper. downside is it can't respond visually to mouse click
		click_rectangle( x1, y1, x2, y2, mouse_index, 7);
		mouse_click_actions[mouse_index] = custom_direct_mouse_button;
		mouse_click_parameters[mouse_index] = paramindex; //custom_block+1;
		mouse_click_values[mouse_index] = [r,g,b,dataindex,highlight];
		mouse_index++;				
	}else if(type=="opv_button"){
		var block = xp1;//dataindex; 
		var vc=view_changed;
		view_changed = true;
		var pv = voice_parameter_buffer.peek(1,MAX_PARAMETERS*paramindex+dataindex);
		draw_button(x1,y1,x2,y2,r*0.5,g*0.5,b*0.5,mouse_index, highlight,pv>0.5);
		mouse_click_actions[mouse_index] = static_mod_adjust;
		mouse_click_parameters[mouse_index] = [dataindex, block, paramindex];
		mouse_click_values[mouse_index] = 0.99* (pv<=0.5);
		view_changed = vc;
		mouse_index++;		
	}else if(type=="opv_v_slider"){
		var block = highlight; 
		var vc=view_changed;
		view_changed = true;
		var pv = voice_parameter_buffer.peek(1,MAX_PARAMETERS*paramindex+dataindex);
		//post("\nslider",dataindex,block,paramindex,pv);
		draw_v_slider(x1,y1,x2,y2,r*0.5,g*0.5,b*0.5,mouse_index, pv);
		mouse_click_actions[mouse_index] = static_mod_adjust;
		mouse_click_parameters[mouse_index] = [dataindex, block, paramindex];
		mouse_click_values[mouse_index] = null; //0.99* (pv<=0.5);
		view_changed = vc;
		mouse_index++;		

	}
}

function flock_axes(v){
	flock_cubexy.enable = v;
	flock_cubexz.enable = v;
	flock_cubeyz.enable = v;
}

function center_view(resetz){
	var i;
	var x,y;
	var maxx=0,minx=0,miny=0,maxy=0;
	for(i=0;i<MAX_BLOCKS;i++){
		if(blocks.contains("blocks["+i+"]::name")){
			x=blocks.get("blocks["+i+"]::space::x");
			y=blocks.get("blocks["+i+"]::space::y");
			if(x<minx){ 
				minx=x;
			}else if(x>maxx){
				maxx=x;
			}
			if(y<miny){
				miny=y;
			}else if(y>maxy){
				maxy=y;
			}
		}
	}
	var w = maxx-minx;
	var h = maxy-miny;
	var d = Math.max(w,h);
	
	
	camera_position[1] = 0.5*(maxy+miny);
	if(resetz || (camera_position[2]<1)) camera_position[2] = 23*Math.sqrt(d/8);
	if(sidebar.mode!="none"){
		camera_position[0] = (maxx * 0.8 + minx * 0.2);
		if(sidebar.mode=="file_menu") camera_position[0] = (maxx);
		camera_position[2] *= 1.5;
	}else{
		camera_position[0] = (maxx+minx)*0.5;
	}
	camera();
	redraw_flag.flag |= 8;	
}

function request_redraw(n){
	if(displaymode!="blocks") n &= 19; //removes 4, block redraw and 8, block colours
	redraw_flag.flag |= n;
}

function draw_menu_hint(){
	var col = menucolour;
	if(blocktypes.contains(usermouse.hover[1]+"::colour")){
		col = blocktypes.get(usermouse.hover[1]+"::colour");
		col = [col[0]*1.2,col[1]*1.2,col[2]*1.2];
	}
	var cod = [col[0]*bg_dark_ratio,col[1]*bg_dark_ratio,col[2]*bg_dark_ratio];
	var topspace=(menu.mode == 3)+1.1*(loading.progress!=0);
	lcd_main.message("clear");
	lcd_main.message("paintrect", sidebar.x,9+1.1*(loading.progress!=0)*fontheight,sidebar.x2,9+(topspace+1)*fontheight,menudarkest);
	lcd_main.message("frgb",menucolour);
	lcd_main.message("textface", "bold");
	setfontsize(fontsmall*2);
	lcd_main.message("moveto", sidebar.x+fo1*2,9+fontheight*(0.75+1.1*(loading.progress!=0)));
	if(menu.mode == 1){
		lcd_main.message("write", "swap block:");
		if(!menu.show_all_types){
			topspace += 1.1;
			lcd_main.message("paintrect",sidebar.x,9+fontheight*(topspace),sidebar.x2,9+fontheight*(topspace+1),menudark);
			lcd_main.message("frgb",0,0,0);
			setfontsize(fontheight/2.5);
			lcd_main.message("moveto", sidebar.x+fo1*2,9+fontheight*(topspace+0.35));
			lcd_main.message("write","just showing (potentially) matching types,");
			lcd_main.message("moveto", sidebar.x+fo1*2,9+fontheight*(topspace+0.8));
			lcd_main.message("write","click here to show all");
			click_zone(menu_show_all,1,1,sidebar.x,9+fontheight*(topspace),sidebar.x2,9+fontheight*(topspace+1),mouse_index,1);		
		}
	}else if(menu.mode == 2){
		lcd_main.message("write", "insert block in connection:");
	}else if(menu.mode == 0){
		lcd_main.message("write", "add new block:");
	}else if(menu.mode == 3){
		lcd_main.message("write", "substitute for "); 
		lcd_main.message("moveto", sidebar.x+fontheight*0.2,9+fontheight*(1.75+1.1*(loading.progress!=0)));
		lcd_main.message("write", menu.swap_block_target);
	}
	if(menu.search!=""){
		topspace += 1.1;
		lcd_main.message("paintrect",sidebar.x,9+fontheight*(topspace),sidebar.x2,9+fontheight*(topspace+1),menucolour);
		lcd_main.message("frgb",0,0,0);
		lcd_main.message("moveto", sidebar.x+fo1*2,9+fontheight*(topspace+0.75));
		lcd_main.message("write","search: "+menu.search);
	}
	
	
	if(blocktypes.contains(usermouse.hover[1]+"::help_text")){
		var hint=blocktypes.get(usermouse.hover[1]+"::help_text")+" ";
		//		post("\n"+usermouse.hover[1]+" : "+hint);
		
		hint = hint+"                       ";
		var hintrows = 0.4+ hint.length / 27+hint.split("£").length-1;
		lcd_main.message("paintrect", sidebar.x,9+(topspace+1.1)*fontheight,sidebar.x2,9+fontheight*(2.1+topspace),cod);
		
		lcd_main.message("paintrect",sidebar.x,9+fontheight*(topspace+2.2),sidebar.x2,9+fontheight*(4.1+topspace+0.45*hintrows),cod);
		lcd_main.message("frgb",col);
		lcd_main.message("moveto", sidebar.x+fo1*2,9+fontheight*(topspace+0.75));
		var rowstart=0;
		var rowl = 54;
		var rowend=rowl;
		lcd_main.message("paintrect", sidebar.x,9+fontheight*(1.1+topspace),sidebar.x2,9+fontheight*(2.1+topspace),cod);
		lcd_main.message("frgb",col);
		lcd_main.message("moveto", sidebar.x+fontheight*0.2,9+fontheight*(1.85+topspace));
		lcd_main.message("write", usermouse.hover[1]);
		setfontsize(fontheight/2.5);
		lcd_main.message("textface", "normal");
		var bold=0;
		var sameline=0;
		for(var ri=0;ri<hintrows;ri++){
			while(((hint[rowend]!=' ')&&(hint[rowend]!='£')) && (rowend>1+rowstart)){ rowend--; }
			var sliced = hint.slice(rowstart,rowend);
			if(!sameline) {
				lcd_main.message("moveto",sidebar.x+fontheight*0.2,9+fontheight*(2.9+topspace+0.45*(ri)));
				//lcd_main.message("moveto",sidebar.x+fontheight*0.2,y_offset+fontheight*(0.75+0.4*ri));
			}else{
				ri--;
			}
			sameline=0;
			var newlineind = sliced.indexOf("£");
			var boldind = sliced.indexOf("*");		
			if((boldind>-1)&&(newlineind>-1)){
				if(boldind<newlineind){
					newlineind=-1;
				}else{
					boldind=-1;
				}
			}		
			if(newlineind>-1){
				rowend = rowstart+ sliced.indexOf("£");
				sliced = hint.slice(rowstart,rowend);
				sameline=0;
			}
			if(boldind>-1){
				sameline=1;
				bold=1-bold;
				rowend = rowstart+ sliced.indexOf("*");
				sliced = hint.slice(rowstart,rowend);
			}
			lcd_main.message("write",sliced);
			if(!sameline){
				rowstart=rowend+1;
				rowend+=rowl;
			}else{
				var t = rowstart+rowl;
				rowstart=rowend+1
				rowend=t;
			}
			if(bold){
				lcd_main.message("textface", "bold");
			}else{
				lcd_main.message("textface", "normal");
			}	
		}
		if(!bold) lcd_main.message("textface", "bold");
	}
	lcd_main.message("bang");
}
	

function conn_draw_from_outputs_list(i, f_name, ty, y_offset, truncate) {
	var curr=-1;
	if(connections.get("connections["+i+"]::from::output::type")==ty){
		curr = (connections.get("connections["+i+"]::from::output::number"))
	}
	var desc = 0; // this enable displaying descriptions here, but it always feels like redundant text..
	if(sidebar.connection.help && (blocktypes.contains(f_name + "::connections::out::descriptions::" + ty))) desc = 1;
	if(blocktypes.contains(f_name + "::connections::out::" + ty)){
		var l = blocktypes.get(f_name + "::connections::out::" + ty);
		if (!Array.isArray(l)) l = [l];
		var c = config.get("palette::connections::" + ty);
		var len = l.length;
		if(truncate!=null) len = Math.min(len,truncate);
		for (var o = 0; o < len; o++) {
			if(curr==o){
				lcd_main.message("paintrect", sidebar.x + fo1 * 12, y_offset, sidebar.x2, y_offset + 6 * fo1, c);
				lcd_main.message("frgb", 0,0,0);
			}else{
				lcd_main.message("paintrect", sidebar.x + fo1 * 12, y_offset, sidebar.x2, y_offset + 6 * fo1, c[0] * bg_dark_ratio, c[1] * bg_dark_ratio, c[2] * bg_dark_ratio);
				lcd_main.message("frgb", c);
			}
			lcd_main.message("moveto", sidebar.x + fo1 * 14, y_offset + 4 * fo1);
			lcd_main.message("write", l[o]);
			lcd_main.message("frgb", c[0] * 0.5, c[1] * 0.5, c[2] * 0.5);
			lcd_main.message("write", ty);
			if(desc && (blocktypes.get(f_name + "::connections::out::descriptions::" + ty+"["+o+"]")!="")){
				lcd_main.message("moveto", sidebar.x + fo1 * 15, y_offset + 11 * fo1);
				//lcd_main.message("frgb", c);
				lcd_main.message("write", blocktypes.get(f_name + "::connections::out::descriptions::" + ty+"["+o+"]"));
				click_zone(conn_set_from_output, i, [ty, o], sidebar.x + fo1 * 12, y_offset, sidebar.x2, y_offset + 13 * fo1, mouse_index, 1);
				y_offset+=7*fo1;
			}else{
				click_zone(conn_set_from_output, i, [ty, o], sidebar.x + fo1 * 12, y_offset, sidebar.x2, y_offset + 6 * fo1, mouse_index, 1);
			}
			y_offset+=7*fo1;
		}
	}
	return y_offset;
}

function conn_draw_to_inputs_list(i, t_name, ty, y_offset) {
	var curr=-1;
	if(connections.get("connections["+i+"]::to::input::type")==ty){
		curr = (connections.get("connections["+i+"]::to::input::number"))
	}
	var l = [];
	if(ty=="block"){
		l = ["mute toggle", "mute"];
	}else if(ty=="parameters"){
		var t = blocktypes.getsize(t_name+"::parameters");
		for(var p=0;p<t;p++){
			if(blocktypes.contains(t_name+"::parameters["+p+"]::nomap") && (blocktypes.get(t_name+"::parameters["+p+"]::nomap")==1)){
				//skip
				l.push(null);
			}else{
				l.push(blocktypes.get(t_name+"::parameters["+p+"]::name"));
			}
		}
	}else if(blocktypes.contains(t_name + "::connections::in::" + ty)){
		l = blocktypes.get(t_name + "::connections::in::" + ty);
		if (!Array.isArray(l)) l = [l];
	}
	if(l.length>0){
		var c = config.get("palette::connections::" + ty);
		for (var o = 0; o < l.length; o++) {
			if(l[o]!=null){
				if(curr==o){
					lcd_main.message("paintrect", sidebar.x + fo1 * 12, y_offset, sidebar.x2, y_offset + 6 * fo1, c);
					lcd_main.message("frgb", 0,0,0);
				}else{
					lcd_main.message("paintrect", sidebar.x + fo1 * 12, y_offset, sidebar.x2, y_offset + 6 * fo1, c[0] * bg_dark_ratio, c[1] * bg_dark_ratio, c[2] * bg_dark_ratio);
					lcd_main.message("frgb", c);
				}
				lcd_main.message("moveto", sidebar.x + fo1 * 14, y_offset + 4 * fo1);
				lcd_main.message("write", l[o]);
				lcd_main.message("frgb", c[0] * 0.5, c[1] * 0.5, c[2] * 0.5);
				lcd_main.message("write", ty);
				click_zone(conn_set_to_input, i, [ty, o], sidebar.x + fo1 * 12, y_offset, sidebar.x2, y_offset + 6 * fo1, mouse_index, 1);
				y_offset+=7*fo1;
			}
		}
	}
	return y_offset;
}
