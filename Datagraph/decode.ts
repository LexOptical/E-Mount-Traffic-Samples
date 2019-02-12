import { SonyMessage, MessageIndicies } from "./messsage";
import { Chart, ChartDataSets, ChartConfiguration, ChartPoint } from "chart.js";

var content: string;
let chart: Chart;

function nextPacket() {
	var start = content.indexOf("F0", 0);
	var end = content.indexOf("55\n", 0);
	if (start == -1 && end == -1) {
		return null;
	}
	var match = content.substring(start, end + 2);
	content = content.substring(end + 2);
	return match;
}

function loadPackets(): SonyMessage[] {
	var counts: any = {};
	var messages = new Array();
	var packet = nextPacket();
	while (packet != null) {
		var message = new SonyMessage(packet);
		var id = message.getIdHex();
		counts[id] = counts[id] ? counts[id] + 1 : 1;
		messages.push(message);
		packet = nextPacket();
	}

	(document.getElementById("messageStats") as HTMLParagraphElement).innerHTML = printCounts(counts);
	(document.getElementById("startMessage") as HTMLInputElement).value = '0';
	(document.getElementById("endMessage") as HTMLInputElement).value = '' + messages.length

	return messages;
}

function printCounts(counts: any): string {
	var html = "<table><tr><th>Message ID</th><th>Count</th></tr>";
	var keys = Object.keys(counts);
	keys.forEach(key => {
		html += `<tr><td>${key}</td><td>${counts[key]}</td></tr>`;
	});
	return html + "</table>";
}


var myImageData: ImageData;
function setColorIndicesForCoord(x: number, y: number, value: number) {
	const red = y * (myImageData.width * 4) + x * 4;
	const lookup = value * 4;
	myImageData.data[red] = colorMap[lookup];
	myImageData.data[red + 1] = colorMap[lookup + 1];
	myImageData.data[red + 2] = colorMap[lookup + 2];
	myImageData.data[red + 3] = 255;
};

function setColorIndicesForCoordQuad(x: number, y: number, value: number) {
	setColorIndicesForCoord(x * 2, y * 2, value);
	setColorIndicesForCoord(x * 2 + 1, y * 2, value);
	setColorIndicesForCoord(x * 2, y * 2 + 1, value);
	setColorIndicesForCoord(x * 2 + 1, y * 2 + 1, value);
}

function saveState() {
	var localStorage = window.localStorage;
	localStorage.setItem("data", (document.getElementById("traceFile") as HTMLTextAreaElement).value);
}

export function loadState() {
	var localStorage = window.localStorage;
	(document.getElementById("traceFile") as HTMLTextAreaElement).value = localStorage.getItem("data") || "";
}

function updateMiniMapPos(event: any) {
	var x = event.layerX;
	var y = event.layerY;
	let minimappos = (document.getElementById("minimappos") as HTMLParagraphElement);
	let message = miniMapMessageLookup[x >> 1];
	if (message && (y >> 1) < message.getLength()) {
		minimappos.innerText = "Messge type:" + message.getIdHex() + " byte#:" + (y >> 1) + " value: " + hexFormat(message.buf.readUInt8(y >> 1));
	} else {
		minimappos.innerText = "out of bounds";
	}
}

function hexFormat(num: number): string {
	let v = num.toString(16).toUpperCase();
	return v.length == 1 ? '0x0' + v : '0x' + v;
}

