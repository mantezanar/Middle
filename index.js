import { express } from "express";
import cookieParser from "cookie-parser";

const app = express()

app.use(cookieParser())

app.get('/', (req, res) =>{
  res.cookie('sesion', 'my cookie')
  res.send('ho la')
})

app.listen(3000)