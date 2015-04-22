var Stream = require('stream');
var Writable = require('stream').Writable;
var util = require('util');

util.inherits(AccountHandler, Writable);

AccountHandler.prototype.createAccount = function(row){
	if (typeof row == "string") 
		row = JSON.parse(row);
    var spAccountFields = ['LoginName', 'Email', 'FirstName', 'LastName', 'UserNo'];
    var user = {};
    var directory = this._directory;
    row.forEach(function(column) {
    	if (spAccountFields.indexOf(column.metadata.colName) !== -1) {
    		user[column.metadata.colName] = column.value;
    	}
    });
    var account = {
    	givenName: user.FirstName,
    	surname: user.LastName,
    	username: user.LoginName,
    	password: 'aA1' + Math.random().toString(36).substring(2, 14),
//    	password: 'Password1',
    	email: 'postmaster+' + this._company + '_' + user.UserNo + '@mspware.com',
    	customData: {
    		passwordResetRequired: false,
    		userNo: user.UserNo,
    		legacyEmail: user.Email
    	}
    };
    if (account.givenName == '' || account.givenName == null)
    	account.givenName = account.username;
    if (account.surname == '' || account.surname == null){
    	if ((account.givenName.match(/\s/g) || []).length === 1) {
	    	// try to split the name
	    	account.surname = account.givenName.substring(account.givenName.indexOf(' ') + 1, account.givenName.length);
	    	account.givenName = account.givenName.substring(0, account.givenName.indexOf(' '));
    	} else {
    		account.surname = account.givenName;
    	}
    }
	directory.createAccount(account, function onAccountCreated(err, createdAccount) {
		if (err) {
			console.log(err.userMessage);
		} else {
			console.log('Account created. Username: ' + createdAccount.username);
		}
	});
}

function AccountHandler(company, directory) {
    Writable.call(this, { objectMode: true });
    this._company = company;
    this._directory = directory;
}

AccountHandler.prototype._write = function(row, encoding, callback) {
	this.createAccount(row);
	callback();
}

module.exports = AccountHandler;