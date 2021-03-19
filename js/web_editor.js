


	var framecontentedit = true;
	submitTryit()

	function submitTryit(n) {
		if (window.editor) {
			window.editor.save();
		}
		var text = $Id("textareaCode").value;
		if (window.editor) {
			var text = window.editor.getDoc().getValue("\n");
		}
		text = text.replace(/\n\n\n/g,"\n\n"); // normalize newlines (??!!)
		var ifr = $Id("iframeResult");

		var ifrw = (ifr.contentWindow) ? ifr.contentWindow : (ifr.contentDocument.document) ? ifr.contentDocument.document : ifr.contentDocument;
		ifrw.document.open();
		ifrw.document.write(text);  
		ifrw.document.close();
		//23.02.2016: contentEditable is set to true, to fix text-selection (bug) in firefox.
		//(and back to false to prevent the content from being editable)
		//(To reproduce the error: Select text in the result window with, and without, the contentEditable statements below.)  
		if (ifrw.document.body && !ifrw.document.body.isContentEditable) {
			ifrw.document.body.contentEditable = true;
			ifrw.document.body.contentEditable = false;
		}
		ifrw.document.body.contentEditable = framecontentedit;

	}

	function reEdited() {
		var text = frameHTML();
		$Id("textareaCode").value = text;
		window.editor.getDoc().setValue(text);
	}

	function showFrameSize() {
		$Id("framesize").innerHTML = "Screen Size: <span>" + $Id("iframecontainer")["clientWidth"] + " x " + $Id("iframecontainer")["clientHeight"] + "</span>";
	}

	var layout = "horizontal";
	var leftwidthperc = 50 ; var leftheightperc = 50 ;

	if ((window.screen.availWidth <= 768 && window.innerHeight > window.innerWidth) ) {restack();}

	function restack() {
		var l = $Id("textareacontainer");
		var c = $Id("dragbar");
		var r = $Id("iframecontainer");
		if (layout == "vertical") {
			l.style["height"] = c.style["height"] = r.style["height"] = "100%";
			l.style["width"] = "calc(" + leftwidthperc + "% - 6px)";
			c.style["width"] = "12px";
			c.style["cursor"] = "col-resize";
			r.style["width"] = "calc(" + (100 - leftwidthperc) + "% - 6px)";
			layout = "horizontal"
		} else {
			l.style["width"] = c.style["width"] = r.style["width"] = "100%";
			l.style["height"] = "calc(" + leftheightperc + "% - 6px)";
			c.style["height"] = "12px";
			c.style["cursor"] = "row-resize";
			r.style["height"] = "calc(" + (100 - leftheightperc) + "% - 6px)";
			layout = "vertical"		
		}
		showFrameSize();
	}

	dragBalance($Id(("dragbar")));

	function dragBalance(balancer) {
		if (window.addEventListener) {
			balancer.addEventListener("mousedown", function(e) {dragstart(e);});
			balancer.addEventListener("touchstart", function(e) {dragstart(e);});
			window.addEventListener("mousemove", function(e) {dragmove(e);});
			window.addEventListener("touchmove", function(e) {dragmove(e);});
			window.addEventListener("mouseup", dragend);
			window.addEventListener("touchend", dragend);
		}

		var dragging = false;
		var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
		function dragstart(e) {
			e.preventDefault();
			e = e || window.event;
			// get the mouse cursor position at startup:
			pos3 = e.clientX;
			pos4 = e.clientY;
			dragging = true;
		}

		function dragmove(e) {
			var perc;
			if (dragging) {
				// show overlay to avoid interfering of mouse moving with textarea
				$Id("shield").style.display = "block";        
				e = e || window.event;
				// calculate the new cursor position:
				pos1 = pos3 - e.clientX;
				pos2 = pos4 - e.clientY;
				pos3 = e.clientX;
				pos4 = e.clientY;
				// set the element's new size:
				if (layout == "vertical") {
					var pos = pos2;
					var axe1 = "clientHeight";
					var axe2 = "height";
					perc = (balancer.previousElementSibling[axe1] + (balancer[axe1] / 2) - pos) * 100 / balancer.parentElement[axe1];
					leftheightperc = perc;
				} else {
					var pos = pos1;
					var axe1 = "clientWidth";
					var axe2 = "width";
					perc = (balancer.previousElementSibling[axe1] + (balancer[axe1] / 2) - pos) * 100 / balancer.parentElement[axe1];
					leftwidthperc = perc;
				}
				if (perc > 5 && perc < 95) {
					balancer.previousElementSibling.style[axe2] = "calc(" + (perc) + "% - " + (balancer[axe1] / 2) + "px)";
					balancer.nextElementSibling.style[axe2] = "calc(" + (100 - perc) + "% - " + (balancer[axe1] / 2) + "px)";
				}
				showFrameSize();
			}
		}
		function dragend() {
			$Id("shield").style.display = "none";
			dragging = false;
			if (window.editor) {
				window.editor.refresh();
			}
		}
	}

	/*
	function keypressed(e) {
		if (e.key != "ArrowLeft" && e.key != "ArrowRight" && e.key != "ArrowUp" && e.key != "ArrowDown") {submitTryit(1)};
	}
	*/

	function keypressedinframe(e) {
		if (e.key != "ArrowLeft" && e.key != "ArrowRight" && e.key != "ArrowUp" && e.key != "ArrowDown") {reEdited()};
		setTimeout(reEdited,100);
	}
	if (window.addEventListener) {
		window.addEventListener("load", showFrameSize);
		$Id("textareacontainer").addEventListener("keyup", function(e) {keypressed(e);});
	}
	frameWindow().addEventListener("keyup", keypressedinframe); 
	


	/*
	function setFocusIframe() {frameWindow().focus();}
	$Id("iframeResult").contentWindow.addEventListener("mousedown", function(e) {setTimeout(setFocusIframe, 100);return false});
	*/
	function colorcoding() {  
		window.editor = CodeMirror.fromTextArea($Id("textareaCode"), {
			mode: "text/html",
			htmlMode: true,
			lineWrapping: true,
			smartIndent: true,
			indentUnit: 4,
			tabSize: 4,
			indentWithTabs: true,
			addModeClass: true,
			autoCloseTags: true,
			autoCloseBrackets: true
		});
		//window.editor.on("change", function () {window.editor.save();});
		//window.editor.on("change", function () {submitTryit(1)}); better avoid this due to "conflict" with contentEditable
	}
	colorcoding();

	function frameWindow(){
		var ifr = $Id("iframeResult");
		var ifrw = (ifr.contentWindow) ? ifr.contentWindow : (ifr.contentDocument.document) ? ifr.contentDocument.document : ifr.contentDocument;
		return ifrw;
	}



	function frameEditable() {
		$Id("checkedit").value = ~ $Id("checkedit").value;
		if ($Id("checkedit").value == 0) {
			framecontentedit = true;
			$Id("switchflag").innerHTML = "ON";
		} else {
			framecontentedit = false;
			$Id("switchflag").innerHTML = "OFF";
		}
		submitTryit();
		reEdited();
	}

