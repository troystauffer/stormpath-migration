var Config = require('../config/config')
  , config = new Config()
  , Connection = require('tedious').Connection
  , Request = require('tedious').Request
  , sqlstring = ""
  , result = []
  , EventEmitter = require("events").EventEmitter
  , util = require("util")
  , ConnectionPool = require('tedious-connection-pool')
  , pool = new ConnectionPool(config.poolconfig, config.db)
  , Stream = require('stream')
  , s = new Stream
  ;


function DBclient() {
  EventEmitter.call(this);
}

util.inherits(DBclient, EventEmitter);

DBclient.prototype.executeSql = function(sql) {
  s.readable = true;
  sqlstring = sql;
  result = [];
  self = this;
  pool.acquire(function (err, connection) {
    if (err)
      console.error(err);
    console.log('executeSql starting...');
    connection.on('end', function() {
      console.log('Connection closed');
    });
    exec(connection, sql);
  });
  return s;
};

DBclient.prototype.getResult = function() {
  return result;
}

function connected(err) {
  console.log('connected starting with sqlstring:' + sqlstring);
  if (err) {
    console.log(err);
    process.exit(1);
  }
  console.log('connected');
  exec(sqlstring);
  sqlstring = "";
}

function exec(connection, sql) {
  console.log('exec starting with sql:' + sql);
  var sql = sql.toString();

  var request = new Request(sql, statementComplete);
  request.on('row', function(row) {
    s.emit('data', JSON.stringify(row));
  });
  request.on('done',function (rowCount, more, returnStatus) {
    if(!more){
      pool.release(connection);
      s.emit('end');
      callback();
    }
  });

  //request.on('done', requestDone);
  console.log('executing sql');
  connection.execSql(request);
}

function row(columns) {
  console.log('row starting...');
  console.log('results!');
  var values = [];
  result = columns;
  columns.forEach(function(column) {
    if (column.value === null) {
      value = 'NULL';
    } else {
      value = column.value;
    }

    values.push(value)
  });
  console.log(JSON.stringify(values));
}

function requestDone(rowCount, more) {
  console.log('requestDone starting...');
  console.log(rowCount + ' rows');
}

function statementComplete(err, rowCount, rows) {
  console.log('statementComplete starting...');
  if (err) {
    console.log('Statement failed: ' + err);
  } else {
    console.log(rowCount + ' rows');
  }
  self.emit('RequestComplete', rows);
//  connection.release();
}

module.exports = DBclient;