const pg = require('pg')
const config = require('../config/user.json')
const status = require('./status')
const LOG_POSTGRES_CMD = 'LOG_POSTGRES_CMD'
const LOG_COMMON = 'LOG_COMMON'
const myconsole = new (require('./console_log'))([LOG_COMMON, LOG_POSTGRES_CMD])

let PGoptions = {}

if (process.env.NODE_ENV === 'development') {
  PGoptions = {
    user: 'postgres',
    host: 'localhost',
    database: config.PGname,
    password: config.PGpassword,
    port: 5432
  }
} else if (process.env.NODE_ENV === 'production') {
  PGoptions = {
    user: 'postgres',
    host: config.hostIP,
    database: config.PGname,
    password: config.PGpassword,
    port: 5432
  }
}

const PSQL = {
  Init () {
    return new Promise((resolve, reject) => {
      myconsole.log(LOG_COMMON, 'Postgresql Init')
      const PGclient = new pg.Client(PGoptions)
      this.PGclient = PGclient
      PGclient.connect().then(() => {
        const cmd = `
        CREATE OR REPLACE FUNCTION update_modified_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updatedAt = now();
            RETURN NEW;
        END;
        $$ language 'plpgsql';`
        this.Command(cmd).catch(function (error) {
          myconsole.log(LOG_POSTGRES_CMD, error)
        })
        resolve(PGclient)
      })
    })
  },
  Command (str) {
    return new Promise((resolve, reject) => {
      var ret = {
        status: status.SUCCESS,
        msg: 'Success'
      }
      this.PGclient.query(str)
        .then(function (data) {
          resolve(data)
        })
        .catch(function (error) {
          myconsole.log(LOG_COMMON, `error.code:   ${error.code}`)
          myconsole.log(LOG_COMMON, `error.message:   ${error.message}`)
          switch (error.code) {
            case '42P07':
              ret.status = status.DB_TABLE_EXIST
              ret.msg = error.message
              break
            case '42601':
              ret.status = status.DB_SYNTAX_ERROR
              ret.msg = error.message
              break
            case '42703':
              ret.status = status.DB_COL_NOT_EXIST
              ret.msg = error.message
              break
            case '42P01':
              ret.status = status.DB_TABLE_NOT_EXIST
              ret.msg = error.message
              break
            case '23505':
              ret.status = status.TAB_DUPL_KEY
              ret.msg = error.message
              break
            default:
              ret.status = status.UNKNOWN
              ret.msg = error.message
              break
          }
          reject(ret)
        })
    })
  }
}

module.exports = PSQL
