import conn from "../config/conn.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

//helpers 
import createUserToken from "../controllers/createUserToken.js"
import getToken from "../helpers/get-token.js"
import { request, response } from "express";

export const register = async (request, response) => {
    const {nome, email, telefone, senha, confirmsenha} = request.body
    
    if(!nome){
        response.status(400).json({message: "O Nome é obrigatório"});
        return
    }
    if(!email){
        response.status(400).json({message: "O Email é obrigatório"});
        return
    }
    if(!telefone){
        response.status(400).json({message: "O Telefone é obrigatório"});
        return
    }
    if(!senha){
        response.status(400).json({message: "A Senha é obrigatório"});
        return
    }
    if(!nome){
        response.status(400).json({message: "O Campo confrimar senha é obrigatório"});
        return
    }

    //Verificar se o email é válido
    if(!email.includes("@")){
        response.status(409).json({message: "Deve conter @ no E-mail"});
        return;
    };

    //Senha === confirmsenha
    if(senha !== confirmsenha){
        response.status(409).json({message: "A senha e a confirmação de senha devem ser iguais"});
        return;
    };

    //Valores de uma coluna = ?? / O que tá dentro da coluna = ?
    const checkSql = /*sql*/ `SELECT * FROM usuarios WHERE ?? = ?`
    const checkSqlData = ["email", email]
    conn.query(checkSql, checkSqlData, async (err, data)=>{
        if(err){
            console.error(err)
            response.status(500).json({err: "Erro ao buscar email para cadastro"})
            return
        }

        //2º 
        if(data.length > 0){
            response.status(409).json({err: "O email já está em uso"})
            return
        }

        //Posso fazer o registro 
        const salt = await bcrypt.genSalt(12)
        // console.log(salt)
        const senhaHash = await bcrypt.hash(senha, salt)
        // console.log("Senha digitada: ",senha)
        // console.log("Senha com hash: ",senhaHash)

        //Criar o usuário
        const id = uuidv4();
        const usuario_img = "userDefault.png"
        const insertSql = /*sql*/ `INSERT INTO usuarios (??, ??, ??, ??, ??, ??) VALUES (?, ?, ?, ?, ?, ?)`
        
        const insertSqlData = ["usuario_id", "nome", "email", "telefone", "senha", "imagem", id, nome, email, telefone, senhaHash, usuario_img,];
        conn.query(insertSql, insertSqlData, (err) => {
            if(err){
                console.error(err)
                response.status(500).json({err: "Erro ao cadastrar usuário"})
                return;
            }
            // 1º Criar um token 
            // 2 Passar o token para o front-end
            const usuarioSql = /*sql*/ `SELECT * FROM usuarios WHERE ?? = ?`
            const usuarioData = ["usuario_id", id]
            conn.query(usuarioSql, usuarioData,  async (err, data) => {
                if(err){
                    console.error(err)
                    response.status(500).json({err: "Erro ao fazer login"})
                    return
                }
                const usuario = data[0]

                try {
                    await createUserToken(usuario, request, response)
                } catch (error) {
                    console.error(error)
                    response.status(500).json({err: "Erro ao processar requisição"})
                }
            })
        });
    });
};

export const login = (request, response) => {
    const {email, senha} = request.body

    if(!email){
        response.status(400).json({message: "O email é obrigatório"});
        return
    }
    if(!senha){
        response.status(400).json({message: "A senha é obrigatório"});
        return
    }
    const checkEmailSql = /*sql*/ `SELECT * FROM usuarios WHERE ?? = ?`
    const checkEmailData = ["email", email]
    conn.query(checkEmailSql, checkEmailData, async (err, data) => {
        if(err){
            console.error(err)
            response.status(500).json({err: "Erro ao fazer login"})
            return
        }

        if(data.length === 0 ){
            response.status(500).json({err: "E-mail não está cadastrado"})
            return
        }

        const usuario = data[0]
        console.log(usuario)

        //Comparar senhas
        const comparaSenha = await bcrypt.compare(senha, usuario.senha)
        console.log("Compara senha: ", comparaSenha)
        if(!comparaSenha){
            response.status(401).json({message: "Senha inválida"})
        }

        //1º Criar um token 
        try {
            await createUserToken(usuario, request, response)
        } catch (error) {
            console.error(error)
            response.status(500).json({message: "Erro ao proceessar a informação"})
        }
    })
};

