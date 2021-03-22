/**
 * server.js COPYRIGHT FUJITSU LIMITED 2021
 */

const express = require('express');
const path = require('path');
const app = express();
app.set('view engine', 'ejs')
app.set('views', './server/views')

app.listen(3000, () => {
  console.log('Running at Port 3000...');
});

//app.use(express.static(path.join('build')));
app.use(express.static(__dirname + './../public'))

app.get(['/'], function (req, res) {
	res.render('index', { debug : false})
})
