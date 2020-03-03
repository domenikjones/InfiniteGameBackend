import * as _ from 'lodash';
import { players } from './players';

const { v4 } = require('uuid');

class Lobbies {
	constructor() {
		console.log('load lobbies.module');
		this.lobbies = {};

		setInterval(() => {
			this.plotLobbies();
		}, 5000);

		setInterval(() => {
			this.lobbyCleanup();
		}, 1000);
	}

	lobbyCleanup() {
		for (var uuid in this.lobbies) {
			if (this.lobbies[uuid].players.length === 0) {
				console.log(
					'remove inactive lobby',
					uuid,
					this.lobbies[uuid].created_at
				);
				delete this.lobbies[uuid];
			}
		}
	}

	plotLobbies() {
		console.log('==========================');
		for (var uuid in this.lobbies) {
			console.log(
				'lobby',
				this.lobbies[uuid].uuid,
				this.lobbies[uuid].created_at,
				this.lobbies[uuid].players
			);
			this.lobbies[uuid].players.forEach(player => {
				if (!players.getPlayer(player.uuid)) {
					console.log('player can not be found, we remove him from the lobby');
					_.remove(this.lobbies[uuid].players, { uuid: player.uuid });
				}
			});
		}
		if (Object.keys(this.lobbies).length === 0) {
			console.log('currently no lobbies active!');
		}
		console.log('==========================');
	}

	createLobby(uuid) {
		let player = players.getPlayer(uuid);
		if (!player) {
			return;
		}
		let lobby = {
			uuid: v4(),
			created_at: new Date(),
			players: [player]
		};
		this.lobbies[lobby.uuid] = lobby;
		return lobby;
	}

	leaveLobby(player_uuid, lobby_uuid) {
		console.log('leaveLobby', player_uuid, lobby_uuid);
		let player = players.getPlayer(player_uuid);
		if (!player) {
			console.log('player not found');
			return;
		}
		if (!this.lobbies[lobby_uuid]) {
			console.log('lobby not found');
			return;
		}
		_.remove(this.lobbies[lobby_uuid].players, { uuid: player.uuid });
		return this.lobbies[lobby_uuid];
	}
}

export const lobbies = new Lobbies();
