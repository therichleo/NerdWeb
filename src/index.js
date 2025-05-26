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

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/images', express.static(__dirname + '/images'));

app.use(connectLivereload());
app.use(express.json()); //express.json ayuda a mirar req.body
app.use(express.urlencoded({ extended: true })); // Middleware para analizar datos de formularios
app.use(cookieParser()); //cookie.

app.engine(
  'handlebars',
  engine({
    helpers: {
      eq: (a, b) => a === b,
    },
  })
);
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.static('public'));
app.use('/images', express.static('src/images'));

app.get('/', (req, res) => {
  const token = req.cookies.token_de_acceso;
  let boolean = false;
  if (token) {
    boolean = true;
  }
  res.render('home', { isLoggedIn: boolean });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserRepository.login({ email, password });
    const token = jwt.sign({ id: user.id }, LLAVE_SECRETA, {
      expiresIn: '1h',
    });
    res.cookie('token_de_acceso', token, {
      httpOnly: true, //httpOnly para que la token solo se acceda desde el servidor
      secure: process.env.NODE_ENV === 'production', //si ponemos secure: 'true' es para https en formato nube
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60,
    });

    res.redirect('/profile'); //Redirect sirve mas pa que las weas de antes trabajen primero y luego redirijimos (pa qe la info vaya primero)
  } catch (error) {
    return res.status(401).render('login', { errorCode: error.message });
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  const anonimato = req.body.anonimato === 'true' ? true : false;

  try {
    const id = await UserRepository.create({
      username,
      password,
      email,
      anonimato,
    });

    const token = jwt.sign({ id }, LLAVE_SECRETA, {
      expiresIn: '1h',
    });
    res.cookie('token_de_acceso', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60,
    });
    res.redirect('/profile');
  } catch (error) {
    return res.status(400).render('register', { errorCode: error.message });
  }
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/logout', (req, res) => {
  res.clearCookie('token_de_acceso');
  res.render('home');
});

app.get('/profile', async (req, res) => {
  const token = req.cookies.token_de_acceso;
  let boolean = false;

  if (token) {
    boolean = true;
  }

  try {
    const data = jwt.verify(token, LLAVE_SECRETA);
    const user = await UserRepository.getById(data.id);

    res.render('profile', {
      isLoggedIn: boolean,
      username: user.username,
      email: user.email,
      anonimato: user.anonimato,
    }); //data contiene id, con id llamamos a getById y conseguimos mas informacion directa
  } catch (error) {
    res.render('profile', {
      isLoggedIn: boolean,
    });
  }
});

app.post('/publicar', (req, res) => {});

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
// aña
