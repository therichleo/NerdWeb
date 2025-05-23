import express, { json } from 'express';
import jwt from 'jsonwebtoken';
import { PORT, LLAVE_SECRETA } from './config.js';
import { UserRepository } from './user-repository.js';
import { engine } from 'express-handlebars';
import livereload from 'livereload';
import connectLivereload from 'connect-livereload';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuracion para hacer un tipo de live server, esto ayuda a mirar las carpetas
const liveReloadServer = livereload.createServer({
  exts: ['js', 'html', 'css', 'handlebars'],
  debug: true,
});

liveReloadServer.watch([
  dirname(__dirname) + '/views',
  dirname(__dirname) + '/public',
  dirname(__dirname) + '/src',
]);

const app = express();

app.use(connectLivereload());
app.use(express.json()); //express.json ayuda a mirar req.body
app.use(cookieParser()); //cookie.

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.static('public'));
app.use('/images', express.static('src/images'));

app.get('/', (req, res) => {
  res.render('home', { username: 'therichleo' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserRepository.login({ email, password });
    const token = jwt.sign({ id: user.id }, LLAVE_SECRETA, {
      expiresIn: '1h',
    });
    res

      .cookie('acces_token', token, {
        httpOnly: true, //httpOnly para que la token solo se acceda desde el servidor
      })
      .send({ user, token });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

app.post('/register', async (req, res) => {
  const { username, password, email, anonimato } = req.body;
  console.log(req.body);

  try {
    const id = await UserRepository.create({
      username,
      password,
      email,
      anonimato,
    });
    res.send({ id });
  } catch (error) {
    //Lo mejor no es mandar el error entero, si no aclarar mejor (proximamente)
    res.status(400).send(error.message);
  }
});

app.post('/logout', (req, res) => {});
app.get('/profile', (req, res) => {});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// refresca automaticamente cuando se hace un control + S
liveReloadServer.server.once('connection', () => {
  setTimeout(() => {
    liveReloadServer.refresh('/');
  }, 100);
});

app.use((req, res) => {
  res.status(404).send('<h1>404</>');
});
