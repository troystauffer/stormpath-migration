# stormpath-migration
A node script for migrating users from an MSSQL db into Stormpath

A config/config.js file is needed with the following contents:
```
module.exports = function(){
	'use strict';
	switch(process.env.NODE_ENV){
		case 'dev':
		default:
			return {
				db: {
					userName: 'yoursqluser',
					password: 'yoursqlpassword',
					server: 'yoursqlserver',
					options: {
						rowCollectionOnRequestCompletion: true
					}
				},
				poolconfig: {
					max: 5,
					min: 2,
					log: true
				},
				stormpath: {
					appUri: 'https://api.stormpath.com/v1/applications/[yourappid]'
				}
			};
	}
};
```
Additionally, your Stormpath apiKey.properties file will need to be in the config directory
