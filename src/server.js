import { ServerInput } from './process/input';
import { Messages } from './modules';

const dgram = require('dgram');
const { v4 } = require('uuid');
export const server = dgram.createSocket('udp4');
export let clients = {};
export let lobbies = {};

server.on('listening', () => {
	let address = server.address();
	console.log(`UDP Server listening on ${address.address}:${address.port}`);
});

server.on('message', (buf, remote) => {
	let client = null;
	let key = `${remote.address}-${remote.port}`;

	if (!clients.hasOwnProperty(key)) {
		// is new player on this server
		let uuid = v4();
		client = {
			uuid: uuid,
			port: remote.port,
			address: remote.address
		};
		clients[key] = client;
		console.log(
			`[${client.uuid}] New client from ${remote.address}:${remote.port}`
		);
	} else {
		// is existing client on this server
		client = clients[key];
	}

	// client is not active on this server anymore
	if (!client) {
		console.error('client not found', key);
		server.send(
			Messages.toJSON({ logout: 'unknown' }),
			remote.port,
			remote.address
		);
		return;
	}

	// parse message and handle
	ServerInput.handle(client, remote, Messages.parseJSON(buf));
});

// start server and bind
server.bind(4555, '0.0.0.0');
