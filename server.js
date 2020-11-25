// eslint-disable-next-line import/no-extraneous-dependencies
const express = require('express');

const app = express();
const path = require('path');

const port = 50055;
app.get('/healthCheck', (req, res) => {
  res.send('200');
});
app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.listen(port, () => console.log(`listening on port ${port}!`));
