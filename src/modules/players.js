import * as _ from 'lodash';
import { server, clients } from '../server';
import { Messages } from './';

class Players {
	constructor() {
		console.log('load players.module');
		this.players = {};

		setInterval(() => {
			this.playerPlot();
		}, 5000);

		setInterval(() => {
			this.playerCleanup();
		}, 1000);
	}

	playerCleanup() {
		for (var uuid in this.players) {
			if ((new Date() - this.players[uuid].last_update) / 1000 > 1) {
				console.log(
					'remove inactive player',
					uuid,
					this.players[uuid].username
				);
				let client = _.find(clients, { uuid: uuid });
				if (client) {
					server.send(
						Messages.toJSON({ logout: 'timeout' }),
						client.port,
						client.address
					);
				}
				this.removeClient({ uuid: uuid });
			}
		}
	}

	playerPlot() {
		console.log('==========================');
		for (var uuid in this.players) {
			console.log(
				'player',
				uuid,
				this.players[uuid].username,
				this.players[uuid].last_update
			);
		}
		if (Object.keys(this.players).length === 0) {
			console.log('currently no players logged in!');
		}
		console.log('==========================');
	}

	getPlayer(uuid) {
		let player = this.players[uuid];
		if (!player) {
			//console.log('could not find player with uuid', uuid);
		}
		return player;
	}

	addClient(client, username) {
		if (this.players[client.uuid]) {
			console.log('player uuid already registered', client.uuid);
			return this.players[client.uuid];
		}
		let player = {
			uuid: client.uuid,
			last_update: new Date(),
			username: username
		};
		this.players[client.uuid] = player;
		return player;
	}

	removeClient(client) {
		delete this.players[client.uuid];
		delete clients[client.uuid];
	}
}

export const players = new Players();
