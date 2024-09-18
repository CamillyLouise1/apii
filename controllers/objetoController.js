import conn from "../config/conn.js";
import { v4 as uuidv4 } from "uuid";

//Helpers
import getToken from "../helpers/get-token.js";
import verifyToken from "../helpers/verify-token.js";
import { request, response } from "express";

export const create = async(request, response) => {
    const { nome, categoria, peso, cor, descricao, preco} = preco.body;
    const disponivel = 1

    //buscar o token do usuário
    const token = getToken(request)
    const usuario = await getUserByToken(token)
    console.log(usuario)

    if(!nome){
        return response.status(400).json("O nome do objeto é obrigatório")
    }
    if(!categoria){
        return response.status(400).json("A categoria do objeto é obrigatório")
    }
    if(!peso){
        return response.status(400).json("O peso do objeto é obrigatório")
    }
    if(!cor){
        return response.status(400).json("A cor do objeto é obrigatório")
    }
    if(!descricao){
        return response.status(400).json("A descrição do objeto é obrigatório")
    }
    if(!preco){
        return response.status(400).json("O preço do objeto é obrigatório")
    }

    const objeto_id = uuidv4();
    const usuario_id = usuario.usuario_id
    const objetoSql = /*sql*/`INSERT INTO objetos (??, ??, ??, ??, ??, ??, ??, ??, ?? ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    const objetoData = ["objeto_id", "nome", "categoria", "cor", "descricao", "disponivel", "preco", "usuario_id", objeto_id, nome, categoria, peso, cor, descricao, disponivel, preco, usuario_id]
    
    conn.query(objetoSql, objetoData, (err) => {
        if(err){
            console.error(err)
            response.status(500).json({message: "Erro ao adicionar objeto"});
            return;
        }
        //[imagem1.png, imagem]
        if(request.files){
            const insertImageSql = /*sql*/`INSERT INTO objeto_imagens (image_id, image_path, objeto_id) VALUES ?`
            const imageValues = request.files.map((file)=>[
                uuidv4(),
                file.filename,
                objeto_id
            ])
            conn.query(insertImageSql, [imageValues], (err)=>{
                if(err){
                    response.status(500).json({err:"Não foi possivel adicionar imagens ao objeto"})
                    return
                }
            })
            //cad da imagens
        }else{
            response.status(201).json({message:"Objeto criado com sucesso!"})
        }
    });
        response.status(200).json("Chegou aqui");
};

//Listar todos os objetos de um usuário
export const getAllObjectUser = async (request, response) => {
    try {
        const token = getToken(request)
        const usuario = await getUserByToken(token)

        const usuarioId = usuario.usuario_id

        const selectSql = /*sql*/`
        SELECT 
        obj.objeto_id, 
        obj.usuario_id,
        obj.nome,
        obj.categoria,
        obj.peso,
        obj.cor,
        obj.descricao,
        obj.preco,
        GROUP_CONCAT(obj_img.image_path SEPARATOR ',') AS image_paths
        FROM 
        objetos AS obj
        LEFT JOIN 
        objeto_imagens AS obj_img ON obj.objeto_id = obj_img.objeto_id
        WHERE
        obj.usuario_id = ? 
        GROUP BY 
        obj.objeto_id, obj.usuario_id, obj.nome, obj.categoria, obj.descricao, obj.preco
        `
        conn.query(selectSql, [usuarioId], (err, data) => {
            if(err){
                console.error(err)
                response.status(500).json({err: "Erro ao buscar os dados"})
                return
            }
            response.status(200).json(data)
        })

    }catch (error) {

    }
}