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

module.exports = {
  getCurrentWeek,
  getWeeksToRegisterDate,
};
