import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Estruturar onde vou guardar as imagens
const imagemStorage = multer.diskStorage({
    destination: (request, file, cb) => {
        let folder = "";

        if(request.baseUrl.includes("usuarios")){
            folder = "usuarios";
        }else if(request.baseUrl.includes("objetos")){
            folder = "objetos";
        }
        cb(null, path.join(__dirname, `../public/${folder}`))
    },
    filename: (request, file, cb) => {
        // Nome do arquivo
        cb(null, Date.now() + String(Math.floor(Math.random() * 10000)) + path.extname(file.originalname));
    },
});
// Executar a função para guardar imagem
const imageUpload = multer({
    storage: imagemStorage,
    fileFilter(request, file, cb){
        if(!file.originalname.match(/\.(png||jpg)$/)){
            return cb(new Error("Por favor, envie apenas jpg ou png!"))
        }
        cb(null, true);
   },
});
export default imageUpload;