module.exports = {

//---------------------------------------------------------------------
// Action Name
//
// This is the name of the action displayed in the editor.
//---------------------------------------------------------------------

name: "Objekt von Liste abrufen",

//---------------------------------------------------------------------
// Action Section
//
// This is the section the action will fall into.
//---------------------------------------------------------------------

section: "Listen und Schleifen",

//---------------------------------------------------------------------
// Action Subtitle
//
// This function generates the subtitle displayed next to the name.
//---------------------------------------------------------------------

subtitle: function(data) {
	const list = ['Server Mitglieder', 'Server Kanäle', 'Server Rollen', 'Server Emojis', 'Alle Bot Server', 'Rollen des erwähnten Mitglieds', 'Rollen des Command Author', 'Temporäre Variabel', 'Serverweite Variabel', 'Globale Variabel'];
	return `Objekt von ${list[parseInt(data.list)]} abrufen`;
},

//---------------------------------------------------------------------
// Action Storage Function
//
// Stores the relevant variable info for the editor.
//---------------------------------------------------------------------

variableStorage: function(data, varType) {
	const type = parseInt(data.storage);
	if(type !== varType) return;
	const list = parseInt(data.list);
	let dataType = 'Unbekannte Art';
	switch(list) {
		case 0:
			dataType = 'Server Mitglied';
			break;
		case 1:
			dataType = 'Kanal';
			break;
		case 2:
		case 5:
		case 6:
			dataType = 'Rolle';
			break;
		case 3:
			dataType = 'Emoji';
			break;
		case 4:
			dataType = 'Server';
			break;
	}
	return ([data.varName2, dataType]);
},

//---------------------------------------------------------------------
// Action Fields
//
// These are the fields for the action. These fields are customized
// by creating elements with corresponding IDs in the HTML. These
// are also the names of the fields stored in the action's JSON data.
//---------------------------------------------------------------------

fields: ["list", "varName", "getType", "position", "storage", "varName2"],

//---------------------------------------------------------------------
// Command HTML
//
// This function returns a string containing the HTML used for
// editting actions. 
//
// The "isEvent" parameter will be true if this action is being used
// for an event. Due to their nature, events lack certain information, 
// so edit the HTML to reflect this.
//
// The "data" parameter stores constants for select elements to use. 
// Each is an array: index 0 for commands, index 1 for events.
// The names are: sendTargets, members, roles, channels, 
//                messages, servers, variables
//---------------------------------------------------------------------

html: function(isEvent, data) {
	return `
<div>
	<div style="float: left; width: 35%;">
		Ursprungs Liste:<br>
		<select id="list" class="round" onchange="glob.listChange(this, 'varNameContainer')">
			${data.lists[isEvent ? 1 : 0]}
		</select>
	</div>
	<div id="varNameContainer" style="display: none; float: right; width: 60%;">
		Variabel Name:<br>
		<input id="varName" class="round" type="text" list="variableList"><br>
	</div>
</div><br><br><br>
<div style="padding-top: 8px;">
	<div style="float: left; width: 45%;">
		Objekt zum Abrufen:<br>
		<select id="getType" class="round" onchange="glob.onChange1(this)">
			<option value="0" selected>Erstes Objekt</option>
			<option value="1">Letztes Objekt</option>
			<option value="2">Zufälliges Objekt</option>
			<option value="3">Objekt an Position</option>
		</select>
	</div>
	<div id="positionHolder" style="float: right; width: 50%; display: none;">
		Position:<br>
		<input id="position" class="round" type="text"><br>
	</div>
</div><br><br><br>
<div style="padding-top: 8px;">
	<div style="float: left; width: 35%;">
		Speichern in:<br>
		<select id="storage" class="round">
			${data.variables[1]}
		</select>
	</div>
	<div id="varNameContainer2" style="float: right; width: 60%;">
		Variabel Name:<br>
		<input id="varName2" class="round" type="text">
	</div>
</div>`
},

//---------------------------------------------------------------------
// Action Editor Init Code
//
// When the HTML is first applied to the action editor, this code
// is also run. This helps add modifications or setup reactionary
// functions for the DOM elements.
//---------------------------------------------------------------------

init: function() {
	const {glob, document} = this;

	glob.onChange1 = function(event) {
		const value = parseInt(event.value);
		const dom = document.getElementById('positionHolder');
		if(value < 3) {
			dom.style.display = 'none';
		} else {
			dom.style.display = null;
		}
	};

	glob.listChange(document.getElementById('list'), 'varNameContainer');
	glob.onChange1(document.getElementById('getType'));
},

//---------------------------------------------------------------------
// Action Bot Function
//
// This is the function for the action within the Bot's Action class.
// Keep in mind event calls won't have access to the "msg" parameter, 
// so be sure to provide checks for variable existance.
//---------------------------------------------------------------------

action: function(cache) {
	const data = cache.actions[cache.index];
	const storage = parseInt(data.list);
	const varName = this.evalMessage(data.varName, cache);
	const list = this.getList(storage, varName, cache);

	const type = parseInt(data.getType);
	let result;
	switch(type) {
		case 0:
			result = list[0];
			break;
		case 1:
			result = list[list.length - 1];
			break;
		case 2:
			result = list[Math.floor(Math.random() * list.length)];
			break;
		case 3:
			const position = parseInt(this.evalMessage(data.position));
			if(position < 0) {
				result = list[0];
			} else if(position >= list.length) {
				result = list[list.length - 1];
			} else {
				result = list[position];
			}
			break;
	}

	if(result) {
		const varName2 = this.evalMessage(data.varName2, cache);
		const storage2 = parseInt(data.storage);
		this.storeValue(result, storage2, varName2, cache);
	}

	this.callNextAction(cache);
},

//---------------------------------------------------------------------
// Action Bot Mod
//
// Upon initialization of the bot, this code is run. Using the bot's
// DBM namespace, one can add/modify existing functions if necessary.
// In order to reduce conflictions between mods, be sure to alias
// functions you wish to overwrite.
//---------------------------------------------------------------------

mod: function(DBM) {
}

}; // End of module