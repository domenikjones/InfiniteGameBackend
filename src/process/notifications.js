import { clients } from '../server';

export class Notifications {
	static sendToAllClients(data) {
		console.log('send message to all clients', data);
		clients.forEach(client => {
			console.log('send message for client', client);
		});
	}
}
