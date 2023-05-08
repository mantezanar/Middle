import { express } from "express";
import cookieParser from "cookie-parser";

const app = express()

app.use(cookieParser())

app.get('/', (req, res) =>{
  res.cookie('sesion')
  res.send('ho la')
})

app.listen(3000)