let colorMap: Buffer;
function loadColorMap() {
	var colorOption = (document.getElementsByClassName(
		"colorMapOption"
	)[0] as HTMLSelectElement).value;
	switch (colorOption) {
		case "0":
			colorMap = Buffer.from([18, 17, 32, 255, 1, 0, 18, 255, 0, 0, 25, 255, 1, 1, 34, 255, 1, 1, 43, 255, 0, 1, 50, 255, 0, 1, 58, 255, 1, 1, 66, 255, 1, 0, 71, 255, 0, 0, 76, 255, 1, 0, 81, 255, 2, 0, 85, 255, 2, 0, 90, 255, 2, 0, 95, 255, 4, 1, 100, 255, 7, 1, 105, 255, 8, 1, 108, 255, 9, 1, 110, 255, 12, 1, 112, 255, 14, 2, 114, 255, 15, 1, 114, 255, 17, 1, 115, 255, 19, 0, 117, 255, 21, 0, 120, 255, 24, 0, 122, 255, 26, 0, 124, 255, 30, 0, 128, 255, 35, 0, 131, 255, 39, 1, 134, 255, 43, 1, 136, 255, 47, 1, 139, 255, 51, 2, 140, 255, 52, 2, 141, 255, 53, 1, 141, 255, 56, 1, 141, 255, 58, 0, 141, 255, 62, 0, 144, 255, 66, 1, 147, 255, 70, 1, 148, 255, 73, 1, 149, 255, 74, 0, 148, 255, 75, 0, 147, 255, 77, 0, 147, 255, 79, 0, 148, 255, 83, 1, 149, 255, 86, 1, 149, 255, 89, 1, 149, 255, 93, 0, 150, 255, 97, 0, 152, 255, 100, 0, 153, 255, 103, 1, 154, 255, 106, 1, 155, 255, 109, 0, 154, 255, 111, 1, 154, 255, 113, 1, 154, 255, 115, 0, 153, 255, 117, 0, 153, 255, 119, 1, 153, 255, 122, 1, 153, 255, 125, 1, 154, 255, 130, 1, 154, 255, 134, 1, 154, 255, 136, 0, 153, 255, 139, 0, 152, 255, 143, 1, 151, 255, 145, 1, 150, 255, 147, 0, 150, 255, 150, 0, 150, 255, 153, 0, 151, 255, 155, 1, 152, 255, 157, 1, 152, 255, 158, 1, 151, 255, 161, 1, 150, 255, 164, 1, 149, 255, 167, 1, 149, 255, 168, 1, 150, 255, 170, 1, 150, 255, 172, 1, 149, 255, 172, 1, 149, 255, 173, 0, 148, 255, 175, 1, 147, 255, 177, 2, 148, 255, 180, 4, 148, 255, 181, 4, 146, 255, 182, 5, 144, 255, 183, 6, 143, 255, 183, 6, 142, 255, 185, 6, 141, 255, 186, 5, 141, 255, 188, 5, 141, 255, 189, 6, 141, 255, 190, 7, 141, 255, 191, 8, 140, 255, 193, 10, 140, 255, 195, 12, 141, 255, 196, 13, 139, 255, 198, 14, 137, 255, 199, 15, 134, 255, 202, 17, 132, 255, 203, 19, 132, 255, 204, 20, 130, 255, 204, 19, 127, 255, 205, 22, 124, 255, 208, 25, 122, 255, 207, 27, 120, 255, 208, 27, 116, 255, 209, 27, 114, 255, 210, 29, 113, 255, 211, 30, 111, 255, 211, 31, 108, 255, 213, 33, 106, 255, 215, 36, 103, 255, 217, 39, 98, 255, 220, 42, 92, 255, 222, 45, 87, 255, 222, 47, 83, 255, 223, 47, 79, 255, 223, 47, 74, 255, 223, 48, 70, 255, 223, 50, 65, 255, 224, 53, 60, 255, 223, 54, 54, 255, 224, 54, 49, 255, 225, 57, 45, 255, 226, 59, 42, 255, 228, 62, 41, 255, 228, 64, 38, 255, 228, 67, 33, 255, 228, 69, 28, 255, 229, 71, 23, 255, 229, 72, 20, 255, 230, 73, 19, 255, 231, 75, 16, 255, 232, 76, 14, 255, 233, 79, 13, 255, 235, 81, 13, 255, 235, 82, 12, 255, 235, 82, 10, 255, 235, 84, 10, 255, 236, 87, 11, 255, 237, 89, 11, 255, 238, 90, 10, 255, 237, 91, 8, 255, 238, 92, 7, 255, 238, 93, 4, 255, 239, 94, 4, 255, 240, 96, 4, 255, 240, 98, 5, 255, 240, 101, 5, 255, 240, 103, 5, 255, 241, 104, 5, 255, 240, 105, 5, 255, 239, 106, 4, 255, 239, 107, 4, 255, 241, 110, 6, 255, 243, 112, 7, 255, 243, 113, 6, 255, 242, 113, 5, 255, 241, 113, 3, 255, 241, 114, 2, 255, 243, 116, 3, 255, 244, 120, 4, 255, 246, 123, 6, 255, 247, 126, 7, 255, 247, 128, 6, 255, 247, 131, 5, 255, 247, 133, 4, 255, 247, 134, 3, 255, 247, 136, 3, 255, 247, 137, 4, 255, 248, 138, 6, 255, 248, 138, 6, 255, 248, 140, 5, 255, 247, 141, 5, 255, 247, 143, 4, 255, 248, 146, 5, 255, 249, 148, 4, 255, 249, 149, 4, 255, 249, 149, 5, 255, 248, 151, 5, 255, 248, 154, 4, 255, 250, 156, 4, 255, 251, 158, 4, 255, 252, 161, 4, 255, 254, 165, 4, 255, 255, 168, 4, 255, 255, 170, 4, 255, 254, 172, 5, 255, 253, 173, 4, 255, 253, 175, 4, 255, 253, 175, 4, 255, 252, 177, 3, 255, 252, 178, 4, 255, 251, 180, 4, 255, 250, 183, 4, 255, 250, 184, 3, 255, 250, 186, 3, 255, 251, 188, 4, 255, 253, 191, 5, 255, 253, 193, 5, 255, 253, 197, 4, 255, 253, 199, 4, 255, 252, 200, 4, 255, 251, 201, 3, 255, 252, 202, 4, 255, 253, 203, 6, 255, 253, 204, 7, 255, 254, 205, 8, 255, 255, 206, 10, 255, 255, 208, 11, 255, 253, 208, 11, 255, 253, 210, 12, 255, 253, 212, 13, 255, 252, 214, 14, 255, 254, 217, 17, 255, 255, 221, 20, 255, 255, 223, 23, 255, 255, 223, 25, 255, 254, 223, 28, 255, 252, 223, 31, 255, 252, 224, 36, 255, 254, 226, 41, 255, 255, 227, 45, 255, 255, 226, 50, 255, 254, 226, 53, 255, 254, 228, 57, 255, 253, 231, 63, 255, 254, 234, 71, 255, 255, 236, 79, 255, 255, 235, 86, 255, 254, 235, 92, 255, 254, 236, 97, 255, 255, 236, 103, 255, 254, 236, 110, 255, 255, 237, 118, 255, 255, 240, 125, 255, 255, 242, 133, 255, 255, 243, 140, 255, 255, 243, 146, 255, 255, 244, 153, 255, 255, 243, 159, 255, 255, 243, 164, 255, 254, 245, 172, 255, 255, 247, 182, 255, 255, 248, 189, 255, 255, 247, 193, 255, 255, 246, 199, 255, 255, 246, 204, 255, 255, 247, 210, 255, 255, 250, 217, 255, 255, 252, 223, 255, 255, 252, 228, 255, 255, 253, 235, 255, 255, 254, 241, 255, 255, 255, 245, 255, 255, 255, 248, 255,]);
			break;
		case "1":
			colorMap = Buffer.from([0, 0, 1, 255, 0, 1, 1, 255, 0, 1, 1, 255, 0, 3, 2, 255, 0, 2, 2, 255, 0, 4, 3, 255, 0, 4, 3, 255, 0, 4, 3, 255, 0, 5, 5, 255, 0, 5, 5, 255, 0, 6, 5, 255, 0, 7, 6, 255, 0, 7, 7, 255, 0, 8, 7, 255, 0, 9, 7, 255, 0, 9, 9, 255, 0, 10, 8, 255, 0, 11, 9, 255, 0, 12, 10, 255, 0, 12, 11, 255, 0, 13, 11, 255, 0, 14, 12, 255, 0, 14, 13, 255, 0, 15, 13, 255, 0, 16, 14, 255, 0, 17, 14, 255, 0, 17, 15, 255, 0, 18, 16, 255, 0, 19, 16, 255, 0, 20, 17, 255, 0, 21, 18, 255, 0, 21, 18, 255, 0, 22, 19, 255, 0, 23, 20, 255, 0, 24, 21, 255, 0, 25, 21, 255, 0, 26, 23, 255, 0, 26, 23, 255, 0, 27, 24, 255, 0, 28, 25, 255, 0, 29, 26, 255, 0, 30, 26, 255, 0, 31, 27, 255, 0, 32, 27, 255, 0, 33, 29, 255, 0, 34, 30, 255, 0, 34, 30, 255, 0, 36, 31, 255, 0, 37, 32, 255, 0, 38, 33, 255, 0, 39, 34, 255, 0, 39, 34, 255, 0, 41, 36, 255, 0, 42, 36, 255, 0, 43, 37, 255, 0, 43, 38, 255, 0, 45, 38, 255, 0, 45, 40, 255, 0, 46, 41, 255, 0, 47, 41, 255, 0, 49, 42, 255, 0, 50, 43, 255, 0, 51, 44, 255, 0, 51, 45, 255, 0, 53, 46, 255, 0, 54, 46, 255, 0, 55, 47, 255, 0, 56, 48, 255, 0, 58, 50, 255, 0, 59, 51, 255, 0, 59, 52, 255, 0, 61, 53, 255, 0, 61, 53, 255, 0, 62, 55, 255, 0, 64, 55, 255, 0, 65, 57, 255, 0, 66, 57, 255, 0, 67, 58, 255, 0, 69, 59, 255, 0, 69, 60, 255, 0, 70, 61, 255, 0, 72, 62, 255, 0, 73, 63, 255, 0, 74, 65, 255, 0, 75, 65, 255, 0, 77, 66, 255, 0, 78, 67, 255, 0, 79, 69, 255, 0, 80, 70, 255, 0, 81, 71, 255, 0, 82, 72, 255, 0, 83, 73, 255, 0, 85, 74, 255, 0, 86, 75, 255, 0, 87, 76, 255, 0, 89, 77, 255, 0, 90, 78, 255, 0, 91, 79, 255, 0, 91, 79, 255, 0, 93, 81, 255, 0, 94, 82, 255, 0, 95, 84, 255, 0, 97, 85, 255, 0, 98, 85, 255, 0, 99, 86, 255, 0, 100, 87, 255, 0, 101, 89, 255, 0, 102, 89, 255, 0, 104, 90, 255, 0, 105, 91, 255, 0, 107, 93, 255, 0, 108, 93, 255, 0, 109, 95, 255, 0, 110, 96, 255, 0, 111, 97, 255, 0, 112, 98, 255, 0, 114, 99, 255, 0, 115, 100, 255, 0, 116, 101, 255, 0, 118, 102, 255, 0, 119, 104, 255, 0, 120, 105, 255, 0, 121, 106, 255, 0, 122, 107, 255, 0, 124, 108, 255, 0, 125, 109, 255, 0, 126, 110, 255, 0, 127, 111, 255, 0, 129, 112, 255, 0, 130, 113, 255, 0, 131, 114, 255, 0, 132, 116, 255, 0, 133, 116, 255, 0, 135, 118, 255, 0, 137, 119, 255, 0, 137, 119, 255, 0, 138, 120, 255, 0, 140, 122, 255, 0, 141, 123, 255, 0, 142, 124, 255, 0, 144, 125, 255, 0, 144, 126, 255, 0, 146, 127, 255, 0, 147, 128, 255, 0, 149, 129, 255, 0, 150, 130, 255, 0, 151, 132, 255, 0, 153, 133, 255, 0, 154, 133, 255, 0, 155, 135, 255, 0, 156, 136, 255, 0, 157, 137, 255, 0, 159, 138, 255, 0, 159, 139, 255, 0, 161, 140, 255, 0, 162, 141, 255, 0, 163, 143, 255, 0, 165, 144, 255, 0, 165, 144, 255, 0, 167, 146, 255, 0, 168, 146, 255, 0, 169, 147, 255, 0, 170, 149, 255, 0, 172, 149, 255, 0, 172, 150, 255, 0, 174, 152, 255, 0, 175, 153, 255, 0, 177, 153, 255, 0, 177, 154, 255, 0, 179, 156, 255, 0, 180, 157, 255, 0, 181, 158, 255, 0, 182, 159, 255, 0, 184, 160, 255, 0, 184, 161, 255, 0, 185, 161, 255, 0, 187, 163, 255, 0, 188, 163, 255, 0, 189, 165, 255, 0, 190, 166, 255, 0, 191, 166, 255, 0, 193, 168, 255, 0, 193, 168, 255, 0, 194, 169, 255, 0, 196, 171, 255, 0, 197, 172, 255, 0, 198, 172, 255, 0, 199, 173, 255, 0, 200, 174, 255, 0, 201, 175, 255, 0, 202, 176, 255, 0, 203, 177, 255, 0, 205, 178, 255, 0, 206, 178, 255, 0, 207, 179, 255, 0, 207, 181, 255, 0, 209, 181, 255, 0, 210, 183, 255, 0, 210, 183, 255, 0, 212, 184, 255, 0, 212, 185, 255, 0, 214, 186, 255, 0, 215, 186, 255, 0, 215, 187, 255, 0, 217, 189, 255, 0, 218, 189, 255, 0, 218, 190, 255, 0, 219, 191, 255, 0, 220, 192, 255, 0, 222, 193, 255, 0, 222, 194, 255, 0, 223, 194, 255, 0, 224, 195, 255, 0, 225, 196, 255, 0, 226, 197, 255, 0, 227, 197, 255, 0, 228, 198, 255, 0, 229, 199, 255, 0, 230, 200, 255, 0, 230, 201, 255, 0, 231, 201, 255, 0, 232, 202, 255, 0, 233, 202, 255, 0, 234, 203, 255, 0, 234, 204, 255, 0, 235, 205, 255, 0, 236, 206, 255, 0, 237, 206, 255, 0, 237, 207, 255, 0, 239, 208, 255, 0, 239, 208, 255, 0, 240, 209, 255, 0, 241, 210, 255, 0, 241, 210, 255, 0, 243, 211, 255, 0, 242, 211, 255, 0, 243, 212, 255, 0, 244, 212, 255, 0, 245, 213, 255, 0, 246, 214, 255, 0, 246, 215, 255, 0, 247, 215, 255, 0, 248, 215, 255, 0, 248, 216, 255, 0, 249, 217, 255, 0, 250, 217, 255, 0, 250, 218, 255, 0, 251, 218, 255, 0, 251, 219, 255, 0, 252, 219, 255, 0, 253, 220, 255, 0, 253, 220, 255, 0, 253, 220, 255, 0, 254, 221, 255, 0, 254, 221, 255, 0, 255, 222, 255,]);
			break;
	}
}

