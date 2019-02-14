import { Buffer } from "buffer"

export class MessageIndicies {
	public static START_OF_MESSAGE = 0;
	public static MESSAGE_LENGTH = 1;
	public static MESSAGE_CLASS = 3;
	public static SEQ_NUMBER = 4;
	public static MESSAGE_TYPE = 5;
	public static START_OF_BODY = 6;
	public static END_LENGTH = 3; // checksum and the EOM
}

export class SonyMessage {
	public buf: Buffer;
	private hexString: string;

	constructor(hexString: string, sigrok: boolean) {
		this.hexString = sigrok ? this.fromSiggroc(hexString) : hexString;
		this.buf = Buffer.from(this.hexString, "hex");
		console.assert(this.getLength() == this.buf.length, "BAD MESSAGE LENGTH")
	}

	public getId(): number {
		return this.buf.readInt8(MessageIndicies.MESSAGE_TYPE);
	}

	public getIdHex(): string {
		return this.hexString.substring(10,12);
	}

	public getLength(): number {
		return this.buf.readInt16LE(MessageIndicies.MESSAGE_LENGTH);// (this.buf[MessageIndicies.MESSAGE_LENGTH+1] << 8) + this.buf[MessageIndicies.MESSAGE_LENGTH];
	}

	private getToken(input:string, start:string, end:string):string{
		var startIndex = input.indexOf(start, 0);
		var endIndex = input.indexOf(end, startIndex+start.length);
		if (startIndex == -1 && endIndex == -1) {
			throw("missing token");
		}
		return input.substring(startIndex+start.length, endIndex);
	}

	public fromSiggroc(input: string): string{
		//0.146865, Plen: 0029, ftype: 02, snum: 00, speed: 750000.0, rxtx: 1, extra: 7, csum: 0932, data: "01 FF FF FF FF FF FF FF FF FF 0F 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 "
		let len = this.getToken(input, "Plen: ",",");
		len = len.substring(2,4) +len.substring(0,2);

		let type = this.getToken(input, "ftype: ",",");

		let seq = this.getToken(input, "snum: ",",");

		let data = this.getToken(input, "data: \"","\"");
		data = data.replace(/\s+/g, '');
		
		let checksum = this.getToken(input, "csum: ",",");

		return "F0" + len + type + seq + data + checksum + "55";
	}

}
