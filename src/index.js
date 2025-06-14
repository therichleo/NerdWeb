import express, { json } from 'express';
import jwt from 'jsonwebtoken';
import { PORT, LLAVE_SECRETA } from './config.js';
import { UserRepository } from './user-repository.js';
import { MediaRepository } from './user-publicacion.js';
import { ContactRepository } from './user-contact.js';
import { engine } from 'express-handlebars';
import livereload from 'livereload';
import connectLivereload from 'connect-livereload';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cookieParser from 'cookie-parser';
import { tiempoTranscurrido } from './tiempo.js';
import { InteractRepository } from './user-interact.js';
import { error } from 'console';

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
      eq: (a, b) => String(a) === String(b),
    },
  })
);
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.static('public'));
app.use('/images', express.static('src/images'));

app.get('/', async (req, res) => {
  const token = req.cookies.token_de_acceso;
  let boolean = false;

  const data = await MediaRepository.getAll();
  const Array = [];
  for (const item of data) {
    const id_user = item.id_user;
    const titulo = item.titulo;
    const texto = item.texto;
    const descripcion = item.descripcion;
    const categoria = item.categoria;
    const tiempo = tiempoTranscurrido(item.createdAt);

    const usuario = await UserRepository.getById(id_user);
    let booleanAnon = usuario.anonimato;

    const Data = {
      id_user,
      username: usuario.username,
      booleanAnon,
      titulo,
      texto,
      descripcion,
      categoria,
      tiempo,
    };
    Array.push(Data);
  }

  if (token) {
    boolean = true;
    const datos = jwt.verify(token, LLAVE_SECRETA);
    const user = await UserRepository.getById(datos.id);
    return res.render('home', {
      isLoggedIn: boolean,
      publicaciones: Array,
      user_id: user.id,
      username2: user.username,
    });
  }

  res.render('home', {
    isLoggedIn: boolean,
    publicaciones: Array,
  });
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

    /*
    const interacciones = await InteractRepository.getByUserId(user.id);
    const arr = [];
    for (const interaccion of interacciones) {
      const userFollower = await UserRepository.getById(
        interaccion.userIDFollower
      );
      const userFollow = await UserRepository.getById(interaccion.userIDFollow);

      let follower = userFollower.username;
      let follow = userFollow.username;

      if (userFollower.anonimato) {
        follower = 'USER FOLLOWER ANONIMO';
      }
      if (userFollow.anonimato) {
        follow = 'USER FOLLOW ANONIMO';
      }

      const UserInteractions = {
        follow,
        follower,
      };
      arr.push(UserInteractions);
    }
    */

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

app.post('/contacto', async (req, res) => {
  const token = req.cookies.token_de_acceso;
  let boolean = false;
  if (token) {
    boolean = true;
    const { text } = req.body;
    const data = jwt.verify(token, LLAVE_SECRETA);
    const user = await UserRepository.getById(data.id);

    await ContactRepository.create({
      email: user.email,
      text,
      boolean,
    });

    return res.redirect('/');
  }
  const { email, text } = req.body;
  await ContactRepository.create({
    email,
    text,
    boolean,
  });
  return res.redirect('/');
});

app.get('/contacto', async (req, res) => {
  const token = req.cookies.token_de_acceso;
  let boolean = false;

  if (token) {
    boolean = true;
    const data = jwt.verify(token, LLAVE_SECRETA);
    const user = await UserRepository.getById(data.id);
    return res.render('contact', {
      isLoggedIn: boolean,
      email: user.email,
      username: user.username,
      id: user.id,
    });
  }
  return res.render('contact', { isLoggedIn: boolean });
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
  res.redirect('/');
});

app.post('/publicar', async (req, res) => {
  const { titulo, texto, descripcion, categoria } = req.body;
  const token = req.cookies.token_de_acceso;

  if (!token) {
    return res
      .status(401)
      .render('publicar', { errorCode: 'No estás autenticado.' });
  }

  try {
    const data = jwt.verify(token, LLAVE_SECRETA);
    const user = await UserRepository.getById(data.id);

    await MediaRepository.create({
      id_user: user.id,
      titulo,
      texto,
      descripcion,
      categoria,
    });

    res.redirect('/');
  } catch (error) {
    if (!categoria) {
      return json.message('no tienes categoria');
    }
    console.error(error);
    res
      .status(403)
      .render('publicar', { errorCode: 'Error al publicar: ' + error.message });
  }
});

app.get('/publicar', (req, res) => {
  res.render('publicar');
});

app.get('/publicaciones', async (req, res) => {
  const token = req.cookies.token_de_acceso;

  if (!token) {
    return res.render('login');
  }

  const _data = jwt.verify(token, LLAVE_SECRETA);
  const _user = await UserRepository.getById(_data.id);

  const data = await MediaRepository.getAll();
  const arrayData = [];
  for (const item of data) {
    const id_user = item.id_user;
    const titulo = item.titulo;
    const texto = item.texto;
    const descripcion = item.descripcion;
    const user = await UserRepository.getById(id_user);
    let isOwnProfile = false;
    if (id_user === _user.id) {
      isOwnProfile = true;
    }
    let anonToken = null;
    if (user.anonimato) {
      anonToken = jwt.sign({ id: user.id }, LLAVE_SECRETA, { expiresIn: '1h' });
    }
    const PostData = {
      username: user.username,
      titulo,
      texto,
      descripcion,
      id_user: user.id,
      anonimato: user.anonimato,
      isOwnProfile,
      anonToken,
    };

    arrayData.push(PostData);
  }
  return res.render('publicaciones', {
    publicaciones: arrayData,
  });
});

app.post('/follow', async (req, res) => {
  const token = req.cookies.token_de_acceso;

  if (!token) {
    return error.message('no tienes token pa');
  }

  const dataFollower = jwt.verify(token, LLAVE_SECRETA);
  const userSeguidor = await UserRepository.getById(dataFollower.id);
  const userFollower = userSeguidor.id;

  const { username } = req.body;
  const userFollow = await UserRepository.getByUsername({ username });

  await InteractRepository.follow({
    seguidorID: userFollower,
    seguidoID: userFollow,
  });
});

app.get('/anonprofile/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const { id } = jwt.verify(token, LLAVE_SECRETA);
    const user = await UserRepository.getById(id);
    if (!user || !user.anonimato) {
      return res.status(404).render('profile404');
    }
    const publicaciones = await MediaRepository.getByUserID(user.id);
    res.render('user-anonimo', {
      publicaciones,
    });
  } catch (error) {
    res.status(400).send('error del servidor');
  }
});

app.get('/:username', async (req, res) => {
  const { username } = req.params;
  const token = req.cookies.token_de_acceso;
  try {
    const user = await UserRepository.getByUsername(username);
    if (!user) {
      return res.status(404).render('profile404');
    }
    let isOwnProfile = false;
    if (token) {
      try {
        const data = jwt.verify(token, LLAVE_SECRETA);
        if (data.id === user.id) {
          isOwnProfile = true;
        }
      } catch (error) {}
    }
    const publicaciones = await MediaRepository.getByUserID(user.id);

    res.render('user-profile', {
      username,
      anonimato: user.anonimato,
      publicaciones,
      isOwnProfile,
    });
  } catch (error) {}
});

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

console.log('MALAFAMA WEKARDOFAITHER ANASHEI');