var miniMapMessageLookup: SonyMessage[] = [];

function drawMiniMap() {
	loadColorMap();
	const width = 800;
	const height = 256;
	let canvas = (document.getElementById("messageOverTime") as HTMLCanvasElement);
	let start = parseInt((document.getElementById("startMessage") as HTMLInputElement).value, 10);
	let end = parseInt((document.getElementById("endMessage") as HTMLInputElement).value, 10);
	var filtered = (document.getElementById("filtered") as HTMLInputElement).checked;
	var messageTypeInputValue = (document.getElementsByClassName("messageType")[0] as HTMLInputElement).value;
	var messageType = parseInt(messageTypeInputValue, 16);

	canvas.onmousemove = updateMiniMapPos;

	let ctx = canvas.getContext('2d');
	if (ctx) {
		ctx.imageSmoothingEnabled = false;
		myImageData = ctx!.createImageData(width, height);

		for (let i = 0; i < myImageData.data.length; i += 4) {
			myImageData.data[i] = 0;
			myImageData.data[i + 1] = 256; //greeeen
			myImageData.data[i + 2] = 0;
			myImageData.data[i + 3] = 256;
		}
		miniMapMessageLookup = [];
		let posx = 0;
		for (let i = start; i < messages.length && i < end; i++) {
			var msg = messages[i];
			if (filtered && msg.getId() !== messageType) {
				continue;
			}
			miniMapMessageLookup[posx] = msg;
			for (let j = MessageIndicies.START_OF_BODY; j < msg.buf.length - MessageIndicies.END_LENGTH; j++) {
				setColorIndicesForCoordQuad(posx, j, msg.buf.readUInt8(j));
			}
			posx++;
		}

		ctx.putImageData(myImageData, 0, 0);
	}
}


