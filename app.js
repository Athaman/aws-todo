const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const aws = require('aws-sdk');

const port = 3000;
const tableName = 'Todos';

// update AWS
aws.config.update({
  region: 'ap-southeast-2'
});
// vpce-0ada86d0cf86062e1
// init app
const app = express();

const docClient = new aws.DynamoDB.DocumentClient();

// body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));


// view setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// Read all items in
app.get('/', (req, res, next) => {
  const params = {
    TableName: tableName
  };

  docClient.scan(params, (err, data) => {
    if (err) {
      console.error('Scan of db failed. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log(data.Items);
      res.render('index', {todos: data.Items});
    }

  });
});


// Read one item in
app.get('/todo/edit/:title', (req, res, next) => {
  const item = {
    title: req.params.title
  };

  const params = {
    TableName: tableName,
    Key: item
  };

  docClient.get(params, function(err, data) {
    if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        res.render('edit', {
          todo: data.Item
        })
    }
  });

  console.log(params);
});


// Create new item
app.post('/todo/add', (req, res, next) => {
  const todo = {
    title: req.body.title,
    body: req.body.body
  };

  const params = {
    TableName: tableName,
    Item: todo
  };

  docClient.put(params, function(err, data) {
      if (err) {
          console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
          console.log("Added item:", JSON.stringify(data, null, 2));
      }
  });

  res.redirect('/');

});


// Update an item
app.post('/todo/edit/:title', (req, res, next) => {
  const item = {
    title: req.params.title,
    body: req.body.body
  };

  const params = {
    TableName: tableName,
    Key: {
      title: item.title
    },
    UpdateExpression: "set body= :body",
    ExpressionAttributeValues: {
      ":body": item.body
    }
  };

  console.log(params);

  docClient.update(params, function(err, data) {
    if (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
        res.redirect('/');
    }
  });
});

// Delete item
app.delete('/todo/delete/:title', (req, res, next) => {
  console.log(req.params)
  const todo = {
    title: req.params.title
  };

  const params = {
    TableName: tableName,
    Key: todo
  };

  console.log(params);

  docClient.delete(params, function(err, data) {
    if (err) {
        console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
    }
    res.send(200);
  });


});

app.listen(port, () => {
  console.log('Server running on port ' + port);
});
