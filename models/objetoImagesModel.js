import conn from "../config/conn.js";

const tableObjetoImages = /*sql*/`
       CREATE TABLE IF NOT EXISTS objeto_images(
        image_id VARCHAR(60) PRIMARY KEY,
        image_path VARCHAR(255),
        objeto_id VARCHAR(60),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (objeto_id) REFERENCES objetos(objeto_id)
       )
`;

conn.query(tableObjetoImages, (err) => {
    if(err){
        console.error(err)
        return
    }
    console.log("Tabela [ObjetoImage] criada com sucesso!")
})
