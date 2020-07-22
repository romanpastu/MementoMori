const PQ = require('pg-promise').ParameterizedQuery;
const { decode } = require('jsonwebtoken');
const moment = require('moment');
const { db } = require('../database/database');

const { getCurrentWeek, getWeeksToRegisterDate } = require('../helpers/date');

moment().format();

async function generatePieChart(req, res) {
  const { authorization } = req.headers;
  if (authorization === undefined) {
    res.send('provide a valid token');
  }
  const token = authorization.split(' ')[1];
  const decoded = decode(token, { complete: true });
  const { userId } = decoded.payload;

  const selectData = new PQ({ text: 'SELECT birth_date::varchar, register_date::varchar from users where id = $1 ;', values: [userId] });
  db.query(selectData).then((data) => {
    const currentWeek = getCurrentWeek(data[0].birth_date);
    // currentWeek = 1400 //dummy to select an incremented current week, delete
    const registerDate = getWeeksToRegisterDate(data[0].register_date, data[0].birth_date);
    const selectData2 = new PQ({ text: 'SELECT cf.rating, cf.week_number from calendar_field cf join calendar c on (c.id = cf.calendar_id) where week_number >= $1 and week_number <= $2 and user_id = $3', values: [registerDate, currentWeek, userId] });
    db.query(selectData2).then((response) => {
      var data = response;
      var data = data.map((obj) => Object.keys(obj).sort().map((key) => obj[key]));
      const counter = [['1', 0], ['2', 0], ['3', 0], ['4', 0], ['5', 0]];

      for (const i in data) {
        switch (data[i][0]) {
          case 1:
            counter[0][1]++;
            break;
          case 2:
            counter[1][1]++;
            break;
          case 3:
            counter[2][1]++;
            break;
          case 4:
            counter[3][1]++;
            break;
          case 5:
            counter[4][1]++;
            break;
        }
      }

      const parsedData = [
        {
          id: 'rate 1',
          label: 'rate 1',
          value: counter[0][1],
          color: 'hsl(11, 70%, 50%)',
        },
        {
          id: 'rate 2',
          label: 'rate 2',
          value: counter[1][1],
          color: 'hsl(197, 70%, 50%)',
        },
        {
          id: 'rate 3',
          label: 'rate 3',
          value: counter[2][1],
          color: 'hsl(277, 70%, 50%)',
        },
        {
          id: 'rate 4',
          label: 'rate 4',
          value: counter[3][1],
          color: 'hsl(335, 70%, 50%)',
        },
        {
          id: 'rate 5',
          label: 'rate 5',
          value: counter[4][1],
          color: 'hsl(260, 70%, 50%)',
        },
      ];
      res.send(parsedData);
    });
  });
}

async function generateCumulativeMaxPotentialChart(req, res) {
  const { authorization } = req.headers;
  if (authorization == undefined) {
    res.send('provide a valid token');
  }
  const token = authorization.split(' ')[1];
  const decoded = decode(token, { complete: true });
  const { userId } = decoded.payload;

  const selectData = new PQ({ text: 'SELECT birth_date::varchar, register_date::varchar from users where id = $1;', values: [userId] });
  db.query(selectData).then((data) => {
    const currentWeek = getCurrentWeek(data[0].birth_date);
    // currentWeek = 1189 //dummy to select an incremented current week, delete
    const registerDate = getWeeksToRegisterDate(data[0].register_date, data[0].birth_date);
    const selectData2 = new PQ({ text: 'SELECT cf.rating, cf.week_number from calendar_field cf join calendar c on (c.id = cf.calendar_id) where week_number >= $1 and week_number <= $2 and user_id = $3', values: [registerDate, currentWeek, userId] });
    db.query(selectData2).then((response) => {
      const data = response;
      const dataComposed = [];
      let obj = {};
      for (const i in data) {
        obj.x = data[i].week_number;
        obj.y = data[i].rating;
        dataComposed.push(obj);
        obj = {};
      }

      // sort the dataComposed array based on week number from less to more week number
      function compare_weekN(a, b) {
        if (a.x < b.x) {
          return -1;
        } if (a.x > b.x) {
          return 1;
        }
        return 0;
      }
      dataComposed.sort(compare_weekN);

      const maxpotential = JSON.parse(JSON.stringify(dataComposed));
      // accumulates the data
      let initY = 0;
      dataComposed.map((item) => {
        item.y += initY;
        initY = item.y;
        return item;
      });
      //

      for (let i = 0; i < maxpotential.length; i++) {
        if (i == 0) {
          maxpotential[i].y = 0;
        } else {
          maxpotential[i].y = maxpotential[i - 1].y + 5;
        }
      }

      const fullChart = [{
        id: 'CE',
        color: 'blue',
        data: dataComposed,
      }, {
        id: 'MPCE',
        color: 'green',
        data: maxpotential,
      }];
      // compose teh data
      res.send(fullChart);
    }).catch((err) => {
      console.log(err);
    });
  }).catch((err) => {
    console.log(err);
  });
}

