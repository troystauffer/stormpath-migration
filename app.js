var express   = require('express')
  , stormpath = require('stormpath')
  , app     = express()
  , Config    = require('./config/config')
  , config    = new Config()
  , Connection  = require('tedious').Connection
  , connection  = new Connection(config.db)
  , Request   = require('tedious').Request
  , DBclient  = require('./lib/dbclient')
  , dbclient  = new DBclient()
  , AccountHandler = require ('./lib/accountHandler')
  , client    = null
  , directory   = null
  , keyfile   = './config/apiKey.properties'
  , accountHandler = null
  ;

var importDetails = {
  directoryName: 'mspware-dev',
  importdb: 'NxGenDB',
  rowstart: '1',
  rowstop: '10',
  companyprefix: 'nxgen'
};

stormpath.loadApiKey(keyfile, function apiKeyFileLoaded(err, apiKey) {
  if (err) throw err;
  client = new stormpath.Client({apiKey: apiKey});
  client.getDirectories({name: importDetails.directoryName}, function(err, directories) {
    directories.forEach(function(directory) {
      accountHandler = new AccountHandler(importDetails.companyprefix, directory);
      dbclient.on('RequestComplete', function() {
        console.log('SQL completed');
      });
      dbclient.executeSql("select * from (select row_number() over ( order by u.UserNo ) as RowNum, r.first_name as 'FirstName', r.last_name as 'LastName', u.UserNo, u.LoginName, u.Email, u.Source from " + importDetails.importdb + ".dbo.[User] as u left join " + importDetails.importdb + ".dbo.Reps r on u.LegacyRepId = r.rep_id) as RowConstrainedResult where RowNum >= " + importDetails.rowstart + " and RowNum < " + importDetails.rowstop)
        .pipe(accountHandler);
    });
  });
});


