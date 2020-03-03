import * as _ from 'lodash';
import { server, clients } from '../server';
import { players } from '../modules';
import { lobbies } from '../modules';
import { Messages } from '../modules';

export class ServerInput {
	static handle(client, remote, data) {
		// login
		if (data.login) {
			this.login(client, remote, data);
		}
		// logout
		if (data.logout) {
			this.logout(client, remote);
		}
		// heartbeat
		if (data.heartbeat) {
			this.heartbeat(client, remote);
		}
		// lobby
		if (data.lobby) {
			this.lobby(client, remote, data);
		}
	}

	static lobby(client, remote, data) {
		// create new lobby
		if (data.lobby === 'request') {
			let lobby = lobbies.createLobby(client.uuid);
			if (!lobby) {
				return;
			}
			server.send(
				Messages.toJSON({ lobby: 'successful', lobby_uuid: lobby.uuid }),
				remote.port,
				remote.address
			);
		}
		// leave lobby
		if (data.lobby === 'leave') {
			let lobby = lobbies.leaveLobby(client.uuid, data.lobby_uuid);
			if (!lobby) {
				return;
			}
			server.send(
				Messages.toJSON({ lobby: 'leave', lobby_uuid: lobby.uuid }),
				remote.port,
				remote.address
			);
		}
	}

	static login(client, remote, data) {
		console.log('client login', client.uuid);
		var message;
		let player = players.addClient(client, data.username);
		if (!player) {
			message = {
				login: 'error',
				message: 'client uuid already registered'
			};
			return;
		} else {
			message = {
				login: 'successful',
				uuid: client.uuid,
				username: data.username
			};
		}

		server.send(Messages.toJSON(message), remote.port, remote.address);
	}

	static logout(client, remote) {
		console.log('client logout', client.uuid);
		players.removeClient(client);
		// return successful login with client uuid
		server.send(
			Messages.toJSON({ logout: 'successful' }),
			remote.port,
			remote.address
		);
		// remove client from clients list
		delete clients[client];
	}

	static heartbeat(client, remote) {
		console.log('client heartbeat');
		let player = _.find(players.players, { uuid: client.uuid });
		if (!player) {
			console.log(
				'can not find player for heartbeat, sending logout',
				remote.port,
				remote.address
			);
			server.send(
				Messages.toJSON({ logout: 'unknown' }),
				remote.port,
				remote.address
			);
			return;
		}
		player.last_update = new Date();
		server.send(
			Messages.toJSON({ heartbeat: 'successful' }),
			remote.port,
			remote.address
		);
	}
}
