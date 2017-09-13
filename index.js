const format = require('./format.js');

const dw = 466; //Demon's Wheel
const bandersnatch = 46601; // Bandersnatch
const demoros = 46602; //Demoros


//Planned call outs: Bandersnatch: Stay in or Get out
//Demoros: LASER
//Demoros: In-out or Out-in
//Demoros: Blue? Not Blue? Red? Not Red? White? Not White? Hit everything

module.exports = function DWGuide(dispatch) {
	
	let boss = null;
	let enabled = true;
	let	sendToParty = false;
	
	
	//Chat hooks and messages
	const chatHook = event => {		
		let command = format.stripTags(event.message).split(' ');
		
		if (['!dw'].includes(command[0].toLowerCase())) {
			toggleModule();
			return false;
		} else if (['!dw.party'].includes(command[0].toLowerCase())) {
			toggleSentMessages();
			return false;
		}
	}
	dispatch.hook('C_CHAT', 1, chatHook)	
	dispatch.hook('C_WHISPER', 1, chatHook)
	function toggleModule() {
		enabled = !enabled;
		systemMessage((enabled ? 'enabled' : 'disabled'));
	}

	function toggleSentMessages() {
		sendToParty = !sendToParty;
		systemMessage((sendToParty ? 'Messages will be sent to the party' : 'Only you will see messages'));
	}
	
	function sendMessage(msg) {
		if (!enabled) return;
		
		if (sendToParty) {
			dispatch.toServer('C_CHAT', 1, {
				channel: 21, //21 = p-notice, 1 = party
				message: msg
			});
		} else {
			dispatch.toClient('S_CHAT', 1, {
				channel: 21, //21 = p-notice, 1 = party
				authorName: 'DW-Guide',
				message: msg
			});
		}		
	}	
		
	function systemMessage(msg) {
		dispatch.toClient('S_CHAT', 1, {
			channel: 21, //21 = p-notice, 24 = system
			authorName: 'DW-Guide',
			message: msg
		});
	}
	
	
	
	dispatch.hook('S_BOSS_GAGE_INFO', 2, (event) => {
		let hp;
		if (!enabled) return;
		
		if (event.huntingZoneId == dw) {
			if(event.templateId == bandersnatch || event.templateId == demoros) {
				boss = event;
			}
		}
		if(boss) {
			hp = boss.curHP/boss.maxHP;
			if(hp<=0) {
				boss = null;
			}
		}
	}
	
	dispatch.hook('S_ACTION_STAGE', 1, (event) => {
		if (!enabled || !boss) return;
		if (boss.id - event.source == 0) {
			systemMessage(event.skill);
		}
	}
}
