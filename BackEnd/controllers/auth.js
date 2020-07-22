const { isAuth } = require('../helpers/isAuth.js')
const { refresh } = require('../helpers/refresh.js')
const { isAuthRefreshed } = require('../helpers/isAuthRefreshed.js')

function requireLogin (req, res, next) {
    try {
        const userId = isAuth(req)
        if (userId !== null) {
          next();
        }
      } catch (err) {
        if (err.message == "jwt expired") {
    
          async function result() {
            var data = await refresh(req)
    
            const userId = isAuthRefreshed(data.accesstoken)
            if (userId !== null) {
              next();
            }
          }
          result();
        }
        if (err.message != "jwt expired") {
          res.status(400).send({
            error: `${err.message}`
          })
        }
      }
}

module.exports = {
    requireLogin
}