var messages: SonyMessage[];
export function graph() {
	content = (document.getElementById("traceFile") as HTMLTextAreaElement).value;
	messages = loadPackets();

	let start = parseInt((document.getElementById("startMessage") as HTMLInputElement).value, 10);
	let end = parseInt((document.getElementById("endMessage") as HTMLInputElement).value, 10);
	let filters = document.getElementsByClassName("lineFilter");

	let dataSets: any[] = [];

	const colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000']

	for (var j = 0; j < filters.length; j++) {
		var filter = filters[j];
		var messageTypeInputValue = (filter.getElementsByClassName("messageType")[0] as HTMLInputElement).value;
		if (messageTypeInputValue === '') {
			continue;
		}
		var messageType = parseInt(messageTypeInputValue, 16);
		var byteOffset = parseInt(
			(filter.getElementsByClassName("byteOffset")[0] as HTMLInputElement)
				.value,
			10
		) + MessageIndicies.START_OF_BODY;
		var numberFormat = (filter.getElementsByClassName(
			"numberFormat"
		)[0] as HTMLSelectElement).value;

		var lineCheckbox = (filter.getElementsByClassName(
			"lineCheckbox"
		)[0] as HTMLInputElement).checked;

		let points: ChartPoint[] = [];
		for (let i = start; i < messages.length && i < end; i++) {
			var msg = messages[i];
			if (msg.buf.readInt8(MessageIndicies.MESSAGE_TYPE) == messageType) {
				var value;
				switch (numberFormat) {
					case "8":
						value = msg.buf.readUInt8(byteOffset);
						break;
					case "16":
						value = msg.buf.readUInt16LE(byteOffset);
						break;
					case "32":
						value = msg.buf.readUInt32LE(byteOffset);
						break;
					case "f32":
						value = msg.buf.readFloatLE(byteOffset);
						break;
				}
				points.push({ y: value, x: i });
			}
		}
		dataSets.push(
			{
				label: "msg 0x" + messageTypeInputValue,
				pointRadius: 1,
				showLine: lineCheckbox,
				pointStyle: "circle",
				data: points,
				borderColor: colors[j],
				pointBackgroundColor: colors[j],
				backgroundColor: "#00000000",
				lineTension: 0
			}
		);

	}

	if (chart === undefined) {
		let canvas = document.getElementById("myChart");
		let config: ChartConfiguration = {
			data: {
				datasets: dataSets
			},
			options: {
				maintainAspectRatio: false,
				scales: {
					yAxes: [
						{
							id: "first-y-axis",
							type: "linear"
						}
					],
					xAxes: [
						{
							id: "first-x-axis",
							type: "linear",
							scaleLabel: {
								labelString: "Message #",
								display: true
							}
						}
					]
				}
			},
			type: "line"
		};
		Chart.defaults.global.animation!.duration = 0;
		chart = new Chart(canvas as HTMLCanvasElement, config);
	} else {
		chart.data.datasets = dataSets;
		chart.update();
	}
	drawMiniMap();
	saveState();
}
