const PQ = require('pg-promise').ParameterizedQuery;
const { decode } = require('jsonwebtoken');
const moment = require('moment');
const { db } = require('../database/database');
const { getWeeksToRegisterDate, getWeeksToLive, filterDate } = require('../helpers/date')
moment().format();

async function getUserCalendar(req, res) {
  const { authorization } = req.headers;
  if (authorization == undefined) {
    res.send('provide a valid token');
  }
  const token = authorization.split(' ')[1];
  const decoded = decode(token, { complete: true });
  const { userId } = decoded.payload;
  const selectCalendar = new PQ({ text: 'SELECT birth_date::varchar, years_to_live::varchar, register_date::varchar, death_date::varchar, weeks_to_live from users where id = $1', values: [userId] });
  db.query(selectCalendar).then((data) => {
    data[0].birthDate = data[0].birth_date;
    delete data[0].birth_date;
    res.send(data[0]);
  }).catch((err) => {
    console.log(err);
    res.send(err);
  });
}

async function getUserFieldsInfo(req, res) {
  const { authorization } = req.headers;
  if (authorization == undefined) {
    res.send('provide a valid token');
  }
  const token = authorization.split(' ')[1];
  const decoded = decode(token, { complete: true });
  const { userId } = decoded.payload;
  const selectUserFieldsInfo = new PQ({ text: 'SELECT CF.text, CF.rating, CF.week_number from calendar C join calendar_field CF on C.id = CF.calendar_id where C.user_id = $1 ;', values: [userId] });
  db.query(selectUserFieldsInfo).then((data) => res.send(data)).catch((err) => {
    console.log(err);
    res.send(err);
  });
}

async function updateField(req, res) {
  const { authorization } = req.headers;
  if (authorization == undefined) {
    res.send('provide a valid token');
  }
  const token = authorization.split(' ')[1];
  const decoded = decode(token, { complete: true });
  const { userId } = decoded.payload;

  const { week_number } = req.body;
  const emotionrating = req.body.emotionRating;
  const { description } = req.body;

  const selectData = new PQ({ text: 'SELECT cf.id from calendar_field cf join calendar c on (c.id = cf.calendar_id) where week_number= $1 and user_id = $2', values: [week_number, userId] });
  db.query(selectData).then((data) => {
    const updateField = new PQ({ text: 'UPDATE calendar_field SET text = $1, rating = $2 where id= $3', values: [description, emotionrating, data[0].id] });
    db.query(updateField).then((data) => {
      res.send(200);
    }).catch((err) => {
      console.log(err);
    });
  }).catch((err) => {
    console.log(err);
  });
}

async function generateCalendar(req, res) {
  const { authorization } = req.headers;
  if (authorization == undefined) {
    res.send('provide a valid token');
  }
  const token = authorization.split(' ')[1];
  const decoded = decode(token, { complete: true });
  const { userId } = decoded.payload;

  const yearsToLive = Math.trunc(req.body.yearsToLive).toString();
  const { registerDate } = req.body;


  if (yearsToLive > 100 || yearsToLive < 1) {
    res.status(400).send(new Error('Invalid years'));
    throw new Error('Invalid years');
  }

  // sets the deathDate and weeksToLive in the database
  const selectUser = new PQ({ text: 'SELECT * FROM users where id = $1', values: [userId] });
  db.query(selectUser).then((data) => {
    const { birth_date } = data[0];
    let deathDate = '';
    // sets the death_date and the weeks to live

    deathDate = moment(filterDate(birth_date)).add(yearsToLive, 'years');

    // check that the weeks to live are bigger than the weeks to register date
    if (getWeeksToLive(deathDate, birth_date) <= (getWeeksToRegisterDate(birth_date, registerDate) * -1)) {
      res.status(408).send(new Error('The resulting total weeks are smaller than the weeks spent up to register'));
      throw new Error('The resulting total weeks are smaller than the weeks spent up to register');
    }

    const setUserData = new PQ({ text: 'UPDATE users SET death_date = $1 , weeks_to_live = $2 where id = $3', values: [moment(deathDate).format('YYYY-MM-DD').toString(), getWeeksToLive(deathDate, birth_date), userId] });
    db.query(setUserData).then((data) => {
      /** **** */
      // Sets the yearsToLive and registerDate in the database
      const setUserData2 = new PQ({ text: 'UPDATE users SET years_to_live = $1, register_date = $2 where id = $3', values: [yearsToLive, registerDate, userId] });
      db.query(setUserData2).then((data) => {
        const insertCalendar = new PQ({ text: 'INSERT INTO calendar (user_id) values ($1)', values: [userId] });
        db.query(insertCalendar).then((data) => {
          // res.send(data)
          /** **** */
          /* gets the calendar id related to the current user */
          const selectCalendarId = new PQ({ text: 'SELECT id from calendar where user_id = $1', values: [userId] });
          db.query(selectCalendarId).then((data) => {
            /** **** */
            // Sets all the field for the calendar
            const generateCalendarSeries = new PQ({ text: "INSERT INTO calendar_field (text, rating, calendar_id, week_number) select '', 0, c.id, g.wn from calendar c join users u on u.id = c.user_id cross join generate_series(1, u.weeks_to_live) as g(wn) where c.id= $1 ;", values: [data[0].id] });
            db.query(generateCalendarSeries).then((data) => {
              /** *** */
              // the lifeExpectanceSet restriction is removed and access to dashboard is granted
              const removeRestriction = new PQ({ text: "UPDATE user_permissions SET life_expectancy =  'false' , dashboard = 'true' , stats = 'true', admin = 'false' , profile_info = 'true' WHERE user_id = $1", values: [userId] });
              db.query(removeRestriction).then((data) => {
                res.send('100');
              }).catch((err) => console.log(err));
            }).catch((err) => console.log(err));
          });
        });
      }).catch((err) => {
        console.log(err);
        res.send(err);
      });
    }).catch((err) => console.log(err));
  });
}

module.exports = {
  getUserCalendar, getUserFieldsInfo, updateField, generateCalendar,
};