async function generateCumulativeChart(req, res) {
  const { authorization } = req.headers;
  if (authorization == undefined) {
    res.send('provide a valid token');
  }
  const token = authorization.split(' ')[1];
  const decoded = decode(token, { complete: true });
  const { userId } = decoded.payload;

  const selectChartData = new PQ({ text: 'SELECT birth_date::varchar, register_date::varchar from users where id = $1;', values: [userId] });
  db.query(selectChartData).then((data) => {
    const currentWeek = getCurrentWeek(data[0].birth_date);
    // currentWeek = 1189 //dummy to select an incremented current week, delete
    const registerDate = getWeeksToRegisterDate(data[0].register_date, data[0].birth_date);
    const selectChartData2 = new PQ({ text: 'SELECT cf.rating, cf.week_number from calendar_field cf join calendar c on (c.id = cf.calendar_id) where week_number >= $1 and week_number <= $2 and user_id = $3', values: [registerDate, currentWeek, userId] });
    db.query(selectChartData2).then((response) => {
      const data = response;
      const dataComposed = [];
      let obj = {};
      for (const i in data) {
        obj.x = data[i].week_number;
        obj.y = data[i].rating;
        dataComposed.push(obj);
        obj = {};
      }

      // sort the dataComposed array based on week number from less to more week number
      function compare_weekN(a, b) {
        if (a.x < b.x) {
          return -1;
        } if (a.x > b.x) {
          return 1;
        }
        return 0;
      }
      dataComposed.sort(compare_weekN);

      // accumulates the data
      let initY = 0;
      dataComposed.map((item) => {
        item.y += initY;
        initY = item.y;
        return item;
      });

      const fullChart = [{
        id: 'CE',
        color: 'hsl(196, 97%, 50%)',
        data: dataComposed,
      }];
      // compose teh data
      res.send(fullChart);
    }).catch((err) => {
      console.log(err);
    });
  }).catch((err) => {
    console.log(err);
  });
}

async function generateLinealChart(req, res) {
  const { authorization } = req.headers;
  if (authorization == undefined) {
    res.send('provide a valid token');
  }
  const token = authorization.split(' ')[1];
  const decoded = decode(token, { complete: true });
  const { userId } = decoded.payload;

  const selectChartData = new PQ({ text: 'SELECT birth_date::varchar, register_date::varchar from users where id = $1 ;', values: [userId] });
  db.query(selectChartData).then((data) => {
    const currentWeek = getCurrentWeek(data[0].birth_date);
    // currentWeek = 1189 //dummy to select an incremented current week, delete
    const registerDate = getWeeksToRegisterDate(data[0].register_date, data[0].birth_date);
    const selectChartData2 = new PQ({ text: 'SELECT cf.rating, cf.week_number from calendar_field cf join calendar c on (c.id = cf.calendar_id) where week_number >= $1 and week_number <= $2 and user_id = $3', values: [registerDate, currentWeek, userId] });
    db.query(selectChartData2).then((response) => {
      const data = response;
      const dataComposed = [];
      let obj = {};
      for (const i in data) {
        obj.x = data[i].week_number;
        obj.y = data[i].rating;
        dataComposed.push(obj);
        obj = {};
      }

      // sort the dataComposed array based on week number from less to more week number
      function compare_weekN(a, b) {
        if (a.x < b.x) {
          return -1;
        } if (a.x > b.x) {
          return 1;
        }
        return 0;
      }
      dataComposed.sort(compare_weekN);

      const fullChart = [{
        id: 'E',
        color: 'blue',
        data: dataComposed,
      }];
      // compose teh data
      res.send(fullChart);
    }).catch((err) => {
      console.log(err);
    });
  }).catch((err) => {
    console.log(err);
  });
}

module.exports = {
  generatePieChart,
  generateCumulativeMaxPotentialChart,
  generateCumulativeChart,
  generateLinealChart,
};
