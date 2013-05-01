//Part of the Spelling Corrector app
//Licensed under the MIT license, see COPYING.txt for details
"use strict";

/** @namespace sc
 * 
 * Contains all the functions and properties that the spelling corrector uses.
 * 
 * Note that this depends on the accompanying HTML page, and will not work well without it.
 * 
 * For a basic overview of what the spelling corrector is, see
 *  `{@link https://github.com/SavageWolf/Spelling-Corrector}`.
 */
window.sc = {};

/** The current word that needs to be typed into the input box.
 * @type string
 */
sc.currentWord = "";

/** An array of all the words that have been registered. Each element is a string.
 * @type array
 */
sc.wordList = [];

//Check the words value has been set
if(!localStorage.words) localStorage.words = "[]";
if(!("length" in JSON.parse(localStorage.words)))  localStorage.words = "[]";

/** Loads the words from an array saved at `localStorage.words`. */
sc.loadWords = function() {
	sc.wordList = JSON.parse(localStorage.words);
};

/** Saves the words to an array at `localStorage.words`. */
sc.saveWords = function() {
	localStorage.words = JSON.stringify(sc.wordList);
};

/** Adds a word to the list of words.
 * @param {string} word The word to add.
 */
sc.addWord = function(word) {
	sc.wordList[sc.wordList.length] = word;
	sc.saveWords();
	sc.updateSettingsArea();
};

/** Sets the param as the word that should be typed in the main typing area thing.
 * @param {string} w The word to set.
 */
sc.setWord = function(w) {
	sc.currentWord = w;
	$("#wordOrigin").html(sc.currentWord);
	$("#wordEntry").val("");
	$("#wordOrigin").slideDown();
};

/** Called when a key is pressed in the word entry. Checks if the user is typing the word correctly and sets the
 *   background accordingly. If the word is finished, then it calls `sc.generateNextWord`.
 */
sc.checkWord = function() {
	var value = $("#wordEntry").val();
	$("#wordOrigin").slideUp();
	
	if(sc.currentWord.substr(0, value.length).toLowerCase() != value.toLowerCase()) {
		//They are wrong
		$("body").removeClass("yes");
		$("body").addClass("no");
		$("#wordEntry").removeClass("yes");
		$("#wordEntry").addClass("no");
	}else{
		//They are correct
		$("body").removeClass("no");
		$("body").addClass("yes");
		$("#wordEntry").removeClass("no");
		$("#wordEntry").addClass("yes");
	}
	
	if(value.toLowerCase() == sc.currentWord.toLowerCase()) {
		sc.generateNextWord();
	}
};

/** Updates the setting area; should be called when a word is added or removed. */
sc.updateSettingsArea = function() {
	sc.wordList.sort();
	sc.saveWords();
	
	//Clear the settings table
	$("#settingsTable").html("");
	
	var hold = "<tr>"
	
	//Loop through every word, adding them to the string
	for(var i = 0; i < sc.wordList.length; i += 5) {
		if(i) hold += "</tr><tr>";
		
		for(var j = i; j < i + 5; j ++) {
			if(j < sc.wordList.length) {
				hold += "<td>\
					<div class='deleteButton' title='Delete Word' onclick='sc.deleteWord("+j+");'>X</div>\
					<div class='settingsWord'>"+sc.wordList[j]+"</div>\
				</td>";
			}else{
				//Add a blank table cell so that there is always 5 cols
				hold += "<td>&nbsp;</td>";
			}
		}
	}
	
	//And add the "add word" thing
	hold += "</tr><tr>";
	hold += "<td colspan='3'>\
		<input type='text' class='settingsWord' id='addWordField' onkeypress='sc.checkInput(event)'/>\
		<div class='addButton' title='Add Word' onclick='sc.addWordFromInput();'>+</div>";
	hold += "</td></tr>";
	
	sc.saveWords();
	
	$("#settingsTable").html(hold);
};

/** Called when the "settings" button is pressed. Shows or hides the settings area. */
sc.toggleSettingsDiv = function() {
	if($("#mainSettings").css("display") == "none") {
		sc.updateSettingsArea();
		$("#mainSettings").slideDown();
	}else{
		$("#mainSettings").slideUp();
	}
};

/** Called when a key is pressed on the "add new word" thing. Checks if enter has been pressed and adds the word if so.
 */
sc.checkInput = function(e) {
	if(e.keyCode == 13 || e.which == 13) {
		sc.addWordFromInput();
		$("#addWordField").focus();
	}
};

/** Deletes the word from the word list.
 * @param {integer} i The index of the word to delete.
 */
sc.deleteWord = function(i) {
	sc.wordList.splice(i, 1);
	sc.saveWords();
	sc.updateSettingsArea();
};

/** Reads the word in the "new word" textbox, and adds it to the list of words. */
sc.addWordFromInput = function() {
	sc.wordList[sc.wordList.length] = $("#addWordField").val();
	sc.saveWords();
	sc.updateSettingsArea();
	if(sc.wordList.length == 1) sc.generateNextWord();
};

/** Called on page load and when the current word is finished. Generates a new word from the word list to use. */
sc.generateNextWord = function() {
	sc.loadWords();
	
	if(!sc.wordList.length) {
		sc.setWord("No words, add some in the settings above!");
	}else if(sc.wordList.length == 1){
		sc.setWord(sc.wordList[0]);
	}else{
		var attemptWord = sc.currentWord;
		while(attemptWord == sc.currentWord){
			attemptWord = sc.wordList[~~(Math.random()*sc.wordList.length)];
		}
		sc.setWord(attemptWord);
	}
};