//checkUser -> verificar os usuários logado na aplicação 
export const checkUser = async (request, response) => {
    let usuarioAtual;

    if(request.headers.authorization){
        //extrair o token -> barear token
        const token = getToken(request)
        console.log(token)
        //descriptografar o token jwt.decode
        const decoded = jwt.decode(token, "SENHASUPERSEGURA")
        console.log(decoded)

        const usuarioId = decoded.id
        const selectSql = /*sql*/ `SELECT nome, email, telefone, imagem FROM usuarios WHERE ?? = ?`
        const selectData = ["usuario_id", usuarioId]
        conn.query(selectSql, selectData, (err, data)=>{
            if(err){
                console.error(err)
                response.status(500).json({err: "Erro ao verificar usuário"})
                return
            }
            usuarioAtual = data[0]
            response.status(200).json(usuarioAtual)
        })

    }else {
        usuarioAtual = null
        response.status(200).json(usuarioAtual)
    }
}
//getUserById -> verificar usuário
export const checkUserById = async (request, response) => {
    const id = request.params.id;

    const checkSql = /*sql*/ `SELECT usuario_id, nome, email, telefone, imagem FROM usuarios WHERE ?? = ?`
    const checkSqlData = ["usuario_id", id] 
    conn.query(checkSql, checkSqlData, (err, data) => {
        if(err){
            console.error(err)
            response.status(500).json({message: "Erro a buscar usuário"})
            return
        }

        if(data.length == 0){
            response.status(404).json({message: "Usuário não encontrado"})
            return
        }
        const usuario = data[0]
        response.status(200).json(usuario)
    })
    console.log(id);
};

//editUser -> controlador protegido, e contém imagem de usuário
export const editUser = async (request, response) => {
    const {id} = request.params;

    try{
        const token = getToken(request)
        const user = await getUserByToken(token)
        //console.log(user)

        const { nome, email, telefone } = request.body;
        let imagem = user.imagem
        if(request.files){
            imagem = request.files.filename
        }

        if(!nome){
            return response.status(400).json({message: "O nome é obrigatório"})
        }
        if(!email){
            return response.status(400).json({message: "O e-mail é obrigatório"})
        }
        if(!telefone){
            return response.status(400).json({message: "O telefone é obrigatório"})
        }

        // Verificar se o usuário existe
        const checkSql = /*sql*/`SELECT * FROM usuarios WHERE ?? = ?`
        const checkSqlData = ["usuario_id", id]
        conn.query(checkSql, checkSqlData, (err, data) => {
            if(err){
                return response.status(500).json("Erro ao verificar usuário para Update")
            }

            if(data.length === 0){
             return response.status(404).json("Usuário não encontrado")
            }

            // Evitar usuário com email repetido
            const checkEmailSql = /*sql*/ `SELECT * FROM usuariros WHERE ?? = ? AND ?? != ?`
            const checkEmailData = ["email", email, "usuario_id", id]
            conn.query(checkEmailSql, checkEmailData, (err, data) => {
                if(err){
                    return response.status(500).json("Erro ao verificar email para Update")
                }

                if(data.length > 0){
                    return response.status(409).json("E-mail já está em uso!")
                }
                // Atualizar o usuário
                const updateSql = /*sql*/`UPDATE usuarios SET ? WHERE ?? = ?`
                const updateData = [{nome, email, telefone, imagem}, "usuario_id", id]
                conn.query(updateSql, updateData, (err) => {
                    return response.status(500).json({message:"Usuário Atualizado"})
            })
          })
        }) 
    } catch (error){
        console.error(error)
        response.status(500).json("Erro Interno do servidor")
    }
};
