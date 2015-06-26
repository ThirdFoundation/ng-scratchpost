scratchApp.leaderController = function($scope, $routeParams, $firebaseObject, SessionInfo) {
	this.scope = $scope;
	this.routeParams = $routeParams;
	this.firebaseObject = $firebaseObject;
	this.sessID = SessionInfo.getSessionName();
	/* Shortcuts for navigating the Firebase */
	thisRef = sessRef.child(this.sessID);
	usersRef = thisRef.child('users');
	questRef = thisRef.child('questions');
	redoRef = thisRef.child('noRedo');
	/* Removes the session object from Firebase when the leader navigates away */
	thisRef.onDisconnect().remove();
	/* Binds the noRedo checkbox back to the Firebase */
	this.firebaseObject(thisRef).$bindTo(this.scope, 'thisRef');
	/* Binds a new participant's Firebase object to a div in the display area */
  this.participants = this.firebaseObject(usersRef);
	/* Initializes variables to track questions and participants */
	this.asked = 0; // Tracks total number of questions pushed
	this.attendance = 0; // Tracks total number of participants
	this.answersShown = 0; // Tracks participant windows currently being displayed
	this.showAll = false; // Allows leader to close/hide participant windows
	this.allQuestions = {0: 'Reload a previous question'}; // History dropdown
	/* Keeps count of total participants */
	usersRef.on('child_added', function(snapshot) {
		this.attendance++;
		this.answersShown++;
	}.bind(this));
	usersRef.on('child_removed', function(snapshot) {
		this.attendance--;
		this.answersShown--;
	}.bind(this));
	/* Variable allowing for the zoom of individual windows in the scratchpost */
	this.zoomIndex = 999;
};
var leaderController = scratchApp.leaderController;

scratchApp.leaderController.prototype.pushQuestion = function() {
	this.currentQ = this.question;
	this.asked++;
	/* Assigns question content to a numbered key, and adds it to Firebase */
	var questObj = {};
	questObj[this.asked] = this.currentQ;
	questRef.update(questObj);
	/* Updates in-page record of questions for dropdown */
	this.allQuestions[this.asked] = this.currentQ;
	/* Brings back all user windows that were closed/hidden during debrief of the
	previous set of answers */
	this.showAll = true;
	this.answersShown = this.attendance;
}

scratchApp.leaderController.prototype.resubmit = function() {
	this.question = this.history;
}

scratchApp.leaderController.prototype.closeUserWindow = function(key) {
	this.showAll = false;
	usersRef.child(key).child('response').set('');
	this.answersShown--;
}

scratchApp.leaderController.prototype.zoomUserWindow = function(val) {
	if (this.zoomIndex !== val) {
		this.zoomIndex = val;
	} else {
		this.zoomIndex = 999;
	}
}

scratchApp.ngModule.controller('leaderController', scratchApp.leaderController);