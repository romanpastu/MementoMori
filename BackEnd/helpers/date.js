const moment = require('moment');

moment().format();

function getCurrentWeek(birthDate) {
  const currentDate = moment();
  const weeksToDate = moment(new Date(currentDate)).diff(birthDate, 'days') / 7;
  return Math.floor(weeksToDate);
}

function getWeeksToRegisterDate(registerDate, birthDate) {
  const weeksToDate = moment(new Date(registerDate)).diff(birthDate, 'days') / 7;
  return Math.floor(weeksToDate);
}

function getWeeksToLive(death_date, birth_date) {
  // returns the weeks to live between death and birth date, rounded to upper week
  const weeks_to_live = moment(death_date).diff(moment(birth_date), 'days') / 7;
  return Math.ceil(weeks_to_live);
}

//input ex: 1997-12-29T23:00:00.000Z , output ex: 1997-12-30
function filterDate(date) {
  console.log(date)
  const stringDate = moment(date).format('YYYY-MM-DD').toString();
  const result = stringDate.match(/(?:(?!T).)*/);
  console.log(result[0])
  return result[0];
}

module.exports = {
  getCurrentWeek,
  getWeeksToRegisterDate,
  getWeeksToLive,
  filterDate
};
