const { GdBuffer } = require('@gd-com/utils');

export class Messages {
	static parseJSON(data) {
		let recieve = new GdBuffer(Buffer.from(data));
		return JSON.parse(recieve.getString());
	}

	static toJSON(data) {
		let packet = new GdBuffer();
		packet.putString(JSON.stringify(data));
		return packet.getBuffer();
	}
}
