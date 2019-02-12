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

	constructor(hexString: string) {
		this.hexString = hexString;
		this.buf = Buffer.from(hexString, "hex");
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
}
