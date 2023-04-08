const express = require('express');
const exphbs = require('express-handlebars');
const { Pool } = require('pg');
const config = require('./config');

const app = express();
const pool = new Pool(config.database);

app.engine('.hbs', exphbs.engine({ extname: '.hbs'}));
app.set('view engine', '.hbs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(express.static('public'));



// Routes
app.get('/', async (req, res) => {
  const client = await pool.connect();
  const result = await client.query('SELECT * FROM todos ORDER BY id');
  const todos = result.rows;
  client.release();

  res.render('index', { todos, layout:false });
});


app.post('/add', async (req, res) => {
  const task = req.body.task;

  if (task) {
    const client = await pool.connect();
    await client.query('INSERT INTO todos (task) VALUES ($1)', [task]);
    client.release();
  }

  res.redirect('/');
});

app.post('/complete/:id', async (req, res) => {
  const id = req.params.id;

  if (id) {
    const client = await pool.connect();
    await client.query('UPDATE todos SET completed = true WHERE id = $1', [id]);
    client.release();
  }

  res.redirect('/');
});


app.get('/edit/:id', async (req, res) => {
    const id = req.params.id;
  
    if (id) {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM todos WHERE id = $1', [id]);
      const todo = result.rows[0];
      client.release();
  
      res.render('edit', { todo, layout:false });
    } else {
      res.redirect('/');
    }
  });
  
  app.post('/update/:id', async (req, res) => {
    const id = req.params.id;
    const task = req.body.task;
  
    if (id && task) {
      const client = await pool.connect();
      await client.query('UPDATE todos SET task = $1 WHERE id = $2', [task, id]);
      client.release();
    }
  
    res.redirect('/');
  });

  // Add this route after the existing routes
app.post('/delete/:id', async (req, res) => {
    const id = req.params.id;
  
    if (id) {
      const client = await pool.connect();
      await client.query('DELETE FROM todos WHERE id = $1', [id]);
      client.release();
    }
  
    res.redirect('/');
  });

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});