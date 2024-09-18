import { response } from "express"
import jwt from "jsonwebtoken"
import conn from "../config/conn.js"

const getUserByToken = async (token) => {
    return new Promise((resolve, reject) => {
        if(!token){
            response.status(401).json({message: "Acesso negado"})
            return
        }

        const decoded = jwt.verify(token, "SENHASUPERSEGURA")
        const userId = decoded.id 

        const checkSql = /*sql*/ `SELECT * FROM usuarios WHERE ?? = ?`
        const checkSqlData = ["usuario_id", userId]
        conn.query(checkSql, checkSqlData, (err, data) => {
            if(err){
                reject({status: 500, message: "Erro ao buscar usuário"});
            }else{
                resolve(data[0]);
            }
        });
    });
};

export default getUserByToken;